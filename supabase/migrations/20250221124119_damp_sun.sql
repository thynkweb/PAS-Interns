/*
  # Add days left and referral code to users table

  1. Changes
    - Add days_left column to users table with default 30 days
    - Add referral_code column to users table with unique constraint
    - Update existing users with default values
  
  2. Security
    - No changes to RLS policies (using existing policies)
*/

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS days_left integer NOT NULL DEFAULT 30,
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE NOT NULL DEFAULT 'REF' || substring(gen_random_uuid()::text from 1 for 6);

-- Update the handle_new_user function to include the new fields
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
    'REF' || substring(gen_random_uuid()::text from 1 for 6)
  );
  RETURN new;
END;
$$ language plpgsql security definer;