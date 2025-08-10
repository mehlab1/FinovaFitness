-- Finova Fitness Database Schema

-- Users table (for all portal types)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('public', 'member', 'trainer', 'nutritionist', 'admin', 'front_desk')),
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    emergency_contact VARCHAR(255),
    membership_type VARCHAR(50),
    membership_start_date DATE,
    membership_end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainers table (extends users)
CREATE TABLE IF NOT EXISTS trainers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    specialization TEXT[],
    certification TEXT[],
    experience_years INTEGER,
    bio TEXT,
    hourly_rate DECIMAL(10,2),
    availability JSONB,
    rating DECIMAL(3,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    max_capacity INTEGER,
    current_capacity INTEGER DEFAULT 0,
    trainer_id INTEGER REFERENCES trainers(id),
    room VARCHAR(100),
    equipment_needed TEXT[],
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class schedules
CREATE TABLE IF NOT EXISTS class_schedules (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_recurring BOOLEAN DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    trainer_id INTEGER REFERENCES trainers(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_type VARCHAR(20) CHECK (booking_type IN ('class', 'personal_training', 'consultation')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Membership plans
CREATE TABLE IF NOT EXISTS membership_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    features TEXT[],
    max_classes_per_month INTEGER,
    includes_personal_training BOOLEAN DEFAULT false,
    includes_nutrition_consultation BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Create indexes for better performance (after all tables are created)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_class_id ON bookings(class_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_classes_category ON classes(category);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON workout_logs(workout_date);

-- ==============================================
-- MEMBER PORTAL SPECIFIC TABLES
-- ==============================================

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
    exercise_id INTEGER REFERENCES exercises(id) ON DELETE CASCADE,
    muscle_group_id INTEGER REFERENCES muscle_groups(id) ON DELETE CASCADE,
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

-- ==============================================
-- TRAINER PORTAL SPECIFIC TABLES
-- ==============================================

-- Training sessions (individual sessions between trainer and client)
CREATE TABLE IF NOT EXISTS training_sessions (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type VARCHAR(50) NOT NULL CHECK (session_type IN ('personal_training', 'group_session', 'consultation', 'demo')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
    price DECIMAL(10,2),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Session packages (packages bought by clients)
CREATE TABLE IF NOT EXISTS session_packages (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    package_name VARCHAR(255) NOT NULL,
    total_sessions INTEGER NOT NULL,
    remaining_sessions INTEGER NOT NULL,
    price_per_session DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    purchase_date DATE NOT NULL,
    expiry_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer schedule and availability
CREATE TABLE IF NOT EXISTS trainer_availability (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    session_duration_minutes INTEGER DEFAULT 60,
    max_sessions_per_day INTEGER DEFAULT 8,
    break_duration_minutes INTEGER DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trainer_id, day_of_week, start_time)
);

-- Trainer time off / blocked slots
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

-- Session notes for each client session
CREATE TABLE IF NOT EXISTS session_notes (
    id SERIAL PRIMARY KEY,
    training_session_id INTEGER REFERENCES training_sessions(id) ON DELETE CASCADE,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    exercises_performed TEXT[],
    sets_and_reps JSONB, -- {"exercise_name": {"sets": 3, "reps": [12, 10, 8], "weight": [50, 55, 60]}}
    client_feedback TEXT,
    trainer_observations TEXT,
    next_session_goals TEXT,
    client_progress_notes TEXT,
    fitness_metrics JSONB, -- {"weight": 70, "body_fat": 15, "measurements": {...}}
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Client training requests (from members and non-members)
CREATE TABLE IF NOT EXISTS training_requests (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER REFERENCES users(id) ON DELETE CASCADE, -- NULL for non-members
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    requester_email VARCHAR(255) NOT NULL, -- For non-members
    requester_name VARCHAR(255) NOT NULL,
    requester_phone VARCHAR(20),
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('personal_training', 'demo_session', 'consultation', 'group_session')),
    preferred_date DATE,
    preferred_time TIME,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    trainer_response TEXT,
    approved_date DATE,
    approved_time TIME,
    session_price DECIMAL(10,2),
    is_member BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer ratings and reviews
CREATE TABLE IF NOT EXISTS trainer_ratings (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    training_session_id INTEGER REFERENCES training_sessions(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT,
    training_effectiveness INTEGER CHECK (training_effectiveness BETWEEN 1 AND 5),
    communication INTEGER CHECK (communication BETWEEN 1 AND 5),
    punctuality INTEGER CHECK (punctuality BETWEEN 1 AND 5),
    professionalism INTEGER CHECK (professionalism BETWEEN 1 AND 5),
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(training_session_id) -- One rating per session
);

-- Client progress tracking (detailed progress for each client)
CREATE TABLE IF NOT EXISTS client_progress (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    progress_date DATE NOT NULL,
    weight DECIMAL(5,2), -- in kg
    body_fat_percentage DECIMAL(4,2),
    muscle_mass DECIMAL(5,2),
    measurements JSONB, -- {"chest": 40, "waist": 32, "bicep": 14, etc.}
    fitness_level VARCHAR(20) CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
    strength_metrics JSONB, -- {"bench_press": 80, "squat": 100, "deadlift": 120}
    cardio_metrics JSONB, -- {"5k_time": "25:30", "max_heart_rate": 180}
    flexibility_score INTEGER CHECK (flexibility_score BETWEEN 1 AND 10),
    progress_photos TEXT[], -- URLs to progress photos
    goals_achieved TEXT[],
    current_goals TEXT[],
    trainer_assessment TEXT,
    next_milestones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trainer revenue tracking
CREATE TABLE IF NOT EXISTS trainer_revenue (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    revenue_date DATE NOT NULL,
    training_session_id INTEGER REFERENCES training_sessions(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(50),
    amount DECIMAL(10,2) NOT NULL,
    commission_rate DECIMAL(4,2) DEFAULT 0.70, -- 70% to trainer, 30% to gym
    trainer_earnings DECIMAL(10,2) NOT NULL,
    gym_commission DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'overdue')),
    payout_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly trainer stats summary
CREATE TABLE IF NOT EXISTS trainer_monthly_stats (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    month_year DATE NOT NULL, -- First day of the month
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    cancelled_sessions INTEGER DEFAULT 0,
    no_show_sessions INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    new_clients INTEGER DEFAULT 0,
    active_clients INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trainer_id, month_year)
);

-- Client subscriptions and plans (linked to trainer)
CREATE TABLE IF NOT EXISTS client_trainer_subscriptions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    subscription_type VARCHAR(50) NOT NULL, -- 'monthly', 'weekly', 'package', 'unlimited'
    plan_name VARCHAR(255) NOT NULL,
    sessions_per_week INTEGER,
    sessions_per_month INTEGER,
    price_per_session DECIMAL(10,2),
    monthly_fee DECIMAL(10,2),
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
    remaining_sessions INTEGER DEFAULT 0,
    total_sessions_included INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Member profile indexes
CREATE INDEX IF NOT EXISTS idx_member_profiles_user_id ON member_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_member_profiles_plan_id ON member_profiles(current_plan_id);

-- Referral system indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_promo_code ON referrals(promo_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- Loyalty transactions indexes
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_type ON loyalty_transactions(transaction_type);

-- Exercise and muscle group indexes
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(primary_muscle_group_id);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty_level);

-- Workout schedule indexes
CREATE INDEX IF NOT EXISTS idx_workout_schedules_user_id ON member_workout_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_schedules_day ON member_workout_schedules(day_of_week);
CREATE INDEX IF NOT EXISTS idx_schedule_muscle_groups_schedule_id ON schedule_muscle_groups(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exercises_schedule_id ON schedule_exercises(schedule_id);
CREATE INDEX IF NOT EXISTS idx_schedule_exercises_muscle_group ON schedule_exercises(muscle_group_id);

-- Gym visits indexes
CREATE INDEX IF NOT EXISTS idx_gym_visits_user_id ON gym_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_visits_date ON gym_visits(visit_date);

-- Booking reviews indexes
CREATE INDEX IF NOT EXISTS idx_booking_reviews_booking_id ON booking_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_reviews_user_id ON booking_reviews(user_id);

-- Trainer portal indexes
CREATE INDEX IF NOT EXISTS idx_training_sessions_trainer_id ON training_sessions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_client_id ON training_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_training_sessions_date ON training_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_training_sessions_status ON training_sessions(status);

CREATE INDEX IF NOT EXISTS idx_session_packages_client_id ON session_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_session_packages_trainer_id ON session_packages(trainer_id);
CREATE INDEX IF NOT EXISTS idx_session_packages_active ON session_packages(is_active);

CREATE INDEX IF NOT EXISTS idx_trainer_availability_trainer_id ON trainer_availability(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_availability_day ON trainer_availability(day_of_week);

CREATE INDEX IF NOT EXISTS idx_trainer_time_off_trainer_id ON trainer_time_off(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_time_off_date ON trainer_time_off(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_session_notes_session_id ON session_notes(training_session_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_trainer_id ON session_notes(trainer_id);
CREATE INDEX IF NOT EXISTS idx_session_notes_client_id ON session_notes(client_id);

CREATE INDEX IF NOT EXISTS idx_training_requests_trainer_id ON training_requests(trainer_id);
CREATE INDEX IF NOT EXISTS idx_training_requests_requester_id ON training_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_training_requests_status ON training_requests(status);
CREATE INDEX IF NOT EXISTS idx_training_requests_date ON training_requests(preferred_date);

CREATE INDEX IF NOT EXISTS idx_trainer_ratings_trainer_id ON trainer_ratings(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_ratings_client_id ON trainer_ratings(client_id);
CREATE INDEX IF NOT EXISTS idx_trainer_ratings_session_id ON trainer_ratings(training_session_id);

CREATE INDEX IF NOT EXISTS idx_client_progress_client_id ON client_progress(client_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_trainer_id ON client_progress(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_progress_date ON client_progress(progress_date);

CREATE INDEX IF NOT EXISTS idx_trainer_revenue_trainer_id ON trainer_revenue(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_revenue_date ON trainer_revenue(revenue_date);
CREATE INDEX IF NOT EXISTS idx_trainer_revenue_client_id ON trainer_revenue(client_id);

CREATE INDEX IF NOT EXISTS idx_trainer_monthly_stats_trainer_id ON trainer_monthly_stats(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_monthly_stats_month ON trainer_monthly_stats(month_year);

CREATE INDEX IF NOT EXISTS idx_client_trainer_subs_client_id ON client_trainer_subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_trainer_subs_trainer_id ON client_trainer_subscriptions(trainer_id);
CREATE INDEX IF NOT EXISTS idx_client_trainer_subs_status ON client_trainer_subscriptions(status);

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

-- ==============================================
-- SAMPLE DATA FOR TRAINER PORTAL
-- ==============================================

-- Sample trainer availability (assuming trainer with id 1 exists)
INSERT INTO trainer_availability (trainer_id, day_of_week, start_time, end_time, session_duration_minutes, max_sessions_per_day) VALUES
(1, 1, '06:00', '20:00', 60, 8), -- Monday
(1, 2, '06:00', '20:00', 60, 8), -- Tuesday  
(1, 3, '06:00', '20:00', 60, 8), -- Wednesday
(1, 4, '06:00', '20:00', 60, 8), -- Thursday
(1, 5, '06:00', '18:00', 60, 6), -- Friday (shorter day)
(1, 6, '08:00', '16:00', 60, 4)  -- Saturday (weekend schedule)
ON CONFLICT DO NOTHING;

-- Sample training requests
INSERT INTO training_requests (requester_email, requester_name, requester_phone, trainer_id, request_type, preferred_date, preferred_time, message, is_member, status) VALUES
('john.doe@email.com', 'John Doe', '+1234567890', 1, 'demo_session', CURRENT_DATE + INTERVAL '3 days', '10:00', 'Interested in starting personal training', false, 'pending'),
('jane.smith@email.com', 'Jane Smith', '+1234567891', 1, 'personal_training', CURRENT_DATE + INTERVAL '5 days', '14:00', 'Want to work on strength training', false, 'approved'),
('mike.johnson@email.com', 'Mike Johnson', '+1234567892', 1, 'consultation', CURRENT_DATE + INTERVAL '2 days', '16:00', 'Need fitness assessment', false, 'pending')
ON CONFLICT DO NOTHING;

-- ==============================================
-- SAMPLE DATA FOR MEMBER PORTAL
-- ==============================================

-- Insert sample muscle groups
INSERT INTO muscle_groups (name, description) VALUES
('Chest', 'Pectoral muscles including upper, middle, and lower chest'),
('Back', 'Latissimus dorsi, rhomboids, and middle traps'),
('Shoulders', 'Deltoids - anterior, medial, and posterior'),
('Biceps', 'Biceps brachii and brachialis'),
('Triceps', 'Triceps brachii - long, lateral, and medial heads'),
('Legs', 'Quadriceps, hamstrings, glutes, and calves'),
('Core', 'Abdominals, obliques, and lower back'),
('Forearms', 'Wrist flexors and extensors'),
('Traps', 'Upper trapezius muscles'),
('Glutes', 'Gluteus maximus, medius, and minimus')
ON CONFLICT (name) DO NOTHING;

-- Insert sample exercises
INSERT INTO exercises (name, description, instructions, primary_muscle_group_id, equipment_needed, difficulty_level) VALUES
('Bench Press', 'Classic chest building exercise', 'Lie on bench, lower bar to chest, press up', 1, ARRAY['Barbell', 'Bench'], 'intermediate'),
('Push-ups', 'Bodyweight chest exercise', 'Start in plank, lower body, push back up', 1, ARRAY[]::TEXT[], 'beginner'),
('Pull-ups', 'Back and bicep exercise', 'Hang from bar, pull body up until chin over bar', 2, ARRAY['Pull-up bar'], 'intermediate'),
('Squats', 'Fundamental leg exercise', 'Lower body as if sitting back into chair, return to standing', 6, ARRAY[]::TEXT[], 'beginner'),
('Deadlifts', 'Full body compound movement', 'Lift bar from ground keeping back straight', 6, ARRAY['Barbell'], 'advanced'),
('Shoulder Press', 'Overhead pressing movement', 'Press weight overhead from shoulder level', 3, ARRAY['Dumbbells'], 'intermediate'),
('Bicep Curls', 'Isolated bicep exercise', 'Curl weight up contracting bicep', 4, ARRAY['Dumbbells'], 'beginner'),
('Tricep Dips', 'Bodyweight tricep exercise', 'Lower body by bending arms, push back up', 5, ARRAY['Dip bars'], 'intermediate'),
('Planks', 'Core stability exercise', 'Hold body straight in push-up position', 7, ARRAY[]::TEXT[], 'beginner'),
('Lunges', 'Single leg exercise', 'Step forward, lower back knee toward ground', 6, ARRAY[]::TEXT[], 'beginner')
ON CONFLICT DO NOTHING;

-- Insert sample membership plans
INSERT INTO membership_plans (name, description, price, duration_months, features, max_classes_per_month, includes_personal_training, includes_nutrition_consultation) VALUES
('Basic', 'Access to gym facilities and group classes', 49.99, 1, ARRAY['Gym access', 'Group classes', 'Locker room'], 8, false, false),
('Premium', 'Full access with personal training sessions', 89.99, 1, ARRAY['Gym access', 'All classes', 'Personal training', 'Nutrition consultation'], 20, true, true),
('Elite', 'Ultimate fitness experience with unlimited access', 129.99, 1, ARRAY['Unlimited access', 'All classes', 'Personal training', 'Nutrition consultation', 'Spa access'], -1, true, true)
ON CONFLICT DO NOTHING; 