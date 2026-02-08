-- ============================================
-- Migration: Unify layout_zones into page_zones
-- ============================================
-- Date: 2026-02-08
-- Purpose: Simplify schema by using a single zones table for both layouts and pages
--
-- Changes:
-- 1. Rename page_zones → zones
-- 2. Make page_id nullable in zones
-- 3. Add layout_id column to zones (nullable)
-- 4. Add constraint ensuring exactly one of (page_id, layout_id) is set
-- 5. Migrate layout_zones → zones
-- 6. Drop layout_zones table
-- 7. Update indexes and constraints

-- ============================================
-- STEP 1: Rename page_zones to zones
-- ============================================

DO $$
BEGIN
  -- Check if page_zones exists and zones doesn't
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_zones')
     AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'zones') THEN

    ALTER TABLE public.page_zones RENAME TO zones;
    RAISE NOTICE '✓ Renamed page_zones table to zones';
  ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'zones') THEN
    RAISE NOTICE 'zones table already exists, skipping rename';
  ELSE
    RAISE NOTICE 'page_zones table does not exist, skipping rename';
  END IF;
END $$;

-- ============================================
-- STEP 2: Add layout_id Column and Modify Constraints
-- ============================================

DO $$
BEGIN
  -- Add layout_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zones' AND column_name = 'layout_id'
  ) THEN
    ALTER TABLE public.zones ADD COLUMN layout_id UUID REFERENCES public.layouts(id) ON DELETE CASCADE;
    RAISE NOTICE '✓ Added layout_id column to zones';
  ELSE
    RAISE NOTICE 'layout_id column already exists in zones';
  END IF;

  -- Make page_id nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zones' AND column_name = 'page_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.zones ALTER COLUMN page_id DROP NOT NULL;
    RAISE NOTICE '✓ Made page_id nullable in zones';
  ELSE
    RAISE NOTICE 'page_id is already nullable in zones';
  END IF;

  -- Add zone_type column if it doesn't exist (needed for layout zones)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'zones' AND column_name = 'zone_type'
  ) THEN
    ALTER TABLE public.zones ADD COLUMN zone_type VARCHAR(20);
    RAISE NOTICE '✓ Added zone_type column to zones';
  ELSE
    RAISE NOTICE 'zone_type column already exists in zones';
  END IF;

  -- Add constraint ensuring exactly one of (page_id, layout_id) is set
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'zones' AND constraint_name = 'zones_owner_check'
  ) THEN
    ALTER TABLE public.zones ADD CONSTRAINT zones_owner_check
      CHECK (
        (page_id IS NOT NULL AND layout_id IS NULL) OR
        (page_id IS NULL AND layout_id IS NOT NULL)
      );
    RAISE NOTICE '✓ Added zones_owner_check constraint';
  ELSE
    RAISE NOTICE 'zones_owner_check constraint already exists';
  END IF;
END $$;

-- ============================================
-- STEP 3: Migrate layout_zones to zones
-- ============================================

DO $$
DECLARE
  layout_zone_count INT;
  migrated_count INT;
BEGIN
  -- Check if layout_zones table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'layout_zones') THEN
    -- Count layout zones to migrate
    SELECT COUNT(*) INTO layout_zone_count FROM public.layout_zones;

    IF layout_zone_count > 0 THEN
      -- Migrate layout_zones to zones
      INSERT INTO public.zones (
        layout_id, zone_index, position_x, position_y, width, height, zone_type,
        created_at, updated_at
      )
      SELECT
        layout_id,
        zone_index,
        position_x,
        position_y,
        width,
        height,
        zone_type,
        created_at,
        updated_at
      FROM public.layout_zones
      ON CONFLICT DO NOTHING; -- Skip if already migrated

      GET DIAGNOSTICS migrated_count = ROW_COUNT;
      RAISE NOTICE '✓ Migrated % layout zones to zones table', migrated_count;
    ELSE
      RAISE NOTICE 'No layout zones to migrate';
    END IF;
  ELSE
    RAISE NOTICE 'layout_zones table does not exist, skipping migration';
  END IF;
