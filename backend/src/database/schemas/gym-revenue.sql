-- Gym Revenue Tracking System
-- This system tracks all revenue sources and provides comprehensive financial reporting

-- ==============================================
-- MAIN REVENUE TABLE
-- ==============================================

-- Central revenue table that aggregates all gym income
CREATE TABLE IF NOT EXISTS gym_revenue (
    id SERIAL PRIMARY KEY,
    revenue_date DATE NOT NULL,
    revenue_source VARCHAR(100) NOT NULL CHECK (revenue_source IN (
        'membership_fees',
        'personal_training',
        'group_classes',
        'equipment_rental',
        'supplement_sales',
        'locker_rental',
        'spa_services',
        'nutrition_consultation',
        'assessment_fees',
        'late_fees',
        'cancellation_fees',
        'referral_bonuses',
        'other'
    )),
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'recurring',
        'one_time',
        'penalty',
        'bonus',
        'ancillary'
    )),
    amount DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0.00,
    net_amount DECIMAL(10,2) NOT NULL, -- amount - tax_amount
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN (
        'credit_card',
        'debit_card',
        'cash',
        'bank_transfer',
        'online_payment',
        'check',
        'mobile_payment'
    )),
    transaction_status VARCHAR(20) DEFAULT 'completed' CHECK (transaction_status IN (
        'pending',
        'completed',
        'failed',
        'refunded',
        'cancelled'
    )),
    reference_table VARCHAR(50), -- e.g., 'payments', 'training_sessions', 'bookings'
    reference_id INTEGER, -- ID from the source table
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL, -- NULL for non-user transactions
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE SET NULL, -- For trainer-related revenue
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- REVENUE BREAKDOWN TABLES
-- ==============================================

