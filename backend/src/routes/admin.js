import express from 'express';
import { query, getClient } from '../database.js';
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
    let trainerSessionBreakdown = [];
    try {
      const trainerBreakdownQuery = `
        SELECT 
          t.id as trainer_id,
          CONCAT(u.first_name, ' ', u.last_name) as trainer_name,
          COUNT(ts.id) as sessions_count,
          CASE 
            WHEN COUNT(ts.id) = 0 THEN 0
            ELSE ROUND(
              (COUNT(CASE WHEN ts.status = 'completed' THEN 1 END)::DECIMAL / 
               COUNT(ts.id)::DECIMAL * 100), 2
            )
          END as completion_rate
        FROM trainers t
        JOIN users u ON t.user_id = u.id
        LEFT JOIN training_sessions ts ON t.id = ts.trainer_id
        GROUP BY t.id, u.first_name, u.last_name
        ORDER BY sessions_count DESC
      `;
      const trainerBreakdownResult = await query(trainerBreakdownQuery);
      trainerSessionBreakdown = trainerBreakdownResult.rows.map(row => ({
        trainerId: row.trainer_id,
        trainerName: row.trainer_name,
        sessionsCount: parseInt(row.sessions_count || 0),
        completionRate: parseFloat(row.completion_rate || 0)
      }));
    } catch (error) {
      console.log('Error getting trainer breakdown:', error.message);
      trainerSessionBreakdown = [];
    }

    // Get session type breakdown
    let sessionTypeBreakdown = [];
    if (totalSessions > 0) {
      try {
        const sessionTypeQuery = `
          SELECT 
            session_type,
            COUNT(*) as count,
            ROUND((COUNT(*)::DECIMAL / $1 * 100), 2) as percentage
          FROM training_sessions
          GROUP BY session_type
          ORDER BY count DESC
        `;
        const sessionTypeResult = await query(sessionTypeQuery, [totalSessions]);
        sessionTypeBreakdown = sessionTypeResult.rows.map(row => ({
          type: row.session_type,
          count: parseInt(row.count),
          percentage: parseFloat(row.percentage || 0)
        }));
      } catch (error) {
        console.log('Error getting session type breakdown:', error.message);
        sessionTypeBreakdown = [];
      }
    }

    // Get recent sessions
    let recentSessions = [];
    if (totalSessions > 0) {
      try {
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
          LEFT JOIN users cu ON ts.client_id = cu.id
          LEFT JOIN trainers t ON ts.trainer_id = t.id
          LEFT JOIN users tu ON t.user_id = tu.id
          ORDER BY ts.session_date DESC, ts.start_time DESC
          LIMIT 10
        `;
        const recentSessionsResult = await query(recentSessionsQuery);
        recentSessions = recentSessionsResult.rows.map(row => ({
          id: row.id,
          clientName: row.client_name,
          trainerName: row.trainer_name,
          sessionType: row.session_type,
          sessionDate: row.session_date,
          startTime: row.start_time,
          endTime: row.end_time,
          status: row.status
        }));
      } catch (error) {
        console.log('Error getting recent sessions:', error.message);
        recentSessions = [];
      }
    }

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

// Revenue Management Routes
router.get('/revenue/stats', verifyToken, requireAdmin, async (req, res) => {
  try {
    const client = await getClient();
    
    // First check if gym_revenue table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'gym_revenue'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      // Table doesn't exist, return empty stats
      client.release();
      return res.json({
        todayRevenue: 0,
        todayTransactions: 0,
        monthRevenue: 0,
        monthTransactions: 0,
        yearRevenue: 0,
        yearTransactions: 0,
        revenueBreakdown: {
          membership_fees: 0,
          personal_training: 0,
          group_classes: 0,
          other: 0
        },
        recentTransactions: []
      });
    }
    
    // Get today's revenue
    const todayRevenue = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(*) as total_transactions
      FROM gym_revenue 
      WHERE revenue_date = CURRENT_DATE 
      AND transaction_status = 'completed'
    `);
    
    // Get this month's revenue
    const monthRevenue = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(*) as total_transactions
      FROM gym_revenue 
      WHERE revenue_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND transaction_status = 'completed'
    `);
    
    // Get this year's revenue
    const yearRevenue = await client.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_revenue,
        COUNT(*) as total_transactions
      FROM gym_revenue 
      WHERE revenue_date >= DATE_TRUNC('year', CURRENT_DATE)
      AND transaction_status = 'completed'
    `);
    
    // Get revenue breakdown by source
    const revenueBreakdown = await client.query(`
      SELECT 
        revenue_source,
        COALESCE(SUM(amount), 0) as total_amount
      FROM gym_revenue 
      WHERE revenue_date >= DATE_TRUNC('month', CURRENT_DATE)
      AND transaction_status = 'completed'
      GROUP BY revenue_source
    `);
    
    // Get recent transactions
    const recentTransactions = await client.query(`
      SELECT 
        id,
        revenue_date,
        revenue_source,
        amount,
        payment_method,
        user_id,
        notes,
        transaction_status
      FROM gym_revenue 
      WHERE transaction_status = 'completed'
      ORDER BY revenue_date DESC, created_at DESC
      LIMIT 10
    `);
    
    // Format revenue breakdown
    const breakdown = {
      membership_fees: 0,
      personal_training: 0,
      group_classes: 0,
      other: 0
    };
    
    revenueBreakdown.rows.forEach(row => {
      if (row.revenue_source in breakdown) {
        breakdown[row.revenue_source] = parseFloat(row.total_amount);
      } else {
        breakdown.other += parseFloat(row.total_amount);
      }
    });
    
    const stats = {
      todayRevenue: parseFloat(todayRevenue.rows[0]?.total_revenue || 0),
      todayTransactions: parseInt(todayRevenue.rows[0]?.total_transactions || 0),
      monthRevenue: parseFloat(monthRevenue.rows[0]?.total_revenue || 0),
      monthTransactions: parseInt(monthRevenue.rows[0]?.total_transactions || 0),
      yearRevenue: parseFloat(yearRevenue.rows[0]?.total_revenue || 0),
      yearTransactions: parseInt(yearRevenue.rows[0]?.total_transactions || 0),
      revenueBreakdown: breakdown,
      recentTransactions: recentTransactions.rows.map(row => ({
        id: row.id,
        revenue_date: row.revenue_date,
        revenue_source: row.revenue_source,
        amount: parseFloat(row.amount),
        payment_method: row.payment_method,
        user_id: row.user_id,
        notes: row.notes
      }))
    };
    
    client.release();
    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching revenue stats:', error);
    
    // Try to release client if it exists
    try {
      if (client) client.release();
    } catch (releaseError) {
      console.error('Error releasing client:', releaseError);
    }
    
    // Return empty stats instead of 500 error
    res.json({
      todayRevenue: 0,
      todayTransactions: 0,
      monthRevenue: 0,
      monthTransactions: 0,
      yearRevenue: 0,
      yearTransactions: 0,
      revenueBreakdown: {
        membership_fees: 0,
        personal_training: 0,
        group_classes: 0,
        other: 0
      },
      recentTransactions: []
    });
  }
});

