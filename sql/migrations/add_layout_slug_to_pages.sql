-- Migration: Add layout_slug to pages table
-- Description: Store which layout was used for each page (for reference only, no FK)
-- Date: 2026-02-10

-- Add layout_slug column to pages table
ALTER TABLE pages
ADD COLUMN layout_slug VARCHAR(100);

-- Add comment explaining the column
COMMENT ON COLUMN pages.layout_slug IS 'Reference to the layout used for this page (informational only, no FK constraint)';

-- Optional: Create index for faster queries by layout
CREATE INDEX idx_pages_layout_slug ON pages(layout_slug) WHERE layout_slug IS NOT NULL;
