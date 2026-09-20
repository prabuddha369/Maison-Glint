-- ============================================================
-- Migration 014: Migrate Storefront Images to Local Fast Assets
-- ============================================================
-- Migrates all product catalog images, hero perspective slides, and
-- optical finish preset studies from third-party hosting (ImgBB)
-- to high-speed, local WebP assets hosted directly under /images/products/.
-- This eliminates 5s–8.8s network latency and provides sub-10ms delivery.

-- 1. Update Products Catalog Images
UPDATE public.products
SET images = jsonb_build_array('/images/products/object-01-the-glint-plate-catalog.webp')
WHERE id = 'object-01-the-glint-plate';

UPDATE public.products
SET images = jsonb_build_array('/images/products/object-02-fluid-coupe-pair-catalog.webp')
WHERE id = 'object-02-fluid-coupe-pair';

UPDATE public.products
SET images = jsonb_build_array('/images/products/object-03-monolith-serving-knife-catalog.webp')
WHERE id = 'object-03-monolith-serving-knife';

-- 2. Update Hero Perspective Slides
UPDATE public.product_hero_slides
SET image_url = '/images/products/object-01-the-glint-plate-hero-fig01.webp'
WHERE product_id = 'object-01-the-glint-plate' AND (figure_label ILIKE '%01%' OR sort_order = 0);

UPDATE public.product_hero_slides
SET image_url = '/images/products/object-01-the-glint-plate-hero-fig02.webp'
WHERE product_id = 'object-01-the-glint-plate' AND (figure_label ILIKE '%02%' OR sort_order = 1);

UPDATE public.product_hero_slides
SET image_url = '/images/products/object-02-fluid-coupe-pair-hero-fig01.webp'
WHERE product_id = 'object-02-fluid-coupe-pair' AND (figure_label ILIKE '%01%' OR sort_order = 0);

UPDATE public.product_hero_slides
SET image_url = '/images/products/object-02-fluid-coupe-pair-hero-fig02.webp'
WHERE product_id = 'object-02-fluid-coupe-pair' AND (figure_label ILIKE '%02%' OR sort_order = 1);

UPDATE public.product_hero_slides
SET image_url = '/images/products/object-03-monolith-serving-knife-hero-fig01.webp'
WHERE product_id = 'object-03-monolith-serving-knife' AND (figure_label ILIKE '%01%' OR sort_order = 0);

UPDATE public.product_hero_slides
SET image_url = '/images/products/object-03-monolith-serving-knife-hero-fig02.webp'
WHERE product_id = 'object-03-monolith-serving-knife' AND (figure_label ILIKE '%02%' OR sort_order = 1);

-- 3. Update Finish Study Presets
UPDATE public.product_finish_presets
SET image_url = '/images/products/finish-study-morning.webp'
WHERE preset_key = 'morning';

UPDATE public.product_finish_presets
SET image_url = '/images/products/finish-study-candlelight.webp'
WHERE preset_key = 'candlelight';

UPDATE public.product_finish_presets
SET image_url = '/images/products/finish-study-zenith.webp'
WHERE preset_key = 'zenith';

-- 4. Update Rituals of the Table (product_rituals)
-- Object 01: The Glint Plate
UPDATE public.product_rituals
SET image_url = '/images/products/object-01-ritual-the-dining-ritual.webp'
WHERE id = 'f7913ea1-b769-461e-bdb3-7a97233481d0'
   OR (product_id = 'object-01-the-glint-plate' AND (title ILIKE '%Dining Ritual%' OR sort_order = 0));

UPDATE public.product_rituals
SET image_url = '/images/products/object-01-ritual-raw-elements.webp'
WHERE id = 'c2265aae-f8e7-474c-b818-c73f3b3d0350'
   OR (product_id = 'object-01-the-glint-plate' AND (title ILIKE '%Raw Elements%' OR sort_order = 1));

UPDATE public.product_rituals
SET image_url = '/images/products/object-01-ritual-nocturne-setting.webp'
WHERE id = '48918892-2d13-484e-953b-c9f10b22e969'
   OR (product_id = 'object-01-the-glint-plate' AND (title ILIKE '%Nocturne%' OR sort_order = 2));

-- Object 02: Fluid Coupe Pair
UPDATE public.product_rituals
SET image_url = '/images/products/object-02-ritual-the-dining-ritual.webp'
WHERE id = '2633fa78-2da2-4de0-83b7-530bad9e4fe4'
   OR (product_id = 'object-02-fluid-coupe-pair' AND (title ILIKE '%Dining Ritual%' OR sort_order = 0));

UPDATE public.product_rituals
SET image_url = '/images/products/object-02-ritual-the-layered-setting.webp'
WHERE id = '8d12e60f-b049-4b48-a928-de4b46cf681f'
   OR (product_id = 'object-02-fluid-coupe-pair' AND (title ILIKE '%Layered%' OR sort_order = 1));

UPDATE public.product_rituals
SET image_url = '/images/products/object-02-ritual-nocturne-setting.webp'
WHERE id = '3499371a-da3f-4378-a9fa-78d35a6e8897'
   OR (product_id = 'object-02-fluid-coupe-pair' AND (title ILIKE '%Nocturne%' OR sort_order = 2));

-- Object 03: Monolith Serving Knife
UPDATE public.product_rituals
SET image_url = '/images/products/object-03-ritual-the-host-setting.webp'
WHERE id = '7f0a3887-1265-4df5-b497-a5968d15ab10'
   OR (product_id = 'object-03-monolith-serving-knife' AND (title ILIKE '%Host%' OR sort_order = 0));

UPDATE public.product_rituals
SET image_url = '/images/products/object-03-ritual-course-progression.webp'
WHERE id = '1e3b5505-441b-415f-b3ce-d1084aebb608'
   OR (product_id = 'object-03-monolith-serving-knife' AND (title ILIKE '%Course Progression%' OR sort_order = 1));

UPDATE public.product_rituals
SET image_url = '/images/products/object-03-ritual-nocturne-gathering.webp'
WHERE id = 'd5d8c99c-e924-4ae5-b7d9-b1be8e5da449'
   OR (product_id = 'object-03-monolith-serving-knife' AND (title ILIKE '%Nocturne%' OR sort_order = 2));

