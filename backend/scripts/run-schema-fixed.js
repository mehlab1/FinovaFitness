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
    
    // Parse SQL content properly, handling PL/pgSQL functions
    const statements = parseSQLStatements(sqlContent);
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement.trim()) continue;
      
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

function parseSQLStatements(sqlContent) {
  const statements = [];
  let currentStatement = '';
  let inFunction = false;
  let inTrigger = false;
  let dollarQuoteLevel = 0;
  let inComment = false;
  
  const lines = sqlContent.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and comments
    if (!line || line.startsWith('--')) continue;
    
    // Handle block comments
    if (line.includes('/*')) {
      inComment = true;
      continue;
    }
    if (line.includes('*/')) {
      inComment = false;
      continue;
    }
    if (inComment) continue;
    
    // Check for function definitions
    if (line.toUpperCase().includes('CREATE OR REPLACE FUNCTION') || 
        line.toUpperCase().includes('CREATE FUNCTION')) {
      inFunction = true;
    }
    
    // Check for trigger definitions
    if (line.toUpperCase().includes('CREATE TRIGGER')) {
      inTrigger = true;
    }
    
    // Handle dollar quoting
    if (line.includes('$$')) {
      dollarQuoteLevel++;
    }
    
    // Add line to current statement
    currentStatement += line + '\n';
    
    // Check if statement should end
    if (line.endsWith(';') && !inFunction && !inTrigger && dollarQuoteLevel % 2 === 0) {
      // Regular statement ending
      statements.push(currentStatement.trim());
      currentStatement = '';
    } else if (inFunction && line.toUpperCase().includes('$$ LANGUAGE PLPGSQL')) {
      // Function ending
      statements.push(currentStatement.trim());
      currentStatement = '';
      inFunction = false;
    } else if (inTrigger && line.toUpperCase().includes('EXECUTE FUNCTION')) {
      // Trigger ending
      statements.push(currentStatement.trim());
      currentStatement = '';
      inTrigger = false;
    }
  }
  
  // Add any remaining statement
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }
  
  return statements.filter(stmt => stmt.trim());
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
