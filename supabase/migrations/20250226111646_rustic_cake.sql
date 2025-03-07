/*
  # Add RLS policies for tables
  
  1. Changes
    - Add RLS policies for all tables if they don't exist yet
    - Each policy is wrapped in a conditional check to prevent conflicts
  
  2. Security
    - Policies ensure authenticated users can access appropriate data
    - Policies restrict users to their own data where applicable
*/

DO $$ 
BEGIN
  -- User assignment progress policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_assignment_progress' 
    AND policyname = 'Users can view their own progress'
  ) THEN
    CREATE POLICY "Users can view their own progress"
      ON user_assignment_progress FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_assignment_progress' 
    AND policyname = 'Users can create their own progress'
  ) THEN
    CREATE POLICY "Users can create their own progress"
      ON user_assignment_progress FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_assignment_progress' 
    AND policyname = 'Users can modify their own progress'
  ) THEN
    CREATE POLICY "Users can modify their own progress"
      ON user_assignment_progress FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Users policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can view their own data'
  ) THEN
    CREATE POLICY "Users can view their own data"
      ON users FOR SELECT
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update their own data'
  ) THEN
    CREATE POLICY "Users can update their own data"
      ON users FOR UPDATE
      USING (auth.uid() = id);
  END IF;
END $$;