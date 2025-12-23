-- 1. Verify the Email (So you can login)
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'shopvelyofficial@gmail.com';

-- 2. Grant 'admin' Role (So you can seed/manage DB)
UPDATE public.profiles
SET role = 'admin'
WHERE id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'shopvelyofficial@gmail.com'
);

-- Check result
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'shopvelyofficial@gmail.com';
SELECT id, role FROM public.profiles WHERE id = (SELECT id FROM auth.users WHERE email = 'shopvelyofficial@gmail.com');
