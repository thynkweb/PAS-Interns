/*
  # Add fundraising amount tracking

  1. New Tables
    - `fundraising_amounts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `current_amount` (integer)
      - `target_amount` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `fundraising_amounts` table
    - Add policies for authenticated users to:
      - Read their own fundraising amounts
      - Update their own fundraising amounts
*/

CREATE TABLE IF NOT EXISTS fundraising_amounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  current_amount integer NOT NULL DEFAULT 0,
  target_amount integer NOT NULL DEFAULT 35000,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE fundraising_amounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fundraising amounts"
  ON fundraising_amounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own fundraising amounts"
  ON fundraising_amounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Insert initial data for existing users
INSERT INTO fundraising_amounts (user_id, current_amount, target_amount)
SELECT id, 15000, 35000
FROM profiles
WHERE NOT EXISTS (
  SELECT 1 FROM fundraising_amounts WHERE fundraising_amounts.user_id = profiles.id
);