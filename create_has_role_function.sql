-- Create the 'has_role' function needed by AuthContext
-- This function checks if a user has a specific role in the 'profiles' table.
-- It is marked SECURITY DEFINER to ensure it works even if RLS is strict.

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
