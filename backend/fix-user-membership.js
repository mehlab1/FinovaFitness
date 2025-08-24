import { query } from './src/database.js';

async function fixUserMembership() {
  try {
    console.log('=== Fixing User Membership ===');
    
    const userId = 10; // Muhammad Mehlab
    
    // Check available membership plans
    const plansResult = await query('SELECT * FROM membership_plans ORDER BY id');
    
    console.log('Available membership plans:');
    plansResult.rows.forEach(plan => {
      console.log(`- ID: ${plan.id}, Name: ${plan.name}, Status: ${plan.status}`);
    });
    
    // Get the first active plan
    const activePlan = plansResult.rows.find(plan => plan.status === 'active');
    
    if (activePlan) {
      console.log(`\nUsing plan ID ${activePlan.id} (${activePlan.name})`);
      
      // Update user's membership plan
      await query(
        'UPDATE member_profiles SET current_plan_id = $1 WHERE user_id = $2',
        [activePlan.id, userId]
      );
      
      console.log('✅ User membership plan updated successfully!');
      
      // Verify the update
      const updatedProfile = await query(
        'SELECT * FROM member_profiles WHERE user_id = $1',
        [userId]
      );
      
      console.log('Updated member profile:', {
        current_plan_id: updatedProfile.rows[0].current_plan_id,
        subscription_status: updatedProfile.rows[0].subscription_status
      });
      
    } else {
      console.log('❌ No active membership plans found');
    }
    
  } catch (error) {
    console.error('Error fixing user membership:', error.message);
  } finally {
    process.exit(0);
  }
}

fixUserMembership();
