-- Upgrade existing projects to Auth-owned confirmation state.
-- Run after the original schema migration.

drop trigger if exists protect_profile_verification on public.profiles;
drop trigger if exists protect_profile_status on public.profiles;
drop trigger if exists on_auth_user_email_confirmed on auth.users;

drop function if exists public.protect_profile_verification();
drop function if exists public.protect_profile_status();
drop function if exists public.handle_user_email_confirmation();

alter table public.profiles drop column if exists email_verified;
alter table public.profiles drop column if exists is_active;

create or replace function public.is_email_confirmed()
returns boolean language sql stable security definer set search_path = auth, public as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid() and email_confirmed_at is not null
  );
$$;

revoke all on function public.is_email_confirmed() from public;
grant execute on function public.is_email_confirmed() to authenticated;

drop policy if exists orders_insert_owner on public.orders;
create policy orders_insert_owner on public.orders for insert to authenticated with check (
  user_id = auth.uid() and status = 'pending_payment' and payment_gateway = 'pending_selection'
  and public.is_email_confirmed()
);
