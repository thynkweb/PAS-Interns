-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS update_days_left_trigger ON users;

-- Drop the function if it exists
DROP FUNCTION IF EXISTS calculate_days_left(timestamptz);
DROP FUNCTION IF EXISTS update_days_left();

-- Update handle_new_user function to use fixed values
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

-- Update all existing users to have 30 days
UPDATE users
SET 
  days_left = 30,
  deadline_date = now() + interval '30 days';