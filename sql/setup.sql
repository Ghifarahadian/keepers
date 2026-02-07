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
  address TEXT,
  postal_code VARCHAR(20),
  phone_number VARCHAR(30),
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

  -- Text-specific fields
  text_content TEXT,
  font_family VARCHAR(100),
  font_size INT,
  font_color VARCHAR(20),
  font_weight VARCHAR(20) DEFAULT 'normal',
  font_style VARCHAR(20) DEFAULT 'normal',
  text_align VARCHAR(20) DEFAULT 'left',
  text_decoration VARCHAR(20) DEFAULT 'none',

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

-- ============================================
-- MIGRATION: Add text styling columns to elements
-- ============================================
-- Run this if you have an existing database without these columns
-- These statements are safe to run multiple times (IF NOT EXISTS)

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

-- ============================================
-- SECTION 9: ADMIN FLAG ON PROFILES
-- ============================================
-- Add is_admin column to profiles for admin access control

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'profiles' AND column_name = 'is_admin') THEN
    ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Index for admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

-- ============================================
-- SECTION 10: LAYOUTS TABLE
-- ============================================
-- Stores layout templates (migrated from types/editor.ts LAYOUTS array)

CREATE TABLE IF NOT EXISTS public.layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  thumbnail_url TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_layouts_slug ON public.layouts(slug);
CREATE INDEX IF NOT EXISTS idx_layouts_active ON public.layouts(is_active, sort_order);

-- Enable RLS
ALTER TABLE public.layouts ENABLE ROW LEVEL SECURITY;

-- Everyone can read active layouts
DROP POLICY IF EXISTS "Anyone can view active layouts" ON public.layouts;
CREATE POLICY "Anyone can view active layouts"
  ON public.layouts FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage layouts (all operations)
DROP POLICY IF EXISTS "Admins can manage layouts" ON public.layouts;
CREATE POLICY "Admins can manage layouts"
  ON public.layouts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_layout_updated ON public.layouts;
CREATE TRIGGER on_layout_updated
  BEFORE UPDATE ON public.layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 11: LAYOUT ZONES TABLE
-- ============================================
-- Stores zone configurations for each layout template

CREATE TABLE IF NOT EXISTS public.layout_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id UUID NOT NULL REFERENCES public.layouts(id) ON DELETE CASCADE,
  zone_index INT NOT NULL,
  zone_type VARCHAR(10) NOT NULL DEFAULT 'photo' CHECK (zone_type IN ('photo', 'text')),
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(layout_id, zone_index)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_layout_zones_layout_id ON public.layout_zones(layout_id);

-- Enable RLS
ALTER TABLE public.layout_zones ENABLE ROW LEVEL SECURITY;

-- Everyone can view layout zones for active layouts
DROP POLICY IF EXISTS "Anyone can view layout zones" ON public.layout_zones;
CREATE POLICY "Anyone can view layout zones"
  ON public.layout_zones FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.layouts
    WHERE layouts.id = layout_zones.layout_id AND layouts.is_active = TRUE
  ));

-- Admins can manage layout zones
DROP POLICY IF EXISTS "Admins can manage layout zones" ON public.layout_zones;
CREATE POLICY "Admins can manage layout zones"
  ON public.layout_zones FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_layout_zone_updated ON public.layout_zones;
CREATE TRIGGER on_layout_zone_updated
  BEFORE UPDATE ON public.layout_zones
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 12: TEMPLATE CATEGORIES TABLE
-- ============================================
-- Stores categories for organizing templates

CREATE TABLE IF NOT EXISTS public.template_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_template_categories_slug ON public.template_categories(slug);
CREATE INDEX IF NOT EXISTS idx_template_categories_active ON public.template_categories(is_active, sort_order);

-- Enable RLS
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;

-- Everyone can view active categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.template_categories;
CREATE POLICY "Anyone can view active categories"
  ON public.template_categories FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage categories
DROP POLICY IF EXISTS "Admins can manage categories" ON public.template_categories;
CREATE POLICY "Admins can manage categories"
  ON public.template_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_template_category_updated ON public.template_categories;
CREATE TRIGGER on_template_category_updated
  BEFORE UPDATE ON public.template_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 13: TEMPLATES TABLE
-- ============================================
-- Stores photobook templates

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
  thumbnail_url TEXT,
  preview_images JSONB DEFAULT '[]',
  page_count INT NOT NULL DEFAULT 10,
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON public.templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.templates(is_active, sort_order);

