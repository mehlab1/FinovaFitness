-- Trainer Schedules Table
-- This table stores the detailed schedule for each trainer including availability and bookings

CREATE TABLE IF NOT EXISTS trainer_schedules (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    time_slot TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'unavailable', 'break')),
    booking_id INTEGER REFERENCES training_sessions(id) ON DELETE SET NULL, -- Link to actual booking
    client_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Who booked this slot
    session_date DATE, -- The actual date this slot was booked for
    notes TEXT, -- Any additional notes about this slot
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trainer_id, day_of_week, time_slot)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_trainer_schedules_trainer_id ON trainer_schedules(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_schedules_day_time ON trainer_schedules(day_of_week, time_slot);
CREATE INDEX IF NOT EXISTS idx_trainer_schedules_status ON trainer_schedules(status);
CREATE INDEX IF NOT EXISTS idx_trainer_schedules_booking_id ON trainer_schedules(booking_id);
CREATE INDEX IF NOT EXISTS idx_trainer_schedules_client_id ON trainer_schedules(client_id);

-- Function to update schedule when a booking is made
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

-- Trigger to automatically update trainer schedules when training sessions change
CREATE TRIGGER trainer_schedule_booking_trigger
    AFTER INSERT OR UPDATE OR DELETE ON training_sessions
    FOR EACH ROW EXECUTE FUNCTION update_trainer_schedule_on_booking();

-- Function to initialize trainer schedules
CREATE OR REPLACE FUNCTION initialize_trainer_schedule(trainer_id_param INTEGER)
RETURNS VOID AS $$
DECLARE
    day_num INTEGER;
    time_slot TIME;
    base_time TIME := '07:00';
    end_time TIME := '20:00';
BEGIN
    -- Initialize schedule for each day of the week (Monday = 1 to Saturday = 6)
    FOR day_num IN 1..6 LOOP
        -- Initialize time slots from 7 AM to 8 PM, every hour
        time_slot := base_time;
        WHILE time_slot < end_time LOOP
            INSERT INTO trainer_schedules (trainer_id, day_of_week, time_slot, status)
            VALUES (trainer_id_param, day_num, time_slot, 'available')
            ON CONFLICT (trainer_id, day_of_week, time_slot) DO NOTHING;
            
            time_slot := time_slot + INTERVAL '1 hour';
        END LOOP;
    END LOOP;
    
    -- Sunday (0) - shorter hours
    time_slot := '08:00';
    WHILE time_slot < '16:00' LOOP
        INSERT INTO trainer_schedules (trainer_id, day_of_week, time_slot, status)
        VALUES (trainer_id_param, 0, time_slot, 'available')
        ON CONFLICT (trainer_id, day_of_week, time_slot) DO NOTHING;
        
        time_slot := time_slot + INTERVAL '1 hour';
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get trainer's current schedule with booking information
CREATE OR REPLACE FUNCTION get_trainer_schedule_with_bookings(trainer_id_param INTEGER, target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
    day_of_week INTEGER,
    time_slot TIME,
    status VARCHAR(20),
    booking_id INTEGER,
    client_name TEXT,
    session_type VARCHAR(50),
    notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ts.day_of_week,
        ts.time_slot,
        ts.status,
        ts.booking_id,
        CASE 
            WHEN ts.client_id IS NOT NULL THEN 
                CONCAT(u.first_name, ' ', u.last_name)
            ELSE NULL
        END as client_name,
        ts2.session_type,
        ts.notes
    FROM trainer_schedules ts
    LEFT JOIN training_sessions ts2 ON ts.booking_id = ts2.id
    LEFT JOIN users u ON ts.client_id = u.id
    WHERE ts.trainer_id = trainer_id_param
      AND ts.day_of_week = EXTRACT(DOW FROM target_date)
    ORDER BY ts.time_slot;
END;
$$ LANGUAGE plpgsql;
