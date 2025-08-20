import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

// Database configuration
console.log('Creating database pool with connection string:', process.env.DATABASE_URL?.substring(0, 50) + '...');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // Neon requires SSL
});

async function runFacilitiesSchema() {
  try {
    console.log('🚀 Starting Facilities System Schema Migration...');
    
    // Read the schema file
    const schemaPath = path.join(__dirname, '../database/schemas/facilities-system.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📖 Schema file loaded successfully');
    
    // Drop existing tables if they exist (in reverse dependency order)
    console.log('🗑️ Dropping existing tables...');
    await pool.query(`
      DROP TABLE IF EXISTS facility_waitlist CASCADE;
      DROP TABLE IF EXISTS facility_analytics CASCADE;
      DROP TABLE IF EXISTS cancellation_policies CASCADE;
      DROP TABLE IF EXISTS facility_bookings CASCADE;
      DROP TABLE IF EXISTS facility_availability_exceptions CASCADE;
      DROP TABLE IF EXISTS facility_slots CASCADE;
      DROP TABLE IF EXISTS facility_pricing CASCADE;
      DROP TABLE IF EXISTS facility_schedules CASCADE;
      DROP TABLE IF EXISTS facilities CASCADE;
    `);
    
    // Execute the schema
    await pool.query(schemaSQL);
    
    console.log('✅ Facilities System Schema created successfully!');
    
    // Insert some sample facilities
    const sampleFacilities = [
      {
        name: 'Gym Floor',
        description: 'Main gym area with cardio and strength training equipment',
        category: 'Fitness',
        default_duration_minutes: 60,
        max_capacity: 20,
        location: 'Ground Floor'
      },
      {
        name: 'Swimming Pool',
        description: 'Olympic-size swimming pool with temperature control',
        category: 'Aquatics',
        default_duration_minutes: 60,
        max_capacity: 15,
        location: 'Level -1'
      },
      {
        name: 'Sauna & Steam Room',
        description: 'Relaxation area with sauna and steam facilities',
        category: 'Wellness',
        default_duration_minutes: 45,
        max_capacity: 8,
        location: 'Level -1'
      },
      {
        name: 'Boxing Ring',
        description: 'Professional boxing ring with punching bags',
        category: 'Combat Sports',
        default_duration_minutes: 60,
        max_capacity: 4,
        location: 'Level 1'
      },
      {
        name: 'Yoga Studio',
        description: 'Peaceful studio for yoga and meditation classes',
        category: 'Mind & Body',
        default_duration_minutes: 60,
        max_capacity: 25,
        location: 'Level 2'
      },
      {
        name: 'Cardio Zone',
        description: 'Dedicated area for cardiovascular exercises',
        category: 'Fitness',
        default_duration_minutes: 60,
        max_capacity: 12,
        location: 'Ground Floor'
      }
    ];

    console.log('📝 Inserting sample facilities...');
    
    for (const facility of sampleFacilities) {
      const result = await pool.query(
        `INSERT INTO facilities (name, description, category, default_duration_minutes, max_capacity, location) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (name) DO NOTHING 
         RETURNING id`,
        [facility.name, facility.description, facility.category, facility.default_duration_minutes, facility.max_capacity, facility.location]
      );
      
      if (result.rows.length > 0) {
        const facilityId = result.rows[0].id;
        
        // Insert default pricing for the facility
        await pool.query(
          `INSERT INTO facility_pricing (facility_id, base_price, peak_hours_start, peak_hours_end, peak_price_multiplier, member_discount_percentage) 
           VALUES ($1, $2, $3, $4, $5, $6) 
           ON CONFLICT (facility_id) DO NOTHING`,
          [facilityId, 1000.00, '17:00:00', '21:00:00', 1.25, 15.00]
        );
        
        // Insert default cancellation policy
        await pool.query(
          `INSERT INTO cancellation_policies (facility_id, cancellation_hours, refund_percentage) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (facility_id) DO NOTHING`,
          [facilityId, 24, 100.00]
        );
        
        console.log(`✅ Added facility: ${facility.name} (ID: ${facilityId})`);
      } else {
        console.log(`ℹ️  Facility already exists: ${facility.name}`);
      }
    }
    
    console.log('🎉 Facilities System setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error running facilities schema:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Load environment variables
dotenv.config();

// Debug environment variables
console.log('Environment variables:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
console.log('NODE_ENV:', process.env.NODE_ENV);

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Run the migration
runFacilitiesSchema().catch(console.error);
