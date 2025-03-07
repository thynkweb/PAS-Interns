/*
  # Fix data synchronization issues
  
  1. Updates
    - Ensure proper user initialization
    - Add trigger for automatic data creation for new users
    - Fix potential data inconsistencies
    
  2. Changes
    - Add trigger for creating initial user data
    - Ensure all required tables have proper data
    - Fix any missing foreign key relationships
*/

-- Function to initialize user data
CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS trigger AS $$
BEGIN
  -- Create initial user rank
  INSERT INTO user_ranks (
    user_id,
    rank_position,
    total_amount,
    total_donors,
    avg_donation,
    rank_title
  )
  VALUES (
    NEW.id,
    (SELECT COALESCE(MAX(rank_position), 0) + 1 FROM user_ranks),
    0,
    0,
    0,
    'Beginner'
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Create initial assignment progress
  INSERT INTO user_assignment_progress (
    user_id,
    assignment_id,
    current_question,
    completed
  )
  SELECT
    NEW.id,
    id,
    1,
    false
  FROM assignments
  ON CONFLICT (user_id, assignment_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for initializing user data
DROP TRIGGER IF EXISTS initialize_user_data_trigger ON users;
CREATE TRIGGER initialize_user_data_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION initialize_user_data();

-- Fix any missing user ranks for existing users
INSERT INTO user_ranks (
  user_id,
  rank_position,
  total_amount,
  total_donors,
  avg_donation,
  rank_title
)
SELECT
  u.id,
  ROW_NUMBER() OVER (ORDER BY u.created_at),
  0,
  0,
  0,
  'Beginner'
FROM users u
LEFT JOIN user_ranks ur ON u.id = ur.user_id
WHERE ur.user_id IS NULL;

-- Fix any missing assignment progress for existing users
INSERT INTO user_assignment_progress (
  user_id,
  assignment_id,
  current_question,
  completed
)
SELECT
  u.id,
  a.id,
  1,
  false
FROM users u
CROSS JOIN assignments a
LEFT JOIN user_assignment_progress uap 
  ON u.id = uap.user_id 
  AND a.id = uap.assignment_id
WHERE uap.id IS NULL;

-- Ensure donation stats exist
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
  0,
  0,
  0,
  0,
  NULL
)
ON CONFLICT (id) DO NOTHING;

-- Update donation stats
SELECT update_donation_stats();

-- Update user ranks
SELECT calculate_user_ranks();