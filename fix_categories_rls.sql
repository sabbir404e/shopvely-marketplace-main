-- Fix Categories RLS (and handle potential case sensitivity in role)

-- 1. Update is_admin to be case-insensitive just in case ('Admin' vs 'admin')
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
    AND lower(role) = 'admin'
  );
END;
$$;

-- 2. Clean up Categories Policies
DROP POLICY IF EXISTS "Admins can maintain categories" ON categories;
DROP POLICY IF EXISTS "Categories are viewable by everyone" ON categories;

-- 3. create granular policies for Categories
-- Allow everyone to READ categories
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);

-- Allow Admins to INSERT/UPDATE/DELETE
CREATE POLICY "Admins can insert categories" ON categories 
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update categories" ON categories 
FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete categories" ON categories 
FOR DELETE USING (is_admin());

-- 4. Do the same for Products just to be safe
DROP POLICY IF EXISTS "Admins can maintain products" ON products;
DROP POLICY IF EXISTS "Published products are viewable by everyone" ON products;

-- Read: Published OR Admin
CREATE POLICY "Public read published products" ON products 
FOR SELECT USING (status = 'published' OR is_admin());

-- Write: Admins only
CREATE POLICY "Admins can insert products" ON products 
FOR INSERT WITH CHECK (is_admin());

CREATE POLICY "Admins can update products" ON products 
FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can delete products" ON products 
FOR DELETE USING (is_admin());
