import { query } from '../config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runNutritionistScheduleSchema() {
  try {
    console.log('Running nutritionist schedule schema...');
    
    // Read the SQL file
    const schemaPath = path.join(__dirname, '../database/schemas/nutritionist-schedules.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await query(statement);
          console.log(`Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`Error executing statement ${i + 1}:`, error.message);
          // Continue with other statements
        }
      }
    }
    
    console.log('Nutritionist schedule schema completed successfully!');
    
  } catch (error) {
    console.error('Error running nutritionist schedule schema:', error);
  } finally {
    process.exit(0);
  }
}

runNutritionistScheduleSchema();
