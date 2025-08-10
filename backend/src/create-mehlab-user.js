import bcrypt from 'bcryptjs';
import { query } from './database.js';

const createMehlabUser = async () => {
  try {
    console.log('👤 Creating/updating mehlab user with dummy data...');

    // User data for mehlab
    const userData = {
      email: 'mehlab@finovafitness.com',
      password: 'mehlab 123',
      first_name: 'Mehlab',
      last_name: 'Khan',
      role: 'member',
      phone: '+923001234567',
      date_of_birth: '1995-08-15',
      gender: 'Female',
      address: '456 Fitness Street, Islamabad, Pakistan',
      emergency_contact: 'Ahmed Khan +923001234568'
    };

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [userData.email]);
    let userId;
    
    if (existingUser.rows.length > 0) {
      userId = existingUser.rows[0].id;
      console.log(`✅ User ${userData.email} already exists with ID: ${userId}`);
    } else {
      // Hash password
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(userData.password, saltRounds);

      // Insert user
      const result = await query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, date_of_birth, gender, address, emergency_contact)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id, email, first_name, last_name, role`,
        [userData.email, password_hash, userData.first_name, userData.last_name, userData.role, userData.phone, userData.date_of_birth, userData.gender, userData.address, userData.emergency_contact]
      );

      userId = result.rows[0].id;
      console.log(`✅ Created user: ${userData.email} (Password: ${userData.password}) with ID: ${userId}`);
    }

    // Check if member profile already exists
    const existingProfile = await query('SELECT id FROM member_profiles WHERE user_id = $1', [userId]);
    if (existingProfile.rows.length === 0) {
      // Create member profile with dummy data
      await query(
        `INSERT INTO member_profiles (user_id, loyalty_points, streak_days, last_gym_visit, weight, height, fitness_goals, health_notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          userId,
          1250,
          45,
          '2024-01-20',
          68.5,
          165,
          'Build muscle and lose weight',
          'No known allergies or medical conditions'
        ]
      );
      console.log('✅ Created member profile');
    } else {
      console.log('✅ Member profile already exists');
    }

    // Check if loyalty transactions exist
    const existingLoyalty = await query('SELECT COUNT(*) as count FROM loyalty_transactions WHERE user_id = $1', [userId]);
    if (existingLoyalty.rows[0].count === 0) {
      // Create dummy loyalty transactions
      const loyaltyTransactions = [
        { points_change: 100, transaction_type: 'gym_visit', description: 'Daily gym visit', reference_id: null },
        { points_change: 50, transaction_type: 'gym_visit', description: 'HIIT class attendance', reference_id: null },
        { points_change: 75, transaction_type: 'gym_visit', description: 'PT session completion', reference_id: null },
        { points_change: 100, transaction_type: 'gym_visit', description: 'Daily gym visit', reference_id: null },
        { points_change: 50, transaction_type: 'gym_visit', description: 'Yoga class attendance', reference_id: null }
      ];

      for (const transaction of loyaltyTransactions) {
        await query(
          `INSERT INTO loyalty_transactions (user_id, points_change, transaction_type, description, reference_id)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, transaction.points_change, transaction.transaction_type, transaction.description, transaction.reference_id]
        );
      }
      console.log('✅ Created 5 loyalty transactions');
    } else {
      console.log(`✅ Loyalty transactions already exist (${existingLoyalty.rows[0].count} found)`);
    }

    // Check if gym visits exist
    const existingVisits = await query('SELECT COUNT(*) as count FROM gym_visits WHERE user_id = $1', [userId]);
    if (existingVisits.rows[0].count === 0) {
      // Create dummy gym visits
      const gymVisits = [
        { visit_date: '2024-01-20', duration_minutes: 90, points_awarded: 1 },
        { visit_date: '2024-01-19', duration_minutes: 60, points_awarded: 1 },
        { visit_date: '2024-01-18', duration_minutes: 120, points_awarded: 1 },
        { visit_date: '2024-01-17', duration_minutes: 75, points_awarded: 1 },
        { visit_date: '2024-01-16', duration_minutes: 45, points_awarded: 1 }
      ];

      for (const visit of gymVisits) {
        await query(
          `INSERT INTO gym_visits (user_id, visit_date, duration_minutes, points_awarded)
           VALUES ($1, $2, $3, $4)`,
          [userId, visit.visit_date, visit.duration_minutes, visit.points_awarded]
        );
      }
      console.log('✅ Created 5 gym visits');
    } else {
      console.log(`✅ Gym visits already exist (${existingVisits.rows[0].count} found)`);
    }

    // Check if workout logs exist
    const existingWorkouts = await query('SELECT COUNT(*) as count FROM workout_logs WHERE user_id = $1', [userId]);
    if (existingWorkouts.rows[0].count === 0) {
      // Create dummy workout logs
      const workoutLogs = [
        { workout_date: '2024-01-20', workout_type: 'Cardio + Strength Training', duration_minutes: 90, calories_burned: 450, notes: 'Great session, felt strong today' },
        { workout_date: '2024-01-19', workout_type: 'HIIT Class', duration_minutes: 60, calories_burned: 300, notes: 'Intense workout, good energy' },
        { workout_date: '2024-01-18', workout_type: 'Personal Training + Yoga', duration_minutes: 120, calories_burned: 600, notes: 'PT session focused on form, yoga for recovery' },
        { workout_date: '2024-01-17', workout_type: 'Strength Training', duration_minutes: 75, calories_burned: 375, notes: 'Heavy lifting day, progressive overload' },
        { workout_date: '2024-01-16', workout_type: 'Yoga Class', duration_minutes: 45, calories_burned: 150, notes: 'Gentle flow, good for flexibility' }
      ];

      for (const workout of workoutLogs) {
        await query(
          `INSERT INTO workout_logs (user_id, workout_date, workout_type, duration_minutes, calories_burned, notes)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [userId, workout.workout_date, workout.workout_type, workout.duration_minutes, workout.calories_burned, workout.notes]
        );
      }
      console.log('✅ Created 5 workout logs');
    } else {
      console.log(`✅ Workout logs already exist (${existingWorkouts.rows[0].count} found)`);
    }

    // Check if workout schedule exists
    const existingSchedule = await query('SELECT COUNT(*) as count FROM member_workout_schedules WHERE user_id = $1', [userId]);
    if (existingSchedule.rows.length === 0) {
      // Create dummy workout schedule
      const workoutSchedule = [
        { day_of_week: 1, schedule_name: 'Cardio + Upper Body' }, // Monday
        { day_of_week: 2, schedule_name: 'Lower Body' }, // Tuesday
        { day_of_week: 3, schedule_name: 'Rest Day' }, // Wednesday
        { day_of_week: 4, schedule_name: 'Full Body' }, // Thursday
        { day_of_week: 5, schedule_name: 'Upper Body + Core' }, // Friday
        { day_of_week: 6, schedule_name: 'Cardio + Flexibility' }, // Saturday
        { day_of_week: 0, schedule_name: 'Rest Day' } // Sunday
      ];

      for (const workout of workoutSchedule) {
        await query(
          `INSERT INTO member_workout_schedules (user_id, day_of_week, schedule_name)
           VALUES ($1, $2, $3)`,
          [userId, workout.day_of_week, workout.schedule_name]
        );
      }
      console.log('✅ Created 7-day workout schedule');
    } else {
      console.log(`✅ Workout schedule already exists (${existingSchedule.rows.length} entries found)`);
    }

    // Check if membership plan exists and assign it to mehlab
    const existingPlan = await query('SELECT COUNT(*) as count FROM membership_plans WHERE name = \'Yearly\'');
    let planId;
    
    if (existingPlan.rows[0].count === 0) {
      console.log('❌ Yearly membership plan not found. Please create it first.');
      return;
    } else {
      // Get existing plan ID
      const planResult = await query('SELECT id FROM membership_plans WHERE name = \'Yearly\'');
      if (planResult.rows.length > 0) {
        planId = planResult.rows[0].id;
        console.log('✅ Using existing Yearly membership plan');
      } else {
        console.log('❌ Error: Plan count exists but plan not found');
        return;
      }
    }

    // Update user's membership dates and assign plan
    const membershipStartDate = new Date();
    const membershipEndDate = new Date();
    membershipEndDate.setFullYear(membershipEndDate.getFullYear() + 1);
    
    await query(
      `UPDATE users SET membership_start_date = $1, membership_end_date = $2 WHERE id = $3`,
      [membershipStartDate.toISOString().split('T')[0], membershipEndDate.toISOString().split('T')[0], userId]
    );
    
    // Update member profile to assign the plan
    await query(
      `UPDATE member_profiles SET current_plan_id = $1 WHERE user_id = $2`,
      [planId, userId]
    );
    
    console.log('✅ Assigned Premium Fitness Plan to mehlab user');
    console.log(`✅ Membership dates: ${membershipStartDate.toISOString().split('T')[0]} to ${membershipEndDate.toISOString().split('T')[0]}`);

    console.log('\n🎉 Mehlab user and dummy data setup completed!');
    console.log('\n📋 Login Credentials:');
    console.log('Email: mehlab@finovafitness.com');
    console.log('Password: mehlab 123');
    console.log('\n📊 Dummy Data Summary:');
    console.log('- Member profile with fitness goals');
    console.log('- Premium Fitness Plan (12 months)');
    console.log('- 1,250 loyalty points');
    console.log('- 45-day streak');
    console.log('- 5 loyalty transactions');
    console.log('- 5 gym visits');
    console.log('- 5 workout logs');
    console.log('- 7-day workout schedule');

  } catch (error) {
    console.error('❌ Error setting up mehlab user:', error);
  }
};

// Run the script
createMehlabUser();
