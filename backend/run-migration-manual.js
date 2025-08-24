import { query, testConnection } from './src/database.js';

const runMigrationManual = async () => {
  try {
    console.log('🚀 Starting manual gym visits table migration...');
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // Migration statements
    const statements = [
      // Step 1: Remove the UNIQUE constraint on (user_id, visit_date) to allow multiple check-ins per day
      "ALTER TABLE gym_visits DROP CONSTRAINT IF EXISTS gym_visits_user_id_visit_date_key",
      
      // Step 2: Add new fields for consistency tracking and check-in type
      "ALTER TABLE gym_visits ADD COLUMN IF NOT EXISTS consistency_week_start DATE",
      "ALTER TABLE gym_visits ADD COLUMN IF NOT EXISTS consistency_points_awarded BOOLEAN DEFAULT false",
      "ALTER TABLE gym_visits ADD COLUMN IF NOT EXISTS check_in_type VARCHAR(20) DEFAULT 'manual'",
      
      // Step 3: Add indexes for performance
      "CREATE INDEX IF NOT EXISTS idx_gym_visits_user_date ON gym_visits(user_id, visit_date)",
      "CREATE INDEX IF NOT EXISTS idx_gym_visits_consistency_week ON gym_visits(user_id, consistency_week_start)",
      "CREATE INDEX IF NOT EXISTS idx_gym_visits_check_in_type ON gym_visits(check_in_type)",
      
      // Step 4: Update existing records to set consistency_week_start
      "UPDATE gym_visits SET consistency_week_start = DATE_TRUNC('week', visit_date)::date WHERE consistency_week_start IS NULL",
      
      // Step 5: Create consistency_achievements table
      `CREATE TABLE IF NOT EXISTS consistency_achievements (
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
      )`,
      
      // Step 6: Add indexes for consistency_achievements table
      "CREATE INDEX IF NOT EXISTS idx_consistency_achievements_user_id ON consistency_achievements(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_consistency_achievements_week_start ON consistency_achievements(week_start_date)",
      "CREATE INDEX IF NOT EXISTS idx_consistency_achievements_consistency ON consistency_achievements(consistency_achieved)",
      
      // Step 7: Create trigger function
      `CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql'`,
      
      // Step 8: Create trigger
      `CREATE TRIGGER update_consistency_achievements_updated_at 
          BEFORE UPDATE ON consistency_achievements 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()`
    ];

    console.log(`Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 50)}...`);
      try {
        await query(statement);
        console.log(`[${i + 1}/${statements.length}] ✅ Success`);
      } catch (error) {
        console.error(`[${i + 1}/${statements.length}] ❌ Error:`, error.message);
        throw error;
      }
    }
    
    console.log('✅ Gym visits table migration completed successfully!');
    console.log('📋 Table modifications and new tables have been created.');
    
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrationManual()
    .then(() => {
      console.log('✨ Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    });
}

export default runMigrationManual;
