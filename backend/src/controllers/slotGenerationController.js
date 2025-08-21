import { query } from '../database.js';

// ==============================================
// SLOT GENERATION CONTROLLER
// ==============================================

/**
 * Create a new slot generation batch
 */
export const createSlotGenerationBatch = async (req, res) => {
  try {
    const {
      trainer_id, // This will actually be user_id from frontend
      batch_name,
      generation_start_date,
      generation_end_date,
      slot_duration = 60,
      break_duration = 15,
      selected_days,
      daily_start_time,
      daily_end_time,
      notes
    } = req.body;

    // Validate required fields
    if (!trainer_id || !batch_name || !generation_start_date || !generation_end_date || 
        !selected_days || !daily_start_time || !daily_end_time) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: trainer_id, batch_name, generation_start_date, generation_end_date, selected_days, daily_start_time, daily_end_time'
      });
    }

    // Validate date range
    const startDate = new Date(generation_start_date);
    const endDate = new Date(generation_end_date);
    
    if (startDate >= endDate) {
      return res.status(400).json({
        success: false,
        message: 'Generation end date must be after start date'
      });
    }

    // Validate time range
    if (daily_start_time >= daily_end_time) {
      return res.status(400).json({
        success: false,
        message: 'Daily end time must be after start time'
      });
    }

    // Validate selected days
    if (!Array.isArray(selected_days) || selected_days.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected days must be a non-empty array'
      });
    }

    // Validate numeric values
    if (slot_duration <= 0 || break_duration < 0) {
      return res.status(400).json({
        success: false,
        message: 'Slot duration must be greater than 0 and break duration must be 0 or greater'
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

    // Check if batch name already exists for this trainer
    const existingBatch = await query(
      'SELECT id FROM slot_generation_batches WHERE trainer_id = $1 AND batch_name = $2',
      [actualTrainerId, batch_name]
    );

    if (existingBatch.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'A batch with this name already exists for this trainer'
      });
    }

    // Create the slot generation batch
    const result = await query(
      `INSERT INTO slot_generation_batches (
        trainer_id, batch_name, generation_start_date, generation_end_date,
        slot_duration, break_duration, selected_days, daily_start_time, daily_end_time, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        actualTrainerId,
        batch_name,
        generation_start_date,
        generation_end_date,
        slot_duration,
        break_duration,
        selected_days,
        daily_start_time,
        daily_end_time,
        notes || null
      ]
    );

    const newBatch = result.rows[0];

    // Generate slots for this batch
    const slotsGenerated = await query(
      'SELECT generate_slots_for_batch($1) as slots_generated',
      [newBatch.id]
    );

    res.status(201).json({
      success: true,
      message: `Slot generation batch created successfully. Generated ${slotsGenerated.rows[0].slots_generated} slots.`,
      data: {
        id: newBatch.id,
        trainer_id: newBatch.trainer_id,
        batch_name: newBatch.batch_name,
        generation_start_date: newBatch.generation_start_date,
        generation_end_date: newBatch.generation_end_date,
        slot_duration: newBatch.slot_duration,
        break_duration: newBatch.break_duration,
        selected_days: newBatch.selected_days,
        daily_start_time: newBatch.daily_start_time,
        daily_end_time: newBatch.daily_end_time,
        total_slots_generated: slotsGenerated.rows[0].slots_generated,
        is_active: newBatch.is_active,
        generation_date: newBatch.generation_date
      }
    });

  } catch (error) {
    console.error('Error creating slot generation batch:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating slot generation batch',
      error: error.message
    });
  }
};

/**
 * Get all slot generation batches for a trainer
 */
export const getTrainerSlotBatches = async (req, res) => {
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

    // Get all batches for the trainer
    const result = await query(
      `SELECT 
        sgb.*,
        t.user_id,
        u.first_name as trainer_first_name,
        u.last_name as trainer_last_name
      FROM slot_generation_batches sgb
      JOIN trainers t ON sgb.trainer_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE sgb.trainer_id = $1
      ORDER BY sgb.generation_date DESC`,
      [actualTrainerId]
    );

    res.status(200).json({
      success: true,
      message: 'Slot generation batches retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting trainer slot batches:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving slot generation batches',
      error: error.message
    });
  }
};

/**
 * Get available slots for a trainer on a specific date or date range
 */
export const getAvailableSlotsForDate = async (req, res) => {
  try {
    const { trainer_id } = req.params; // This will actually be user_id from frontend
    const { date, start_date, end_date } = req.query;

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

    let result;
    
    // If date range is provided, use it; otherwise use single date
    if (start_date && end_date) {
      // Get available slots for the date range
      result = await query(
        `SELECT 
          tms.id,
          tms.date,
          tms.start_time,
          tms.end_time,
          tms.slot_duration,
          sgb.batch_name,
          CASE 
            WHEN sa.id IS NULL THEN true 
            ELSE false 
          END as is_available
        FROM trainer_master_slots tms
        JOIN slot_generation_batches sgb ON tms.batch_id = sgb.id
        LEFT JOIN slot_assignments sa ON tms.id = sa.slot_id AND sa.status = 'active'
        WHERE sgb.trainer_id = $1 
          AND tms.date >= $2 
          AND tms.date <= $3
          AND tms.is_active = true
        ORDER BY tms.date ASC, tms.start_time ASC`,
        [actualTrainerId, start_date, end_date]
      );
    } else if (date) {
      // Get available slots for the specific date
      result = await query(
        'SELECT * FROM get_available_slots_for_date($1, $2)',
        [actualTrainerId, date]
      );
    } else {
      return res.status(400).json({
        success: false,
        message: 'Either date or start_date and end_date are required'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Available slots retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving available slots',
      error: error.message
    });
  }
};

/**
 * Get monthly plan assignments for a trainer
 */
export const getMonthlyPlanAssignments = async (req, res) => {
  try {
    const { trainer_id } = req.params; // This will actually be user_id from frontend
    const { start_date, end_date } = req.query;

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

    // Get monthly plan assignments
    const result = await query(
      'SELECT * FROM get_monthly_plan_assignments($1, $2, $3)',
      [actualTrainerId, start_date || null, end_date || null]
    );

    res.status(200).json({
      success: true,
      message: 'Monthly plan assignments retrieved successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error getting monthly plan assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while retrieving monthly plan assignments',
      error: error.message
    });
  }
};

/**
 * Update a slot generation batch
 */
export const updateSlotGenerationBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;
    const {
      batch_name,
      is_active,
      notes,
      daily_start_time,
      daily_end_time,
      slot_duration,
      break_duration,
      selected_days
    } = req.body;

    // Check if batch exists
    const existingBatch = await query(
      'SELECT * FROM slot_generation_batches WHERE id = $1',
      [batch_id]
    );

    if (existingBatch.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slot generation batch not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (batch_name !== undefined) {
      updateFields.push(`batch_name = $${paramCount++}`);
      updateValues.push(batch_name);
    }

    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount++}`);
      updateValues.push(is_active);
    }

    if (notes !== undefined) {
      updateFields.push(`notes = $${paramCount++}`);
      updateValues.push(notes);
    }

    if (daily_start_time !== undefined) {
      updateFields.push(`daily_start_time = $${paramCount++}`);
      updateValues.push(daily_start_time);
    }

    if (daily_end_time !== undefined) {
      updateFields.push(`daily_end_time = $${paramCount++}`);
      updateValues.push(daily_end_time);
    }

    if (slot_duration !== undefined) {
      updateFields.push(`slot_duration = $${paramCount++}`);
      updateValues.push(slot_duration);
    }

    if (break_duration !== undefined) {
      updateFields.push(`break_duration = $${paramCount++}`);
      updateValues.push(break_duration);
    }

    if (selected_days !== undefined) {
      updateFields.push(`selected_days = $${paramCount++}`);
      updateValues.push(selected_days);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(batch_id);

    const result = await query(
      `UPDATE slot_generation_batches 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      updateValues
    );

    const updatedBatch = result.rows[0];

    res.status(200).json({
      success: true,
      message: 'Slot generation batch updated successfully',
      data: updatedBatch
    });

  } catch (error) {
    console.error('Error updating slot generation batch:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating slot generation batch',
      error: error.message
    });
  }
};

/**
 * Delete a slot generation batch
 */
export const deleteSlotGenerationBatch = async (req, res) => {
  try {
    const { batch_id } = req.params;

    // Check if batch exists
    const existingBatch = await query(
      'SELECT * FROM slot_generation_batches WHERE id = $1',
      [batch_id]
    );

    if (existingBatch.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Slot generation batch not found'
      });
    }

    // Check if there are any slot assignments for this batch
    const slotAssignments = await query(
      `SELECT COUNT(*) as count 
       FROM slot_assignments sa
       JOIN trainer_master_slots tms ON sa.slot_id = tms.id
       WHERE tms.batch_id = $1 AND sa.status = 'active'`,
      [batch_id]
    );

    if (parseInt(slotAssignments.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete batch with active slot assignments. Please remove all assignments first.'
      });
    }

    // Delete the batch (this will cascade delete the slots)
    await query(
      'DELETE FROM slot_generation_batches WHERE id = $1',
      [batch_id]
    );

    res.status(200).json({
      success: true,
      message: 'Slot generation batch deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting slot generation batch:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting slot generation batch',
      error: error.message
    });
  }
};
