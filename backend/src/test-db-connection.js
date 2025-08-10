import { query, testConnection } from './database.js';

const testDatabase = async () => {
  try {
    console.log('🔌 Testing database connection...');
    
    // Test basic connection
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Database connection failed');
      return;
    }

    console.log('✅ Database connection successful');

    // Check if tables exist
    console.log('\n📋 Checking existing tables...');
    
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length === 0) {
      console.log('❌ No tables found in database');
    } else {
      console.log('✅ Found tables:');
      tablesResult.rows.forEach(row => {
        console.log(`   - ${row.table_name}`);
      });
    }

    // Check if users table exists and has data
    console.log('\n👥 Checking users table...');
    try {
      const usersResult = await query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ Users table exists with ${usersResult.rows[0].count} users`);
    } catch (error) {
      console.log('❌ Users table does not exist or has issues');
    }

  } catch (error) {
    console.error('❌ Error testing database:', error);
  }
};

// Run the script
testDatabase();
