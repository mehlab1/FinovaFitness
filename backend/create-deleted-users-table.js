import { query } from './src/database.js';

async function createDeletedUsersTable() {
  try {
    console.log('Creating deleted_users table...');
    
    // Create deleted_users table
    await query(`
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
        deleted_by_admin_id INTEGER NOT NULL
      )
    `);
    
    console.log('✓ deleted_users table created successfully');
    
    // Add indexes
    console.log('Creating indexes...');
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_deleted_users_original_id 
      ON deleted_users(original_id)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_deleted_users_deleted_at 
      ON deleted_users(deleted_at)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_deleted_users_role 
      ON deleted_users(role)
    `);
    
    console.log('✓ Indexes created successfully');
    
    // Add comment
    await query(`
      COMMENT ON TABLE deleted_users IS 'Log of permanently deleted users for audit purposes'
    `);
    
    console.log('✓ Table comment added');
    
    // Verify table exists
    const result = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'deleted_users'
    `);
    
    if (result.rows.length > 0) {
      console.log('\n🎉 deleted_users table created and ready to use!');
      console.log('You can now use the delete functionality in the admin portal.');
    } else {
      console.log('\n❌ Table creation failed');
    }
    
  } catch (error) {
    console.error('Error creating deleted_users table:', error);
  } finally {
    process.exit(0);
  }
}

createDeletedUsersTable();
