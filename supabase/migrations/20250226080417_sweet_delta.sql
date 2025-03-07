/*
  # Add test user data

  1. New Data
    - Insert test user
    - Add user rank
    - Add donation stats
    - Add user assignment progress
    - Add test donations

  2. Changes
    - Ensures all necessary data exists for the test user ID
    - Adds proper unique constraints for ON CONFLICT clauses
*/

-- Insert test user if not exists
INSERT INTO users (
  id,
  email,
  full_name,
  avatar_url,
  days_left,
  referral_code,
  deadline_date
)
VALUES (
  '362e09bc-7eb9-469f-bc6a-d44266f2c2de',
  'test@example.com',
  'Test User',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop',
  30,
  'TEST1234',
  now() + interval '30 days'
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url;

-- Insert test donations
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM donations 
    WHERE user_id = '362e09bc-7eb9-469f-bc6a-d44266f2c2de'
  ) THEN
    INSERT INTO donations (
      user_id,
      donor_id,
      amount,
      display_name,
      message,
      is_anonymous,
      created_at
    )
    SELECT
      '362e09bc-7eb9-469f-bc6a-d44266f2c2de',
      NULL,
      amount,
      name,
      message,
      false,
      now() - (row_number() OVER ())::integer * interval '1 day'
    FROM (
      VALUES
        (15000, 'Aditri Singh', 'Supporting education for all! 🎓'),
        (12000, 'Anna Kapoor', 'Every child deserves quality education'),
        (18000, 'Deeya Patel', 'Keep up the amazing work!'),
        (20000, 'Katyayini Sharma', 'Proud to support this cause! 🙏'),
        (16000, 'Aradhana Reddy', 'Making a difference together')
    ) AS donations(amount, name, message);
  END IF;
END $$;

-- Ensure user_ranks has a unique constraint on user_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_ranks_user_id_key'
  ) THEN
    ALTER TABLE user_ranks ADD CONSTRAINT user_ranks_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Insert or update user rank
INSERT INTO user_ranks (
  user_id,
  rank_position,
  total_amount,
  total_donors,
  avg_donation,
  rank_title
)
VALUES (
  '362e09bc-7eb9-469f-bc6a-d44266f2c2de',
  1,
  81000,
  5,
  16200,
  'Master'
)
ON CONFLICT (user_id) DO UPDATE
SET
  rank_position = EXCLUDED.rank_position,
  total_amount = EXCLUDED.total_amount,
  total_donors = EXCLUDED.total_donors,
  avg_donation = EXCLUDED.avg_donation,
  rank_title = EXCLUDED.rank_title;

-- Insert or update donation stats
INSERT INTO donation_stats (
  id,
  total_donations,
  avg_donation,
  total_donors,
  highest_donation,
  highest_donor_id
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  81000,
  16200,
  5,
  20000,
  '362e09bc-7eb9-469f-bc6a-d44266f2c2de'
)
ON CONFLICT (id) DO UPDATE
SET
  total_donations = EXCLUDED.total_donations,
  avg_donation = EXCLUDED.avg_donation,
  total_donors = EXCLUDED.total_donors,
  highest_donation = EXCLUDED.highest_donation,
  highest_donor_id = EXCLUDED.highest_donor_id;

-- Ensure user_assignment_progress has a unique constraint on user_id and assignment_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_assignment_progress_user_assignment_key'
  ) THEN
    ALTER TABLE user_assignment_progress 
    ADD CONSTRAINT user_assignment_progress_user_assignment_key 
    UNIQUE (user_id, assignment_id);
  END IF;
END $$;

-- Insert test assignment progress
INSERT INTO user_assignment_progress (
  user_id,
  assignment_id,
  current_question,
  completed
)
VALUES (
  '362e09bc-7eb9-469f-bc6a-d44266f2c2de',
  'f7d7ce3e-e6b5-4f8b-a7b0-b7a3e0c29f1f',
  1,
  false
)
ON CONFLICT (user_id, assignment_id) DO NOTHING;

-- Insert test assignment if it doesn't exist
INSERT INTO assignments (
  id,
  title,
  description
)
VALUES (
  'f7d7ce3e-e6b5-4f8b-a7b0-b7a3e0c29f1f',
  'Fundraising Fundamentals',
  'Test your knowledge about fundraising and social impact'
)
ON CONFLICT (id) DO NOTHING;