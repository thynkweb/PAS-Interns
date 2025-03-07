/*
  # Add user-specific donations

  1. Changes
    - Add user_id column to donations table to track which user received the donation
    - Add foreign key constraint to users table
    - Update RLS policies to allow users to view their own donations
*/

ALTER TABLE donations
ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;

-- Update RLS policies
DROP POLICY IF EXISTS "Donations are viewable by everyone" ON donations;

CREATE POLICY "Users can view their own donations"
  ON donations
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can view donations they made"
  ON donations
  FOR SELECT
  USING (donor_id = auth.uid());