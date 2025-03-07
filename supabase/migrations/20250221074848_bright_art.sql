/*
  # Add sample data for training content

  1. Sample Data
    - Training Modules
      - Module 1: How to deal with rejections
      - Module 2: How to follow up strategically
      - Module 3: Building donor relationships
      - Module 4: Digital fundraising strategies
    
    - Podcasts
      - Podcast 1: An Exclusive For Crowdfunding Interns
      - Podcast 2: 10 Years Of Muskurahat Foundation
      - Podcast 3: Success Stories from the Field
      - Podcast 4: Future of Fundraising
*/

-- Insert training modules
INSERT INTO training_modules (number, title, description, video_url)
VALUES 
  (1, 'How to deal with rejections', 'Learn effective strategies for handling and learning from rejections in fundraising', 'https://www.youtube.com/watch?v=sample1'),
  (2, 'How to follow up strategically', 'Master the art of following up with potential donors without being pushy', 'https://www.youtube.com/watch?v=sample2'),
  (3, 'Building donor relationships', 'Develop long-lasting relationships with donors through effective communication', 'https://www.youtube.com/watch?v=sample3'),
  (4, 'Digital fundraising strategies', 'Leverage digital platforms and social media for successful fundraising campaigns', 'https://www.youtube.com/watch?v=sample4');

-- Insert podcasts
INSERT INTO podcasts (number, title, description, audio_url)
VALUES 
  (1, 'An Exclusive For Crowdfunding Interns', 'Special episode featuring insights and tips for new crowdfunding interns', 'https://example.com/podcast1.mp3'),
  (2, '10 Years Of Muskurahat Foundation', 'Celebrating a decade of impact and transformation at Muskurahat Foundation', 'https://example.com/podcast2.mp3'),
  (3, 'Success Stories from the Field', 'Real stories of successful fundraising campaigns and their impact', 'https://example.com/podcast3.mp3'),
  (4, 'Future of Fundraising', 'Exploring emerging trends and technologies in charitable fundraising', 'https://example.com/podcast4.mp3');