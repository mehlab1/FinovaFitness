-- ==============================================
-- MONTHLY PLAN SYSTEM - COMPLETE SCHEMA
-- ==============================================

-- Drop existing tables if they exist (for clean implementation)
DROP TABLE IF EXISTS slot_assignments CASCADE;
DROP TABLE IF EXISTS trainer_master_slots CASCADE;
DROP TABLE IF EXISTS slot_generation_batches CASCADE;
DROP TABLE IF EXISTS trainer_monthly_plans CASCADE;
DROP TABLE IF EXISTS monthly_plan_subscriptions CASCADE;
DROP TABLE IF EXISTS monthly_plan_session_assignments CASCADE;

-- ==============================================
-- 1. TRAINER MONTHLY PLANS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS trainer_monthly_plans (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    plan_name VARCHAR(255) NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL CHECK (monthly_price > 0),
    sessions_per_month INTEGER NOT NULL CHECK (sessions_per_month > 0),
    session_duration INTEGER NOT NULL DEFAULT 60 CHECK (session_duration > 0), -- in minutes
    session_type VARCHAR(20) NOT NULL DEFAULT 'personal' CHECK (session_type IN ('personal', 'group')),
    max_subscribers INTEGER NOT NULL DEFAULT 1 CHECK (max_subscribers > 0),
    is_active BOOLEAN DEFAULT true,
    requires_admin_approval BOOLEAN DEFAULT true,
    admin_approved BOOLEAN DEFAULT NULL,
    admin_approval_date TIMESTAMP,
    admin_approval_notes TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- 2. SLOT GENERATION BATCHES TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS slot_generation_batches (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    batch_name VARCHAR(255) NOT NULL,
    generation_start_date DATE NOT NULL,
    generation_end_date DATE NOT NULL,
    slot_duration INTEGER NOT NULL DEFAULT 60 CHECK (slot_duration > 0), -- in minutes
    break_duration INTEGER NOT NULL DEFAULT 15 CHECK (break_duration >= 0), -- in minutes
    selected_days INTEGER[] NOT NULL CHECK (array_length(selected_days, 1) > 0), -- [1,2,3,4,5] for Mon-Fri
    daily_start_time TIME NOT NULL,
    daily_end_time TIME NOT NULL,
    total_slots_generated INTEGER DEFAULT 0,
    generation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    CONSTRAINT valid_date_range CHECK (generation_end_date >= generation_start_date),
    CONSTRAINT valid_time_range CHECK (daily_end_time > daily_start_time)
);

-- ==============================================
-- 3. MASTER SCHEDULE SLOTS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS trainer_master_slots (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    batch_id INTEGER REFERENCES slot_generation_batches(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INTEGER NOT NULL DEFAULT 60 CHECK (slot_duration > 0), -- in minutes
    break_duration INTEGER NOT NULL DEFAULT 15 CHECK (break_duration >= 0), -- in minutes
    slot_type VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (slot_type IN ('available', 'monthly_plan', 'one_time_booking', 'blocked', 'maintenance')),
    session_type VARCHAR(20) DEFAULT 'personal' CHECK (session_type IN ('personal', 'group')),
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_slot_time CHECK (end_time > start_time)
);

-- ==============================================
-- 4. MONTHLY PLAN SUBSCRIPTIONS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS monthly_plan_subscriptions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES trainer_monthly_plans(id) ON DELETE CASCADE,
    subscription_start_date DATE NOT NULL,
    subscription_end_date DATE,
    auto_renewal BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'paused', 'rejected')),
    sessions_remaining INTEGER NOT NULL,
    total_paid DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    next_billing_date DATE,
    cancellation_date DATE,
    cancellation_reason TEXT,
    trainer_approval_date TIMESTAMP,
    trainer_approval_notes TEXT,
    trainer_rejection_date TIMESTAMP,
    trainer_rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_subscription_dates CHECK (subscription_end_date IS NULL OR subscription_end_date >= subscription_start_date),
    CONSTRAINT valid_sessions_remaining CHECK (sessions_remaining >= 0)
);

