/*
  # Update User Identifiers

  1. Changes
    - Update referral code format to be more readable (e.g., AMIT123)
    - Add function to generate readable referral codes
    - Update existing user's referral code
  
  2. Security
    - Maintains existing RLS policies
    - No changes to security model
*/

-- Function to generate a readable referral code
CREATE OR REPLACE FUNCTION generate_readable_referral_code(full_name text)
RETURNS text AS $$
DECLARE
  base_code text;
  random_num text;
  attempt_count integer := 0;
  max_attempts integer := 10;
  result text;
BEGIN
  -- Extract first name and convert to uppercase
  base_code := upper(split_part(full_name, ' ', 1));
  
  -- If no name provided, use 'USER'
  IF base_code IS NULL OR base_code = '' THEN
    base_code := 'USER';
  END IF;

  WHILE attempt_count < max_attempts LOOP
    -- Generate a random 3-digit number
    random_num := lpad(floor(random() * 1000)::text, 3, '0');
    result := base_code || random_num;
    
    -- Check if this code is already in use
    IF NOT EXISTS (SELECT 1 FROM users WHERE referral_code = result) THEN
      RETURN result;
    END IF;
    
    attempt_count := attempt_count + 1;
  END LOOP;
  
  -- If all attempts failed, append a timestamp
  RETURN base_code || to_char(now(), 'MMSS');
END;
$$ LANGUAGE plpgsql;

-- Update existing user's referral code
UPDATE users
SET referral_code = generate_readable_referral_code(full_name)
WHERE id = '362e09bc-7eb9-469f-bc6a-d44266f2c2de';

-- Update the handle_new_user function to use the new referral code format
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    avatar_url,
    days_left,
    referral_code
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    30,
    generate_readable_referral_code(new.raw_user_meta_data->>'full_name')
  );
  RETURN new;
END;
$$ language plpgsql security definer;