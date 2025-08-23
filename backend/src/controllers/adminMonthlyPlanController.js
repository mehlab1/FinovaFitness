import { query } from '../database.js';

// ==============================================
// ADMIN MONTHLY PLAN CONTROLLER
// ==============================================

/**
 * Get all pending monthly plans awaiting admin approval
 */
export const getPendingMonthlyPlans = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        tmp.*,
        t.user_id,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name,
        u.email as trainer_email,
        t.specialization,
        t.certification,
        t.experience_years,
        t.bio,
        t.rating,
        t.total_sessions,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - tmp.created_at))/3600 as hours_since_created
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE tmp.requires_admin_approval = true 
        AND tmp.admin_approved IS NULL
        AND tmp.is_active = true
      ORDER BY tmp.created_at ASC`
    );

    res.status(200).json({
      success: true,
      message: 'Pending monthly plans retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting pending monthly plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving pending monthly plans',
      error: error.message
    });
  }
};

/**
 * Approve a monthly plan
 */
export const approveMonthlyPlan = async (req, res) => {
  try {
    const { plan_id } = req.params;
    const { admin_id, comments } = req.body;

    // Validate required fields
    if (!plan_id || !admin_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: plan_id and admin_id'
      });
    }

    // Check if plan exists and is pending approval
    const existingPlan = await query(
      `SELECT 
        tmp.*,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE tmp.id = $1`,
      [plan_id]
    );

    if (existingPlan.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monthly plan not found'
      });
    }

    const plan = existingPlan.rows[0];

    if (plan.admin_approved !== null) {
      return res.status(400).json({
        success: false,
        message: `Plan has already been ${plan.admin_approved ? 'approved' : 'rejected'}`
      });
    }

    // Approve the plan
    const result = await query(
      `UPDATE trainer_monthly_plans 
       SET admin_approved = true,
           admin_approval_date = CURRENT_TIMESTAMP,
           admin_approval_notes = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [comments || null, plan_id]
    );

    const updatedPlan = result.rows[0];

    res.status(200).json({
      success: true,
      message: `Monthly plan "${plan.plan_name}" by ${plan.trainer_first_name} ${plan.trainer_last_name} approved successfully`,
      data: {
        id: updatedPlan.id,
        plan_name: updatedPlan.plan_name,
        trainer_name: `${plan.trainer_first_name} ${plan.trainer_last_name}`,
        admin_approved: updatedPlan.admin_approved,
        admin_approval_date: updatedPlan.admin_approval_date,
        admin_approval_notes: updatedPlan.admin_approval_notes
      }
    });

  } catch (error) {
    console.error('Error approving monthly plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while approving monthly plan',
      error: error.message
    });
  }
};

/**
 * Reject a monthly plan
 */
