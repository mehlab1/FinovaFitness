import { query } from '../database.js';

// ==============================================
// MEMBER MONTHLY PLAN CONTROLLER
// ==============================================

/**
 * Get all available (approved) monthly plans for members to browse
 */
export const getAvailableMonthlyPlans = async (req, res) => {
  try {
    const { member_id } = req.params;
    const { trainer_name, price_min, price_max, session_type } = req.query;

    // Build the base query
    let baseQuery = `
      SELECT 
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
        CASE 
          WHEN mps.id IS NOT NULL THEN true 
          ELSE false 
        END as is_subscribed
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN (
        SELECT plan_id, COUNT(*) as count 
        FROM monthly_plan_subscriptions 
        WHERE status = 'active' 
        GROUP BY plan_id
      ) subscription_count ON tmp.id = subscription_count.plan_id
      LEFT JOIN monthly_plan_subscriptions mps ON tmp.id = mps.plan_id 
        AND mps.member_id = $1 
        AND mps.status = 'active'
      WHERE tmp.is_active = true 
        AND tmp.admin_approved = true
    `;

    const queryParams = [member_id];
    let paramCount = 1;

    // Add filters
    if (trainer_name) {
      paramCount++;
      baseQuery += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
      queryParams.push(`%${trainer_name}%`);
    }

    if (price_min) {
      paramCount++;
      baseQuery += ` AND tmp.monthly_price >= $${paramCount}`;
      queryParams.push(parseFloat(price_min));
    }

    if (price_max) {
      paramCount++;
      baseQuery += ` AND tmp.monthly_price <= $${paramCount}`;
      queryParams.push(parseFloat(price_max));
    }

    if (session_type) {
      paramCount++;
      baseQuery += ` AND tmp.session_type = $${paramCount}`;
      queryParams.push(session_type);
    }

    baseQuery += ` ORDER BY tmp.created_at DESC`;

    const result = await query(baseQuery, queryParams);

    res.status(200).json({
      success: true,
      message: 'Available monthly plans retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting available monthly plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving available monthly plans',
      error: error.message
    });
  }
};

/**
 * Request subscription to a monthly plan
 */
