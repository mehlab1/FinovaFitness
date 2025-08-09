import { query } from './database.js';

const createTrainerSampleData = async () => {
  try {
    console.log('🏋️ Creating sample data for trainer portal...');

    // Get the trainer ID (assuming first trainer created)
    const trainerResult = await query('SELECT id FROM trainers LIMIT 1');
    if (trainerResult.rows.length === 0) {
      console.log('❌ No trainer found. Please create sample users first.');
      return;
    }
    
    const trainerId = trainerResult.rows[0].id;
    console.log(`📝 Using trainer ID: ${trainerId}`);

    // Get member ID for testing
    const memberResult = await query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['member']);
    const memberId = memberResult.rows.length > 0 ? memberResult.rows[0].id : null;

    // 1. Create some training sessions
    console.log('📅 Creating training sessions...');
    await query(`
      INSERT INTO training_sessions (trainer_id, client_id, session_date, start_time, end_time, session_type, status, price, notes)
      VALUES 
      ($1, $2, CURRENT_DATE - INTERVAL '7 days', '10:00', '11:00', 'personal_training', 'completed', 75.00, 'Great session, client showed improvement in squats'),
      ($1, $2, CURRENT_DATE - INTERVAL '5 days', '14:00', '15:00', 'personal_training', 'completed', 75.00, 'Focused on upper body strength'),
      ($1, $2, CURRENT_DATE + INTERVAL '2 days', '16:00', '17:00', 'personal_training', 'scheduled', 75.00, 'Planned leg day workout'),
      ($1, NULL, CURRENT_DATE + INTERVAL '3 days', '10:00', '11:00', 'demo', 'scheduled', 0.00, 'Demo session for potential client')
      ON CONFLICT DO NOTHING
    `, [trainerId, memberId]);

    // 2. Create session packages
    console.log('📦 Creating session packages...');
    if (memberId) {
      await query(`
        INSERT INTO session_packages (client_id, trainer_id, package_name, total_sessions, remaining_sessions, price_per_session, total_amount, purchase_date, expiry_date)
        VALUES 
        ($1, $2, '10 Session Package', 10, 7, 70.00, 700.00, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '90 days'),
        ($1, $2, '5 Session Package', 5, 2, 75.00, 375.00, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days')
        ON CONFLICT DO NOTHING
      `, [memberId, trainerId]);
    }

    // 3. Create trainer ratings
    console.log('⭐ Creating trainer ratings...');
    const sessionResult = await query('SELECT id FROM training_sessions WHERE status = $1 LIMIT 2', ['completed']);
    for (const session of sessionResult.rows) {
      await query(`
        INSERT INTO trainer_ratings (trainer_id, client_id, training_session_id, rating, review_text, training_effectiveness, communication, punctuality, professionalism)
        VALUES ($1, $2, $3, 5, 'Excellent trainer! Very knowledgeable and motivating.', 5, 5, 5, 5)
        ON CONFLICT DO NOTHING
      `, [trainerId, memberId, session.id]);
    }

    // 4. Create session notes
    console.log('📝 Creating session notes...');
    for (const session of sessionResult.rows) {
      await query(`
        INSERT INTO session_notes (training_session_id, trainer_id, client_id, exercises_performed, sets_and_reps, trainer_observations, next_session_goals, fitness_metrics)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT DO NOTHING
      `, [
        session.id,
        trainerId,
        memberId,
        ['Squats', 'Bench Press', 'Deadlifts'],
        JSON.stringify({
          "Squats": {"sets": 3, "reps": [12, 10, 8], "weight": [60, 65, 70]},
          "Bench Press": {"sets": 3, "reps": [10, 8, 6], "weight": [70, 75, 80]},
          "Deadlifts": {"sets": 3, "reps": [8, 6, 4], "weight": [80, 85, 90]}
        }),
        'Client showing good progress with form and strength increases',
        'Focus on increasing deadlift weight next session',
        JSON.stringify({"weight": 75, "body_fat": 15, "muscle_mass": 62})
      ]);
    }

    // 5. Create client progress entries
    console.log('📈 Creating client progress records...');
    if (memberId) {
      await query(`
        INSERT INTO client_progress (client_id, trainer_id, progress_date, weight, body_fat_percentage, muscle_mass, measurements, fitness_level, strength_metrics, trainer_assessment, current_goals)
        VALUES 
        ($1, $2, CURRENT_DATE - INTERVAL '30 days', 80.5, 18.5, 58.2, $3, 'beginner', $4, 'Client started with basic fitness level', $5),
        ($1, $2, CURRENT_DATE - INTERVAL '14 days', 79.2, 17.8, 59.1, $3, 'beginner', $6, 'Good progress in strength and form', $5),
        ($1, $2, CURRENT_DATE, 78.1, 16.9, 60.5, $7, 'intermediate', $8, 'Excellent progress, ready for intermediate exercises', $9)
        ON CONFLICT DO NOTHING
      `, [
        memberId, 
        trainerId,
        JSON.stringify({"chest": 102, "waist": 85, "bicep": 32}),
        JSON.stringify({"bench_press": 60, "squat": 80, "deadlift": 100}),
        ['Lose weight', 'Build muscle', 'Improve strength'],
        JSON.stringify({"bench_press": 70, "squat": 90, "deadlift": 120}),
        JSON.stringify({"chest": 105, "waist": 82, "bicep": 34}),
        JSON.stringify({"bench_press": 80, "squat": 100, "deadlift": 140}),
        ['Increase bench press to 90kg', 'Master deadlift form', 'Reduce body fat to 15%']
      ]);
    }

    // 6. Create revenue records
    console.log('💰 Creating revenue records...');
    const completedSessions = await query('SELECT id, price FROM training_sessions WHERE status = $1 AND trainer_id = $2', ['completed', trainerId]);
    for (const session of completedSessions.rows) {
      const trainerEarnings = session.price * 0.70; // 70% to trainer
      const gymCommission = session.price * 0.30; // 30% to gym
      
      await query(`
        INSERT INTO trainer_revenue (trainer_id, revenue_date, training_session_id, client_id, session_type, amount, trainer_earnings, gym_commission, payment_status)
        VALUES ($1, CURRENT_DATE - INTERVAL '7 days', $2, $3, 'personal_training', $4, $5, $6, 'paid')
        ON CONFLICT DO NOTHING
      `, [trainerId, session.id, memberId, session.price, trainerEarnings, gymCommission]);
    }

    // 7. Create monthly stats
    console.log('📊 Creating monthly statistics...');
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // First day of current month
    await query(`
      INSERT INTO trainer_monthly_stats (trainer_id, month_year, total_sessions, completed_sessions, total_revenue, total_earnings, new_clients, active_clients, average_rating, total_ratings)
      VALUES ($1, $2, 4, 2, 150.00, 105.00, 1, 1, 5.0, 2)
      ON CONFLICT (trainer_id, month_year) DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        completed_sessions = EXCLUDED.completed_sessions,
        total_revenue = EXCLUDED.total_revenue,
        total_earnings = EXCLUDED.total_earnings,
        new_clients = EXCLUDED.new_clients,
        active_clients = EXCLUDED.active_clients,
        average_rating = EXCLUDED.average_rating,
        total_ratings = EXCLUDED.total_ratings
    `, [trainerId, currentMonth]);

    // 8. Create client subscription
    console.log('🔄 Creating client subscription...');
    if (memberId) {
      await query(`
        INSERT INTO client_trainer_subscriptions (client_id, trainer_id, subscription_type, plan_name, sessions_per_week, sessions_per_month, price_per_session, start_date, end_date, status, remaining_sessions, total_sessions_included)
        VALUES ($1, $2, 'monthly', 'Premium Training Plan', 2, 8, 70.00, CURRENT_DATE - INTERVAL '14 days', CURRENT_DATE + INTERVAL '46 days', 'active', 6, 8)
        ON CONFLICT DO NOTHING
      `, [memberId, trainerId]);
    }

    console.log('🎉 Trainer sample data created successfully!');
    console.log('\n📋 Sample Data Summary:');
    console.log(`- Training sessions: 4 (2 completed, 2 scheduled)`);
    console.log(`- Session packages: 2`);
    console.log(`- Ratings: 2 (5-star reviews)`);
    console.log(`- Progress records: 3`);
    console.log(`- Revenue records: 2`);
    console.log(`- Monthly stats: Current month summary`);
    console.log(`- Client subscriptions: 1 active`);

  } catch (error) {
    console.error('❌ Error creating trainer sample data:', error);
  }
};

// Run the script
createTrainerSampleData();
