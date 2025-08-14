import { query } from './src/database.js';

async function checkTrainingSessions() {
  try {
    console.log('=== CHECKING TRAINING SESSIONS ===\n');
    
    // Count total training sessions
    const countResult = await query('SELECT COUNT(*) as count FROM training_sessions');
    const totalCount = countResult.rows[0].count;
    console.log(`Total training sessions: ${totalCount}\n`);
    
    if (totalCount > 0) {
      // Get details of all training sessions
      const sessionsResult = await query(`
        SELECT id, trainer_id, session_date, start_time, client_id, status 
        FROM training_sessions 
        ORDER BY id
      `);
      
      console.log('Training Sessions Details:');
      console.log('ID | Trainer | Date | Time | Client | Status');
      console.log('---|---------|------|------|--------|--------');
      
      sessionsResult.rows.forEach(session => {
        console.log(`${session.id} | ${session.trainer_id} | ${session.session_date} | ${session.start_time} | ${session.client_id} | ${session.status}`);
      });
    }
    
    console.log('\n=== CHECK COMPLETED ===');
    process.exit(0);
    
  } catch (error) {
    console.error('Error checking training sessions:', error);
    process.exit(1);
  }
}

checkTrainingSessions();
