-- ============================================
-- MIGRATION: Split Templates from Projects
-- ============================================
-- This migration separates the unified projects table into:
-- 1. public.templates (admin-managed blueprints)
-- 2. public.projects (user photobooks with optional template_id)
--
-- Run this in Supabase SQL Editor AFTER backing up your data.
-- ============================================

BEGIN;

-- ============================================
-- STEP 1: Create Templates Table
-- ============================================

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  preview_images JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  page_count INT CHECK (page_count IN (30, 40)),
  paper_size VARCHAR(10) CHECK (paper_size IN ('A4', 'A5', 'PDF Only')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON public.templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.templates(is_active) WHERE is_active = TRUE;

-- ============================================
-- STEP 2: Migrate Template Data
-- ============================================
-- Copy all template projects to templates table

INSERT INTO public.templates (
  id, slug, title, description, category_id, thumbnail_url, preview_images,
  is_featured, is_premium, is_active, page_count, paper_size, created_at, updated_at
)
SELECT
  id,
  COALESCE(slug, 'template-' || id), -- Ensure slug is not null
  title,
  description,
  category_id,
  thumbnail_url,
  preview_images,
  is_featured,
  is_premium,
  is_active,
  page_count,
  paper_size,
  created_at,
  updated_at
FROM public.projects
WHERE is_template = TRUE
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STEP 3: Update Pages Table
-- ============================================
-- Add template_id column to pages table
-- Pages will reference EITHER project_id OR template_id (mutually exclusive)

ALTER TABLE public.pages
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE;

-- Migrate template pages to use template_id instead of project_id
UPDATE public.pages
SET template_id = project_id
WHERE is_template = TRUE;

-- For template pages, clear project_id since they now use template_id
UPDATE public.pages
SET project_id = NULL
WHERE is_template = TRUE;

-- Make project_id nullable (since template pages don't have it)
ALTER TABLE public.pages ALTER COLUMN project_id DROP NOT NULL;

-- Add CHECK constraint: must have exactly one parent (project OR template)
ALTER TABLE public.pages
ADD CONSTRAINT pages_parent_check
CHECK (
  (project_id IS NOT NULL AND template_id IS NULL) OR
  (template_id IS NOT NULL AND project_id IS NULL)
);

-- Update foreign key to allow NULL for template pages
ALTER TABLE public.pages
DROP CONSTRAINT IF EXISTS pages_project_id_fkey;

ALTER TABLE public.pages
ADD CONSTRAINT pages_project_id_fkey
FOREIGN KEY (project_id)
REFERENCES public.projects(id)
ON DELETE CASCADE;

-- Create index for template_id
CREATE INDEX IF NOT EXISTS idx_pages_template_id ON public.pages(template_id);

-- ============================================
-- STEP 4: Add template_id to Projects
-- ============================================
-- Track which template a user project was created from

ALTER TABLE public.projects
ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES public.templates(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_projects_template_id ON public.projects(template_id);

COMMENT ON COLUMN public.projects.template_id IS
  'Optional reference to the template this project was created from (NULL for blank projects)';

-- ============================================
-- STEP 5: RLS Policies for Templates
-- ============================================

-- Enable RLS on templates
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Anyone can view active templates
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;
CREATE POLICY "Anyone can view active templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

-- Admins can manage all templates
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;
CREATE POLICY "Admins can manage templates"
  ON public.templates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- ============================================
-- STEP 6: Update RLS Policies for Projects
-- ============================================
-- Drop old policies that reference is_template column
-- Must do this BEFORE dropping the column
-- Drop both old and new policy names to handle all cases

-- Old policy names (from original schema)
DROP POLICY IF EXISTS "Users can view templates or own projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.projects;

-- New policy names (in case of partial migration)
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

-- Create new simplified policies (templates are now separate)
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ============================================
-- STEP 7: Update RLS Policies for Pages
-- ============================================
-- Drop old policies that reference is_template
-- Update policies to handle both project pages and template pages
-- Drop both old and new policy names to handle all cases

-- Old policy names (from original schema)
DROP POLICY IF EXISTS "Users can view template pages or own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can view own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can insert own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can create pages for their own projects" ON public.pages;
DROP POLICY IF EXISTS "Users can update own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update pages in their own projects" ON public.pages;
DROP POLICY IF EXISTS "Users can delete own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can delete pages from their own projects" ON public.pages;

-- New policy names (in case of partial migration)
DROP POLICY IF EXISTS "Users can view own or template pages" ON public.pages;
DROP POLICY IF EXISTS "Users can create own or admin template pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update own or admin template pages" ON public.pages;
DROP POLICY IF EXISTS "Users can delete own or admin template pages" ON public.pages;

-- View: Users can view their own project pages OR template pages
CREATE POLICY "Users can view own or template pages"
  ON public.pages FOR SELECT
  TO authenticated
  USING (
    -- Template pages are publicly viewable
    (template_id IS NOT NULL) OR
    -- User can view their own project pages
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pages.project_id
      AND projects.user_id = auth.uid()
    ))
  );

-- Insert: Users can create pages for their own projects, admins for templates
CREATE POLICY "Users can create own or admin template pages"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Users can create pages for their own projects
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pages.project_id
      AND projects.user_id = auth.uid()
    )) OR
    -- Admins can create template pages
    (template_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    ))
  );

