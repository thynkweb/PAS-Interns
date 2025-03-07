/*
  # Add RLS policies
  
  This migration adds Row Level Security (RLS) policies for all tables,
  checking first if they don't already exist to avoid duplicate policy errors.
*/

DO $$ 
BEGIN
  -- Assignment options policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assignment_options' 
    AND policyname = 'Options are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Options are viewable by authenticated users"
      ON assignment_options FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Assignment questions policies  
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assignment_questions' 
    AND policyname = 'Questions are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Questions are viewable by authenticated users"
      ON assignment_questions FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Assignments policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'assignments' 
    AND policyname = 'Assignments are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Assignments are viewable by authenticated users"
      ON assignments FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Comment reactions policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comment_reactions' 
    AND policyname = 'Reactions are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Reactions are viewable by authenticated users"
      ON comment_reactions FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comment_reactions' 
    AND policyname = 'Users can create their own reactions'
  ) THEN
    CREATE POLICY "Users can create their own reactions"
      ON comment_reactions FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comment_reactions' 
    AND policyname = 'Users can delete their own reactions'
  ) THEN
    CREATE POLICY "Users can delete their own reactions"
      ON comment_reactions FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Community comments policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_comments' 
    AND policyname = 'Comments are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Comments are viewable by authenticated users"
      ON community_comments FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_comments' 
    AND policyname = 'Users can create their own comments'
  ) THEN
    CREATE POLICY "Users can create their own comments"
      ON community_comments FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'community_comments' 
    AND policyname = 'Users can update their own comments'
  ) THEN
    CREATE POLICY "Users can update their own comments"
      ON community_comments FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Donation stats policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'donation_stats' 
    AND policyname = 'Users can view donation stats'
  ) THEN
    CREATE POLICY "Users can view donation stats"
      ON donation_stats FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Donations policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'donations' 
    AND policyname = 'Users can view their own donations'
  ) THEN
    CREATE POLICY "Users can view their own donations"
      ON donations FOR SELECT
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'donations' 
    AND policyname = 'Users can view donations they made'
  ) THEN
    CREATE POLICY "Users can view donations they made"
      ON donations FOR SELECT
      USING (donor_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'donations' 
    AND policyname = 'Users can create donations'
  ) THEN
    CREATE POLICY "Users can create donations"
      ON donations FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;

  -- User ranks policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_ranks' 
    AND policyname = 'Users can view all ranks'
  ) THEN
    CREATE POLICY "Users can view all ranks"
      ON user_ranks FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;