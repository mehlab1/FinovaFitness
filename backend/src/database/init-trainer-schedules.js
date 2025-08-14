import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/finovafitness'
});

async function initializeTrainerSchedules() {
  const client = await pool.connect();
  
  try {
    console.log('Starting trainer schedule initialization...');
    
    // First, create the trainer_schedules table and functions
    console.log('Creating trainer_schedules table and functions...');
    
    const createTableSQL = `
      -- Trainer Schedules Table
      CREATE TABLE IF NOT EXISTS trainer_schedules (
          id SERIAL PRIMARY KEY,
          trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
          day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
          time_slot TIME NOT NULL,
          status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'unavailable', 'break')),
          booking_id INTEGER REFERENCES training_sessions(id) ON DELETE SET NULL,
          client_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          session_date DATE,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(trainer_id, day_of_week, time_slot)
      );
      
      -- Create indexes
      CREATE INDEX IF NOT EXISTS idx_trainer_schedules_trainer_id ON trainer_schedules(trainer_id);
      CREATE INDEX IF NOT EXISTS idx_trainer_schedules_day_time ON trainer_schedules(day_of_week, time_slot);
      CREATE INDEX IF NOT EXISTS idx_trainer_schedules_status ON trainer_schedules(status);
      CREATE INDEX IF NOT EXISTS idx_trainer_schedules_booking_id ON trainer_schedules(booking_id);
      CREATE INDEX IF NOT EXISTS idx_trainer_schedules_client_id ON trainer_schedules(client_id);
    `;
    
    await client.query(createTableSQL);
    console.log('✓ Trainer schedules table created');
    
    // Create the trigger function
    const createTriggerFunctionSQL = `
      CREATE OR REPLACE FUNCTION update_trainer_schedule_on_booking()
      RETURNS TRIGGER AS $$
      BEGIN
          -- When a new training session is created, update the schedule
          IF TG_OP = 'INSERT' THEN
              -- Mark the time slot as booked
              UPDATE trainer_schedules 
              SET status = 'booked',
                  booking_id = NEW.id,
                  client_id = NEW.client_id,
                  session_date = NEW.session_date,
                  updated_at = CURRENT_TIMESTAMP
              WHERE trainer_id = NEW.trainer_id 
                AND day_of_week = EXTRACT(DOW FROM NEW.session_date::date)
                AND time_slot = NEW.start_time;
              
              RETURN NEW;
          END IF;
          
          -- When a training session is updated, update the schedule accordingly
          IF TG_OP = 'UPDATE' THEN
              -- If status changed to completed/cancelled, mark slot as available again
              IF OLD.status IN ('scheduled', 'confirmed') AND NEW.status IN ('completed', 'cancelled') THEN
                  UPDATE trainer_schedules 
                  SET status = 'available',
                      booking_id = NULL,
                      client_id = NULL,
                      session_date = NULL,
                      updated_at = CURRENT_TIMESTAMP
                  WHERE trainer_id = NEW.trainer_id 
                    AND day_of_week = EXTRACT(DOW FROM NEW.session_date::date)
                    AND time_slot = NEW.start_time;
              END IF;
              
              RETURN NEW;
          END IF;
          
          -- When a training session is deleted, mark slot as available
          IF TG_OP = 'DELETE' THEN
              UPDATE trainer_schedules 
              SET status = 'available',
                  booking_id = NULL,
                  client_id = NULL,
                  session_date = NULL,
                  updated_at = CURRENT_TIMESTAMP
              WHERE trainer_id = OLD.trainer_id 
                AND day_of_week = EXTRACT(DOW FROM OLD.session_date::date)
                AND time_slot = OLD.start_time;
              
              RETURN OLD;
          END IF;
          
          RETURN NULL;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await client.query(createTriggerFunctionSQL);
    console.log('✓ Trigger function created');
    
    // Create the trigger
    const createTriggerSQL = `
      DROP TRIGGER IF EXISTS trainer_schedule_booking_trigger ON training_sessions;
      CREATE TRIGGER trainer_schedule_booking_trigger
          AFTER INSERT OR UPDATE OR DELETE ON training_sessions
          FOR EACH ROW EXECUTE FUNCTION update_trainer_schedule_on_booking();
    `;
    
    await client.query(createTriggerSQL);
    console.log('✓ Trigger created');
    
    // Get all existing trainers
    const trainersResult = await client.query('SELECT id FROM trainers');
    const trainers = trainersResult.rows;
    
    console.log(`Found ${trainers.length} trainers to initialize`);
    
    // Initialize schedules for each trainer
    for (const trainer of trainers) {
      console.log(`Initializing schedule for trainer ${trainer.id}...`);
      
      // Clear any existing schedule for this trainer
      await client.query('DELETE FROM trainer_schedules WHERE trainer_id = $1', [trainer.id]);
      
      // Initialize schedule for each day of the week (Monday = 1 to Saturday = 6)
      for (let day = 1; day <= 6; day++) {
        // Initialize time slots from 7 AM to 8 PM, every hour
        for (let hour = 7; hour < 20; hour++) {
          const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
          
          await client.query(
            'INSERT INTO trainer_schedules (trainer_id, day_of_week, time_slot, status) VALUES ($1, $2, $3, $4)',
            [trainer.id, day, timeSlot, 'available']
          );
        }
      }
      
      // Sunday (0) - shorter hours (8 AM to 4 PM)
      for (let hour = 8; hour < 16; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        
        await client.query(
          'INSERT INTO trainer_schedules (trainer_id, day_of_week, time_slot, status) VALUES ($1, $2, $3, $4)',
          [trainer.id, 0, timeSlot, 'available']
        );
      }
      
      console.log(`✓ Schedule initialized for trainer ${trainer.id}`);
    }
    
    // Now update any existing bookings to mark their slots as booked
    console.log('Updating existing bookings in schedules...');
    
    const existingBookingsResult = await client.query(`
      SELECT ts.id, ts.trainer_id, ts.session_date, ts.start_time, ts.client_id, ts.status
      FROM training_sessions ts
      WHERE ts.status IN ('scheduled', 'confirmed')
    `);
    
    const existingBookings = existingBookingsResult.rows;
    console.log(`Found ${existingBookings.length} existing bookings to update`);
    
    for (const booking of existingBookings) {
      const dayOfWeek = new Date(booking.session_date).getDay();
      
      await client.query(`
        UPDATE trainer_schedules 
        SET status = 'booked',
            booking_id = $1,
            client_id = $2,
            session_date = $3,
            updated_at = CURRENT_TIMESTAMP
        WHERE trainer_id = $4 
          AND day_of_week = $5
          AND time_slot = $6
      `, [booking.id, booking.client_id, booking.session_date, booking.trainer_id, dayOfWeek, booking.start_time]);
    }
    
    console.log('✓ Existing bookings updated in schedules');
    
    console.log('\n🎉 Trainer schedule initialization completed successfully!');
    console.log(`\nSummary:`);
    console.log(`- Created trainer_schedules table`);
    console.log(`- Created trigger function and trigger`);
    console.log(`- Initialized schedules for ${trainers.length} trainers`);
    console.log(`- Updated ${existingBookings.length} existing bookings`);
    
  } catch (error) {
    console.error('Error initializing trainer schedules:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeTrainerSchedules()
  .then(() => {
    console.log('Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
