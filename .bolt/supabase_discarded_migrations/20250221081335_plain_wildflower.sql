/*
  # Remove campaign, donations, and donor_details tables
  
  This migration removes the following tables:
  - campaigns
  - donations
  - donor_details
*/

-- Drop tables in correct order due to foreign key constraints
DROP TABLE IF EXISTS donor_details;
DROP TABLE IF EXISTS donations;
DROP TABLE IF EXISTS campaigns;