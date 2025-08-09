import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Test connection first
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // Read and execute schema files in order
    const schemaFiles = [
      'core-tables.sql',
      'member-tables.sql', 
      'trainer-tables.sql',
      'indexes.sql'
    ];

    for (const schemaFile of schemaFiles) {
      const schemaPath = path.join(__dirname, 'schemas', schemaFile);
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
          await query(statement);
        }
      }
      
      console.log(`✅ ${schemaFile} executed successfully`);
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📋 All tables, indexes, and constraints have been created.');
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => {
      console.log('✨ Database is ready to use!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Initialization failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;
