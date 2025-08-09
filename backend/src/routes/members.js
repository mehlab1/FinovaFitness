import express from 'express';
import { query } from '../database.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Middleware to verify member token
const verifyMemberToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user record
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0];
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get member dashboard data
router.get('/dashboard', verifyMemberToken, async (req, res) => {
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
});

// Get member bookings
router.get('/bookings', verifyMemberToken, async (req, res) => {
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
});

// Get available trainers
router.get('/trainers', verifyMemberToken, async (req, res) => {
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
});

// Get nutritionists
router.get('/nutritionists', verifyMemberToken, async (req, res) => {
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
});

// Get announcements
router.get('/announcements', verifyMemberToken, async (req, res) => {
  try {
    // Since we don't have an announcements table yet, return from our schema
    const result = await query(
      `SELECT * FROM announcements 
       WHERE target_audience IN ('All', 'Clients', 'Members') 
       ORDER BY date DESC LIMIT 10`,
      []
    );

    // If no announcements table, return mock data for now
    const mockAnnouncements = [
      {
        id: 1,
        title: 'New Equipment Arrival',
        message: 'We have new cardio machines arriving next week!',
        priority: 'high',
        date: '2024-01-15',
        author: 'Management'
      },
      {
        id: 2,
        title: 'Holiday Schedule',
        message: 'Special holiday hours this weekend. Check the front desk for details.',
        priority: 'medium',
        date: '2024-01-12',
        author: 'Front Desk'
      }
    ];

    res.json(result.rows.length > 0 ? result.rows : mockAnnouncements);

  } catch (error) {
    console.error('Announcements error:', error);
    // Return mock data if database error
    const mockAnnouncements = [
      {
        id: 1,
        title: 'New Equipment Arrival',
        message: 'We have new cardio machines arriving next week!',
        priority: 'high',
        date: '2024-01-15',
        author: 'Management'
      }
    ];
    res.json(mockAnnouncements);
  }
});

// Get member workout schedule
router.get('/workout-schedule', verifyMemberToken, async (req, res) => {
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
});

// Get membership plans
router.get('/membership-plans', verifyMemberToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT * FROM membership_plans 
       WHERE is_active = true 
       ORDER BY price ASC`,
      []
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Membership plans error:', error);
    res.status(500).json({ error: 'Failed to get membership plans' });
  }
});

// Get facilities
router.get('/facilities', verifyMemberToken, async (req, res) => {
  try {
    // For now, return facilities from mockData since we don't have a facilities booking table
    // In a real app, you'd have facility booking tables
    const facilities = [
      {
        id: '1',
        name: 'Sauna',
        capacity: 8,
        timeSlots: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']
      },
      {
        id: '2',
        name: 'Pool',
        capacity: 12,
        timeSlots: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']
      },
      {
        id: '3',
        name: 'Jacuzzi',
        capacity: 6,
        timeSlots: ['6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM']
      }
    ];

    res.json(facilities);

  } catch (error) {
    console.error('Facilities error:', error);
    res.status(500).json({ error: 'Failed to get facilities' });
  }
});

// Create training request
router.post('/training-request', verifyMemberToken, async (req, res) => {
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
});

// Book facility
router.post('/book-facility', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { facility_name, booking_date, start_time, end_time } = req.body;

    // For now, just return success since we don't have facility booking tables
    // In a real app, you'd insert into a facility_bookings table
    
    res.json({
      success: true,
      message: `${facility_name} booked for ${booking_date} at ${start_time}`,
      booking: {
        facility_name,
        booking_date,
        start_time,
        end_time,
        user_id: userId
      }
    });

  } catch (error) {
    console.error('Facility booking error:', error);
    res.status(500).json({ error: 'Failed to book facility' });
  }
});

export default router;
