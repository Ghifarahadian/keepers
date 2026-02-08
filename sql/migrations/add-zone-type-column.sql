-- ============================================
-- Migration: Add Zone Type Column to Layout Zones
-- ============================================
-- Date: Earlier migration (extracted from setup.sql)
-- Purpose: Add zone_type column to differentiate photo and text zones

DO $$
BEGIN
  -- Add zone_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'layout_zones' AND column_name = 'zone_type') THEN
    ALTER TABLE public.layout_zones
    ADD COLUMN zone_type VARCHAR(10) NOT NULL DEFAULT 'photo';

    -- Add check constraint
    ALTER TABLE public.layout_zones
    ADD CONSTRAINT zone_type_check CHECK (zone_type IN ('photo', 'text'));

    -- Update existing zones to have 'photo' type (already handled by default)
    UPDATE public.layout_zones SET zone_type = 'photo' WHERE zone_type IS NULL;
  END IF;
END $$;
