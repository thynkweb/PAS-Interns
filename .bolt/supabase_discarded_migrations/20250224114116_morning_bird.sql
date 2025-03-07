/*
  # Update user insights data

  1. Changes
    - Update user ranks with sample data
    - Update donation stats
    - Add sample donations
*/

-- Update user ranks with sample data
INSERT INTO user_ranks (
  user_id,
  rank_position,
  total_amount,
  total_donors,
  avg_donation,
  rank_title
)
SELECT 
  id as user_id,
  CASE 
    WHEN email = 'atul3713@gmail.com' THEN 1
    ELSE row_number() OVER (ORDER BY created_at) + 1
  END as rank_position,
  CASE 
    WHEN email = 'atul3713@gmail.com' THEN 95000
    WHEN row_number() OVER (ORDER BY created_at) = 1 THEN 85000
    WHEN row_number() OVER (ORDER BY created_at) = 2 THEN 75000
    WHEN row_number() OVER (ORDER BY created_at) = 3 THEN 65000
    WHEN row_number() OVER (ORDER BY created_at) = 4 THEN 55000
    WHEN row_number() OVER (ORDER BY created_at) = 5 THEN 45000
    ELSE 35000
  END as total_amount,
  CASE 
    WHEN email = 'atul3713@gmail.com' THEN 12
    WHEN row_number() OVER (ORDER BY created_at) = 1 THEN 10
    WHEN row_number() OVER (ORDER BY created_at) = 2 THEN 8
    WHEN row_number() OVER (ORDER BY created_at) = 3 THEN 7
    WHEN row_number() OVER (ORDER BY created_at) = 4 THEN 6
    WHEN row_number() OVER (ORDER BY created_at) = 5 THEN 5
    ELSE 4
  END as total_donors,
  CASE 
    WHEN email = 'atul3713@gmail.com' THEN 7916.67
    WHEN row_number() OVER (ORDER BY created_at) = 1 THEN 8500
    WHEN row_number() OVER (ORDER BY created_at) = 2 THEN 9375
    WHEN row_number() OVER (ORDER BY created_at) = 3 THEN 9285.71
    WHEN row_number() OVER (ORDER BY created_at) = 4 THEN 9166.67
    WHEN row_number() OVER (ORDER BY created_at) = 5 THEN 9000
    ELSE 8750
  END as avg_donation,
  CASE 
    WHEN email = 'atul3713@gmail.com' THEN 'Wizard'
    WHEN row_number() OVER (ORDER BY created_at) <= 5 THEN 'Wizard'
    ELSE 'Expert'
  END as rank_title
FROM users
ON CONFLICT (user_id) DO UPDATE
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
  500000,
  8333.33,
  60,
  20000,
  (SELECT id FROM users WHERE email = 'atul3713@gmail.com' LIMIT 1),
  now()
) ON CONFLICT (id) DO UPDATE
SET
  total_donations = EXCLUDED.total_donations,
  avg_donation = EXCLUDED.avg_donation,
  total_donors = EXCLUDED.total_donors,
  highest_donation = EXCLUDED.highest_donation,
  highest_donor_id = EXCLUDED.highest_donor_id,
  updated_at = EXCLUDED.updated_at;

-- Add sample donations
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
CROSS JOIN generate_series(1, 3)
WHERE u.email = 'atul3713@gmail.com';