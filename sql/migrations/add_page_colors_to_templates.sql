-- Migration: Add page_colors column to templates table
-- Description: Store default page colors for templates (JSONB array of hex colors)
-- Date: 2026-03-19

-- Add page_colors column with default empty array (similar to layout_ids)
ALTER TABLE public.templates
ADD COLUMN IF NOT EXISTS page_colors JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Set existing templates to have white color for all pages based on their page_count
UPDATE public.templates
SET page_colors = (
  SELECT jsonb_agg(val)
  FROM (
    SELECT '#FFFFFF' as val
    FROM generate_series(1, COALESCE(page_count, 30))
  ) colors
)
WHERE page_colors = '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN public.templates.page_colors IS 'Array of hex color codes for page backgrounds, one per page (e.g., ["#FFFFFF", "#FFE5E5"]). Must match page_count length.';
