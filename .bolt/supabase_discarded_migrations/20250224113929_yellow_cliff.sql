/*
  # Fix user data and relationships

  1. Changes
    - Create auth users first
    - Create matching public users
    - Update related data
*/

-- Create auth users first
DO $$
DECLARE
  auth_user_id uuid;
  auth_user_ids uuid[] := ARRAY[]::uuid[];
  i integer;
BEGIN
  -- Create auth users
  FOR i IN 1..10 LOOP
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'user' || i || '@example.com',
      '$2a$10$Q7HGHS.7L/11Jk0M8FPrT.S0meG.j9NI7O4OKz.3pYnZqm3OyR5Vy',
      now(),
      '{"provider": "email", "providers": ["email"]}',
      jsonb_build_object(
        'full_name',
        CASE i
          WHEN 1 THEN 'Anna Kapoor'
          WHEN 2 THEN 'Aditri Singh'
          WHEN 3 THEN 'Aahana Reddy'
          WHEN 4 THEN 'Komal Verma'
          WHEN 5 THEN 'Deeya Patel'
          WHEN 6 THEN 'Katyayini Sharma'
          WHEN 7 THEN 'Aradhana Reddy'
          WHEN 8 THEN 'Kratika Gupta'
          WHEN 9 THEN 'Bushra Khan'
          ELSE 'Aastha Jain'
        END,
        'avatar_url',
        CASE i
          WHEN 1 THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
          WHEN 2 THEN 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
          WHEN 3 THEN 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'
          WHEN 4 THEN 'https://images.unsplash.com/photo-1517841905240-472988babdf9'
          WHEN 5 THEN 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
          WHEN 6 THEN 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce'
          WHEN 7 THEN 'https://images.unsplash.com/photo-1526510747491-58f928ec870f'
          WHEN 8 THEN 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263'
          WHEN 9 THEN 'https://images.unsplash.com/photo-1548142813-c348350df52b'
          ELSE 'https://images.unsplash.com/photo-1544717305-2782549b5136'
        END
      ),
      now(),
      now(),
      encode(gen_random_bytes(32), 'base64'),
      null,
      null,
      null
    ) RETURNING id INTO auth_user_id;
    
    auth_user_ids := array_append(auth_user_ids, auth_user_id);
  END LOOP;

  -- Create public users
  FOR i IN 1..array_length(auth_user_ids, 1) LOOP
    INSERT INTO public.users (
      id,
      email,
      full_name,
      avatar_url,
      days_left,
      referral_code,
      created_at
    ) VALUES (
      auth_user_ids[i],
      'user' || i || '@example.com',
      CASE i
        WHEN 1 THEN 'Anna Kapoor'
        WHEN 2 THEN 'Aditri Singh'
        WHEN 3 THEN 'Aahana Reddy'
        WHEN 4 THEN 'Komal Verma'
        WHEN 5 THEN 'Deeya Patel'
        WHEN 6 THEN 'Katyayini Sharma'
        WHEN 7 THEN 'Aradhana Reddy'
        WHEN 8 THEN 'Kratika Gupta'
        WHEN 9 THEN 'Bushra Khan'
        ELSE 'Aastha Jain'
      END,
      CASE i
        WHEN 1 THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'
        WHEN 2 THEN 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'
        WHEN 3 THEN 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80'
        WHEN 4 THEN 'https://images.unsplash.com/photo-1517841905240-472988babdf9'
        WHEN 5 THEN 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'
        WHEN 6 THEN 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce'
        WHEN 7 THEN 'https://images.unsplash.com/photo-1526510747491-58f928ec870f'
        WHEN 8 THEN 'https://images.unsplash.com/photo-1517365830460-955ce3ccd263'
        WHEN 9 THEN 'https://images.unsplash.com/photo-1548142813-c348350df52b'
        ELSE 'https://images.unsplash.com/photo-1544717305-2782549b5136'
      END,
      30,
      generate_readable_referral_code(
        CASE i
          WHEN 1 THEN 'Anna Kapoor'
          WHEN 2 THEN 'Aditri Singh'
          WHEN 3 THEN 'Aahana Reddy'
          WHEN 4 THEN 'Komal Verma'
          WHEN 5 THEN 'Deeya Patel'
          WHEN 6 THEN 'Katyayini Sharma'
          WHEN 7 THEN 'Aradhana Reddy'
          WHEN 8 THEN 'Kratika Gupta'
          WHEN 9 THEN 'Bushra Khan'
          ELSE 'Aastha Jain'
        END
      ),
      now() - (i || ' days')::interval
    );
  END LOOP;

  -- Create fundraising amounts
  INSERT INTO fundraising_amounts (
    user_id,
    current_amount,
    target_amount,
    created_at
  )
  SELECT
    id,
    CASE row_number() OVER (ORDER BY created_at)
      WHEN 1 THEN 85000
      WHEN 2 THEN 75000
      WHEN 3 THEN 65000
      WHEN 4 THEN 55000
      WHEN 5 THEN 45000
      WHEN 6 THEN 35000
      WHEN 7 THEN 25000
      WHEN 8 THEN 15000
      WHEN 9 THEN 5000
      ELSE 5000
    END,
    100000,
    created_at
  FROM users
  WHERE NOT EXISTS (
    SELECT 1 FROM fundraising_amounts WHERE fundraising_amounts.user_id = users.id
  );

  -- Create user ranks
  INSERT INTO user_ranks (
    user_id,
    rank_position,
    total_amount,
    total_donors,
    avg_donation,
    rank_title
  )
  SELECT
    id,
    row_number() OVER (ORDER BY created_at),
    CASE row_number() OVER (ORDER BY created_at)
      WHEN 1 THEN 85000
      WHEN 2 THEN 75000
      WHEN 3 THEN 65000
      WHEN 4 THEN 55000
      WHEN 5 THEN 45000
      WHEN 6 THEN 35000
      WHEN 7 THEN 25000
      WHEN 8 THEN 15000
      WHEN 9 THEN 5000
      ELSE 5000
    END,
    CASE row_number() OVER (ORDER BY created_at)
      WHEN 1 THEN 10
      WHEN 2 THEN 8
      WHEN 3 THEN 7
      WHEN 4 THEN 6
      WHEN 5 THEN 5
      WHEN 6 THEN 4
      WHEN 7 THEN 3
      WHEN 8 THEN 2
      ELSE 1
    END,
    CASE row_number() OVER (ORDER BY created_at)
      WHEN 1 THEN 8500
      WHEN 2 THEN 9375
      WHEN 3 THEN 9285.71
      WHEN 4 THEN 9166.67
      WHEN 5 THEN 9000
      WHEN 6 THEN 8750
      WHEN 7 THEN 8333.33
      WHEN 8 THEN 7500
      ELSE 5000
    END,
    CASE 
      WHEN row_number() OVER (ORDER BY created_at) <= 5 THEN 'Wizard'
      WHEN row_number() OVER (ORDER BY created_at) <= 7 THEN 'Expert'
      WHEN row_number() OVER (ORDER BY created_at) <= 9 THEN 'Advanced'
      ELSE 'Beginner'
    END
  FROM users
  WHERE NOT EXISTS (
    SELECT 1 FROM user_ranks WHERE user_ranks.user_id = users.id
  );
END $$;