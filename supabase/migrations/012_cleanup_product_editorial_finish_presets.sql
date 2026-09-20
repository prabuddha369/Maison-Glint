-- Migration 012: Clean up redundant finish.presets from product_editorial JSONB
-- Since migration 006, product_finish_presets is the dedicated single source of truth for all finish presets.

UPDATE public.product_editorial
SET finish = finish - 'presets'
WHERE finish ? 'presets';
