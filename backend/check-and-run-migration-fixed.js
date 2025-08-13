import { query } from './src/database.js';

async function checkAndRunMigration() {
  try {
    console.log('Checking database schema...');
    
    // Check if the new columns exist
    const checkColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'schedule_exercises' 
      AND column_name IN ('exercise_name', 'exercise_type')
    `);
    
    console.log('Existing columns:', checkColumns.rows.map(row => row.column_name));
    
    if (checkColumns.rows.length < 2) {
      console.log('Migration needed. Running migration...');
      
      // Add new columns if they don't exist
      await query(`
        ALTER TABLE schedule_exercises 
        ADD COLUMN IF NOT EXISTS exercise_name VARCHAR(255),
        ADD COLUMN IF NOT EXISTS exercise_type VARCHAR(20) DEFAULT 'predefined'
      `);
      
      // Update existing records to populate exercise_name from exercises table
      await query(`
        UPDATE schedule_exercises 
        SET exercise_name = e.name 
        FROM exercises e 
        WHERE schedule_exercises.exercise_id = e.id 
        AND schedule_exercises.exercise_name IS NULL
      `);
      
      // Set exercise_type for existing records
      await query(`
        UPDATE schedule_exercises 
        SET exercise_type = 'predefined' 
        WHERE exercise_type IS NULL
      `);
      
      // Make exercise_name NOT NULL after populating data
      // First, ensure all records have exercise_name populated
      await query(`
        UPDATE schedule_exercises 
        SET exercise_name = 'Unknown Exercise' 
        WHERE exercise_name IS NULL
      `);
      
      // Now set NOT NULL constraint
      await query(`
        ALTER TABLE schedule_exercises 
        ALTER COLUMN exercise_name SET NOT NULL
      `);
      
      // Add constraint for exercise_type values
      await query(`
        ALTER TABLE schedule_exercises 
        ADD CONSTRAINT IF NOT EXISTS check_exercise_type 
        CHECK (exercise_type IN ('predefined', 'custom'))
      `);
      
      // Update exercise_id to allow NULL for custom exercises
      await query(`
        ALTER TABLE schedule_exercises 
        ALTER COLUMN exercise_id DROP NOT NULL
      `);
      
      // Update foreign key constraint to allow NULL
      try {
        await query(`
          ALTER TABLE schedule_exercises 
          DROP CONSTRAINT schedule_exercises_exercise_id_fkey
        `);
      } catch (e) {
        console.log('Constraint already dropped or doesn\'t exist');
      }
      
      await query(`
        ALTER TABLE schedule_exercises 
        ADD CONSTRAINT schedule_exercises_exercise_id_fkey 
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
      `);
      
      // Add indexes for better performance
      await query(`
        CREATE INDEX IF NOT EXISTS idx_schedule_exercises_exercise_name 
        ON schedule_exercises(exercise_name)
      `);
      
      await query(`
        CREATE INDEX IF NOT EXISTS idx_schedule_exercises_exercise_type 
        ON schedule_exercises(exercise_type)
      `);
      
      console.log('Migration completed successfully!');
    } else {
      console.log('Migration already applied. Schema is up to date.');
    }
    
    // Verify the schema
    const verifyColumns = await query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'schedule_exercises' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nCurrent schema:');
    verifyColumns.rows.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

checkAndRunMigration();
