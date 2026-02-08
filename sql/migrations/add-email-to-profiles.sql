-- ============================================
-- Migration: Add Email Column to Profiles
-- ============================================
-- Date: 2026-02-08
-- Purpose: Add email column to profiles table and sync it from auth.users
-- This makes it easier to query user information without joining with auth.users
-- ============================================

-- Add email column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Create index for email lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Backfill email from auth.users for existing profiles
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;

-- Update the handle_new_user() trigger to sync email
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

-- Optional: Add trigger to sync email updates from auth.users to profiles
CREATE OR REPLACE FUNCTION public.sync_user_email()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET email = NEW.email
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for email updates
DROP TRIGGER IF EXISTS on_auth_user_email_updated ON auth.users;
CREATE TRIGGER on_auth_user_email_updated
  AFTER UPDATE OF email ON auth.users
  FOR EACH ROW
  WHEN (OLD.email IS DISTINCT FROM NEW.email)
  EXECUTE FUNCTION public.sync_user_email();

-- Verification: Check that all profiles now have emails
SELECT
  COUNT(*) as total_profiles,
  COUNT(email) as profiles_with_email,
  COUNT(*) - COUNT(email) as missing_emails
FROM public.profiles;

-- Expected: missing_emails should be 0
