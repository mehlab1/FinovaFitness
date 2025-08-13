-- Member Portal Specific Tables

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    condition VARCHAR(20) DEFAULT 'good' CHECK (condition IN ('excellent', 'good', 'fair', 'poor', 'maintenance')),
    location VARCHAR(100),
    purchase_date DATE,
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(50) NOT NULL CHECK (payment_type IN ('membership', 'class_booking', 'personal_training', 'equipment', 'other')),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'cash', 'bank_transfer', 'online')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout logs
CREATE TABLE IF NOT EXISTS workout_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    workout_date DATE NOT NULL,
    workout_type VARCHAR(100),
    duration_minutes INTEGER,
    calories_burned INTEGER,
    notes TEXT,
    -- Enhanced workout logging fields
    start_time TIME,
    end_time TIME,
    energy_level INTEGER CHECK (energy_level BETWEEN 1 AND 10),
    difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 10),
    mood VARCHAR(50),
    sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 10),
    hydration INTEGER CHECK (hydration BETWEEN 1 AND 10),
    pre_workout_meal TEXT,
    post_workout_meal TEXT,
    supplements TEXT[], -- Array of supplement names
    body_weight DECIMAL(5,2), -- in kg
    body_fat_percentage DECIMAL(4,2), -- percentage
    muscle_soreness VARCHAR(20) CHECK (muscle_soreness IN ('None', 'Light', 'Moderate', 'Heavy')),
    cardio_intensity VARCHAR(20) CHECK (cardio_intensity IN ('Low', 'Moderate', 'High')),
    workout_focus VARCHAR(20) CHECK (workout_focus IN ('Strength', 'Hypertrophy', 'Endurance', 'Power', 'Flexibility')),
    personal_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Nutrition consultations
CREATE TABLE IF NOT EXISTS nutrition_consultations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    consultation_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
    notes TEXT,
    meal_plan TEXT,
    recommendations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member profiles (extends users table for member-specific data)
CREATE TABLE IF NOT EXISTS member_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_plan_id INTEGER REFERENCES membership_plans(id),
    loyalty_points INTEGER DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    last_gym_visit DATE,
    weight DECIMAL(5,2), -- in kg
    height DECIMAL(5,2), -- in cm
    profile_image_url TEXT,
    fitness_goals TEXT,
    health_notes TEXT, -- allergies and medical conditions
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral system
CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referred_email VARCHAR(255) NOT NULL,
    referred_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'expired')),
    points_awarded INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    joined_at TIMESTAMP NULL
);

-- Loyalty points transactions
CREATE TABLE IF NOT EXISTS loyalty_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    points_change INTEGER NOT NULL, -- positive for earned, negative for used
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('gym_visit', 'referral', 'purchase', 'bonus', 'redemption')),
    description TEXT,
    reference_id INTEGER, -- can reference bookings, payments, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Muscle groups
CREATE TABLE IF NOT EXISTS muscle_groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exercises
CREATE TABLE IF NOT EXISTS exercises (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    primary_muscle_group_id INTEGER REFERENCES muscle_groups(id),
    secondary_muscle_groups INTEGER[] DEFAULT ARRAY[]::INTEGER[], -- array of muscle_group ids
    equipment_needed TEXT[],
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    video_url TEXT,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member workout schedules (personalized for each member)
CREATE TABLE IF NOT EXISTS member_workout_schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    schedule_name VARCHAR(255), -- e.g., "Push Day", "Leg Day"
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, day_of_week, is_active) -- Only one active schedule per day per user
);

-- Workout schedule muscle groups (which muscle groups are targeted each day)
CREATE TABLE IF NOT EXISTS schedule_muscle_groups (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES member_workout_schedules(id) ON DELETE CASCADE,
    muscle_group_id INTEGER REFERENCES muscle_groups(id) ON DELETE CASCADE,
    order_index INTEGER DEFAULT 0, -- order of muscle groups in the workout
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workout schedule exercises (specific exercises for each muscle group in the schedule)
CREATE TABLE IF NOT EXISTS schedule_exercises (
    id SERIAL PRIMARY KEY,
    schedule_id INTEGER REFERENCES member_workout_schedules(id) ON DELETE CASCADE,
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE SET NULL, -- Allow NULL for custom exercises
    muscle_group_id INTEGER REFERENCES muscle_groups(id) ON DELETE CASCADE,
    exercise_name VARCHAR(255) NOT NULL, -- Store the actual exercise name (custom or predefined)
    exercise_type VARCHAR(20) DEFAULT 'predefined' CHECK (exercise_type IN ('predefined', 'custom')), -- Distinguish between predefined and custom exercises
    sets INTEGER,
    reps VARCHAR(50), -- e.g., "8-12", "to failure"
    weight DECIMAL(6,2), -- in kg
    rest_seconds INTEGER,
    order_index INTEGER DEFAULT 0, -- order of exercises within the muscle group
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Invites sent by members (referral tracking)
CREATE TABLE IF NOT EXISTS member_invites (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    email_sent_to VARCHAR(255) NOT NULL,
    invite_code VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'opened', 'registered', 'expired')),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    opened_at TIMESTAMP NULL,
    registered_at TIMESTAMP NULL
);

-- Enhanced booking history with review status
CREATE TABLE IF NOT EXISTS booking_reviews (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE UNIQUE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    is_reviewed BOOLEAN DEFAULT false,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member gym visits (for streak tracking)
CREATE TABLE IF NOT EXISTS gym_visits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out_time TIMESTAMP NULL,
    duration_minutes INTEGER, -- calculated on checkout
    points_awarded INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, visit_date) -- One visit per day per user
);

-- Weight tracking table for monitoring weight changes over time
CREATE TABLE IF NOT EXISTS weight_tracking (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    weight DECIMAL(5,2) NOT NULL, -- in kg
    height DECIMAL(5,2), -- in cm (optional, for BMI calculation)
    recorded_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for efficient weight history queries
CREATE INDEX IF NOT EXISTS idx_weight_tracking_user_date ON weight_tracking(user_id, recorded_date DESC);

-- Subscription pauses table
CREATE TABLE IF NOT EXISTS subscription_pauses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pause_start_date DATE NOT NULL,
    pause_end_date DATE NOT NULL,
    pause_duration_days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
