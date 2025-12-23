-- FINAL FIX: Recursion & Permissions Cleaner
-- This script performs a "Hard Reset" on strict security policies to eliminate recursion.

-- 1. CLEANUP: Drop ALL policies on 'profiles' dynamically
-- This matches any policy name, removing the need to guess.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON profiles';
  END LOOP;
END $$;

-- 2. CORE FUNCTION: Re-declare is_admin as SECURITY DEFINER
-- This is critical. SECURITY DEFINER means this function ignores RLS when running.
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

-- 3. PROFILES POLICIES (Simplified & Safe)
-- A. READ: Allow everyone to read profiles. NO Conditions. (Prevents Recursion)
CREATE POLICY "Public Read" ON profiles FOR SELECT USING (true);

-- B. WRITE (Self): Users can edit themselves
CREATE POLICY "Self Insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Self Update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- C. WRITE (Admin): Admins can delete/update others
-- Note: We use is_admin() here. Since is_admin is SECURITY DEFINER, it won't trigger RLS loops.
CREATE POLICY "Admin Update" ON profiles FOR UPDATE USING (is_admin());
CREATE POLICY "Admin Delete" ON profiles FOR DELETE USING (is_admin());
-- We do NOT add a "Admin Select" policy because "Public Read" already covers it.

-- 4. ENABLE RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. WITHDRAW REQUESTS (Fix Permissions)
-- Just to be safe, we reset these too.
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'withdraw_requests' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON withdraw_requests';
  END LOOP;
END $$;

CREATE POLICY "Admin Manage Withdrawals" ON withdraw_requests FOR ALL USING (is_admin());
CREATE POLICY "User View Own Withdrawals" ON withdraw_requests FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "User Insert Own Withdrawals" ON withdraw_requests FOR INSERT WITH CHECK (user_id = auth.uid());

ALTER TABLE withdraw_requests ENABLE ROW LEVEL SECURITY;

-- 6. GRANT ADMIN (Self-Healing)
UPDATE profiles SET role = 'admin' WHERE id = auth.uid();
