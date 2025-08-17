-- Nutritionist Ratings and Reviews Schema
-- This file creates the necessary tables for nutritionist reviews

-- Nutritionist Session Ratings Table
CREATE TABLE IF NOT EXISTS nutritionist_session_ratings (
    id SERIAL PRIMARY KEY,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_request_id INTEGER REFERENCES nutritionist_session_requests(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    nutritional_guidance INTEGER CHECK (nutritional_guidance BETWEEN 1 AND 5),
    communication INTEGER CHECK (communication BETWEEN 1 AND 5),
    punctuality INTEGER CHECK (punctuality BETWEEN 1 AND 5),
    professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
    session_effectiveness INTEGER CHECK (session_effectiveness BETWEEN 1 AND 5),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_request_id) -- One rating per session request
);

-- Nutritionist Diet Plan Ratings Table
CREATE TABLE IF NOT EXISTS nutritionist_diet_plan_ratings (
    id SERIAL PRIMARY KEY,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    diet_plan_request_id INTEGER REFERENCES diet_plan_requests(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    meal_plan_quality INTEGER CHECK (meal_plan_quality BETWEEN 1 AND 5),
    nutritional_accuracy INTEGER CHECK (nutritional_accuracy BETWEEN 1 AND 5),
    customization_level INTEGER CHECK (customization_level BETWEEN 1 AND 5),
    support_quality INTEGER CHECK (support_quality BETWEEN 1 AND 5),
    follow_up_support INTEGER CHECK (follow_up_support BETWEEN 1 AND 5),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(diet_plan_request_id) -- One rating per diet plan request
);

-- Add has_review field to nutritionist_session_requests table
ALTER TABLE nutritionist_session_requests 
ADD COLUMN IF NOT EXISTS has_review BOOLEAN DEFAULT false;

-- Add has_review field to diet_plan_requests table
ALTER TABLE diet_plan_requests 
ADD COLUMN IF NOT EXISTS has_review BOOLEAN DEFAULT false;

-- Add rating field to users table for nutritionists (if not exists)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 0;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_nutritionist_session_ratings_nutritionist_id ON nutritionist_session_ratings(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_session_ratings_client_id ON nutritionist_session_ratings(client_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_session_ratings_session_request_id ON nutritionist_session_ratings(session_request_id);

CREATE INDEX IF NOT EXISTS idx_nutritionist_diet_plan_ratings_nutritionist_id ON nutritionist_diet_plan_ratings(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_diet_plan_ratings_client_id ON nutritionist_diet_plan_ratings(client_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_diet_plan_ratings_diet_plan_request_id ON nutritionist_diet_plan_ratings(diet_plan_request_id);

-- Create indexes for has_review fields
CREATE INDEX IF NOT EXISTS idx_nutritionist_session_requests_has_review ON nutritionist_session_requests(has_review);
CREATE INDEX IF NOT EXISTS idx_diet_plan_requests_has_review ON diet_plan_requests(has_review);
