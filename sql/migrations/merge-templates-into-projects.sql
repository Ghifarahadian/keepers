-- ============================================
-- Migration: Merge Templates into Projects
-- ============================================
-- Date: 2026-02-08
-- Purpose: Simplify schema by merging templates/template_pages into projects/pages
--
-- Changes:
-- 1. Add is_template flag to projects and pages tables
-- 2. Add template-specific columns to projects
-- 3. Migrate all templates → projects
-- 4. Migrate all template_pages → pages
-- 5. Copy zones from layouts to migrated template pages
-- 6. Remove layout_id from pages (convert to zone-copy model)
-- 7. Update RLS policies for template/project access
-- 8. Drop templates and template_pages tables

-- ============================================
-- STEP 1: Add is_template Columns
-- ============================================

DO $$
BEGIN
  -- Add is_template to projects
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_template'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_template column to projects';
  ELSE
    RAISE NOTICE 'is_template column already exists in projects, skipping';
  END IF;

  -- Add is_template to pages
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'is_template'
  ) THEN
    ALTER TABLE public.pages ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_template column to pages';
  ELSE
    RAISE NOTICE 'is_template column already exists in pages, skipping';
  END IF;
END $$;

-- ============================================
-- STEP 2: Add Template-Specific Columns to Projects
-- ============================================

DO $$
BEGIN
  -- slug (for template URLs like /templates/vacation-memories)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN slug VARCHAR(100) UNIQUE;
    RAISE NOTICE 'Added slug column to projects';
  END IF;

  -- description
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'description'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN description TEXT;
    RAISE NOTICE 'Added description column to projects';
  END IF;

  -- category_id (references template_categories)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN category_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL;
    RAISE NOTICE 'Added category_id column to projects';
  END IF;

  -- thumbnail_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'thumbnail_url'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN thumbnail_url TEXT;
    RAISE NOTICE 'Added thumbnail_url column to projects';
  END IF;

  -- preview_images (JSON array of image URLs)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'preview_images'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN preview_images JSONB;
    RAISE NOTICE 'Added preview_images column to projects';
  END IF;

  -- is_featured (for homepage display)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_featured column to projects';
  END IF;

  -- is_premium (for paid templates)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_premium'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Added is_premium column to projects';
  END IF;

  -- is_active (visibility control)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE public.projects ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Added is_active column to projects';
  END IF;
END $$;