-- Detailed breakdown of membership revenue
CREATE TABLE IF NOT EXISTS membership_revenue (
    id SERIAL PRIMARY KEY,
    revenue_id INTEGER REFERENCES gym_revenue(id) ON DELETE CASCADE,
    membership_plan_id INTEGER REFERENCES membership_plans(id) ON DELETE SET NULL,
    plan_name VARCHAR(255),
    plan_duration_months INTEGER,
    is_renewal BOOLEAN DEFAULT false,
    discount_applied DECIMAL(10,2) DEFAULT 0.00,
    promotional_code VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detailed breakdown of personal training revenue
CREATE TABLE IF NOT EXISTS training_revenue (
    id SERIAL PRIMARY KEY,
    revenue_id INTEGER REFERENCES gym_revenue(id) ON DELETE CASCADE,
    training_session_id INTEGER REFERENCES training_sessions(id) ON DELETE SET NULL,
    session_type VARCHAR(50),
    session_duration_minutes INTEGER,
    trainer_hourly_rate DECIMAL(10,2),
    gym_commission_rate DECIMAL(4,2), -- Percentage gym keeps
    trainer_earnings DECIMAL(10,2),
    gym_earnings DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detailed breakdown of class revenue
CREATE TABLE IF NOT EXISTS class_revenue (
    id SERIAL PRIMARY KEY,
    revenue_id INTEGER REFERENCES gym_revenue(id) ON DELETE CASCADE,
    class_id INTEGER REFERENCES classes(id) ON DELETE SET NULL,
    class_name VARCHAR(255),
    class_category VARCHAR(100),
    attendees_count INTEGER,
    price_per_person DECIMAL(10,2),
    total_capacity INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- REVENUE AGGREGATION TABLES
-- ==============================================

-- Daily revenue summary
CREATE TABLE IF NOT EXISTS daily_revenue_summary (
    id SERIAL PRIMARY KEY,
    summary_date DATE NOT NULL UNIQUE,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    membership_revenue DECIMAL(12,2) DEFAULT 0.00,
    training_revenue DECIMAL(12,2) DEFAULT 0.00,
    class_revenue DECIMAL(12,2) DEFAULT 0.00,
    other_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_tax DECIMAL(12,2) DEFAULT 0.00,
    net_revenue DECIMAL(12,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Monthly revenue summary
CREATE TABLE IF NOT EXISTS monthly_revenue_summary (
    id SERIAL PRIMARY KEY,
    month_year DATE NOT NULL UNIQUE, -- First day of the month
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_transactions INTEGER DEFAULT 0,
    membership_revenue DECIMAL(12,2) DEFAULT 0.00,
    training_revenue DECIMAL(12,2) DEFAULT 0.00,
    class_revenue DECIMAL(12,2) DEFAULT 0.00,
    other_revenue DECIMAL(12,2) DEFAULT 0.00,
    total_tax DECIMAL(12,2) DEFAULT 0.00,
    net_revenue DECIMAL(12,2) DEFAULT 0.00,
    average_daily_revenue DECIMAL(10,2) DEFAULT 0.00,
    highest_daily_revenue DECIMAL(10,2) DEFAULT 0.00,
    lowest_daily_revenue DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Revenue by source summary (for reporting)
CREATE TABLE IF NOT EXISTS revenue_source_summary (
    id SERIAL PRIMARY KEY,
    revenue_source VARCHAR(100) NOT NULL,
    period_type VARCHAR(20) NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly', 'yearly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_revenue DECIMAL(12,2) DEFAULT 0.00,
    transaction_count INTEGER DEFAULT 0,
    average_transaction_value DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(revenue_source, period_type, period_start)
);

-- ==============================================
-- REVENUE TRACKING TRIGGERS AND FUNCTIONS
-- ==============================================

-- Function to update daily revenue summary
CREATE OR REPLACE FUNCTION update_daily_revenue_summary()
RETURNS TRIGGER AS $$
DECLARE
    target_date DATE;
BEGIN
    -- Handle both trigger calls and direct function calls
    IF TG_OP IS NOT NULL THEN
        -- This is a trigger call
        target_date := NEW.revenue_date;
    ELSE
        -- This is a direct function call, use current date
        target_date := CURRENT_DATE;
    END IF;
    
    -- Insert or update daily summary
    INSERT INTO daily_revenue_summary (
        summary_date,
        total_revenue,
        total_transactions,
        membership_revenue,
        training_revenue,
        class_revenue,
        other_revenue,
        total_tax,
        net_revenue
    )
    SELECT
        target_date,
        COALESCE(SUM(gr.amount), 0),
        COUNT(*),
        COALESCE(SUM(CASE WHEN gr.revenue_source = 'membership_fees' THEN gr.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN gr.revenue_source = 'personal_training' THEN gr.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN gr.revenue_source = 'group_classes' THEN gr.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN gr.revenue_source NOT IN ('membership_fees', 'personal_training', 'group_classes') THEN gr.amount ELSE 0 END), 0),
        COALESCE(SUM(gr.tax_amount), 0),
        COALESCE(SUM(gr.net_amount), 0)
    FROM gym_revenue gr
    WHERE gr.revenue_date = target_date
    AND gr.transaction_status = 'completed'
    ON CONFLICT (summary_date) DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        total_transactions = EXCLUDED.total_transactions,
        membership_revenue = EXCLUDED.membership_revenue,
        training_revenue = EXCLUDED.training_revenue,
        class_revenue = EXCLUDED.class_revenue,
        other_revenue = EXCLUDED.other_revenue,
        total_tax = EXCLUDED.total_tax,
        net_revenue = EXCLUDED.net_revenue,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN COALESCE(NEW, 'OK'::text);
END;
$$ LANGUAGE plpgsql;

-- Function to update monthly revenue summary
CREATE OR REPLACE FUNCTION update_monthly_revenue_summary()
RETURNS TRIGGER AS $$
DECLARE
    month_start DATE;
    month_end DATE;
    target_date DATE;
BEGIN
    -- Handle both trigger calls and direct function calls
    IF TG_OP IS NOT NULL THEN
        -- This is a trigger call
        target_date := NEW.revenue_date;
    ELSE
        -- This is a direct function call, use current date
        target_date := CURRENT_DATE;
    END IF;
    
    -- Calculate month boundaries
    month_start := DATE_TRUNC('month', target_date);
    month_end := month_start + INTERVAL '1 month' - INTERVAL '1 day';
    
    -- Insert or update monthly summary
    INSERT INTO monthly_revenue_summary (
        month_year,
        total_revenue,
        total_transactions,
        membership_revenue,
        training_revenue,
        class_revenue,
        other_revenue,
        total_tax,
        net_revenue,
        average_daily_revenue,
        highest_daily_revenue,
        lowest_daily_revenue
    )
    SELECT
        month_start,
        COALESCE(SUM(gr.amount), 0),
        COUNT(*),
        COALESCE(SUM(CASE WHEN gr.revenue_source = 'membership_fees' THEN gr.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN gr.revenue_source = 'personal_training' THEN gr.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN gr.revenue_source = 'group_classes' THEN gr.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN gr.revenue_source NOT IN ('membership_fees', 'personal_training', 'group_classes') THEN gr.amount ELSE 0 END), 0),
        COALESCE(SUM(gr.tax_amount), 0),
        COALESCE(SUM(gr.net_amount), 0),
        COALESCE(AVG(drs.total_revenue), 0),
        COALESCE(MAX(drs.total_revenue), 0),
        COALESCE(MIN(drs.total_revenue), 0)
    FROM gym_revenue gr
    LEFT JOIN daily_revenue_summary drs ON drs.summary_date BETWEEN month_start AND month_end
    WHERE gr.revenue_date BETWEEN month_start AND month_end
    AND gr.transaction_status = 'completed'
    ON CONFLICT (month_year) DO UPDATE SET
        total_revenue = EXCLUDED.total_revenue,
        total_transactions = EXCLUDED.total_transactions,
        membership_revenue = EXCLUDED.membership_revenue,
        training_revenue = EXCLUDED.training_revenue,
        class_revenue = EXCLUDED.class_revenue,
        other_revenue = EXCLUDED.other_revenue,
        total_tax = EXCLUDED.total_tax,
        net_revenue = EXCLUDED.net_revenue,
        average_daily_revenue = EXCLUDED.average_daily_revenue,
        highest_daily_revenue = EXCLUDED.highest_daily_revenue,
        lowest_daily_revenue = EXCLUDED.lowest_daily_revenue,
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN COALESCE(NEW, 'OK'::text);
END;
$$ LANGUAGE plpgsql;

-- ==============================================
-- TRIGGERS
-- ==============================================

-- Trigger to automatically update daily summary when revenue is added/modified
CREATE TRIGGER trigger_update_daily_revenue_summary
    AFTER INSERT OR UPDATE OR DELETE ON gym_revenue
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_revenue_summary();

-- Trigger to automatically update monthly summary when daily summary changes
CREATE TRIGGER trigger_update_monthly_revenue_summary
    AFTER INSERT OR UPDATE OR DELETE ON daily_revenue_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_monthly_revenue_summary();

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

-- Main revenue table indexes
CREATE INDEX IF NOT EXISTS idx_gym_revenue_date ON gym_revenue(revenue_date);
CREATE INDEX IF NOT EXISTS idx_gym_revenue_source ON gym_revenue(revenue_source);
CREATE INDEX IF NOT EXISTS idx_gym_revenue_category ON gym_revenue(category);
CREATE INDEX IF NOT EXISTS idx_gym_revenue_status ON gym_revenue(transaction_status);
CREATE INDEX IF NOT EXISTS idx_gym_revenue_user_id ON gym_revenue(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_revenue_trainer_id ON gym_revenue(trainer_id);
CREATE INDEX IF NOT EXISTS idx_gym_revenue_reference ON gym_revenue(reference_table, reference_id);

-- Breakdown table indexes
CREATE INDEX IF NOT EXISTS idx_membership_revenue_revenue_id ON membership_revenue(revenue_id);
CREATE INDEX IF NOT EXISTS idx_training_revenue_revenue_id ON training_revenue(revenue_id);
CREATE INDEX IF NOT EXISTS idx_class_revenue_revenue_id ON class_revenue(revenue_id);

-- Summary table indexes
CREATE INDEX IF NOT EXISTS idx_daily_revenue_summary_date ON daily_revenue_summary(summary_date);
CREATE INDEX IF NOT EXISTS idx_monthly_revenue_summary_month ON monthly_revenue_summary(month_year);
CREATE INDEX IF NOT EXISTS idx_revenue_source_summary_period ON revenue_source_summary(period_type, period_start, period_end);

-- ==============================================
-- SAMPLE DATA INSERTION
-- ==============================================

-- Insert sample revenue data for demonstration
INSERT INTO gym_revenue (
    revenue_date,
    revenue_source,
    category,
    amount,
    tax_amount,
    net_amount,
    payment_method,
    transaction_status,
    reference_table,
    reference_id,
    user_id,
    notes
) VALUES
-- Membership fees
(CURRENT_DATE - INTERVAL '30 days', 'membership_fees', 'recurring', 89.99, 8.99, 81.00, 'credit_card', 'completed', 'payments', 1, 1, 'Premium membership monthly fee'),
(CURRENT_DATE - INTERVAL '29 days', 'membership_fees', 'recurring', 49.99, 4.99, 45.00, 'debit_card', 'completed', 'payments', 2, 2, 'Basic membership monthly fee'),
(CURRENT_DATE - INTERVAL '28 days', 'membership_fees', 'recurring', 129.99, 12.99, 117.00, 'online_payment', 'completed', 'payments', 3, 3, 'Elite membership monthly fee'),

-- Personal training
(CURRENT_DATE - INTERVAL '25 days', 'personal_training', 'one_time', 75.00, 7.50, 67.50, 'credit_card', 'completed', 'training_sessions', 1, 4, 'Personal training session'),
(CURRENT_DATE - INTERVAL '24 days', 'personal_training', 'one_time', 75.00, 7.50, 67.50, 'cash', 'completed', 'training_sessions', 2, 5, 'Personal training session'),

-- Group classes
(CURRENT_DATE - INTERVAL '20 days', 'group_classes', 'one_time', 15.00, 1.50, 13.50, 'credit_card', 'completed', 'bookings', 1, 6, 'Yoga class drop-in'),
(CURRENT_DATE - INTERVAL '19 days', 'group_classes', 'one_time', 15.00, 1.50, 13.50, 'debit_card', 'completed', 'bookings', 2, 7, 'Spinning class drop-in'),

-- Other services
(CURRENT_DATE - INTERVAL '15 days', 'nutrition_consultation', 'one_time', 50.00, 5.00, 45.00, 'credit_card', 'completed', 'nutrition_consultations', 1, 8, 'Nutrition consultation'),
(CURRENT_DATE - INTERVAL '14 days', 'supplement_sales', 'one_time', 25.00, 2.50, 22.50, 'cash', 'completed', 'payments', 4, 9, 'Protein powder sale'),

-- Current month revenue
(CURRENT_DATE - INTERVAL '7 days', 'membership_fees', 'recurring', 89.99, 8.99, 81.00, 'credit_card', 'completed', 'payments', 5, 1, 'Premium membership renewal'),
(CURRENT_DATE - INTERVAL '6 days', 'membership_fees', 'recurring', 49.99, 4.99, 45.00, 'debit_card', 'completed', 'payments', 6, 2, 'Basic membership renewal'),
(CURRENT_DATE - INTERVAL '5 days', 'personal_training', 'one_time', 75.00, 7.50, 67.50, 'credit_card', 'completed', 'training_sessions', 3, 4, 'Personal training session'),
(CURRENT_DATE - INTERVAL '4 days', 'group_classes', 'one_time', 15.00, 1.50, 13.50, 'credit_card', 'completed', 'bookings', 3, 6, 'Pilates class drop-in'),
(CURRENT_DATE - INTERVAL '3 days', 'membership_fees', 'recurring', 129.99, 12.99, 117.00, 'online_payment', 'completed', 'payments', 7, 3, 'Elite membership renewal'),
(CURRENT_DATE - INTERVAL '2 days', 'personal_training', 'one_time', 75.00, 7.50, 67.50, 'cash', 'completed', 'training_sessions', 4, 5, 'Personal training session'),
(CURRENT_DATE - INTERVAL '1 day', 'group_classes', 'one_time', 15.00, 1.50, 13.50, 'debit_card', 'completed', 'bookings', 4, 7, 'Zumba class drop-in'),
(CURRENT_DATE, 'membership_fees', 'recurring', 89.99, 8.99, 81.00, 'credit_card', 'completed', 'payments', 8, 10, 'New Premium membership')
ON CONFLICT DO NOTHING;

-- Insert corresponding breakdown data
INSERT INTO membership_revenue (revenue_id, membership_plan_id, plan_name, plan_duration_months, is_renewal)
SELECT 
    gr.id,
    mp.id,
    mp.name,
    mp.duration_months,
    CASE WHEN gr.notes LIKE '%renewal%' OR gr.notes LIKE '%Renewal%' THEN true ELSE false END
FROM gym_revenue gr
LEFT JOIN membership_plans mp ON mp.name = 
    CASE 
        WHEN gr.notes LIKE '%Premium%' THEN 'Premium'
        WHEN gr.notes LIKE '%Basic%' THEN 'Basic'
        WHEN gr.notes LIKE '%Elite%' THEN 'Elite'
        ELSE 'Basic'
    END
WHERE gr.revenue_source = 'membership_fees'
ON CONFLICT DO NOTHING;

INSERT INTO training_revenue (revenue_id, training_session_id, session_type, session_duration_minutes, trainer_hourly_rate, gym_commission_rate, trainer_earnings, gym_earnings)
SELECT 
    gr.id,
    gr.reference_id,
    'personal_training',
    60,
    75.00,
    0.30,
    52.50, -- 70% of 75
    22.50  -- 30% of 75
FROM gym_revenue gr
WHERE gr.revenue_source = 'personal_training'
ON CONFLICT DO NOTHING;

INSERT INTO class_revenue (revenue_id, class_id, class_name, class_category, attendees_count, price_per_person, total_capacity)
SELECT 
    gr.id,
    gr.reference_id,
    CASE 
        WHEN gr.notes LIKE '%Yoga%' THEN 'Yoga'
        WHEN gr.notes LIKE '%Spinning%' THEN 'Spinning'
        WHEN gr.notes LIKE '%Pilates%' THEN 'Pilates'
        WHEN gr.notes LIKE '%Zumba%' THEN 'Zumba'
        ELSE 'Group Class'
    END,
    'fitness',
    1,
    15.00,
    20
FROM gym_revenue gr
WHERE gr.revenue_source = 'group_classes'
ON CONFLICT DO NOTHING;
