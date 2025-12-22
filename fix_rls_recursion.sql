-- 1. Create a secure function to check admin status
-- SECURITY DEFINER allows this function to bypass RLS, breaking the recursion loop
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
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

-- 2. Drop the existing recursive policies on 'profiles'
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;

-- 3. Re-create the policies using the new non-recursive function
CREATE POLICY "Admins can read all profiles" ON profiles 
FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update any profile" ON profiles 
FOR UPDATE USING (is_admin());
