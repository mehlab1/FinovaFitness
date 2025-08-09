-- Trainer Portal Specific Tables

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
