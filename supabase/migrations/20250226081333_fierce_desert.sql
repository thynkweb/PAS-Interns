/*
  # Update referral code handling
  
  1. Changes
    - Simplify referral code to just use first name
    - Update handle_new_user function to use first name
    - Drop unused function
  
  2. Security
    - No changes to RLS policies
*/

-- Drop the unused function
DROP FUNCTION IF EXISTS generate_readable_referral_code(text);

-- Update handle_new_user function to use first name
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  first_name text;
BEGIN
  -- Extract first name from full name
  first_name := split_part(new.raw_user_meta_data->>'full_name', ' ', 1);
  
  -- Default to 'USER' if no name provided
  IF first_name IS NULL OR first_name = '' THEN
    first_name := 'USER';
  END IF;

  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    avatar_url,
    days_left,
    referral_code,
    deadline_date
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    30,
    upper(first_name),
    now() + interval '30 days'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Update existing users to use first name as referral code
UPDATE users
SET referral_code = upper(split_part(full_name, ' ', 1))
WHERE full_name IS NOT NULL AND full_name != '';

-- Update users without full name to use 'USER' as referral code
UPDATE users
SET referral_code = 'USER'
WHERE full_name IS NULL OR full_name = '';