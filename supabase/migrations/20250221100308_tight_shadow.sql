/*
  # Create donations table

  1. New Tables
    - `donations`
      - `id` (uuid, primary key)
      - `donor_id` (uuid, nullable, references users)
      - `amount` (integer)
      - `created_at` (timestamp)
      - `display_name` (text)
      - `message` (text, nullable)
      - `is_anonymous` (boolean)

  2. Security
    - Enable RLS on `donations` table
    - Add policies for viewing and creating donations
*/

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES users ON DELETE SET NULL,
  amount integer NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now(),
  display_name text NOT NULL,
  message text,
  is_anonymous boolean DEFAULT false
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Donations are viewable by everyone"
  ON donations
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert sample data without user references
INSERT INTO donations (donor_id, amount, display_name, message, is_anonymous, created_at)
VALUES 
  (null, 5000, 'Rahul Sharma', 'Keep up the great work! 🙏', false, '2025-02-20T10:00:00Z'),
  (null, 2500, 'Priya Patel', null, false, '2025-02-19T15:30:00Z'),
  (null, 10000, 'Anonymous', 'For a better future', true, '2025-02-18T09:15:00Z'),
  (null, 7500, 'Rahul Sharma', 'Education is the most powerful weapon we can use to change the world! 🌟', false, '2025-02-21T08:30:00Z'),
  (null, 15000, 'Well-wisher', 'Supporting this wonderful cause. Keep making a difference! 🙏', true, '2025-02-21T09:45:00Z'),
  (null, 3000, 'Priya Patel', 'Happy to contribute to such a meaningful initiative! 💫', false, '2025-02-21T11:15:00Z');