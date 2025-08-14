-- Migration: Add subscription_status field to users and member_profiles tables
-- This migration adds the ability to track subscription status (active, paused, cancelled, expired)

-- Add subscription_status to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active' 
CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'expired'));

-- Add subscription_status to member_profiles table
ALTER TABLE member_profiles 
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active' 
CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'expired'));

-- Create index for efficient subscription status queries
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_member_profiles_subscription_status ON member_profiles(subscription_status);

-- Update existing records to have 'active' status
UPDATE users SET subscription_status = 'active' WHERE subscription_status IS NULL;
UPDATE member_profiles SET subscription_status = 'active' WHERE subscription_status IS NULL;

-- Add comment to document the field
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status: active, paused, cancelled, or expired';
COMMENT ON COLUMN member_profiles.subscription_status IS 'Current subscription status: active, paused, cancelled, or expired';
