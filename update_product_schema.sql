-- Add missing columns to products table to match frontend requirements
alter table products 
add column if not exists is_new boolean default false,
add column if not exists is_featured boolean default false,
add column if not exists brand text,
add column if not exists sizes text[]; -- Simplified variant handling for migration

-- Ensure RLS policies allow update of these new columns
-- (Existing "Admins can maintain products" policy covers all columns via 'for all')