-- ==============================================
-- 5. SLOT ASSIGNMENTS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS slot_assignments (
    id SERIAL PRIMARY KEY,
    slot_id INTEGER REFERENCES trainer_master_slots(id) ON DELETE CASCADE,
    assignment_type VARCHAR(20) NOT NULL CHECK (assignment_type IN ('monthly_plan', 'one_time_booking', 'blocked')),
    assigned_member_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    subscription_id INTEGER REFERENCES monthly_plan_subscriptions(id) ON DELETE SET NULL,
    booking_id INTEGER REFERENCES training_sessions(id) ON DELETE SET NULL,
    assignment_start_date DATE NOT NULL,
    assignment_end_date DATE, -- NULL for permanent assignments
    is_permanent BOOLEAN DEFAULT false,
    assignment_reason TEXT,
    created_by_trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed', 'rescheduled')),
    rescheduled_from_slot_id INTEGER REFERENCES trainer_master_slots(id) ON DELETE SET NULL,
    rescheduled_to_slot_id INTEGER REFERENCES trainer_master_slots(id) ON DELETE SET NULL,
    rescheduled_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_assignment_dates CHECK (assignment_end_date IS NULL OR assignment_end_date >= assignment_start_date)
);

-- ==============================================
-- 6. MONTHLY PLAN SESSION ASSIGNMENTS TABLE
-- ==============================================

CREATE TABLE IF NOT EXISTS monthly_plan_session_assignments (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES monthly_plan_subscriptions(id) ON DELETE CASCADE,
    slot_assignment_id INTEGER REFERENCES slot_assignments(id) ON DELETE CASCADE,
    scheduled_date DATE NOT NULL,
    scheduled_time TIME NOT NULL,
    slot_id INTEGER REFERENCES trainer_master_slots(id) ON DELETE CASCADE,
    session_number INTEGER NOT NULL CHECK (session_number > 0), -- 1, 2, 3... up to sessions_per_month
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'rescheduled', 'cancelled', 'no_show')),
    completion_date TIMESTAMP,
    rescheduled_from_slot_id INTEGER REFERENCES trainer_master_slots(id) ON DELETE SET NULL,
    rescheduled_to_slot_id INTEGER REFERENCES trainer_master_slots(id) ON DELETE SET NULL,
    rescheduled_date TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Trainer Monthly Plans Indexes
