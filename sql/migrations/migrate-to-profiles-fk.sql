-- ============================================
-- Migration: Change Foreign Keys from auth.users to profiles
-- ============================================
-- Date: 2026-02-08
-- Purpose: Update all user-owned tables to reference profiles.id instead of auth.users.id
-- This improves query performance and aligns with best practices:
-- - profiles table acts as the app's user representation
-- - Easier JOINs to get user information
-- - Better separation between auth layer and application layer
--
-- Tables affected:
-- - projects.user_id
-- - templates.created_by
-- - vouchers.redeemed_by
-- ============================================

-- ============================================
-- 1. PROJECTS TABLE
-- ============================================
-- Change projects.user_id from auth.users -> profiles

ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_user_id_fkey;

ALTER TABLE public.projects
  ADD CONSTRAINT projects_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.profiles(id)
  ON DELETE CASCADE;

-- ============================================
-- 2. TEMPLATES TABLE
-- ============================================
-- Change templates.created_by from auth.users -> profiles

ALTER TABLE public.templates
  DROP CONSTRAINT IF EXISTS templates_created_by_fkey;

ALTER TABLE public.templates
  ADD CONSTRAINT templates_created_by_fkey
  FOREIGN KEY (created_by)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- ============================================
-- 3. VOUCHERS TABLE
-- ============================================
-- Change vouchers.redeemed_by from auth.users -> profiles

ALTER TABLE public.vouchers
  DROP CONSTRAINT IF EXISTS vouchers_redeemed_by_fkey;

ALTER TABLE public.vouchers
  ADD CONSTRAINT vouchers_redeemed_by_fkey
  FOREIGN KEY (redeemed_by)
  REFERENCES public.profiles(id)
  ON DELETE SET NULL;

-- ============================================
-- VERIFICATION
-- ============================================
-- Verify the foreign keys are correctly updated

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN ('projects', 'templates', 'vouchers')
  AND kcu.column_name IN ('user_id', 'created_by', 'redeemed_by')
ORDER BY tc.table_name, kcu.column_name;

-- Expected output:
-- projects    | user_id      | profiles | id
-- templates   | created_by   | profiles | id
-- vouchers    | redeemed_by  | profiles | id
