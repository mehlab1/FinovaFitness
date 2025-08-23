import { query } from './src/database.js';
import fs from 'fs';
import path from 'path';

async function runTrainerApprovalMigration() {
  try {
    console.log('Starting trainer approval columns migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'src', 'database', 'add-trainer-approval-columns.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log('✅ Trainer approval columns migration completed successfully!');
    console.log('Added columns: trainer_approval_date, trainer_approval_notes');
    
  } catch (error) {
    console.error('❌ Error running trainer approval migration:', error);
    process.exit(1);
  }
}

// Run the migration
runTrainerApprovalMigration();
