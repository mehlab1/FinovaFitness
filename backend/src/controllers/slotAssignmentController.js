import { query } from '../database.js';

// ==============================================
// SLOT ASSIGNMENT CONTROLLER
// ==============================================

/**
 * Assign a slot to a monthly plan member
 */
export const assignSlotToMonthlyPlan = async (req, res) => {
  try {
    const {
      trainer_id, // This will actually be user_id from frontend
      slot_id,
      monthly_plan_subscription_id,
      assignment_type = 'personal', // 'personal' or 'group'
      start_date,
      end_date,
      is_permanent = true,
      notes
    } = req.body;

    // Validate required fields
    if (!trainer_id || !slot_id || !monthly_plan_subscription_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: trainer_id, slot_id, monthly_plan_subscription_id, start_date, end_date'
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

    // Check if slot exists and belongs to this trainer
    const slotCheck = await query(
      `SELECT tms.* FROM trainer_master_slots tms
       JOIN slot_generation_batches sgb ON tms.batch_id = sgb.id
       WHERE tms.id = $1 AND sgb.trainer_id = $2`,
      [slot_id, actualTrainerId]
    );

    if (slotCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found or does not belong to this trainer'
      });
    }

    // Check if monthly plan subscription exists and is active
    const subscriptionCheck = await query(
      `SELECT mps.*, u.first_name, u.last_name 
       FROM monthly_plan_subscriptions mps
       JOIN users u ON mps.member_id = u.id
       WHERE mps.id = $1 AND mps.status = 'active'`,
      [monthly_plan_subscription_id]
    );

    if (subscriptionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Monthly plan subscription not found or not active'
      });
    }

    // Check if slot is already assigned for the given date range
    const existingAssignment = await query(
      `SELECT sa.* FROM slot_assignments sa
       WHERE sa.slot_id = $1 AND sa.status = 'active'
       AND (
         (sa.start_date <= $2 AND sa.end_date >= $2) OR
         (sa.start_date <= $3 AND sa.end_date >= $3) OR
         (sa.start_date >= $2 AND sa.end_date <= $3)
       )`,
      [slot_id, start_date, end_date]
    );

    if (existingAssignment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Slot is already assigned for the specified date range'
      });
    }

    // Create the slot assignment
    const result = await query(
      `INSERT INTO slot_assignments (
        slot_id, subscription_id, assignment_type, 
        assignment_start_date, assignment_end_date, is_permanent, assignment_reason, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
      RETURNING *`,
      [
        slot_id,
        monthly_plan_subscription_id,
        assignment_type,
        start_date,
        end_date,
        is_permanent,
        notes || null
      ]
    );

    const newAssignment = result.rows[0];

    // Get member details for response
    const memberDetails = subscriptionCheck.rows[0];

    res.status(201).json({
      success: true,
      message: 'Slot assigned to monthly plan member successfully',
      data: {
        id: newAssignment.id,
        slot_id: newAssignment.slot_id,
        monthly_plan_subscription_id: newAssignment.subscription_id,
        assignment_type: newAssignment.assignment_type,
        start_date: newAssignment.assignment_start_date,
        end_date: newAssignment.assignment_end_date,
        is_permanent: newAssignment.is_permanent,
        status: newAssignment.status,
        notes: newAssignment.assignment_reason,
        member_name: `${memberDetails.first_name} ${memberDetails.last_name}`,
        created_at: newAssignment.created_at
      }
    });

  } catch (error) {
    console.error('Error assigning slot to monthly plan:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while assigning slot to monthly plan',
      error: error.message
    });
  }
};

/**
 * Assign a slot for one-time training session
 */
export const assignSlotForOneTimeSession = async (req, res) => {
  try {
    const {
      trainer_id, // This will actually be user_id from frontend
      slot_id,
      client_id,
      session_date,
      session_type = 'personal', // 'personal' or 'group'
      notes
    } = req.body;

    // Validate required fields
    if (!trainer_id || !slot_id || !client_id || !session_date) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: trainer_id, slot_id, client_id, session_date'
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

    // Check if slot exists and belongs to this trainer
    const slotCheck = await query(
      `SELECT tms.* FROM trainer_master_slots tms
       JOIN slot_generation_batches sgb ON tms.batch_id = sgb.id
       WHERE tms.id = $1 AND sgb.trainer_id = $2`,
      [slot_id, actualTrainerId]
    );

    if (slotCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slot not found or does not belong to this trainer'
      });
    }

    // Check if client exists
    const clientCheck = await query(
      'SELECT u.first_name, u.last_name FROM users u WHERE u.id = $1',
      [client_id]
    );

    if (clientCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Check if slot is already assigned for the given date
    const existingAssignment = await query(
      `SELECT sa.* FROM slot_assignments sa
       WHERE sa.slot_id = $1 AND sa.status = 'active'
       AND sa.start_date <= $2 AND sa.end_date >= $2`,
      [slot_id, session_date]
    );

    if (existingAssignment.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Slot is already assigned for the specified date'
      });
    }

    // Create the slot assignment for one-time session
    const result = await query(
      `INSERT INTO slot_assignments (
        slot_id, assigned_member_id, assignment_type, 
        assignment_start_date, assignment_end_date, is_permanent, assignment_reason, status
      ) VALUES ($1, $2, $3, $4, $4, false, $5, 'active')
      RETURNING *`,
      [
        slot_id,
        client_id,
        session_type,
        session_date,
        notes || null
      ]
    );

    const newAssignment = result.rows[0];

    // Get client details for response
    const clientDetails = clientCheck.rows[0];

    res.status(201).json({
      success: true,
      message: 'Slot assigned for one-time training session successfully',
      data: {
        id: newAssignment.id,
        slot_id: newAssignment.slot_id,
        client_id: newAssignment.assigned_member_id,
        assignment_type: newAssignment.assignment_type,
        start_date: newAssignment.assignment_start_date,
        end_date: newAssignment.assignment_end_date,
        is_permanent: newAssignment.is_permanent,
        status: newAssignment.status,
        notes: newAssignment.assignment_reason,
        client_name: `${clientDetails.first_name} ${clientDetails.last_name}`,
        created_at: newAssignment.created_at
      }
    });

  } catch (error) {
    console.error('Error assigning slot for one-time session:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while assigning slot for one-time session',
      error: error.message
    });
  }
};

