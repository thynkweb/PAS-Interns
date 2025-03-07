/*
  # Add additional children data

  1. New Data
    - Add more children records to the existing children table
    - Includes diverse backgrounds and educational needs
  2. No Schema Changes
    - Uses existing children table structure
    - No new tables or columns added
*/

-- Insert additional children data
INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Ananya Reddy', 8, 'Mumbai', 'https://images.unsplash.com/photo-1595814433015-e6f5ce69614e?w=500&h=500&fit=crop', 'Ananya is a talented dancer who also excels in her studies. Coming from a single-parent household, she shows incredible determination and helps care for her younger siblings while maintaining excellent grades.', 'High');

INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Vihaan Malhotra', 6, 'Kolkata', 'https://images.unsplash.com/photo-1545266241-2d0dacb7095b?w=500&h=500&fit=crop', 'Vihaan has a natural aptitude for languages and can already speak three different ones. Despite living in a resource-constrained environment, he actively participates in all school activities and has a passion for storytelling.', 'Normal');

INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Zara Khan', 7, 'Bangalore', 'https://images.unsplash.com/photo-1516942126524-9d570b0a8232?w=500&h=500&fit=crop', 'Zara shows exceptional talent in mathematics and problem-solving. She lives with her grandparents who work as daily wage laborers. Despite the challenges, she never misses school and dreams of becoming a computer engineer.', 'High');

INSERT INTO children (name, age, location, image_url, description, priority) VALUES
  ('Advait Joshi', 9, 'Chennai', 'https://images.unsplash.com/photo-1542813813-1f873f9377e0?w=500&h=500&fit=crop', 'Advait is passionate about environmental conservation and organizes small clean-up drives in his neighborhood. He walks 3km to school every day and has perfect attendance despite the distance. He hopes to become an environmental scientist.', 'Normal');