/*
  # Add sample donor details data

  This migration adds sample data to the donor_details table including:
  - Messages from donors
  - Anonymous and named donations
  - Timestamps for donations
*/

-- Add profiles first
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
);

-- Add sample donations
INSERT INTO donations (id, donor_id, amount, created_at)
VALUES
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '550e8400-e29b-41d4-a716-446655440000',
  5000,
  '2025-02-20T10:00:00Z'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  '550e8400-e29b-41d4-a716-446655440001',
  2500,
  '2025-02-19T15:30:00Z'
),
(
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  null,
  10000,
  '2025-02-18T09:15:00Z'
);

-- Add donor details
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
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Keep up the great work! 🙏',
  'Rahul Sharma',
  false,
  '2025-02-20T10:00:00Z'
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12',
  null,
  'Priya Patel',
  false,
  '2025-02-19T15:30:00Z'
),
(
  null,
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13',
  'For a better future',
  'Anonymous',
  true,
  '2025-02-18T09:15:00Z'
);