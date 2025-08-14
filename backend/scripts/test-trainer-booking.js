import { query } from './src/database.js';

// Test script to verify trainer booking system
async function testTrainerBooking() {
  try {
    console.log('=== TESTING TRAINER BOOKING SYSTEM ===\n');

    // 1. Check if trainer_schedules table exists
    console.log('1. Checking database schema...');
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'trainer_schedules'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✓ trainer_schedules table exists');
    } else {
      console.log('✗ trainer_schedules table does not exist');
      return;
    }

    // 2. Check if triggers exist
    console.log('\n2. Checking database triggers...');
    const triggerCheck = await query(`
      SELECT trigger_name 
      FROM information_schema.triggers 
      WHERE event_object_table = 'training_sessions'
      AND trigger_name = 'trainer_schedule_booking_trigger';
    `);
    
    if (triggerCheck.rows.length > 0) {
      console.log('✓ Database triggers are set up');
    } else {
      console.log('✗ Database triggers are not set up');
    }

    // 3. Check if functions exist
    console.log('\n3. Checking database functions...');
    const functionCheck = await query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name IN ('is_slot_available', 'get_available_slots', 'initialize_trainer_schedule')
      AND routine_type = 'FUNCTION';
    `);
    
    console.log(`Found ${functionCheck.rows.length} out of 3 required functions:`);
    functionCheck.rows.forEach(row => {
      console.log(`  ✓ ${row.routine_name}`);
    });

    // 4. Check trainer data
    console.log('\n4. Checking trainer data...');
    const trainerCheck = await query('SELECT COUNT(*) as count FROM trainers');
    console.log(`Found ${trainerCheck.rows[0].count} trainers`);

    if (trainerCheck.rows[0].count > 0) {
      const trainerId = await query('SELECT id FROM trainers LIMIT 1');
      console.log(`Sample trainer ID: ${trainerId.rows[0].id}`);
    }

    // 5. Check trainer schedules
    console.log('\n5. Checking trainer schedules...');
    const scheduleCheck = await query('SELECT COUNT(*) as count FROM trainer_schedules');
    console.log(`Found ${scheduleCheck.rows[0].count} schedule entries`);

    if (scheduleCheck.rows[0].count > 0) {
      const sampleSchedule = await query(`
        SELECT trainer_id, day_of_week, time_slot, status 
        FROM trainer_schedules 
        LIMIT 3
      `);
      console.log('Sample schedule entries:');
      sampleSchedule.rows.forEach(row => {
        console.log(`  Trainer ${row.trainer_id}: Day ${row.day_of_week} at ${row.time_slot} - ${row.status}`);
      });
    }

    // 6. Check training sessions
    console.log('\n6. Checking training sessions...');
    const sessionCheck = await query('SELECT COUNT(*) as count FROM training_sessions');
    console.log(`Found ${sessionCheck.rows[0].count} training sessions`);

    // 7. Test slot availability function
    console.log('\n7. Testing slot availability function...');
    try {
      const trainerId = await query('SELECT id FROM trainers LIMIT 1');
      if (trainerId.rows.length > 0) {
        const testTrainerId = trainerId.rows[0].id;
        const testDate = '2024-01-22'; // Monday
        const testTime = '09:00';
        
        const availabilityTest = await query(
          'SELECT is_slot_available($1, $2, $3) as is_available',
          [testTrainerId, testDate, testTime]
        );
        
        console.log(`✓ Slot availability function working: ${testTime} on ${testDate} is ${availabilityTest.rows[0].is_available ? 'available' : 'not available'}`);
      }
    } catch (error) {
      console.log(`✗ Slot availability function test failed: ${error.message}`);
    }

    console.log('\n=== TEST COMPLETED ===');
    
    // Summary
    console.log('\nSUMMARY:');
    console.log('- Database schema: ✓');
    console.log('- Triggers: ' + (triggerCheck.rows.length > 0 ? '✓' : '✗'));
    console.log('- Functions: ' + (functionCheck.rows.length === 3 ? '✓' : '✗'));
    console.log('- Trainers: ' + (trainerCheck.rows[0].count > 0 ? '✓' : '✗'));
    console.log('- Schedules: ' + (scheduleCheck.rows[0].count > 0 ? '✓' : '✗'));

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testTrainerBooking()
  .then(() => {
    console.log('\nTest script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test script failed:', error);
    process.exit(1);
  });
