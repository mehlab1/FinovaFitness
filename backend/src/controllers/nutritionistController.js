import { query } from '../config/database.js';

// Get diet plan requests for a nutritionist
export const getDietPlanRequests = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    
    const result = await query(
      `SELECT 
         dpr.*,
         u.first_name, u.last_name, u.email,
         m.first_name as member_first_name, m.last_name as member_last_name
       FROM diet_plan_requests dpr
       JOIN users u ON dpr.nutritionist_id = u.id
       JOIN users m ON dpr.user_id = m.id
       WHERE dpr.nutritionist_id = $1
       ORDER BY dpr.created_at DESC`,
      [nutritionistId]
    );

    // Transform the data to match frontend expectations
    const transformedRequests = result.rows.map(row => ({
      id: row.id,
      user_id: row.user_id, // Client ID
      nutritionist_id: row.nutritionist_id,
      client_name: `${row.member_first_name} ${row.member_last_name}`,
      fitness_goal: row.fitness_goal,
      current_weight: row.current_weight,
      target_weight: row.target_weight,
      monthly_budget: row.monthly_budget,
      dietary_restrictions: row.dietary_restrictions,
      additional_notes: row.additional_notes,
      status: row.status,
      nutritionist_notes: row.nutritionist_notes,
      meal_plan: row.meal_plan,
      diet_plan_completed: row.diet_plan_completed || false,
      comprehensive_plan_data: row.comprehensive_plan_data,
      plan_created_at: row.plan_created_at,
      plan_updated_at: row.plan_updated_at,
      created_at: row.created_at,
      updated_at: row.updated_at
    }));

    res.json(transformedRequests);

  } catch (error) {
    console.error('Get diet plan requests error:', error);
    res.status(500).json({ error: 'Failed to get diet plan requests' });
  }
};

// Update diet plan request status
export const updateDietPlanRequest = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { requestId } = req.params;
    const { status, nutritionist_notes, preparation_time, meal_plan, diet_plan_completed } = req.body;

    // Verify the request belongs to this nutritionist
    const verifyResult = await query(
      'SELECT id FROM diet_plan_requests WHERE id = $1 AND nutritionist_id = $2',
      [requestId, nutritionistId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Diet plan request not found' });
    }

    // Build update query dynamically based on provided fields
    let updateFields = [];
    let updateValues = [];
    let paramCount = 1;

    if (status !== undefined) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }
    if (nutritionist_notes !== undefined) {
      updateFields.push(`nutritionist_notes = $${paramCount++}`);
      updateValues.push(nutritionist_notes);
    }
    if (preparation_time !== undefined) {
      updateFields.push(`preparation_time = $${paramCount++}`);
      updateValues.push(preparation_time);
    }
    if (meal_plan !== undefined) {
      updateFields.push(`meal_plan = $${paramCount++}`);
      updateValues.push(meal_plan);
    }
    if (diet_plan_completed !== undefined) {
      updateFields.push(`diet_plan_completed = $${paramCount++}`);
      updateValues.push(diet_plan_completed);
    }

    // Always update the updated_at timestamp
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add the requestId and nutritionistId to the values array
    updateValues.push(requestId, nutritionistId);

    // Update the request
    const result = await query(
      `UPDATE diet_plan_requests 
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount++} AND nutritionist_id = $${paramCount++}
       RETURNING *`,
      updateValues
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Update diet plan request error:', error);
    res.status(500).json({ error: 'Failed to update diet plan request' });
  }
};

