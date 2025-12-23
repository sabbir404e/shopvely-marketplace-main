-- FIX V6: Nuclear Option for RLS and Ambiguity Resolution

-- 1. Fix 'has_role' Ambiguity
-- Drop all conceivable variations to clear the conflict
DROP FUNCTION IF EXISTS public.has_role(uuid, text);
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role); 

-- Re-create it strictly
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
    AND lower(role::text) = lower(_role)
  );
END;
$$;

-- Grant permissions again just in case
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO service_role;


-- 2. Fix Profiles Recursion - Remove EVERYTHING
DO $$
DECLARE
  pol record;
BEGIN
  -- Loop through all policies on 'profiles' and drop them
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON profiles';
  END LOOP;
END $$;

-- 3. Re-Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create SIMPLE Policies (Non-Recursive)

-- READ: Public (This stops the admin check recursion because it doesn't check role)
CREATE POLICY "Public profiles read" ON profiles FOR SELECT USING (true);

-- INSERT: Self only
CREATE POLICY "User insert own" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- UPDATE: Self only (We remove the Global Admin Update for now to strictly prevent recursion)
CREATE POLICY "User update own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- If Admins REALLY need to update others, we'd use is_admin(), but let's stabilize first.
-- The is_admin() function logic depends on reading profiles. 
-- Since reading is now 'true' for everyone, is_admin() will succeed without looping.


-- 5. Fix Products/Categories recursion just in case
DROP POLICY IF EXISTS "Admins can maintain products" ON products;
CREATE POLICY "Admins products check" ON products 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admins can maintain categories" ON categories;
CREATE POLICY "Admins categories check" ON categories 
FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- 6. Ensure Public Read on Categories (was missing in some iterations?)
DROP POLICY IF EXISTS "Public can read categories" ON categories;
CREATE POLICY "Public can read categories" ON categories FOR SELECT USING (true);
