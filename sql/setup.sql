-- ============================================
-- KEEPERS - Complete Database Setup
-- ============================================
-- Run this in Supabase SQL Editor to initialize everything.
-- This script is idempotent - safe to run multiple times.
-- ============================================

-- ============================================
-- SECTION 1: CORE FUNCTIONS
-- ============================================

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

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  email VARCHAR(255),
  address TEXT,
  postal_code VARCHAR(20),
  phone_number VARCHAR(30),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin) WHERE is_admin = TRUE;

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

DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
CREATE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_user_email();

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  DELETE FROM auth.users WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SECTION 3: WAITLIST TABLE
-- ============================================

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

ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;
GRANT INSERT ON public.waitlist TO anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_waitlist_unsubscribed ON public.waitlist(unsubscribed) WHERE unsubscribed = FALSE;

DROP TRIGGER IF EXISTS handle_waitlist_updated_at ON public.waitlist;
CREATE TRIGGER handle_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================
-- SECTION 4: TEMPLATE CATEGORIES TABLE
-- ============================================

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

ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_template_categories_slug ON public.template_categories(slug);
CREATE INDEX IF NOT EXISTS idx_template_categories_active ON public.template_categories(is_active, sort_order);

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.template_categories;
CREATE POLICY "Anyone can view active categories"
  ON public.template_categories FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage categories" ON public.template_categories;
CREATE POLICY "Admins can manage categories"
  ON public.template_categories FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

DROP TRIGGER IF EXISTS on_template_category_updated ON public.template_categories;
CREATE TRIGGER on_template_category_updated
  BEFORE UPDATE ON public.template_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 5: PROJECTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Untitled Project',
  cover_photo_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'processed', 'shipped', 'completed')),
  page_count INT CHECK (page_count IN (30, 40)),
  paper_size VARCHAR(10) CHECK (paper_size IN ('A4', 'A5', 'PDF Only')),
  voucher_code VARCHAR(50),
  last_edited_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_last_edited ON public.projects(user_id, last_edited_at DESC);

DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;
CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP TRIGGER IF EXISTS on_project_updated ON public.projects;
CREATE TRIGGER on_project_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 6: TEMPLATES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category_id UUID REFERENCES public.template_categories(id) ON DELETE SET NULL,
  project_id UUID UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  thumbnail_url TEXT,
  preview_images JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_templates_slug ON public.templates(slug);
CREATE INDEX IF NOT EXISTS idx_templates_category ON public.templates(category_id);
CREATE INDEX IF NOT EXISTS idx_templates_project ON public.templates(project_id);
CREATE INDEX IF NOT EXISTS idx_templates_featured ON public.templates(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_templates_active ON public.templates(is_active) WHERE is_active = TRUE;

DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;
CREATE POLICY "Anyone can view active templates"
  ON public.templates FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;
CREATE POLICY "Admins can manage templates"
  ON public.templates FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

DROP TRIGGER IF EXISTS on_template_updated ON public.templates;
CREATE TRIGGER on_template_updated
  BEFORE UPDATE ON public.templates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 7: PAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  title VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, page_number)
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_pages_project_id ON public.pages(project_id, page_number);

DROP POLICY IF EXISTS "Users can view own pages" ON public.pages;
CREATE POLICY "Users can view own pages"
  ON public.pages FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can create own pages" ON public.pages;
CREATE POLICY "Users can create own pages"
  ON public.pages FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own pages" ON public.pages;
CREATE POLICY "Users can update own pages"
  ON public.pages FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own pages" ON public.pages;
CREATE POLICY "Users can delete own pages"
  ON public.pages FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.projects
    WHERE projects.id = pages.project_id
    AND projects.user_id = auth.uid()
  ));

DROP TRIGGER IF EXISTS on_page_updated ON public.pages;
CREATE TRIGGER on_page_updated
  BEFORE UPDATE ON public.pages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

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
-- SECTION 8: LAYOUTS TABLE
-- ============================================

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

ALTER TABLE public.layouts ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_layouts_slug ON public.layouts(slug);
CREATE INDEX IF NOT EXISTS idx_layouts_active ON public.layouts(is_active, sort_order);

DROP POLICY IF EXISTS "Anyone can view active layouts" ON public.layouts;
CREATE POLICY "Anyone can view active layouts"
  ON public.layouts FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage layouts" ON public.layouts;
CREATE POLICY "Admins can manage layouts"
  ON public.layouts FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

DROP TRIGGER IF EXISTS on_layout_updated ON public.layouts;
CREATE TRIGGER on_layout_updated
  BEFORE UPDATE ON public.layouts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 9: ZONES TABLE (MERGED)
-- ============================================

CREATE TABLE IF NOT EXISTS public.zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_id UUID REFERENCES public.layouts(id) ON DELETE CASCADE,
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  zone_index INT NOT NULL,
  zone_type VARCHAR(10) NOT NULL DEFAULT 'photo' CHECK (zone_type IN ('photo', 'text')),
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (
    (layout_id IS NOT NULL AND page_id IS NULL) OR
    (page_id IS NOT NULL AND layout_id IS NULL)
  ),
  UNIQUE(layout_id, zone_index),
  UNIQUE(page_id, zone_index)
);

ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_zones_layout_id ON public.zones(layout_id) WHERE layout_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_zones_page_id ON public.zones(page_id) WHERE page_id IS NOT NULL;

