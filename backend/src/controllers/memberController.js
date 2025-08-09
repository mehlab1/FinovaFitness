import { query } from '../config/database.js';

// Get member dashboard data
export const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get member profile
    const profileResult = await query(
      'SELECT * FROM member_profiles WHERE user_id = $1',
      [userId]
    );

    // Get upcoming bookings
    const bookingsResult = await query(
      `SELECT b.*, ts.trainer_id, u.first_name as trainer_first_name, u.last_name as trainer_last_name
       FROM bookings b 
       LEFT JOIN trainers t ON b.trainer_id = t.id
       LEFT JOIN users u ON t.user_id = u.id
       WHERE b.user_id = $1 AND b.booking_date >= CURRENT_DATE 
       ORDER BY b.booking_date, b.start_time LIMIT 5`,
      [userId]
    );

    // Get recent gym visits
    const visitsResult = await query(
      `SELECT * FROM gym_visits 
       WHERE user_id = $1 
       ORDER BY visit_date DESC LIMIT 5`,
      [userId]
    );

    // Get loyalty points
    const loyaltyResult = await query(
      `SELECT 
         COALESCE(SUM(points_change), 0) as total_points,
         COUNT(*) as total_transactions
       FROM loyalty_transactions 
       WHERE user_id = $1`,
      [userId]
    );

    res.json({
      profile: profileResult.rows[0] || {
        loyalty_points: 0,
        streak_days: 0,
        last_gym_visit: null
      },
      upcomingBookings: bookingsResult.rows,
      recentVisits: visitsResult.rows,
      loyaltyStats: loyaltyResult.rows[0] || {
        total_points: 0,
        total_transactions: 0
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
};

// Get member bookings
export const getBookings = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await query(
      `SELECT 
         b.*,
         CASE 
           WHEN b.trainer_id IS NOT NULL THEN CONCAT(tu.first_name, ' ', tu.last_name)
           WHEN b.class_id IS NOT NULL THEN c.name
           ELSE 'General Booking'
         END as booking_name,
         CASE 
           WHEN b.trainer_id IS NOT NULL THEN 'Personal Training'
           WHEN b.class_id IS NOT NULL THEN 'Group Class'
           ELSE b.booking_type
         END as type_display
       FROM bookings b
       LEFT JOIN trainers t ON b.trainer_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       LEFT JOIN classes c ON b.class_id = c.id
       WHERE b.user_id = $1
       ORDER BY b.booking_date DESC, b.start_time DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
};

// Get available trainers
export const getTrainers = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
         t.*,
         u.first_name,
         u.last_name,
         u.email,
         COALESCE(AVG(tr.rating), 0) as average_rating,
         COUNT(tr.id) as total_ratings
       FROM trainers t
       JOIN users u ON t.user_id = u.id
       LEFT JOIN trainer_ratings tr ON t.id = tr.trainer_id
       WHERE u.is_active = true
       GROUP BY t.id, u.first_name, u.last_name, u.email
       ORDER BY average_rating DESC, total_ratings DESC`,
      []
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Trainers error:', error);
    res.status(500).json({ error: 'Failed to get trainers' });
  }
};

// Get nutritionists
export const getNutritionists = async (req, res) => {
  try {
    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.phone
       FROM users u
       WHERE u.role = 'nutritionist' AND u.is_active = true
       ORDER BY u.first_name, u.last_name`,
      []
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Nutritionists error:', error);
    res.status(500).json({ error: 'Failed to get nutritionists' });
  }
};

// Get workout schedule
export const getWorkoutSchedule = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await query(
      `SELECT 
         mws.*,
         json_agg(
           json_build_object(
             'muscle_group_id', mg.id,
             'muscle_group_name', mg.name,
             'exercises', (
               SELECT json_agg(
                 json_build_object(
                   'exercise_id', e.id,
                   'exercise_name', e.name,
                   'sets', se.sets,
                   'reps', se.reps,
                   'weight', se.weight,
                   'rest_seconds', se.rest_seconds,
                   'notes', se.notes
                 )
               )
               FROM schedule_exercises se
               JOIN exercises e ON se.exercise_id = e.id
               WHERE se.schedule_id = mws.id AND se.muscle_group_id = mg.id
               ORDER BY se.order_index
             )
           )
         ) as muscle_groups
       FROM member_workout_schedules mws
       LEFT JOIN schedule_muscle_groups smg ON mws.id = smg.schedule_id
       LEFT JOIN muscle_groups mg ON smg.muscle_group_id = mg.id
       WHERE mws.user_id = $1 AND mws.is_active = true
       GROUP BY mws.id
       ORDER BY mws.day_of_week`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Workout schedule error:', error);
    res.status(500).json({ error: 'Failed to get workout schedule' });
  }
};

// Create training request
export const createTrainingRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      trainer_id,
      request_type,
      preferred_date,
      preferred_time,
      message
    } = req.body;

    const result = await query(
      `INSERT INTO training_requests 
       (requester_id, trainer_id, requester_email, requester_name, request_type, preferred_date, preferred_time, message, is_member)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
       RETURNING *`,
      [userId, trainer_id, req.user.email, `${req.user.first_name} ${req.user.last_name}`, 
       request_type, preferred_date, preferred_time, message]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Training request error:', error);
    res.status(500).json({ error: 'Failed to create training request' });
  }
};