-- Enable RLS
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Everyone can view active templates
DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;
CREATE POLICY "Anyone can view active templates"
  ON public.templates FOR SELECT
  USING (is_active = TRUE);

-- Admins can manage templates
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;
CREATE POLICY "Admins can manage templates"
  ON public.templates FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_template_updated ON public.templates;
CREATE TRIGGER on_template_updated
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 14: TEMPLATE PAGES TABLE
-- ============================================
-- Stores the page structure for each template

CREATE TABLE IF NOT EXISTS public.template_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.templates(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  layout_id UUID REFERENCES public.layouts(id) ON DELETE SET NULL,
  title VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(template_id, page_number)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_template_pages_template ON public.template_pages(template_id, page_number);

-- Enable RLS
ALTER TABLE public.template_pages ENABLE ROW LEVEL SECURITY;

-- Everyone can view template pages for active templates
DROP POLICY IF EXISTS "Anyone can view template pages" ON public.template_pages;
CREATE POLICY "Anyone can view template pages"
  ON public.template_pages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.templates
    WHERE templates.id = template_pages.template_id AND templates.is_active = TRUE
  ));

-- Admins can manage template pages
DROP POLICY IF EXISTS "Admins can manage template pages" ON public.template_pages;
CREATE POLICY "Admins can manage template pages"
  ON public.template_pages FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_template_page_updated ON public.template_pages;
CREATE TRIGGER on_template_page_updated
  BEFORE UPDATE ON public.template_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 15: TEMPLATE ELEMENTS TABLE
-- ============================================
-- Stores pre-placed elements (text, decorations) on template pages

CREATE TABLE IF NOT EXISTS public.template_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_page_id UUID NOT NULL REFERENCES public.template_pages(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('text', 'decoration')),

  -- Text element fields
  text_content TEXT,
  font_family VARCHAR(100),
  font_size INT,
  font_color VARCHAR(20),
  font_weight VARCHAR(20) DEFAULT 'normal',
  font_style VARCHAR(20) DEFAULT 'normal',
  text_align VARCHAR(20) DEFAULT 'left',

  -- Positioning (percentages 0-100)
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  rotation FLOAT DEFAULT 0,
  z_index INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_template_elements_page ON public.template_elements(template_page_id);

-- Enable RLS
ALTER TABLE public.template_elements ENABLE ROW LEVEL SECURITY;

-- Everyone can view template elements for active templates
DROP POLICY IF EXISTS "Anyone can view template elements" ON public.template_elements;
CREATE POLICY "Anyone can view template elements"
  ON public.template_elements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.template_pages tp
    JOIN public.templates t ON t.id = tp.template_id
    WHERE tp.id = template_elements.template_page_id AND t.is_active = TRUE
  ));

-- Admins can manage template elements
DROP POLICY IF EXISTS "Admins can manage template elements" ON public.template_elements;
CREATE POLICY "Admins can manage template elements"
  ON public.template_elements FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- Trigger for updated_at
DROP TRIGGER IF EXISTS on_template_element_updated ON public.template_elements;
CREATE TRIGGER on_template_element_updated
  BEFORE UPDATE ON public.template_elements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 16: TEMPLATE ASSETS STORAGE BUCKET
-- ============================================
-- Public bucket for template thumbnails and preview images

INSERT INTO storage.buckets (id, name, public)
VALUES ('template-assets', 'template-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for template-assets bucket
DROP POLICY IF EXISTS "Anyone can view template assets" ON storage.objects;
CREATE POLICY "Anyone can view template assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'template-assets');

DROP POLICY IF EXISTS "Admins can upload template assets" ON storage.objects;
CREATE POLICY "Admins can upload template assets"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'template-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  )
);

DROP POLICY IF EXISTS "Admins can update template assets" ON storage.objects;
CREATE POLICY "Admins can update template assets"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'template-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  )
);

DROP POLICY IF EXISTS "Admins can delete template assets" ON storage.objects;
CREATE POLICY "Admins can delete template assets"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'template-assets'
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  )
);

-- ============================================
-- SECTION 17: SEED SYSTEM LAYOUTS
-- ============================================
-- Migrate existing layouts from types/editor.ts LAYOUTS array

