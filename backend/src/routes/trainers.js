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

// Get trainer availability settings
router.get('/availability', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    const result = await query(
      'SELECT * FROM trainer_availability WHERE trainer_id = $1 ORDER BY day_of_week',
      [trainerId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Availability error:', error);
    res.status(500).json({ error: 'Failed to get availability settings' });
  }
});

// Update trainer availability
router.put('/availability', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    const { availability } = req.body;
    
    // Delete existing availability for this trainer
    await query(
      'DELETE FROM trainer_availability WHERE trainer_id = $1',
      [trainerId]
    );
    
    // Insert new availability settings
    for (const day of availability) {
      if (day.isAvailable) {
        await query(
          `INSERT INTO trainer_availability 
           (trainer_id, day_of_week, start_time, end_time, session_duration_minutes, max_sessions_per_day, break_duration_minutes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            trainerId,
            day.dayOfWeek,
            day.startTime,
            day.endTime,
            day.sessionDuration,
            day.maxSessions,
            day.breakDuration
          ]
        );
      }
    }
    
    res.json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Generate time slots based on availability
router.post('/generate-slots', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    const { availability } = req.body;
    
    // Clear existing time slots for this trainer
    await query(
      'DELETE FROM trainer_schedules WHERE trainer_id = $1',
      [trainerId]
    );
    
    // Generate time slots for each available day
    for (const day of availability) {
      if (day.isAvailable) {
        const startTime = new Date(`2000-01-01T${day.startTime}`);
        const endTime = new Date(`2000-01-01T${day.endTime}`);
        const sessionDurationMs = day.sessionDuration * 60 * 1000;
        const breakDurationMs = day.breakDuration * 60 * 1000;
        
        let currentTime = new Date(startTime);
        
        while (currentTime < endTime) {
          const timeSlot = currentTime.toTimeString().slice(0, 5);
          
          await query(
            `INSERT INTO trainer_schedules 
             (trainer_id, day_of_week, time_slot, status)
             VALUES ($1, $2, $3, 'available')`,
            [trainerId, day.dayOfWeek, timeSlot]
          );
          
          currentTime = new Date(currentTime.getTime() + sessionDurationMs + breakDurationMs);
        }
      }
    }
    
    res.json({ message: 'Time slots generated successfully' });
  } catch (error) {
    console.error('Generate slots error:', error);
    res.status(500).json({ error: 'Failed to generate time slots' });
  }
});

// Get available time slots for a specific date
router.get('/available-slots', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }
    
    const dayOfWeek = new Date(date).getDay();
    
    const result = await query(
      `SELECT ts.*, 
              CASE 
                WHEN ts.booking_id IS NOT NULL THEN 'booked'
                WHEN ts.status = 'unavailable' THEN 'unavailable'
                ELSE 'available'
              END as slot_status
       FROM trainer_schedules ts
       WHERE ts.trainer_id = $1 AND ts.day_of_week = $2
       ORDER BY ts.time_slot`,
      [trainerId, dayOfWeek]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Block specific time slots
router.post('/block-slots', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    const { date, startTime, endTime, reason } = req.body;
    
    const result = await query(
      `INSERT INTO trainer_time_off 
       (trainer_id, start_date, end_date, start_time, end_time, reason)
       VALUES ($1, $2, $2, $3, $4, $5) RETURNING *`,
      [trainerId, date, startTime, endTime, reason || 'Personal time off']
    );
    
    // Mark corresponding slots as unavailable
    const dayOfWeek = new Date(date).getDay();
    await query(
      `UPDATE trainer_schedules 
       SET status = 'unavailable'
       WHERE trainer_id = $1 AND day_of_week = $2 AND time_slot BETWEEN $3 AND $4`,
      [trainerId, dayOfWeek, startTime, endTime]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Block slots error:', error);
    res.status(500).json({ error: 'Failed to block time slots' });
  }
});

// Unblock time slots
router.delete('/block-slots/:id', verifyTrainerToken, async (req, res) => {
  try {
    const { id } = req.params;
    const trainerId = req.trainer.id;
    
    // Get the blocked time off record
    const timeOffResult = await query(
      'SELECT * FROM trainer_time_off WHERE id = $1 AND trainer_id = $2',
      [id, trainerId]
    );
    
    if (timeOffResult.rows.length === 0) {
      return res.status(404).json({ error: 'Time off record not found' });
    }
    
    const timeOff = timeOffResult.rows[0];
    
    // Mark corresponding slots as available again
    const dayOfWeek = new Date(timeOff.start_date).getDay();
    await query(
      `UPDATE trainer_schedules 
       SET status = 'available'
       WHERE trainer_id = $1 AND day_of_week = $2 AND time_slot BETWEEN $3 AND $4`,
      [trainerId, dayOfWeek, timeOff.start_time, timeOff.end_time]
    );
    
    // Delete the time off record
    await query(
      'DELETE FROM trainer_time_off WHERE id = $1',
      [id]
    );
    
    res.json({ message: 'Time slots unblocked successfully' });
  } catch (error) {
    console.error('Unblock slots error:', error);
    res.status(500).json({ error: 'Failed to unblock time slots' });
  }
});

// Get confirmed sessions (upcoming)
router.get('/confirmed-sessions', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    const result = await query(
      `SELECT 
         ts.id,
         ts.session_date,
         ts.start_time,
         ts.end_time,
         ts.session_type,
         ts.client_id,
         ts.notes,
         ts.status,
         ts.created_at,
         CONCAT(u.first_name, ' ', u.last_name) as client_name
       FROM training_sessions ts 
       JOIN users u ON ts.client_id = u.id 
       WHERE ts.trainer_id = $1 AND ts.status = 'confirmed'
       ORDER BY ts.session_date, ts.start_time`,
      [trainerId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Confirmed sessions error:', error);
    res.status(500).json({ error: 'Failed to get confirmed sessions' });
  }
});

// Get completed sessions
router.get('/completed-sessions', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    const result = await query(
      `SELECT 
         ts.id,
         ts.session_date,
         ts.start_time,
         ts.end_time,
         ts.session_type,
         ts.client_id,
         ts.notes,
         ts.status,
         ts.created_at,
         CONCAT(u.first_name, ' ', u.last_name) as client_name
       FROM training_sessions ts 
       JOIN users u ON ts.client_id = u.id 
       WHERE ts.trainer_id = $1 AND ts.status = 'completed'
       ORDER BY ts.session_date DESC, ts.start_time DESC`,
      [trainerId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Completed sessions error:', error);
    res.status(500).json({ error: 'Failed to get completed sessions' });
  }
});

// Mark session as completed
router.put('/sessions/:id/complete', verifyTrainerToken, async (req, res) => {
  try {
    const { id } = req.params;
    const trainerId = req.trainer.id;
    
    // Update training session status to completed
    const result = await query(
      `UPDATE training_sessions 
       SET status = 'completed', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND trainer_id = $2 AND status = 'confirmed'
       RETURNING *`,
      [id, trainerId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not confirmed' });
    }

    // Update trainer_schedules table to mark slot as available again
    const session = result.rows[0];
    const dayOfWeek = new Date(session.session_date).getDay();
    
    await query(
      `UPDATE trainer_schedules 
       SET status = 'available', booking_id = NULL, client_id = NULL, session_date = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE trainer_id = $1 AND day_of_week = $2 AND time_slot = $3`,
      [trainerId, dayOfWeek, session.start_time]
    );

    res.json({
      success: true,
      message: 'Session marked as completed successfully',
      session: result.rows[0]
    });

  } catch (error) {
    console.error('Mark session completed error:', error);
    res.status(500).json({ error: 'Failed to mark session as completed' });
  }
});

// Get pending session requests
router.get('/requests', verifyTrainerToken, async (req, res) => {
  try {
    const trainerId = req.trainer.id;
    
    const result = await query(
      `SELECT 
         ts.id,
         ts.session_type as request_type,
         ts.session_date as preferred_date,
         ts.start_time as preferred_time,
         ts.end_time,
         ts.notes as message,
         ts.status,
         ts.created_at,
         ts.price,
         CONCAT(u.first_name, ' ', u.last_name) as requester_name,
         u.email as requester_email,
         CASE WHEN u.role = 'member' THEN true ELSE false END as is_member,
         u.phone as requester_phone
       FROM training_sessions ts 
       JOIN users u ON ts.client_id = u.id 
       WHERE ts.trainer_id = $1 AND ts.status = 'pending'
       ORDER BY ts.created_at DESC`,
      [trainerId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Requests error:', error);
    res.status(500).json({ error: 'Failed to get pending session requests' });
  }
});

// Accept/Reject session request
router.put('/requests/:id', verifyTrainerToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    
    if (!['accept', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Must be "accept" or "reject"' });
    }

    // Start transaction
    await query('BEGIN');

    try {
      // Get the training session
      const sessionResult = await query(
        `SELECT * FROM training_sessions WHERE id = $1 AND trainer_id = $2 AND status = 'pending'`,
        [id, req.trainer.id]
      );

      if (sessionResult.rows.length === 0) {
        await query('ROLLBACK');
        return res.status(404).json({ error: 'Session request not found or already processed' });
      }

      const session = sessionResult.rows[0];
      const newStatus = action === 'accept' ? 'confirmed' : 'rejected';

      // Update training session status
      const result = await query(
        `UPDATE training_sessions 
         SET status = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2 RETURNING *`,
        [newStatus, id]
      );

      // Update trainer_schedules table
      const dayOfWeek = new Date(session.session_date).getDay();
      if (action === 'accept') {
        // Mark slot as booked
        await query(
          `UPDATE trainer_schedules 
           SET status = 'booked', updated_at = CURRENT_TIMESTAMP
           WHERE trainer_id = $1 AND day_of_week = $2 AND time_slot = $3`,
          [req.trainer.id, dayOfWeek, session.start_time]
        );
      } else {
        // Mark slot as available again
        await query(
          `UPDATE trainer_schedules 
           SET status = 'available', booking_id = NULL, client_id = NULL, session_date = NULL, updated_at = CURRENT_TIMESTAMP
           WHERE trainer_id = $1 AND day_of_week = $2 AND time_slot = $3`,
          [req.trainer.id, dayOfWeek, session.start_time]
        );
      }

      await query('COMMIT');

      res.json({
        success: true,
        message: `Session request ${action}ed successfully`,
        session: result.rows[0]
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

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
router.post('/session-notes/:sessionId', verifyTrainerToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const trainerId = req.trainer.id;
    const { notes } = req.body;

    // Verify the session belongs to this trainer and is confirmed
    const sessionCheck = await query(
      `SELECT id FROM training_sessions 
       WHERE id = $1 AND trainer_id = $2 AND status = 'confirmed'`,
      [sessionId, trainerId]
    );

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not confirmed' });
    }

    // Update the training session with notes
    const result = await query(
      `UPDATE training_sessions 
       SET notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [notes, sessionId]
    );

    res.json({
      success: true,
      message: 'Session notes saved successfully',
      session: result.rows[0]
    });

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
