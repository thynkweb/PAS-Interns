/*
  # User Management Enhancement

  1. Changes
    - Add deadline_date to users table
    - Add function to calculate days left
    - Add trigger to auto-update days_left
*/

-- Add deadline_date column
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS deadline_date timestamptz NOT NULL DEFAULT (now() + interval '30 days');

-- Function to calculate days left
CREATE OR REPLACE FUNCTION calculate_days_left(deadline_date timestamptz)
RETURNS integer AS $$
BEGIN
  RETURN GREATEST(0, EXTRACT(DAY FROM (deadline_date - now()))::integer);
END;
$$ LANGUAGE plpgsql;

-- Function to update days left
CREATE OR REPLACE FUNCTION update_days_left()
RETURNS trigger AS $$
BEGIN
  NEW.days_left = calculate_days_left(NEW.deadline_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update days_left
CREATE TRIGGER update_days_left_trigger
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_days_left();

-- Update handle_new_user function to include deadline_date
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
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
    generate_readable_referral_code(new.raw_user_meta_data->>'full_name'),
    now() + interval '30 days'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Update existing users
UPDATE users 
SET deadline_date = created_at + interval '30 days',
    days_left = calculate_days_left(created_at + interval '30 days')
WHERE deadline_date IS NULL;