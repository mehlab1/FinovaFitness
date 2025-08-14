import { query } from '../database.js';

// Initialize trainer schedules for all existing trainers
export const initializeTrainerSchedules = async () => {
  try {
    console.log('Starting trainer schedule initialization...');

    // Get all trainers
    const trainersResult = await query('SELECT id FROM trainers');
    
    if (trainersResult.rows.length === 0) {
      console.log('No trainers found. Skipping schedule initialization.');
      return;
    }

    console.log(`Found ${trainersResult.rows.length} trainers. Initializing schedules...`);

    for (const trainer of trainersResult.rows) {
      const trainerId = trainer.id;
      console.log(`Initializing schedule for trainer ${trainerId}...`);

      try {
        // Call the database function to initialize schedules
        await query('SELECT initialize_trainer_schedule($1)', [trainerId]);
        console.log(`✓ Schedule initialized for trainer ${trainerId}`);
      } catch (error) {
        console.error(`✗ Failed to initialize schedule for trainer ${trainerId}:`, error.message);
      }
    }

    console.log('Trainer schedule initialization completed!');

  } catch (error) {
    console.error('Error during trainer schedule initialization:', error);
    throw error;
  }
};

// Update existing trainer schedules to mark booked slots
export const updateExistingBookings = async () => {
  try {
    console.log('Updating existing bookings in trainer schedules...');

    // Get all scheduled/confirmed training sessions
    const sessionsResult = await query(`
      SELECT id, trainer_id, session_date, start_time, client_id
      FROM training_sessions 
      WHERE status IN ('scheduled', 'confirmed')
      AND session_date >= CURRENT_DATE
    `);

    if (sessionsResult.rows.length === 0) {
      console.log('No existing bookings found to update.');
      return;
    }

    console.log(`Found ${sessionsResult.rows.length} existing bookings to update...`);

    for (const session of sessionsResult.rows) {
      try {
        // Update the corresponding slot in trainer_schedules
        await query(`
          UPDATE trainer_schedules 
          SET status = 'booked',
              booking_id = $1,
              client_id = $2,
              session_date = $3,
              updated_at = CURRENT_TIMESTAMP
          WHERE trainer_id = $4 
            AND day_of_week = EXTRACT(DOW FROM $3::date)
            AND time_slot = $5
        `, [session.id, session.client_id, session.session_date, session.trainer_id, session.start_time]);

        console.log(`✓ Updated slot for session ${session.id}`);
      } catch (error) {
        console.error(`✗ Failed to update slot for session ${session.id}:`, error.message);
      }
    }

    console.log('Existing bookings update completed!');

  } catch (error) {
    console.error('Error updating existing bookings:', error);
    throw error;
  }
};

// Main function to run the complete initialization
export const runCompleteInitialization = async () => {
  try {
    console.log('=== TRAINER SCHEDULE INITIALIZATION ===');
    
    // Initialize schedules for all trainers
    await initializeTrainerSchedules();
    
    // Update existing bookings
    await updateExistingBookings();
    
    console.log('=== INITIALIZATION COMPLETED SUCCESSFULLY ===');
    
  } catch (error) {
    console.error('=== INITIALIZATION FAILED ===');
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runCompleteInitialization();
}
