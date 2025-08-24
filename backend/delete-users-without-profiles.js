import { query } from './src/database.js';

async function deleteUsersWithoutProfiles() {
  try {
    console.log('🔍 Deleting users without member profiles...\\n');
    
    // First, let's see which users don't have profiles
    console.log('1. Finding users without member profiles...');
    const usersWithoutProfilesQuery = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.role
      FROM users u 
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      WHERE u.role = 'member' AND mp.user_id IS NULL
      ORDER BY u.first_name
    `;
    
    const usersWithoutProfiles = await query(usersWithoutProfilesQuery);
    console.log(`📊 Found ${usersWithoutProfiles.rows.length} users without member profiles:`);
    console.table(usersWithoutProfiles.rows);
    
    if (usersWithoutProfiles.rows.length === 0) {
      console.log('✅ No users without profiles found!');
      return;
    }
    
    // Delete these users
    console.log('\\n2. Deleting users without member profiles...');
    const userIds = usersWithoutProfiles.rows.map(user => user.id);
    
    // Delete in batches to avoid issues
    for (const userId of userIds) {
      try {
        await query('DELETE FROM users WHERE id = $1', [userId]);
        console.log(`✅ Deleted user ${userId}`);
      } catch (error) {
        console.error(`❌ Failed to delete user ${userId}:`, error.message);
      }
    }
    
    // Verify deletion
    console.log('\\n3. Verifying deletion...');
    const remainingUsersWithoutProfiles = await query(usersWithoutProfilesQuery);
    console.log(`📊 Remaining users without profiles: ${remainingUsersWithoutProfiles.rows.length}`);
    
    if (remainingUsersWithoutProfiles.rows.length === 0) {
      console.log('✅ All users without profiles have been deleted!');
    } else {
      console.log('❌ Some users without profiles still remain:');
      console.table(remainingUsersWithoutProfiles.rows);
    }
    
    // Show remaining member users
    console.log('\\n4. Remaining member users:');
    const remainingMembersQuery = `
      SELECT 
        u.id, u.first_name, u.last_name, u.email, u.role,
        mp.subscription_status, mp.loyalty_points
      FROM users u 
      LEFT JOIN member_profiles mp ON u.id = mp.user_id
      WHERE u.role = 'member'
      ORDER BY u.first_name
    `;
    
    const remainingMembers = await query(remainingMembersQuery);
    console.log(`📊 Total remaining member users: ${remainingMembers.rows.length}`);
    console.table(remainingMembers.rows);
    
  } catch (error) {
    console.error('❌ Error deleting users without profiles:', error.message);
    console.error('Error details:', error);
  }
}

deleteUsersWithoutProfiles();
