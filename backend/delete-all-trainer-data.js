import { query } from './src/database.js';

async function deleteAllTrainerData() {
  try {
    console.log('=== DELETING ALL TRAINER DATA ===\n');
    
    // Start a transaction to ensure data consistency
    await query('BEGIN');
    console.log('Transaction started...\n');
    
    // 1. Delete all training sessions first (this will trigger updates to trainer_schedules)
    console.log('1. Deleting all training sessions...');
    const deleteSessionsResult = await query('DELETE FROM training_sessions');
    console.log(`✓ Deleted ${deleteSessionsResult.rowCount} training sessions\n`);
    
    // 2. Delete all trainer schedules
    console.log('2. Deleting all trainer schedules...');
    const deleteSchedulesResult = await query('DELETE FROM trainer_schedules');
    console.log(`✓ Deleted ${deleteSchedulesResult.rowCount} trainer schedule entries\n`);
    
    // 3. Delete all trainers
    console.log('3. Deleting all trainers...');
    const deleteTrainersResult = await query('DELETE FROM trainers');
    console.log(`✓ Deleted ${deleteTrainersResult.rowCount} trainers\n`);
    
    // 4. Check if there are any other related tables that need cleaning
    console.log('4. Checking for other related data...');
    
    // Check if there are any remaining references
    const remainingSessions = await query('SELECT COUNT(*) as count FROM training_sessions');
    const remainingSchedules = await query('SELECT COUNT(*) as count FROM trainer_schedules');
    const remainingTrainers = await query('SELECT COUNT(*) as count FROM trainers');
    
    console.log(`   - Remaining training sessions: ${remainingSessions.rows[0].count}`);
    console.log(`   - Remaining trainer schedules: ${remainingSchedules.rows[0].count}`);
    console.log(`   - Remaining trainers: ${remainingTrainers.rows[0].count}`);
    
    // Commit the transaction
    await query('COMMIT');
    console.log('\n✓ Transaction committed successfully!');
    
    console.log('\n=== CLEANUP COMPLETED ===');
    console.log('All trainer-related data has been deleted.');
    console.log('You now have a clean database for testing the new system.');
    
    process.exit(0);
    
  } catch (error) {
    // Rollback on error
    try {
      await query('ROLLBACK');
      console.log('\n⚠ Transaction rolled back due to error');
    } catch (rollbackError) {
      console.error('Failed to rollback transaction:', rollbackError);
    }
    
    console.error('\n❌ Error deleting trainer data:', error);
    process.exit(1);
  }
}

deleteAllTrainerData();
