import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from './database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runSchemaManually = async () => {
  try {
    console.log('🚀 Running schema files manually...');
    
    // Read and execute schema files in order
    const schemaFiles = [
      'core-tables.sql',
      'member-tables.sql', 
      'trainer-tables.sql',
      'indexes.sql'
    ];

    for (const schemaFile of schemaFiles) {
      const schemaPath = path.join(__dirname, 'database', 'schemas', schemaFile);
      console.log(`📄 Executing ${schemaFile}...`);
      
      if (!fs.existsSync(schemaPath)) {
        console.warn(`⚠️  Schema file ${schemaFile} not found, skipping...`);
        continue;
      }

      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      console.log(`📝 File size: ${schemaSQL.length} characters`);
      
      // Split by semicolon and execute each statement
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      console.log(`🔢 Found ${statements.length} statements to execute`);

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (statement.trim()) {
          try {
            console.log(`   Executing statement ${i + 1}/${statements.length}...`);
            await query(statement);
            console.log(`   ✅ Statement ${i + 1} executed successfully`);
          } catch (error) {
            console.error(`   ❌ Error in statement ${i + 1}:`, error.message);
            // Continue with next statement
          }
        }
      }
      
      console.log(`✅ ${schemaFile} completed`);
    }

    console.log('🎉 Schema execution completed!');
    
  } catch (error) {
    console.error('❌ Schema execution failed:', error);
  }
};

// Run the script
runSchemaManually();
