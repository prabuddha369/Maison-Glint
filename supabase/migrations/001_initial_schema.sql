-- Maison Glint: Supabase Auth + publishable-key + RLS schema.
-- Enable Email provider in Supabase Auth before using the application.

create table if not exists public.profiles (
  uid uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text not null default '',
  first_name text,
  last_name text,
  phone_number text,
  phone_verified boolean not null default false,
  saved_addresses jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admins (
  uid uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin',
  permissions text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  price numeric not null check (price >= 0),
  currency text not null default 'USD',
  images jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  in_stock boolean not null default true,
  edition_total integer,
  edition_remaining integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  order_id text primary key,
  user_id uuid not null references auth.users(id) on delete restrict,
  customer jsonb not null,
  shipping_address jsonb not null,
  shipping_method jsonb not null,
  items jsonb not null,
  subtotal numeric not null check (subtotal >= 0),
  shipping_cost numeric not null check (shipping_cost >= 0),
  tax_estimate numeric not null check (tax_estimate >= 0),
  total numeric not null check (total >= 0),
  currency text not null default 'USD',
  status text not null default 'pending_payment' check (status in ('pending_payment', 'paid', 'processing', 'shipped', 'cancelled')),
  payment_gateway text not null default 'pending_selection',
  verification_metadata jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_user_id_created_at_idx on public.orders (user_id, created_at desc);
create index if not exists products_in_stock_idx on public.products (in_stock);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.admins
    where uid = auth.uid() and active = true and role in ('admin', 'owner')
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.is_email_confirmed()
returns boolean language sql stable security definer set search_path = auth, public as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid() and email_confirmed_at is not null
  );
$$;

revoke all on function public.is_email_confirmed() from public;
grant execute on function public.is_email_confirmed() to authenticated;

alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles for select to authenticated using (uid = auth.uid());
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles for insert to authenticated with check (uid = auth.uid());
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles for update to authenticated using (uid = auth.uid()) with check (uid = auth.uid());

drop policy if exists admins_select_own on public.admins;
create policy admins_select_own on public.admins for select to authenticated using (uid = auth.uid());

drop policy if exists products_select_public on public.products;
create policy products_select_public on public.products for select to anon, authenticated using (in_stock = true or public.is_admin());
drop policy if exists products_insert_admin on public.products;
create policy products_insert_admin on public.products for insert to authenticated with check (public.is_admin());
drop policy if exists products_update_admin on public.products;
create policy products_update_admin on public.products for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists products_delete_admin on public.products;
create policy products_delete_admin on public.products for delete to authenticated using (public.is_admin());

drop policy if exists orders_select_owner_or_admin on public.orders;
create policy orders_select_owner_or_admin on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists orders_insert_owner on public.orders;
create policy orders_insert_owner on public.orders for insert to authenticated with check (
  user_id = auth.uid() and status = 'pending_payment' and payment_gateway = 'pending_selection'
  and public.is_email_confirmed()
);
drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products for each row execute function public.set_updated_at();
drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();

-- Create a profile automatically after Supabase Auth signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (uid, email, display_name)
  values (new.id, coalesce(new.email, ''), coalesce(new.raw_user_meta_data ->> 'display_name', ''))
  on conflict (uid) do update set email = excluded.email, display_name = excluded.display_name;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
