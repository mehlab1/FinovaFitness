-- Add sample data for trainer ID 2 to demonstrate schedule functionality
-- This script should be run after the main schema.sql

-- Insert trainer availability for trainer ID 2
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, session_duration_minutes, max_sessions_per_day) VALUES
(2, 1, '07:00', '19:00', 60, 8), -- Monday
(2, 2, '07:00', '19:00', 60, 8), -- Tuesday  
(2, 3, '07:00', '19:00', 60, 8), -- Wednesday
(2, 4, '07:00', '19:00', 60, 8), -- Thursday
(2, 5, '07:00', '17:00', 60, 6), -- Friday (shorter day)
(2, 6, '09:00', '15:00', 60, 4)  -- Saturday (weekend schedule)
ON CONFLICT DO NOTHING;

-- Insert some booked sessions for trainer ID 2 to show availability
-- Note: We'll use a placeholder client_id (1) for demonstration
INSERT INTO training_sessions (trainer_id, client_id, session_date, start_time, end_time, session_type, status, price, notes, payment_status) VALUES
(2, 1, CURRENT_DATE + INTERVAL '1 day', '10:00', '11:00', 'personal_training', 'scheduled', 80.00, 'Booked session', 'pending'),
(2, 1, CURRENT_DATE + INTERVAL '1 day', '14:00', '15:00', 'personal_training', 'scheduled', 80.00, 'Booked session', 'pending'),
(2, 1, CURRENT_DATE + INTERVAL '2 days', '09:00', '10:00', 'personal_training', 'scheduled', 80.00, 'Booked session', 'pending'),
(2, 1, CURRENT_DATE + INTERVAL '3 days', '16:00', '17:00', 'personal_training', 'scheduled', 80.00, 'Booked session', 'pending'),
(2, 1, CURRENT_DATE + INTERVAL '4 days', '11:00', '12:00', 'personal_training', 'scheduled', 80.00, 'Booked session', 'pending'),
(2, 1, CURRENT_DATE + INTERVAL '5 days', '13:00', '14:00', 'personal_training', 'scheduled', 80.00, 'Booked session', 'pending')
ON CONFLICT DO NOTHING;

-- Insert some time off for trainer ID 2
INSERT INTO trainer_time_off (trainer_id, start_date, end_date, start_time, end_time, reason) VALUES
(2, CURRENT_DATE + INTERVAL '7 days', CURRENT_DATE + INTERVAL '7 days', '12:00', '14:00', 'Lunch break'),
(2, CURRENT_DATE + INTERVAL '14 days', CURRENT_DATE + INTERVAL '14 days', '00:00', '23:59', 'Personal day off')
ON CONFLICT DO NOTHING;

-- Update trainer ID 2 with some specializations and bio
UPDATE trainers SET 
  specialization = ARRAY['Strength Training', 'Weight Loss', 'Sports Performance'],
  bio = 'Certified personal trainer with 8 years of experience. Specializes in strength training, weight loss, and sports performance. Former collegiate athlete with a passion for helping clients achieve their fitness goals.',
  hourly_rate = 80.00,
  experience_years = 8
WHERE id = 2;

-- Insert some ratings for trainer ID 2
-- Note: We'll use a placeholder client_id (1) for demonstration
INSERT INTO trainer_ratings (trainer_id, client_id, rating, review_text, training_effectiveness, communication, punctuality, professionalism) VALUES
(2, 1, 5, 'Excellent trainer! Helped me lose 20 pounds in 3 months.', 5, 5, 5, 5),
(2, 1, 5, 'Very knowledgeable and motivating. Great workout plans.', 5, 5, 5, 5),
(2, 1, 4, 'Good trainer, helped me improve my strength significantly.', 4, 4, 5, 5)
ON CONFLICT DO NOTHING;
