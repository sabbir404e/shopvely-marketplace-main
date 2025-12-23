-- FIX INFINITE RECURSION FINAL
-- The error "infinite recursion detected" means a Policy on 'profiles' is trying to query 'profiles' again (likely via a function).
-- We will DROP ALL policies on 'profiles' and replace them with simple, non-recursive ones.

-- 1. Drop EVERYTHING related to profiles RLS
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Public profiles read" ON profiles;
DROP POLICY IF EXISTS "User insert own" ON profiles;
DROP POLICY IF EXISTS "User update own" ON profiles;

-- 2. Create SIMPLE, NON-RECURSIVE Policies
-- Allow everyone to read profiles. This breaks recursion because it doesn't check any roles or other tables.
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);

-- Allow users to insert their *own* profile
CREATE POLICY "User insert own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Allow users to update their *own* profile
CREATE POLICY "User update own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 3. Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Verify is_admin helper is safe
-- This function is SECURITY DEFINER, so it bypasses RLS when it runs.
-- However, just to be safe, let's make sure it's isolated.
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
