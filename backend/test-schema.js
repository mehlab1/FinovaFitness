import { query, testConnection } from './src/database.js';

const testSchema = async () => {
  try {
    console.log('Testing database schema...');
    
    // Test connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Failed to connect to database');
    }

    // Check if gym_visits table has the new columns
    const gymVisitsColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'gym_visits' 
      AND column_name IN ('consistency_week_start', 'consistency_points_awarded', 'check_in_type')
      ORDER BY column_name
    `);
    
    console.log('Gym visits new columns:', gymVisitsColumns.rows);

    // Check if consistency_achievements table exists
    const consistencyTable = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'consistency_achievements'
    `);
    
    console.log('Consistency achievements table exists:', consistencyTable.rows.length > 0);

    // Check indexes
    const indexes = await query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE tablename IN ('gym_visits', 'consistency_achievements')
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname
    `);
    
    console.log('New indexes:', indexes.rows);

    console.log('Schema test completed successfully!');
    
  } catch (error) {
    console.error('Schema test failed:', error.message);
  }
};

testSchema();