END $$;

-- ============================================
-- STEP 4: Drop Unique Constraint on (page_id, zone_index)
-- ============================================

DO $$
BEGIN
  -- Drop the old unique constraint on (page_id, zone_index) since page_id is now nullable
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'zones' AND constraint_name = 'page_zones_page_id_zone_index_key'
  ) THEN
    ALTER TABLE public.zones DROP CONSTRAINT page_zones_page_id_zone_index_key;
    RAISE NOTICE '✓ Dropped old page_zones_page_id_zone_index_key constraint';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'zones' AND constraint_name = 'zones_page_id_zone_index_key'
  ) THEN
    ALTER TABLE public.zones DROP CONSTRAINT zones_page_id_zone_index_key;
    RAISE NOTICE '✓ Dropped old zones_page_id_zone_index_key constraint';
  END IF;
END $$;

-- ============================================
-- STEP 5: Add New Unique Constraints
-- ============================================

DO $$
BEGIN
  -- Unique constraint for page zones: (page_id, zone_index) where page_id IS NOT NULL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'zones' AND constraint_name = 'zones_page_unique'
  ) THEN
    CREATE UNIQUE INDEX zones_page_unique ON public.zones (page_id, zone_index)
      WHERE page_id IS NOT NULL;
    RAISE NOTICE '✓ Created unique index zones_page_unique';
  ELSE
    RAISE NOTICE 'zones_page_unique index already exists';
  END IF;

  -- Unique constraint for layout zones: (layout_id, zone_index) where layout_id IS NOT NULL
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'zones' AND constraint_name = 'zones_layout_unique'
  ) THEN
    CREATE UNIQUE INDEX zones_layout_unique ON public.zones (layout_id, zone_index)
      WHERE layout_id IS NOT NULL;
    RAISE NOTICE '✓ Created unique index zones_layout_unique';
  ELSE
    RAISE NOTICE 'zones_layout_unique index already exists';
  END IF;
END $$;

-- ============================================
-- STEP 6: Drop layout_zones Table
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'layout_zones') THEN
    DROP TABLE IF EXISTS public.layout_zones CASCADE;
    RAISE NOTICE '✓ Dropped layout_zones table';
  ELSE
    RAISE NOTICE 'layout_zones table does not exist, skipping';
  END IF;
END $$;

-- ============================================
-- STEP 7: Add Comments for Documentation
-- ============================================

COMMENT ON TABLE public.zones IS 'Unified table for zone definitions. Zones can belong to either a page (page_id set) or a layout template (layout_id set).';
COMMENT ON COLUMN public.zones.page_id IS 'Reference to page if this is a page zone. NULL if this is a layout template zone.';
COMMENT ON COLUMN public.zones.layout_id IS 'Reference to layout if this is a layout template zone. NULL if this is a page zone.';
COMMENT ON CONSTRAINT zones_owner_check ON public.zones IS 'Ensures zone belongs to exactly one owner: either a page OR a layout, never both or neither.';

-- ============================================
-- Migration Complete
-- ============================================

DO $$
DECLARE
  page_zone_count INT;
  layout_zone_count INT;
BEGIN
  -- Count final state
  SELECT COUNT(*) INTO page_zone_count FROM public.zones WHERE page_id IS NOT NULL;
  SELECT COUNT(*) INTO layout_zone_count FROM public.zones WHERE layout_id IS NOT NULL;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Final state:';
  RAISE NOTICE '  - Page zones: %', page_zone_count;
  RAISE NOTICE '  - Layout zones: %', layout_zone_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '  ✓ Renamed page_zones → zones';
  RAISE NOTICE '  ✓ Added layout_id column to zones';
  RAISE NOTICE '  ✓ Made page_id nullable';
  RAISE NOTICE '  ✓ Migrated layout_zones → zones';
  RAISE NOTICE '  ✓ Added polymorphic constraint (page XOR layout)';
  RAISE NOTICE '  ✓ Dropped layout_zones table';
  RAISE NOTICE '========================================';
END $$;