/**
 * Get all slot assignments for a trainer
 */
export const getTrainerSlotAssignments = async (req, res) => {
  try {
    const { trainer_id } = req.params; // This will actually be user_id from frontend
    const { start_date, end_date, assignment_type } = req.query;

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

    // Build the query with optional filters
    let queryText = `
      SELECT 
        sa.*,
        tms.date as slot_date,
        tms.start_time,
        tms.end_time,
        tms.slot_duration,
        sgb.batch_name,
        CASE 
          WHEN sa.subscription_id IS NOT NULL THEN
            (SELECT CONCAT(u.first_name, ' ', u.last_name) 
             FROM monthly_plan_subscriptions mps 
             JOIN users u ON mps.member_id = u.id 
             WHERE mps.id = sa.subscription_id)
          WHEN sa.assigned_member_id IS NOT NULL THEN
            (SELECT CONCAT(u.first_name, ' ', u.last_name) 
             FROM users u 
             WHERE u.id = sa.assigned_member_id)
          ELSE NULL
        END as assigned_to_name,
        CASE 
          WHEN sa.subscription_id IS NOT NULL THEN 'monthly_plan'
          WHEN sa.assigned_member_id IS NOT NULL THEN 'one_time'
          ELSE 'unknown'
        END as assignment_category
      FROM slot_assignments sa
      JOIN trainer_master_slots tms ON sa.slot_id = tms.id
      JOIN slot_generation_batches sgb ON tms.batch_id = sgb.id
      WHERE sgb.trainer_id = $1 AND sa.status = 'active'
    `;

    const queryParams = [actualTrainerId];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      queryText += ` AND sa.assignment_start_date >= $${paramCount}`;
      queryParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      queryText += ` AND sa.assignment_end_date <= $${paramCount}`;
      queryParams.push(end_date);
    }

    if (assignment_type) {
      paramCount++;
      queryText += ` AND sa.assignment_type = $${paramCount}`;
      queryParams.push(assignment_type);
    }

    queryText += ` ORDER BY sa.assignment_start_date ASC, tms.start_time ASC`;

    const result = await query(queryText, queryParams);

    res.status(200).json({
      success: true,
      message: 'Slot assignments retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting trainer slot assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving slot assignments',
      error: error.message
    });
  }
};

/**
 * Update a slot assignment
 */
export const updateSlotAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;
    const {
      start_date,
      end_date,
      assignment_type,
      notes,
      status
    } = req.body;

    // Check if assignment exists
    const existingAssignment = await query(
      'SELECT * FROM slot_assignments WHERE id = $1',
      [assignment_id]
    );

    if (existingAssignment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slot assignment not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (start_date !== undefined) {
      updateFields.push(`assignment_start_date = $${paramCount++}`);
      updateValues.push(start_date);
    }

    if (end_date !== undefined) {
      updateFields.push(`assignment_end_date = $${paramCount++}`);
      updateValues.push(end_date);
    }

    if (assignment_type !== undefined) {
      updateFields.push(`assignment_type = $${paramCount++}`);
      updateValues.push(assignment_type);
    }

    if (notes !== undefined) {
      updateFields.push(`assignment_reason = $${paramCount++}`);
      updateValues.push(notes);
    }

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(assignment_id);

    const result = await query(
      `UPDATE slot_assignments 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    const updatedAssignment = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Slot assignment updated successfully',
      data: updatedAssignment
    });

  } catch (error) {
    console.error('Error updating slot assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating slot assignment',
      error: error.message
    });
  }
};

/**
 * Delete a slot assignment
 */
export const deleteSlotAssignment = async (req, res) => {
  try {
    const { assignment_id } = req.params;

    // Check if assignment exists
    const existingAssignment = await query(
      'SELECT * FROM slot_assignments WHERE id = $1',
      [assignment_id]
    );

    if (existingAssignment.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slot assignment not found'
      });
    }

    // Delete the assignment
    await query(
      'DELETE FROM slot_assignments WHERE id = $1',
      [assignment_id]
    );

    res.status(200).json({
      success: true,
      message: 'Slot assignment deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting slot assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting slot assignment',
      error: error.message
    });
  }
};
