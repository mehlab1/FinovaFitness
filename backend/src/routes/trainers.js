import express from 'express';
import { query } from '../database.js';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/profiles/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'trainer-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Middleware to verify trainer token
const verifyTrainerToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get trainer record
    const trainerResult = await query(
      'SELECT t.*, u.first_name, u.last_name, u.email FROM trainers t JOIN users u ON t.user_id = u.id WHERE u.id = $1',
      [decoded.userId]
    );

    if (trainerResult.rows.length === 0) {
      return res.status(403).json({ error: 'Not a trainer account' });
    }

    req.trainer = trainerResult.rows[0];
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get trainer dashboard data
router.get('/dashboard', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    // Get current month stats
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    const statsResult = await query(
      'SELECT * FROM trainer_monthly_stats WHERE trainer_id = $1 AND month_year = $2',
      [trainerId, currentMonth]
    );

    // Get upcoming sessions
    const upcomingSessionsResult = await query(
      `SELECT ts.*, u.first_name, u.last_name 
       FROM training_sessions ts 
       LEFT JOIN users u ON ts.client_id = u.id 
       WHERE ts.trainer_id = $1 AND ts.session_date >= CURRENT_DATE 
       ORDER BY ts.session_date, ts.start_time LIMIT 5`,
      [trainerId]
    );

    // Get recent client requests
    const requestsResult = await query(
      `SELECT * FROM training_requests 
       WHERE trainer_id = $1 AND status = 'pending' 
       ORDER BY created_at DESC LIMIT 5`,
      [trainerId]
    );

    // Get today's earnings
    const todayEarningsResult = await query(
      `SELECT COALESCE(SUM(trainer_earnings), 0) as today_earnings 
       FROM trainer_revenue 
       WHERE trainer_id = $1 AND revenue_date = CURRENT_DATE`,
      [trainerId]
    );

    res.json({
      stats: statsResult.rows[0] || {
        total_sessions: 0,
        completed_sessions: 0,
        total_revenue: 0,
        total_earnings: 0,
        new_clients: 0,
        active_clients: 0,
        average_rating: 0,
        total_ratings: 0
      },
      upcomingSessions: upcomingSessionsResult.rows,
      clientRequests: requestsResult.rows,
      todayEarnings: todayEarningsResult.rows[0]?.today_earnings || 0
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to get dashboard data' });
  }
});

// Get trainer schedule
router.get('/schedule', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    const { date } = req.query;
    
    // Get trainer availability
    const availabilityResult = await query(
      'SELECT * FROM trainer_availability WHERE trainer_id = $1',
      [trainerId]
    );

    // Get scheduled sessions for specific date or upcoming week
    let sessionsQuery;
    let sessionsParams;
    
    if (date) {
      sessionsQuery = `
        SELECT ts.*, u.first_name, u.last_name 
        FROM training_sessions ts 
        LEFT JOIN users u ON ts.client_id = u.id 
        WHERE ts.trainer_id = $1 AND ts.session_date = $2 
        ORDER BY ts.start_time
      `;
      sessionsParams = [trainerId, date];
    } else {
      sessionsQuery = `
        SELECT ts.*, u.first_name, u.last_name 
        FROM training_sessions ts 
        LEFT JOIN users u ON ts.client_id = u.id 
        WHERE ts.trainer_id = $1 AND ts.session_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
        ORDER BY ts.session_date, ts.start_time
      `;
      sessionsParams = [trainerId];
    }

    const sessionsResult = await query(sessionsQuery, sessionsParams);

    // Get time off/blocked slots
    const timeOffResult = await query(
      `SELECT * FROM trainer_time_off 
       WHERE trainer_id = $1 AND end_date >= CURRENT_DATE 
       ORDER BY start_date`,
      [trainerId]
    );

    res.json({
      availability: availabilityResult.rows,
      sessions: sessionsResult.rows,
      timeOff: timeOffResult.rows
    });

  } catch (error) {
    console.error('Schedule error:', error);
    res.status(500).json({ error: 'Failed to get schedule data' });
  }
});

// Get client requests
router.get('/requests', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    const result = await query(
      `SELECT tr.*, u.first_name, u.last_name 
       FROM training_requests tr 
       LEFT JOIN users u ON tr.requester_id = u.id 
       WHERE tr.trainer_id = $1 
       ORDER BY tr.created_at DESC`,
      [trainerId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Requests error:', error);
    res.status(500).json({ error: 'Failed to get client requests' });
  }
});

// Update request status
router.put('/requests/:id', verifyTrainerToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trainer_response, approved_date, approved_time, session_price } = req.body;
    
    const result = await query(
      `UPDATE training_requests 
       SET status = $1, trainer_response = $2, approved_date = $3, approved_time = $4, session_price = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND trainer_id = $7 RETURNING *`,
      [status, trainer_response, approved_date, approved_time, session_price, id, req.trainer.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Failed to update request' });
  }
});

// Get session notes
router.get('/session-notes', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    const result = await query(
      `SELECT sn.*, ts.session_date, ts.start_time, ts.end_time, u.first_name, u.last_name
       FROM session_notes sn
       JOIN training_sessions ts ON sn.training_session_id = ts.id
       JOIN users u ON sn.client_id = u.id
       WHERE sn.trainer_id = $1
       ORDER BY ts.session_date DESC, ts.start_time DESC`,
      [trainerId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Session notes error:', error);
    res.status(500).json({ error: 'Failed to get session notes' });
  }
});

