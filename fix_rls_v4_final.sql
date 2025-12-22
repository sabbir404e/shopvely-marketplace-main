-- RLS Recursion Fix V4
-- The issue is likely that the 'products' table policy itself extracts data from 'profiles' 
-- using a raw query, which triggers 'profiles' policies, creating the loop.
-- We must force 'products' and 'categories' to use the SECURE (Bypass RLS) function.

-- 1. Ensure the Security Definer Function exists and is correct
CREATE OR REPLACE FUNCTION public.is_admin() 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- This runs with Owner privileges, ignoring RLS on profiles
  RETURN EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$;

-- 2. Update PRODUCTS Policy
DROP POLICY IF EXISTS "Admins can maintain products" ON products;
CREATE POLICY "Admins can maintain products" ON products 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- 3. Update CATEGORIES Policy
DROP POLICY IF EXISTS "Admins can maintain categories" ON categories;
CREATE POLICY "Admins can maintain categories" ON categories 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- 4. Update PROFILES Policy (Just to be safe/clean)
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
-- Re-add the simple True policy
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
