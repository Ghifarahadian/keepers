-- ============================================
-- Migration: Voucher Lifecycle & Project Configuration
-- ============================================
-- Date: Earlier migration (extracted from setup.sql)
-- Purpose: Enhance voucher system with three-state lifecycle and add project configuration

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
