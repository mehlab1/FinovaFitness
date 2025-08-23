import { query } from '../database.js';

// ==============================================
// TRAINER SUBSCRIPTION CONTROLLER
// ==============================================

/**
 * Get pending subscription requests for a trainer
 */
export const getPendingSubscriptions = async (req, res) => {
  try {
    const trainer_id = req.trainer.id;

    const result = await query(
      `SELECT 
        mps.*,
        tmp.plan_name,
        tmp.monthly_price,
        tmp.sessions_per_month,
        tmp.session_duration,
        tmp.session_type,
        u.first_name as member_first_name,
        u.last_name as member_last_name,
        u.email as member_email,
        u.phone as member_phone,
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - mps.created_at))/3600 as hours_since_request
      FROM monthly_plan_subscriptions mps
      JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
      JOIN users u ON mps.member_id = u.id
      WHERE mps.trainer_id = $1 
        AND mps.status = 'pending'
      ORDER BY mps.created_at ASC`,
      [trainer_id]
    );

    res.status(200).json({
      success: true,
      message: 'Pending subscription requests retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting pending subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving pending subscriptions',
      error: error.message
    });
  }
};

/**
 * Get all subscriptions for a trainer (all statuses)
 */
export const getTrainerSubscriptions = async (req, res) => {
  try {
    const trainer_id = req.trainer.id;
    const { status } = req.query;

    let baseQuery = `
      SELECT 
        mps.*,
        tmp.plan_name,
        tmp.monthly_price,
        tmp.sessions_per_month,
        tmp.session_duration,
        tmp.session_type,
        u.first_name as member_first_name,
        u.last_name as member_last_name,
        u.email as member_email,
        u.phone as member_phone,
        COUNT(mpsa.id) as completed_sessions,
        COUNT(CASE WHEN mpsa.status = 'scheduled' THEN 1 END) as scheduled_sessions
      FROM monthly_plan_subscriptions mps
      JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
      JOIN users u ON mps.member_id = u.id
      LEFT JOIN monthly_plan_session_assignments mpsa ON mps.id = mpsa.subscription_id
      WHERE mps.trainer_id = $1
    `;

    const queryParams = [trainer_id];
    let paramCount = 1;

    if (status) {
      paramCount++;
      baseQuery += ` AND mps.status = $${paramCount}`;
      queryParams.push(status);
    }

    baseQuery += ` GROUP BY mps.id, tmp.id, u.id ORDER BY mps.created_at DESC`;

    const result = await query(baseQuery, queryParams);

    res.status(200).json({
      success: true,
      message: 'Trainer subscriptions retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting trainer subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving trainer subscriptions',
      error: error.message
    });
  }
};

/**
 * Approve a subscription request
 */
export const approveSubscriptionRequest = async (req, res) => {
  try {
    const trainer_id = req.trainer.id;
    const { subscription_id, notes } = req.body;

    // Validate required fields
    if (!subscription_id) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }

    // Check if subscription exists and belongs to trainer
    const subscriptionCheck = await query(
      `SELECT mps.*, tmp.plan_name, u.first_name, u.last_name
       FROM monthly_plan_subscriptions mps
       JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
       JOIN users u ON mps.member_id = u.id
       WHERE mps.id = $1 AND mps.trainer_id = $2 AND mps.status = 'pending'`,
      [subscription_id, trainer_id]
    );

    if (subscriptionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription request not found or already processed'
      });
    }

    const subscription = subscriptionCheck.rows[0];

    // Check if plan still has capacity
    const currentSubscribers = await query(
      `SELECT COUNT(*) as count FROM monthly_plan_subscriptions 
       WHERE plan_id = $1 AND status = 'active'`,
      [subscription.plan_id]
    );

    const planCapacity = await query(
      `SELECT max_subscribers FROM trainer_monthly_plans WHERE id = $1`,
      [subscription.plan_id]
    );

    if (parseInt(currentSubscribers.rows[0].count) >= planCapacity.rows[0].max_subscribers) {
      return res.status(400).json({
        success: false,
        message: 'This plan has reached its maximum capacity'
      });
    }

    // Approve the subscription
    const result = await query(
      `UPDATE monthly_plan_subscriptions 
       SET status = 'active',
           trainer_approval_date = CURRENT_TIMESTAMP,
           trainer_approval_notes = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND trainer_id = $3
       RETURNING *`,
      [notes || 'Approved by trainer', subscription_id, trainer_id]
    );

    const approvedSubscription = result.rows[0];

    res.status(200).json({
      success: true,
      message: `Subscription request from ${subscription.first_name} ${subscription.last_name} approved successfully`,
      data: {
        id: approvedSubscription.id,
        member_name: `${subscription.first_name} ${subscription.last_name}`,
        plan_name: subscription.plan_name,
        status: approvedSubscription.status,
        approval_date: approvedSubscription.trainer_approval_date
      }
    });

  } catch (error) {
    console.error('Error approving subscription request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while approving subscription request',
      error: error.message
    });
  }
};

/**
 * Reject a subscription request
 */
