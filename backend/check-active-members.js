import { query } from './src/database.js';

async function checkActiveMembers() {
  try {
    console.log('🔍 Checking active member profiles...\n');
    
    const result = await query(`
      SELECT user_id, subscription_status, loyalty_points 
      FROM member_profiles 
      WHERE subscription_status = 'active'
      ORDER BY user_id
    `);
    
    console.log(`📊 Found ${result.rows.length} active member profiles:\n`);
    
    result.rows.forEach((row, index) => {
      console.log(`${index + 1}. User ID: ${row.user_id}`);
      console.log(`   Status: ${row.subscription_status}`);
      console.log(`   Loyalty Points: ${row.loyalty_points}`);
      console.log('');
    });
    
    if (result.rows.length > 0) {
      console.log('✅ Active members found for testing');
    } else {
      console.log('❌ No active members found');
    }
    
  } catch (error) {
    console.error('❌ Error checking active members:', error.message);
  }
}

checkActiveMembers();