CREATE INDEX IF NOT EXISTS idx_trainer_monthly_plans_trainer_id ON trainer_monthly_plans(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_monthly_plans_active ON trainer_monthly_plans(is_active, admin_approved);
CREATE INDEX IF NOT EXISTS idx_trainer_monthly_plans_approval ON trainer_monthly_plans(requires_admin_approval, admin_approved);

-- Slot Generation Batches Indexes
CREATE INDEX IF NOT EXISTS idx_slot_generation_batches_trainer_id ON slot_generation_batches(trainer_id);
CREATE INDEX IF NOT EXISTS idx_slot_generation_batches_active ON slot_generation_batches(is_active);
CREATE INDEX IF NOT EXISTS idx_slot_generation_batches_dates ON slot_generation_batches(generation_start_date, generation_end_date);

-- Master Slots Indexes
CREATE INDEX IF NOT EXISTS idx_trainer_master_slots_trainer_id ON trainer_master_slots(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_master_slots_date ON trainer_master_slots(date);
CREATE INDEX IF NOT EXISTS idx_trainer_master_slots_type ON trainer_master_slots(slot_type);
CREATE INDEX IF NOT EXISTS idx_trainer_master_slots_active ON trainer_master_slots(is_active);
CREATE INDEX IF NOT EXISTS idx_trainer_master_slots_batch ON trainer_master_slots(batch_id);

-- Monthly Plan Subscriptions Indexes
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_member_id ON monthly_plan_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_trainer_id ON monthly_plan_subscriptions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_status ON monthly_plan_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_dates ON monthly_plan_subscriptions(subscription_start_date, subscription_end_date);
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_trainer_approval_date ON monthly_plan_subscriptions(trainer_approval_date);
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_trainer_rejection_date ON monthly_plan_subscriptions(trainer_rejection_date);

-- Slot Assignments Indexes
CREATE INDEX IF NOT EXISTS idx_slot_assignments_slot_id ON slot_assignments(slot_id);
CREATE INDEX IF NOT EXISTS idx_slot_assignments_type ON slot_assignments(assignment_type);
CREATE INDEX IF NOT EXISTS idx_slot_assignments_member_id ON slot_assignments(assigned_member_id);
CREATE INDEX IF NOT EXISTS idx_slot_assignments_dates ON slot_assignments(assignment_start_date, assignment_end_date);
CREATE INDEX IF NOT EXISTS idx_slot_assignments_status ON slot_assignments(status);

-- Session Assignments Indexes
CREATE INDEX IF NOT EXISTS idx_monthly_plan_session_assignments_subscription_id ON monthly_plan_session_assignments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_monthly_plan_session_assignments_date ON monthly_plan_session_assignments(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_monthly_plan_session_assignments_status ON monthly_plan_session_assignments(status);

-- ==============================================
-- UNIQUE CONSTRAINTS
-- ==============================================

-- Note: Partial unique constraints with WHERE clauses are not supported in all PostgreSQL versions
-- We'll handle uniqueness at the application level for better compatibility

-- Regular unique constraints
ALTER TABLE trainer_monthly_plans 
ADD CONSTRAINT unique_trainer_plan_name 
UNIQUE (trainer_id, plan_name);

ALTER TABLE slot_generation_batches 
ADD CONSTRAINT unique_trainer_batch_name 
UNIQUE (trainer_id, batch_name);

ALTER TABLE trainer_master_slots 
ADD CONSTRAINT unique_trainer_slot_time 
UNIQUE (trainer_id, date, start_time);

-- Monthly plan subscriptions will be handled at application level for one active per member
-- Slot assignments will be handled at application level for one active per slot

-- ==============================================
-- FUNCTIONS
-- ==============================================

-- Function to generate slots for a batch
CREATE OR REPLACE FUNCTION generate_slots_for_batch(batch_id_param INTEGER)
RETURNS INTEGER AS $$
DECLARE
    batch_record RECORD;
    current_date_var DATE;
    slot_time TIME;
    slot_end_time TIME;
    slots_generated INTEGER := 0;
    day_of_week INTEGER;
BEGIN
    -- Get batch details
    SELECT * INTO batch_record FROM slot_generation_batches WHERE id = batch_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Batch not found with id: %', batch_id_param;
    END IF;
    
    -- Generate slots for each day in the date range
    current_date_var := batch_record.generation_start_date;
    
    WHILE current_date_var <= batch_record.generation_end_date LOOP
        -- Get day of week (0=Sunday, 1=Monday, etc.)
        day_of_week := EXTRACT(DOW FROM current_date_var);
        
        -- Check if this day is in the selected days array
        IF day_of_week = ANY(batch_record.selected_days) THEN
            -- Generate slots for this day
            slot_time := batch_record.daily_start_time;
            
            WHILE slot_time < batch_record.daily_end_time LOOP
                -- Calculate end time for this slot
                slot_end_time := slot_time + (batch_record.slot_duration || ' minutes')::INTERVAL;
                
                -- Insert the slot
                INSERT INTO trainer_master_slots (
                    trainer_id, batch_id, date, start_time, end_time,
                    slot_duration, break_duration, slot_type, session_type, is_active
                ) VALUES (
                    batch_record.trainer_id, batch_id_param, current_date_var, slot_time, slot_end_time,
                    batch_record.slot_duration, batch_record.break_duration, 'available', 'personal', true
                );
                
                slots_generated := slots_generated + 1;
                
                -- Move to next slot (add break duration)
                slot_time := slot_end_time + (batch_record.break_duration || ' minutes')::INTERVAL;
            END LOOP;
        END IF;
        
        current_date_var := current_date_var + INTERVAL '1 day';
    END LOOP;
    
    -- Update the batch with total slots generated
    UPDATE slot_generation_batches 
    SET total_slots_generated = slots_generated 
    WHERE id = batch_id_param;
    
    RETURN slots_generated;
END;
$$ LANGUAGE plpgsql;

-- Function to assign slots to monthly plan member
CREATE OR REPLACE FUNCTION assign_slots_to_monthly_plan(
    subscription_id_param INTEGER,
    slot_ids INTEGER[],
    assignment_start_date_param DATE,
    assignment_end_date_param DATE DEFAULT NULL,
    is_permanent_param BOOLEAN DEFAULT false
)
RETURNS INTEGER AS $$
DECLARE
    subscription_record RECORD;
    slot_id INTEGER;
    assignments_created INTEGER := 0;
    session_number INTEGER := 1;
BEGIN
    -- Get subscription details
    SELECT * INTO subscription_record FROM monthly_plan_subscriptions WHERE id = subscription_id_param;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Subscription not found with id: %', subscription_id_param;
    END IF;
    
    -- Check if subscription is active
    IF subscription_record.status != 'active' THEN
        RAISE EXCEPTION 'Subscription is not active. Current status: %', subscription_record.status;
    END IF;
    
    -- Check if member has enough sessions remaining
    IF array_length(slot_ids, 1) > subscription_record.sessions_remaining THEN
        RAISE EXCEPTION 'Not enough sessions remaining. Requested: %, Available: %', 
            array_length(slot_ids, 1), subscription_record.sessions_remaining;
    END IF;
    
    -- Assign each slot
    FOREACH slot_id IN ARRAY slot_ids LOOP
        -- Check if slot is available
        IF NOT EXISTS (
            SELECT 1 FROM trainer_master_slots 
            WHERE id = slot_id AND slot_type = 'available' AND is_active = true
        ) THEN
            RAISE EXCEPTION 'Slot % is not available for assignment', slot_id;
        END IF;
        
        -- Create slot assignment
        INSERT INTO slot_assignments (
            slot_id, assignment_type, assigned_member_id, subscription_id,
            assignment_start_date, assignment_end_date, is_permanent, status
        ) VALUES (
            slot_id, 'monthly_plan', subscription_record.member_id, subscription_id_param,
            assignment_start_date_param, assignment_end_date_param, is_permanent_param, 'active'
        );
        
        -- Update slot type
        UPDATE trainer_master_slots 
        SET slot_type = 'monthly_plan', updated_at = CURRENT_TIMESTAMP 
        WHERE id = slot_id;
        
        -- Create session assignment
        INSERT INTO monthly_plan_session_assignments (
            subscription_id, slot_assignment_id, scheduled_date, scheduled_time, slot_id, session_number
        ) VALUES (
            subscription_id_param, 
            (SELECT id FROM slot_assignments WHERE slot_id = slot_id AND assignment_type = 'monthly_plan' ORDER BY created_at DESC LIMIT 1),
            (SELECT date FROM trainer_master_slots WHERE id = slot_id),
            (SELECT start_time FROM trainer_master_slots WHERE id = slot_id),
            slot_id,
            session_number
        );
        
        assignments_created := assignments_created + 1;
        session_number := session_number + 1;
    END LOOP;
    
    -- Update sessions remaining
    UPDATE monthly_plan_subscriptions 
    SET sessions_remaining = sessions_remaining - assignments_created,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = subscription_id_param;
    
    RETURN assignments_created;
END;
$$ LANGUAGE plpgsql;

-- Function to get available slots for a trainer on a specific date
CREATE OR REPLACE FUNCTION get_available_slots_for_date(
    trainer_id_param INTEGER,
    target_date DATE
)
RETURNS TABLE (
    id INTEGER,
    date DATE,
    start_time TIME,
    end_time TIME,
    slot_duration INTEGER,
    batch_name TEXT,
    is_available BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tms.id,
        tms.date,
        tms.start_time,
        tms.end_time,
        tms.slot_duration,
        sgb.batch_name,
        CASE 
            WHEN sa.id IS NULL THEN true 
            ELSE false 
        END as is_available
    FROM trainer_master_slots tms
    JOIN slot_generation_batches sgb ON tms.batch_id = sgb.id
    LEFT JOIN slot_assignments sa ON tms.id = sa.slot_id AND sa.status = 'active'
    WHERE tms.trainer_id = trainer_id_param
      AND tms.date = target_date
      AND tms.is_active = true
    ORDER BY tms.start_time;
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly plan assignments for a trainer
CREATE OR REPLACE FUNCTION get_monthly_plan_assignments(
    trainer_id_param INTEGER,
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE DEFAULT CURRENT_DATE + INTERVAL '30 days'
)
RETURNS TABLE (
    slot_id INTEGER,
    date DATE,
    start_time TIME,
    end_time TIME,
    member_name TEXT,
    subscription_id INTEGER,
    assignment_type VARCHAR(20),
    is_permanent BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tms.id,
        tms.date,
        tms.start_time,
        tms.end_time,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        sa.subscription_id,
        sa.assignment_type,
        sa.is_permanent
    FROM trainer_master_slots tms
    JOIN slot_assignments sa ON tms.id = sa.slot_id
    JOIN users u ON sa.assigned_member_id = u.id
    WHERE tms.trainer_id = trainer_id_param
      AND tms.date BETWEEN start_date AND end_date
      AND tms.slot_type = 'monthly_plan'
      AND sa.status = 'active'
    ORDER BY tms.date, tms.start_time;
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_trainer_monthly_plans_updated_at 
    BEFORE UPDATE ON trainer_monthly_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainer_master_slots_updated_at 
    BEFORE UPDATE ON trainer_master_slots 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_plan_subscriptions_updated_at 
    BEFORE UPDATE ON monthly_plan_subscriptions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_slot_assignments_updated_at 
    BEFORE UPDATE ON slot_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_monthly_plan_session_assignments_updated_at 
    BEFORE UPDATE ON monthly_plan_session_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================
-- SAMPLE DATA FOR TESTING
-- ==============================================

-- Note: Sample data will be inserted through the backend API
-- to ensure proper foreign key relationships

-- ==============================================
-- COMMENTS FOR DOCUMENTATION
-- ==============================================

COMMENT ON TABLE trainer_monthly_plans IS 'Stores monthly training plans created by trainers';
COMMENT ON TABLE slot_generation_batches IS 'Tracks batches of slot generation for trainers';
COMMENT ON TABLE trainer_master_slots IS 'Master schedule slots generated by trainers';
COMMENT ON TABLE monthly_plan_subscriptions IS 'Member subscriptions to trainer monthly plans';
COMMENT ON TABLE slot_assignments IS 'Assignments of slots to members or bookings';
COMMENT ON TABLE monthly_plan_session_assignments IS 'Individual session assignments within monthly plans';

COMMENT ON FUNCTION generate_slots_for_batch(INTEGER) IS 'Generates all slots for a given batch';
COMMENT ON FUNCTION assign_slots_to_monthly_plan(INTEGER, INTEGER[], DATE, DATE, BOOLEAN) IS 'Assigns slots to a monthly plan subscription';
COMMENT ON FUNCTION get_available_slots_for_date(INTEGER, DATE) IS 'Gets available slots for a trainer on a specific date';
COMMENT ON FUNCTION get_monthly_plan_assignments(INTEGER, DATE, DATE) IS 'Gets monthly plan assignments for a trainer in a date range';
