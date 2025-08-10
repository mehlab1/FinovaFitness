import { query } from '../database.js';

// Get trainer dashboard data
export const getDashboard = async (req, res) => {
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
};

// Get trainer schedule
export const getSchedule = async (req, res) => {
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
};

// Get client requests
export const getRequests = async (req, res) => {
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
};

// Update request status
export const updateRequest = async (req, res) => {
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
};

// Get analytics data
export const getAnalytics = async (req, res) => {
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
};
