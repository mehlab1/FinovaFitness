import express from 'express';
import { query } from '../database.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Get session statistics for admin dashboard
router.get('/sessions/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0');
    const currentYear = new Date().getFullYear().toString();

    // Get sessions today
    const sessionsTodayQuery = `
      SELECT COUNT(*) as count 
      FROM training_sessions 
      WHERE DATE(session_date) = $1
    `;
    const sessionsTodayResult = await query(sessionsTodayQuery, [today]);
    const sessionsToday = parseInt(sessionsTodayResult.rows[0]?.count || 0);

    // Get sessions this month
    const sessionsThisMonthQuery = `
      SELECT COUNT(*) as count 
      FROM training_sessions 
      WHERE TO_CHAR(session_date, 'YYYY-MM') = $1
    `;
    const sessionsThisMonthResult = await query(sessionsThisMonthQuery, [currentMonth]);
    const sessionsThisMonth = parseInt(sessionsThisMonthResult.rows[0]?.count || 0);

    // Get sessions this year
    const sessionsThisYearQuery = `
      SELECT COUNT(*) as count 
      FROM training_sessions 
      WHERE EXTRACT(YEAR FROM session_date) = $1
    `;
    const sessionsThisYearResult = await query(sessionsThisYearQuery, [currentYear]);
    const sessionsThisYear = parseInt(sessionsThisYearResult.rows[0]?.count || 0);

    // Get total sessions
    const totalSessionsQuery = `SELECT COUNT(*) as count FROM training_sessions`;
    const totalSessionsResult = await query(totalSessionsQuery);
    const totalSessions = parseInt(totalSessionsResult.rows[0]?.count || 0);

    // Get trainer session breakdown
    const trainerBreakdownQuery = `
      SELECT 
        t.id as trainer_id,
        CONCAT(u.first_name, ' ', u.last_name) as trainer_name,
        COUNT(ts.id) as sessions_count,
        ROUND(
          (COUNT(CASE WHEN ts.status = 'completed' THEN 1 END)::DECIMAL / 
           COUNT(ts.id)::DECIMAL * 100), 2
        ) as completion_rate
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN training_sessions ts ON t.id = ts.trainer_id
      GROUP BY t.id, u.first_name, u.last_name
      ORDER BY sessions_count DESC
    `;
    const trainerBreakdownResult = await query(trainerBreakdownQuery);
    const trainerSessionBreakdown = trainerBreakdownResult.rows.map(row => ({
      trainerId: row.trainer_id,
      trainerName: row.trainer_name,
      sessionsCount: parseInt(row.sessions_count || 0),
      completionRate: parseFloat(row.completion_rate || 0)
    }));

    // Get session type breakdown
    const sessionTypeQuery = `
      SELECT 
        session_type,
        COUNT(*) as count,
        ROUND((COUNT(*)::DECIMAL / (SELECT COUNT(*) FROM training_sessions) * 100), 2) as percentage
      FROM training_sessions
      GROUP BY session_type
      ORDER BY count DESC
    `;
    const sessionTypeResult = await query(sessionTypeQuery);
    const sessionTypeBreakdown = sessionTypeResult.rows.map(row => ({
      type: row.session_type,
      count: parseInt(row.count),
      percentage: parseFloat(row.percentage || 0)
    }));

    // Get recent sessions
    const recentSessionsQuery = `
      SELECT 
        ts.id,
        CONCAT(cu.first_name, ' ', cu.last_name) as client_name,
        CONCAT(tu.first_name, ' ', tu.last_name) as trainer_name,
        ts.session_type,
        ts.session_date,
        ts.start_time,
        ts.end_time,
        ts.status
      FROM training_sessions ts
      JOIN users cu ON ts.client_id = cu.id
      JOIN trainers t ON ts.trainer_id = t.id
      JOIN users tu ON t.user_id = tu.id
      ORDER BY ts.session_date DESC, ts.start_time DESC
      LIMIT 10
    `;
    const recentSessionsResult = await query(recentSessionsQuery);
    const recentSessions = recentSessionsResult.rows.map(row => ({
      id: row.id,
      clientName: row.client_name,
      trainerName: row.trainer_name,
      sessionType: row.session_type,
      sessionDate: row.session_date,
      startTime: row.start_time,
      endTime: row.end_time,
      status: row.status
    }));

    const sessionStats = {
      sessionsToday,
      sessionsThisMonth,
      sessionsThisYear,
      totalSessions,
      trainerSessionBreakdown,
      sessionTypeBreakdown,
      recentSessions
    };

    res.json(sessionStats);
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({ error: 'Failed to fetch session statistics' });
  }
});

export default router;
