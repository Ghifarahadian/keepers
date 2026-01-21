-- ============================================
-- KEEPERS Photobook Editor Database Schema
-- ============================================
-- This schema creates tables for projects, pages, and elements
-- with Row Level Security (RLS) policies to ensure users can only
-- access their own data.

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Project',
  cover_photo_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'archived')),
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_last_edited ON public.projects(user_id, last_edited_at DESC);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 2. PAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  layout_id VARCHAR(100) NOT NULL DEFAULT 'blank',
  title VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, page_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pages_project_id ON public.pages(project_id, page_number);

-- Enable RLS
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from project ownership)
CREATE POLICY "Users can view own pages"
  ON public.pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own pages"
  ON public.pages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own pages"
  ON public.pages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own pages"
  ON public.pages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

-- ============================================
-- 3. ELEMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('photo', 'text')),

  -- Photo-specific fields
  photo_url TEXT,
  photo_storage_path TEXT,

  -- Text-specific fields (for future use)
  text_content TEXT,
  font_family VARCHAR(100),
  font_size INT,
  font_color VARCHAR(7),

  -- Layout positioning (percentages for responsive design)
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  rotation FLOAT DEFAULT 0,
  z_index INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_elements_page_id ON public.elements(page_id);
CREATE INDEX IF NOT EXISTS idx_elements_z_index ON public.elements(page_id, z_index);

-- Enable RLS
ALTER TABLE public.elements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own elements"
  ON public.elements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = elements.page_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own elements"
  ON public.elements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = elements.page_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own elements"
  ON public.elements FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = elements.page_id
    AND projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own elements"
  ON public.elements FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = elements.page_id
    AND projects.user_id = auth.uid()
  ));

-- ============================================
-- 4. TRIGGER FUNCTIONS
-- ============================================

-- Create handle_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auto-update updated_at timestamp for projects
DROP TRIGGER IF EXISTS on_project_updated ON public.projects;
CREATE TRIGGER on_project_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-update updated_at timestamp for pages
DROP TRIGGER IF EXISTS on_page_updated ON public.pages;
CREATE TRIGGER on_page_updated
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-update updated_at timestamp for elements
DROP TRIGGER IF EXISTS on_element_updated ON public.elements;
CREATE TRIGGER on_element_updated
  BEFORE UPDATE ON public.elements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Auto-update project's last_edited_at when pages change
CREATE OR REPLACE FUNCTION update_project_last_edited()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET last_edited_at = NOW()
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_page_modified ON public.pages;
CREATE TRIGGER on_page_modified
  AFTER INSERT OR UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION update_project_last_edited();

-- Auto-update project's last_edited_at when elements change
CREATE OR REPLACE FUNCTION update_project_last_edited_from_element()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET last_edited_at = NOW()
  WHERE id IN (
    SELECT project_id FROM public.pages WHERE id = COALESCE(NEW.page_id, OLD.page_id)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_element_modified ON public.elements;
CREATE TRIGGER on_element_modified
  AFTER INSERT OR UPDATE OR DELETE ON public.elements
  FOR EACH ROW
  EXECUTE FUNCTION update_project_last_edited_from_element();

-- ============================================
-- 5. STORAGE BUCKET & POLICIES
-- ============================================

-- Note: Storage bucket creation and policies must be run separately
-- in the Supabase Dashboard or using the Supabase CLI.
--
-- To create the storage bucket:
-- 1. Go to Supabase Dashboard > Storage
-- 2. Click "New bucket"
-- 3. Name: project-photos
-- 4. Public: false (private bucket)
--
-- Then run these policies in the SQL Editor:

/*
-- Create storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Users can upload to their own folder
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can view own photos
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can update own photos
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- Storage policy: Users can delete own photos
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);
*/

-- ============================================
-- SCHEMA SETUP COMPLETE
-- ============================================
-- Next steps:
-- 1. Run this SQL in Supabase SQL Editor
-- 2. Create the storage bucket in Supabase Dashboard
-- 3. Run the storage policy SQL commands (uncommented section above)
-- 4. Verify tables and policies are created successfully
