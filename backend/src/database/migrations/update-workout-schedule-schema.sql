-- Migration: Update workout schedule schema to support custom exercises
-- Date: 2024-12-19
-- Description: Add exercise_name and exercise_type fields to schedule_exercises table

-- Step 1: Add new columns to schedule_exercises table
ALTER TABLE schedule_exercises 
ADD COLUMN IF NOT EXISTS exercise_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS exercise_type VARCHAR(20) DEFAULT 'predefined';

-- Step 2: Update existing records to populate exercise_name from exercises table
UPDATE schedule_exercises 
SET exercise_name = e.name 
FROM exercises e 
WHERE schedule_exercises.exercise_id = e.id 
AND schedule_exercises.exercise_name IS NULL;

-- Step 3: Set exercise_type for existing records
UPDATE schedule_exercises 
SET exercise_type = 'predefined' 
WHERE exercise_type IS NULL;

-- Step 4: Make exercise_name NOT NULL after populating data
ALTER TABLE schedule_exercises 
ALTER COLUMN exercise_name SET NOT NULL;

-- Step 5: Add constraint for exercise_type values
ALTER TABLE schedule_exercises 
ADD CONSTRAINT check_exercise_type 
CHECK (exercise_type IN ('predefined', 'custom'));

-- Step 6: Update exercise_id to allow NULL for custom exercises
ALTER TABLE schedule_exercises 
ALTER COLUMN exercise_id DROP NOT NULL;

-- Step 7: Update foreign key constraint to allow NULL
ALTER TABLE schedule_exercises 
DROP CONSTRAINT IF EXISTS schedule_exercises_exercise_id_fkey;

ALTER TABLE schedule_exercises 
ADD CONSTRAINT schedule_exercises_exercise_id_fkey 
FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL;

-- Step 8: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_schedule_exercises_exercise_name 
ON schedule_exercises(exercise_name);

CREATE INDEX IF NOT EXISTS idx_schedule_exercises_exercise_type 
ON schedule_exercises(exercise_type);
