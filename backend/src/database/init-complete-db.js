import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection, getClient } from '../database.js';
import initializeSampleData from './init-sample-data.js';
import { runCompleteInitialization as initializeTrainerSchedules } from './init-trainer-schedules.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(path.dirname(__filename));

const initializeCompleteDatabase = async () => {
  try {
    console.log('🚀 Starting complete database initialization...');
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    console.log('📊 Creating database schema...');
    
    // Read and execute schema files in order
    const schemaFiles = [
      'core-tables.sql',
      'member-tables.sql', 
      'trainer-tables.sql',
      'trainer-schedules.sql',
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
      
      // Split by semicolon and execute each statement
      const statements = schemaSQL
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await query(statement);
          } catch (error) {
            // Skip if table already exists
            if (error.message.includes('already exists')) {
              console.log(`ℹ️  Table already exists, skipping...`);
            } else {
              throw error;
            }
          }
        }
      }
      
      console.log(`✅ ${schemaFile} executed successfully`);
    }

    console.log('🎯 Initializing sample data...');
    await initializeSampleData();

    console.log('🎯 Initializing trainer schedules...');
    await initializeTrainerSchedules();

    console.log('🎉 Complete database initialization finished!');
    console.log('📋 All tables, indexes, constraints, and sample data have been created.');
    
    return true;
  } catch (error) {
    console.error('❌ Complete database initialization failed:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeCompleteDatabase()
    .then(() => {
      console.log('✨ Database is completely ready to use!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

export default initializeCompleteDatabase;
