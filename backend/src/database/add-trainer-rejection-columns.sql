-- Add trainer rejection columns to monthly_plan_subscriptions table
-- This migration adds the missing columns that the trainer subscription controller expects for rejection

-- Add trainer_rejection_date column
ALTER TABLE monthly_plan_subscriptions 
ADD COLUMN IF NOT EXISTS trainer_rejection_date TIMESTAMP;

-- Add trainer_rejection_reason column
ALTER TABLE monthly_plan_subscriptions 
ADD COLUMN IF NOT EXISTS trainer_rejection_reason TEXT;

-- Add index for trainer rejection date for better query performance
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_trainer_rejection_date 
ON monthly_plan_subscriptions(trainer_rejection_date);

-- Add comment to document the new columns
COMMENT ON COLUMN monthly_plan_subscriptions.trainer_rejection_date IS 'Timestamp when the trainer rejected this subscription request';
COMMENT ON COLUMN monthly_plan_subscriptions.trainer_rejection_reason IS 'Reason from the trainer when rejecting this subscription request';
