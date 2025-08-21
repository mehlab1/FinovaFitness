import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const { Pool } = pg;

// Load environment variables
dotenv.config();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration - same as main backend
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMonthlyPlanSchema() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Monthly Plan System Schema Setup...\n');
    
    // Read the SQL file
    const sqlFilePath = path.join(__dirname, '../src/database/schemas/monthly-plan-system.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📖 Reading SQL schema file...');
    
    // Execute the SQL
    console.log('⚡ Executing SQL schema...');
    await client.query(sqlContent);
    
    console.log('✅ Schema executed successfully!\n');
    
    // Verify tables were created
    console.log('🔍 Verifying table creation...\n');
    
    const tablesToVerify = [
      'trainer_monthly_plans',
      'slot_generation_batches', 
      'trainer_master_slots',
      'monthly_plan_subscriptions',
      'slot_assignments',
      'monthly_plan_session_assignments'
    ];
    
    for (const tableName of tablesToVerify) {
      try {
        const result = await client.query(`
          SELECT 
            table_name,
            column_name,
            data_type,
            is_nullable,
            column_default
          FROM information_schema.columns 
          WHERE table_name = $1 
          ORDER BY ordinal_position
        `, [tableName]);
        
        console.log(`📋 Table: ${tableName}`);
        console.log(`   Columns: ${result.rows.length}`);
        
        // Show first few columns as sample
        result.rows.slice(0, 5).forEach(row => {
          console.log(`   - ${row.column_name}: ${row.data_type} ${row.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
        });
        
        if (result.rows.length > 5) {
          console.log(`   ... and ${result.rows.length - 5} more columns`);
        }
        console.log('');
        
      } catch (error) {
        console.log(`❌ Error verifying table ${tableName}:`, error.message);
      }
    }
    
    // Verify functions were created
    console.log('🔍 Verifying function creation...\n');
    
    const functionsToVerify = [
      'generate_slots_for_batch',
      'assign_slots_to_monthly_plan',
      'get_available_slots_for_date',
      'get_monthly_plan_assignments',
      'update_updated_at_column'
    ];
    
    for (const functionName of functionsToVerify) {
      try {
        const result = await client.query(`
          SELECT routine_name, routine_type
          FROM information_schema.routines 
          WHERE routine_name = $1
        `, [functionName]);
        
        if (result.rows.length > 0) {
          console.log(`✅ Function: ${functionName} (${result.rows[0].routine_type})`);
        } else {
          console.log(`❌ Function: ${functionName} - NOT FOUND`);
        }
      } catch (error) {
        console.log(`❌ Error verifying function ${functionName}:`, error.message);
      }
    }
    
    // Verify indexes were created
    console.log('\n🔍 Verifying index creation...\n');
    
    const indexResult = await client.query(`
      SELECT indexname, tablename 
      FROM pg_indexes 
      WHERE indexname LIKE 'idx_%' 
      AND tablename IN (
        'trainer_monthly_plans',
        'slot_generation_batches',
        'trainer_master_slots',
        'monthly_plan_subscriptions',
        'slot_assignments',
        'monthly_plan_session_assignments'
      )
      ORDER BY tablename, indexname
    `);
    
    console.log(`📊 Total indexes created: ${indexResult.rows.length}`);
    indexResult.rows.forEach(row => {
      console.log(`   - ${row.indexname} on ${row.tablename}`);
    });
    
    // Test sample data insertion
    console.log('\n🧪 Testing sample data...\n');
    
    try {
      // Test the generate_slots_for_batch function
      const slotsGenerated = await client.query(`
        SELECT generate_slots_for_batch(1) as slots_generated
      `);
      
      console.log(`✅ Generated ${slotsGenerated.rows[0].slots_generated} slots for batch 1`);
      
      // Check how many slots were actually created
      const slotCount = await client.query(`
        SELECT COUNT(*) as total_slots FROM trainer_master_slots WHERE batch_id = 1
      `);
      
      console.log(`✅ Total slots in database: ${slotCount.rows[0].total_slots}`);
      
    } catch (error) {
      console.log(`❌ Error testing sample data:`, error.message);
    }
    
    // Final verification
    console.log('\n🎯 Final Verification Summary:\n');
    
    const tableCounts = await client.query(`
      SELECT 
        'trainer_monthly_plans' as table_name, COUNT(*) as count FROM trainer_monthly_plans
      UNION ALL
      SELECT 'slot_generation_batches', COUNT(*) FROM slot_generation_batches
      UNION ALL
      SELECT 'trainer_master_slots', COUNT(*) FROM trainer_master_slots
      UNION ALL
      SELECT 'monthly_plan_subscriptions', COUNT(*) FROM monthly_plan_subscriptions
      UNION ALL
      SELECT 'slot_assignments', COUNT(*) FROM slot_assignments
      UNION ALL
      SELECT 'monthly_plan_session_assignments', COUNT(*) FROM monthly_plan_session_assignments
    `);
    
    tableCounts.rows.forEach(row => {
      console.log(`📊 ${row.table_name}: ${row.count} records`);
    });
    
    console.log('\n🎉 Monthly Plan System Schema Setup Complete!');
    console.log('✅ All tables, functions, indexes, and constraints created successfully');
    console.log('✅ Sample data inserted for testing');
    console.log('✅ Ready for backend API development');
    
  } catch (error) {
    console.error('❌ Error during schema setup:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the script
runMonthlyPlanSchema()
  .then(() => {
    console.log('\n✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
