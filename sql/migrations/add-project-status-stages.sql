-- ============================================
-- MIGRATION: Add 4-stage project status workflow
-- ============================================
-- This migration updates the project status field to support a 4-stage workflow:
-- 1. draft - Project is being created/edited
-- 2. processed - Voucher redeemed, order confirmed, ready for production
-- 3. shipped - Product has been shipped to customer
-- 4. completed - Customer received product, order complete
--
-- Previous status 'archived' is removed. Existing 'completed' projects
-- will remain as 'completed' (final state).
-- ============================================

-- Step 1: Drop the existing CHECK constraint on status
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Step 2: Add new CHECK constraint with 4 status values
ALTER TABLE public.projects
  ADD CONSTRAINT projects_status_check
  CHECK (status IN ('draft', 'processed', 'shipped', 'completed'));

-- Step 3: Update any 'archived' projects to 'completed' (if any exist)
UPDATE public.projects
SET status = 'completed'
WHERE status = 'archived';

-- Step 4: Add comment for documentation
COMMENT ON COLUMN public.projects.status IS 'Project lifecycle status: draft (editing) -> processed (order confirmed) -> shipped (in transit) -> completed (delivered)';

-- Verify the migration
SELECT
  status,
  COUNT(*) as count
FROM public.projects
GROUP BY status
ORDER BY
  CASE status
    WHEN 'draft' THEN 1
    WHEN 'processed' THEN 2
    WHEN 'shipped' THEN 3
    WHEN 'completed' THEN 4
  END;
