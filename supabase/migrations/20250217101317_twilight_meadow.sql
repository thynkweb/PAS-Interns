/*
  # Initial Schema for NGO Fundraising App

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key) - matches auth.users id
      - `username` (text, unique)
      - `full_name` (text)
      - `referral_code` (text, unique)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `campaigns`
      - `id` (uuid, primary key)
      - `creator_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `target_amount` (integer)
      - `raised_amount` (integer)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `donations`
      - `id` (uuid, primary key)
      - `donor_id` (uuid, references profiles)
      - `campaign_id` (uuid, references campaigns)
      - `amount` (integer)
      - `referral_code` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text UNIQUE,
  full_name text,
  referral_code text UNIQUE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid REFERENCES profiles ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount integer NOT NULL DEFAULT 0,
  raised_amount integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES profiles ON DELETE SET NULL,
  campaign_id uuid REFERENCES campaigns ON DELETE CASCADE,
  amount integer NOT NULL,
  referral_code text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Campaigns policies
CREATE POLICY "Campaigns are viewable by everyone"
  ON campaigns FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create campaigns"
  ON campaigns FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Campaign creators can update their campaigns"
  ON campaigns FOR UPDATE
  USING (auth.uid() = creator_id);

-- Donations policies
CREATE POLICY "Donations are viewable by everyone"
  ON donations FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create donations"
  ON donations FOR INSERT
  WITH CHECK (auth.uid() = donor_id);

-- Functions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, referral_code)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    'SUNN' || substring(gen_random_uuid()::text from 1 for 4)
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Trigger for new user
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- Function to update campaign raised amount
CREATE OR REPLACE FUNCTION update_campaign_raised_amount()
RETURNS trigger AS $$
BEGIN
  UPDATE campaigns
  SET raised_amount = (
    SELECT COALESCE(SUM(amount), 0)
    FROM donations
    WHERE campaign_id = NEW.campaign_id
  )
  WHERE id = NEW.campaign_id;
  RETURN NEW;
END;
$$ language plpgsql security definer;

-- Trigger for updating campaign raised amount
CREATE TRIGGER on_donation_inserted
  AFTER INSERT ON donations
  FOR EACH ROW
  EXECUTE PROCEDURE update_campaign_raised_amount();