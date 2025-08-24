import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './src/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('🔄 Starting database migration...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed. Cannot run migration.');
      process.exit(1);
    }
    
    // Read the migration file
    const migrationPath = path.join(__dirname, 'src', 'database', 'migrations', 'update-gym-visits-table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Split the SQL into individual statements, but handle function definitions and DO blocks properly
    const statements = [];
    const lines = migrationSQL.split('\n');
    let currentStatement = '';
    let inFunction = false;
    let inDoBlock = false;
    let braceCount = 0;
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip comments and empty lines
      if (trimmedLine.startsWith('--') || trimmedLine === '') {
        continue;
      }
      
      // Check if we're entering a function definition
      if (trimmedLine.includes('CREATE OR REPLACE FUNCTION') || trimmedLine.includes('CREATE FUNCTION')) {
        inFunction = true;
        braceCount = 0;
      }
      
      // Check if we're entering a DO block
      if (trimmedLine.startsWith('DO $$')) {
        inDoBlock = true;
        braceCount = 0;
      }
      
      // Count braces to track function body or DO block
      if (inFunction || inDoBlock) {
        braceCount += (trimmedLine.match(/\$\$/g) || []).length;
        if (braceCount >= 2) {
          inFunction = false;
          inDoBlock = false;
          braceCount = 0;
        }
      }
      
      currentStatement += line + '\n';
      
      // If we're not in a function/DO block and we see a semicolon, or if we've completed a function/DO block
      if (!inFunction && !inDoBlock && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
      }
    }
    
    // Add any remaining statement
    if (currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }
    
    console.log(`🔧 Executing ${statements.length} SQL statements...`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`📝 Executing statement ${i + 1}/${statements.length}...`);
          console.log(`SQL: ${statement.substring(0, 100)}...`);
          await query(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          console.error(`SQL: ${statement}`);
          // Continue with other statements unless it's a critical error
          if (error.message.includes('already exists') || error.message.includes('does not exist')) {
            console.log('⚠️  Non-critical error, continuing...');
          } else {
            throw error;
          }
        }
      }
    }
    
    console.log('🎉 Database migration completed successfully!');
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    
    // Check if new columns exist
    const checkColumns = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'gym_visits' 
      AND column_name IN ('consistency_week_start', 'consistency_points_awarded', 'check_in_type')
    `);
    
    if (checkColumns.rows.length === 3) {
      console.log('✅ New columns added successfully');
    } else {
      console.log('⚠️  Some columns may not have been added');
    }
    
    // Check if consistency_achievements table exists
    const checkTable = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'consistency_achievements'
    `);
    
    if (checkTable.rows.length > 0) {
      console.log('✅ consistency_achievements table created successfully');
    } else {
      console.log('❌ consistency_achievements table not found');
    }
    
    console.log('🏁 Migration verification completed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
