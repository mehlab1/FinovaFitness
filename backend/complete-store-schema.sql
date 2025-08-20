-- Complete Online Store System Schema for Finova Fitness
-- Run this entire SQL file directly in your PostgreSQL database

-- ==============================================
-- STORE CATEGORIES
-- ==============================================

CREATE TABLE IF NOT EXISTS store_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- STORE ITEMS
-- ==============================================

CREATE TABLE IF NOT EXISTS store_items (
    id SERIAL PRIMARY KEY,
    category_id INTEGER REFERENCES store_categories(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    member_discount_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (member_discount_percentage >= 0 AND member_discount_percentage <= 100),
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 5 CHECK (low_stock_threshold >= 0),
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- SHOPPING CARTS
-- ==============================================

CREATE TABLE IF NOT EXISTS store_carts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    guest_email VARCHAR(255),
    guest_name VARCHAR(255),
    guest_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_cart_user CHECK (
        (user_id IS NOT NULL) OR 
        (guest_email IS NOT NULL AND guest_name IS NOT NULL)
    )
);

-- ==============================================
-- CART ITEMS
-- ==============================================

CREATE TABLE IF NOT EXISTS store_cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES store_carts(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES store_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL,
    member_discount_applied DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cart_id, item_id)
);

-- ==============================================
-- ORDERS
-- ==============================================

CREATE TABLE IF NOT EXISTS store_orders (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER REFERENCES store_carts(id) ON DELETE SET NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    member_discount_total DECIMAL(10,2) DEFAULT 0.00,
    final_amount DECIMAL(10,2) NOT NULL CHECK (final_amount >= 0),
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('online', 'in_person')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'failed')),
    order_status VARCHAR(30) DEFAULT 'pending' CHECK (order_status IN ('pending', 'processing', 'ready_for_pickup', 'completed', 'cancelled')),
    pickup_notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- ORDER ITEMS
-- ==============================================

CREATE TABLE IF NOT EXISTS store_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES store_orders(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES store_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_at_time DECIMAL(10,2) NOT NULL,
    member_discount_applied DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- ORDER STATUS HISTORY
-- ==============================================

CREATE TABLE IF NOT EXISTS store_order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES store_orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL CHECK (status IN ('pending', 'processing', 'ready_for_pickup', 'completed', 'cancelled')),
    notes TEXT,
    changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INVENTORY TRANSACTIONS
-- ==============================================

CREATE TABLE IF NOT EXISTS store_inventory_transactions (
    id SERIAL PRIMARY KEY,
    item_id INTEGER REFERENCES store_items(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('stock_in', 'stock_out', 'adjustment', 'return')),
    quantity INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reference_type VARCHAR(50),
    reference_id INTEGER,
    notes TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================
-- INDEXES FOR PERFORMANCE
-- ==============================================

CREATE INDEX IF NOT EXISTS idx_store_items_category ON store_items(category_id);
CREATE INDEX IF NOT EXISTS idx_store_items_active ON store_items(is_active);
CREATE INDEX IF NOT EXISTS idx_store_carts_user ON store_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_store_carts_guest ON store_carts(guest_email);
CREATE INDEX IF NOT EXISTS idx_store_cart_items_cart ON store_cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_store_orders_number ON store_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_store_orders_email ON store_orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_store_orders_status ON store_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_store_order_items_order ON store_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_store_order_status_history_order ON store_order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_store_inventory_transactions_item ON store_inventory_transactions(item_id);

-- ==============================================
-- INSERT DEFAULT CATEGORIES
-- ==============================================

INSERT INTO store_categories (name, description) VALUES
('Supplements', 'Protein powders, vitamins, pre-workout, and other nutritional supplements'),
('Gym Accessories', 'Gloves, straps, belts, wraps, and other workout accessories'),
('Equipment', 'Dumbbells, resistance bands, yoga mats, and portable fitness equipment'),
('Apparel', 'Workout clothes, shoes, and fitness wear'),
('Recovery', 'Foam rollers, massage tools, and recovery equipment'),
('Nutrition', 'Meal replacement shakes, bars, and healthy snacks')
ON CONFLICT (name) DO NOTHING;

-- ==============================================
-- VERIFICATION QUERIES (run these to check if tables were created)
-- ==============================================

-- Check if all tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Created'
        ELSE '❌ Missing'
    END as status
FROM (
    VALUES 
        ('store_categories'),
        ('store_items'),
        ('store_carts'),
        ('store_cart_items'),
        ('store_orders'),
        ('store_order_items'),
        ('store_order_status_history'),
        ('store_inventory_transactions')
) AS expected_tables(table_name)
LEFT JOIN information_schema.tables ist 
    ON ist.table_name = expected_tables.table_name 
    AND ist.table_schema = 'public'
ORDER BY table_name;

-- Check default categories
SELECT 
    'Categories' as info,
    COUNT(*) as count,
    string_agg(name, ', ' ORDER BY name) as names
FROM store_categories;

-- Check table structures
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name LIKE 'store_%'
ORDER BY table_name, ordinal_position;

-- Check indexes
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename LIKE 'store_%'
ORDER BY tablename, indexname;
