/*
  # Create children table

  1. New Table
    - `children`
      - `id` (uuid, primary key)
      - `name` (text)
      - `age` (integer)
      - `location` (text)
      - `image_url` (text)
      - `description` (text)
      - `priority` (text, default 'Normal')
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on children table
    - Add policy for authenticated users to view children data
*/

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  location text NOT NULL,
  image_url text NOT NULL,
  description text,
  priority text DEFAULT 'Normal',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Create policy if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'children' 
    AND policyname = 'Children are viewable by authenticated users'
  ) THEN
    CREATE POLICY "Children are viewable by authenticated users"
      ON children
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;

-- Insert sample data only if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM children LIMIT 1) THEN
    INSERT INTO children (name, age, location, image_url, description, priority) VALUES
      (
        'Aarav Kumar',
        8,
        'Mumbai',
        'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&h=600&fit=crop',
        'Aarav is a bright and curious student who loves mathematics and science. Despite financial challenges, he maintains excellent grades and dreams of becoming a scientist.',
        'High'
      ),
      (
        'Zara Patel',
        7,
        'Delhi',
        'https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=600&fit=crop',
        'Zara has shown remarkable talent in art and creative activities. She helps take care of her younger siblings while maintaining good academic performance.',
        'Normal'
      ),
      (
        'Arjun Singh',
        9,
        'Bangalore',
        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&h=600&fit=crop',
        'Arjun excels in sports and academics. Despite losing his father recently, he remains determined to support his family by focusing on education.',
        'High'
      ),
      (
        'Priya Sharma',
        6,
        'Chennai',
        'https://images.unsplash.com/photo-1516942126524-95715d0e7696?w=800&h=600&fit=crop',
        'Priya shows exceptional potential in music and dance. Coming from a single-parent household, she needs support to pursue both academics and her artistic interests.',
        'Normal'
      ),
      (
        'Rohan Verma',
        10,
        'Pune',
        'https://images.unsplash.com/photo-1595912871934-f3284ef1cdc7?w=800&h=600&fit=crop',
        'Rohan is passionate about technology and coding. He helps younger students with their studies and dreams of becoming a software engineer.',
        'High'
      );
  END IF;
END $$;