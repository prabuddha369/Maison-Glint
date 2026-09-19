-- Maison Glint: Time-Bound Reservations & Auto-Deallocation Schema
-- Migration 005: Add expires_at, edition_reserved, deallocation functions and cron.

-- 1. Add expires_at column to reservations (default 48 hours validity)
alter table public.reservations 
  add column if not exists expires_at timestamptz not null default (now() + interval '48 hours');

-- 2. Update status constraint on reservations to include 'deallocated'
alter table public.reservations drop constraint if exists reservations_status_check;
alter table public.reservations add constraint reservations_status_check check (
  status in ('allocated', 'pending_verification', 'waitlist', 'converted_to_order', 'deallocated', 'cancelled')
);

-- Index for high-performance expiry queries
create index if not exists reservations_expires_at_idx 
  on public.reservations (expires_at, status);

-- 3. Add edition_reserved column to products (tracks committed reservations, cannot exceed edition_remaining)
alter table public.products 
  add column if not exists edition_reserved integer not null default 0 check (edition_reserved >= 0);

-- 4. Stored function: deallocate_expired_reservations
-- Finds reservations past their expiration timestamp and transitions them to 'deallocated',
-- releasing reserved inventory back to the atelier pool.
create or replace function public.deallocate_expired_reservations()
returns integer
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_count integer := 0;
  v_rec record;
begin
  for v_rec in
    select id, product_id
    from public.reservations
    where expires_at < now()
      and status in ('allocated', 'pending_verification')
    for update
  loop
    -- Transition status to deallocated
    update public.reservations
    set status = 'deallocated',
        updated_at = now()
    where id = v_rec.id;

    -- Decrement edition_reserved count on product
    update public.products
    set edition_reserved = greatest(0, edition_reserved - 1),
        updated_at = now()
    where id = v_rec.product_id;

    v_count := v_count + 1;
  end loop;

  return v_count;
end;
$$;

grant execute on function public.deallocate_expired_reservations to anon, authenticated;

-- 5. Atomic Priority Reservation RPC with Auto-Expiry & Reserved Tracking
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
  v_expires_at timestamptz;
begin
  -- Clear out any expired reservations before allocating new slots
  perform public.deallocate_expired_reservations();

  -- 1. Check if an active non-expired reservation already exists for this collector & product
  select * into v_existing
  from public.reservations
  where lower(collector_email) = lower(p_collector_email)
    and product_id = p_product_id
    and status in ('allocated', 'pending_verification')
    and expires_at > now()
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
      'expires_at', v_existing.expires_at,
      'created_at', v_existing.created_at
    );
  end if;

  -- 2. Lock and retrieve product details
  select * into v_product
  from public.products
  where id = p_product_id
  for update;

  v_edition_total := coalesce(v_product.edition_total, 250);
  v_expires_at := now() + interval '48 hours';

  -- 3. Determine object serial prefix
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

  -- 5. Check edition limits and reserved headroom
  -- edition_reserved cannot exceed edition_remaining
  if v_next_index <= v_edition_total and coalesce(v_product.edition_reserved, 0) < coalesce(v_product.edition_remaining, 250) then
    v_serial_number := 'MG-' || v_obj_num || '-' || lpad(v_next_index::text, 3, '0');
    if p_user_id is not null then
      v_status := 'allocated';
    else
      v_status := 'pending_verification';
    end if;

    -- Increment edition_reserved on the product
    update public.products
    set edition_reserved = coalesce(edition_reserved, 0) + 1,
        updated_at = now()
    where id = p_product_id;
  else
    -- Waitlist allocation once remaining capacity is fully reserved
    v_serial_number := 'MG-' || v_obj_num || '-WL-' || lpad((v_next_index - v_edition_total)::text, 3, '0');
    v_status := 'waitlist';
  end if;

  -- 6. Insert reservation row with expiration timestamp
  insert into public.reservations (
    user_id,
    product_id,
    serial_number,
    serial_index,
    collector_name,
    collector_email,
    destination,
    ritual,
    status,
    expires_at
  ) values (
    p_user_id,
    p_product_id,
    v_serial_number,
    v_next_index,
    trim(p_collector_name),
    trim(p_collector_email),
    trim(p_destination),
    trim(p_ritual),
    v_status,
    v_expires_at
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
    'expires_at', v_expires_at,
    'created_at', now()
  );
end;
$$;

grant execute on function public.create_priority_reservation to anon, authenticated;

-- Optional pg_cron scheduling (if pg_cron extension is enabled in Supabase):
-- select cron.schedule('deallocate-expired-reservations', '*/15 * * * *', 'select public.deallocate_expired_reservations()');
