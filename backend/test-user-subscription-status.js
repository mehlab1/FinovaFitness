import { query } from './src/database.js';

async function testUserSubscriptionStatus() {
  try {
    console.log('🔍 Checking user subscription status...\n');
    
    // Check all users and their subscription status
    const usersQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        mp.subscription_status,
        mp.loyalty_points,
        mp.membership_start_date,
        mp.membership_end_date
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      ORDER BY u.role, u.first_name
    `;
    
    const result = await query(usersQuery);
    
    console.log(`📊 Found ${result.rows.length} users:`);
    console.log('');
    
    // Group by role
    const usersByRole = {};
    result.rows.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    Object.keys(usersByRole).forEach(role => {
      const users = usersByRole[role];
      console.log(`👥 ${role.toUpperCase()} USERS (${users.length}):`);
      
      users.forEach((user, index) => {
        const status = user.subscription_status || 'NO PROFILE';
        const statusColor = status === 'active' ? '\x1b[32m' : '\x1b[31m';
        const resetColor = '\x1b[0m';
        
        console.log(`  ${index + 1}. ${statusColor}${status}${resetColor} - ${user.first_name} ${user.last_name} (${user.email})`);
        if (user.membership_start_date || user.membership_end_date) {
          console.log(`      Membership: ${user.membership_start_date} to ${user.membership_end_date}`);
        }
      });
      console.log('');
    });
    
    // Check specifically for active subscriptions
    const activeUsersQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        mp.subscription_status
      FROM users u
      INNER JOIN member_profiles mp ON u.id = mp.user_id
      WHERE mp.subscription_status = 'active'
    `;
    
    const activeResult = await query(activeUsersQuery);
    
    console.log(`✅ ACTIVE SUBSCRIPTIONS (${activeResult.rows.length}):`);
    activeResult.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.first_name} ${user.last_name} (${user.email})`);
    });
    
    // Test search with 'test' term
    console.log('\n🔍 Testing search with "test" term:');
    const testSearchQuery = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        mp.subscription_status
      FROM users u
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      WHERE 
        LOWER(u.first_name) LIKE LOWER('%test%') OR
        LOWER(u.last_name) LIKE LOWER('%test%') OR
        LOWER(u.email) LIKE LOWER('%test%')
    `;
    
    const testSearchResult = await query(testSearchQuery);
    
    console.log(`Found ${testSearchResult.rows.length} users with "test" in name/email:`);
    testSearchResult.rows.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.first_name} ${user.last_name} (${user.email}) - Status: ${user.subscription_status || 'NO PROFILE'}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

testUserSubscriptionStatus();