router.get('/revenue/details', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { period, startDate, endDate } = req.query;
    const client = await getClient();
    
    // First check if gym_revenue table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'gym_revenue'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      // Table doesn't exist, return empty array
      client.release();
      return res.json([]);
    }
    
    let query = '';
    let params = [];
    
    if (period === 'daily') {
      query = `
        SELECT 
          id,
          revenue_date,
          revenue_source,
          amount,
          payment_method,
          transaction_status,
          notes,
          user_id,
          trainer_id
        FROM gym_revenue 
        WHERE revenue_date BETWEEN $1 AND $2
        AND transaction_status = 'completed'
        ORDER BY revenue_date DESC, created_at DESC
      `;
      params = [startDate, endDate];
    } else if (period === 'monthly') {
      query = `
        SELECT 
          DATE_TRUNC('month', revenue_date) as month,
          revenue_source,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount
        FROM gym_revenue 
        WHERE revenue_date BETWEEN $1 AND $2
        AND transaction_status = 'completed'
        GROUP BY DATE_TRUNC('month', revenue_date), revenue_source
        ORDER BY month DESC, total_amount DESC
      `;
      params = [startDate, endDate];
    } else if (period === 'yearly') {
      query = `
        SELECT 
          DATE_TRUNC('year', revenue_date) as year,
          revenue_source,
          COUNT(*) as transaction_count,
          SUM(amount) as total_amount
        FROM gym_revenue 
        WHERE revenue_date BETWEEN $1 AND $2
        AND transaction_status = 'completed'
        GROUP BY DATE_TRUNC('year', revenue_date), revenue_source
        ORDER BY year DESC, total_amount DESC
      `;
      params = [startDate, endDate];
    }
    
    if (!query) {
      client.release();
      return res.status(400).json({ error: 'Invalid period specified' });
    }
    
    const result = await client.query(query, params);
    client.release();
    
    res.json(result.rows);
    
  } catch (error) {
    console.error('Error fetching revenue details:', error);
    
    // Try to release client if it exists
    try {
      if (client) client.release();
    } catch (releaseError) {
      console.error('Error releasing client:', releaseError);
    }
    
    // Return empty array instead of 500 error
    res.json([]);
  }
});

