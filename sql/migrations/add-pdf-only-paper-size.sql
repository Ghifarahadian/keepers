-- ============================================
-- Migration: Add "PDF Only" paper size option
-- ============================================
-- This migration updates the paper_size column constraints
-- to allow "PDF Only" as a valid value.
--
-- Run this in Supabase SQL Editor if your database
-- already has the paper_size columns created.
-- ============================================

-- Update projects table paper_size constraint
DO $$
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'projects' AND column_name = 'paper_size'
  ) THEN
    ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_paper_size_check;
  END IF;

  -- Add new constraint with PDF Only option
  ALTER TABLE public.projects
    ADD CONSTRAINT projects_paper_size_check
    CHECK (paper_size IN ('A4', 'A5', 'PDF Only'));
END $$;

-- Update vouchers table paper_size constraint
DO $$
BEGIN
  -- Drop the old constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.constraint_column_usage
    WHERE table_name = 'vouchers' AND column_name = 'paper_size'
  ) THEN
    ALTER TABLE public.vouchers DROP CONSTRAINT IF EXISTS vouchers_paper_size_check;
  END IF;

  -- Add new constraint with PDF Only option
  ALTER TABLE public.vouchers
    ADD CONSTRAINT vouchers_paper_size_check
    CHECK (paper_size IN ('A4', 'A5', 'PDF Only'));
END $$;

-- ============================================
-- Verification
-- ============================================
-- Run this to verify the constraints were updated:
--
-- SELECT conname, pg_get_constraintdef(oid)
-- FROM pg_constraint
-- WHERE conname LIKE '%paper_size%';
-- ============================================
