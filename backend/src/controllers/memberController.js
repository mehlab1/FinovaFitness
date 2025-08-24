import { query } from '../database.js';

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
      `SELECT b.*, 
              CASE 
                WHEN b.trainer_id IS NOT NULL THEN CONCAT(tu.first_name, ' ', tu.last_name)
                WHEN b.class_id IS NOT NULL THEN c.name
                ELSE 'General Booking'
              END as booking_name
       FROM bookings b 
       LEFT JOIN trainers t ON b.trainer_id = t.id
       LEFT JOIN users tu ON t.user_id = tu.id
       LEFT JOIN classes c ON b.class_id = c.id
       WHERE b.user_id = $1 AND b.booking_date >= CURRENT_DATE 
       ORDER BY b.booking_date, b.start_time LIMIT 5`,
      [userId]
    );

    // Get recent gym visits
    const visitsResult = await query(
      `SELECT 
         id,
         user_id,
         visit_date,
         check_in_time,
         check_in_type,
         consistency_week_start,
         consistency_points_awarded
       FROM gym_visits 
       WHERE user_id = $1 
       ORDER BY check_in_time DESC LIMIT 5`,
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
      upcomingBookings: bookingsResult.rows || [],
      recentVisits: visitsResult.rows || [],
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

// Create diet plan request
export const createDietPlanRequest = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      nutritionist_id,
      fitness_goal,
      current_weight,
      height,
      target_weight,
      activity_level,
      monthly_budget,
      dietary_restrictions,
      additional_notes
    } = req.body;

    const result = await query(
      `INSERT INTO diet_plan_requests 
       (user_id, nutritionist_id, fitness_goal, current_weight, height, target_weight, activity_level, monthly_budget, dietary_restrictions, additional_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, nutritionist_id, fitness_goal, current_weight, height, target_weight, activity_level, monthly_budget, dietary_restrictions, additional_notes]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Diet plan request error:', error);
    res.status(500).json({ error: 'Failed to create diet plan request' });
  }
};

// Get diet plan requests for member
export const getDietPlanRequests = async (req, res) => {
  try {
    const userId = req.userId;
    
    const result = await query(
      `SELECT 
         dpr.*,
         u.first_name, u.last_name, u.email
       FROM diet_plan_requests dpr
       JOIN users u ON dpr.nutritionist_id = u.id
       WHERE dpr.user_id = $1
       ORDER BY dpr.created_at DESC`,
      [userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Diet plan requests error:', error);
    res.status(500).json({ error: 'Failed to get diet plan requests' });
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

// Book training session directly
export const bookTrainingSession = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      trainer_id,
      session_date,
      start_time,
      end_time,
      session_type,
      notes
    } = req.body;

    // Start a transaction to ensure data consistency
    await query('BEGIN');

    try {
      // Check if the time slot is available using the new database function
      const availabilityCheck = await query(
        'SELECT is_slot_available($1, $2, $3) as is_available',
        [trainer_id, session_date, start_time]
      );

      if (!availabilityCheck.rows[0]?.is_available) {
        await query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: 'Selected time slot is not available or already booked' 
        });
      }

      // Double-check by looking at the actual schedule status
      const scheduleCheck = await query(
        `SELECT status FROM trainer_schedules 
         WHERE trainer_id = $1 
         AND day_of_week = EXTRACT(DOW FROM $2::date)
         AND time_slot = $3`,
        [trainer_id, session_date, start_time]
      );

      if (scheduleCheck.rows.length === 0 || scheduleCheck.rows[0].status !== 'available') {
        await query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: 'Selected time slot is not available' 
        });
      }

      // Check if there's already a booking for this slot
      const existingBooking = await query(
        `SELECT * FROM training_sessions 
         WHERE trainer_id = $1 
         AND session_date = $2 
         AND start_time = $3 
         AND status IN ('scheduled', 'confirmed')`,
        [trainer_id, session_date, start_time]
      );

      if (existingBooking.rows.length > 0) {
        await query('ROLLBACK');
        return res.status(400).json({ 
          success: false, 
          error: 'This time slot is already booked' 
        });
      }

      // Get trainer's hourly rate
      const trainerResult = await query(
        'SELECT hourly_rate FROM trainers WHERE id = $1',
        [trainer_id]
      );

      const hourlyRate = trainerResult.rows[0]?.hourly_rate || 75.00;
      const sessionDuration = (new Date(`2000-01-01 ${end_time}`) - new Date(`2000-01-01 ${start_time}`)) / (1000 * 60 * 60);
      const sessionPrice = hourlyRate * sessionDuration;

      // Create the training session
      const result = await query(
        `INSERT INTO training_sessions 
         (trainer_id, client_id, session_date, start_time, end_time, session_type, status, price, notes, payment_status)
         VALUES ($1, $2, $3, $4, $5, $6, 'scheduled', $7, $8, 'pending')
         RETURNING *`,
        [trainer_id, userId, session_date, start_time, end_time, session_type, sessionPrice, notes]
      );

      // The trigger should automatically update the trainer_schedules table
      // But let's also manually verify the update
      const scheduleUpdateCheck = await query(
        `SELECT status FROM trainer_schedules 
         WHERE trainer_id = $1 
         AND day_of_week = EXTRACT(DOW FROM $2::date)
         AND time_slot = $3`,
        [trainer_id, session_date, start_time]
      );

      if (scheduleUpdateCheck.rows.length === 0 || scheduleUpdateCheck.rows[0].status !== 'booked') {
        // If the trigger didn't work, manually update the schedule
        await query(
          `UPDATE trainer_schedules 
           SET status = 'booked',
               booking_id = $1,
               client_id = $2,
               session_date = $3,
               updated_at = CURRENT_TIMESTAMP
           WHERE trainer_id = $4 
             AND day_of_week = EXTRACT(DOW FROM $3::date)
             AND time_slot = $5`,
          [result.rows[0].id, userId, session_date, trainer_id, start_time]
        );
      }

      // Update trainer's total sessions count
      await query(
        'UPDATE trainers SET total_sessions = total_sessions + 1 WHERE id = $1',
        [trainer_id]
      );

      await query('COMMIT');

      res.json({
        success: true,
        message: 'Training session booked successfully!',
        session: result.rows[0]
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Training session booking error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to book training session' 
    });
  }
};