-- Insert layouts (skip if already exists)
INSERT INTO public.layouts (slug, name, description, is_system, sort_order) VALUES
  ('blank', 'Blank', 'Empty page with no photo zones', true, 0),
  ('single', 'Single', 'One large photo centered', true, 1),
  ('double', 'Double', 'Two photos side by side', true, 2),
  ('triple', 'Triple', 'One large photo with two smaller ones', true, 3),
  ('grid-4', 'Grid 4', '2x2 grid of equal photos', true, 4),
  ('grid-6', 'Grid 6', '2x3 grid of equal photos', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- Insert layout zones for each layout
-- Single layout (1 zone)
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 10, 10, 80, 80 FROM public.layouts WHERE slug = 'single'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

-- Double layout (2 zones)
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 5, 10, 42.5, 80 FROM public.layouts WHERE slug = 'double'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 1, 'photo', 52.5, 10, 42.5, 80 FROM public.layouts WHERE slug = 'double'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

-- Triple layout (3 zones)
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 5, 10, 60, 80 FROM public.layouts WHERE slug = 'triple'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 1, 'photo', 70, 10, 25, 37.5 FROM public.layouts WHERE slug = 'triple'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 2, 'photo', 70, 52.5, 25, 37.5 FROM public.layouts WHERE slug = 'triple'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

-- Grid 4 layout (4 zones)
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 5, 5, 42.5, 42.5 FROM public.layouts WHERE slug = 'grid-4'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 1, 'photo', 52.5, 5, 42.5, 42.5 FROM public.layouts WHERE slug = 'grid-4'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 2, 'photo', 5, 52.5, 42.5, 42.5 FROM public.layouts WHERE slug = 'grid-4'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 3, 'photo', 52.5, 52.5, 42.5, 42.5 FROM public.layouts WHERE slug = 'grid-4'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

-- Grid 6 layout (6 zones)
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 0, 'photo', 5, 3, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 1, 'photo', 52.5, 3, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 2, 'photo', 5, 36, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 3, 'photo', 52.5, 36, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 4, 'photo', 5, 69, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;
INSERT INTO public.layout_zones (layout_id, zone_index, zone_type, position_x, position_y, width, height)
SELECT id, 5, 'photo', 52.5, 69, 42.5, 28 FROM public.layouts WHERE slug = 'grid-6'
ON CONFLICT (layout_id, zone_index) DO NOTHING;

-- ============================================
-- SECTION 18: SEED TEMPLATE CATEGORIES
-- ============================================
-- Insert default template categories

INSERT INTO public.template_categories (slug, name, description, icon, sort_order) VALUES
  ('vacation', 'Vacation', 'Travel and adventure photobooks', 'Plane', 1),
  ('wedding', 'Wedding', 'Wedding and engagement memories', 'Heart', 2),
  ('baby', 'Baby & Family', 'Baby milestones and family moments', 'Baby', 3),
  ('birthday', 'Birthday', 'Birthday celebrations', 'Cake', 4),
  ('graduation', 'Graduation', 'Academic achievements', 'GraduationCap', 5),
  ('portfolio', 'Portfolio', 'Professional portfolios', 'Briefcase', 6),
  ('general', 'General', 'Multipurpose templates', 'Book', 7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- MIGRATION: Add zone_type column to layout_zones
-- ============================================
-- Run this if you have an existing database without the zone_type column
-- This statement is safe to run multiple times (IF NOT EXISTS)

DO $$
BEGIN
  -- Add zone_type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'layout_zones' AND column_name = 'zone_type') THEN
    ALTER TABLE public.layout_zones
    ADD COLUMN zone_type VARCHAR(10) NOT NULL DEFAULT 'photo';

    -- Add check constraint
    ALTER TABLE public.layout_zones
    ADD CONSTRAINT zone_type_check CHECK (zone_type IN ('photo', 'text'));

    -- Update existing zones to have 'photo' type (already handled by default)
    UPDATE public.layout_zones SET zone_type = 'photo' WHERE zone_type IS NULL;
  END IF;
END $$;

-- ============================================
-- SECTION 19: VOUCHERS TABLE
-- ============================================
-- Stores voucher codes for redemption

CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  is_redeemed BOOLEAN DEFAULT FALSE,
  redeemed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_redeemed ON public.vouchers(is_redeemed) WHERE is_redeemed = FALSE;

-- Enable RLS
ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read vouchers (to check if code exists)
DROP POLICY IF EXISTS "Authenticated users can view vouchers" ON public.vouchers;
CREATE POLICY "Authenticated users can view vouchers"
  ON public.vouchers FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update unredeemed vouchers (to redeem them)
DROP POLICY IF EXISTS "Authenticated users can redeem vouchers" ON public.vouchers;
CREATE POLICY "Authenticated users can redeem vouchers"
  ON public.vouchers FOR UPDATE
  TO authenticated
  USING (is_redeemed = FALSE);

-- Admins can manage vouchers (insert, delete)
DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.vouchers;
CREATE POLICY "Admins can manage vouchers"
  ON public.vouchers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- ============================================
-- SECTION 20: VOUCHER LIFECYCLE & PROJECT CONFIGURATION
-- ============================================
-- Enhances voucher system with three-state lifecycle and adds project configuration

-- Add project configuration columns
DO $$
BEGIN
  -- Add page_count column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'projects' AND column_name = 'page_count') THEN
    ALTER TABLE public.projects ADD COLUMN page_count INT CHECK (page_count IN (30, 40)) DEFAULT 30;
  END IF;

  -- Add paper_size column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'projects' AND column_name = 'paper_size') THEN
    ALTER TABLE public.projects ADD COLUMN paper_size VARCHAR(10) CHECK (paper_size IN ('A4', 'A5', 'PDF Only')) DEFAULT 'A4';
  END IF;

  -- Add voucher_code column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'projects' AND column_name = 'voucher_code') THEN
    ALTER TABLE public.projects ADD COLUMN voucher_code VARCHAR(50);
  END IF;