-- Update: Users can update their own project pages, admins can update template pages
CREATE POLICY "Users can update own or admin template pages"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (
    -- Users can update pages in their own projects
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pages.project_id
      AND projects.user_id = auth.uid()
    )) OR
    -- Admins can update template pages
    (template_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    ))
  );

-- Delete: Same as update
CREATE POLICY "Users can delete own or admin template pages"
  ON public.pages FOR DELETE
  TO authenticated
  USING (
    -- Users can delete pages from their own projects
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = pages.project_id
      AND projects.user_id = auth.uid()
    )) OR
    -- Admins can delete template pages
    (template_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    ))
  );

-- ============================================
-- STEP 8: Update RLS Policies for Page Zones
-- ============================================
-- Update to handle both project zones and template zones
-- Drop both old and new policy names to handle all cases

-- View
DROP POLICY IF EXISTS "Users can view own page zones" ON public.page_zones;
DROP POLICY IF EXISTS "Users can view own or template page zones" ON public.page_zones;
CREATE POLICY "Users can view own or template page zones"
  ON public.page_zones FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = page_zones.page_id
    AND (
      -- Template pages are viewable
      pages.template_id IS NOT NULL OR
      -- User's own project pages
      (pages.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = pages.project_id
        AND projects.user_id = auth.uid()
      ))
    )
  ));

-- Insert
DROP POLICY IF EXISTS "Users can insert own page zones" ON public.page_zones;
DROP POLICY IF EXISTS "Users can insert own or admin template page zones" ON public.page_zones;
CREATE POLICY "Users can insert own or admin template page zones"
  ON public.page_zones FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = page_zones.page_id
    AND (
      -- Users can add zones to their own project pages
      (pages.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = pages.project_id
        AND projects.user_id = auth.uid()
      )) OR
      -- Admins can add zones to template pages
      (pages.template_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
      ))
    )
  ));

-- Update
DROP POLICY IF EXISTS "Users can update own page zones" ON public.page_zones;
DROP POLICY IF EXISTS "Users can update own or admin template page zones" ON public.page_zones;
CREATE POLICY "Users can update own or admin template page zones"
  ON public.page_zones FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = page_zones.page_id
    AND (
      (pages.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = pages.project_id
        AND projects.user_id = auth.uid()
      )) OR
      (pages.template_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
      ))
    )
  ));

-- Delete
DROP POLICY IF EXISTS "Users can delete own page zones" ON public.page_zones;
DROP POLICY IF EXISTS "Users can delete own or admin template page zones" ON public.page_zones;
CREATE POLICY "Users can delete own or admin template page zones"
  ON public.page_zones FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = page_zones.page_id
    AND (
      (pages.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = pages.project_id
        AND projects.user_id = auth.uid()
      )) OR
      (pages.template_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
      ))
    )
  ));

-- ============================================
-- STEP 9: Update RLS Policies for Elements
-- ============================================
-- Update to handle both project elements and template elements
-- Drop both old and new policy names to handle all cases

