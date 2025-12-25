
-- 1. Helper function to generate truly unique referral codes
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

-- 2. Update the handle_new_user trigger to USE the unique generator
-- This ignores client-side codes and enforces server-side uniqueness
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
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
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    -- Enforce server-side unique generation
    public.generate_unique_referral_code(new.raw_user_meta_data->>'full_name'),
    case 
      when new.raw_user_meta_data->>'referred_by' is not null and new.raw_user_meta_data->>'referred_by' != '' 
      then (new.raw_user_meta_data->>'referred_by')::uuid 
      else null 
    end
  );
  return new;
end;
$$;

-- 3. Prevent referral codes from ever being changed (Immutability)
CREATE OR REPLACE FUNCTION prevent_referral_code_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF OLD.referral_code IS NOT NULL AND NEW.referral_code IS DISTINCT FROM OLD.referral_code THEN
        RAISE EXCEPTION 'Referral code cannot be changed once assigned.';
    END IF;
    RETURN NEW;
END;
$$;

-- Drop trigger if exists to avoid error on rerun
DROP TRIGGER IF EXISTS check_referral_code_immutable ON profiles;

CREATE TRIGGER check_referral_code_immutable
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION prevent_referral_code_change();