END $$;

-- Add index for voucher_code lookups
CREATE INDEX IF NOT EXISTS idx_projects_voucher_code ON public.projects(voucher_code);

-- Add voucher lifecycle columns
DO $$
BEGIN
  -- Add status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vouchers' AND column_name = 'status') THEN
    ALTER TABLE public.vouchers
      ADD COLUMN status VARCHAR(20) DEFAULT 'not_redeemed'
        CHECK (status IN ('not_redeemed', 'being_redeemed', 'fully_redeemed'));
  END IF;

  -- Add page_count column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vouchers' AND column_name = 'page_count') THEN
    ALTER TABLE public.vouchers ADD COLUMN page_count INT CHECK (page_count IN (30, 40));
  END IF;

  -- Add paper_size column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vouchers' AND column_name = 'paper_size') THEN
    ALTER TABLE public.vouchers ADD COLUMN paper_size VARCHAR(10) CHECK (paper_size IN ('A4', 'A5', 'PDF Only'));
  END IF;

  -- Add project_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'vouchers' AND column_name = 'project_id') THEN
    ALTER TABLE public.vouchers ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Migrate existing voucher data from is_redeemed to status
-- This is safe to run multiple times
UPDATE public.vouchers
SET status = CASE
  WHEN is_redeemed = TRUE THEN 'fully_redeemed'
  ELSE 'not_redeemed'
END
WHERE status IS NULL OR status = 'not_redeemed';

-- Add indexes for voucher queries
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON public.vouchers(status);
CREATE INDEX IF NOT EXISTS idx_vouchers_project_id ON public.vouchers(project_id);

-- Update RLS policy for voucher updates (now uses status instead of is_redeemed)
DROP POLICY IF EXISTS "Authenticated users can redeem vouchers" ON public.vouchers;
CREATE POLICY "Authenticated users can redeem vouchers"
  ON public.vouchers FOR UPDATE
  TO authenticated
  USING (status IN ('not_redeemed', 'being_redeemed'));

-- Comments for documentation
COMMENT ON COLUMN public.projects.page_count IS 'Number of pages in photobook (30 or 40)';
COMMENT ON COLUMN public.projects.paper_size IS 'Paper size of photobook (A4 or A5)';
COMMENT ON COLUMN public.projects.voucher_code IS 'Voucher code used for this project (if any)';
COMMENT ON COLUMN public.vouchers.status IS 'Voucher lifecycle status: not_redeemed (available) -> being_redeemed (assigned to draft project) -> fully_redeemed (project completed)';
COMMENT ON COLUMN public.vouchers.page_count IS 'Number of pages this voucher is valid for (30 or 40)';
COMMENT ON COLUMN public.vouchers.paper_size IS 'Paper size this voucher is valid for (A4 or A5)';
COMMENT ON COLUMN public.vouchers.project_id IS 'Project this voucher is currently assigned to (null when not_redeemed or fully_redeemed without project link)';
