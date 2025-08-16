-- Migration: Add diet_plan_requests table
-- Date: 2024-01-XX

-- Create diet plan requests table
CREATE TABLE IF NOT EXISTS diet_plan_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    fitness_goal VARCHAR(100) NOT NULL,
    current_weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    target_weight DECIMAL(5,2) NOT NULL,
    activity_level VARCHAR(50) NOT NULL,
    monthly_budget DECIMAL(10,2) NOT NULL,
    dietary_restrictions TEXT,
    additional_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    nutritionist_notes TEXT,
    preparation_time VARCHAR(100),
    meal_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_diet_plan_requests_user_id ON diet_plan_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_diet_plan_requests_nutritionist_id ON diet_plan_requests(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_diet_plan_requests_status ON diet_plan_requests(status);

-- Add comment to table
COMMENT ON TABLE diet_plan_requests IS 'Stores diet plan requests from members to nutritionists';
