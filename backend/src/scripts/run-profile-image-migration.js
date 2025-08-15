import { query } from '../database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Running profile image migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, '../database/migrations/add-profile-image-to-trainers.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Execute the migration
    await query(migrationSQL);
    
    console.log('✅ Profile image migration completed successfully!');
    
    // Verify the column was added
    const result = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'trainers' AND column_name = 'profile_image'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ profile_image column verified in trainers table');
      console.log('Column details:', result.rows[0]);
    } else {
      console.log('❌ profile_image column not found in trainers table');
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
