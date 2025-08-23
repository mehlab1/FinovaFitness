-- Add 'rejected' status to monthly_plan_subscriptions table
-- This migration updates the status constraint to include 'rejected' as a valid status

-- First, drop the existing constraint
ALTER TABLE monthly_plan_subscriptions 
DROP CONSTRAINT IF EXISTS monthly_plan_subscriptions_status_check;

-- Add the new constraint that includes 'rejected'
ALTER TABLE monthly_plan_subscriptions 
ADD CONSTRAINT monthly_plan_subscriptions_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'paused', 'rejected'));

-- Add comment to document the change
COMMENT ON CONSTRAINT monthly_plan_subscriptions_status_check ON monthly_plan_subscriptions IS 'Status constraint updated to include rejected status for trainer subscription management';
