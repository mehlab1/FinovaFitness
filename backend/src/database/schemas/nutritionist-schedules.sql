-- Nutritionist Schedules Table
-- This table stores the detailed schedule for each nutritionist including availability and bookings

CREATE TABLE IF NOT EXISTS nutritionist_schedules (
    id SERIAL PRIMARY KEY,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    time_slot TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'unavailable', 'break')),
    booking_id INTEGER REFERENCES nutritionist_sessions(id) ON DELETE SET NULL, -- Link to actual booking
    client_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- Who booked this slot
    session_date DATE, -- The actual date this slot was booked for
    notes TEXT, -- Any additional notes about this slot
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nutritionist_id, day_of_week, time_slot)
);

-- Indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_nutritionist_schedules_nutritionist_id ON nutritionist_schedules(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_schedules_day_time ON nutritionist_schedules(day_of_week, time_slot);
CREATE INDEX IF NOT EXISTS idx_nutritionist_schedules_status ON nutritionist_schedules(status);
CREATE INDEX IF NOT EXISTS idx_nutritionist_schedules_booking_id ON nutritionist_schedules(booking_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_schedules_client_id ON nutritionist_schedules(client_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_schedules_session_date ON nutritionist_schedules(session_date);

-- Nutritionist availability settings
CREATE TABLE IF NOT EXISTS nutritionist_availability (
    id SERIAL PRIMARY KEY,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    session_duration_minutes INTEGER DEFAULT 60,
    max_sessions_per_day INTEGER DEFAULT 8,
    break_duration_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(nutritionist_id, day_of_week)
);

-- Nutritionist sessions (consultations)
CREATE TABLE IF NOT EXISTS nutritionist_sessions (
    id SERIAL PRIMARY KEY,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('initial_consultation', 'follow_up', 'meal_plan_review', 'progress_check')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    price DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    notes TEXT,
    client_notes TEXT, -- Notes from the client about their goals/concerns
    nutritionist_notes TEXT, -- Notes from the nutritionist during/after session
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutritionist time off / blocked slots
CREATE TABLE IF NOT EXISTS nutritionist_time_off (
    id SERIAL PRIMARY KEY,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(255),
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session requests from members
CREATE TABLE IF NOT EXISTS nutritionist_session_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    preferred_date DATE,
    preferred_time TIME,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('initial_consultation', 'follow_up', 'meal_plan_review', 'progress_check')),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    nutritionist_response TEXT,
    approved_date DATE,
    approved_time TIME,
    session_price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Function to update nutritionist schedule when a session is booked
CREATE OR REPLACE FUNCTION update_nutritionist_schedule_on_booking()
RETURNS TRIGGER AS $func$
BEGIN
    -- When a new nutritionist session is created, update the schedule
    IF TG_OP = 'INSERT' THEN
        -- Mark the time slot as booked
        UPDATE nutritionist_schedules 
        SET status = 'booked',
            booking_id = NEW.id,
            client_id = NEW.client_id,
            session_date = NEW.session_date,
            updated_at = CURRENT_TIMESTAMP
        WHERE nutritionist_id = NEW.nutritionist_id 
          AND day_of_week = EXTRACT(DOW FROM NEW.session_date::date)
          AND time_slot = NEW.start_time;
        
        RETURN NEW;
    END IF;
    
    -- When a nutritionist session is updated, update the schedule accordingly
    IF TG_OP = 'UPDATE' THEN
        -- If status changed to completed/cancelled, mark slot as available again
        IF OLD.status IN ('confirmed', 'scheduled') AND NEW.status IN ('completed', 'cancelled') THEN
            UPDATE nutritionist_schedules 
            SET status = 'available',
                booking_id = NULL,
                client_id = NULL,
                session_date = NULL,
                updated_at = CURRENT_TIMESTAMP
            WHERE nutritionist_id = NEW.nutritionist_id 
              AND day_of_week = EXTRACT(DOW FROM NEW.session_date::date)
              AND time_slot = NEW.start_time;
        END IF;
        
        RETURN NEW;
    END IF;
    
    -- When a nutritionist session is deleted, mark slot as available
    IF TG_OP = 'DELETE' THEN
        UPDATE nutritionist_schedules 
        SET status = 'available',
            booking_id = NULL,
            client_id = NULL,
            session_date = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE nutritionist_id = OLD.nutritionist_id 
          AND day_of_week = EXTRACT(DOW FROM OLD.session_date::date)
          AND time_slot = OLD.start_time;
        
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$func$ LANGUAGE plpgsql;

-- Trigger to automatically update nutritionist schedules when sessions change
CREATE TRIGGER nutritionist_schedule_booking_trigger
    AFTER INSERT OR UPDATE OR DELETE ON nutritionist_sessions
    FOR EACH ROW EXECUTE FUNCTION update_nutritionist_schedule_on_booking();

-- Function to initialize nutritionist schedule with available time slots
CREATE OR REPLACE FUNCTION initialize_nutritionist_schedule(nutritionist_id_param INTEGER)
RETURNS VOID AS $func$
DECLARE
    day_num INTEGER;
    slot_time TIME;
    day_availability RECORD;
BEGIN
    -- Loop through each day of the week
    FOR day_num IN 0..6 LOOP
        -- Get availability for this day
        SELECT * INTO day_availability 
        FROM nutritionist_availability 
        WHERE nutritionist_id = nutritionist_id_param AND day_of_week = day_num;
        
        -- Only create slots if the day is available
        IF day_availability IS NOT NULL AND day_availability.is_available THEN
            slot_time := day_availability.start_time;
            
            -- Generate time slots based on session duration and break duration
            WHILE slot_time < day_availability.end_time LOOP
                -- Insert the time slot
                INSERT INTO nutritionist_schedules (nutritionist_id, day_of_week, time_slot, status)
                VALUES (nutritionist_id_param, day_num, slot_time, 'available')
                ON CONFLICT (nutritionist_id, day_of_week, time_slot) DO NOTHING;
                
                -- Move to next slot (session duration + break duration)
                slot_time := slot_time + 
                    (day_availability.session_duration_minutes || ' minutes')::interval +
                    (day_availability.break_duration_minutes || ' minutes')::interval;
            END LOOP;
        END IF;
    END LOOP;
END;
$func$ LANGUAGE plpgsql;
