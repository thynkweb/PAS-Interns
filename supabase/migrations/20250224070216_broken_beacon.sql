/*
  # Add reactions to community comments

  1. New Tables
    - `comment_reactions`
      - `id` (uuid, primary key)
      - `comment_id` (uuid, references community_comments)
      - `user_id` (uuid, references users)
      - `reaction` (text, the emoji reaction)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `comment_reactions` table
    - Add policies for authenticated users to:
      - View all reactions
      - Create their own reactions
      - Delete their own reactions
*/

-- Create comment reactions table
CREATE TABLE IF NOT EXISTS comment_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id uuid REFERENCES community_comments ON DELETE CASCADE,
  user_id uuid REFERENCES users ON DELETE CASCADE,
  reaction text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(comment_id, user_id, reaction)
);

-- Enable RLS
ALTER TABLE comment_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Reactions are viewable by authenticated users"
  ON comment_reactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own reactions"
  ON comment_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON comment_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);