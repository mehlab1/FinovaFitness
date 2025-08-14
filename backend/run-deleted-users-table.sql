-- Run this SQL script to create the deleted_users table
-- You can run this in your database management tool or via psql

-- Create deleted_users table to log permanently deleted users
CREATE TABLE IF NOT EXISTS deleted_users (
    id SERIAL PRIMARY KEY,
    original_id INTEGER NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    emergency_contact TEXT,
    membership_type VARCHAR(50),
    membership_start_date DATE,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_by_admin_id INTEGER NOT NULL,
    
    -- Add indexes for common queries
    CONSTRAINT fk_deleted_by_admin FOREIGN KEY (deleted_by_admin_id) REFERENCES users(id)
);

-- Create index on original_id for quick lookups
CREATE INDEX IF NOT EXISTS idx_deleted_users_original_id ON deleted_users(original_id);

-- Create index on deleted_at for audit purposes
CREATE INDEX IF NOT EXISTS idx_deleted_users_deleted_at ON deleted_users(deleted_at);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_deleted_users_role ON deleted_users(role);

-- Add comment to table
COMMENT ON TABLE deleted_users IS 'Log of permanently deleted users for audit purposes';

-- Verify table creation
SELECT 'deleted_users table created successfully' as status;
