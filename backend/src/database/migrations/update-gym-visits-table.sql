-- Migration: Update gym_visits table for manual check-in functionality
-- Date: 2024-01-15
-- Description: Modify gym_visits table to support multiple check-ins per day and consistency tracking

-- Step 1: Remove the UNIQUE constraint on (user_id, visit_date) to allow multiple check-ins per day
ALTER TABLE gym_visits DROP CONSTRAINT IF EXISTS gym_visits_user_id_visit_date_key;

-- Step 2: Add new fields for consistency tracking and check-in type
ALTER TABLE gym_visits 
ADD COLUMN IF NOT EXISTS consistency_week_start DATE,
ADD COLUMN IF NOT EXISTS consistency_points_awarded BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS check_in_type VARCHAR(20) DEFAULT 'manual';

-- Step 3: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_gym_visits_user_date ON gym_visits(user_id, visit_date);
CREATE INDEX IF NOT EXISTS idx_gym_visits_consistency_week ON gym_visits(user_id, consistency_week_start);
CREATE INDEX IF NOT EXISTS idx_gym_visits_check_in_type ON gym_visits(check_in_type);

-- Step 4: Update existing records to set consistency_week_start
UPDATE gym_visits 
SET consistency_week_start = DATE_TRUNC('week', visit_date)::date
WHERE consistency_week_start IS NULL;

-- Step 5: Create consistency_achievements table
CREATE TABLE IF NOT EXISTS consistency_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    check_ins_count INTEGER NOT NULL DEFAULT 0,
    consistency_achieved BOOLEAN DEFAULT false,
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

-- Step 6: Add indexes for consistency_achievements table
CREATE INDEX IF NOT EXISTS idx_consistency_achievements_user_id ON consistency_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_consistency_achievements_week_start ON consistency_achievements(week_start_date);
CREATE INDEX IF NOT EXISTS idx_consistency_achievements_consistency ON consistency_achievements(consistency_achieved);

-- Step 7: Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consistency_achievements_updated_at 
    BEFORE UPDATE ON consistency_achievements 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 8: Add comments for documentation
COMMENT ON TABLE gym_visits IS 'Stores all gym check-ins with support for multiple check-ins per day and consistency tracking';
COMMENT ON COLUMN gym_visits.consistency_week_start IS 'Start date of the calendar week (Monday) for consistency tracking';
COMMENT ON COLUMN gym_visits.consistency_points_awarded IS 'Whether loyalty points were awarded for this week''s consistency';
COMMENT ON COLUMN gym_visits.check_in_type IS 'Type of check-in: manual, qr, mobile, kiosk';

COMMENT ON TABLE consistency_achievements IS 'Tracks weekly consistency achievements and loyalty points awarded';
COMMENT ON COLUMN consistency_achievements.consistency_achieved IS 'Whether the member achieved 5+ check-ins in this week';
COMMENT ON COLUMN consistency_achievements.points_awarded IS 'Number of loyalty points awarded for this week''s consistency';

-- Step 9: Verify the migration
DO $$
BEGIN
    -- Check if gym_visits table has the new columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gym_visits' 
        AND column_name = 'consistency_week_start'
    ) THEN
        RAISE EXCEPTION 'Migration failed: consistency_week_start column not found';
    END IF;
    
    -- Check if consistency_achievements table exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'consistency_achievements'
    ) THEN
        RAISE EXCEPTION 'Migration failed: consistency_achievements table not created';
    END IF;
    
    RAISE NOTICE 'Migration completed successfully';
END $$;
