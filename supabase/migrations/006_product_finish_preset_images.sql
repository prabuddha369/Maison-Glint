-- Maison Glint: Dynamic Reflection Links & Lighting Studies
-- Migration 006: Add image_url to product_finish_presets

-- 1. Add image_url column to product_finish_presets table
alter table public.product_finish_presets
  add column if not exists image_url text default '';

-- 2. Ensure RLS policies continue to permit public select and authenticated admin management
-- (Inherited from 003_product_editorial_content.sql, policies apply to all columns)
