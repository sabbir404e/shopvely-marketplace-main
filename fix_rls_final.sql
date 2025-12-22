-- Final Fix for RLS Recursion
-- The issue is that the "Admins can read all profiles" policy calls is_admin(), 
-- which reads profiles, which triggers the policy again.
-- Since we have "Public profiles are viewable by everyone" (true), the Admin read policy is REDUNDANT and HARMFUL.

-- 1. Drop the problematic recursive policies on 'profiles'
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- 2. Ensure the safe "Public" policy exists
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- 3. Also drop the UPDATE policy for now if it causes issues, 
-- but strictly speaking, 'is_admin()' only does a SELECT, so it should only trigger SELECT policies.
-- We will leave the UPDATE policy for now, assuming the recursion is only on SELECT.
-- If UPDATE fails later, we can fix it then, but Seeding only needs Reads on profiles.

-- 4. Just to be absolutely sure, re-assert the security definer function
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- This query allows us to see if the user is an admin
  -- It will trigger SELECT policies on 'profiles'.
  -- NOW that we removed the recursive SELECT policy, it should hit 'Public profiles...' and succeed.
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;
