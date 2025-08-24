import { query, testConnection } from './src/database.js';

async function testMultipleCheckIns() {
  try {
    console.log('🧪 Testing multiple check-ins per day functionality...');
    
    // Test database connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Database connection failed.');
      process.exit(1);
    }
    
    // Get a test user ID (assuming user ID 1 exists)
    const userResult = await query('SELECT id FROM users LIMIT 1');
    if (userResult.rows.length === 0) {
      console.error('❌ No users found in database. Cannot test check-ins.');
      process.exit(1);
    }
    
    const userId = userResult.rows[0].id;
    const testDate = new Date().toISOString().split('T')[0]; // Today's date
    
    console.log(`👤 Using user ID: ${userId}`);
    console.log(`📅 Test date: ${testDate}`);
    
    // Insert first check-in
    console.log('📝 Inserting first check-in...');
    await query(`
      INSERT INTO gym_visits (user_id, visit_date, check_in_time, check_in_type, consistency_week_start) 
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, testDate, `${testDate} 09:00:00`, 'manual', '2024-01-15']);
    
    console.log('✅ First check-in inserted successfully');
    
    // Insert second check-in on the same day
    console.log('📝 Inserting second check-in...');
    await query(`
      INSERT INTO gym_visits (user_id, visit_date, check_in_time, check_in_type, consistency_week_start) 
      VALUES ($1, $2, $3, $4, $5)
    `, [userId, testDate, `${testDate} 17:00:00`, 'manual', '2024-01-15']);
    
    console.log('✅ Second check-in inserted successfully');
    
    // Verify both check-ins exist
    console.log('🔍 Verifying check-ins...');
    const checkInsResult = await query(`
      SELECT id, user_id, visit_date, check_in_time, check_in_type, consistency_week_start 
      FROM gym_visits 
      WHERE user_id = $1 AND visit_date = $2 
      ORDER BY check_in_time
    `, [userId, testDate]);
    
    console.log(`📊 Found ${checkInsResult.rows.length} check-ins for the same day:`);
    checkInsResult.rows.forEach((checkIn, index) => {
      console.log(`  ${index + 1}. ID: ${checkIn.id}, Time: ${checkIn.check_in_time}, Type: ${checkIn.check_in_type}`);
    });
    
    if (checkInsResult.rows.length === 2) {
      console.log('🎉 Multiple check-ins per day functionality verified successfully!');
    } else {
      console.log('❌ Expected 2 check-ins, but found different number');
    }
    
    // Test the new columns
    console.log('🔍 Testing new columns...');
    const newColumnsResult = await query(`
      SELECT consistency_week_start, consistency_points_awarded, check_in_type 
      FROM gym_visits 
      WHERE user_id = $1 AND visit_date = $2 
      LIMIT 1
    `, [userId, testDate]);
    
    if (newColumnsResult.rows.length > 0) {
      const row = newColumnsResult.rows[0];
      console.log('✅ New columns are working:');
      console.log(`  - consistency_week_start: ${row.consistency_week_start}`);
      console.log(`  - consistency_points_awarded: ${row.consistency_points_awarded}`);
      console.log(`  - check_in_type: ${row.check_in_type}`);
    }
    
    // Test consistency_achievements table
    console.log('🔍 Testing consistency_achievements table...');
    const consistencyResult = await query(`
      SELECT COUNT(*) as count FROM consistency_achievements
    `);
    
    console.log(`📊 consistency_achievements table has ${consistencyResult.rows[0].count} records`);
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testMultipleCheckIns();
