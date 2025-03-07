/*
  # Add donor details tracking

  1. New Tables
    - `donor_details`
      - `id` (uuid, primary key)
      - `donor_id` (uuid, references profiles)
      - `donation_id` (uuid, references donations)
      - `message` (text)
      - `display_name` (text)
      - `is_anonymous` (boolean)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `donor_details` table
    - Add policies for authenticated users
*/

CREATE TABLE IF NOT EXISTS donor_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  donation_id uuid REFERENCES donations(id) ON DELETE CASCADE,
  message text,
  display_name text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE donor_details ENABLE ROW LEVEL SECURITY;

-- Policies for donor_details
CREATE POLICY "Donor details are viewable by everyone"
  ON donor_details FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create donor details"
  ON donor_details FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Users can update their own donor details"
  ON donor_details FOR UPDATE
  USING (auth.uid() = donor_id);