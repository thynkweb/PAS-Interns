/*
  # Training Content Schema

  1. New Tables
    - `training_modules`
      - `id` (uuid, primary key)
      - `number` (integer)
      - `title` (text)
      - `description` (text)
      - `video_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `podcasts`
      - `id` (uuid, primary key)
      - `number` (integer)
      - `title` (text)
      - `description` (text)
      - `audio_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
*/

-- Create training_modules table
CREATE TABLE IF NOT EXISTS training_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL,
  title text NOT NULL,
  description text,
  video_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer NOT NULL,
  title text NOT NULL,
  description text,
  audio_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Training modules are viewable by everyone"
  ON training_modules FOR SELECT
  USING (true);

CREATE POLICY "Podcasts are viewable by everyone"
  ON podcasts FOR SELECT
  USING (true);