import { query } from '../database.js';

const testTrainerEndpoint = async () => {
  try {
    console.log('🧪 Testing trainer endpoint and database tables...');
    
    // Test 1: Check if trainer_availability table exists
    console.log('\n1️⃣ Checking if trainer_availability table exists...');
    try {
      const result = await query('SELECT COUNT(*) FROM trainer_availability');
      console.log('✅ trainer_availability table exists with', result.rows[0].count, 'rows');
    } catch (error) {
      console.log('❌ trainer_availability table does not exist:', error.message);
    }
    
    // Test 2: Check if trainer_schedules table exists
    console.log('\n2️⃣ Checking if trainer_schedules table exists...');
    try {
      const result = await query('SELECT COUNT(*) FROM trainer_schedules');
      console.log('✅ trainer_schedules table exists with', result.rows[0].count, 'rows');
    } catch (error) {
      console.log('❌ trainer_schedules table does not exist:', error.message);
    }
    
    // Test 3: Check if trainers table exists and has data
    console.log('\n3️⃣ Checking if trainers table exists and has data...');
    try {
      const result = await query('SELECT COUNT(*) FROM trainers');
      console.log('✅ trainers table exists with', result.rows[0].count, 'rows');
      
      if (result.rows[0].count > 0) {
        const trainerResult = await query('SELECT id, user_id FROM trainers LIMIT 1');
        console.log('📋 Sample trainer:', trainerResult.rows[0]);
      }
    } catch (error) {
      console.log('❌ trainers table does not exist:', error.message);
    }
    
    // Test 4: Check if users table exists and has trainer users
    console.log('\n4️⃣ Checking if users table exists and has trainer users...');
    try {
      const result = await query('SELECT COUNT(*) FROM users');
      console.log('✅ users table exists with', result.rows[0].count, 'rows');
      
      if (result.rows[0].count > 0) {
        const userResult = await query('SELECT id, first_name, last_name, role FROM users WHERE role = \'trainer\' LIMIT 1');
        if (userResult.rows.length > 0) {
          console.log('📋 Sample trainer user:', userResult.rows[0]);
        } else {
          console.log('⚠️ No trainer users found in users table');
        }
      }
    } catch (error) {
      console.log('❌ users table does not exist:', error.message);
    }
    
    console.log('\n🎯 Test completed!');
    
  } catch (error) {
    console.error('💥 Test failed:', error);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testTrainerEndpoint()
    .then(() => {
      console.log('✨ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Test failed:', error);
      process.exit(1);
    });
}

export default testTrainerEndpoint;
