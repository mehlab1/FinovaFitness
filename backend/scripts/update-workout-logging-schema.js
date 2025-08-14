import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/finovafitness',
});

async function updateWorkoutLoggingSchema() {
  const client = await pool.connect();
  
  try {
    console.log('Starting workout logging schema update...');
    
    // Start transaction
    await client.query('BEGIN');
    
    // 1. Add new columns to workout_logs table
    console.log('Adding new columns to workout_logs table...');
    
    const workoutLogsColumns = [
      'ADD COLUMN IF NOT EXISTS start_time TIME',
      'ADD COLUMN IF NOT EXISTS end_time TIME',
      'ADD COLUMN IF NOT EXISTS energy_level INTEGER',
      'ADD COLUMN IF NOT EXISTS difficulty INTEGER',
      'ADD COLUMN IF NOT EXISTS mood VARCHAR(50)',
      'ADD COLUMN IF NOT EXISTS sleep_quality INTEGER',
      'ADD COLUMN IF NOT EXISTS hydration INTEGER',
      'ADD COLUMN IF NOT EXISTS pre_workout_meal TEXT',
      'ADD COLUMN IF NOT EXISTS post_workout_meal TEXT',
      'ADD COLUMN IF NOT EXISTS supplements TEXT[]',
      'ADD COLUMN IF NOT EXISTS body_weight DECIMAL(5,2)',
      'ADD COLUMN IF NOT EXISTS body_fat_percentage DECIMAL(4,2)',
      'ADD COLUMN IF NOT EXISTS muscle_soreness VARCHAR(20)',
      'ADD COLUMN IF NOT EXISTS cardio_intensity VARCHAR(20)',
      'ADD COLUMN IF NOT EXISTS workout_focus VARCHAR(20)',
      'ADD COLUMN IF NOT EXISTS personal_notes TEXT'
    ];
    
    for (const column of workoutLogsColumns) {
      try {
        await client.query(`ALTER TABLE workout_logs ${column}`);
        console.log(`Added column: ${column}`);
      } catch (error) {
        console.log(`Column already exists or error: ${column} - ${error.message}`);
      }
    }
    
    // 2. Add constraints to workout_logs table
    console.log('Adding constraints to workout_logs table...');
    
    try {
      await client.query(`
        ALTER TABLE workout_logs 
        ADD CONSTRAINT IF NOT EXISTS check_energy_level 
        CHECK (energy_level IS NULL OR (energy_level BETWEEN 1 AND 10))
      `);
    } catch (error) {
      console.log('Energy level constraint already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE workout_logs 
        ADD CONSTRAINT IF NOT EXISTS check_difficulty 
        CHECK (difficulty IS NULL OR (difficulty BETWEEN 1 AND 10))
      `);
    } catch (error) {
      console.log('Difficulty constraint already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE workout_logs 
        ADD CONSTRAINT IF NOT EXISTS check_sleep_quality 
        CHECK (sleep_quality IS NULL OR (sleep_quality BETWEEN 1 AND 10))
      `);
    } catch (error) {
      console.log('Sleep quality constraint already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE workout_logs 
        ADD CONSTRAINT IF NOT EXISTS check_hydration 
        CHECK (hydration IS NULL OR (hydration BETWEEN 1 AND 10))
      `);
    } catch (error) {
      console.log('Hydration constraint already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE workout_logs 
        ADD CONSTRAINT IF NOT EXISTS check_muscle_soreness 
        CHECK (muscle_soreness IS NULL OR muscle_soreness IN ('None', 'Light', 'Moderate', 'Heavy'))
      `);
    } catch (error) {
      console.log('Muscle soreness constraint already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE workout_logs 
        ADD CONSTRAINT IF NOT EXISTS check_cardio_intensity 
        CHECK (cardio_intensity IS NULL OR cardio_intensity IN ('Low', 'Moderate', 'High'))
      `);
    } catch (error) {
      console.log('Cardio intensity constraint already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE workout_logs 
        ADD CONSTRAINT IF NOT EXISTS check_workout_focus 
        CHECK (workout_focus IS NULL OR workout_focus IN ('Strength', 'Hypertrophy', 'Endurance', 'Power', 'Flexibility'))
      `);
    } catch (error) {
      console.log('Workout focus constraint already exists or error:', error.message);
    }
    
    // 3. Update exercise_logs table
    console.log('Updating exercise_logs table...');
    
    try {
      await client.query(`
        ALTER TABLE exercise_logs 
        ADD COLUMN IF NOT EXISTS exercise_name VARCHAR(255)
      `);
    } catch (error) {
      console.log('Exercise name column already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE exercise_logs 
        ADD COLUMN IF NOT EXISTS muscle_group VARCHAR(100)
      `);
    } catch (error) {
      console.log('Muscle group column already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE exercise_logs 
        ADD COLUMN IF NOT EXISTS rest_seconds INTEGER DEFAULT 60
      `);
    } catch (error) {
      console.log('Rest seconds column already exists or error:', error.message);
    }
    
    try {
      await client.query(`
        ALTER TABLE exercise_logs 
        ADD COLUMN IF NOT EXISTS rpe INTEGER
      `);
    } catch (error) {
      console.log('RPE column already exists or error:', error.message);
    }
    
    // 4. Add constraints to exercise_logs table
    try {
      await client.query(`
        ALTER TABLE exercise_logs 
        ADD CONSTRAINT IF NOT EXISTS check_rpe 
        CHECK (rpe IS NULL OR (rpe BETWEEN 1 AND 10))
      `);
    } catch (error) {
      console.log('RPE constraint already exists or error:', error.message);
    }
    
    // 5. Update exercise_logs foreign key to allow NULL
    try {
      await client.query(`
        ALTER TABLE exercise_logs 
        DROP CONSTRAINT IF EXISTS exercise_logs_exercise_id_fkey
      `);
      
      await client.query(`
        ALTER TABLE exercise_logs 
        ADD CONSTRAINT exercise_logs_exercise_id_fkey 
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL
      `);
    } catch (error) {
      console.log('Exercise ID foreign key update error:', error.message);
    }
    
    // 6. Change reps column from JSONB to VARCHAR if it exists
    try {
      const columnInfo = await client.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_name = 'exercise_logs' AND column_name = 'reps'
      `);
      
      if (columnInfo.rows.length > 0 && columnInfo.rows[0].data_type === 'jsonb') {
        console.log('Converting reps column from JSONB to VARCHAR...');
        await client.query(`
          ALTER TABLE exercise_logs 
          ALTER COLUMN reps TYPE VARCHAR(50) USING reps::text
        `);
      }
    } catch (error) {
      console.log('Reps column conversion error:', error.message);
    }
    
    // Commit transaction
    await client.query('COMMIT');
    console.log('✅ Workout logging schema update completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error updating workout logging schema:', error);
    throw error;
  } finally {
    client.release();
  }
}

// Run the migration
updateWorkoutLoggingSchema()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
