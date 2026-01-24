-- ============================================
-- KEEPERS - Complete Database Setup
-- ============================================
-- This file sets up the entire database from scratch.
-- Run this in Supabase SQL Editor to initialize everything.
--
-- Prerequisites:
-- - A Supabase project with auth enabled
--
-- What this creates:
-- 1. Profiles table (user data)
-- 2. Waitlist table (email signups)
-- 3. Projects table (photobook projects)
-- 4. Pages table (pages within projects)
-- 5. Page zones table (customizable layout zones)
-- 6. Elements table (photos/text on pages)
-- 7. Storage bucket for project photos
-- 8. All necessary triggers, functions, and RLS policies
--
-- This script is idempotent - safe to run multiple times.
-- ============================================

-- ============================================
-- SECTION 1: CORE FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp (used by multiple tables)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 2: PROFILES TABLE
-- ============================================
-- Stores custom user data linked to auth.users

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies (drop first to make idempotent)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- SECTION 3: WAITLIST TABLE
-- ============================================
-- Stores email signups for the coming soon page

CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  unsubscribed BOOLEAN DEFAULT FALSE,
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_email UNIQUE (email)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_unsubscribed ON public.waitlist(unsubscribed) WHERE unsubscribed = FALSE;

-- Disable RLS for public signups (no auth required)
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- Grant INSERT to anon and authenticated roles
GRANT INSERT ON public.waitlist TO anon, authenticated;

-- Trigger for updated_at
DROP TRIGGER IF EXISTS handle_waitlist_updated_at ON public.waitlist;
CREATE TRIGGER handle_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- SECTION 4: PROJECTS TABLE
-- ============================================
-- Stores photobook projects

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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_last_edited ON public.projects(user_id, last_edited_at DESC);

-- Enable RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (auth.uid() = user_id);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_project_updated ON public.projects;
CREATE TRIGGER on_project_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 5: PAGES TABLE
-- ============================================
-- Stores pages within projects

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
DROP POLICY IF EXISTS "Users can view own pages" ON public.pages;
CREATE POLICY "Users can view own pages"
  ON public.pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own pages" ON public.pages;
CREATE POLICY "Users can insert own pages"
  ON public.pages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own pages" ON public.pages;
CREATE POLICY "Users can update own pages"
  ON public.pages FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own pages" ON public.pages;
CREATE POLICY "Users can delete own pages"
  ON public.pages FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_page_updated ON public.pages;
CREATE TRIGGER on_page_updated
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update project's last_edited_at when pages change
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

-- ============================================
-- SECTION 6: PAGE ZONES TABLE
-- ============================================
-- Stores customizable zones for each page (initialized from layout templates)

CREATE TABLE IF NOT EXISTS public.page_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  zone_index INT NOT NULL,
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(page_id, zone_index)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_page_zones_page_id ON public.page_zones(page_id);

-- Enable RLS
ALTER TABLE public.page_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from page -> project ownership)
DROP POLICY IF EXISTS "Users can view own page zones" ON public.page_zones;
CREATE POLICY "Users can view own page zones"
  ON public.page_zones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = page_zones.page_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own page zones" ON public.page_zones;
CREATE POLICY "Users can insert own page zones"
  ON public.page_zones FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = page_zones.page_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own page zones" ON public.page_zones;
CREATE POLICY "Users can update own page zones"
  ON public.page_zones FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = page_zones.page_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own page zones" ON public.page_zones;
CREATE POLICY "Users can delete own page zones"
  ON public.page_zones FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = page_zones.page_id
    AND projects.user_id = auth.uid()
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_page_zone_updated ON public.page_zones;
CREATE TRIGGER on_page_zone_updated
  BEFORE UPDATE ON public.page_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Comments
COMMENT ON TABLE public.page_zones IS 'Stores customizable zones for each page, initialized from layout templates';
COMMENT ON COLUMN public.page_zones.zone_index IS 'Index of the zone within the page (0-based)';
COMMENT ON COLUMN public.page_zones.position_x IS 'X position as percentage of canvas (0-100)';
COMMENT ON COLUMN public.page_zones.position_y IS 'Y position as percentage of canvas (0-100)';
COMMENT ON COLUMN public.page_zones.width IS 'Width as percentage of canvas (0-100)';
COMMENT ON COLUMN public.page_zones.height IS 'Height as percentage of canvas (0-100)';

-- ============================================
-- SECTION 7: ELEMENTS TABLE
-- ============================================
-- Stores photos and text elements on pages

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

  -- Zone assignment (null for free-floating elements)
  zone_index INT DEFAULT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_elements_page_id ON public.elements(page_id);
CREATE INDEX IF NOT EXISTS idx_elements_z_index ON public.elements(page_id, z_index);
CREATE INDEX IF NOT EXISTS idx_elements_zone_index ON public.elements(page_id, zone_index);

-- Enable RLS
ALTER TABLE public.elements ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from page -> project ownership)
DROP POLICY IF EXISTS "Users can view own elements" ON public.elements;
CREATE POLICY "Users can view own elements"
  ON public.elements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = elements.page_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own elements" ON public.elements;
CREATE POLICY "Users can insert own elements"
  ON public.elements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = elements.page_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own elements" ON public.elements;
CREATE POLICY "Users can update own elements"
  ON public.elements FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = elements.page_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own elements" ON public.elements;
CREATE POLICY "Users can delete own elements"
  ON public.elements FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.pages
    JOIN public.projects ON projects.id = pages.project_id
    WHERE pages.id = elements.page_id
    AND projects.user_id = auth.uid()
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_element_updated ON public.elements;
CREATE TRIGGER on_element_updated
  BEFORE UPDATE ON public.elements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Function to update project's last_edited_at when elements change
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

-- Comment
COMMENT ON COLUMN public.elements.zone_index IS 'Index of the layout zone this element belongs to (null for free-floating elements)';

-- ============================================
-- SECTION 8: STORAGE BUCKET
-- ============================================
-- Create storage bucket for project photos

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can view own photos" ON storage.objects;
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
CREATE POLICY "Users can update own photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'project-photos'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

-- ============================================
-- SETUP COMPLETE
-- ============================================
-- Verify tables were created:
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'waitlist', 'projects', 'pages', 'page_zones', 'elements')
ORDER BY table_name;

-- Verify storage bucket:
SELECT id, name, public FROM storage.buckets WHERE name = 'project-photos';
