import { query } from './database.js';

const checkMehlabData = async () => {
  try {
    console.log('🔍 Checking mehlab user data...');

    // Get user info
    const userResult = await query('SELECT id, email, first_name, last_name, role FROM users WHERE email = $1', ['mehlab@finovafitness.com']);
    
    if (userResult.rows.length === 0) {
      console.log('❌ User mehlab@finovafitness.com not found');
      return;
    }

    const user = userResult.rows[0];
    console.log(`✅ User found: ${user.first_name} ${user.last_name} (${user.role})`);

    // Check member profile
    const profileResult = await query('SELECT * FROM member_profiles WHERE user_id = $1', [user.id]);
    if (profileResult.rows.length > 0) {
      const profile = profileResult.rows[0];
      console.log(`✅ Member profile found:`);
      console.log(`   - Loyalty points: ${profile.loyalty_points}`);
      console.log(`   - Streak days: ${profile.streak_days}`);
      console.log(`   - Last gym visit: ${profile.last_gym_visit}`);
      console.log(`   - Weight: ${profile.weight} kg`);
      console.log(`   - Height: ${profile.height} cm`);
      console.log(`   - Fitness goals: ${profile.fitness_goals}`);
    } else {
      console.log('❌ Member profile not found');
    }

    // Check loyalty transactions
    const loyaltyResult = await query('SELECT COUNT(*) as count FROM loyalty_transactions WHERE user_id = $1', [user.id]);
    console.log(`✅ Loyalty transactions: ${loyaltyResult.rows[0].count}`);

    // Check gym visits
    const visitsResult = await query('SELECT COUNT(*) as count FROM gym_visits WHERE user_id = $1', [user.id]);
    console.log(`✅ Gym visits: ${visitsResult.rows[0].count}`);

    // Check workout logs
    const workoutResult = await query('SELECT COUNT(*) as count FROM workout_logs WHERE user_id = $1', [user.id]);
    console.log(`✅ Workout logs: ${workoutResult.rows[0].count}`);

    // Check workout schedule
    const scheduleResult = await query('SELECT COUNT(*) as count FROM member_workout_schedules WHERE user_id = $1', [user.id]);
    console.log(`✅ Workout schedule entries: ${scheduleResult.rows[0].count}`);

    console.log('\n🎉 Data check completed!');

  } catch (error) {
    console.error('❌ Error checking mehlab data:', error);
  }
};

// Run the script
checkMehlabData();
