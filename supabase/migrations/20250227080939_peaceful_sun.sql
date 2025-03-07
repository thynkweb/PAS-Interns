/*
  # Create children table and sample data

  1. New Tables
    - `children`
      - `id` (uuid, primary key)
      - `name` (text)
      - `age` (integer)
      - `location` (text)
      - `image_url` (text)
      - `description` (text)
      - `priority` (text)
      - `created_at` (timestamp)
  2. Security
    - Enable RLS on `children` table
    - Add policy for authenticated users to read data
*/

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

ALTER TABLE children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Children are viewable by authenticated users"
  ON children FOR SELECT
  TO authenticated
  USING (true);

-- Insert sample children data
INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Aarav Kumar', 7, 'Delhi', 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=500&h=500&fit=crop', 'Aarav is a bright young boy with a passion for mathematics. Despite facing economic hardships, he consistently ranks top in his class and dreams of becoming an engineer someday.', 'High');

INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Meera Singh', 6, 'Delhi', 'https://images.unsplash.com/photo-1516942126524-9d570b0a8232?w=500&h=500&fit=crop', 'Meera loves drawing and storytelling. She comes from a family of migrant workers and shows remarkable creativity despite limited resources. Her teachers believe she has exceptional artistic talent.', 'High');

INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Rohan Sharma', 8, 'Delhi', 'https://images.unsplash.com/photo-1542813813-1f873f9377e0?w=500&h=500&fit=crop', 'Rohan is passionate about science and nature. He collects leaves and insects to study them, and dreams of becoming a scientist. Despite living in a slum area, his curiosity knows no bounds.', 'High');

INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Priya Patel', 5, 'Delhi', 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500&h=500&fit=crop', 'Priya is a quiet but determined girl who recently started school. She walks 2km daily to attend classes and never misses a day. Her favorite subject is language, and she is learning to read quickly.', 'Normal');

INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Arjun Verma', 9, 'Delhi', 'https://images.unsplash.com/photo-1545266241-2d0dacb7095b?w=500&h=500&fit=crop', 'Arjun has shown remarkable resilience after losing his father last year. He helps his mother at home while maintaining good grades. He loves cricket and mathematics, and wants to become a teacher.', 'High');

INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Diya Gupta', 7, 'Delhi', 'https://images.unsplash.com/photo-1516942126524-9d570b0a8232?w=500&h=500&fit=crop', 'Diya is known for her helpful nature and leadership skills. She assists younger children with their studies and organizes games during breaks. She dreams of becoming a doctor to help her community.', 'Normal');