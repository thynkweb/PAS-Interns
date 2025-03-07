/*
  # Fix migration with policy checks
  
  1. Add checks before creating policies
  2. Keep all table creation and function logic
  3. Ensure idempotent policy creation
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  -- Users policies
  DROP POLICY IF EXISTS "Users can view their own data" ON users;
  DROP POLICY IF EXISTS "Users can update their own data" ON users;
  
  -- Donations policies
  DROP POLICY IF EXISTS "Users can view their own donations" ON donations;
  DROP POLICY IF EXISTS "Users can view donations they made" ON donations;
  DROP POLICY IF EXISTS "Users can create donations" ON donations;
  
  -- User ranks policies
  DROP POLICY IF EXISTS "Users can view all ranks" ON user_ranks;
  
  -- Donation stats policies
  DROP POLICY IF EXISTS "Users can view donation stats" ON donation_stats;
  
  -- Assignment policies
  DROP POLICY IF EXISTS "Assignments are viewable by authenticated users" ON assignments;
  DROP POLICY IF EXISTS "Questions are viewable by authenticated users" ON assignment_questions;
  DROP POLICY IF EXISTS "Options are viewable by authenticated users" ON assignment_options;
  
  -- Progress policies
  DROP POLICY IF EXISTS "Users can view their own progress" ON user_assignment_progress;
  DROP POLICY IF EXISTS "Users can create their own progress" ON user_assignment_progress;
  DROP POLICY IF EXISTS "Users can modify their own progress" ON user_assignment_progress;
  
  -- Comment policies
  DROP POLICY IF EXISTS "Comments are viewable by authenticated users" ON community_comments;
  DROP POLICY IF EXISTS "Users can create their own comments" ON community_comments;
  DROP POLICY IF EXISTS "Users can update their own comments" ON community_comments;
  
  -- Reaction policies
  DROP POLICY IF EXISTS "Reactions are viewable by authenticated users" ON comment_reactions;
  DROP POLICY IF EXISTS "Users can create their own reactions" ON comment_reactions;
  DROP POLICY IF EXISTS "Users can delete their own reactions" ON comment_reactions;
END $$;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  days_left integer NOT NULL DEFAULT 30,
  referral_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  deadline_date timestamptz NOT NULL DEFAULT (now() + interval '30 days')
);

CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES users ON DELETE SET NULL,
  user_id uuid REFERENCES users ON DELETE CASCADE,
  amount integer NOT NULL CHECK (amount > 0),
  display_name text NOT NULL,
  message text,
  is_anonymous boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

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

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid REFERENCES assignments ON DELETE CASCADE,
  question_text text NOT NULL,
  correct_option text NOT NULL,
  order_number integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES assignment_questions ON DELETE CASCADE,
  option_text text NOT NULL,
  option_label text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_assignment_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE,
  assignment_id uuid REFERENCES assignments ON DELETE CASCADE,
  current_question integer NOT NULL DEFAULT 1,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, assignment_id)
);

CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES community_comments ON DELETE CASCADE,
  user_id uuid REFERENCES users ON DELETE CASCADE,
  reaction text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction)
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ranks ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_assignment_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view their own donations" ON donations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view donations they made" ON donations FOR SELECT USING (donor_id = auth.uid());
CREATE POLICY "Users can create donations" ON donations FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view all ranks" ON user_ranks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can view donation stats" ON donation_stats FOR SELECT TO authenticated USING (true);

CREATE POLICY "Assignments are viewable by authenticated users" ON assignments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Questions are viewable by authenticated users" ON assignment_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Options are viewable by authenticated users" ON assignment_options FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view their own progress" ON user_assignment_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own progress" ON user_assignment_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can modify their own progress" ON user_assignment_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Comments are viewable by authenticated users" ON community_comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create their own comments" ON community_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comments" ON community_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Reactions are viewable by authenticated users" ON comment_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create their own reactions" ON comment_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON comment_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
DECLARE
  first_name text;
BEGIN
  first_name := split_part(new.raw_user_meta_data->>'full_name', ' ', 1);
  IF first_name IS NULL OR first_name = '' THEN
    first_name := 'USER';
  END IF;

  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    avatar_url,
    days_left,
    referral_code,
    deadline_date
  )
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    30,
    upper(first_name),
    now() + interval '30 days'
  );
  RETURN new;
END;
$$ language plpgsql security definer;

CREATE OR REPLACE FUNCTION calculate_user_ranks()
RETURNS void AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION update_donation_stats()
RETURNS void AS $$
BEGIN
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

CREATE OR REPLACE FUNCTION initialize_user_data()
RETURNS trigger AS $$
BEGIN
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

-- Create triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

DROP TRIGGER IF EXISTS initialize_user_data_trigger ON users;
CREATE TRIGGER initialize_user_data_trigger
  AFTER INSERT ON users
  FOR EACH ROW
  EXECUTE PROCEDURE initialize_user_data();

DROP TRIGGER IF EXISTS update_stats_on_donation ON donations;
CREATE TRIGGER update_stats_on_donation
  AFTER INSERT OR UPDATE OR DELETE ON donations
  FOR EACH STATEMENT
  EXECUTE FUNCTION trigger_update_stats();

-- Initialize stats
SELECT calculate_user_ranks();
SELECT update_donation_stats();