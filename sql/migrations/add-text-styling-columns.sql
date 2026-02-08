-- ============================================
-- Migration: Add Text Styling Columns to Elements
-- ============================================
-- Date: Earlier migration (extracted from setup.sql)
-- Purpose: Add font_weight, font_style, text_align, and text_decoration columns

DO $$
BEGIN
  -- Add font_weight column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'elements' AND column_name = 'font_weight') THEN
    ALTER TABLE public.elements ADD COLUMN font_weight VARCHAR(20) DEFAULT 'normal';
  END IF;

  -- Add font_style column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'elements' AND column_name = 'font_style') THEN
    ALTER TABLE public.elements ADD COLUMN font_style VARCHAR(20) DEFAULT 'normal';
  END IF;

  -- Add text_align column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'elements' AND column_name = 'text_align') THEN
    ALTER TABLE public.elements ADD COLUMN text_align VARCHAR(20) DEFAULT 'left';
  END IF;

  -- Add text_decoration column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'elements' AND column_name = 'text_decoration') THEN
    ALTER TABLE public.elements ADD COLUMN text_decoration VARCHAR(20) DEFAULT 'none';
  END IF;
END $$;
