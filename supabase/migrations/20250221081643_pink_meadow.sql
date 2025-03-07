/*
  # Remove profiles table and dependencies

  1. Changes
    - Drop tables that depend on profiles
    - Drop profiles table
    - Remove auth trigger for new users

  2. Details
    - Remove donor_details table (depends on profiles)
    - Remove donations table (depends on profiles)
    - Remove campaigns table (depends on profiles)
    - Remove fundraising_amounts table (depends on profiles)
    - Remove profiles table
    - Drop handle_new_user function and trigger
*/

-- Drop tables in correct order due to foreign key constraints
DROP TABLE IF EXISTS donor_details;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS campaigns;
DROP TABLE IF EXISTS fundraising_amounts;
DROP TABLE IF EXISTS profiles;

-- Drop the trigger and function for handling new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user;