// Get nutritionist dashboard stats
export const getNutritionistDashboard = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    
    // Get counts for different statuses
    const statsResult = await query(
      `SELECT 
         status,
         COUNT(*) as count
       FROM diet_plan_requests 
       WHERE nutritionist_id = $1
       GROUP BY status`,
      [nutritionistId]
    );

    // Get recent requests
    const recentRequestsResult = await query(
      `SELECT 
         dpr.*,
         u.first_name, u.last_name
       FROM diet_plan_requests dpr
       JOIN users u ON dpr.user_id = u.id
       WHERE dpr.nutritionist_id = $1
       ORDER BY dpr.created_at DESC
       LIMIT 5`,
      [nutritionistId]
    );

    // Get session stats
    const sessionStatsResult = await query(
      `SELECT 
         status,
         COUNT(*) as count
       FROM nutritionist_sessions 
       WHERE nutritionist_id = $1
       GROUP BY status`,
      [nutritionistId]
    );

    // Get upcoming sessions
    const upcomingSessionsResult = await query(
      `SELECT 
         ns.*,
         u.first_name, u.last_name
       FROM nutritionist_sessions ns
       JOIN users u ON ns.client_id = u.id
       WHERE ns.nutritionist_id = $1 
         AND ns.session_date >= CURRENT_DATE
         AND ns.status IN ('confirmed', 'pending')
       ORDER BY ns.session_date, ns.start_time
       LIMIT 5`,
      [nutritionistId]
    );

    const stats = {
      diet_requests: statsResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      sessions: sessionStatsResult.rows.reduce((acc, row) => {
        acc[row.status] = parseInt(row.count);
        return acc;
      }, {}),
      recent_requests: recentRequestsResult.rows,
      upcoming_sessions: upcomingSessionsResult.rows
    };

    res.json(stats);

  } catch (error) {
    console.error('Get nutritionist dashboard error:', error);
    res.status(500).json({ error: 'Failed to get nutritionist dashboard' });
  }
};

