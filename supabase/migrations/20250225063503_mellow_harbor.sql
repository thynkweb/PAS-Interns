/*
  # Add more sample data

  1. New Data
    - Additional donations with varied amounts and messages
    - More user ranks data
    - Updated donation statistics
    - Additional community comments and reactions

  2. Changes
    - Adds realistic donation patterns
    - Creates more engagement data
*/

-- Add more donations
INSERT INTO donations (user_id, donor_id, amount, display_name, message, is_anonymous, created_at)
VALUES 
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 25000, 'Roshni Kapoor', 'Supporting the future of education! 🌟', false, now() - interval '7 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 8000, 'Vikram Singh', 'Keep up the amazing work! 🙏', false, now() - interval '6 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 12000, 'Anonymous', 'Every child deserves quality education', true, now() - interval '5 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 15000, 'Sneha Patel', 'Making a difference together! 💫', false, now() - interval '4 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 30000, 'Arjun Mehta', 'Proud to support this noble cause 🎓', false, now() - interval '3 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 5000, 'Priya Sharma', 'For a brighter future', false, now() - interval '2 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', null, 10000, 'Rahul Kumar', 'Education empowers! ✨', false, now() - interval '1 day');

-- Add more community comments
INSERT INTO community_comments (user_id, content, created_at)
VALUES 
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 'The crowdfunding training modules have been incredibly helpful! Learning so much about effective communication and donor engagement.', now() - interval '3 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 'Just completed my first week of fundraising! The support from the community has been overwhelming. 🙏', now() - interval '2 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 'The strategies shared in the training sessions really work! Already seeing positive responses from potential donors.', now() - interval '1 day');

-- Add reactions to comments
INSERT INTO comment_reactions (comment_id, user_id, reaction)
SELECT 
  c.id,
  '362e09bc-7eb9-469f-bc6a-d44266f2c2de',
  reaction
FROM community_comments c
CROSS JOIN (
  VALUES ('❤️'), ('👍'), ('🎉'), ('🙏')
) AS reactions(reaction)
WHERE c.user_id = '362e09bc-7eb9-469f-bc6a-d44266f2c2de'
ON CONFLICT (comment_id, user_id, reaction) DO NOTHING;

-- Trigger stats update
SELECT calculate_user_ranks();
SELECT update_donation_stats();