DROP POLICY IF EXISTS "Anyone can view layout zones" ON public.zones;
CREATE POLICY "Anyone can view layout zones"
  ON public.zones FOR SELECT
  USING (
    (layout_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.layouts
      WHERE layouts.id = zones.layout_id AND layouts.is_active = TRUE
    )) OR
    (page_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.projects ON projects.id = pages.project_id
      WHERE pages.id = zones.page_id
      AND projects.user_id = auth.uid()
    ))
  );

DROP POLICY IF EXISTS "Admins can manage layout zones" ON public.zones;
CREATE POLICY "Admins can manage layout zones"
  ON public.zones FOR ALL
  USING (
    (layout_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
    )) OR
    (page_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.pages
      JOIN public.projects ON projects.id = pages.project_id
      WHERE pages.id = zones.page_id
      AND projects.user_id = auth.uid()
    ))
  );

DROP TRIGGER IF EXISTS on_zone_updated ON public.zones;
CREATE TRIGGER on_zone_updated
  BEFORE UPDATE ON public.zones
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- SECTION 10: ELEMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id UUID NOT NULL UNIQUE REFERENCES public.zones(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('photo', 'text')),
  photo_url TEXT,
  photo_storage_path TEXT,
  text_content TEXT,
  font_family VARCHAR(100),
  font_size INT,
  font_color VARCHAR(20),
  font_weight VARCHAR(20) DEFAULT 'normal',
  font_style VARCHAR(20) DEFAULT 'normal',
  text_align VARCHAR(20) DEFAULT 'left',
  text_decoration VARCHAR(20) DEFAULT 'none',
  position_x FLOAT NOT NULL,
  position_y FLOAT NOT NULL,
  width FLOAT NOT NULL,
  height FLOAT NOT NULL,
  rotation FLOAT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.elements ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_elements_zone_id ON public.elements(zone_id);

DROP POLICY IF EXISTS "Users can view own elements" ON public.elements;
CREATE POLICY "Users can view own elements"
  ON public.elements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.zones
    JOIN public.pages ON pages.id = zones.page_id
    JOIN public.projects ON projects.id = pages.project_id
    WHERE zones.id = elements.zone_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can insert own elements" ON public.elements;
CREATE POLICY "Users can insert own elements"
  ON public.elements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.zones
    JOIN public.pages ON pages.id = zones.page_id
    JOIN public.projects ON projects.id = pages.project_id
    WHERE zones.id = elements.zone_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can update own elements" ON public.elements;
CREATE POLICY "Users can update own elements"
  ON public.elements FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.zones
    JOIN public.pages ON pages.id = zones.page_id
    JOIN public.projects ON projects.id = pages.project_id
    WHERE zones.id = elements.zone_id
    AND projects.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can delete own elements" ON public.elements;
CREATE POLICY "Users can delete own elements"
  ON public.elements FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.zones
    JOIN public.pages ON pages.id = zones.page_id
    JOIN public.projects ON projects.id = pages.project_id
    WHERE zones.id = elements.zone_id
    AND projects.user_id = auth.uid()
  ));

DROP TRIGGER IF EXISTS on_element_updated ON public.elements;
CREATE TRIGGER on_element_updated
  BEFORE UPDATE ON public.elements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE FUNCTION update_project_last_edited_from_element()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.projects
  SET last_edited_at = NOW()
  WHERE id IN (
    SELECT pages.project_id
    FROM public.pages
    JOIN public.zones ON zones.page_id = pages.id
    WHERE zones.id = COALESCE(NEW.zone_id, OLD.zone_id)
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
-- SECTION 11: VOUCHERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS public.vouchers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'not_redeemed' CHECK (status IN ('not_redeemed', 'being_redeemed', 'fully_redeemed')),
  page_count INT CHECK (page_count IN (30, 40)),
  paper_size VARCHAR(10) CHECK (paper_size IN ('A4', 'A5', 'PDF Only')),
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  redeemed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.vouchers ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_vouchers_code ON public.vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON public.vouchers(status);

DROP POLICY IF EXISTS "Authenticated users can view vouchers" ON public.vouchers;
CREATE POLICY "Authenticated users can view vouchers"
  ON public.vouchers FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can redeem vouchers" ON public.vouchers;
CREATE POLICY "Authenticated users can redeem vouchers"
  ON public.vouchers FOR UPDATE
  TO authenticated
  USING (status IN ('not_redeemed', 'being_redeemed'));

DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.vouchers;
CREATE POLICY "Admins can manage vouchers"
  ON public.vouchers FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = TRUE
  ));

-- ============================================
-- SECTION 12: STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('project-photos', 'project-photos', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('template-assets', 'template-assets', true)
ON CONFLICT (id) DO NOTHING;

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
-- SETUP COMPLETE
-- ============================================

SELECT 'Setup completed successfully!' AS status;
