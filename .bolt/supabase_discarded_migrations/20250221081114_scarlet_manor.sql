/*
  # Add more sample donations and donor details

  This migration adds additional sample data including:
  - More donations from existing users
  - Additional anonymous donations
  - Varied donation amounts and messages
*/

-- Add profiles first (in case they don't exist)
INSERT INTO profiles (id, username, full_name, referral_code)
VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'rahul.sharma',
  'Rahul Sharma',
  'SUNN1234'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'priya.patel',
  'Priya Patel',
  'SUNN5678'
)
ON CONFLICT (id) DO NOTHING;

-- Add new donations
INSERT INTO donations (id, donor_id, amount, created_at)
VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  '550e8400-e29b-41d4-a716-446655440000',
  7500,
  '2025-02-21T08:30:00Z'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  null,
  15000,
  '2025-02-21T09:45:00Z'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
  '550e8400-e29b-41d4-a716-446655440001',
  3000,
  '2025-02-21T11:15:00Z'
);

-- Add corresponding donor details
INSERT INTO donor_details (
  donor_id,
  donation_id,
  message,
  display_name,
  is_anonymous,
  created_at
)
VALUES
(
  '550e8400-e29b-41d4-a716-446655440000',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14',
  'Education is the most powerful weapon we can use to change the world! 🌟',
  'Rahul Sharma',
  false,
  '2025-02-21T08:30:00Z'
),
(
  null,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15',
  'Supporting this wonderful cause. Keep making a difference! 🙏',
  'Well-wisher',
  true,
  '2025-02-21T09:45:00Z'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16',
  'Happy to contribute to such a meaningful initiative! 💫',
  'Priya Patel',
  false,
  '2025-02-21T11:15:00Z'
);