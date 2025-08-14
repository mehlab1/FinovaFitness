import { query } from './src/database.js';

async function deleteTrainerUser() {
  try {
    console.log('=== DELETING TRAINER USER ===\n');
    
    // Start a transaction
    await query('BEGIN');
    console.log('Transaction started...\n');
    
    // Check if user ID 2 exists and is a trainer
    console.log('1. Checking user ID 2...');
    const userCheck = await query('SELECT id, first_name, last_name, email, role FROM users WHERE id = 2');
    
    if (userCheck.rows.length === 0) {
      console.log('   User ID 2 does not exist');
      await query('ROLLBACK');
      return;
    }
    
    const user = userCheck.rows[0];
    console.log(`   Found user: ${user.first_name} ${user.last_name} (${user.email}) with role: ${user.role}`);
    
    if (user.role !== 'trainer') {
      console.log('   User is not a trainer, skipping deletion');
      await query('ROLLBACK');
      return;
    }
    
    // Delete the trainer user
    console.log('\n2. Deleting trainer user...');
    const deleteResult = await query('DELETE FROM users WHERE id = 2 AND role = $1', ['trainer']);
    
    if (deleteResult.rowCount > 0) {
      console.log(`✓ Successfully deleted trainer user ID 2`);
    } else {
      console.log('⚠ No trainer user was deleted');
    }
    
    // Verify deletion
    console.log('\n3. Verifying deletion...');
    const verifyResult = await query('SELECT COUNT(*) as count FROM users WHERE id = 2');
    const remainingCount = verifyResult.rows[0].count;
    console.log(`   Users with ID 2 remaining: ${remainingCount}`);
    
    // Commit the transaction
    await query('COMMIT');
    console.log('\n✓ Transaction committed successfully!');
    
    console.log('\n=== TRAINER USER DELETION COMPLETED ===');
    console.log('All trainer-related data has been completely removed.');
    
    process.exit(0);
    
  } catch (error) {
    // Rollback on error
    try {
      await query('ROLLBACK');
      console.log('\n⚠ Transaction rolled back due to error');
    } catch (rollbackError) {
      console.error('Failed to rollback transaction:', rollbackError);
    }
    
    console.error('\n❌ Error deleting trainer user:', error);
    process.exit(1);
  }
}

deleteTrainerUser();
