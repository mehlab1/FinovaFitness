import express from 'express';
import { query } from '../database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

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
    
    // Get member profile with current plan details
    const profileResult = await query(
      `SELECT mp.*, mp.weight, mp.height, mp.loyalty_points, mp.streak_days, mp.last_gym_visit,
              mp.current_plan_id
       FROM member_profiles mp
       WHERE mp.user_id = $1`,
      [userId]
    );

    // Get current membership plan details
    const planResult = await query(
      `SELECT mp.current_plan_id, mpl.name as plan_name, mpl.price, mpl.duration_months,
              u.membership_start_date, u.membership_end_date
       FROM member_profiles mp
       LEFT JOIN membership_plans mpl ON mp.current_plan_id = mpl.id
       LEFT JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = $1`,
      [userId]
    );

    // Check if subscription is currently paused
    const pauseResult = await query(
      `SELECT * FROM subscription_pauses 
       WHERE user_id = $1 AND status = 'active' 
       AND CURRENT_DATE BETWEEN pause_start_date AND pause_end_date`,
      [userId]
    );

    // Get upcoming bookings
    const bookingsResult = await query(
      `SELECT b.*, t.id as trainer_id, u.first_name as trainer_first_name, u.last_name as trainer_last_name
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

    // Get referral count
    const referralResult = await query(
      `SELECT COUNT(*) as referral_count
       FROM referrals 
       WHERE referrer_id = $1 AND status = 'joined'`,
      [userId]
    );

    // Get most recent weight and height from weight_tracking table
    const latestWeightResult = await query(
      `SELECT weight, height, recorded_date
       FROM weight_tracking 
       WHERE user_id = $1 
       ORDER BY recorded_date DESC 
       LIMIT 1`,
      [userId]
    );

    // Get weight change (current - previous weight)
    const weightResult = await query(
      `SELECT 
         w1.weight as current_weight,
         w2.weight as previous_weight
       FROM weight_tracking w1
       LEFT JOIN weight_tracking w2 ON w2.user_id = w1.user_id 
         AND w2.recorded_date < w1.recorded_date
         AND w2.recorded_date = (
           SELECT MAX(recorded_date) 
           FROM weight_tracking w3 
           WHERE w3.user_id = w1.user_id 
           AND w3.recorded_date < w1.recorded_date
         )
       WHERE w1.user_id = $1 
       AND w1.recorded_date = (
         SELECT MAX(recorded_date) 
         FROM weight_tracking 
         WHERE user_id = $1
       )`,
      [userId]
    );

    // Get workout completion count (all time)
    const workoutResult = await query(
      `SELECT 
         COUNT(*) as completed_workouts,
         (SELECT COUNT(*) FROM member_workout_schedules WHERE user_id = $1 AND is_active = true) as total_scheduled_workouts
       FROM workout_logs 
       WHERE user_id = $1`,
      [userId]
    );

    // Get member balance
    const balanceResult = await query(
      'SELECT current_balance, total_earned, total_spent FROM member_balance WHERE user_id = $1',
      [userId]
    );

    // Get recent balance transactions
    const transactionsResult = await query(
      `SELECT * FROM member_balance_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    );

    // Calculate BMI if height and weight are available
    let bmi = null;
    let weightChange = null;
    const profile = profileResult.rows[0] || {};
    
    // Use height from member_profiles and latest weight from weight_tracking
    if (profile.height && latestWeightResult.rows[0]?.weight) {
      // BMI = weight(kg) / (height(m))^2
      const heightInMeters = profile.height / 100;
      const latestWeight = latestWeightResult.rows[0].weight;
      bmi = (latestWeight / (heightInMeters * heightInMeters)).toFixed(1);
    }

    if (weightResult.rows[0]?.current_weight && weightResult.rows[0]?.previous_weight) {
      weightChange = (weightResult.rows[0].current_weight - weightResult.rows[0].previous_weight).toFixed(1);
    }

    // Calculate days remaining in membership
    let daysRemaining = null;
    if (planResult.rows[0]?.membership_end_date) {
      const endDate = new Date(planResult.rows[0].membership_end_date);
      const today = new Date();
      const diffTime = endDate - today;
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.json({
      profile: {
        ...profile,
        loyalty_points: profile.loyalty_points || 0,
        streak_days: profile.streak_days || 0,
        last_gym_visit: profile.last_gym_visit,
        weight: profile.weight,
        height: profile.height,
        bmi: bmi,
        weight_change: weightChange
      },
      currentPlan: {
        name: planResult.rows[0]?.plan_name || 'No Plan',
        price: planResult.rows[0]?.price || 0,
        duration_months: planResult.rows[0]?.duration_months || 0,
        start_date: planResult.rows[0]?.membership_start_date,
        end_date: planResult.rows[0]?.membership_end_date,
        days_remaining: daysRemaining
      },
      subscriptionPaused: pauseResult.rows.length > 0,
      pauseDetails: pauseResult.rows[0] || null,
      upcomingBookings: bookingsResult.rows,
      recentVisits: visitsResult.rows,
      loyaltyStats: loyaltyResult.rows[0] || {
        total_points: 0,
        total_transactions: 0
      },
      referralCount: referralResult.rows[0]?.referral_count || 0,
      workoutStats: {
        completed: workoutResult.rows[0]?.completed_workouts || 0,
        total: workoutResult.rows[0]?.total_scheduled_workouts || 0
      },
      balance: balanceResult.rows[0] || {
        current_balance: 0,
        total_earned: 0,
        total_spent: 0
      },
      recentTransactions: transactionsResult.rows
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

// Get all membership plans
router.get('/plans', async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM membership_plans WHERE is_active = true ORDER BY price ASC'
    );
    
    res.json({ 
      success: true,
      plans: result.rows 
    });
  } catch (error) {
    console.error('Error fetching membership plans:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch membership plans' 
    });
  }
});

