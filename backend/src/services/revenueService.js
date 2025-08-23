import { query } from '../config/database.js';

const revenueService = {
  // Record new revenue transaction
  async recordRevenue(revenueData) {
    const result = await query(
      `INSERT INTO gym_revenue 
       (user_id, reference_id, amount, payment_method, revenue_date, notes, created_at, revenue_source, category, net_amount) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'membership_fees', 'one_time', $3) RETURNING id`,
      [
        revenueData.user_id,
        revenueData.membership_plan_id,
        revenueData.amount,
        revenueData.payment_method,
        revenueData.revenue_date,
        revenueData.description,
        revenueData.created_at
      ]
    );
    
    return result.rows[0].id;
  },

  // Get revenue summary for a date range
  async getRevenueSummary(startDate, endDate) {
    const result = await query(
      `SELECT 
        DATE(revenue_date) as date,
        COUNT(*) as total_transactions,
        SUM(amount) as total_revenue,
        payment_method,
        COUNT(*) as method_count
       FROM gym_revenue 
       WHERE revenue_date BETWEEN $1 AND $2
       GROUP BY DATE(revenue_date), payment_method
       ORDER BY date DESC`,
      [startDate, endDate]
    );

    return result.rows;
  },

  // Get revenue breakdown by payment method
  async getRevenueByPaymentMethod(startDate, endDate) {
    const result = await query(
      `SELECT 
        payment_method,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
       FROM gym_revenue 
       WHERE revenue_date BETWEEN $1 AND $2
       GROUP BY payment_method`,
      [startDate, endDate]
    );

    return result.rows;
  },

  // Get today's revenue
  async getTodayRevenue() {
    const today = new Date().toISOString().split('T')[0];
    
    const result = await query(
      `SELECT 
        COUNT(*) as total_transactions,
        SUM(amount) as total_revenue
       FROM gym_revenue 
       WHERE DATE(revenue_date) = $1`,
      [today]
    );

    return result.rows[0] || { total_transactions: 0, total_revenue: 0 };
  },

  // Get recent transactions
  async getRecentTransactions(limit = 10) {
    const result = await query(
      `SELECT 
        gr.*,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as member_name
       FROM gym_revenue gr
       LEFT JOIN users u ON gr.user_id = u.id
       ORDER BY gr.revenue_date DESC
       LIMIT $1`,
      [limit]
    );

    return result.rows;
  }
};

export default revenueService;