-- View
DROP POLICY IF EXISTS "Users can view own elements" ON public.elements;
DROP POLICY IF EXISTS "Users can view own or template elements" ON public.elements;
CREATE POLICY "Users can view own or template elements"
  ON public.elements FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = elements.page_id
    AND (
      pages.template_id IS NOT NULL OR
      (pages.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = pages.project_id
        AND projects.user_id = auth.uid()
      ))
    )
  ));

-- Insert
DROP POLICY IF EXISTS "Users can insert own elements" ON public.elements;
DROP POLICY IF EXISTS "Users can insert own or admin template elements" ON public.elements;
CREATE POLICY "Users can insert own or admin template elements"
  ON public.elements FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = elements.page_id
    AND (
      (pages.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = pages.project_id
        AND projects.user_id = auth.uid()
      )) OR
      (pages.template_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
      ))
    )
  ));

-- Update
DROP POLICY IF EXISTS "Users can update own elements" ON public.elements;
DROP POLICY IF EXISTS "Users can update own or admin template elements" ON public.elements;
CREATE POLICY "Users can update own or admin template elements"
  ON public.elements FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = elements.page_id
    AND (
      (pages.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = pages.project_id
        AND projects.user_id = auth.uid()
      )) OR
      (pages.template_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
      ))
    )
  ));

-- Delete
DROP POLICY IF EXISTS "Users can delete own elements" ON public.elements;
DROP POLICY IF EXISTS "Users can delete own or admin template elements" ON public.elements;
CREATE POLICY "Users can delete own or admin template elements"
  ON public.elements FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.pages
    WHERE pages.id = elements.page_id
    AND (
      (pages.project_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.projects
        WHERE projects.id = pages.project_id
        AND projects.user_id = auth.uid()
      )) OR
      (pages.template_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
      ))
    )
  ));

-- ============================================
-- STEP 10: Add Triggers for Templates
-- ============================================

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_template_updated ON public.templates;
CREATE TRIGGER on_template_updated
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- STEP 11: Remove Redundant is_template Column from Pages
-- ============================================
-- The is_template column is now redundant, we can derive it from template_id
-- Remove it to maintain single source of truth

ALTER TABLE public.pages DROP COLUMN IF EXISTS is_template;

-- ============================================
-- STEP 12: Clean Up Projects Table
-- ============================================
-- Now that all policies have been updated, we can safely:
-- 1. Delete template records from projects (they're now in templates table)
-- 2. Drop is_template column
-- 3. Drop template-specific columns

-- Delete template records (already copied to templates table)
DELETE FROM public.projects WHERE is_template = TRUE;

-- Drop is_template column (no longer needed)
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_template;

-- Drop template-specific columns (no longer used by projects)
ALTER TABLE public.projects DROP COLUMN IF EXISTS slug;
ALTER TABLE public.projects DROP COLUMN IF EXISTS description;
ALTER TABLE public.projects DROP COLUMN IF EXISTS category_id;
ALTER TABLE public.projects DROP COLUMN IF EXISTS thumbnail_url;
ALTER TABLE public.projects DROP COLUMN IF EXISTS preview_images;
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_featured;
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_premium;
ALTER TABLE public.projects DROP COLUMN IF EXISTS is_active;

-- Make user_id NOT NULL (all remaining projects must have an owner)
ALTER TABLE public.projects ALTER COLUMN user_id SET NOT NULL;

-- ============================================
-- VERIFICATION
-- ============================================

-- Count templates migrated
DO $$
DECLARE
  template_count INT;
  project_count INT;
BEGIN
  SELECT COUNT(*) INTO template_count FROM public.templates;
  SELECT COUNT(*) INTO project_count FROM public.projects;

  RAISE NOTICE 'Migration complete:';
  RAISE NOTICE '  - Templates: %', template_count;
  RAISE NOTICE '  - Projects: %', project_count;
END $$;

COMMIT;

-- ============================================
-- ROLLBACK INSTRUCTIONS
-- ============================================
-- If something goes wrong, rollback with:
-- ROLLBACK;
--
-- To fully reverse this migration, you would need to:
-- 1. Merge templates back into projects with is_template = TRUE
-- 2. Remove template_id from projects and pages
-- 3. Restore original RLS policies
-- ============================================
