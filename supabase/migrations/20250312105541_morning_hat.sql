/*
  # Fix Google Sign In Data Storage
  
  1. Changes
    - Update handle_new_user trigger function to properly handle Google OAuth data
    - Add proper error handling
    - Ensure WhatsApp number is handled correctly
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create updated function to handle new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  first_name text;
  display_name text;
BEGIN
  -- Extract name from metadata
  display_name := new.raw_user_meta_data->>'full_name';
  IF display_name IS NULL THEN
    display_name := split_part(new.email, '@', 1);
  END IF;

  -- Extract first name for referral code
  first_name := split_part(display_name, ' ', 1);
  IF first_name IS NULL OR first_name = '' THEN
    first_name := 'USER';
  END IF;

  -- Insert into users table with all available data
  INSERT INTO public.users (
    id,
    email,
    full_name,
    avatar_url,
    days_left,
    referral_code,
    deadline_date,
    whatsapp_number,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture'),
    30,
    upper(first_name),
    now() + interval '30 days',
    new.raw_user_meta_data->>'whatsapp_number',
    now(),
    now()
  );

  -- Initialize other required data
  INSERT INTO user_ranks (
    user_id,
    rank_position,
    total_amount,
    total_donors,
    avg_donation,
    rank_title
  )
  VALUES (
    new.id,
    (SELECT COALESCE(MAX(rank_position), 0) + 1 FROM user_ranks),
    0,
    0,
    0,
    'Beginner'
  );

  -- Initialize assignment progress
  INSERT INTO user_assignment_progress (
    user_id,
    assignment_id,
    current_question,
    completed
  )
  SELECT
    new.id,
    id,
    1,
    false
  FROM assignments;

  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error details
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create new trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Update existing users if needed
UPDATE users
SET 
  full_name = COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = users.id),
    split_part(email, '@', 1)
  ),
  avatar_url = COALESCE(
    (SELECT raw_user_meta_data->>'avatar_url' FROM auth.users WHERE id = users.id),
    (SELECT raw_user_meta_data->>'picture' FROM auth.users WHERE id = users.id)
  )
WHERE full_name IS NULL OR avatar_url IS NULL;