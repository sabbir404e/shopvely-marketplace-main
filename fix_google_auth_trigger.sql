-- Re-create the unique referral code generator to be robust
CREATE OR REPLACE FUNCTION generate_unique_referral_code(full_name text)
RETURNS text
LANGUAGE plpgsql
AS $$
DECLARE
  base_code text;
  new_code text;
  exists_already boolean;
  counter integer := 0;
BEGIN
  -- Handle empty name
  IF full_name IS NULL OR full_name = '' THEN
    base_code := 'USER';
  ELSE
    -- Take first word, uppercase, remove non-alphanumeric
    base_code := UPPER(REGEXP_REPLACE(SPLIT_PART(full_name, ' ', 1), '[^a-zA-Z0-9]', '', 'g'));
    -- Ensure at least reasonable length prefix
    IF LENGTH(base_code) < 2 THEN
        base_code := 'USER';
    END IF;
  END IF;

  LOOP
    -- Generate: NAME + Random 4 digits (e.g. SABBIR4040)
    new_code := base_code || FLOOR(RANDOM() * 9000 + 1000)::text;
    
    -- Check uniqueness in profiles
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO exists_already;
    
    IF NOT exists_already THEN
      RETURN new_code;
    END IF;
    
    -- Safety break: if we hit many collisions, try a longer number
    counter := counter + 1;
    IF counter > 10 THEN
         new_code := base_code || FLOOR(RANDOM() * 90000 + 10000)::text;
         RETURN new_code;
    END IF;
  END LOOP;
END;
$$;

-- Update the handle_new_user function to be fail-safe
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
declare
  referral_uuid uuid := null;
  referral_code_val text;
begin
  -- Safe cast for referrer
  begin
    if new.raw_user_meta_data->>'referred_by' is not null and new.raw_user_meta_data->>'referred_by' != '' then
      referral_uuid := (new.raw_user_meta_data->>'referred_by')::uuid;
    end if;
  exception when others then
    referral_uuid := null;
  end;

  -- Generate referral code
  referral_code_val := public.generate_unique_referral_code(new.raw_user_meta_data->>'full_name');

  insert into public.profiles (
    id, 
    full_name, 
    avatar_url, 
    email, 
    referral_code, 
    referred_by_user_id
  )
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.user_metadata->>'full_name', 'New User'),
    coalesce(new.raw_user_meta_data->>'avatar_url', new.user_metadata->>'avatar_url'),
    new.email,
    referral_code_val,
    referral_uuid
  )
  on conflict (id) do nothing; -- Prevent error if profile already exists

  return new;
exception when others then
  -- Log error but don't block auth
  raise warning 'Error in handle_new_user: %', SQLERRM;
  return new;
end;
$$;
