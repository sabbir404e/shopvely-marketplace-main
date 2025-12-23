-- FIX ADMIN VISIBILITY FINAL
-- This script fixes the 'has_role' function and ensures the admin role is correctly detected.

-- 1. Standardization: Drop all conflicting function signatures
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE; 

-- 2. Create the ROBUST has_role function
-- This function checks the 'role' column in the profiles table.
-- It is SECURITY DEFINER to bypass RLS policies on the profiles table itself during the check.
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = _user_id
    AND (
      lower(role) = lower(_role) 
      OR (lower(_role) = 'admin' AND lower(role) = 'service_role') -- Handle edge cases if any
    )
  );
END;
$$;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO service_role;

-- 4. Ensure the 'role' column exists and has proper constraints
-- (This block is safe to run even if column exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'customer';
    END IF;
END $$;

-- 5. Create is_admin() helper for RLS policies
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- 6. Emergency RLS Fix: Ensure users can READ their own role
-- We need to ensure that fetching the profile typically includes the role.
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- 7. Grant Admin Role to specific user (Optional - replace with specific email if known, e.g. the current user)
-- UPDATE profiles SET role = 'admin' WHERE email = 'YOUR_EMAIL_HERE';