// Get nutritionist availability
export const getAvailability = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    
    const result = await query(
      `SELECT * FROM nutritionist_availability 
       WHERE nutritionist_id = $1 
       ORDER BY day_of_week`,
      [nutritionistId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get availability error:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
};

// Update nutritionist availability
export const updateAvailability = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const availability = req.body;

    // Begin transaction
    await query('BEGIN');

    for (const day of availability) {
      if (day.isAvailable) {
        // Insert or update availability for this day
        await query(
          `INSERT INTO nutritionist_availability 
           (nutritionist_id, day_of_week, start_time, end_time, session_duration_minutes, max_sessions_per_day, break_duration_minutes)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (nutritionist_id, day_of_week) 
           DO UPDATE SET 
             start_time = EXCLUDED.start_time,
             end_time = EXCLUDED.end_time,
             session_duration_minutes = EXCLUDED.session_duration_minutes,
             max_sessions_per_day = EXCLUDED.max_sessions_per_day,
             break_duration_minutes = EXCLUDED.break_duration_minutes`,
          [nutritionistId, day.dayOfWeek, day.startTime, day.endTime, day.sessionDuration, day.maxSessions, day.breakDuration]
        );
      } else {
        // Remove availability for this day
        await query(
          'DELETE FROM nutritionist_availability WHERE nutritionist_id = $1 AND day_of_week = $2',
          [nutritionistId, day.dayOfWeek]
        );
      }
    }

    await query('COMMIT');
    res.json({ message: 'Availability updated successfully' });

  } catch (error) {
    await query('ROLLBACK');
    console.error('Update availability error:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
};

// Generate time slots based on availability
export const generateTimeSlots = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    
    console.log(`Generating time slots for nutritionist ${nutritionistId}`);
    
    // Get the nutritionist's availability
    const availabilityResult = await query(
      `SELECT * FROM nutritionist_availability 
       WHERE nutritionist_id = $1 AND is_available = true
       ORDER BY day_of_week`,
      [nutritionistId]
    );
    
    if (availabilityResult.rows.length === 0) {
      return res.status(400).json({ error: 'No availability settings found. Please set up your schedule first.' });
    }
    
    console.log(`Found ${availabilityResult.rows.length} available days`);
    
    // Clear existing time slots for this nutritionist
    await query(
      'DELETE FROM nutritionist_schedules WHERE nutritionist_id = $1',
      [nutritionistId]
    );
    
    // Generate time slots for each available day
    for (const day of availabilityResult.rows) {
      const { day_of_week, start_time, end_time, session_duration_minutes, break_duration_minutes } = day;
      
      console.log(`Generating slots for day ${day_of_week}: ${start_time} to ${end_time}`);
      
      let currentTime = new Date(`2000-01-01 ${start_time}`);
      const endTime = new Date(`2000-01-01 ${end_time}`);
      
      while (currentTime < endTime) {
        const timeSlot = currentTime.toTimeString().slice(0, 5);
        
        // Insert the time slot
        await query(
          `INSERT INTO nutritionist_schedules (nutritionist_id, day_of_week, time_slot, status, created_at, updated_at)
           VALUES ($1, $2, $3, 'available', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [nutritionistId, day_of_week, timeSlot]
        );
        
        // Move to next slot (session duration + break duration)
        currentTime.setMinutes(currentTime.getMinutes() + session_duration_minutes + break_duration_minutes);
      }
    }
    
    // Get the count of generated slots
    const countResult = await query(
      'SELECT COUNT(*) as slot_count FROM nutritionist_schedules WHERE nutritionist_id = $1',
      [nutritionistId]
    );
    
    console.log(`Generated ${countResult.rows[0].slot_count} time slots`);
    
    res.json({ 
      message: 'Time slots generated successfully',
      slotsGenerated: countResult.rows[0].slot_count
    });

  } catch (error) {
    console.error('Generate time slots error:', error);
    res.status(500).json({ error: 'Failed to generate time slots' });
  }
};

// Get available slots for a specific date
export const getAvailableSlots = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { date } = req.params;
    
    const dayOfWeek = new Date(date).getDay();
    
    const result = await query(
      `SELECT 
         ns.id,
         ns.time_slot,
         ns.status,
         ns.booking_id,
         ns.client_id,
         u.first_name,
         u.last_name
       FROM nutritionist_schedules ns
       LEFT JOIN users u ON ns.client_id = u.id
       WHERE ns.nutritionist_id = $1 
         AND ns.day_of_week = $2
       ORDER BY ns.time_slot`,
      [nutritionistId, dayOfWeek]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
};

// Get nutritionist schedule
export const getSchedule = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    
    // Get blocked time slots
    const timeOffResult = await query(
      `SELECT * FROM nutritionist_time_off 
       WHERE nutritionist_id = $1 
         AND end_date >= CURRENT_DATE
       ORDER BY start_date`,
      [nutritionistId]
    );

    // Get upcoming sessions
    const sessionsResult = await query(
      `SELECT 
         ns.*,
         u.first_name, u.last_name
       FROM nutritionist_sessions ns
       JOIN users u ON ns.client_id = u.id
       WHERE ns.nutritionist_id = $1 
         AND ns.session_date >= CURRENT_DATE
       ORDER BY ns.session_date, ns.start_time`,
      [nutritionistId]
    );

    res.json({
      timeOff: timeOffResult.rows,
      sessions: sessionsResult.rows
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
};

// Block time slots
export const blockTimeSlots = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { date, startTime, endTime, reason } = req.body;

    const result = await query(
      `INSERT INTO nutritionist_time_off 
       (nutritionist_id, start_date, end_date, start_time, end_time, reason)
       VALUES ($1, $2, $2, $3, $4, $5)
       RETURNING *`,
      [nutritionistId, date, startTime, endTime, reason]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Block time slots error:', error);
    res.status(500).json({ error: 'Failed to block time slots' });
  }
};

// Unblock time slots
export const unblockTimeSlots = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { blockId } = req.params;

    await query(
      'DELETE FROM nutritionist_time_off WHERE id = $1 AND nutritionist_id = $2',
      [blockId, nutritionistId]
    );

    res.json({ message: 'Time slots unblocked successfully' });

  } catch (error) {
    console.error('Unblock time slots error:', error);
    res.status(500).json({ error: 'Failed to unblock time slots' });
  }
};

// Get session requests
export const getSessionRequests = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    
    const result = await query(
      `SELECT 
         nsr.*,
         u.first_name, u.last_name, u.email
       FROM nutritionist_session_requests nsr
       JOIN users u ON nsr.requester_id = u.id
       WHERE nsr.nutritionist_id = $1
       ORDER BY nsr.created_at DESC`,
      [nutritionistId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get session requests error:', error);
    res.status(500).json({ error: 'Failed to get session requests' });
  }
};

// Update session request status
export const updateSessionRequest = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { requestId } = req.params;
    const { status, nutritionist_response, approved_date, approved_time, session_price } = req.body;

    // Verify the request belongs to this nutritionist
    const verifyResult = await query(
      'SELECT id FROM nutritionist_session_requests WHERE id = $1 AND nutritionist_id = $2',
      [requestId, nutritionistId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session request not found' });
    }

    // Update the request
    const result = await query(
      `UPDATE nutritionist_session_requests 
       SET status = $1, nutritionist_response = $2, approved_date = $3, approved_time = $4, session_price = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND nutritionist_id = $7
       RETURNING *`,
      [status, nutritionist_response, approved_date, approved_time, session_price, requestId, nutritionistId]
    );

    // If approved, create a session
    if (status === 'approved' && approved_date && approved_time) {
      const request = result.rows[0];
      
      // Calculate end time (assuming 60 minutes by default)
      const startTime = new Date(`2000-01-01T${approved_time}`);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
      
      await query(
        `INSERT INTO nutritionist_sessions 
         (nutritionist_id, client_id, session_date, start_time, end_time, session_type, status, price, notes)
         VALUES ($1, $2, $3, $4, $5, $6, 'confirmed', $7, $8)`,
        [nutritionistId, request.requester_id, approved_date, approved_time, endTime.toTimeString().slice(0, 5), request.session_type, session_price, request.message]
      );
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Update session request error:', error);
    res.status(500).json({ error: 'Failed to update session request' });
  }
};

// Mark session as completed
export const markSessionCompleted = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { sessionId } = req.params;
    const { notes } = req.body;

    // Verify the session belongs to this nutritionist
    const verifyResult = await query(
      'SELECT id FROM nutritionist_sessions WHERE id = $1 AND nutritionist_id = $2',
      [sessionId, nutritionistId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Update the session
    const result = await query(
      `UPDATE nutritionist_sessions 
       SET status = 'completed', nutritionist_notes = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND nutritionist_id = $3
       RETURNING *`,
      [notes, sessionId, nutritionistId]
    );

    res.json(result.rows[0]);

  } catch (error) {
    console.error('Mark session completed error:', error);
    res.status(500).json({ error: 'Failed to mark session as completed' });
  }
};

// Create comprehensive diet plan
export const createComprehensiveDietPlan = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { 
      diet_plan_request_id, 
      client_id, 
      plan_name, 
      description, 
      total_weeks, 
      overall_goals, 
      dietary_guidelines, 
      shopping_list, 
      preparation_tips, 
      weekly_plans, 
      status, 
      current_step, 
      total_steps 
    } = req.body;

    // Verify the diet plan request belongs to this nutritionist
    const verifyResult = await query(
      'SELECT id FROM diet_plan_requests WHERE id = $1 AND nutritionist_id = $2',
      [diet_plan_request_id, nutritionistId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Diet plan request not found' });
    }

    // Create comprehensive diet plan data
    const comprehensivePlanData = {
      plan_name,
      description,
      total_weeks,
      overall_goals,
      dietary_guidelines,
      shopping_list,
      preparation_tips,
      weekly_plans,
      status,
      current_step,
      total_steps,
      created_at: new Date().toISOString()
    };

    // Update the diet plan request with comprehensive data
    const result = await query(
      `UPDATE diet_plan_requests 
       SET comprehensive_plan_data = $1, 
           plan_created_at = CURRENT_TIMESTAMP,
           plan_updated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND nutritionist_id = $3
       RETURNING *`,
      [JSON.stringify(comprehensivePlanData), diet_plan_request_id, nutritionistId]
    );

    res.json({
      id: result.rows[0].id,
      diet_plan_request_id,
      client_id,
      nutritionist_id: nutritionistId,
      ...comprehensivePlanData
    });

  } catch (error) {
    console.error('Create comprehensive diet plan error:', error);
    res.status(500).json({ error: 'Failed to create comprehensive diet plan' });
  }
};

// Get comprehensive diet plan
export const getComprehensiveDietPlan = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { requestId } = req.params;

    // Verify the diet plan request belongs to this nutritionist
    const result = await query(
      `SELECT 
         id,
         user_id as client_id,
         nutritionist_id,
         comprehensive_plan_data,
         plan_created_at,
         plan_updated_at,
         diet_plan_completed
       FROM diet_plan_requests 
       WHERE id = $1 AND nutritionist_id = $2`,
      [requestId, nutritionistId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comprehensive diet plan not found' });
    }

    const planData = result.rows[0];
    if (!planData.comprehensive_plan_data) {
      return res.status(404).json({ error: 'No comprehensive diet plan data found' });
    }

    res.json({
      id: planData.id,
      diet_plan_request_id: planData.id,
      client_id: planData.client_id,
      nutritionist_id: planData.nutritionist_id,
      diet_plan_completed: planData.diet_plan_completed,
      ...planData.comprehensive_plan_data
    });

  } catch (error) {
    console.error('Get comprehensive diet plan error:', error);
    res.status(500).json({ error: 'Failed to get comprehensive diet plan' });
  }
};

// Update comprehensive diet plan
export const updateComprehensiveDietPlan = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { requestId } = req.params;
    const { 
      plan_name, 
      description, 
      total_weeks, 
      overall_goals, 
      dietary_guidelines, 
      shopping_list, 
      preparation_tips, 
      weekly_plans, 
      status, 
      current_step, 
      total_steps 
    } = req.body;

    // Verify the diet plan request belongs to this nutritionist
    const verifyResult = await query(
      'SELECT id FROM diet_plan_requests WHERE id = $1 AND nutritionist_id = $2',
      [requestId, nutritionistId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Diet plan request not found' });
    }

    // Get existing plan data
    const existingResult = await query(
      'SELECT comprehensive_plan_data FROM diet_plan_requests WHERE id = $1',
      [requestId]
    );

    let existingData = {};
    if (existingResult.rows[0]?.comprehensive_plan_data) {
      existingData = existingResult.rows[0].comprehensive_plan_data;
    }

    // Update comprehensive diet plan data
    const updatedPlanData = {
      ...existingData,
      plan_name,
      description,
      total_weeks,
      overall_goals,
      dietary_guidelines,
      shopping_list,
      preparation_tips,
      weekly_plans,
      status,
      current_step,
      total_steps,
      updated_at: new Date().toISOString()
    };

    // Update the diet plan request
    const result = await query(
      `UPDATE diet_plan_requests 
       SET comprehensive_plan_data = $1, 
           plan_updated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND nutritionist_id = $3
       RETURNING *`,
      [JSON.stringify(updatedPlanData), requestId, nutritionistId]
    );

    res.json({
      id: result.rows[0].id,
      diet_plan_request_id: requestId,
      client_id: result.rows[0].user_id,
      nutritionist_id: nutritionistId,
      ...updatedPlanData
    });

  } catch (error) {
    console.error('Update comprehensive diet plan error:', error);
    res.status(500).json({ error: 'Failed to update comprehensive diet plan' });
  }
};

// Save diet plan progress
export const saveDietPlanProgress = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { requestId } = req.params;
    const { 
      current_step, 
      weekly_plans, 
      status, 
      progress_notes 
    } = req.body;

    // Verify the diet plan request belongs to this nutritionist
    const verifyResult = await query(
      'SELECT id FROM diet_plan_requests WHERE id = $1 AND nutritionist_id = $2',
      [requestId, nutritionistId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Diet plan request not found' });
    }

    // Get existing plan data
    const existingResult = await query(
      'SELECT comprehensive_plan_data FROM diet_plan_requests WHERE id = $1',
      [requestId]
    );

    let existingData = {};
    if (existingResult.rows[0]?.comprehensive_plan_data) {
      existingData = existingResult.rows[0].comprehensive_plan_data;
    }

    // Update progress data
    const updatedPlanData = {
      ...existingData,
      current_step,
      weekly_plans,
      status,
      progress_notes,
      updated_at: new Date().toISOString()
    };

    // Update the diet plan request
    const result = await query(
      `UPDATE diet_plan_requests 
       SET comprehensive_plan_data = $1, 
           plan_updated_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND nutritionist_id = $3
       RETURNING *`,
      [JSON.stringify(updatedPlanData), requestId, nutritionistId]
    );

    res.json({
      id: result.rows[0].id,
      diet_plan_request_id: requestId,
      client_id: result.rows[0].user_id,
      nutritionist_id: nutritionistId,
      ...updatedPlanData
    });

  } catch (error) {
    console.error('Save diet plan progress error:', error);
    res.status(500).json({ error: 'Failed to save diet plan progress' });
  }
};
