-- FIX: Resolve Infinite Recursion on Profiles Table
-- The recursion happens because "Admins can maintain profiles" (FOR ALL) triggers `is_admin` check on SELECTs.
-- `is_admin` reads `profiles`, causing the loop.
-- Solution: Specific policies for modification only.

-- 1. Drop the problematic "FOR ALL" policy
DROP POLICY IF EXISTS "Admins can maintain profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- 2. Ensure Public Read Access (Safe, no recursion)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- 3. Admin Permissions (INSERT, UPDATE, DELETE only - NOT SELECT)
-- This prevents the recursion loop during a read operation.

CREATE POLICY "Admins can insert profiles" ON profiles 
FOR INSERT 
WITH CHECK (is_admin());

CREATE POLICY "Admins can update profiles" ON profiles 
FOR UPDATE 
USING (is_admin());

CREATE POLICY "Admins can delete profiles" ON profiles 
FOR DELETE 
USING (is_admin());

-- 4. User Permissions (Own Data)
-- Re-ensure these exist
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
