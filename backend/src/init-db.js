import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query, testConnection } from './database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    console.log('🔗 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Cannot connect to database. Please check your DATABASE_URL.');
      process.exit(1);
    }

    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('🗄️  Initializing database schema...');
    
    // Execute the entire schema as one statement
    try {
      await query(schema);
      console.log('✅ Database schema created successfully!');
    } catch (error) {
      // If the schema already exists, that's fine
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Database schema already exists, skipping creation.');
      } else {
        console.error('❌ Error creating schema:', error.message);
        throw error;
      }
    }

    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Database schema has been created with all necessary tables.');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase(); 