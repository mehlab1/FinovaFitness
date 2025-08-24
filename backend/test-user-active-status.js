import { query } from './src/database.js';

async function testUserActiveStatus() {
  try {
    console.log('🔍 Checking user active status...\\n');
    
    // Check users table structure
    console.log('1. Checking users table structure...');
    const usersQuery = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.role, u.is_active,
        mp.subscription_status, mp.loyalty_points
      FROM users u 
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      WHERE u.role = 'member'
      ORDER BY u.first_name
    `;
    
    const result = await query(usersQuery);
    console.log(`📊 Found ${result.rows.length} member users:`);
    console.table(result.rows);
    
    // Check which users would be considered "active" by admin portal logic
    console.log('\\n2. Checking admin portal "Active" logic...');
    const activeUsers = result.rows.filter(user => 
      user.is_active && user.subscription_status !== 'paused'
    );
    
    console.log(`✅ Users considered "Active" by admin portal logic (${activeUsers.length}):`);
    activeUsers.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`    is_active: ${user.is_active}, subscription_status: ${user.subscription_status || 'NO PROFILE'}`);
    });
    
    // Check which users would be considered "active" by our current check-in logic
    console.log('\\n3. Checking current check-in logic...');
    const checkinActiveUsers = result.rows.filter(user => 
      user.subscription_status === 'active'
    );
    
    console.log(`✅ Users considered "active" by current check-in logic (${checkinActiveUsers.length}):`);
    checkinActiveUsers.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
      console.log(`    is_active: ${user.is_active}, subscription_status: ${user.subscription_status}`);
    });
    
    // Find differences
    console.log('\\n4. Finding differences...');
    const adminActiveIds = new Set(activeUsers.map(u => u.id));
    const checkinActiveIds = new Set(checkinActiveUsers.map(u => u.id));
    
    const onlyInAdmin = activeUsers.filter(u => !checkinActiveIds.has(u.id));
    const onlyInCheckin = checkinActiveUsers.filter(u => !adminActiveIds.has(u.id));
    
    if (onlyInAdmin.length > 0) {
      console.log('❌ Users active in admin but not in check-in:');
      onlyInAdmin.forEach(user => {
        console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
        console.log(`    is_active: ${user.is_active}, subscription_status: ${user.subscription_status || 'NO PROFILE'}`);
      });
    }
    
    if (onlyInCheckin.length > 0) {
      console.log('❌ Users active in check-in but not in admin:');
      onlyInCheckin.forEach(user => {
        console.log(`  - ${user.first_name} ${user.last_name} (${user.email})`);
        console.log(`    is_active: ${user.is_active}, subscription_status: ${user.subscription_status}`);
      });
    }
    
    if (onlyInAdmin.length === 0 && onlyInCheckin.length === 0) {
      console.log('✅ Both logics match!');
    }
    
  } catch (error) {
    console.error('Error checking user active status:', error);
  }
}

testUserActiveStatus();
