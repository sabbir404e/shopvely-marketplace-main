-- Comprehensive Fix for Infinite Recursion
-- This script will:
-- 1. Disable RLS temporarily to clean up
-- 2. Drop ALL existing policies on 'profiles' to ensure no bad ones remain
-- 3. Create the secure 'is_admin' function
-- 4. Re-enable RLS and add the correct, non-recursive policies

-- 1. Disable RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop ALL policies on profiles (Clean Slate)
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles; -- Some variations
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;

-- 3. Create/Replace the helper function
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

-- 4. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Re-create Policies

-- Public Read (Safe)
CREATE POLICY "Public profiles are viewable by everyone" ON profiles 
FOR SELECT USING (true);

-- User Insert Own (Safe)
CREATE POLICY "Users can insert their own profile" ON profiles 
FOR INSERT WITH CHECK (auth.uid() = id);

-- User Update Own (Safe)
CREATE POLICY "Users can update own profile" ON profiles 
FOR UPDATE USING (auth.uid() = id);

-- Admin Read All (Using Secure Function)
CREATE POLICY "Admins can read all profiles" ON profiles 
FOR SELECT USING (is_admin());

-- Admin Update All (Using Secure Function)
CREATE POLICY "Admins can update any profile" ON profiles 
FOR UPDATE USING (is_admin());

-- Confirmation
SELECT 'Fixed Policies Successfully' as status;
