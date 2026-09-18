-- Product-specific storefront content. Commerce identity remains on products;
-- ordered editorial records live in child tables so every product can power the
-- homepage sections without component-level copy.

create table if not exists public.product_editorial (
  product_id text primary key references public.products(id) on delete cascade,
  hero jsonb not null default '{}'::jsonb,
  showcase jsonb not null default '{}'::jsonb,
  finish jsonb not null default '{}'::jsonb,
  specifications jsonb not null default '{}'::jsonb,
  table_content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  url text not null,
  alt text not null default '',
  role text not null default 'detail',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, sort_order, role)
);

create table if not exists public.product_hero_slides (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  image_url text not null,
  alt text not null default '',
  category text not null default '',
  title text not null default '',
  figure_label text not null default '',
  tab_label text not null default '',
  badge text not null default '',
  sort_order integer not null default 0,
  unique (product_id, sort_order)
);

create table if not exists public.product_features (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  label text not null,
  description text not null default '',
  sort_order integer not null default 0,
  unique (product_id, sort_order)
);

create table if not exists public.product_panels (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  title text not null,
  body text not null default '',
  sort_order integer not null default 0,
  unique (product_id, sort_order)
);

create table if not exists public.product_finish_presets (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  preset_key text not null,
  label text not null,
  angle numeric not null default 0,
  roughness text not null default '',
  dispersion text not null default '',
  sort_order integer not null default 0,
  unique (product_id, sort_order),
  unique (product_id, preset_key)
);

create table if not exists public.product_specification_rows (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  label text not null,
  metric text not null default '',
  imperial text not null default '',
  sort_order integer not null default 0,
  unique (product_id, sort_order)
);

create table if not exists public.product_rituals (
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.products(id) on delete cascade,
  title text not null,
  subtitle text not null default '',
  image_url text not null default '',
  image_alt text not null default '',
  description text not null default '',
  sort_order integer not null default 0,
  unique (product_id, sort_order)
);

create table if not exists public.product_ritual_items (
  id uuid primary key default gen_random_uuid(),
  ritual_id uuid not null references public.product_rituals(id) on delete cascade,
  label text not null,
  sort_order integer not null default 0,
  unique (ritual_id, sort_order)
);

create index if not exists product_images_product_id_idx on public.product_images(product_id);
create index if not exists product_hero_slides_product_id_idx on public.product_hero_slides(product_id);
create index if not exists product_features_product_id_idx on public.product_features(product_id);
create index if not exists product_panels_product_id_idx on public.product_panels(product_id);
create index if not exists product_finish_presets_product_id_idx on public.product_finish_presets(product_id);
create index if not exists product_specification_rows_product_id_idx on public.product_specification_rows(product_id);
create index if not exists product_rituals_product_id_idx on public.product_rituals(product_id);

alter table public.product_editorial enable row level security;
alter table public.product_images enable row level security;
alter table public.product_hero_slides enable row level security;
alter table public.product_features enable row level security;
alter table public.product_panels enable row level security;
alter table public.product_finish_presets enable row level security;
alter table public.product_specification_rows enable row level security;
alter table public.product_rituals enable row level security;
alter table public.product_ritual_items enable row level security;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'product_editorial', 'product_images', 'product_hero_slides',
    'product_features', 'product_panels', 'product_finish_presets',
    'product_specification_rows', 'product_rituals'
  ] loop
    execute format('drop policy if exists %I_select_public on public.%I', table_name, table_name);
    execute format('create policy %I_select_public on public.%I for select to anon, authenticated using (exists (select 1 from public.products p where p.id = product_id and (p.in_stock = true or public.is_admin())))', table_name, table_name);
    execute format('drop policy if exists %I_insert_admin on public.%I', table_name, table_name);
    execute format('create policy %I_insert_admin on public.%I for insert to authenticated with check (public.is_admin())', table_name, table_name);
    execute format('drop policy if exists %I_update_admin on public.%I', table_name, table_name);
    execute format('create policy %I_update_admin on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())', table_name, table_name);
    execute format('drop policy if exists %I_delete_admin on public.%I', table_name, table_name);
    execute format('create policy %I_delete_admin on public.%I for delete to authenticated using (public.is_admin())', table_name, table_name);
  end loop;
end $$;

drop policy if exists product_ritual_items_select_public on public.product_ritual_items;
create policy product_ritual_items_select_public on public.product_ritual_items for select to anon, authenticated using (
  exists (
    select 1 from public.product_rituals r
    join public.products p on p.id = r.product_id
    where r.id = ritual_id and (p.in_stock = true or public.is_admin())
  )
);

drop policy if exists product_ritual_items_insert_admin on public.product_ritual_items;
create policy product_ritual_items_insert_admin on public.product_ritual_items for insert to authenticated with check (public.is_admin());
drop policy if exists product_ritual_items_update_admin on public.product_ritual_items;
create policy product_ritual_items_update_admin on public.product_ritual_items for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists product_ritual_items_delete_admin on public.product_ritual_items;
create policy product_ritual_items_delete_admin on public.product_ritual_items for delete to authenticated using (public.is_admin());

drop trigger if exists product_editorial_updated_at on public.product_editorial;
create trigger product_editorial_updated_at before update on public.product_editorial for each row execute function public.set_updated_at();