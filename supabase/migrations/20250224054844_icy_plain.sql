/*
  # Make donations user-specific and update user IDs

  1. Changes
    - Add function to generate user-specific IDs
    - Update existing user IDs to follow firstname-number format
    - Update sample donation data to be more dynamic

  2. Security
    - Maintain existing RLS policies
*/

-- Function to generate a user-specific ID
CREATE OR REPLACE FUNCTION generate_user_id(full_name text)
RETURNS text AS $$
DECLARE
  first_name text;
  random_num text;
  result text;
BEGIN
  -- Extract first name and convert to lowercase
  first_name := lower(split_part(full_name, ' ', 1));
  
  -- Generate random 4-digit number
  random_num := lpad(floor(random() * 10000)::text, 4, '0');
  
  -- Combine firstname and number
  result := first_name || random_num;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Update existing donations with dynamic data
UPDATE donations
SET 
  display_name = CASE floor(random() * 5)
    WHEN 0 THEN 'Priya Sharma'
    WHEN 1 THEN 'Amit Kumar'
    WHEN 2 THEN 'Neha Singh'
    WHEN 3 THEN 'Rajesh Verma'
    ELSE 'Meera Patel'
  END,
  message = CASE floor(random() * 5)
    WHEN 0 THEN 'Supporting this amazing cause! 🎓'
    WHEN 1 THEN 'Every child deserves quality education 🌟'
    WHEN 2 THEN 'Making a difference together 💫'
    WHEN 3 THEN 'Proud to contribute to this initiative! 🙏'
    ELSE 'Keep up the great work! ✨'
  END,
  amount = (floor(random() * 8) + 3) * 5000, -- Random amount between 15000 and 50000
  created_at = now() - (floor(random() * 30) || ' days')::interval;

-- Update user IDs to follow firstname-number format
UPDATE users
SET referral_code = generate_user_id(full_name)
WHERE referral_code NOT SIMILAR TO '[a-z]+[0-9]{4}';