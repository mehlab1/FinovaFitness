import { query } from './src/database.js';

async function checkAllUsersStatus() {
  try {
    console.log('🔍 Checking active status for all users...\n');
    
    // Get all users with their status
    const result = await query(`
      SELECT id, email, first_name, last_name, role, is_active, created_at
      FROM users 
      ORDER BY role, first_name, last_name
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No users found in database');
      return;
    }
    
    // Group users by role
    const usersByRole = {};
    result.rows.forEach(user => {
      if (!usersByRole[user.role]) {
        usersByRole[user.role] = [];
      }
      usersByRole[user.role].push(user);
    });
    
    // Display users by role
    Object.keys(usersByRole).forEach(role => {
      const users = usersByRole[role];
      const activeUsers = users.filter(u => u.is_active);
      const inactiveUsers = users.filter(u => !u.is_active);
      
      console.log(`📊 ${role.toUpperCase()} USERS (${users.length} total)`);
      console.log(`   ✅ Active: ${activeUsers.length} | ❌ Inactive: ${inactiveUsers.length}\n`);
      
      users.forEach((user, index) => {
        const status = user.is_active ? '✅ ACTIVE' : '❌ INACTIVE';
        const statusColor = user.is_active ? '\x1b[32m' : '\x1b[31m';
        const resetColor = '\x1b[0m';
        
        console.log(`   ${index + 1}. ${statusColor}${status}${resetColor} - ID: ${user.id}`);
        console.log(`      Name: ${user.first_name} ${user.last_name}`);
        console.log(`      Email: ${user.email}`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log('');
      });
      
      console.log('─'.repeat(60));
      console.log('');
    });
    
    // Summary statistics
    const totalUsers = result.rows.length;
    const totalActive = result.rows.filter(u => u.is_active).length;
    const totalInactive = result.rows.filter(u => !u.is_active).length;
    
    console.log('📈 SUMMARY STATISTICS');
    console.log('─'.repeat(30));
    console.log(`Total Users: ${totalUsers}`);
    console.log(`Active Users: ${totalActive} (${((totalActive/totalUsers)*100).toFixed(1)}%)`);
    console.log(`Inactive Users: ${totalInactive} (${((totalInactive/totalUsers)*100).toFixed(1)}%)`);
    console.log('');
    
    // Check for potential issues
    const inactiveAdmins = result.rows.filter(u => u.role === 'admin' && !u.is_active);
    if (inactiveAdmins.length > 0) {
      console.log('⚠️  WARNING: Found inactive admin users!');
      console.log('   This will cause login issues for admin accounts.');
      inactiveAdmins.forEach(admin => {
        console.log(`   - ${admin.first_name} ${admin.last_name} (${admin.email})`);
      });
      console.log('');
    }
    
    const usersWithoutActiveStatus = result.rows.filter(u => u.is_active === null);
    if (usersWithoutActiveStatus.length > 0) {
      console.log('⚠️  WARNING: Found users without active status!');
      console.log('   These users may have database issues.');
      usersWithoutActiveStatus.forEach(user => {
        console.log(`   - ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`);
      });
      console.log('');
    }
    
    console.log('✅ User status check completed!');
    
  } catch (error) {
    console.error('❌ Error checking user status:', error);
  } finally {
    process.exit(0);
  }
}

checkAllUsersStatus();
