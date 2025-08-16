import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Starting diet plan requests table migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations/add-diet-plan-requests-table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log('✅ Diet plan requests table migration completed successfully!');
    
    // Verify the table was created
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'diet_plan_requests'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful: diet_plan_requests table exists');
      
      // Show table structure
      const structure = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'diet_plan_requests'
        ORDER BY ordinal_position
      `);
      
      console.log('\n📋 Table structure:');
      structure.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
    } else {
      console.log('❌ Table verification failed: diet_plan_requests table not found');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
