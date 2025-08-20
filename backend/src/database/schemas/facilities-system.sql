-- Facilities Booking System Schema for Finova Fitness

-- Facilities table - Store facility details
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    default_duration_minutes INTEGER DEFAULT 60,
    max_capacity INTEGER DEFAULT 1,
    location VARCHAR(255),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facility schedules - Store recurring availability patterns
CREATE TABLE IF NOT EXISTS facility_schedules (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id, day_of_week, start_time)
);

-- Facility pricing - Store pricing rules
CREATE TABLE IF NOT EXISTS facility_pricing (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    base_price DECIMAL(10,2) NOT NULL,
    peak_hours_start TIME DEFAULT '17:00:00',
    peak_hours_end TIME DEFAULT '21:00:00',
    peak_price_multiplier DECIMAL(4,2) DEFAULT 1.25, -- 25% increase for peak hours
    member_discount_percentage DECIMAL(5,2) DEFAULT 15.00, -- 15% discount for members
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id)
);

-- Facility slots - Store individual time slots
CREATE TABLE IF NOT EXISTS facility_slots (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked', 'maintenance')),
    base_price DECIMAL(10,2) NOT NULL,
    final_price DECIMAL(10,2) NOT NULL,
    slot_type VARCHAR(20) DEFAULT 'regular' CHECK (slot_type IN ('regular', 'peak', 'off_peak')),
    max_capacity INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id, date, start_time)
);

-- Facility bookings - Store user bookings
CREATE TABLE IF NOT EXISTS facility_bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    slot_id INTEGER REFERENCES facility_slots(id) ON DELETE CASCADE,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
    price_paid DECIMAL(10,2) NOT NULL,
    notes TEXT,
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facility availability exceptions - Store one-time closures/maintenance
CREATE TABLE IF NOT EXISTS facility_availability_exceptions (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    reason VARCHAR(255) NOT NULL,
    is_blocked BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facility waitlist - Store waiting list entries
CREATE TABLE IF NOT EXISTS facility_waitlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    preferred_date DATE NOT NULL,
    preferred_start_time TIME NOT NULL,
    preferred_end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'waiting' CHECK (status IN ('waiting', 'notified', 'booked', 'expired')),
    priority INTEGER DEFAULT 0, -- Higher number = higher priority
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facility analytics - Store usage statistics
CREATE TABLE IF NOT EXISTS facility_analytics (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_slots INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0.00,
    peak_hour_bookings INTEGER DEFAULT 0,
    off_peak_bookings INTEGER DEFAULT 0,
    member_bookings INTEGER DEFAULT 0,
    non_member_bookings INTEGER DEFAULT 0,
    average_utilization_percentage DECIMAL(5,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id, date)
);

-- Cancellation policies - Store cancellation rules
CREATE TABLE IF NOT EXISTS cancellation_policies (
    id SERIAL PRIMARY KEY,
    facility_id INTEGER REFERENCES facilities(id) ON DELETE CASCADE,
    cancellation_hours INTEGER DEFAULT 24, -- Hours before slot start time
    refund_percentage DECIMAL(5,2) DEFAULT 100.00, -- Percentage refund
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(facility_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_facility_slots_facility_date ON facility_slots(facility_id, date);
CREATE INDEX IF NOT EXISTS idx_facility_slots_status ON facility_slots(status);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_user ON facility_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_slot ON facility_bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_facility_bookings_date ON facility_bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_facility_waitlist_facility_date ON facility_waitlist(facility_id, preferred_date);
CREATE INDEX IF NOT EXISTS idx_facility_analytics_facility_date ON facility_analytics(facility_id, date);

-- Insert default cancellation policy for all facilities
INSERT INTO cancellation_policies (facility_id, cancellation_hours, refund_percentage)
SELECT id, 24, 100.00 FROM facilities
ON CONFLICT (facility_id) DO NOTHING;
