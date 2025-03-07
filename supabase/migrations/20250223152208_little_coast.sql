/*
  # Add insights tables and functions

  1. New Tables
    - `user_ranks` - Stores user ranking information with unique user_id constraint
    - `donation_stats` - Stores aggregated donation statistics with single row constraint
    
  2. Functions
    - `calculate_user_ranks()` - Calculates user ranks based on donation amounts
    - `update_donation_stats()` - Updates donation statistics
    
  3. Triggers
    - Automatically update ranks and stats when donations change
*/

-- Create user ranks table
CREATE TABLE IF NOT EXISTS user_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE UNIQUE,
  rank_position integer NOT NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  total_donors integer NOT NULL DEFAULT 0,
  avg_donation numeric NOT NULL DEFAULT 0,
  rank_title text NOT NULL DEFAULT 'Beginner',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create donation stats table with single row constraint
CREATE TABLE IF NOT EXISTS donation_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  total_donations numeric NOT NULL DEFAULT 0,
  avg_donation numeric NOT NULL DEFAULT 0,
  total_donors integer NOT NULL DEFAULT 0,
  highest_donation numeric NOT NULL DEFAULT 0,
  highest_donor_id uuid REFERENCES users ON DELETE SET NULL,
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000000')
);

-- Enable RLS
ALTER TABLE user_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_stats ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all ranks"
  ON user_ranks FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view donation stats"
  ON donation_stats FOR SELECT
  TO authenticated
  USING (true);

-- Function to calculate ranks
CREATE OR REPLACE FUNCTION calculate_user_ranks()
RETURNS void AS $$
BEGIN
  -- Update existing ranks
  WITH ranked_users AS (
    SELECT 
      d.user_id,
      SUM(d.amount) as total_amount,
      COUNT(DISTINCT d.donor_id) as total_donors,
      AVG(d.amount) as avg_donation,
      ROW_NUMBER() OVER (ORDER BY SUM(d.amount) DESC) as rank_position,
      CASE 
        WHEN SUM(d.amount) >= 100000 THEN 'Wizard'
        WHEN SUM(d.amount) >= 50000 THEN 'Master'
        WHEN SUM(d.amount) >= 25000 THEN 'Expert'
        WHEN SUM(d.amount) >= 10000 THEN 'Advanced'
        ELSE 'Beginner'
      END as rank_title
    FROM donations d
    GROUP BY d.user_id
  )
  INSERT INTO user_ranks (
    user_id, 
    rank_position, 
    total_amount, 
    total_donors, 
    avg_donation,
    rank_title
  )
  SELECT 
    user_id,
    rank_position,
    total_amount,
    total_donors,
    avg_donation,
    rank_title
  FROM ranked_users
  ON CONFLICT (user_id) DO UPDATE
  SET 
    rank_position = EXCLUDED.rank_position,
    total_amount = EXCLUDED.total_amount,
    total_donors = EXCLUDED.total_donors,
    avg_donation = EXCLUDED.avg_donation,
    rank_title = EXCLUDED.rank_title,
    updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Function to update donation stats
CREATE OR REPLACE FUNCTION update_donation_stats()
RETURNS void AS $$
BEGIN
  -- Ensure the single row exists
  INSERT INTO donation_stats (
    id,
    total_donations,
    avg_donation,
    total_donors,
    highest_donation,
    highest_donor_id,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    0, 0, 0, 0, NULL, now()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Update stats
  UPDATE donation_stats
  SET
    total_donations = COALESCE((SELECT SUM(amount) FROM donations), 0),
    avg_donation = COALESCE((SELECT AVG(amount) FROM donations), 0),
    total_donors = COALESCE((SELECT COUNT(DISTINCT donor_id) FROM donations), 0),
    highest_donation = COALESCE((SELECT MAX(amount) FROM donations), 0),
    highest_donor_id = (
      SELECT donor_id 
      FROM donations 
      WHERE amount = (SELECT MAX(amount) FROM donations) 
      LIMIT 1
    ),
    updated_at = now()
  WHERE id = '00000000-0000-0000-0000-000000000000';
END;
$$ LANGUAGE plpgsql;

-- Create triggers to update stats
CREATE OR REPLACE FUNCTION trigger_update_stats()
RETURNS trigger AS $$
BEGIN
  PERFORM calculate_user_ranks();
  PERFORM update_donation_stats();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stats_on_donation
  AFTER INSERT OR UPDATE OR DELETE ON donations
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_stats();

-- Initialize stats
SELECT calculate_user_ranks();
SELECT update_donation_stats();