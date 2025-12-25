-- Disable admin role for everyone except the specific email
UPDATE public.profiles
SET role = 'customer'
WHERE email <> 'shopvelyofficial@gmail.com' AND role = 'admin';

-- Ensure the specific email is admin (if the user exists)
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'shopvelyofficial@gmail.com';
