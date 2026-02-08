-- ============================================
-- Migration: Zone-Based Content Architecture
-- ============================================
-- Date: 2026-02-08
-- Purpose: Refactor to zone-based system where all elements must be placed in zones
--
-- Changes:
-- 1. Make zone_index NOT NULL on elements table (all elements must be in zones)
-- 2. Drop template_elements table (templates now use zones only)
-- 3. Update comments to reflect zone-relative positioning

-- ============================================
-- STEP 1: Verify Data Integrity
-- ============================================

DO $$
DECLARE
  null_zone_count INT;
BEGIN
  -- Check if any elements have NULL zone_index
  SELECT COUNT(*) INTO null_zone_count
  FROM public.elements
  WHERE zone_index IS NULL;

  IF null_zone_count > 0 THEN
    RAISE EXCEPTION 'Cannot migrate: % elements have NULL zone_index. Please assign all elements to zones before running this migration.', null_zone_count;
  END IF;
END $$;

-- ============================================
-- STEP 2: Make zone_index NOT NULL
-- ============================================

DO $$
BEGIN
  -- Check if constraint already exists
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'elements'
      AND column_name = 'zone_index'
      AND is_nullable = 'NO'
  ) THEN
    -- Make zone_index NOT NULL
    ALTER TABLE public.elements
      ALTER COLUMN zone_index SET NOT NULL;

    RAISE NOTICE 'Successfully set zone_index to NOT NULL';
  ELSE
    RAISE NOTICE 'zone_index is already NOT NULL, skipping';
  END IF;
END $$;

-- ============================================
-- STEP 3: Drop template_elements table
-- ============================================

-- Drop RLS policies first
DROP POLICY IF EXISTS "Admins can manage template elements" ON public.template_elements;

-- Drop triggers
DROP TRIGGER IF EXISTS on_template_element_updated ON public.template_elements;

-- Drop the table
DROP TABLE IF EXISTS public.template_elements;

-- ============================================
-- STEP 4: Update Column Comments
-- ============================================

-- Update comments to reflect zone-relative positioning
COMMENT ON COLUMN public.elements.zone_index IS 'Index of the layout zone this element belongs to (REQUIRED - all elements must be in a zone)';
COMMENT ON COLUMN public.elements.position_x IS 'X position relative to zone (for cropping/panning). Can be negative for offset.';
COMMENT ON COLUMN public.elements.position_y IS 'Y position relative to zone (for cropping/panning). Can be negative for offset.';
COMMENT ON COLUMN public.elements.width IS 'Width relative to zone (for zoom/scale). >100% means zoomed in/cropped.';
COMMENT ON COLUMN public.elements.height IS 'Height relative to zone (for zoom/scale). >100% means zoomed in/cropped.';

-- Update table comment
COMMENT ON TABLE public.elements IS 'Elements (photos, text, decorations) placed within page zones. All elements must be assigned to a zone. Position/size are relative to zone for cropping/zooming.';

-- ============================================
-- Migration Complete
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Zone-based refactoring migration completed successfully!';
  RAISE NOTICE '   - zone_index is now required on all elements';
  RAISE NOTICE '   - template_elements table has been removed';
  RAISE NOTICE '   - All content must now be placed in zones';
END $$;
