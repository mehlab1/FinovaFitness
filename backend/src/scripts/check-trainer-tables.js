import { query } from '../database.js';

const checkAndCreateTrainerTables = async () => {
  try {
    console.log('🔍 Checking trainer schedule tables...');
    
    // Check if trainer_availability table exists
    const availabilityExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'trainer_availability'
      );
    `);
    
    if (!availabilityExists.rows[0].exists) {
      console.log('📋 Creating trainer_availability table...');
      await query(`
        CREATE TABLE IF NOT EXISTS trainer_availability (
          id SERIAL PRIMARY KEY,
          trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
          day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
          start_time TIME NOT NULL,
          end_time TIME NOT NULL,
          is_available BOOLEAN DEFAULT true,
          session_duration_minutes INTEGER DEFAULT 60,
          max_sessions_per_day INTEGER DEFAULT 8,
          break_duration_minutes INTEGER DEFAULT 15,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(trainer_id, day_of_week, start_time)
        );
      `);
      console.log('✅ trainer_availability table created');
    } else {
      console.log('✅ trainer_availability table already exists');
    }
    
    // Check if trainer_schedules table exists
    const schedulesExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'trainer_schedules'
      );
    `);
    
    if (!schedulesExists.rows[0].exists) {
      console.log('📋 Creating trainer_schedules table...');
      await query(`
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
      `);
      console.log('✅ trainer_schedules table created');
    } else {
      console.log('✅ trainer_schedules table already exists');
    }
    
    // Check if trainer_time_off table exists
    const timeOffExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'trainer_time_off'
      );
    `);
    
    if (!timeOffExists.rows[0].exists) {
      console.log('📋 Creating trainer_time_off table...');
      await query(`
        CREATE TABLE IF NOT EXISTS trainer_time_off (
          id SERIAL PRIMARY KEY,
          trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          start_time TIME,
          end_time TIME,
          reason VARCHAR(255),
          is_recurring BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ trainer_time_off table created');
    } else {
      console.log('✅ trainer_time_off table already exists');
    }
    
    console.log('🎉 All trainer schedule tables are ready!');
    
  } catch (error) {
    console.error('❌ Error checking/creating trainer tables:', error);
    throw error;
  }
};

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  checkAndCreateTrainerTables()
    .then(() => {
      console.log('✨ Trainer tables setup completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Setup failed:', error);
      process.exit(1);
    });
}

export default checkAndCreateTrainerTables;
