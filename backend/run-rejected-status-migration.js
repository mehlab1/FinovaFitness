import { query } from './src/database.js';
import fs from 'fs';
import path from 'path';

async function runRejectedStatusMigration() {
  try {
    console.log('Starting rejected status migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'src', 'database', 'add-rejected-status.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log('✅ Rejected status migration completed successfully!');
    console.log('Updated status constraint to include: active, cancelled, expired, pending, paused, rejected');
    
  } catch (error) {
    console.error('❌ Error running rejected status migration:', error);
    process.exit(1);
  }
}

// Run the migration
runRejectedStatusMigration();
