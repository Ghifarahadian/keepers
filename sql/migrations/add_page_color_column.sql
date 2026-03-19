-- Migration: Add page_color column to pages table
-- Description: Allow users to set custom background colors for pages
-- Date: 2026-03-19

-- Step 1: Add the page_color column with default value
ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS page_color VARCHAR(7) DEFAULT '#FFFFFF';

-- Step 2: Set existing pages to white background
UPDATE public.pages
SET page_color = '#FFFFFF'
WHERE page_color IS NULL;

-- Step 3: Add validation constraint for hex color format
ALTER TABLE public.pages
ADD CONSTRAINT page_color_format_check
CHECK (page_color ~ '^#[0-9A-Fa-f]{6}$');

-- Step 4: Add comment for documentation
COMMENT ON COLUMN public.pages.page_color IS 'Background color for the page in hex format (e.g., #FF6F61). Defaults to white (#FFFFFF).';
