-- ============================================================
-- Migration 013: Drop Redundant product_images Table
-- ============================================================
-- Product images are permanently stored in the `images` JSONB array
-- column of the `public.products` table, which is the single source
-- of truth consumed across the storefront, cart, catalog, and admin.
--
-- The normalized `public.product_images` child table was orphaned and
-- never queried by the storefront application. Dropping it cleans up
-- redundant storage, prevents data drift, and removes unnecessary
-- dual-write overhead.

DROP TABLE IF EXISTS public.product_images CASCADE;