-- Allow user_id to be NULL for templates (templates aren't owned by specific users)
ALTER TABLE public.projects ALTER COLUMN user_id DROP NOT NULL;

-- ============================================
-- STEP 3: Migrate Templates → Projects
-- ============================================

DO $$
DECLARE
  template_count INT;
  deleted_count INT;
  migrated_count INT;
BEGIN
  -- Check if templates table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
    -- Delete templates with invalid page_count (must be 30 or 40)
    DELETE FROM public.templates
    WHERE page_count IS NOT NULL
      AND page_count NOT IN (30, 40);

    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    IF deleted_count > 0 THEN
      RAISE NOTICE 'Deleted % templates with invalid page_count (not 30 or 40)', deleted_count;
    END IF;

    -- Count templates to migrate
    SELECT COUNT(*) INTO template_count FROM public.templates;

    IF template_count > 0 THEN
      -- Migrate templates to projects
      INSERT INTO public.projects (
        id, user_id, title, is_template, slug, description,
        category_id, thumbnail_url, preview_images,
        is_featured, is_premium, is_active, page_count,
        created_at, updated_at
      )
      SELECT
        id,
        created_by AS user_id,
        name AS title,
        TRUE AS is_template,
        slug,
        description,
        category_id,
        thumbnail_url,
        preview_images,
        is_featured,
        is_premium,
        is_active,
        page_count,
        created_at,
        updated_at
      FROM public.templates
      ON CONFLICT (id) DO NOTHING; -- Skip if already migrated

      GET DIAGNOSTICS migrated_count = ROW_COUNT;
      RAISE NOTICE '✓ Migrated % templates to projects table', migrated_count;
    ELSE
      RAISE NOTICE 'No templates to migrate';
    END IF;
  ELSE
    RAISE NOTICE 'Templates table does not exist, skipping template migration';
  END IF;
END $$;

-- ============================================
-- STEP 4: Migrate Template Pages → Pages
-- ============================================

DO $$
DECLARE
  template_page_count INT;
  migrated_page_count INT;
BEGIN
  -- Check if template_pages table exists
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_pages') THEN
    -- Count template pages to migrate
    SELECT COUNT(*) INTO template_page_count FROM public.template_pages;

    IF template_page_count > 0 THEN
      -- Migrate template_pages to pages
      INSERT INTO public.pages (
        id, project_id, page_number, title, is_template,
        created_at, updated_at
      )
      SELECT
        id,
        template_id AS project_id,
        page_number,
        title,
        TRUE AS is_template,
        created_at,
        updated_at
      FROM public.template_pages
      ON CONFLICT (id) DO NOTHING; -- Skip if already migrated

      GET DIAGNOSTICS migrated_page_count = ROW_COUNT;
      RAISE NOTICE '✓ Migrated % template pages to pages table', migrated_page_count;
    ELSE
      RAISE NOTICE 'No template pages to migrate';
    END IF;
  ELSE
    RAISE NOTICE 'Template_pages table does not exist, skipping template page migration';
  END IF;
END $$;

-- ============================================
-- STEP 5: Create Zones for Migrated Template Pages
-- ============================================

DO $$
DECLARE
  zone_count INT;
BEGIN
  -- Check if template_pages table exists and has layout references
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_pages') THEN
    -- Copy zones from layouts to template pages (now in pages table)
    INSERT INTO public.page_zones (page_id, zone_index, position_x, position_y, width, height)
    SELECT
      tp.id AS page_id,
      lz.zone_index,
      lz.position_x,
      lz.position_y,
      lz.width,
      lz.height
    FROM public.template_pages tp
    JOIN public.layout_zones lz ON lz.layout_id = tp.layout_id
    WHERE tp.layout_id IS NOT NULL
    ON CONFLICT DO NOTHING; -- Skip if zones already exist

    GET DIAGNOSTICS zone_count = ROW_COUNT;
    RAISE NOTICE '✓ Created % zones for migrated template pages', zone_count;
  ELSE
    RAISE NOTICE 'Template_pages table does not exist, skipping zone creation';
  END IF;
END $$;

-- ============================================
-- STEP 6: Remove layout_id from Pages
-- ============================================

DO $$
DECLARE
  user_page_count INT;
  zone_count INT;
BEGIN
  -- Check if layout_id column exists in pages
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'pages' AND column_name = 'layout_id'
  ) THEN
    -- First, create zones for existing user pages that reference layouts
    -- This preserves the layout structure before we remove the reference
    INSERT INTO public.page_zones (page_id, zone_index, position_x, position_y, width, height)
    SELECT
      p.id AS page_id,
      lz.zone_index,
      lz.position_x,
      lz.position_y,
      lz.width,
      lz.height
    FROM public.pages p
    JOIN public.layouts l ON l.slug = p.layout_id
    JOIN public.layout_zones lz ON lz.layout_id = l.id
    WHERE p.layout_id IS NOT NULL
      AND p.layout_id != 'blank'
      AND p.is_template = FALSE -- Only user pages, not templates
      AND NOT EXISTS (
        SELECT 1 FROM public.page_zones pz WHERE pz.page_id = p.id
      )
    ON CONFLICT DO NOTHING;

    GET DIAGNOSTICS zone_count = ROW_COUNT;
    RAISE NOTICE '✓ Created % zones for existing user pages before removing layout_id', zone_count;

    -- Now drop the layout_id column
    ALTER TABLE public.pages DROP COLUMN layout_id;
    RAISE NOTICE '✓ Removed layout_id column from pages table';
  ELSE
    RAISE NOTICE 'layout_id column does not exist in pages, skipping';
  END IF;
END $$;

-- ============================================
-- STEP 7: Update RLS Policies
-- ============================================

-- Projects: Allow public read for templates, private for user projects
DROP POLICY IF EXISTS "Users can view their own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view templates or own projects" ON public.projects;

CREATE POLICY "Users can view templates or own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (is_template = TRUE OR user_id = auth.uid());

-- Projects: Allow users to insert their own projects
DROP POLICY IF EXISTS "Users can create their own projects" ON public.projects;
CREATE POLICY "Users can create their own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() AND is_template = FALSE);

-- Projects: Allow users to update their own projects
DROP POLICY IF EXISTS "Users can update their own projects" ON public.projects;
CREATE POLICY "Users can update their own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_template = FALSE);

-- Projects: Allow users to delete their own projects
DROP POLICY IF EXISTS "Users can delete their own projects" ON public.projects;
CREATE POLICY "Users can delete their own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_template = FALSE);

-- Projects: Allow admins to manage templates
DROP POLICY IF EXISTS "Admins can manage templates" ON public.projects;
CREATE POLICY "Admins can manage templates"
  ON public.projects FOR ALL
  TO authenticated
  USING (
    is_template = TRUE AND
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE)
  );

-- Pages: Allow public read for template pages, private for user pages
DROP POLICY IF EXISTS "Users can view their own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can view template pages or own pages" ON public.pages;

