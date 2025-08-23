import { query } from './src/database.js';
import fs from 'fs';
import path from 'path';

async function runTrainerRejectionMigration() {
  try {
    console.log('Starting trainer rejection columns migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'src', 'database', 'add-trainer-rejection-columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log('✅ Trainer rejection columns migration completed successfully!');
    console.log('Added columns: trainer_rejection_date, trainer_rejection_reason');
    
  } catch (error) {
    console.error('❌ Error running trainer rejection migration:', error);
    process.exit(1);
  }
}

// Run the migration
runTrainerRejectionMigration();
