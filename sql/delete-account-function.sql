-- ============================================
-- KEEPERS Account Deletion Function
-- ============================================
-- This function allows authenticated users to delete their own account
-- and all related data through CASCADE relationships.
--
-- SECURITY DEFINER is required to grant permission to delete from auth.users
-- which is normally restricted to admin operations.
--
-- USAGE:
-- Run this SQL in Supabase SQL Editor to create the function.
-- Then users can call it via: supabase.rpc('delete_user_account')

-- Create function to allow users to delete their own account
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete from auth.users (CASCADE will handle related records)
  -- This will automatically delete:
  -- - public.profiles (ON DELETE CASCADE)
  -- - public.projects (ON DELETE CASCADE)
  -- - public.pages (ON DELETE CASCADE via projects)
  -- - public.elements (ON DELETE CASCADE via pages)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_user_account() TO authenticated;

-- ============================================
-- VERIFICATION
-- ============================================
-- After running this SQL, verify the function exists:
-- SELECT * FROM pg_proc WHERE proname = 'delete_user_account';
