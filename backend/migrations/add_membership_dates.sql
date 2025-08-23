-- Migration: Add membership date fields to member_profiles table
-- Date: 2024-01-23
-- Description: Add membership_start_date and membership_end_date columns to track membership periods

-- Add membership date columns to member_profiles table
ALTER TABLE member_profiles 
ADD COLUMN membership_start_date DATE,
ADD COLUMN membership_end_date DATE;

-- Add index for efficient date-based queries
CREATE INDEX idx_member_profiles_membership_dates 
ON member_profiles (membership_start_date, membership_end_date);

-- Add comment to document the new columns
COMMENT ON COLUMN member_profiles.membership_start_date IS 'Date when membership becomes active (next day after creation)';
COMMENT ON COLUMN member_profiles.membership_end_date IS 'Date when membership expires (calculated based on plan duration)';