export const requestSubscription = async (req, res) => {
  try {
    const { member_id } = req.params;
    const { plan_id } = req.body;

    // Validate required fields
    if (!plan_id) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID is required'
      });
    }

    // Check if plan exists and is approved
    const planCheck = await query(
      `SELECT tmp.*, u.first_name, u.last_name
       FROM trainer_monthly_plans tmp
       JOIN trainers t ON tmp.trainer_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE tmp.id = $1 AND tmp.is_active = true AND tmp.admin_approved = true`,
      [plan_id]
    );

    if (planCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or not approved'
      });
    }

    const plan = planCheck.rows[0];

    // Check if member already has an active subscription to this plan
    const existingSubscription = await query(
      `SELECT id FROM monthly_plan_subscriptions 
       WHERE member_id = $1 AND plan_id = $2 AND status = 'active'`,
      [member_id, plan_id]
    );

    if (existingSubscription.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active subscription to this plan'
      });
    }

    // Check if plan has reached maximum subscribers
    const currentSubscribers = await query(
      `SELECT COUNT(*) as count FROM monthly_plan_subscriptions 
       WHERE plan_id = $1 AND status = 'active'`,
      [plan_id]
    );

    if (parseInt(currentSubscribers.rows[0].count) >= plan.max_subscribers) {
      return res.status(400).json({
        success: false,
        message: 'This plan has reached its maximum number of subscribers'
      });
    }

    // Create subscription request
    const subscriptionStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    const result = await query(
      `INSERT INTO monthly_plan_subscriptions (
        member_id, trainer_id, plan_id, subscription_start_date,
        subscription_end_date, auto_renewal, status, sessions_remaining,
        total_paid, payment_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        member_id,
        plan.trainer_id,
        plan_id,
        subscriptionStartDate,
        subscriptionEndDate,
        false, // auto_renewal
        'pending', // status - will be approved by trainer
        plan.sessions_per_month,
        plan.monthly_price,
        new Date()
      ]
    );

    const newSubscription = result.rows[0];

    res.status(201).json({
      success: true,
      message: `Subscription request sent to ${plan.first_name} ${plan.last_name}. Awaiting trainer approval.`,
      data: {
        id: newSubscription.id,
        plan_name: plan.plan_name,
        trainer_name: `${plan.first_name} ${plan.last_name}`,
        monthly_price: plan.monthly_price,
        sessions_per_month: plan.sessions_per_month,
        status: newSubscription.status,
        subscription_start_date: newSubscription.subscription_start_date
      }
    });

  } catch (error) {
    console.error('Error requesting subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while requesting subscription',
      error: error.message
    });
  }
};

/**
 * Get member's active subscriptions
 */
export const getMemberSubscriptions = async (req, res) => {
  try {
    const { member_id } = req.params;

    const result = await query(
      `SELECT 
        mps.*,
        tmp.plan_name,
        tmp.monthly_price,
        tmp.sessions_per_month,
        tmp.session_duration,
        tmp.session_type,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name,
        u.email as trainer_email,
        t.specialization,
        t.rating
      FROM monthly_plan_subscriptions mps
      JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
      JOIN trainers t ON mps.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE mps.member_id = $1
      ORDER BY mps.created_at DESC`,
      [member_id]
    );

    res.status(200).json({
      success: true,
      message: 'Member subscriptions retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting member subscriptions:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving member subscriptions',
      error: error.message
    });
  }
};

/**
 * Cancel a subscription
 */
export const cancelSubscription = async (req, res) => {
  try {
    const { member_id } = req.params;
    const { subscription_id, reason } = req.body;

    // Validate required fields
    if (!subscription_id) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }

    // Check if subscription exists and belongs to member
    const subscriptionCheck = await query(
      `SELECT mps.*, tmp.plan_name, u.first_name, u.last_name
       FROM monthly_plan_subscriptions mps
       JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
       JOIN trainers t ON mps.trainer_id = t.id
       JOIN users u ON t.user_id = u.id
       WHERE mps.id = $1 AND mps.member_id = $2`,
      [subscription_id, member_id]
    );

    if (subscriptionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    const subscription = subscriptionCheck.rows[0];

    if (subscription.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Subscription is already cancelled'
      });
    }

    // Cancel the subscription
    const result = await query(
      `UPDATE monthly_plan_subscriptions 
       SET status = 'cancelled',
           cancellation_date = CURRENT_TIMESTAMP,
           cancellation_reason = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND member_id = $3
       RETURNING *`,
      [reason || 'Cancelled by member', subscription_id, member_id]
    );

    const cancelledSubscription = result.rows[0];

    res.status(200).json({
      success: true,
      message: `Subscription to "${subscription.plan_name}" cancelled successfully`,
      data: {
        id: cancelledSubscription.id,
        plan_name: subscription.plan_name,
        trainer_name: `${subscription.first_name} ${subscription.last_name}`,
        status: cancelledSubscription.status,
        cancellation_date: cancelledSubscription.cancellation_date
      }
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while cancelling subscription',
      error: error.message
    });
  }
};

/**
 * Get subscription details
 */
export const getSubscriptionDetails = async (req, res) => {
  try {
    const { member_id, subscription_id } = req.params;

    const result = await query(
      `SELECT 
        mps.*,
        tmp.plan_name,
        tmp.monthly_price,
        tmp.sessions_per_month,
        tmp.session_duration,
        tmp.session_type,
        tmp.description as plan_description,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name,
        u.email as trainer_email,
        t.specialization,
        t.bio,
        t.rating,
        t.experience_years,
        COUNT(mpsa.id) as completed_sessions,
        COUNT(CASE WHEN mpsa.status = 'scheduled' THEN 1 END) as scheduled_sessions
      FROM monthly_plan_subscriptions mps
      JOIN trainer_monthly_plans tmp ON mps.plan_id = tmp.id
      JOIN trainers t ON mps.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      LEFT JOIN monthly_plan_session_assignments mpsa ON mps.id = mpsa.subscription_id
      WHERE mps.id = $1 AND mps.member_id = $2
      GROUP BY mps.id, tmp.id, t.id, u.id`,
      [subscription_id, member_id]
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
