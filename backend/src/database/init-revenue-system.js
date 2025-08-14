import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

console.log('🚀 Script starting...');

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

// Database configuration - use DATABASE_URL from environment
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/finova_fitness',
    ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

async function initRevenueSystem() {
    console.log('🔧 Environment check:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    let client;
    try {
        console.log('🚀 Initializing Gym Revenue System...');
        console.log('📡 Attempting database connection...');
        
        client = await pool.connect();
        console.log('✅ Database connection successful!');
        
        // Read and execute the revenue schema
        const revenueSchemaPath = path.join(__dirname, 'schemas', 'gym-revenue-simple.sql');
        console.log('📁 Reading schema from:', revenueSchemaPath);
        
        if (!fs.existsSync(revenueSchemaPath)) {
            throw new Error(`Schema file not found: ${revenueSchemaPath}`);
        }
        
        const revenueSchema = fs.readFileSync(revenueSchemaPath, 'utf8');
        console.log('📋 Creating revenue tables and functions...');
        
        await client.query(revenueSchema);
        console.log('✅ Revenue schema created successfully');
        
        // Populate revenue table with existing data from other tables
        console.log('💰 Populating revenue table with existing data...');
        
        // Get existing payments data
        const paymentsResult = await client.query(`
            SELECT 
                p.id,
                p.user_id,
                p.amount,
                p.payment_type,
                p.payment_method,
                p.status,
                p.description,
                p.created_at,
                u.role
            FROM payments p
            LEFT JOIN users u ON p.user_id = u.id
            WHERE p.status = 'completed'
            ORDER BY p.created_at
        `);
        
        console.log(`📊 Found ${paymentsResult.rows.length} completed payments`);
        
        // Insert payments into revenue table
        for (const payment of paymentsResult.rows) {
            let revenueSource = 'other';
            let category = 'one_time';
            
            // Map payment types to revenue sources
            switch (payment.payment_type) {
                case 'membership':
                    revenueSource = 'membership_fees';
                    category = 'recurring';
                    break;
                case 'personal_training':
                    revenueSource = 'personal_training';
                    category = 'one_time';
                    break;
                case 'class_booking':
                    revenueSource = 'group_classes';
                    category = 'one_time';
                    break;
                case 'equipment':
                    revenueSource = 'equipment_rental';
                    category = 'one_time';
                    break;
                default:
                    revenueSource = 'other';
                    category = 'one_time';
            }
            
            // Calculate tax (assuming 10% tax rate for demo)
            const taxAmount = Math.round(payment.amount * 0.10 * 100) / 100;
            const netAmount = payment.amount - taxAmount;
            
            await client.query(`
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
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT DO NOTHING
            `, [
                new Date(payment.created_at).toISOString().split('T')[0],
                revenueSource,
                category,
                payment.amount,
                taxAmount,
                netAmount,
                payment.payment_method,
                payment.status,
                'payments',
                payment.id,
                payment.user_id,
                payment.description || `${payment.payment_type} payment`
            ]);
        }
        
        // Get existing training sessions data
        const trainingSessionsResult = await client.query(`
            SELECT 
                ts.id,
                ts.trainer_id,
                ts.client_id,
                ts.price,
                ts.payment_status,
                ts.session_type,
                ts.session_date,
                ts.created_at
            FROM training_sessions ts
            WHERE ts.payment_status = 'paid'
            ORDER BY ts.created_at
        `);
        
        console.log(`💪 Found ${trainingSessionsResult.rows.length} paid training sessions`);
        
        // Insert training sessions into revenue table
        for (const session of trainingSessionsResult.rows) {
            if (session.price && session.price > 0) {
                const taxAmount = Math.round(session.price * 0.10 * 100) / 100;
                const netAmount = session.price - taxAmount;
                
                await client.query(`
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
                        trainer_id,
                        notes
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                    ON CONFLICT DO NOTHING
                `, [
                    new Date(session.session_date).toISOString().split('T')[0],
                    'personal_training',
                    'one_time',
                    session.price,
                    taxAmount,
                    netAmount,
                    'credit_card', // Default payment method
                    'completed',
                    'training_sessions',
                    session.id,
                    session.client_id,
                    session.trainer_id,
                    `${session.session_type} session`
                ]);
            }
        }
        
        // Get existing bookings data for classes
        const bookingsResult = await client.query(`
            SELECT 
                b.id,
                b.user_id,
                b.class_id,
                b.booking_date,
                b.status,
                b.created_at,
                c.name as class_name,
                c.category as class_category
            FROM bookings b
            LEFT JOIN classes c ON b.class_id = c.id
            WHERE b.status = 'confirmed'
            AND b.booking_type = 'class'
            ORDER BY b.created_at
        `);
        
        console.log(`🏃 Found ${bookingsResult.rows.length} confirmed class bookings`);
        
        // Insert class bookings into revenue table (assuming $15 per class)
        for (const booking of bookingsResult.rows) {
            const classPrice = 15.00; // Default class price
            const taxAmount = Math.round(classPrice * 0.10 * 100) / 100;
            const netAmount = classPrice - taxAmount;
            
            await client.query(`
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
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                ON CONFLICT DO NOTHING
            `, [
                new Date(booking.booking_date).toISOString().split('T')[0],
                'group_classes',
                'one_time',
                classPrice,
                taxAmount,
                netAmount,
                'credit_card', // Default payment method
                'completed',
                'bookings',
                booking.id,
                booking.user_id,
                `${booking.class_name} class booking`
            ]);
        }
        
        // Get existing membership plans for reference
        const membershipPlansResult = await client.query(`
            SELECT id, name, price, duration_months
            FROM membership_plans
            ORDER BY price
        `);
        
        console.log(`📋 Found ${membershipPlansResult.rows.length} membership plans`);
        
        // Populate breakdown tables
        console.log('🔍 Populating revenue breakdown tables...');
        
        // Populate membership revenue breakdown
        await client.query(`
            INSERT INTO membership_revenue (revenue_id, membership_plan_id, plan_name, plan_duration_months, is_renewal)
            SELECT 
                gr.id,
                1, -- Default plan ID
                CASE 
                    WHEN gr.notes LIKE '%Premium%' THEN 'Premium'
                    WHEN gr.notes LIKE '%Basic%' THEN 'Basic'
                    WHEN gr.notes LIKE '%Elite%' THEN 'Elite'
                    ELSE 'Basic'
                END,
                1, -- Default duration
                CASE WHEN gr.notes LIKE '%renewal%' OR gr.notes LIKE '%Renewal%' THEN true ELSE false END
            FROM gym_revenue gr
            WHERE gr.revenue_source = 'membership_fees'
            AND NOT EXISTS (
                SELECT 1 FROM membership_revenue mr WHERE mr.revenue_id = gr.id
            )
        `);
        
        // Populate training revenue breakdown
        await client.query(`
            INSERT INTO training_revenue (revenue_id, training_session_id, session_type, session_duration_minutes, trainer_hourly_rate, gym_commission_rate, trainer_earnings, gym_earnings)
            SELECT 
                gr.id,
                gr.reference_id,
                'personal_training',
                60,
                gr.amount,
                0.30,
                ROUND(gr.amount * 0.70, 2),
                ROUND(gr.amount * 0.30, 2)
            FROM gym_revenue gr
            WHERE gr.revenue_source = 'personal_training'
            AND NOT EXISTS (
                SELECT 1 FROM training_revenue tr WHERE tr.revenue_id = gr.id
            )
        `);
        
        // Populate class revenue breakdown
        await client.query(`
            INSERT INTO class_revenue (revenue_id, class_id, class_name, class_category, attendees_count, price_per_person, total_capacity)
            SELECT 
                gr.id,
                gr.reference_id,
                COALESCE(c.name, 'Group Class'),
                COALESCE(c.category, 'fitness'),
                1,
                gr.amount,
                20
            FROM gym_revenue gr
            LEFT JOIN bookings b ON gr.reference_id = b.id AND gr.reference_table = 'bookings'
            LEFT JOIN classes c ON b.class_id = c.id
            WHERE gr.revenue_source = 'group_classes'
            AND NOT EXISTS (
                SELECT 1 FROM class_revenue cr WHERE cr.revenue_id = gr.id
            )
        `);
        
        // Generate summary reports manually (without triggers)
        console.log('📊 Generating revenue summary reports...');
        
        // Generate daily summary
        await client.query(`
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
                gr.revenue_date,
                COALESCE(SUM(gr.amount), 0),
                COUNT(*),
                COALESCE(SUM(CASE WHEN gr.revenue_source = 'membership_fees' THEN gr.amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN gr.revenue_source = 'personal_training' THEN gr.amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN gr.revenue_source = 'group_classes' THEN gr.amount ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN gr.revenue_source NOT IN ('membership_fees', 'personal_training', 'group_classes') THEN gr.amount ELSE 0 END), 0),
                COALESCE(SUM(gr.tax_amount), 0),
                COALESCE(SUM(gr.net_amount), 0)
            FROM gym_revenue gr
            WHERE gr.transaction_status = 'completed'
            GROUP BY gr.revenue_date
            ON CONFLICT (summary_date) DO UPDATE SET
                total_revenue = EXCLUDED.total_revenue,
                total_transactions = EXCLUDED.total_transactions,
                membership_revenue = EXCLUDED.membership_revenue,
                training_revenue = EXCLUDED.training_revenue,
                class_revenue = EXCLUDED.class_revenue,
                other_revenue = EXCLUDED.other_revenue,
                total_tax = EXCLUDED.total_tax,
                net_revenue = EXCLUDED.net_revenue,
                updated_at = CURRENT_TIMESTAMP
        `);
        
        // Generate monthly summary
        await client.query(`
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
                DATE_TRUNC('month', gr.revenue_date) as month_year,
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
            LEFT JOIN daily_revenue_summary drs ON drs.summary_date >= DATE_TRUNC('month', gr.revenue_date) 
                AND drs.summary_date < DATE_TRUNC('month', gr.revenue_date) + INTERVAL '1 month'
            WHERE gr.transaction_status = 'completed'
            GROUP BY DATE_TRUNC('month', gr.revenue_date)
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
                updated_at = CURRENT_TIMESTAMP
        `);
        
        // Display summary statistics
        const dailySummary = await client.query(`
            SELECT 
                summary_date,
                total_revenue,
                total_transactions,
                membership_revenue,
                training_revenue,
                class_revenue,
                other_revenue
            FROM daily_revenue_summary
            ORDER BY summary_date DESC
            LIMIT 7
        `);
        
        const monthlySummary = await client.query(`
            SELECT 
                month_year,
                total_revenue,
                total_transactions,
                membership_revenue,
                training_revenue,
                class_revenue,
                other_revenue
            FROM monthly_revenue_summary
            ORDER BY month_year DESC
            LIMIT 3
        `);
        
        console.log('\n📈 Revenue Summary Report:');
        console.log('========================');
        
        console.log('\n📅 Last 7 Days:');
        dailySummary.rows.forEach(row => {
            console.log(`${row.summary_date}: $${row.total_revenue} (${row.total_transactions} transactions)`);
            console.log(`  - Memberships: $${row.membership_revenue}`);
            console.log(`  - Training: $${row.training_revenue}`);
            console.log(`  - Classes: $${row.class_revenue}`);
            console.log(`  - Other: $${row.other_revenue}`);
        });
        
        console.log('\n📊 Last 3 Months:');
        monthlySummary.rows.forEach(row => {
            console.log(`${row.month_year.toISOString().slice(0, 7)}: $${row.total_revenue} (${row.total_transactions} transactions)`);
            console.log(`  - Memberships: $${row.membership_revenue}`);
            console.log(`  - Training: $${row.training_revenue}`);
            console.log(`  - Classes: $${row.class_revenue}`);
            console.log(`  - Other: $${row.other_revenue}`);
        });
        
        console.log('\n✅ Gym Revenue System initialized successfully!');
        console.log('\n🎯 Features available:');
        console.log('  - Comprehensive revenue tracking from all sources');
        console.log('  - Automatic daily and monthly summaries');
        console.log('  - Detailed breakdown by revenue type');
        console.log('  - Tax calculation and net revenue tracking');
        console.log('  - Performance-optimized with proper indexing');
        
    } catch (error) {
        console.error('❌ Error initializing revenue system:', error);
        throw error;
    } finally {
        if (client) {
            client.release();
        }
    }
}

// Run the initialization if this file is executed directly
console.log('🔍 Checking execution condition...');
console.log('import.meta.url:', import.meta.url);
console.log('process.argv[1]:', process.argv[1]);

if (process.argv[1] && process.argv[1].endsWith('init-revenue-system.js')) {
    console.log('✅ Running as main script, starting initialization...');
    initRevenueSystem()
        .then(() => {
            console.log('🎉 Revenue system setup complete!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Revenue system setup failed:', error);
            process.exit(1);
        });
} else {
    console.log('ℹ️ Running as module, not executing initialization');
}

export { initRevenueSystem };
