import { query } from './src/database.js';

async function fixMembershipPlans() {
  try {
    console.log('=== Fixing Membership Plans ===');
    
    const userId = 10; // Muhammad Mehlab
    
    // Update all membership plans to active status
    await query('UPDATE membership_plans SET status = $1', ['active']);
    
    console.log('✅ All membership plans set to active');
    
    // Check available membership plans
    const plansResult = await query('SELECT * FROM membership_plans ORDER BY id');
    
    console.log('\nAvailable membership plans:');
    plansResult.rows.forEach(plan => {
      console.log(`- ID: ${plan.id}, Name: ${plan.name}, Status: ${plan.status}`);
    });
    
    // Use the Monthly plan (ID 14) for the user
    const monthlyPlanId = 14;
    
    console.log(`\nAssigning plan ID ${monthlyPlanId} (Monthly) to user ${userId}`);
    
    // Update user's membership plan
    await query(
      'UPDATE member_profiles SET current_plan_id = $1 WHERE user_id = $2',
      [monthlyPlanId, userId]
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
    
    // Test if user can now check in
    const userResult = await query(
      'SELECT u.*, mp.current_plan_id, mp.subscription_status FROM users u JOIN member_profiles mp ON u.id = mp.user_id WHERE u.id = $1',
      [userId]
    );
    
    const user = userResult.rows[0];
    const canCheckIn = user.is_active && user.subscription_status === 'active';
    
    console.log('\n=== User Check-in Status ===');
    console.log('User active:', user.is_active);
    console.log('Subscription status:', user.subscription_status);
    console.log('Current plan ID:', user.current_plan_id);
    console.log('Can check in:', canCheckIn);
    
  } catch (error) {
    console.error('Error fixing membership plans:', error.message);
  } finally {
    process.exit(0);
  }
}

fixMembershipPlans();