export const rejectSubscriptionRequest = async (req, res) => {
  try {
    const trainer_id = req.trainer.id;
    const { subscription_id, reason } = req.body;

    // Validate required fields
    if (!subscription_id) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }

    // Check if subscription exists and belongs to trainer
    const subscriptionCheck = await query(
      `SELECT mps.*, tmp.plan_name, u.first_name, u.last_name
       FROM monthly_plan_subscriptions mps
       JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
       JOIN users u ON mps.member_id = u.id
       WHERE mps.id = $1 AND mps.trainer_id = $2 AND mps.status = 'pending'`,
      [subscription_id, trainer_id]
    );

    if (subscriptionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription request not found or already processed'
      });
    }

    const subscription = subscriptionCheck.rows[0];

    // Reject the subscription
    const result = await query(
      `UPDATE monthly_plan_subscriptions 
       SET status = 'rejected',
           trainer_rejection_date = CURRENT_TIMESTAMP,
           trainer_rejection_reason = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND trainer_id = $3
       RETURNING *`,
      [reason || 'Rejected by trainer', subscription_id, trainer_id]
    );

    const rejectedSubscription = result.rows[0];

    res.status(200).json({
      success: true,
      message: `Subscription request from ${subscription.first_name} ${subscription.last_name} rejected`,
      data: {
        id: rejectedSubscription.id,
        member_name: `${subscription.first_name} ${subscription.last_name}`,
        plan_name: subscription.plan_name,
        status: rejectedSubscription.status,
        rejection_date: rejectedSubscription.trainer_rejection_date
      }
    });

  } catch (error) {
    console.error('Error rejecting subscription request:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rejecting subscription request',
      error: error.message
    });
  }
};

/**
 * Get subscription statistics for trainer
 */
export const getTrainerSubscriptionStats = async (req, res) => {
  try {
    const trainer_id = req.trainer.id;

    const result = await query(
      `SELECT 
        COUNT(*) as total_subscriptions,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_subscriptions,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_subscriptions,
        COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_subscriptions,
        COUNT(CASE WHEN status = 'expired' THEN 1 END) as expired_subscriptions,
        SUM(CASE WHEN status = 'active' THEN total_paid ELSE 0 END) as total_revenue,
        AVG(CASE WHEN status = 'active' THEN total_paid ELSE NULL END) as avg_revenue_per_subscription
      FROM monthly_plan_subscriptions 
      WHERE trainer_id = $1`,
      [trainer_id]
    );

    // Get recent activity
    const recentActivity = await query(
      `SELECT 
        mps.status,
        mps.created_at,
        tmp.plan_name,
        u.first_name,
        u.last_name
      FROM monthly_plan_subscriptions mps
      JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
      JOIN users u ON mps.member_id = u.id
      WHERE mps.trainer_id = $1
      ORDER BY mps.created_at DESC
      LIMIT 10`,
      [trainer_id]
    );

    const stats = {
      ...result.rows[0],
      recent_activity: recentActivity.rows
    };

    res.status(200).json({
      success: true,
      message: 'Trainer subscription statistics retrieved successfully',
      data: stats
    });

  } catch (error) {
    console.error('Error getting trainer subscription stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving subscription statistics',
      error: error.message
    });
  }
};

/**
 * Get subscription details for trainer
 */
export const getSubscriptionDetails = async (req, res) => {
  try {
    const trainer_id = req.trainer.id;
    const { subscription_id } = req.params;

    const result = await query(
      `SELECT 
        mps.*,
        tmp.plan_name,
        tmp.monthly_price,
        tmp.sessions_per_month,
        tmp.session_duration,
        tmp.session_type,
        tmp.description as plan_description,
        u.first_name as member_first_name,
        u.last_name as member_last_name,
        u.email as member_email,
        u.phone as member_phone,
        COUNT(mpsa.id) as completed_sessions,
        COUNT(CASE WHEN mpsa.status = 'scheduled' THEN 1 END) as scheduled_sessions
      FROM monthly_plan_subscriptions mps
      JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
      JOIN users u ON mps.member_id = u.id
      LEFT JOIN monthly_plan_session_assignments mpsa ON mps.id = mpsa.subscription_id
      WHERE mps.id = $1 AND mps.trainer_id = $2
      GROUP BY mps.id, tmp.id, u.id`,
      [subscription_id, trainer_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    // Get upcoming sessions
    const upcomingSessions = await query(
      `SELECT 
        mpsa.*,
        tms.date,
        tms.start_time,
        tms.end_time
      FROM monthly_plan_session_assignments mpsa
      JOIN trainer_master_slots tms ON mpsa.slot_id = tms.id
      WHERE mpsa.subscription_id = $1 
        AND mpsa.status = 'scheduled'
        AND tms.date >= CURRENT_DATE
      ORDER BY tms.date, tms.start_time
      LIMIT 5`,
      [subscription_id]
    );

    const subscriptionDetails = {
      ...result.rows[0],
      upcoming_sessions: upcomingSessions.rows
    };

    res.status(200).json({
      success: true,
      message: 'Subscription details retrieved successfully',
      data: subscriptionDetails
    });

  } catch (error) {
    console.error('Error getting subscription details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving subscription details',
      error: error.message
    });
  }
};
