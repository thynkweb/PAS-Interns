/*
  # Update insights data

  1. Changes
    - Update donation stats
    - Add sample donations
    - Update user ranks
*/

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
  500000,
  8333.33,
  60,
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

-- Insert sample donations for existing users
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
  u.id as user_id,
  CASE WHEN random() < 0.2 THEN NULL ELSE u.id END as donor_id,
  (floor(random() * 6) + 5) * 5000,
  u.full_name,
  CASE floor(random() * 5)
    WHEN 0 THEN 'Supporting this amazing cause! 🎓'
    WHEN 1 THEN 'Every child deserves quality education 🌟'
    WHEN 2 THEN 'Making a difference together 💫'
    WHEN 3 THEN 'Proud to contribute to this initiative! 🙏'
    ELSE 'Keep up the great work! ✨'
  END,
  random() < 0.2,
  now() - (generate_series(1, 5) || ' days')::interval
FROM users u
CROSS JOIN generate_series(1, 5);

-- Update user ranks based on actual donation data
WITH donation_totals AS (
  SELECT 
    user_id,
    SUM(amount) as total_amount,
    COUNT(DISTINCT donor_id) as total_donors,
    AVG(amount) as avg_donation
  FROM donations
  GROUP BY user_id
),
ranked_users AS (
  SELECT 
    dt.*,
    ROW_NUMBER() OVER (ORDER BY total_amount DESC) as rank_position,
    CASE 
      WHEN SUM(amount) >= 100000 THEN 'Wizard'
      WHEN SUM(amount) >= 50000 THEN 'Master'
      WHEN SUM(amount) >= 25000 THEN 'Expert'
      WHEN SUM(amount) >= 10000 THEN 'Advanced'
      ELSE 'Beginner'
    END as rank_title
  FROM donation_totals dt
  GROUP BY dt.user_id, dt.total_amount, dt.total_donors, dt.avg_donation
)
INSERT INTO user_ranks (
  user_id,
  rank_position,
  total_amount,
  total_donors,
  avg_donation,
  rank_title,
  created_at,
  updated_at
)
SELECT
  ru.user_id,
  ru.rank_position,
  ru.total_amount,
  ru.total_donors,
  ru.avg_donation,
  ru.rank_title,
  now(),
  now()
FROM ranked_users ru
ON CONFLICT (user_id) DO UPDATE
SET
  rank_position = EXCLUDED.rank_position,
  total_amount = EXCLUDED.total_amount,
  total_donors = EXCLUDED.total_donors,
  avg_donation = EXCLUDED.avg_donation,
  rank_title = EXCLUDED.rank_title,
  updated_at = now();