export const rejectMonthlyPlan = async (req, res) => {
  try {
    const { plan_id } = req.params;
    const { admin_id, comments } = req.body;

    // Validate required fields
    if (!plan_id || !admin_id) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: plan_id and admin_id'
      });
    }

    // Check if plan exists and is pending approval
    const existingPlan = await query(
      `SELECT 
        tmp.*,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE tmp.id = $1`,
      [plan_id]
    );

    if (existingPlan.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monthly plan not found'
      });
    }

    const plan = existingPlan.rows[0];

    if (plan.admin_approved !== null) {
      return res.status(400).json({
        success: false,
        message: `Plan has already been ${plan.admin_approved ? 'approved' : 'rejected'}`
      });
    }

    // Reject the plan
    const result = await query(
      `UPDATE trainer_monthly_plans 
       SET admin_approved = false,
           admin_approval_date = CURRENT_TIMESTAMP,
           admin_approval_notes = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [comments || null, plan_id]
    );

    const updatedPlan = result.rows[0];

    res.status(200).json({
      success: true,
      message: `Monthly plan "${plan.plan_name}" by ${plan.trainer_first_name} ${plan.trainer_last_name} rejected`,
      data: {
        id: updatedPlan.id,
        plan_name: updatedPlan.plan_name,
        trainer_name: `${plan.trainer_first_name} ${plan.trainer_last_name}`,
        admin_approved: updatedPlan.admin_approved,
        admin_approval_date: updatedPlan.admin_approval_date,
        admin_approval_notes: updatedPlan.admin_approval_notes
      }
    });

  } catch (error) {
    console.error('Error rejecting monthly plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting monthly plan',
      error: error.message
    });
  }
};

/**
 * Get all approved monthly plans (for admin overview)
 */
export const getApprovedMonthlyPlans = async (req, res) => {
  try {
    const result = await query(
      `SELECT 
        tmp.*,
        t.user_id,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name,
        u.email as trainer_email,
        t.specialization,
        t.certification,
        t.experience_years,
        t.bio,
        t.rating,
        t.total_sessions,
        COALESCE(subscription_count.count, 0) as active_subscriptions
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN (
        SELECT plan_id, COUNT(*) as count 
        FROM monthly_plan_subscriptions 
        WHERE status = 'active' 
        GROUP BY plan_id
      ) subscription_count ON tmp.id = subscription_count.plan_id
      WHERE tmp.admin_approved = true 
        AND tmp.is_active = true
      ORDER BY tmp.admin_approval_date DESC`
    );

    res.status(200).json({
      success: true,
      message: 'Approved monthly plans retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting approved monthly plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving approved monthly plans',
      error: error.message
    });
  }
};

/**
 * Get monthly plan statistics for admin dashboard
 */
export const getMonthlyPlanStats = async (req, res) => {
  try {
    // Get total plans
    const totalPlans = await query(
      'SELECT COUNT(*) as count FROM trainer_monthly_plans WHERE is_active = true'
    );

    // Get pending plans
    const pendingPlans = await query(
      `SELECT COUNT(*) as count 
       FROM trainer_monthly_plans 
       WHERE requires_admin_approval = true 
         AND admin_approved IS NULL 
         AND is_active = true`
    );

    // Get approved plans
    const approvedPlans = await query(
      `SELECT COUNT(*) as count 
       FROM trainer_monthly_plans 
       WHERE admin_approved = true 
         AND is_active = true`
    );

    // Get rejected plans
    const rejectedPlans = await query(
      `SELECT COUNT(*) as count 
       FROM trainer_monthly_plans 
       WHERE admin_approved = false 
         AND is_active = true`
    );

    // Get active subscriptions
    const activeSubscriptions = await query(
      `SELECT COUNT(*) as count 
       FROM monthly_plan_subscriptions 
       WHERE status = 'active'`
    );

    // Get total revenue from monthly plans
    const totalRevenue = await query(
      `SELECT COALESCE(SUM(total_paid), 0) as total 
       FROM monthly_plan_subscriptions 
       WHERE status = 'active'`
    );

    // Get plans by trainer
    const plansByTrainer = await query(
      `SELECT 
        t.id as trainer_id,
        CONCAT(u.first_name, ' ', u.last_name) as trainer_name,
        COUNT(tmp.id) as total_plans,
        COUNT(CASE WHEN tmp.admin_approved = true THEN 1 END) as approved_plans,
        COUNT(CASE WHEN tmp.admin_approved = false THEN 1 END) as rejected_plans,
        COUNT(CASE WHEN tmp.admin_approved IS NULL THEN 1 END) as pending_plans
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN trainer_monthly_plans tmp ON t.id = tmp.trainer_id AND tmp.is_active = true
      GROUP BY t.id, u.first_name, u.last_name
      HAVING COUNT(tmp.id) > 0
      ORDER BY total_plans DESC`
    );

    // Get recent activity
    const recentActivity = await query(
      `SELECT 
        tmp.id,
        tmp.plan_name,
        tmp.admin_approved,
        tmp.admin_approval_date,
        tmp.admin_approval_notes,
        CONCAT(u.first_name, ' ', u.last_name) as trainer_name
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE tmp.admin_approval_date IS NOT NULL
      ORDER BY tmp.admin_approval_date DESC
      LIMIT 10`
    );

    const stats = {
      totalPlans: parseInt(totalPlans.rows[0]?.count || 0),
      pendingPlans: parseInt(pendingPlans.rows[0]?.count || 0),
      approvedPlans: parseInt(approvedPlans.rows[0]?.count || 0),
      rejectedPlans: parseInt(rejectedPlans.rows[0]?.count || 0),
      activeSubscriptions: parseInt(activeSubscriptions.rows[0]?.count || 0),
      totalRevenue: parseFloat(totalRevenue.rows[0]?.total || 0),
      plansByTrainer: plansByTrainer.rows,
      recentActivity: recentActivity.rows
    };

    res.status(200).json({
      success: true,
      message: 'Monthly plan statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error getting monthly plan stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving monthly plan statistics',
      error: error.message
    });
  }
};

/**
 * Get detailed view of a specific monthly plan
 */
export const getMonthlyPlanDetails = async (req, res) => {
  try {
    const { plan_id } = req.params;

    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    const result = await query(
      `SELECT 
        tmp.*,
        t.user_id,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name,
        u.email as trainer_email,
        t.specialization,
        t.certification,
        t.experience_years,
        t.bio,
        t.rating,
        t.total_sessions,
        COALESCE(subscription_count.count, 0) as active_subscriptions,
        COALESCE(total_revenue.total, 0) as total_revenue
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN (
        SELECT plan_id, COUNT(*) as count 
        FROM monthly_plan_subscriptions 
        WHERE status = 'active' 
        GROUP BY plan_id
      ) subscription_count ON tmp.id = subscription_count.plan_id
      LEFT JOIN (
        SELECT plan_id, SUM(total_paid) as total 
        FROM monthly_plan_subscriptions 
        WHERE status = 'active' 
        GROUP BY plan_id
      ) total_revenue ON tmp.id = total_revenue.plan_id
      WHERE tmp.id = $1`,
      [plan_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monthly plan not found'
      });
    }

    // Get active subscriptions for this plan
    const subscriptions = await query(
      `SELECT 
        mps.*,
        CONCAT(u.first_name, ' ', u.last_name) as member_name,
        u.email as member_email
      FROM monthly_plan_subscriptions mps
      JOIN users u ON mps.member_id = u.id
      WHERE mps.plan_id = $1 AND mps.status = 'active'
      ORDER BY mps.created_at DESC`,
      [plan_id]
    );

    const planDetails = {
      ...result.rows[0],
      subscriptions: subscriptions.rows
    };

    res.status(200).json({
      success: true,
      message: 'Monthly plan details retrieved successfully',
      data: planDetails
    });

  } catch (error) {
    console.error('Error getting monthly plan details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving monthly plan details',
      error: error.message
    });
  }
};
