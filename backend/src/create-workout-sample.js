const { query } = require('./config/database');

async function createWorkoutSample() {
  try {
    console.log('Creating sample workout data...');
    
    // Get a sample member user
    const userResult = await query(
      'SELECT id FROM users WHERE role = \'member\' LIMIT 1'
    );
    
    if (userResult.rows.length === 0) {
      console.log('No member users found. Please create a member user first.');
      return;
    }
    
    const userId = userResult.rows[0].id;
    console.log(`Using user ID: ${userId}`);
    
    // Create sample workout schedules
    const workoutSchedules = [
      { day_of_week: 1, schedule_name: 'Push Day' }, // Monday
      { day_of_week: 3, schedule_name: 'Pull Day' }, // Wednesday
      { day_of_week: 5, schedule_name: 'Leg Day' }   // Friday
    ];
    
    for (const schedule of workoutSchedules) {
      await query(
        `INSERT INTO member_workout_schedules (user_id, day_of_week, schedule_name, is_active)
         VALUES ($1, $2, $3, true)`,
        [userId, schedule.day_of_week, schedule.schedule_name]
      );
    }
    
    // Create sample workout logs for current month
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const workoutLogs = [
      {
        workout_date: new Date(currentYear, currentMonth, 1),
        workout_type: 'Push Day',
        duration_minutes: 60,
        calories_burned: 450,
        notes: 'Great chest and shoulder workout'
      },
      {
        workout_date: new Date(currentYear, currentMonth, 3),
        workout_type: 'Pull Day',
        duration_minutes: 55,
        calories_burned: 420,
        notes: 'Back and biceps focus'
      },
      {
        workout_date: new Date(currentYear, currentMonth, 5),
        workout_type: 'Leg Day',
        duration_minutes: 65,
        calories_burned: 500,
        notes: 'Intense leg session'
      },
      {
        workout_date: new Date(currentYear, currentMonth, 8),
        workout_type: 'Push Day',
        duration_minutes: 58,
        calories_burned: 440,
        notes: 'Second push day of the week'
      },
      {
        workout_date: new Date(currentYear, currentMonth, 10),
        workout_type: 'Pull Day',
        duration_minutes: 52,
        calories_burned: 400,
        notes: 'Back workout'
      }
    ];
    
    for (const log of workoutLogs) {
      await query(
        `INSERT INTO workout_logs (user_id, workout_date, workout_type, duration_minutes, calories_burned, notes)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, log.workout_date.toISOString().split('T')[0], log.workout_type, log.duration_minutes, log.calories_burned, log.notes]
      );
    }
    
    console.log('Sample workout data created successfully!');
    console.log('Created 3 workout schedules (Monday, Wednesday, Friday)');
    console.log('Created 5 workout logs for current month');
    console.log('Workout completion: 5/3 (completed workouts vs scheduled days)');
    
  } catch (error) {
    console.error('Error creating workout sample:', error);
  } finally {
    process.exit(0);
  }
}

createWorkoutSample();
