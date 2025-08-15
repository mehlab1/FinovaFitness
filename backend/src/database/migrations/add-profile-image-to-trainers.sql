-- Add profile_image field to trainers table
ALTER TABLE IF EXISTS trainers 
ADD COLUMN IF NOT EXISTS profile_image TEXT;

-- Add comment to the column
COMMENT ON COLUMN trainers.profile_image IS 'Path to trainer profile image file';
