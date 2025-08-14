import { query } from './src/database.js';

async function checkAdminStatus() {
  try {
    console.log('Checking admin user status...');
    
    // Check all users with admin role
    const result = await query(`
      SELECT id, email, first_name, last_name, role, is_active 
      FROM users 
      WHERE role = 'admin'
      ORDER BY id
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No admin users found in database');
      return;
    }
    
    console.log('\nAdmin users found:');
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Name: ${user.first_name} ${user.last_name}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Active: ${user.is_active ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
    // Check if any admin users are inactive
    const inactiveAdmins = result.rows.filter(user => !user.is_active);
    if (inactiveAdmins.length > 0) {
      console.log('⚠️  WARNING: Found inactive admin users:');
      inactiveAdmins.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email})`);
      });
      console.log('\nThis will cause login issues!');
    } else {
      console.log('✅ All admin users are active');
    }
    
  } catch (error) {
    console.error('Error checking admin status:', error);
  } finally {
    process.exit(0);
  }
}

checkAdminStatus();
