import { query } from './src/database.js';

async function checkUsersTable() {
  try {
    console.log('=== CHECKING USERS TABLE ===\n');
    
    // Check users table
    console.log('1. Checking users table...');
    const usersResult = await query('SELECT id, first_name, last_name, email, role FROM users ORDER BY id');
    console.log(`   Found ${usersResult.rows.length} users:`);
    usersResult.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Check if there are any users with role 'trainer'
    console.log('\n2. Checking for users with trainer role...');
    const trainerUsersResult = await query("SELECT id, first_name, last_name, email FROM users WHERE role = 'trainer' ORDER BY id");
    console.log(`   Found ${trainerUsersResult.rows.length} users with trainer role:`);
    trainerUsersResult.rows.forEach(user => {
      console.log(`   - ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}`);
    });
    
    // Check if there are any users with ID 2 specifically
    console.log('\n3. Checking for user with ID 2...');
    const user2Result = await query('SELECT id, first_name, last_name, email, role FROM users WHERE id = 2');
    if (user2Result.rows.length > 0) {
      const user = user2Result.rows[0];
      console.log(`   Found user with ID 2: ${user.first_name} ${user.last_name}, Email: ${user.email}, Role: ${user.role}`);
    } else {
      console.log('   No user found with ID 2');
    }
    
    // Check if there are any orphaned trainer records
    console.log('\n4. Checking for orphaned trainer records...');
    const orphanedTrainersResult = await query(`
      SELECT t.* FROM trainers t 
      LEFT JOIN users u ON t.user_id = u.id 
      WHERE u.id IS NULL
    `);
    console.log(`   Found ${orphanedTrainersResult.rows.length} orphaned trainer records`);
    if (orphanedTrainersResult.rows.length > 0) {
      orphanedTrainersResult.rows.forEach(trainer => {
        console.log(`   - ID: ${trainer.id}, User ID: ${trainer.user_id}, Name: ${trainer.first_name} ${trainer.last_name}`);
      });
    }
    
    console.log('\n=== CHECK COMPLETED ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Error checking users table:', error);
    process.exit(1);
  }
}

checkUsersTable();
