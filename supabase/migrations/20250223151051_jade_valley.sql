/*
  # Create Assignment System Tables

  1. New Tables
    - assignments: Stores assignment metadata
    - assignment_questions: Stores questions for each assignment
    - assignment_options: Stores options for each question
    - user_assignment_progress: Tracks user progress through assignments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create assignment questions table
CREATE TABLE IF NOT EXISTS assignment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments ON DELETE CASCADE,
  question_text text NOT NULL,
  correct_option text NOT NULL,
  order_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create assignment options table
CREATE TABLE IF NOT EXISTS assignment_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES assignment_questions ON DELETE CASCADE,
  option_text text NOT NULL,
  option_label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create user assignment progress table
CREATE TABLE IF NOT EXISTS user_assignment_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE,
  assignment_id uuid REFERENCES assignments ON DELETE CASCADE,
  current_question integer NOT NULL DEFAULT 1,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assignment_progress ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Assignments are viewable by authenticated users"
  ON assignments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Questions are viewable by authenticated users"
  ON assignment_questions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Options are viewable by authenticated users"
  ON assignment_options FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can view their own progress"
  ON user_assignment_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON user_assignment_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify their own progress"
  ON user_assignment_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert sample data
DO $$ 
DECLARE
  assignment_id uuid;
  q1_id uuid;
  q2_id uuid;
  q3_id uuid;
  q4_id uuid;
  q5_id uuid;
  q6_id uuid;
  q7_id uuid;
BEGIN
  -- Insert assignment
  INSERT INTO assignments (id, title, description) 
  VALUES (
    'f7d7ce3e-e6b5-4f8b-a7b0-b7a3e0c29f1f',
    'Assignment 1',
    'Test your knowledge about fundraising and social impact'
  )
  RETURNING id INTO assignment_id;

  -- Insert questions
  INSERT INTO assignment_questions (id, assignment_id, question_text, correct_option, order_number) 
  VALUES
    ('11111111-1111-1111-1111-111111111111', assignment_id, 'What is the main goal of Jia Jiang''s social experiment?', 'a', 1),
    ('22222222-2222-2222-2222-222222222222', assignment_id, 'Which approach is most effective for handling rejection in fundraising?', 'c', 2),
    ('33333333-3333-3333-3333-333333333333', assignment_id, 'What is the key to building long-term donor relationships?', 'b', 3),
    ('44444444-4444-4444-4444-444444444444', assignment_id, 'How can you improve your fundraising pitch?', 'd', 4),
    ('55555555-5555-5555-5555-555555555555', assignment_id, 'What is the most important aspect of donor communication?', 'a', 5),
    ('66666666-6666-6666-6666-666666666666', assignment_id, 'Which factor most influences donor decision-making?', 'e', 6),
    ('77777777-7777-7777-7777-777777777777', assignment_id, 'What is the best way to follow up with potential donors?', 'b', 7);

  -- Insert options for all questions
  -- Question 1
  INSERT INTO assignment_options (question_id, option_text, option_label) VALUES
    ('11111111-1111-1111-1111-111111111111', 'To overcome his fear of rejection', 'a'),
    ('11111111-1111-1111-1111-111111111111', 'Failure is a necessary step to success', 'b'),
    ('11111111-1111-1111-1111-111111111111', 'To learn more about human psychology and asking for what you want', 'c'),
    ('11111111-1111-1111-1111-111111111111', 'To learn how to handle rejection in a professional setting', 'd'),
    ('11111111-1111-1111-1111-111111111111', 'All of the above', 'e');

  -- Question 2
  INSERT INTO assignment_options (question_id, option_text, option_label) VALUES
    ('22222222-2222-2222-2222-222222222222', 'Avoid asking again after rejection', 'a'),
    ('22222222-2222-2222-2222-222222222222', 'Wait for donors to approach you', 'b'),
    ('22222222-2222-2222-2222-222222222222', 'Learn from feedback and adapt your approach', 'c'),
    ('22222222-2222-2222-2222-222222222222', 'Focus only on new potential donors', 'd'),
    ('22222222-2222-2222-2222-222222222222', 'Ignore the rejection completely', 'e');

  -- Question 3
  INSERT INTO assignment_options (question_id, option_text, option_label) VALUES
    ('33333333-3333-3333-3333-333333333333', 'Focus only on monetary contributions', 'a'),
    ('33333333-3333-3333-3333-333333333333', 'Regular communication and transparency', 'b'),
    ('33333333-3333-3333-3333-333333333333', 'Minimal contact after donation', 'c'),
    ('33333333-3333-3333-3333-333333333333', 'Automated thank you messages', 'd'),
    ('33333333-3333-3333-3333-333333333333', 'Annual reports only', 'e');

  -- Question 4
  INSERT INTO assignment_options (question_id, option_text, option_label) VALUES
    ('44444444-4444-4444-4444-444444444444', 'Use complex technical terms', 'a'),
    ('44444444-4444-4444-4444-444444444444', 'Focus only on statistics', 'b'),
    ('44444444-4444-4444-4444-444444444444', 'Avoid mentioning challenges', 'c'),
    ('44444444-4444-4444-4444-444444444444', 'Tell compelling stories with clear impact', 'd'),
    ('44444444-4444-4444-4444-444444444444', 'Keep it as long as possible', 'e');

  -- Question 5
  INSERT INTO assignment_options (question_id, option_text, option_label) VALUES
    ('55555555-5555-5555-5555-555555555555', 'Authenticity and transparency', 'a'),
    ('55555555-5555-5555-5555-555555555555', 'Frequency of contact', 'b'),
    ('55555555-5555-5555-5555-555555555555', 'Length of messages', 'c'),
    ('55555555-5555-5555-5555-555555555555', 'Professional terminology', 'd'),
    ('55555555-5555-5555-5555-555555555555', 'Formal tone', 'e');

  -- Question 6
  INSERT INTO assignment_options (question_id, option_text, option_label) VALUES
    ('66666666-6666-6666-6666-666666666666', 'Marketing materials', 'a'),
    ('66666666-6666-6666-6666-666666666666', 'Website design', 'b'),
    ('66666666-6666-6666-6666-666666666666', 'Social media presence', 'c'),
    ('66666666-6666-6666-6666-666666666666', 'Organization size', 'd'),
    ('66666666-6666-6666-6666-666666666666', 'Emotional connection to the cause', 'e');

  -- Question 7
  INSERT INTO assignment_options (question_id, option_text, option_label) VALUES
    ('77777777-7777-7777-7777-777777777777', 'Daily phone calls', 'a'),
    ('77777777-7777-7777-7777-777777777777', 'Personalized, timely follow-up', 'b'),
    ('77777777-7777-7777-7777-777777777777', 'Multiple emails per day', 'c'),
    ('77777777-7777-7777-7777-777777777777', 'Wait for them to contact you', 'd'),
    ('77777777-7777-7777-7777-777777777777', 'Generic mass emails', 'e');
END $$;