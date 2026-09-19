-- Maison Glint: Newsletter Subscribers & Correspondence Schema
-- Migration 007: Create newsletter table with atomic subscription and unsubscribe tracking

create table if not exists public.newsletter (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  is_subscribed boolean not null default true,
  source text not null default 'storefront_newsletter',
  created_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

-- Index for high-performance email and active subscription queries
create index if not exists newsletter_email_idx on public.newsletter(email);
create index if not exists newsletter_is_subscribed_idx on public.newsletter(is_subscribed);

-- Enable Row Level Security
alter table public.newsletter enable row level security;

-- 1. Anyone (anon and authenticated) can insert or upsert their subscription
drop policy if exists newsletter_insert_public on public.newsletter;
create policy newsletter_insert_public on public.newsletter
  for insert to anon, authenticated
  with check (true);

-- 2. Anyone can update their subscription status (e.g. unsubscribe via token or email match)
drop policy if exists newsletter_update_public on public.newsletter;
create policy newsletter_update_public on public.newsletter
  for update to anon, authenticated
  using (true)
  with check (true);

-- 3. Only verified administrators can view the full subscriber list
drop policy if exists newsletter_select_admin on public.newsletter;
create policy newsletter_select_admin on public.newsletter
  for select to authenticated
  using (public.is_admin());

-- 4. Only verified administrators can delete subscriber records
drop policy if exists newsletter_delete_admin on public.newsletter;
create policy newsletter_delete_admin on public.newsletter
  for delete to authenticated
  using (public.is_admin());
