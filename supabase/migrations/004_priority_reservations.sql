-- Maison Glint: Priority Reservations & Serial Minting Schema
-- Migration 004: Create reservations table, indexes, RLS policies, and atomic RPC function.

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  product_id text not null references public.products(id) on delete cascade,
  serial_number text not null unique,
  serial_index integer not null,
  collector_name text not null,
  collector_email text not null,
  destination text not null,
  ritual text not null,
  status text not null default 'allocated' check (status in ('allocated', 'pending_verification', 'waitlist', 'converted_to_order', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Unique index to enforce 1 active reservation per product per collector email
create unique index if not exists reservations_email_product_idx 
  on public.reservations (lower(collector_email), product_id);

create index if not exists reservations_user_id_idx 
  on public.reservations (user_id, created_at desc);

create index if not exists reservations_product_id_idx 
  on public.reservations (product_id, serial_index);

-- Trigger for auto-updating updated_at
drop trigger if exists set_reservations_updated_at on public.reservations;
create trigger set_reservations_updated_at
  before update on public.reservations
  for each row execute function public.set_updated_at();

-- Enable Row Level Security
alter table public.reservations enable row level security;

-- Policies
drop policy if exists reservations_select_own on public.reservations;
create policy reservations_select_own on public.reservations
  for select to authenticated
  using (
    user_id = auth.uid() 
    or lower(collector_email) = lower(auth.jwt()->>'email')
    or public.is_admin()
  );

drop policy if exists reservations_insert_own on public.reservations;
create policy reservations_insert_own on public.reservations
  for insert to authenticated
  with check (
    user_id = auth.uid() 
    or lower(collector_email) = lower(auth.jwt()->>'email')
    or public.is_admin()
  );

drop policy if exists reservations_admin_all on public.reservations;
create policy reservations_admin_all on public.reservations
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Atomic Postgres RPC function to mint serial numbers and record reservations safely
create or replace function public.create_priority_reservation(
  p_product_id text,
  p_collector_name text,
  p_collector_email text,
  p_destination text,
  p_ritual text,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_existing record;
  v_product record;
  v_obj_num text;
  v_max_index integer;
  v_next_index integer;
  v_serial_number text;
  v_status text;
  v_new_id uuid;
  v_edition_total integer;
begin
  -- 1. Check if an active reservation already exists for this collector and product
  select * into v_existing
  from public.reservations
  where lower(collector_email) = lower(p_collector_email)
    and product_id = p_product_id
  limit 1;

  if found then
    return jsonb_build_object(
      'success', true,
      'is_existing', true,
      'id', v_existing.id,
      'serial_number', v_existing.serial_number,
      'serial_index', v_existing.serial_index,
      'status', v_existing.status,
      'collector_name', v_existing.collector_name,
      'collector_email', v_existing.collector_email,
      'destination', v_existing.destination,
      'ritual', v_existing.ritual,
      'created_at', v_existing.created_at
    );
  end if;

  -- 2. Lock and retrieve product details
  select * into v_product
  from public.products
  where id = p_product_id
  for update;

  v_edition_total := coalesce(v_product.edition_total, 250);

  -- 3. Determine object serial prefix (e.g., Object 01 -> 01, Object 02 -> 02, etc.)
  if p_product_id like '%02%' then
    v_obj_num := '02';
  elsif p_product_id like '%03%' then
    v_obj_num := '03';
  elsif p_product_id like '%04%' then
    v_obj_num := '04';
  else
    v_obj_num := '01';
  end if;

  -- 4. Calculate next serial index atomically
  select coalesce(max(serial_index), 0) into v_max_index
  from public.reservations
  where product_id = p_product_id;

  v_next_index := v_max_index + 1;

  -- 5. Determine serial formatting and status based on edition capacity
  if v_next_index <= v_edition_total then
    v_serial_number := 'MG-' || v_obj_num || '-' || lpad(v_next_index::text, 3, '0');
    if p_user_id is not null then
      v_status := 'allocated';
    else
      v_status := 'pending_verification';
    end if;

    -- Decrement product edition remaining if tracked and > 0
    if v_product.edition_remaining is not null and v_product.edition_remaining > 0 then
      update public.products
      set edition_remaining = edition_remaining - 1
      where id = p_product_id;
    end if;
  else
    -- Waitlist allocation beyond total edition capacity
    v_serial_number := 'MG-' || v_obj_num || '-WL-' || lpad((v_next_index - v_edition_total)::text, 3, '0');
    v_status := 'waitlist';
  end if;

  -- 6. Insert reservation row
  insert into public.reservations (
    user_id,
    product_id,
    serial_number,
    serial_index,
    collector_name,
    collector_email,
    destination,
    ritual,
    status
  ) values (
    p_user_id,
    p_product_id,
    v_serial_number,
    v_next_index,
    trim(p_collector_name),
    trim(p_collector_email),
    trim(p_destination),
    trim(p_ritual),
    v_status
  )
  returning id into v_new_id;

  return jsonb_build_object(
    'success', true,
    'is_existing', false,
    'id', v_new_id,
    'serial_number', v_serial_number,
    'serial_index', v_next_index,
    'status', v_status,
    'collector_name', trim(p_collector_name),
    'collector_email', trim(p_collector_email),
    'destination', trim(p_destination),
    'ritual', trim(p_ritual),
    'created_at', now()
  );
end;
$$;

-- Grant execution to public and authenticated so both anonymous guest signups and logged-in collectors can invoke RPC
grant execute on function public.create_priority_reservation to anon, authenticated;
