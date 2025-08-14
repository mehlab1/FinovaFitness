import { query, getClient } from '../database.js';
import fs from 'fs';
import path from 'path';

const runSubscriptionStatusMigration = async () => {
  try {
    console.log('🚀 Starting subscription status migration...');
    
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      // Read the migration SQL file
      const migrationPath = path.join(process.cwd(), 'src', 'database', 'migrations', 'add-subscription-status.sql');
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log('📋 Running migration SQL...');
      
      // Execute statements in the correct order
      const statements = [
        // First add the columns
        `ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'expired'))`,
        `ALTER TABLE member_profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'paused', 'cancelled', 'expired'))`,
        
        // Then update existing records
        `UPDATE users SET subscription_status = 'active' WHERE subscription_status IS NULL`,
        `UPDATE member_profiles SET subscription_status = 'active' WHERE subscription_status IS NULL`,
        
        // Finally create indexes
        `CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status)`,
        `CREATE INDEX IF NOT EXISTS idx_member_profiles_subscription_status ON member_profiles(subscription_status)`
      ];
      
      for (const statement of statements) {
        if (statement.trim()) {
          console.log(`Executing: ${statement.substring(0, 50)}...`);
          await client.query(statement);
        }
      }
      
      await client.query('COMMIT');
      console.log('✅ Subscription status migration completed successfully!');
      
      // Verify the migration
      console.log('🔍 Verifying migration...');
      
      // Check if subscription_status column exists in users table
      const usersCheck = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'subscription_status'
      `);
      
      if (usersCheck.rows.length > 0) {
        console.log('✅ subscription_status column added to users table');
        console.log(`   - Data type: ${usersCheck.rows[0].data_type}`);
        console.log(`   - Nullable: ${usersCheck.rows[0].is_nullable}`);
        console.log(`   - Default: ${usersCheck.rows[0].column_default}`);
      } else {
        console.log('❌ subscription_status column not found in users table');
      }
      
      // Check if subscription_status column exists in member_profiles table
      const profilesCheck = await client.query(`
        SELECT column_name, data_type, is_nullable, column_default 
        FROM information_schema.columns 
        WHERE table_name = 'member_profiles' AND column_name = 'subscription_status'
      `);
      
      if (profilesCheck.rows.length > 0) {
        console.log('✅ subscription_status column added to member_profiles table');
        console.log(`   - Data type: ${profilesCheck.rows[0].data_type}`);
        console.log(`   - Nullable: ${profilesCheck.rows[0].is_nullable}`);
        console.log(`   - Default: ${profilesCheck.rows[0].column_default}`);
      } else {
        console.log('❌ subscription_status column not found in member_profiles table');
      }
      
      // Check current subscription statuses
      const statusCounts = await client.query(`
        SELECT subscription_status, COUNT(*) as count 
        FROM users 
        WHERE subscription_status IS NOT NULL 
        GROUP BY subscription_status
      `);
      
      console.log('📊 Current subscription status distribution:');
      statusCounts.rows.forEach(row => {
        console.log(`   - ${row.subscription_status}: ${row.count} users`);
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run the migration
runSubscriptionStatusMigration();
