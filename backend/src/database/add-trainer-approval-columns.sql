-- Add trainer approval columns to monthly_plan_subscriptions table
-- This migration adds the missing columns that the trainer subscription controller expects

-- Add trainer_approval_date column
ALTER TABLE monthly_plan_subscriptions 
ADD COLUMN IF NOT EXISTS trainer_approval_date TIMESTAMP;

-- Add trainer_approval_notes column
ALTER TABLE monthly_plan_subscriptions 
ADD COLUMN IF NOT EXISTS trainer_approval_notes TEXT;

-- Add index for trainer approval date for better query performance
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_trainer_approval_date 
ON monthly_plan_subscriptions(trainer_approval_date);

-- Add comment to document the new columns
COMMENT ON COLUMN monthly_plan_subscriptions.trainer_approval_date IS 'Timestamp when the trainer approved this subscription request';
COMMENT ON COLUMN monthly_plan_subscriptions.trainer_approval_notes IS 'Notes from the trainer when approving this subscription request';
