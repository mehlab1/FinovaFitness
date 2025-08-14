import { query } from './src/database.js';

async function checkRemainingData() {
  try {
    console.log('=== CHECKING REMAINING DATA ===\n');
    
    // Check trainers table
    console.log('1. Checking trainers table...');
    const trainersResult = await query('SELECT * FROM trainers ORDER BY id');
    console.log(`   Found ${trainersResult.rows.length} trainers:`);
    trainersResult.rows.forEach(trainer => {
      console.log(`   - ID: ${trainer.id}, Name: ${trainer.first_name} ${trainer.last_name}, Email: ${trainer.email}`);
    });
    
    // Check trainer_schedules table
    console.log('\n2. Checking trainer_schedules table...');
    const schedulesResult = await query('SELECT * FROM trainer_schedules ORDER BY id');
    console.log(`   Found ${schedulesResult.rows.length} schedule entries:`);
    if (schedulesResult.rows.length > 0) {
      schedulesResult.rows.slice(0, 5).forEach(schedule => {
        console.log(`   - ID: ${schedule.id}, Trainer: ${schedule.trainer_id}, Day: ${schedule.day_of_week}, Time: ${schedule.time_slot}, Status: ${schedule.status}`);
      });
      if (schedulesResult.rows.length > 5) {
        console.log(`   ... and ${schedulesResult.rows.length - 5} more entries`);
      }
    }
    
    // Check training_sessions table
    console.log('\n3. Checking training_sessions table...');
    const sessionsResult = await query('SELECT * FROM training_sessions ORDER BY id');
    console.log(`   Found ${sessionsResult.rows.length} training sessions`);
    
    // Check if there are any foreign key constraints that might be preventing deletion
    console.log('\n4. Checking for foreign key constraints...');
    try {
      const constraintsResult = await query(`
        SELECT 
          tc.table_name, 
          kcu.column_name, 
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name 
        FROM 
          information_schema.table_constraints AS tc 
          JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
          JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
        AND (tc.table_name = 'trainers' OR ccu.table_name = 'trainers')
      `);
      
      if (constraintsResult.rows.length > 0) {
        console.log('   Foreign key constraints found:');
        constraintsResult.rows.forEach(constraint => {
          console.log(`   - ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
        });
      } else {
        console.log('   No foreign key constraints found');
      }
    } catch (error) {
      console.log('   Could not check foreign key constraints:', error.message);
    }
    
    console.log('\n=== CHECK COMPLETED ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Error checking remaining data:', error);
    process.exit(1);
  }
}

checkRemainingData();
