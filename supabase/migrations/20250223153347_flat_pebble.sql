/*
  # Update user data and donations

  1. Changes
    - Insert sample donation data for user atul3713
    - Update user ranks and donation stats
*/

-- Insert sample donations for atul3713
INSERT INTO donations (
  user_id,
  donor_id,
  amount,
  display_name,
  message,
  is_anonymous,
  created_at
) VALUES
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 15000, 'Aditri Singh', 'Supporting education for all! 🎓', false, now() - interval '5 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 12000, 'Anna Kapoor', 'Every child deserves quality education', false, now() - interval '4 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 18000, 'Deeya Patel', 'Keep up the amazing work!', false, now() - interval '3 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 20000, 'Katyayini Sharma', 'Proud to support this cause! 🙏', false, now() - interval '2 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 16000, 'Aradhana Reddy', 'Making a difference together', false, now() - interval '1 day');

-- Insert user rank for atul3713
INSERT INTO user_ranks (
  user_id,
  rank_position,
  total_amount,
  total_donors,
  avg_donation,
  rank_title
) VALUES (
  '362e09bc-7eb9-469f-bc6a-d44266f2c2de',
  1,
  81000,
  5,
  16200,
  'Master'
) ON CONFLICT (user_id) DO UPDATE
SET
  rank_position = EXCLUDED.rank_position,
  total_amount = EXCLUDED.total_amount,
  total_donors = EXCLUDED.total_donors,
  avg_donation = EXCLUDED.avg_donation,
  rank_title = EXCLUDED.rank_title,
  updated_at = now();

-- Update donation stats
INSERT INTO donation_stats (
  id,
  total_donations,
  avg_donation,
  total_donors,
  highest_donation,
  highest_donor_id,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  81000,
  16200,
  5,
  20000,
  '362e09bc-7eb9-469f-bc6a-d44266f2c2de',
  now()
) ON CONFLICT (id) DO UPDATE
SET
  total_donations = EXCLUDED.total_donations,
  avg_donation = EXCLUDED.avg_donation,
  total_donors = EXCLUDED.total_donors,
  highest_donation = EXCLUDED.highest_donation,
  highest_donor_id = EXCLUDED.highest_donor_id,
  updated_at = EXCLUDED.updated_at;