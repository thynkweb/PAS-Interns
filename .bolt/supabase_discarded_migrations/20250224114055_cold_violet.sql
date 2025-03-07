/*
  # Fix user data and insights

  1. Changes
    - Update existing user ranks with correct data
    - Update donation stats
    - Add sample donations for existing users
*/

-- Update existing user ranks with correct data
WITH user_totals AS (
  SELECT
    user_id,
    sum(amount) as total_amount,
    count(DISTINCT donor_id) as total_donors,
    avg(amount) as avg_donation
  FROM donations
  GROUP BY user_id
),
ranked_users AS (
  SELECT
    ut.*,
    row_number() OVER (ORDER BY total_amount DESC) as rank_position,
    CASE 
      WHEN total_amount >= 100000 THEN 'Wizard'
      WHEN total_amount >= 50000 THEN 'Master'
      WHEN total_amount >= 25000 THEN 'Expert'
      WHEN total_amount >= 10000 THEN 'Advanced'
      ELSE 'Beginner'
    END as rank_title
  FROM user_totals ut
)
UPDATE user_ranks ur
SET
  rank_position = ru.rank_position,
  total_amount = ru.total_amount,
  total_donors = ru.total_donors,
  avg_donation = ru.avg_donation,
  rank_title = ru.rank_title,
  updated_at = now()
FROM ranked_users ru
WHERE ur.user_id = ru.user_id;

-- Update donation stats
WITH donation_totals AS (
  SELECT
    sum(amount) as total_donations,
    avg(amount) as avg_donation,
    count(DISTINCT donor_id) as total_donors,
    max(amount) as highest_donation,
    (
      SELECT user_id
      FROM donations d2
      WHERE d2.amount = max(d1.amount)
      LIMIT 1
    ) as highest_donor_id
  FROM donations d1
)
UPDATE donation_stats
SET
  total_donations = dt.total_donations,
  avg_donation = dt.avg_donation,
  total_donors = dt.total_donors,
  highest_donation = dt.highest_donation,
  highest_donor_id = dt.highest_donor_id,
  updated_at = now()
FROM donation_totals dt
WHERE id = '00000000-0000-0000-0000-000000000000';

-- Add sample donations for existing users
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
  CASE floor(random() * 5)
    WHEN 0 THEN 'Priya Sharma'
    WHEN 1 THEN 'Amit Kumar'
    WHEN 2 THEN 'Neha Singh'
    WHEN 3 THEN 'Rajesh Verma'
    ELSE 'Meera Patel'
  END,
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
CROSS JOIN generate_series(1, 3);