-- Force Admin Grant Script
-- This script ensures the user exists in 'profiles' and has the 'admin' role.

DO $$
DECLARE
  target_user_id uuid;
BEGIN
  -- 1. Get the User ID from the Auth system
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'shopvelyofficial@gmail.com';

  -- 2. If user exists, Upgrade them
  IF target_user_id IS NOT NULL THEN
    
    -- Update Email Confirmation just in case
    UPDATE auth.users 
    SET email_confirmed_at = now() 
    WHERE id = target_user_id;

    -- Upsert Profile (Insert if missing, Update if exists)
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (target_user_id, 'ShopVely Admin', 'admin')
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin';
    
  END IF;
END $$;

-- 3. Verify the result (Run this line separately if 'DO' blocks don't show output)
SELECT u.email, p.role 
FROM auth.users u
JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'shopvelyofficial@gmail.com';
