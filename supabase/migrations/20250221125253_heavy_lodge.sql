/*
  # Add donations for specific user

  1. Changes
    - Insert new donations for user ID: 362e09bc-7eb9-469f-bc6a-d44266f2c2de
*/

INSERT INTO donations (user_id, amount, display_name, message, is_anonymous, created_at)
VALUES 
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 12000, 'Amit Kumar', 'Supporting education for all! 🎓', false, now() - interval '2 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 8500, 'Neha Singh', 'Every child deserves quality education 🌟', false, now() - interval '1 day'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 15000, 'Anonymous Donor', 'Keep up the amazing work!', true, now()),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 5000, 'Rajesh Verma', null, false, now() - interval '3 days'),
  ('362e09bc-7eb9-469f-bc6a-d44266f2c2de', 20000, 'Meera Patel', 'Proud to support this cause! 🙏', false, now() - interval '12 hours');