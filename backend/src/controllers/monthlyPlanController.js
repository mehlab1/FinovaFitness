import { query } from '../database.js';

// ==============================================
// MONTHLY PLAN CONTROLLER
// ==============================================

/**
 * Create a new monthly plan for a trainer
 */
export const createMonthlyPlan = async (req, res) => {
  try {
    const {
      trainer_id, // This will actually be user_id from frontend
      plan_name,
      monthly_price,
      sessions_per_month,
      session_duration = 60,
      session_type = 'personal',
      max_subscribers = 1,
      description
    } = req.body;

    // Validate required fields
    if (!trainer_id || !plan_name || !monthly_price || !sessions_per_month) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: trainer_id, plan_name, monthly_price, sessions_per_month'
      });
    }

    // Validate numeric values
    if (monthly_price <= 0 || sessions_per_month <= 0 || session_duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid numeric values: monthly_price, sessions_per_month, and session_duration must be greater than 0'
      });
    }

    // Validate session type
    if (!['personal', 'group'].includes(session_type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid session_type. Must be either "personal" or "group"'
      });
    }

    // First, get the trainer ID from the user ID
    const trainerCheck = await query(
      'SELECT t.id as trainer_id FROM trainers t WHERE t.user_id = $1',
      [trainer_id]
    );

    if (trainerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found for this user'
      });
    }

    const actualTrainerId = trainerCheck.rows[0].trainer_id;

    // Check if plan name already exists for this trainer
    const existingPlan = await query(
      'SELECT id FROM trainer_monthly_plans WHERE trainer_id = $1 AND plan_name = $2',
      [actualTrainerId, plan_name]
    );

    if (existingPlan.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A plan with this name already exists for this trainer'
      });
    }

    // Create the monthly plan
    const result = await query(
      `INSERT INTO trainer_monthly_plans (
        trainer_id, plan_name, monthly_price, sessions_per_month,
        session_duration, session_type, max_subscribers, description,
        requires_admin_approval, admin_approved
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        actualTrainerId,
        plan_name,
        monthly_price,
        sessions_per_month,
        session_duration,
        session_type,
        max_subscribers,
        description || null,
        true, // requires_admin_approval
        null // admin_approved - NULL means pending approval
      ]
    );

    const newPlan = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Monthly plan created successfully. Pending admin approval.',
      data: {
        id: newPlan.id,
        trainer_id: newPlan.trainer_id,
        plan_name: newPlan.plan_name,
        monthly_price: newPlan.monthly_price,
        sessions_per_month: newPlan.sessions_per_month,
        session_duration: newPlan.session_duration,
        session_type: newPlan.session_type,
        max_subscribers: newPlan.max_subscribers,
        description: newPlan.description,
        is_active: newPlan.is_active,
        requires_admin_approval: newPlan.requires_admin_approval,
        admin_approved: newPlan.admin_approved,
        created_at: newPlan.created_at
      }
    });

  } catch (error) {
    console.error('Error creating monthly plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating monthly plan',
      error: error.message
    });
  }
};

/**
 * Get all monthly plans for a trainer
 */
export const getTrainerMonthlyPlans = async (req, res) => {
  try {
    const { trainer_id } = req.params; // This will actually be user_id from frontend

    // Validate trainer_id
    if (!trainer_id) {
      return res.status(400).json({
        success: false,
        message: 'Trainer ID is required'
      });
    }

    // First, get the trainer ID from the user ID
    const trainerCheck = await query(
      'SELECT t.id as trainer_id FROM trainers t WHERE t.user_id = $1',
      [trainer_id]
    );

    if (trainerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found for this user'
      });
    }

    const actualTrainerId = trainerCheck.rows[0].trainer_id;

    // Get all plans for the trainer
    const result = await query(
      `SELECT 
        tmp.*,
        t.user_id,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE tmp.trainer_id = $1
      ORDER BY tmp.created_at DESC`,
      [actualTrainerId]
    );

    res.status(200).json({
      success: true,
      message: 'Monthly plans retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting trainer monthly plans:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving monthly plans',
      error: error.message
    });
  }
};

/**
 * Get all approved monthly plans (for members to browse)
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
        t.total_sessions
      FROM trainer_monthly_plans tmp
      JOIN trainers t ON tmp.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE tmp.is_active = true 
        AND tmp.admin_approved = true
        AND tmp.requires_admin_approval = false
      ORDER BY tmp.created_at DESC`
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
 * Update a monthly plan
 */
export const updateMonthlyPlan = async (req, res) => {
  try {
    const { plan_id } = req.params;
    const {
      plan_name,
      monthly_price,
      sessions_per_month,
      session_duration,
      session_type,
      max_subscribers,
      description,
      is_active
    } = req.body;

    // Check if plan exists
    const existingPlan = await query(
      'SELECT * FROM trainer_monthly_plans WHERE id = $1',
      [plan_id]
    );

    if (existingPlan.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monthly plan not found'
      });
    }

    const plan = existingPlan.rows[0];

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (plan_name !== undefined) {
      updateFields.push(`plan_name = $${paramCount++}`);
      updateValues.push(plan_name);
    }

    if (monthly_price !== undefined) {
      updateFields.push(`monthly_price = $${paramCount++}`);
      updateValues.push(monthly_price);
    }

    if (sessions_per_month !== undefined) {
      updateFields.push(`sessions_per_month = $${paramCount++}`);
      updateValues.push(sessions_per_month);
    }

    if (session_duration !== undefined) {
      updateFields.push(`session_duration = $${paramCount++}`);
      updateValues.push(session_duration);
    }

    if (session_type !== undefined) {
      updateFields.push(`session_type = $${paramCount++}`);
      updateValues.push(session_type);
    }

    if (max_subscribers !== undefined) {
      updateFields.push(`max_subscribers = $${paramCount++}`);
      updateValues.push(max_subscribers);
    }

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount++}`);
      updateValues.push(description);
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(plan_id);

    const result = await query(
      `UPDATE trainer_monthly_plans 
       SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    const updatedPlan = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Monthly plan updated successfully',
      data: updatedPlan
    });

  } catch (error) {
    console.error('Error updating monthly plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating monthly plan',
      error: error.message
    });
  }
};

/**
 * Delete a monthly plan
 */
export const deleteMonthlyPlan = async (req, res) => {
  try {
    const { plan_id } = req.params;

    // Check if plan exists
    const existingPlan = await query(
      'SELECT * FROM trainer_monthly_plans WHERE id = $1',
      [plan_id]
    );

    if (existingPlan.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monthly plan not found'
      });
    }

    // Check if there are active subscriptions for this plan
    const activeSubscriptions = await query(
      'SELECT COUNT(*) as count FROM monthly_plan_subscriptions WHERE plan_id = $1 AND status = $2',
      [plan_id, 'active']
    );

    if (parseInt(activeSubscriptions.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete plan with active subscriptions. Please cancel all subscriptions first.'
      });
    }

    // Delete the plan
    await query(
      'DELETE FROM trainer_monthly_plans WHERE id = $1',
      [plan_id]
    );

    res.status(200).json({
      success: true,
      message: 'Monthly plan deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting monthly plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting monthly plan',
      error: error.message
    });
  }
};

/**
 * Debug endpoint to check trainers in database
 */
export const debugTrainers = async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        t.id as trainer_id,
        t.user_id,
        u.first_name,
        u.last_name,
        u.email,
        u.role
      FROM trainers t
      JOIN users u ON t.user_id = u.id
      ORDER BY t.id
    `);

    res.status(200).json({
      success: true,
      message: 'Trainers retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting trainers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving trainers',
      error: error.message
    });
  }
};
