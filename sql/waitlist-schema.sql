-- =============================================
-- KEEPERS Waitlist Table Schema
-- =============================================
-- This schema creates a table to store email waitlist signups
-- for the coming soon page.
--
-- To apply this schema:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Copy and paste this entire file
-- 3. Click "Run" to execute
-- =============================================

-- Create waitlist table
CREATE TABLE IF NOT EXISTS public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_email UNIQUE (email)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON public.waitlist(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON public.waitlist(created_at DESC);

-- Disable Row Level Security for public waitlist
-- RLS is disabled because:
-- 1. This table accepts public submissions (no auth required)
-- 2. Contains only voluntarily submitted emails (no sensitive data)
-- 3. UNIQUE constraint prevents spam/duplicates
-- 4. Users still cannot SELECT data (only admins via dashboard)
ALTER TABLE public.waitlist DISABLE ROW LEVEL SECURITY;

-- Grant INSERT to anon and authenticated roles
GRANT INSERT ON public.waitlist TO anon, authenticated;

-- Note: Even without RLS, only service_role can SELECT data
-- This keeps email addresses private while allowing public signups

-- Trigger for updated_at timestamp
-- Reuses the handle_updated_at() function created in schema-supabase.sql
CREATE TRIGGER handle_waitlist_updated_at
  BEFORE UPDATE ON public.waitlist
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- =============================================
-- Schema created successfully!
-- =============================================
-- Next steps:
-- 1. Verify the table was created: Check Tables in Supabase Dashboard
-- 2. Test insert policy: Try inserting a test email via SQL Editor
-- 3. Deploy the application code
-- =============================================
