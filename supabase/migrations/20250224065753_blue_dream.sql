/*
  # Add community comments table

  1. New Tables
    - `community_comments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `content` (text)
      - `image_url` (text, optional)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `community_comments` table
    - Add policies for authenticated users to:
      - Read all comments
      - Create their own comments
      - Update their own comments
*/

-- Create community comments table
CREATE TABLE IF NOT EXISTS community_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users ON DELETE CASCADE,
  content text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Comments are viewable by authenticated users"
  ON community_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own comments"
  ON community_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON community_comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add sample comments
INSERT INTO community_comments (user_id, content, created_at)
VALUES 
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 'Grateful for volunteer crowdfunding experience! It wasn''t just impactful, but helped me develop storytelling & communication skills while raising funds for a great cause.', now() - interval '2 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 'Didn''t realize how much a month could transform me and introduce me to challenges that have allowed me to understand myself better and work towards becoming a better version of myself.', now() - interval '1 day');