-- Member Balance System Tables

-- Member balance table to store current balance for each member
CREATE TABLE IF NOT EXISTS member_balance (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    current_balance DECIMAL(10,2) DEFAULT 0.00,
    total_earned DECIMAL(10,2) DEFAULT 0.00,
    total_spent DECIMAL(10,2) DEFAULT 0.00,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Member balance transactions table to track all balance changes
CREATE TABLE IF NOT EXISTS member_balance_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN ('plan_change', 'refund', 'bonus', 'payment', 'adjustment')),
    amount DECIMAL(10,2) NOT NULL,
    balance_before DECIMAL(10,2) NOT NULL,
    balance_after DECIMAL(10,2) NOT NULL,
    description TEXT,
    reference_id INTEGER, -- can reference membership changes, payments, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Plan change requests table to track membership plan changes
CREATE TABLE IF NOT EXISTS plan_change_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    current_plan_id INTEGER REFERENCES membership_plans(id),
    new_plan_id INTEGER REFERENCES membership_plans(id),
    current_plan_balance DECIMAL(10,2) NOT NULL, -- remaining value of current plan
    new_plan_price DECIMAL(10,2) NOT NULL,
    balance_difference DECIMAL(10,2) NOT NULL, -- positive means user owes money, negative means credit
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    payment_required BOOLEAN DEFAULT false,
    payment_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_member_balance_user_id ON member_balance(user_id);
CREATE INDEX IF NOT EXISTS idx_member_balance_transactions_user_id ON member_balance_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_member_balance_transactions_type ON member_balance_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_plan_change_requests_user_id ON plan_change_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_plan_change_requests_status ON plan_change_requests(status);

-- Insert default balance record for existing members (if any)
INSERT INTO member_balance (user_id, current_balance, total_earned, total_spent)
SELECT 
    u.id,
    0.00,
    0.00,
    0.00
FROM users u
WHERE u.role = 'member'
AND NOT EXISTS (
    SELECT 1 FROM member_balance mb WHERE mb.user_id = u.id
)
ON CONFLICT DO NOTHING;
