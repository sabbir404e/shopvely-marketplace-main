
-- 1. Update the handle_new_user function to include referral_code and referred_by_user_id
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
    new.raw_user_meta_data->>'referral_code',
    case 
      when new.raw_user_meta_data->>'referred_by' is not null and new.raw_user_meta_data->>'referred_by' != '' 
      then (new.raw_user_meta_data->>'referred_by')::uuid 
      else null 
    end
  );
  return new;
end;
$$;

-- 2. Backfill missing referral codes for existing users
-- Generates a code like "JOHN1234" based on first name + random 4 digits
update profiles
set referral_code = upper(substring(coalesce(full_name, 'USER') from '^[^ ]+')) || floor(random() * 9000 + 1000)::text
where referral_code is null;
