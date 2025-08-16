import { query } from '../src/config/database.js';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
  try {
    console.log('🚀 Starting comprehensive diet plan migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'src/database/migrations/add-comprehensive-diet-plan-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📖 Migration SQL loaded successfully');
    
    // Execute the migration
    console.log('🔧 Executing migration...');
    await query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 New fields added to diet_plan_requests table:');
    console.log('   - diet_plan_completed (BOOLEAN)');
    console.log('   - comprehensive_plan_data (JSONB)');
    console.log('   - plan_created_at (TIMESTAMP)');
    console.log('   - plan_updated_at (TIMESTAMP)');
    console.log('   - Indexes created for optimal performance');
    
    // Verify the migration
    console.log('🔍 Verifying migration...');
    const verifyResult = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'diet_plan_requests' 
      AND column_name IN ('diet_plan_completed', 'comprehensive_plan_data', 'plan_created_at', 'plan_updated_at')
      ORDER BY column_name
    `);
    
    if (verifyResult.rows.length === 4) {
      console.log('✅ Migration verification successful!');
      verifyResult.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type} (${row.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
      });
    } else {
      console.log('⚠️  Migration verification incomplete. Expected 4 columns, found:', verifyResult.rows.length);
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
runMigration();