CREATE POLICY "Users can view template pages or own pages"
  ON public.pages FOR SELECT
  TO authenticated
  USING (
    is_template = TRUE OR
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pages.project_id
        AND (projects.is_template = TRUE OR projects.user_id = auth.uid())
    )
  );

-- Pages: Inherit other CRUD policies from projects
DROP POLICY IF EXISTS "Users can create pages for their own projects" ON public.pages;
CREATE POLICY "Users can create pages for their own projects"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pages.project_id
        AND (
          projects.user_id = auth.uid() OR
          (projects.is_template = TRUE AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
          ))
        )
    )
  );

DROP POLICY IF EXISTS "Users can update pages in their own projects" ON public.pages;
CREATE POLICY "Users can update pages in their own projects"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pages.project_id
        AND (
          projects.user_id = auth.uid() OR
          (projects.is_template = TRUE AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
          ))
        )
    )
  );

DROP POLICY IF EXISTS "Users can delete pages from their own projects" ON public.pages;
CREATE POLICY "Users can delete pages from their own projects"
  ON public.pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pages.project_id
        AND (
          projects.user_id = auth.uid() OR
          (projects.is_template = TRUE AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
          ))
        )
    )
  );

-- ============================================
-- STEP 8: Drop Old Tables
-- ============================================

DO $$
BEGIN
  -- Drop template_pages table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'template_pages') THEN
    DROP TABLE IF EXISTS public.template_pages CASCADE;
    RAISE NOTICE '✓ Dropped template_pages table';
  ELSE
    RAISE NOTICE 'Template_pages table does not exist, skipping';
  END IF;

  -- Drop templates table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'templates') THEN
    DROP TABLE IF EXISTS public.templates CASCADE;
    RAISE NOTICE '✓ Dropped templates table';
  ELSE
    RAISE NOTICE 'Templates table does not exist, skipping';
  END IF;
END $$;

-- ============================================
-- STEP 9: Add Comments for Documentation
-- ============================================

COMMENT ON COLUMN public.projects.is_template IS 'TRUE for templates (public, admin-created), FALSE for user projects (private)';
COMMENT ON COLUMN public.projects.slug IS 'URL-friendly slug for templates (e.g., vacation-memories). NULL for user projects.';
COMMENT ON COLUMN public.projects.description IS 'Template description shown in template browser. NULL for user projects.';
COMMENT ON COLUMN public.projects.category_id IS 'Template category for organization. NULL for user projects.';
COMMENT ON COLUMN public.projects.thumbnail_url IS 'Template thumbnail image URL. NULL for user projects.';
COMMENT ON COLUMN public.projects.preview_images IS 'JSON array of template preview image URLs. NULL for user projects.';
COMMENT ON COLUMN public.projects.is_featured IS 'TRUE if template should appear in featured section. Always FALSE for user projects.';
COMMENT ON COLUMN public.projects.is_premium IS 'TRUE if template requires payment. Always FALSE for user projects.';
COMMENT ON COLUMN public.projects.is_active IS 'Controls template visibility to users. Always TRUE for user projects.';

COMMENT ON COLUMN public.pages.is_template IS 'Inherited from parent project. TRUE for template pages, FALSE for user project pages.';

COMMENT ON TABLE public.projects IS 'Unified table for both user projects (is_template=FALSE) and admin templates (is_template=TRUE). Templates are public blueprints, projects are private user instances.';

-- ============================================
-- Migration Complete
-- ============================================

DO $$
DECLARE
  project_count INT;
  template_count INT;
  page_count INT;
  template_page_count INT;
BEGIN
  -- Count final state
  SELECT COUNT(*) INTO project_count FROM public.projects WHERE is_template = FALSE;
  SELECT COUNT(*) INTO template_count FROM public.projects WHERE is_template = TRUE;
  SELECT COUNT(*) INTO page_count FROM public.pages WHERE is_template = FALSE;
  SELECT COUNT(*) INTO template_page_count FROM public.pages WHERE is_template = TRUE;

  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Final state:';
  RAISE NOTICE '  - User projects: %', project_count;
  RAISE NOTICE '  - Templates: %', template_count;
  RAISE NOTICE '  - User pages: %', page_count;
  RAISE NOTICE '  - Template pages: %', template_page_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Changes applied:';
  RAISE NOTICE '  ✓ Merged templates into projects table';
  RAISE NOTICE '  ✓ Merged template_pages into pages table';
  RAISE NOTICE '  ✓ Removed layout_id from pages (zones copied)';
  RAISE NOTICE '  ✓ Updated RLS policies for template/project access';
  RAISE NOTICE '  ✓ Dropped old templates and template_pages tables';
  RAISE NOTICE '========================================';
END $$;