// Add/Update session notes
router.post('/session-notes', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    const {
      training_session_id,
      client_id,
      exercises_performed,
      sets_and_reps,
      client_feedback,
      trainer_observations,
      next_session_goals,
      client_progress_notes,
      fitness_metrics
    } = req.body;

    const result = await query(
      `INSERT INTO session_notes 
       (training_session_id, trainer_id, client_id, exercises_performed, sets_and_reps, 
        client_feedback, trainer_observations, next_session_goals, client_progress_notes, fitness_metrics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (training_session_id) 
       DO UPDATE SET
         exercises_performed = EXCLUDED.exercises_performed,
         sets_and_reps = EXCLUDED.sets_and_reps,
         client_feedback = EXCLUDED.client_feedback,
         trainer_observations = EXCLUDED.trainer_observations,
         next_session_goals = EXCLUDED.next_session_goals,
         client_progress_notes = EXCLUDED.client_progress_notes,
         fitness_metrics = EXCLUDED.fitness_metrics,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [training_session_id, trainerId, client_id, exercises_performed, 
       JSON.stringify(sets_and_reps), client_feedback, trainer_observations, 
       next_session_goals, client_progress_notes, JSON.stringify(fitness_metrics)]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Session notes save error:', error);
    res.status(500).json({ error: 'Failed to save session notes' });
  }
});

// Get analytics data
router.get('/analytics', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    // Get monthly stats for the last 6 months
    const monthlyStatsResult = await query(
      `SELECT * FROM trainer_monthly_stats 
       WHERE trainer_id = $1 
       ORDER BY month_year DESC LIMIT 6`,
      [trainerId]
    );

    // Get revenue breakdown
    const revenueResult = await query(
      `SELECT 
         DATE_TRUNC('month', revenue_date) as month,
         SUM(amount) as total_revenue,
         SUM(trainer_earnings) as trainer_earnings,
         COUNT(*) as session_count
       FROM trainer_revenue 
       WHERE trainer_id = $1 AND revenue_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', revenue_date)
       ORDER BY month DESC`,
      [trainerId]
    );

    // Get client progress overview
    const clientProgressResult = await query(
      `SELECT 
         u.first_name, u.last_name,
         COUNT(cp.id) as progress_entries,
         MAX(cp.progress_date) as last_update
       FROM users u
       JOIN client_progress cp ON u.id = cp.client_id
       WHERE cp.trainer_id = $1
       GROUP BY u.id, u.first_name, u.last_name
       ORDER BY last_update DESC`,
      [trainerId]
    );

    // Get ratings summary
    const ratingsResult = await query(
      `SELECT 
         AVG(rating) as average_rating,
         AVG(training_effectiveness) as avg_effectiveness,
         AVG(communication) as avg_communication,
         AVG(punctuality) as avg_punctuality,
         AVG(professionalism) as avg_professionalism,
         COUNT(*) as total_ratings
       FROM trainer_ratings 
       WHERE trainer_id = $1`,
      [trainerId]
    );

    res.json({
      monthlyStats: monthlyStatsResult.rows,
      revenueBreakdown: revenueResult.rows,
      clientProgress: clientProgressResult.rows,
      ratingsOverview: ratingsResult.rows[0] || {
        average_rating: 0,
        avg_effectiveness: 0,
        avg_communication: 0,
        avg_punctuality: 0,
        avg_professionalism: 0,
        total_ratings: 0
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics data' });
  }
});

// Get client subscriptions
router.get('/subscriptions', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    const result = await query(
      `SELECT cts.*, u.first_name, u.last_name, u.email
       FROM client_trainer_subscriptions cts
       JOIN users u ON cts.client_id = u.id
       WHERE cts.trainer_id = $1
       ORDER BY cts.status, cts.end_date`,
      [trainerId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Subscriptions error:', error);
    res.status(500).json({ error: 'Failed to get client subscriptions' });
  }
});

// Get trainer profile
router.get('/profile', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    // Get trainer profile data
    const profileResult = await query(
      `SELECT t.*, u.first_name, u.last_name, u.email, u.phone 
       FROM trainers t 
       JOIN users u ON t.user_id = u.id 
       WHERE t.id = $1`,
      [trainerId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Trainer profile not found' });
    }

    const profile = profileResult.rows[0];
    
    // Parse arrays from database
    profile.specialization = profile.specialization || [];
    profile.certification = profile.certification || [];
    
    res.json(profile);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update trainer profile
router.put('/profile', verifyTrainerToken, upload.single('profile_image'), async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    const userId = req.userId;
    
    // Parse form data
    const {
      first_name,
      last_name,
      email,
      phone,
      specialization,
      certification,
      experience_years,
      bio,
      hourly_rate
    } = req.body;

    // Parse arrays from JSON strings
    const specializationArray = specialization ? JSON.parse(specialization) : [];
    const certificationArray = certification ? JSON.parse(certification) : [];

    // Update user information
    await query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, email = $3, phone = $4, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $5`,
      [first_name, last_name, email, phone, userId]
    );

    // Handle profile image if uploaded
    let profileImagePath = null;
    if (req.file) {
      profileImagePath = `/uploads/profiles/${req.file.filename}`;
    }

    // Update trainer information
    if (profileImagePath) {
      await query(
        `UPDATE trainers 
         SET specialization = $1, certification = $2, experience_years = $3, bio = $4, hourly_rate = $5, profile_image = $6 
         WHERE id = $7`,
        [specializationArray, certificationArray, experience_years, bio, hourly_rate, profileImagePath, trainerId]
      );
    } else {
      await query(
        `UPDATE trainers 
         SET specialization = $1, certification = $2, experience_years = $3, bio = $4, hourly_rate = $5 
         WHERE id = $6`,
        [specializationArray, certificationArray, experience_years, bio, hourly_rate, trainerId]
      );
    }

    res.json({ 
      message: 'Profile updated successfully',
      profile_image: profileImagePath
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