// Get membership plan by ID
router.get('/plans/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM membership_plans WHERE id = $1 AND is_active = true',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Membership plan not found' 
      });
    }
    
    res.json({ 
      success: true,
      plan: result.rows[0] 
    });
  } catch (error) {
    console.error('Error fetching membership plan:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch membership plan' 
    });
  }
});

// Get member profile data
router.get('/profile', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get user and member profile data
    const userResult = await query(
      `SELECT id, email, first_name, last_name, phone, date_of_birth, gender, address, emergency_contact, membership_start_date, membership_end_date
       FROM users 
       WHERE id = $1`,
      [userId]
    );

    const profileResult = await query(
      `SELECT current_plan_id, loyalty_points, streak_days, last_gym_visit, weight, height, profile_image_url, fitness_goals, health_notes
       FROM member_profiles 
       WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0];
    const profile = profileResult.rows[0] || {};

    res.json({
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        date_of_birth: user.date_of_birth,
        gender: user.gender,
        address: user.address,
        emergency_contact: user.emergency_contact,
        membership_start_date: user.membership_start_date,
        membership_end_date: user.membership_end_date
      },
      profile: {
        current_plan_id: profile.current_plan_id,
        loyalty_points: profile.loyalty_points || 0,
        streak_days: profile.streak_days || 0,
        last_gym_visit: profile.last_gym_visit,
        weight: profile.weight,
        height: profile.height,
        profile_image_url: profile.profile_image_url,
        fitness_goals: profile.fitness_goals,
        health_notes: profile.health_notes
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// Update member profile
router.put('/profile', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    const {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      emergency_contact,
      height,
      weight,
      fitness_goals,
      health_notes
    } = req.body;

    // Update users table
    await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, date_of_birth = $5, gender = $6, address = $7, emergency_contact = $8, updated_at = CURRENT_TIMESTAMP
       WHERE id = $9`,
      [first_name, last_name, email, phone, date_of_birth, gender, address, emergency_contact, userId]
    );

    // Update or insert member_profiles table
    const profileExists = await query(
      'SELECT id FROM member_profiles WHERE user_id = $1',
      [userId]
    );

    if (profileExists.rows.length > 0) {
      // Update existing profile
      await query(
        `UPDATE member_profiles 
         SET height = $1, weight = $2, fitness_goals = $3, health_notes = $4, updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $5`,
        [height, weight, fitness_goals, health_notes, userId]
      );
    } else {
      // Insert new profile
      await query(
        `INSERT INTO member_profiles (user_id, height, weight, fitness_goals, health_notes)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, height, weight, fitness_goals, health_notes]
      );
    }

    res.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Log new weight
router.post('/weight-log', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { weight, notes } = req.body;

    if (!weight || parseFloat(weight) <= 0) {
      return res.status(400).json({ error: 'Valid weight is required' });
    }

    // Get current height from member_profiles
    const heightResult = await query(
      'SELECT height FROM member_profiles WHERE user_id = $1',
      [userId]
    );

    const height = heightResult.rows[0]?.height;

    // Get previous weight for change calculation
    const previousWeightResult = await query(
      `SELECT weight FROM weight_tracking 
       WHERE user_id = $1 
       ORDER BY recorded_date DESC, created_at DESC 
       LIMIT 1`,
      [userId]
    );

    const previousWeight = previousWeightResult.rows[0]?.weight;
    const weightChange = previousWeight ? parseFloat(weight) - previousWeight : 0;

    // Insert new weight record
    await query(
      `INSERT INTO weight_tracking (user_id, weight, height, recorded_date, notes)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)`,
      [userId, parseFloat(weight), height, notes || '']
    );

    // Update member_profiles with new weight
    await query(
      `UPDATE member_profiles 
       SET weight = $1, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $2`,
      [parseFloat(weight), userId]
    );

    res.json({ 
      success: true, 
      message: 'Weight logged successfully',
      weight: parseFloat(weight),
      weightChange: weightChange,
      previousWeight: previousWeight
    });

  } catch (error) {
    console.error('Weight logging error:', error);
    res.status(500).json({ error: 'Failed to log weight' });
  }
});

// Get weight change data
router.get('/weight-change', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get current weight from member_profiles
    const currentWeightResult = await query(
      'SELECT weight FROM member_profiles WHERE user_id = $1',
      [userId]
    );
    
    const currentWeight = currentWeightResult.rows[0]?.weight;
    
    if (!currentWeight) {
      return res.json({ 
        success: true, 
        currentWeight: null,
        previousWeight: null,
        weightChange: null
      });
    }

    // Get previous weight from weight_tracking
    const previousWeightResult = await query(
      `SELECT weight FROM weight_tracking 
       WHERE user_id = $1 AND weight != $2
       ORDER BY recorded_date DESC, created_at DESC 
       LIMIT 1`,
      [userId, currentWeight]
    );

    const previousWeight = previousWeightResult.rows[0]?.weight;
    const weightChange = previousWeight ? currentWeight - previousWeight : null;

    res.json({ 
      success: true, 
      currentWeight: currentWeight,
      previousWeight: previousWeight,
      weightChange: weightChange
    });

  } catch (error) {
    console.error('Weight change fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch weight change data' });
  }
});

// Forgot password - send verification code
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id, first_name FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For now, just return success (in real app, send email with verification code)
    res.json({ 
      success: true, 
      message: 'Verification code sent to your email',
      verificationCode: '123456' // Mock code for testing
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process forgot password request' });
  }
});

// Reset password with verification code
router.post('/reset-password', async (req, res) => {
  try {
    const { email, verificationCode, newPassword } = req.body;

    if (!email || !verificationCode || !newPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // For now, accept any verification code (in real app, validate the code)
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    
    // Update password in database
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE email = $2',
      [hashedPassword, email]
    );

    res.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Calculate plan change details and balance
router.post('/calculate-plan-change', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { newPlanId } = req.body;

    if (!newPlanId) {
      return res.status(400).json({ error: 'New plan ID is required' });
    }

    // Get current plan details
    const currentPlanResult = await query(
      `SELECT mp.current_plan_id, mpl.name as plan_name, mpl.price, mpl.duration_months,
              u.membership_start_date, u.membership_end_date
       FROM member_profiles mp
       LEFT JOIN membership_plans mpl ON mp.current_plan_id = mpl.id
       LEFT JOIN users u ON mp.user_id = u.id
       WHERE mp.user_id = $1`,
      [userId]
    );

    // Get new plan details
    const newPlanResult = await query(
      'SELECT * FROM membership_plans WHERE id = $1 AND is_active = true',
      [newPlanId]
    );

    if (newPlanResult.rows.length === 0) {
      return res.status(404).json({ error: 'New plan not found' });
    }

    const currentPlan = currentPlanResult.rows[0];
    const newPlan = newPlanResult.rows[0];

    if (!currentPlan.current_plan_id) {
      return res.status(400).json({ error: 'No current plan found' });
    }

    // Calculate current plan balance
    let currentPlanBalance = 0;
    if (currentPlan.membership_end_date) {
      const endDate = new Date(currentPlan.membership_end_date);
      const today = new Date();
      const daysRemaining = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
      
      if (daysRemaining > 0) {
        // Calculate daily value based on plan duration
        let totalDays;
        if (currentPlan.duration_months === 12) {
          totalDays = 365; // Yearly plan
        } else {
          totalDays = currentPlan.duration_months * 30; // Monthly plan (approximate)
        }
        
        const dailyValue = currentPlan.price / totalDays;
        currentPlanBalance = dailyValue * daysRemaining;
      }
    }

    // Calculate balance difference
    const balanceDifference = newPlan.price - currentPlanBalance;

    // Determine payment requirements
    let paymentRequired = false;
    let paymentAmount = 0;
    let message = '';

    if (balanceDifference > 0) {
      paymentRequired = true;
      paymentAmount = balanceDifference;
      message = `You need to pay $${paymentAmount.toFixed(2)} more for the new plan.`;
    } else if (balanceDifference === 0) {
      message = 'Perfect! Your current plan balance covers the new plan exactly.';
    } else {
      message = `You have $${Math.abs(balanceDifference).toFixed(2)} in excess balance that will be added to your member balance.`;
    }

    res.json({
      success: true,
      currentPlan: {
        id: currentPlan.current_plan_id,
        name: currentPlan.plan_name,
        price: currentPlan.price,
        daysRemaining: currentPlan.membership_end_date ? 
          Math.ceil((new Date(currentPlan.membership_end_date) - new Date()) / (1000 * 60 * 60 * 24)) : 0
      },
      newPlan: {
        id: newPlan.id,
        name: newPlan.name,
        price: newPlan.price,
        duration_months: newPlan.duration_months,
        features: newPlan.features
      },
      currentPlanBalance: parseFloat(currentPlanBalance.toFixed(2)),
      balanceDifference: parseFloat(balanceDifference.toFixed(2)),
      paymentRequired,
      paymentAmount: parseFloat(paymentAmount.toFixed(2)),
      message
    });

  } catch (error) {
    console.error('Plan change calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate plan change details' });
  }
});

// Initiate plan change request
router.post('/initiate-plan-change', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { newPlanId, currentPlanBalance, newPlanPrice, balanceDifference } = req.body;

    if (!newPlanId || currentPlanBalance === undefined || !newPlanPrice || balanceDifference === undefined) {
      return res.status(400).json({ error: 'All plan change details are required' });
    }

    // Get current plan ID
    const currentPlanResult = await query(
      'SELECT current_plan_id FROM member_profiles WHERE user_id = $1',
      [userId]
    );

    if (currentPlanResult.rows.length === 0) {
      return res.status(404).json({ error: 'Member profile not found' });
    }

    const currentPlanId = currentPlanResult.rows[0].current_plan_id;

    // Create plan change request
    const planChangeResult = await query(
      `INSERT INTO plan_change_requests 
       (user_id, current_plan_id, new_plan_id, current_plan_balance, new_plan_price, balance_difference, payment_required, payment_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userId,
        currentPlanId,
        newPlanId,
        currentPlanBalance,
        newPlanPrice,
        balanceDifference,
        balanceDifference > 0,
        balanceDifference > 0 ? balanceDifference : 0
      ]
    );

    res.json({
      success: true,
      requestId: planChangeResult.rows[0].id,
      message: 'Plan change request initiated successfully'
    });

  } catch (error) {
    console.error('Plan change initiation error:', error);
    res.status(500).json({ error: 'Failed to initiate plan change' });
  }
});

