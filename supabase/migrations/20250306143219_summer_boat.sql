/*
  # Add images to children records

  1. Changes
    - Updates existing children records with appropriate Unsplash images
    - Each image is carefully selected to represent children in educational settings
    - Images are appropriate and respectful
*/

UPDATE children 
SET image_url = CASE id
  WHEN (SELECT id FROM children WHERE name = 'Aarav' LIMIT 1) 
    THEN 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&h=600&fit=crop'
  WHEN (SELECT id FROM children WHERE name = 'Zara' LIMIT 1)
    THEN 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=800&h=600&fit=crop'
  WHEN (SELECT id FROM children WHERE name = 'Arjun' LIMIT 1)
    THEN 'https://images.unsplash.com/photo-1597135225846-6b798f55249e?w=800&h=600&fit=crop'
  WHEN (SELECT id FROM children WHERE name = 'Ananya' LIMIT 1)
    THEN 'https://images.unsplash.com/photo-1595911924853-1f4dbdc9f3c5?w=800&h=600&fit=crop'
  WHEN (SELECT id FROM children WHERE name = 'Vihaan' LIMIT 1)
    THEN 'https://images.unsplash.com/photo-1597037281320-db180d0e576c?w=800&h=600&fit=crop'
  WHEN (SELECT id FROM children WHERE name = 'Aisha' LIMIT 1)
    THEN 'https://images.unsplash.com/photo-1596464716066-91ddee48a30f?w=800&h=600&fit=crop'
  WHEN (SELECT id FROM children WHERE name = 'Kabir' LIMIT 1)
    THEN 'https://images.unsplash.com/photo-1597135225964-4c31d6a496c7?w=800&h=600&fit=crop'
  WHEN (SELECT id FROM children WHERE name = 'Myra' LIMIT 1)
    THEN 'https://images.unsplash.com/photo-1596464716270-78a98d60ca01?w=800&h=600&fit=crop'
  ELSE 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=800&h=600&fit=crop'
END
WHERE image_url IS NULL OR image_url = '';