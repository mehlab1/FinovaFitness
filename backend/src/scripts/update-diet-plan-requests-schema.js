import { query } from '../config/database.js';

const runMigration = async () => {
  try {
    console.log('Starting diet plan requests schema update...');
    
    // Check if the table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'diet_plan_requests'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('❌ Table diet_plan_requests does not exist. Please run the initial migration first.');
      return;
    }
    
    console.log('✅ Table diet_plan_requests exists');
    
    // Check if height column exists
    const heightExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'diet_plan_requests' 
        AND column_name = 'height'
      );
    `);
    
    if (!heightExists.rows[0].exists) {
      console.log('Adding height column...');
      await query(`
        ALTER TABLE diet_plan_requests 
        ADD COLUMN height DECIMAL(5,2) NOT NULL DEFAULT 0
      `);
      console.log('✅ Height column added');
    } else {
      console.log('✅ Height column already exists');
    }
    
    // Check if activity_level column exists
    const activityLevelExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'diet_plan_requests' 
        AND column_name = 'activity_level'
      );
    `);
    
    if (!activityLevelExists.rows[0].exists) {
      console.log('Adding activity_level column...');
      await query(`
        ALTER TABLE diet_plan_requests 
        ADD COLUMN activity_level VARCHAR(50) NOT NULL DEFAULT 'moderately_active'
      `);
      console.log('✅ Activity level column added');
    } else {
      console.log('✅ Activity level column already exists');
    }
    
    // Check if preparation_time column exists
    const preparationTimeExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'diet_plan_requests' 
        AND column_name = 'preparation_time'
      );
    `);
    
    if (!preparationTimeExists.rows[0].exists) {
      console.log('Adding preparation_time column...');
      await query(`
        ALTER TABLE diet_plan_requests 
        ADD COLUMN preparation_time VARCHAR(100)
      `);
      console.log('✅ Preparation time column added');
    } else {
      console.log('✅ Preparation time column already exists');
    }
    
    // Remove default values for required fields
    console.log('Removing default values for required fields...');
    try {
      await query(`
        ALTER TABLE diet_plan_requests 
        ALTER COLUMN height DROP DEFAULT
      `);
      await query(`
        ALTER TABLE diet_plan_requests 
        ALTER COLUMN activity_level DROP DEFAULT
      `);
      console.log('✅ Default values removed');
    } catch (error) {
      console.log('ℹ️ Default values already removed or not set');
    }
    
    console.log('✅ Schema update completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    process.exit(0);
  }
};

runMigration();
