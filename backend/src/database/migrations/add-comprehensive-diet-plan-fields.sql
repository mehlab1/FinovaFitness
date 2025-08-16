-- Migration: Add comprehensive diet plan fields to diet_plan_requests table
-- Date: 2024-01-XX

-- Add comprehensive diet plan fields to existing table
ALTER TABLE diet_plan_requests 
ADD COLUMN IF NOT EXISTS diet_plan_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS comprehensive_plan_data JSONB,
ADD COLUMN IF NOT EXISTS plan_created_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS plan_updated_at TIMESTAMP;

-- Create index for comprehensive plan data queries
CREATE INDEX IF NOT EXISTS idx_diet_plan_requests_comprehensive_data 
ON diet_plan_requests USING GIN (comprehensive_plan_data);

-- Create index for diet_plan_completed status
CREATE INDEX IF NOT EXISTS idx_diet_plan_requests_completed 
ON diet_plan_requests(diet_plan_completed);

-- Add comment to new columns
COMMENT ON COLUMN diet_plan_requests.diet_plan_completed IS 'Indicates if comprehensive diet plan has been completed';
COMMENT ON COLUMN diet_plan_requests.comprehensive_plan_data IS 'Stores comprehensive diet plan data including weekly meal plans, goals, and guidelines';
COMMENT ON COLUMN diet_plan_requests.plan_created_at IS 'Timestamp when comprehensive diet plan was first created';
COMMENT ON COLUMN diet_plan_requests.plan_updated_at IS 'Timestamp when comprehensive diet plan was last updated';