// Create new member with membership plan (admin only)
router.post('/create-member', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, membership_plan_id } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Missing required fields: email, password, first_name, and last_name are required' });
    }

    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate membership plan if provided
    let membershipType = null;
    let membershipStartDate = null;
    let membershipEndDate = null;
    let selectedPlanId = null;

    if (membership_plan_id) {
      const planResult = await query(
        'SELECT id, name, duration_months, price FROM membership_plans WHERE id = $1 AND is_active = true',
        [membership_plan_id]
      );

      if (planResult.rows.length === 0) {
        return res.status(400).json({ error: 'Invalid or inactive membership plan selected' });
      }

      const plan = planResult.rows[0];
      membershipType = plan.name;
      membershipStartDate = new Date();
      membershipEndDate = new Date();
      membershipEndDate.setMonth(membershipEndDate.getMonth() + plan.duration_months);
      selectedPlanId = plan.id;
    } else {
      // Default membership for members without plan selection
      membershipType = 'basic';
      membershipStartDate = new Date();
      membershipEndDate = new Date();
      membershipEndDate.setMonth(membershipEndDate.getMonth() + 1); // 1 month default
    }

    // Hash password
    const bcrypt = await import('bcryptjs');
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Start transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Insert new user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, membership_type, membership_start_date, membership_end_date, subscription_status, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id, email, first_name, last_name, role, membership_type, membership_start_date, membership_end_date, subscription_status`,
        [
          email,
          password_hash,
          first_name,
          last_name,
          'member',
          phone || null,
          membershipType,
          membershipStartDate,
          membershipEndDate,
          'active',
          true
        ]
      );

      const user = result.rows[0];

      // Create member profile
      await client.query(
        `INSERT INTO member_profiles (user_id, current_plan_id, loyalty_points, streak_days, subscription_status)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, selectedPlanId, 0, 0, 'active']
      );

      // Commit transaction
      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Member created successfully',
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          membership_type: user.membership_type,
          membership_start_date: user.membership_start_date,
          membership_end_date: user.membership_end_date,
          subscription_status: user.subscription_status
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Admin create member error:', error);
    res.status(500).json({ error: 'Failed to create member: ' + error.message });
  }
});

export default router;
