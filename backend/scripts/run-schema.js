import { query } from './src/database.js';
import fs from 'fs';
import path from 'path';

async function runSchema() {
  try {
    console.log('=== RUNNING TRAINER SCHEDULES SCHEMA ===\n');
    
    // Read the SQL file
    const schemaPath = path.join(process.cwd(), 'src/database/schemas/trainer-schedules.sql');
    console.log(`Reading schema file: ${schemaPath}`);
    
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Schema file not found at: ${schemaPath}`);
    }
    
    const sqlContent = fs.readFileSync(schemaPath, 'utf8');
    console.log(`Schema file loaded (${sqlContent.length} characters)\n`);
    
    // Split into individual statements and execute
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement) continue;
      
      try {
        console.log(`[${i + 1}/${statements.length}] Executing statement...`);
        await query(statement);
        successCount++;
        console.log(`✓ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Check if it's a "already exists" error
        if (error.message.includes('already exists') || 
            error.message.includes('duplicate key') ||
            error.message.includes('relation') && error.message.includes('already exists')) {
          console.log(`⚠ Statement ${i + 1} skipped (already exists): ${error.message.split('\n')[0]}`);
          skipCount++;
        } else {
          console.log(`✗ Statement ${i + 1} failed: ${error.message.split('\n')[0]}`);
          errorCount++;
        }
      }
    }
    
    console.log('\n=== SCHEMA EXECUTION COMPLETED ===');
    console.log(`✓ Successful: ${successCount}`);
    console.log(`⚠ Skipped (already exists): ${skipCount}`);
    console.log(`✗ Failed: ${errorCount}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 Schema setup completed successfully!');
      console.log('You can now run: node run-trainer-schedule-init.js');
    } else {
      console.log('\n⚠ Some statements failed. Check the errors above.');
    }
    
  } catch (error) {
    console.error('\n❌ Schema execution failed:', error.message);
    if (error.code === 'ENOENT') {
      console.error('Make sure you are running this from the backend directory');
    }
  }
}

// Run the schema
runSchema()
  .then(() => {
    console.log('\nScript completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nScript failed:', error);
    process.exit(1);
  });
