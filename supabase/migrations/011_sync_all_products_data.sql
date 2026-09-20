-- ============================================================
-- Migration 011: Synchronize All 3 Atelier Products in Database
-- ============================================================
-- Object 01: Single Plate — Modernist Chromeware ($58)
-- Object 02: 2 Plates — The Duo ($112)
-- Object 03: 4 Plates — The Host Set ($198)
--
-- This migration updates products, product_editorial, and all child
-- tables with full specifications, editorial copy, rituals, and 
-- finish presets so 100% of product data originates from the database.

-- 1. Ensure image_url exists on product_finish_presets
ALTER TABLE public.product_finish_presets ADD COLUMN IF NOT EXISTS image_url TEXT NOT NULL DEFAULT '';

-- 2. Create the stored synchronization procedure
CREATE OR REPLACE FUNCTION public.sync_storefront_products()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_r1 uuid; v_r2 uuid; v_r3 uuid;
  v_r4 uuid; v_r5 uuid; v_r6 uuid;
  v_r7 uuid; v_r8 uuid; v_r9 uuid;
BEGIN
  -- ==========================================================
  -- 1. MAIN PRODUCTS TABLE
  -- ==========================================================
  -- Object 01: Modernist Chromeware ($58)
  INSERT INTO public.products (
    id, name, description, price, currency, images, specifications,
    in_stock, edition_total, edition_remaining, edition_reserved, updated_at
  ) VALUES (
    'object-01-the-glint-plate',
    'Object 01 — Modernist Chromeware',
    'Single exemplar forged in 1.2 mm AISI 304 stainless steel with double-buffed 8K mirror polish. Proportioned for individual table service and reflective dining presence.',
    58,
    'USD',
    jsonb_build_array('/images/fig-01-table.png', '/images/fig-02-profile.png', '/images/scallops-macro.png'),
    jsonb_build_object(
      'gauge', '1.2 mm (18-Gauge) AISI 304 Core',
      'diameter', '280 mm (11.02 in)',
      'rim_height', '18 mm',
      'finish', 'Double-Buffed 8K Specular Mirror Polish',
      'weight', '600 grams',
      'origin', 'Maison Glint Atelier'
    ),
    true, 250, 34, 0, NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    images = EXCLUDED.images,
    specifications = EXCLUDED.specifications,
    in_stock = EXCLUDED.in_stock,
    edition_total = EXCLUDED.edition_total,
    edition_remaining = EXCLUDED.edition_remaining,
    edition_reserved = EXCLUDED.edition_reserved,
    updated_at = NOW();

  -- Object 02: The Duo ($112)
  INSERT INTO public.products (
    id, name, description, price, currency, images, specifications,
    in_stock, edition_total, edition_remaining, edition_reserved, updated_at
  ) VALUES (
    'object-02-fluid-coupe-pair',
    'Object 02 — The Duo',
    'Two matching Object 01 pieces in double-buffed 8K mirror stainless steel. Proportioned for intimate dining, layered charger service, or shared presentation.',
    112,
    'USD',
    jsonb_build_array('/images/dining-ritual.png', '/images/fig-01-table.png', '/images/nocturne-setting.png'),
    jsonb_build_object(
      'gauge', '1.2 mm (18-Gauge) AISI 304 Core',
      'diameter', '280 mm per piece',
      'rim_height', '18 mm',
      'finish', 'Double-Buffed 8K Specular Mirror Polish',
      'weight', '1,200 grams (600 g per piece)',
      'origin', 'Maison Glint Atelier'
    ),
    true, 150, 18, 0, NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    images = EXCLUDED.images,
    specifications = EXCLUDED.specifications,
    in_stock = EXCLUDED.in_stock,
    edition_total = EXCLUDED.edition_total,
    edition_remaining = EXCLUDED.edition_remaining,
    edition_reserved = EXCLUDED.edition_reserved,
    updated_at = NOW();

  -- Object 03: The Host Set ($198)
  INSERT INTO public.products (
    id, name, description, price, currency, images, specifications,
    in_stock, edition_total, edition_remaining, edition_reserved, updated_at
  ) VALUES (
    'object-03-monolith-serving-knife',
    'Object 03 — The Host Set',
    'Four Object 01 pieces in double-buffed 8K mirror stainless steel. Configured for complete table service across four place settings.',
    198,
    'USD',
    jsonb_build_array('/images/dining-ritual.png', '/images/fig-01-table.png', '/images/nocturne-setting.png'),
    jsonb_build_object(
      'gauge', '1.2 mm (18-Gauge) AISI 304 Core',
      'diameter', '280 mm per piece',
      'rim_height', '18 mm',
      'finish', 'Double-Buffed 8K Specular Mirror Polish',
      'weight', '2,400 grams (600 g per piece)',
      'origin', 'Maison Glint Atelier'
    ),
    true, 150, 38, 0, NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    images = EXCLUDED.images,
    specifications = EXCLUDED.specifications,
    in_stock = EXCLUDED.in_stock,
    edition_total = EXCLUDED.edition_total,
    edition_remaining = EXCLUDED.edition_remaining,
    edition_reserved = EXCLUDED.edition_reserved,
    updated_at = NOW();

  -- ==========================================================
  -- 2. PRODUCT EDITORIAL JSON
  -- ==========================================================
  -- Editorial for Object 01
  INSERT INTO public.product_editorial (
    product_id, hero, showcase, finish, specifications, table_content, updated_at
  ) VALUES (
    'object-01-the-glint-plate',
    jsonb_build_object(
      'eyebrow', 'Objects for the Everyday Ritual',
      'editionLabel', 'Batch 01 / 250',
      'description', 'A considered object with a reflective surface, clean geometry, and a quiet presence at the table.',
      'discoverLabel', 'Discover Object',
      'reserveLabel', 'Acquire Object 01',
      'materialLabel', 'Material',
      'materialValue', '18-Gauge 304 Stainless Steel',
      'craftLabel', 'Surface Craft',
      'craftValue', 'Double-Buffed 8K Mirror Chrome',
      'editionLabelMeta', 'Provenance',
      'editionValue', 'Numbered Atelier Run'
    ),
    jsonb_build_object(
      'sectionLabel', '01 / Object Showcase',
      'title', 'Object 01 — Modernist Chromeware',
      'titleEmphasis', 'Endless possibilities.',
      'description', 'A simple form, a reflective surface, and a different way to set the table.',
      'finishBadge', 'Double-Buffed 8K Mirror Chrome',
      'statusLabel', 'Status',
      'statusDescription', 'Serialized atelier allocation with edition verification and provenance documentation included.',
      'provenanceLabel', 'Provenance',
      'monographLabel', 'Monograph View',
      'acquireLabel', 'Acquire Object 01 — $58',
      'priorityLabel', 'Priority Access'
    ),
    jsonb_build_object(
      'sectionLabel', '02 / The Finish & Philosophy',
      'title', 'Made of steel.',
      'titleEmphasis', 'Alive with light.',
      'paragraphs', jsonb_build_array(
        'A curve. A glint. The room, reflected. A surface that becomes part of the setting.',
        'The finish carries the season, the lighting, and the architecture of the gathering.'
      ),
      'presetLabel', 'Select Optical Light State',
      'spectrumLabel', 'Reflective Index Spectrum',
      'roughnessLabel', 'Surface Index',
      'presets', jsonb_build_array(
        jsonb_build_object(
          'key', 'morning',
          'label', 'Morning Sun',
          'angle', 45,
          'roughness', 'Ra < 0.050 µm',
          'dispersion', '98.4%',
          'imageUrl', 'https://drive.google.com/file/d/10MrLj9sZ0g3rDmXhl1XATt3WbHymY-RI/view?usp=sharing',
          'sortOrder', 0
        ),
        jsonb_build_object(
          'key', 'candlelight',
          'label', 'Candlelight Grazing',
          'angle', 22,
          'roughness', 'Ra < 0.048 µm',
          'dispersion', '99.1%',
          'imageUrl', 'https://drive.google.com/file/d/1J6r_3beMMM8DGnMch3WVLIzncvKRUJrj/view?usp=sharing',
          'sortOrder', 1
        ),
        jsonb_build_object(
          'key', 'zenith',
          'label', 'Overhead Ambient',
          'angle', 70,
          'roughness', 'Ra < 0.045 µm',
          'dispersion', '98.8%',
          'imageUrl', 'https://drive.google.com/file/d/1rgJEFBuH17GLAhCK6i-2Kcd0MoGmDFPu/view?usp=sharing',
          'sortOrder', 2
        )
      )
    ),
    jsonb_build_object(
      'sectionLabel', '03 / Specifications',
      'title', 'Every detail,',
      'titleEmphasis', 'considered.',
      'description', 'Refined measurements balanced for the surfaces and rituals of everyday dining.',
      'metricToggleLabel', 'MM / G',
      'imperialToggleLabel', 'IN / OZ',
      'serialStamp', 'Verified Serial Stamp',
      'archiveLabel', 'Maison Glint Archive'
    ),
    jsonb_build_object(
      'sectionLabel', '04 / At The Table',
      'title', 'The Art of the Everyday.',
      'titleEmphasis', 'Set a different table.',
      'description', 'A reflective stage for considered courses, fresh harvest, and intimate evening settings.'
    ),
    NOW()
  ) ON CONFLICT (product_id) DO UPDATE SET
    hero = EXCLUDED.hero,
    showcase = EXCLUDED.showcase,
    finish = EXCLUDED.finish,
    specifications = EXCLUDED.specifications,
    table_content = EXCLUDED.table_content,
    updated_at = NOW();

  -- Editorial for Object 02 (The Duo)
  INSERT INTO public.product_editorial (
    product_id, hero, showcase, finish, specifications, table_content, updated_at
  ) VALUES (
    'object-02-fluid-coupe-pair',
    jsonb_build_object(
      'eyebrow', 'Objects for the Everyday Ritual',
      'editionLabel', 'Batch 02 / 150',
      'description', 'Two matching pieces. Proportioned for intimate dining, layered charger service, or shared presentation.',
      'discoverLabel', 'Discover Object',
      'reserveLabel', 'Acquire The Duo',
      'materialLabel', 'Material',
      'materialValue', '18-Gauge 304 Stainless Steel',
      'craftLabel', 'Surface Craft',
      'craftValue', 'Double-Buffed 8K Mirror Chrome',
      'editionLabelMeta', 'Provenance',
      'editionValue', 'Numbered Atelier Run'
    ),
    jsonb_build_object(
      'sectionLabel', '01 / Object Showcase',
      'title', 'The Duo',
      'titleEmphasis', 'A setting for two.',
      'description', 'Two Object 01 pieces. Proportioned for intimate dining, layered charger service, or shared presentation.',
      'finishBadge', 'Double-Buffed 8K Mirror Chrome',
      'statusLabel', 'Status',
      'statusDescription', 'Serialized atelier allocation with edition verification and provenance documentation included.',
      'provenanceLabel', 'Provenance',
      'monographLabel', 'Monograph View',
      'acquireLabel', 'Acquire The Duo — $112',
      'priorityLabel', 'Priority Access'
    ),
    jsonb_build_object(
      'sectionLabel', '02 / The Finish & Philosophy',
      'title', 'Made of steel.',
      'titleEmphasis', 'Alive with light.',
      'paragraphs', jsonb_build_array(
        'Two reflective surfaces mirroring each other and the room.',
        'The finish carries the season, the lighting, and the architecture of the gathering.'
      ),
      'presetLabel', 'Select Optical Light State',
      'spectrumLabel', 'Reflective Index Spectrum',
      'roughnessLabel', 'Surface Index',
      'presets', jsonb_build_array(
        jsonb_build_object(
          'key', 'morning',
          'label', 'Morning Sun',
          'angle', 45,
          'roughness', 'Ra < 0.050 µm',
          'dispersion', '98.4%',
          'imageUrl', 'https://drive.google.com/file/d/10MrLj9sZ0g3rDmXhl1XATt3WbHymY-RI/view?usp=sharing',
          'sortOrder', 0
        ),
        jsonb_build_object(
          'key', 'candlelight',
          'label', 'Candlelight Grazing',
          'angle', 22,
          'roughness', 'Ra < 0.048 µm',
          'dispersion', '99.1%',
          'imageUrl', 'https://drive.google.com/file/d/1J6r_3beMMM8DGnMch3WVLIzncvKRUJrj/view?usp=sharing',
          'sortOrder', 1
        ),
        jsonb_build_object(
          'key', 'zenith',
          'label', 'Overhead Ambient',
          'angle', 70,
          'roughness', 'Ra < 0.045 µm',
          'dispersion', '98.8%',
          'imageUrl', 'https://drive.google.com/file/d/1rgJEFBuH17GLAhCK6i-2Kcd0MoGmDFPu/view?usp=sharing',
          'sortOrder', 2
        )
      )
    ),
    jsonb_build_object(
      'sectionLabel', '03 / Specifications',
      'title', 'Every detail,',
      'titleEmphasis', 'considered.',
      'description', 'Refined measurements balanced for paired dining and ceremonial table service.',
      'metricToggleLabel', 'MM / G',
      'imperialToggleLabel', 'IN / OZ',
      'serialStamp', 'Verified Serial Stamp',
      'archiveLabel', 'Maison Glint Archive'
    ),
    jsonb_build_object(
      'sectionLabel', '04 / At The Table',
      'title', 'The Art of the Everyday.',
      'titleEmphasis', 'Set a different table.',
      'description', 'Two individual settings. Linen, stone, and warm candlelight reflecting across cold mirror steel.'
    ),
    NOW()
  ) ON CONFLICT (product_id) DO UPDATE SET
    hero = EXCLUDED.hero,
    showcase = EXCLUDED.showcase,
    finish = EXCLUDED.finish,
    specifications = EXCLUDED.specifications,
    table_content = EXCLUDED.table_content,
    updated_at = NOW();

  -- Editorial for Object 03 (The Host Set)
  INSERT INTO public.product_editorial (
    product_id, hero, showcase, finish, specifications, table_content, updated_at
  ) VALUES (
    'object-03-monolith-serving-knife',
    jsonb_build_object(
      'eyebrow', 'Objects for the Everyday Ritual',
      'editionLabel', 'Batch 03 / 150',
      'description', 'Four matching pieces. A complete table setting in clean geometry and specular steel.',
      'discoverLabel', 'Discover Object',
      'reserveLabel', 'Acquire The Host Set',
      'materialLabel', 'Material',
      'materialValue', '18-Gauge 304 Stainless Steel',
      'craftLabel', 'Surface Craft',
      'craftValue', 'Double-Buffed 8K Mirror Chrome',
      'editionLabelMeta', 'Provenance',
      'editionValue', 'Numbered Atelier Run'
    ),
    jsonb_build_object(
      'sectionLabel', '01 / Object Showcase',
      'title', 'The Host Set',
      'titleEmphasis', 'A setting for four.',
      'description', 'Four Object 01 pieces. Proportioned for full dinner service, multi-course presentation, and architectural table composition.',
      'finishBadge', 'Double-Buffed 8K Mirror Chrome',
      'statusLabel', 'Status',
      'statusDescription', 'Serialized atelier allocation with edition verification and provenance documentation included.',
      'provenanceLabel', 'Provenance',
      'monographLabel', 'Monograph View',
      'acquireLabel', 'Acquire The Host Set — $198',
      'priorityLabel', 'Priority Access'
    ),
    jsonb_build_object(
      'sectionLabel', '02 / The Finish & Philosophy',
      'title', 'Made of steel.',
      'titleEmphasis', 'Alive with light.',
      'paragraphs', jsonb_build_array(
        'Four reflective planes interacting with the room and each other.',
        'The finish carries the ambient season, evening candlelight, and the collective presence of the gathering.'
      ),
      'presetLabel', 'Select Optical Light State',
      'spectrumLabel', 'Reflective Index Spectrum',
      'roughnessLabel', 'Surface Index',
      'presets', jsonb_build_array(
        jsonb_build_object(
          'key', 'morning',
          'label', 'Morning Sun',
          'angle', 45,
          'roughness', 'Ra < 0.050 µm',
          'dispersion', '98.4%',
          'imageUrl', 'https://drive.google.com/file/d/10MrLj9sZ0g3rDmXhl1XATt3WbHymY-RI/view?usp=sharing',
          'sortOrder', 0
        ),
        jsonb_build_object(
          'key', 'candlelight',
          'label', 'Candlelight Grazing',
          'angle', 22,
          'roughness', 'Ra < 0.048 µm',
          'dispersion', '99.1%',
          'imageUrl', 'https://drive.google.com/file/d/1J6r_3beMMM8DGnMch3WVLIzncvKRUJrj/view?usp=sharing',
          'sortOrder', 1
        ),
        jsonb_build_object(
          'key', 'zenith',
          'label', 'Overhead Ambient',
          'angle', 70,
          'roughness', 'Ra < 0.045 µm',
          'dispersion', '98.8%',
          'imageUrl', 'https://drive.google.com/file/d/1rgJEFBuH17GLAhCK6i-2Kcd0MoGmDFPu/view?usp=sharing',
          'sortOrder', 2
        )
      )
    ),
    jsonb_build_object(
      'sectionLabel', '03 / Specifications',
      'title', 'Every detail,',
      'titleEmphasis', 'considered.',
      'description', 'Refined measurements balanced for full multi-course dining and archival longevity.',
      'metricToggleLabel', 'MM / G',
      'imperialToggleLabel', 'IN / OZ',
      'serialStamp', 'Verified Serial Stamp',
      'archiveLabel', 'Maison Glint Archive'
    ),
    jsonb_build_object(
      'sectionLabel', '04 / At The Table',
      'title', 'The Art of the Everyday.',
      'titleEmphasis', 'A table prepared for four.',
      'description', 'Four reflective stages for full service, considered courses, and shared evening gatherings.'
    ),
    NOW()
  ) ON CONFLICT (product_id) DO UPDATE SET
    hero = EXCLUDED.hero,
    showcase = EXCLUDED.showcase,
    finish = EXCLUDED.finish,
    specifications = EXCLUDED.specifications,
    table_content = EXCLUDED.table_content,
    updated_at = NOW();

  -- ==========================================================
  -- 3. RESET & REPOPULATE CHILD TABLES
  -- ==========================================================
  DELETE FROM public.product_hero_slides WHERE product_id IN ('object-01-the-glint-plate', 'object-02-fluid-coupe-pair', 'object-03-monolith-serving-knife');
  DELETE FROM public.product_features WHERE product_id IN ('object-01-the-glint-plate', 'object-02-fluid-coupe-pair', 'object-03-monolith-serving-knife');
  DELETE FROM public.product_panels WHERE product_id IN ('object-01-the-glint-plate', 'object-02-fluid-coupe-pair', 'object-03-monolith-serving-knife');
  DELETE FROM public.product_finish_presets WHERE product_id IN ('object-01-the-glint-plate', 'object-02-fluid-coupe-pair', 'object-03-monolith-serving-knife');
  DELETE FROM public.product_specification_rows WHERE product_id IN ('object-01-the-glint-plate', 'object-02-fluid-coupe-pair', 'object-03-monolith-serving-knife');
  DELETE FROM public.product_rituals WHERE product_id IN ('object-01-the-glint-plate', 'object-02-fluid-coupe-pair', 'object-03-monolith-serving-knife');

  -- Product Hero Slides
  INSERT INTO public.product_hero_slides (product_id, image_url, alt, category, title, figure_label, tab_label, badge, sort_order) VALUES
  ('object-01-the-glint-plate', '/images/fig-01-table.png', 'Object 01 — The Glint Plate perspective 1', 'Table Setting', 'A considered presence at the table', 'FIG. 01', 'Fig. 01', 'Atmosphere', 0),
  ('object-01-the-glint-plate', '/images/fig-02-profile.png', 'Object 01 — The Glint Plate perspective 2', 'Side Elevation', 'Profile, edge, and reflected light', 'FIG. 02', 'Fig. 02', 'Profile', 1),
  ('object-02-fluid-coupe-pair', '/images/dining-ritual.png', 'The Duo — Two Object 01 pieces arranged for two', 'Table Setting', 'A considered table prepared for two', 'FIG. 01', 'Fig. 01', 'Atmosphere', 0),
  ('object-02-fluid-coupe-pair', '/images/fig-01-table.png', 'The Duo — Profile, beaded edge, and reflected light', 'Side Elevation', 'Profile, edge, and reflected light', 'FIG. 02', 'Fig. 02', 'Profile', 1),
  ('object-03-monolith-serving-knife', '/images/dining-ritual.png', 'The Host Set — Four Object 01 pieces composed for service', 'Table Setting', 'A considered table prepared for four', 'FIG. 01', 'Fig. 01', 'Atmosphere', 0),
  ('object-03-monolith-serving-knife', '/images/fig-01-table.png', 'The Host Set — Multi-course layered architecture', 'Service Composition', 'Multi-course layered architecture', 'FIG. 02', 'Fig. 02', 'Service', 1);

  -- Product Features
  INSERT INTO public.product_features (product_id, label, description, sort_order) VALUES
  ('object-01-the-glint-plate', 'Surface Refraction', 'A measured finish designed to carry ambient light and tactile detail.', 0),
  ('object-01-the-glint-plate', 'Ergonomic Lift', 'Balanced geometry engineered for confident handling during service.', 1),
  ('object-02-fluid-coupe-pair', 'Paired Refraction', 'Dual mirror surfaces engineered to reflect light across conversation settings.', 0),
  ('object-02-fluid-coupe-pair', 'Harmonized Profile', 'Uniform 18 mm rim depth allowing compact nesting and seamless charger pairing.', 1),
  ('object-03-monolith-serving-knife', 'Ensemble Calibration', 'Four harmonized pieces engineered to reflect the table and ambient lighting in quiet unison.', 0),
  ('object-03-monolith-serving-knife', 'Continuous Stacking Lift', 'Uniform 18 mm rim depth engineered for compact nested storage and confident multi-course service.', 1);

  -- Product Panels
  INSERT INTO public.product_panels (product_id, title, body, sort_order) VALUES
  ('object-01-the-glint-plate', 'Product Details', 'Crafted for daily ritual with a considered balance of material, finish, and proportion.', 0),
  ('object-01-the-glint-plate', 'Care & Use', 'Care instructions and use notes are maintained by the atelier for each edition.', 1),
  ('object-01-the-glint-plate', 'Delivery & Provenance', 'Each exemplar is serialized and delivered with its corresponding authenticity record.', 2),
  ('object-02-fluid-coupe-pair', 'Product Details', 'Crafted for daily ritual. Includes two matching 280 mm Object 01 pieces in unadorned 304 stainless steel.', 0),
  ('object-02-fluid-coupe-pair', 'Care & Use', 'Hand wash with soft cotton and mild detergent. Dry immediately to maintain uniform specular brilliance.', 1),
  ('object-02-fluid-coupe-pair', 'Delivery & Provenance', 'Dispatched in paired protective atelier sleeves with an individual authenticity record.', 2),
  ('object-03-monolith-serving-knife', 'Product Details', 'Complete ensemble containing four serialized 280 mm Object 01 exemplars in food-safe austenitic 304 stainless steel.', 0),
  ('object-03-monolith-serving-knife', 'Care & Use', 'Hand wash with soft microfiber and neutral cleansing agents. Polish dry immediately with cotton to sustain mirror brilliance.', 1),
  ('object-03-monolith-serving-knife', 'Delivery & Provenance', 'Dispatched in individual protective atelier sleeves within a collective archival box with certificates of provenance.', 2);

  -- Product Finish Presets (with optical image_url)
  INSERT INTO public.product_finish_presets (product_id, preset_key, label, angle, roughness, dispersion, image_url, sort_order) VALUES
  ('object-01-the-glint-plate', 'morning', 'Morning Sun', 45, 'Ra < 0.050 µm', '98.4%', 'https://drive.google.com/file/d/10MrLj9sZ0g3rDmXhl1XATt3WbHymY-RI/view?usp=sharing', 0),
  ('object-01-the-glint-plate', 'candlelight', 'Candlelight Grazing', 22, 'Ra < 0.048 µm', '99.1%', 'https://drive.google.com/file/d/1J6r_3beMMM8DGnMch3WVLIzncvKRUJrj/view?usp=sharing', 1),
  ('object-01-the-glint-plate', 'zenith', 'Overhead Ambient', 70, 'Ra < 0.045 µm', '98.8%', 'https://drive.google.com/file/d/1rgJEFBuH17GLAhCK6i-2Kcd0MoGmDFPu/view?usp=sharing', 2),
  ('object-02-fluid-coupe-pair', 'morning', 'Morning Sun', 45, 'Ra < 0.050 µm', '98.4%', 'https://drive.google.com/file/d/10MrLj9sZ0g3rDmXhl1XATt3WbHymY-RI/view?usp=sharing', 0),
  ('object-02-fluid-coupe-pair', 'candlelight', 'Candlelight Grazing', 22, 'Ra < 0.048 µm', '99.1%', 'https://drive.google.com/file/d/1J6r_3beMMM8DGnMch3WVLIzncvKRUJrj/view?usp=sharing', 1),
  ('object-02-fluid-coupe-pair', 'zenith', 'Overhead Ambient', 70, 'Ra < 0.045 µm', '98.8%', 'https://drive.google.com/file/d/1rgJEFBuH17GLAhCK6i-2Kcd0MoGmDFPu/view?usp=sharing', 2),
  ('object-03-monolith-serving-knife', 'morning', 'Morning Sun', 45, 'Ra < 0.050 µm', '98.4%', 'https://drive.google.com/file/d/10MrLj9sZ0g3rDmXhl1XATt3WbHymY-RI/view?usp=sharing', 0),
  ('object-03-monolith-serving-knife', 'candlelight', 'Candlelight Grazing', 22, 'Ra < 0.048 µm', '99.1%', 'https://drive.google.com/file/d/1J6r_3beMMM8DGnMch3WVLIzncvKRUJrj/view?usp=sharing', 1),
  ('object-03-monolith-serving-knife', 'zenith', 'Overhead Ambient', 70, 'Ra < 0.045 µm', '98.8%', 'https://drive.google.com/file/d/1rgJEFBuH17GLAhCK6i-2Kcd0MoGmDFPu/view?usp=sharing', 2);

  -- Specification Rows
  INSERT INTO public.product_specification_rows (product_id, label, metric, imperial, sort_order) VALUES
  ('object-01-the-glint-plate', 'DIAMETER', '280 mm', '11.0 in', 0),
  ('object-01-the-glint-plate', 'RIM HEIGHT', '18 mm', '0.71 in', 1),
  ('object-01-the-glint-plate', 'BASE GAUGE', '1.2 mm (18-Gauge)', '0.048 in (18-Gauge)', 2),
  ('object-01-the-glint-plate', 'NET MASS', '600 g', '21.2 oz', 3),
  ('object-01-the-glint-plate', 'ALLOY GRADE', 'AISI 304 Stainless Steel', 'AISI 304 Stainless Steel', 4),
  ('object-01-the-glint-plate', 'SURFACE FINISH', 'Double-Buffed 8K Mirror Polish', 'Double-Buffed 8K Mirror Polish', 5),

  ('object-02-fluid-coupe-pair', 'SET CONTENTS', 'Two Object 01 Pieces', 'Two Object 01 Pieces', 0),
  ('object-02-fluid-coupe-pair', 'DIAMETER', '280 mm per piece', '11.0 in per piece', 1),
  ('object-02-fluid-coupe-pair', 'RIM HEIGHT', '18 mm', '0.71 in', 2),
  ('object-02-fluid-coupe-pair', 'BASE GAUGE', '1.2 mm (18-Gauge)', '0.048 in (18-Gauge)', 3),
  ('object-02-fluid-coupe-pair', 'TOTAL NET MASS', '1,200 g (600 g per piece)', '42.4 oz (21.2 oz per piece)', 4),
  ('object-02-fluid-coupe-pair', 'ALLOY GRADE', 'AISI 304 Stainless Steel', 'AISI 304 Stainless Steel', 5),
  ('object-02-fluid-coupe-pair', 'SURFACE FINISH', 'Double-Buffed 8K Mirror Polish', 'Double-Buffed 8K Mirror Polish', 6),

  ('object-03-monolith-serving-knife', 'SET CONTENTS', 'Four Object 01 Pieces', 'Four Object 01 Pieces', 0),
  ('object-03-monolith-serving-knife', 'DIAMETER', '280 mm per piece', '11.0 in per piece', 1),
  ('object-03-monolith-serving-knife', 'RIM HEIGHT', '18 mm', '0.71 in', 2),
  ('object-03-monolith-serving-knife', 'BASE GAUGE', '1.2 mm (18-Gauge)', '0.048 in (18-Gauge)', 3),
  ('object-03-monolith-serving-knife', 'TOTAL NET MASS', '2,400 g (600 g per piece)', '84.8 oz (21.2 oz per piece)', 4),
  ('object-03-monolith-serving-knife', 'ALLOY GRADE', 'AISI 304 Stainless Steel', 'AISI 304 Stainless Steel', 5),
  ('object-03-monolith-serving-knife', 'SURFACE FINISH', 'Double-Buffed 8K Mirror Polish', 'Double-Buffed 8K Mirror Polish', 6);

  -- Rituals & Ritual Items
  -- Object 01 Rituals
  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-01-the-glint-plate', 'The Dining Ritual', 'Linen, stone, and cool metal.', '/images/fig-01-table.png', 'Object 01 in a dining setting', 'A considered arrangement of bread, linen, and warm natural surfaces.', 0)
  RETURNING id INTO v_r1;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r1, 'Artisanal Course', 0), (v_r1, 'Washed Linen', 1);

  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-01-the-glint-plate', 'Raw Elements', 'A reflective stage for fresh harvest.', '/images/fig-02-profile.png', 'Object 01 with fresh elements', 'Fresh botanical elements meet a reflective architectural surface.', 1)
  RETURNING id INTO v_r2;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r2, 'Seasonal Harvest', 0), (v_r2, 'Micro-Crystalline Salt', 1);

  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-01-the-glint-plate', 'Nocturne Setting', 'Candlelight and evening reflections.', '/images/scallops-macro.png', 'Object 01 in an evening setting', 'A low evening light reveals the object’s changing reflection.', 2)
  RETURNING id INTO v_r3;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r3, 'Natural Candlelight', 0), (v_r3, 'Hand-Blown Glass', 1);

  -- Object 02 Rituals
  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-02-fluid-coupe-pair', 'The Dining Ritual', 'An intimate table for two.', '/images/dining-ritual.png', 'The Duo arranged for an evening meal for two', 'Two individual settings. Linen, stone, and warm candlelight reflecting across cold mirror steel.', 0)
  RETURNING id INTO v_r4;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r4, 'Artisanal Course', 0), (v_r4, 'Washed Linen', 1);

  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-02-fluid-coupe-pair', 'The Layered Setting', 'Ceramic meets Mirror Polish.', '/images/fig-01-table.png', 'The Duo used as double charger surfaces beneath dinnerware', 'Object 01 serves as a reflective lower foundation beneath ceramic dining pieces.', 1)
  RETURNING id INTO v_r5;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r5, 'Seasonal Harvest', 0), (v_r5, 'Micro-Crystalline Salt', 1);

  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-02-fluid-coupe-pair', 'Nocturne Setting', 'Candlelight and evening reflections.', '/images/nocturne-setting.png', 'The Duo in low-angle evening candlelight', 'Low evening light reveals the steel''s changing reflection between two conversational settings.', 2)
  RETURNING id INTO v_r6;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r6, 'Natural Candlelight', 0), (v_r6, 'Hand-Blown Glass', 1);

  -- Object 03 Rituals
  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-03-monolith-serving-knife', 'The Host Setting', 'Four places composed around the table.', '/images/dining-ritual.png', 'The Host Set arranged across four place settings', 'Four individual settings. Natural linen, artisanal flatware, and evening candlelight mirrored across four chrome surfaces.', 0)
  RETURNING id INTO v_r7;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r7, 'Four Covers', 0), (v_r7, 'Specular Table Service', 1);

  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-03-monolith-serving-knife', 'Course Progression', 'From amuse-bouche to shared courses.', '/images/fig-01-table.png', 'The Host Set used throughout course progression', 'Uniform 280 mm geometry provides a calm architectural foundation throughout dinner service.', 1)
  RETURNING id INTO v_r8;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r8, 'Shared Courses', 0), (v_r8, 'Architectural Foundation', 1);

  INSERT INTO public.product_rituals (product_id, title, subtitle, image_url, image_alt, description, sort_order)
  VALUES ('object-03-monolith-serving-knife', 'Nocturne Gathering', 'Atmospheric evening reflections.', '/images/nocturne-setting.png', 'The Host Set under warm ambient evening glow', 'Low-angle illumination reflects between all four settings, uniting the room in warm steel glints.', 2)
  RETURNING id INTO v_r9;
  INSERT INTO public.product_ritual_items (ritual_id, label, sort_order) VALUES (v_r9, 'Ambient Illumination', 0), (v_r9, 'Collective Presence', 1);

  RETURN jsonb_build_object(
    'success', true,
    'message', 'All 3 atelier products, editorial content, finish presets, and child tables synchronized successfully.'
  );
END;
$$;

-- 3. Grant execute permission to anon, authenticated, and service_role
GRANT EXECUTE ON FUNCTION public.sync_storefront_products TO anon, authenticated, service_role;

-- 4. Execute immediately so migrations run on deployment
SELECT public.sync_storefront_products();
