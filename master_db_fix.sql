-- MASTER FIX v1: Comprehensive Database Repair
-- This script fixes: Admin Role Detection, RLS Infinite Recursion, and Policy Conflicts.
-- Run this ENTIRE script in the Supabase SQL Editor.

-- BEGIN TRANSACTION;

-- ==========================================
-- 1. CLEANUP FUNCTIONS & DEPENDENCIES
-- ==========================================
-- Remove old/conflicting functions that might cause ambiguity
DROP FUNCTION IF EXISTS public.has_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role) CASCADE; 
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

-- ==========================================
-- 2. SETUP CORE FUNCTIONS (Security Definer)
-- ==========================================

-- Function 2.1: Robust `has_role`
-- Checks if a user has a specific role. Security Definer allows it to read profiles even if RLS blocks it.
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
    AND lower(role) = lower(_role)
  );
END;
$$;

-- Function 2.2: `is_admin` Helper
-- Simplified check for RLS policies
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO service_role;

-- ==========================================
-- 3. FIX PROFILES TABLE
-- ==========================================

-- Ensure role column exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role text DEFAULT 'customer';
    END IF;
END $$;

-- RESET RLS on Profiles to prevent Recursion
-- We drop ALL existing policies on profiles to clear any bad logic
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles; -- Newly added to fix error
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles; -- Newly added to fix error
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can maintain profiles" ON profiles; -- Newly added for idempotency
DROP POLICY IF EXISTS "Public profiles read" ON profiles;
DROP POLICY IF EXISTS "User insert own" ON profiles;
DROP POLICY IF EXISTS "User update own" ON profiles;

-- Create Safe, Non-Recursive Policies
-- 1. READ: Allow everyone to read profiles. (Critical for basic app function)
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

-- 2. INSERT: Allow users to create their own profile
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- 3. UPDATE: Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);


-- 4. MAINTAIN (Admin): Allow admins to full control (update/delete) any profile
CREATE POLICY "Admins can maintain profiles" ON profiles FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. FIX OTHER TABLES (Use is_admin helper)
-- ==========================================

-- Products
DROP POLICY IF EXISTS "Admins can maintain products" ON products;
CREATE POLICY "Admins can maintain products" ON products 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Categories
DROP POLICY IF EXISTS "Admins can maintain categories" ON categories;
CREATE POLICY "Admins can maintain categories" ON categories 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- WithdrawRequests (Example of another admin table)
DROP POLICY IF EXISTS "Admins can maintain withdraw requests" ON withdraw_requests;
CREATE POLICY "Admins can maintain withdraw requests" ON withdraw_requests 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Site Settings
DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;
CREATE POLICY "Admins can manage site settings" ON site_settings 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Coupons
DROP POLICY IF EXISTS "Admins can maintain coupons" ON coupons;
CREATE POLICY "Admins can maintain coupons" ON coupons 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Orders
DROP POLICY IF EXISTS "Admins can maintain orders" ON orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON orders;

CREATE POLICY "Admins can maintain orders" ON orders 
FOR ALL 
USING (is_admin())
WITH CHECK (is_admin());

-- Reviews
DROP POLICY IF EXISTS "Admins can manage all reviews" ON reviews;
CREATE POLICY "Admins can manage all reviews" ON reviews 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Banners
DROP POLICY IF EXISTS "Admins can maintain banners" ON banners;
CREATE POLICY "Admins can maintain banners" ON banners 
FOR ALL 
USING (is_admin()) 
WITH CHECK (is_admin());

-- Loyalty Transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON loyalty_transactions;
CREATE POLICY "Admins can view all transactions" ON loyalty_transactions 
FOR SELECT 
USING (is_admin());

DROP POLICY IF EXISTS "Admins can insert loyalty transactions" ON loyalty_transactions;
CREATE POLICY "Admins can insert loyalty transactions" ON loyalty_transactions 
FOR INSERT 
WITH CHECK (is_admin());

-- ==========================================
-- 5. SELF-HEALING (Grant Admin to Current User)
-- ==========================================
-- Automatically make the user running this script an admin ensuring they don't lock themselves out.
UPDATE profiles 
SET role = 'admin' 
WHERE id = auth.uid();

-- COMMIT;