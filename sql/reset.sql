-- ============================================
-- KEEPERS - Database Reset Script
-- ============================================
-- WARNING: This will DELETE ALL DATA and drop all tables!
-- Only run this on non-production databases!
-- ============================================
-- After running this, run setup.sql to recreate everything.
-- ============================================

-- Drop all policies first (they depend on tables)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.template_categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON public.template_categories;

DROP POLICY IF EXISTS "Anyone can view active templates" ON public.templates;
DROP POLICY IF EXISTS "Admins can manage templates" ON public.templates;

DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

DROP POLICY IF EXISTS "Users can view own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can create own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can update own pages" ON public.pages;
DROP POLICY IF EXISTS "Users can delete own pages" ON public.pages;

DROP POLICY IF EXISTS "Anyone can view active layouts" ON public.layouts;
DROP POLICY IF EXISTS "Admins can manage layouts" ON public.layouts;

DROP POLICY IF EXISTS "Users can view own page zones" ON public.zones;
DROP POLICY IF EXISTS "Users can create own page zones" ON public.zones;
DROP POLICY IF EXISTS "Users can update own page zones" ON public.zones;
DROP POLICY IF EXISTS "Users can delete own page zones" ON public.zones;
DROP POLICY IF EXISTS "Anyone can view layout zones" ON public.zones;
DROP POLICY IF EXISTS "Admins can manage layout zones" ON public.zones;

DROP POLICY IF EXISTS "Users can view own elements" ON public.elements;
DROP POLICY IF EXISTS "Users can insert own elements" ON public.elements;
DROP POLICY IF EXISTS "Users can update own elements" ON public.elements;
DROP POLICY IF EXISTS "Users can delete own elements" ON public.elements;

DROP POLICY IF EXISTS "Authenticated users can view vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Authenticated users can redeem vouchers" ON public.vouchers;
DROP POLICY IF EXISTS "Admins can manage vouchers" ON public.vouchers;

-- Drop storage policies
DROP POLICY IF EXISTS "Users can upload own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view template assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload template assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update template assets" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete template assets" ON storage.objects;

-- Drop all triggers
DROP TRIGGER IF EXISTS on_profile_updated ON public.profiles;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
DROP TRIGGER IF EXISTS handle_waitlist_updated_at ON public.waitlist;
DROP TRIGGER IF EXISTS on_template_category_updated ON public.template_categories;
DROP TRIGGER IF EXISTS on_template_updated ON public.templates;
DROP TRIGGER IF EXISTS on_project_updated ON public.projects;
DROP TRIGGER IF EXISTS on_page_updated ON public.pages;
DROP TRIGGER IF EXISTS on_page_modified ON public.pages;
DROP TRIGGER IF EXISTS on_layout_updated ON public.layouts;
DROP TRIGGER IF EXISTS on_zone_updated ON public.zones;
DROP TRIGGER IF EXISTS on_element_updated ON public.elements;
DROP TRIGGER IF EXISTS on_element_modified ON public.elements;

-- Drop all tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.elements CASCADE;
DROP TABLE IF EXISTS public.zones CASCADE;
DROP TABLE IF EXISTS public.layouts CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;
DROP TABLE IF EXISTS public.vouchers CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.template_categories CASCADE;
DROP TABLE IF EXISTS public.waitlist CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.sync_user_email() CASCADE;
DROP FUNCTION IF EXISTS public.delete_user_account() CASCADE;
DROP FUNCTION IF EXISTS public.update_project_last_edited() CASCADE;
DROP FUNCTION IF EXISTS public.update_project_last_edited_from_element() CASCADE;

-- Drop storage objects first (to avoid FK constraint violations)
DELETE FROM storage.objects WHERE bucket_id = 'project-photos';
DELETE FROM storage.objects WHERE bucket_id = 'template-assets';

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id = 'project-photos';
DELETE FROM storage.buckets WHERE id = 'template-assets';

-- ============================================
-- DATABASE RESET COMPLETE
-- ============================================
-- Now run setup.sql to recreate everything
-- ============================================

SELECT 'Database reset completed! All tables, functions, triggers, and policies have been dropped.' AS status;
