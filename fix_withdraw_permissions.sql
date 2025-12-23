-- Fix Withdrawals Table Permissions
-- Run this script to ensure the withdrawals table is accessible to admins

-- 1. Ensure RLS is enabled
ALTER TABLE withdraw_requests ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admins can maintain withdraw requests" ON withdraw_requests;
DROP POLICY IF EXISTS "Users can view own withdraw requests" ON withdraw_requests;
DROP POLICY IF EXISTS "Users can insert own withdraw requests" ON withdraw_requests;

-- 3. Re-create Admin Policy (Full Access)
CREATE POLICY "Admins can maintain withdraw requests" ON withdraw_requests 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- 4. Re-create User Policies (Own Data Only)
CREATE POLICY "Users can view own withdraw requests" ON withdraw_requests 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert own withdraw requests" ON withdraw_requests 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- 5. Grant foundational permissions
GRANT ALL ON withdraw_requests TO authenticated;
GRANT ALL ON withdraw_requests TO service_role;