// Confirm plan change
router.post('/confirm-plan-change', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { requestId, email, password } = req.body;

    if (!requestId || !email || !password) {
      return res.status(400).json({ error: 'Request ID, email, and password are required' });
    }

    // Verify user credentials
    const userResult = await query(
      'SELECT id, password_hash FROM users WHERE id = $1 AND email = $2',
      [userId, email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or user ID' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    // Get plan change request details
    const requestResult = await query(
      'SELECT * FROM plan_change_requests WHERE id = $1 AND user_id = $2 AND status = $3',
      [requestId, userId, 'pending']
    );

    if (requestResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan change request not found or already processed' });
    }

    const request = requestResult.rows[0];

    // Update plan change request status
    await query(
      'UPDATE plan_change_requests SET status = $1, completed_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['confirmed', requestId]
    );

    // Update user's current plan
    await query(
      'UPDATE member_profiles SET current_plan_id = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
      [request.new_plan_id, userId]
    );

    // Update membership dates (set new start date to today)
    const newStartDate = new Date();
    const newEndDate = new Date();
    newEndDate.setMonth(newEndDate.getMonth() + 1); // Default to 1 month, adjust based on plan

    await query(
      'UPDATE users SET membership_start_date = $1, membership_end_date = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [newStartDate, newEndDate, userId]
    );

    // Handle member balance
    if (request.balance_difference < 0) {
      // User has excess balance, add to member balance
      const excessAmount = Math.abs(request.balance_difference);
      
      // Insert or update member balance
      await query(
        `INSERT INTO member_balance (user_id, current_balance, total_earned)
         VALUES ($1, $2, $2)
         ON CONFLICT (user_id) 
         DO UPDATE SET 
           current_balance = member_balance.current_balance + $2,
           total_earned = member_balance.total_earned + $2,
           last_updated = CURRENT_TIMESTAMP`,
        [userId, excessAmount]
      );

      // Record balance transaction
      await query(
        `INSERT INTO member_balance_transactions 
         (user_id, transaction_type, amount, balance_before, balance_after, description, reference_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          'plan_change',
          excessAmount,
          0, // Will be calculated from current balance
          excessAmount,
          `Excess balance from plan change to ${request.new_plan_id}`,
          requestId
        ]
      );
    }

    res.json({
      success: true,
      message: 'Plan change confirmed successfully',
      newPlanId: request.new_plan_id,
      excessBalanceAdded: request.balance_difference < 0 ? Math.abs(request.balance_difference) : 0
    });

  } catch (error) {
    console.error('Plan change confirmation error:', error);
    res.status(500).json({ error: 'Failed to confirm plan change' });
  }
});

// Get member balance
router.get('/balance', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Get current balance
    const balanceResult = await query(
      'SELECT * FROM member_balance WHERE user_id = $1',
      [userId]
    );

    // Get recent transactions
    const transactionsResult = await query(
      `SELECT * FROM member_balance_transactions 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [userId]
    );

    const balance = balanceResult.rows[0] || {
      current_balance: 0,
      total_earned: 0,
      total_spent: 0
    };

    res.json({
      success: true,
      balance: {
        current: parseFloat(balance.current_balance || 0),
        totalEarned: parseFloat(balance.total_earned || 0),
        totalSpent: parseFloat(balance.total_spent || 0)
      },
      recentTransactions: transactionsResult.rows
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch member balance' });
  }
});

// Top up member balance
router.post('/top-up-balance', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount. Amount must be greater than 0.' });
    }

    // Get current balance
    const currentBalanceResult = await query(
      'SELECT current_balance FROM member_balance WHERE user_id = $1',
      [userId]
    );

    const currentBalance = currentBalanceResult.rows[0]?.current_balance || 0;
    const newBalance = parseFloat(currentBalance) + parseFloat(amount);

    // Insert or update member balance
    await query(
      `INSERT INTO member_balance (user_id, current_balance, total_earned)
       VALUES ($1, $2, $2)
       ON CONFLICT (user_id) 
       DO UPDATE SET 
         current_balance = $2,
         total_earned = member_balance.total_earned + $3,
         last_updated = CURRENT_TIMESTAMP`,
      [userId, newBalance, amount]
    );

    // Record balance transaction
    await query(
      `INSERT INTO member_balance_transactions 
       (user_id, transaction_type, amount, balance_before, balance_after, description, reference_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        userId,
        'top_up',
        amount,
        currentBalance,
        newBalance,
        `Balance top-up of $${amount}`,
        null
      ]
    );

    res.json({
      success: true,
      message: 'Balance topped up successfully',
      newBalance: newBalance,
      amountAdded: amount
    });

  } catch (error) {
    console.error('Top-up balance error:', error);
    res.status(500).json({ error: 'Failed to top up balance' });
  }
});

// Pause subscription
router.post('/pause-subscription', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { pauseDurationDays } = req.body;

    if (!pauseDurationDays || pauseDurationDays <= 0) {
      return res.status(400).json({ error: 'Invalid pause duration. Duration must be greater than 0.' });
    }

    // Get current membership details
    const membershipResult = await query(
      `SELECT u.membership_end_date, u.is_active, mp.current_plan_id
       FROM users u
       LEFT JOIN member_profiles mp ON u.id = mp.user_id
       WHERE u.id = $1`,
      [userId]
    );

    if (membershipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    const membership = membershipResult.rows[0];
    
    if (!membership.is_active) {
      return res.status(400).json({ error: 'Membership is not active' });
    }

    if (!membership.membership_end_date) {
      return res.status(400).json({ error: 'No valid membership end date found' });
    }

    // Calculate pause dates
    const pauseStartDate = new Date();
    const pauseEndDate = new Date();
    pauseEndDate.setDate(pauseEndDate.getDate() + pauseDurationDays);

    // Extend membership end date by pause duration
    const newMembershipEndDate = new Date(membership.membership_end_date);
    newMembershipEndDate.setDate(newMembershipEndDate.getDate() + pauseDurationDays);

    // Begin transaction
    await query('BEGIN');

    try {
      // Insert pause record
      await query(
        `INSERT INTO subscription_pauses 
         (user_id, pause_start_date, pause_end_date, pause_duration_days, reason, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          userId,
          pauseStartDate.toISOString().split('T')[0],
          pauseEndDate.toISOString().split('T')[0],
          pauseDurationDays,
          'Member requested pause',
          'active'
        ]
      );

      // Update membership end date
      await query(
        `UPDATE users 
         SET membership_end_date = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newMembershipEndDate.toISOString().split('T')[0], userId]
      );

      // Update member profile status to paused
      await query(
        `UPDATE member_profiles 
         SET updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $1`,
        [userId]
      );

      await query('COMMIT');

      res.json({
        success: true,
        message: `Subscription paused successfully for ${pauseDurationDays} days`,
        pauseStartDate: pauseStartDate.toISOString().split('T')[0],
        pauseEndDate: pauseEndDate.toISOString().split('T')[0],
        newMembershipEndDate: newMembershipEndDate.toISOString().split('T')[0],
        pauseDurationDays
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Pause subscription error:', error);
    res.status(500).json({ error: 'Failed to pause subscription' });
  }
});

// Resume subscription (end pause early)
router.post('/resume-subscription', verifyMemberToken, async (req, res) => {
  try {
    const userId = req.userId;

    // Check if there's an active pause
    const pauseResult = await query(
      `SELECT * FROM subscription_pauses 
       WHERE user_id = $1 AND status = 'active' 
       AND CURRENT_DATE BETWEEN pause_start_date AND pause_end_date`,
      [userId]
    );

    if (pauseResult.rows.length === 0) {
      return res.status(400).json({ error: 'No active pause found to resume' });
    }

    const pause = pauseResult.rows[0];
    const pauseEndDate = new Date(pause.pause_end_date);
    const today = new Date();
    
    // Calculate remaining pause days
    const remainingPauseDays = Math.ceil((pauseEndDate - today) / (1000 * 60 * 60 * 24));
    
    if (remainingPauseDays <= 0) {
      return res.status(400).json({ error: 'Pause has already ended' });
    }

    // Get current membership end date
    const membershipResult = await query(
      `SELECT membership_end_date FROM users WHERE id = $1`,
      [userId]
    );

    if (membershipResult.rows.length === 0) {
      return res.status(404).json({ error: 'Membership not found' });
    }

    const currentEndDate = new Date(membershipResult.rows[0].membership_end_date);
    
    // Calculate new end date (subtract remaining pause days)
    const newEndDate = new Date(currentEndDate);
    newEndDate.setDate(newEndDate.getDate() - remainingPauseDays);

    // Begin transaction
    await query('BEGIN');

    try {
      // Update pause status to completed
      await query(
        `UPDATE subscription_pauses 
         SET status = 'completed', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [pause.id]
      );

      // Update membership end date
      await query(
        `UPDATE users 
         SET membership_end_date = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [newEndDate.toISOString().split('T')[0], userId]
      );

      await query('COMMIT');

      res.json({
        success: true,
        message: 'Subscription resumed successfully',
        newEndDate: newEndDate.toISOString().split('T')[0],
        daysRemoved: remainingPauseDays
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ error: 'Failed to resume subscription' });
  }
});

export default router;
