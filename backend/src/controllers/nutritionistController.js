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

// Download diet plan as PDF
export const downloadDietPlanPDF = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { requestId } = req.params;

    // Get the diet plan request with comprehensive data
    const result = await query(
      `SELECT 
         dpr.*,
         u.first_name, u.last_name, u.email,
         m.first_name as member_first_name, m.last_name as member_last_name,
         n.first_name as nutritionist_first_name, n.last_name as nutritionist_last_name, n.email as nutritionist_email
       FROM diet_plan_requests dpr
       JOIN users u ON dpr.nutritionist_id = u.id
       JOIN users m ON dpr.user_id = m.id
       JOIN users n ON dpr.nutritionist_id = n.id
       WHERE dpr.id = $1 AND dpr.nutritionist_id = $2`,
      [requestId, nutritionistId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diet plan request not found' });
    }

    const request = result.rows[0];
    
    // Check if the request is completed
    if (request.status !== 'completed') {
      return res.status(400).json({ error: 'Only completed diet plans can be downloaded' });
    }

    // Debug: Log what's in the comprehensive plan data
    console.log('Comprehensive Plan Data:', JSON.stringify(request.comprehensive_plan_data, null, 2));
    console.log('Weekly Plans:', request.comprehensive_plan_data?.weekly_plans);

    // Import PDFKit dynamically
    const PDFDocument = (await import('pdfkit')).default;
    
    // Create PDF document with better margins and layout
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40
      }
    });

    // Set response headers for PDF download
    const filename = `finovafitness_diet_plan_${request.member_first_name}_${request.member_last_name}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add Finova Fitness branding header with enterprise-level styling
    doc.rect(0, 0, doc.page.width, 90)
       .fill('#F8FAFC') // Very light blue background
       .stroke('#3B82F6'); // Professional blue border
    
    // Add subtle pattern overlay
    doc.rect(0, 0, doc.page.width, 90)
       .fill('#EFF6FF') // Light blue overlay
       .opacity(0.3);
    
    doc.fontSize(32)
       .fill('#1E40AF') // Dark blue text
       .text('FINOVA FITNESS', 0, 25, { align: 'center', width: doc.page.width });
    
    doc.fontSize(20)
       .fill('#374151') // Dark gray text
       .text('Comprehensive Diet Plan', 0, 55, { align: 'center', width: doc.page.width });
    
    // Add subtitle
    doc.fontSize(12)
       .fill('#6B7280')
       .text('Professional Nutrition & Wellness', 0, 75, { align: 'center', width: doc.page.width });
    
    doc.moveDown(2);

    // Helper function to add section headers
    const addSectionHeader = (text, y) => {
      // Light background with dark border
      doc.rect(0, y, doc.page.width, 25)
         .fill('#F3F4F6') // Light gray background
         .stroke('#374151'); // Dark border
      
      doc.fontSize(16)
         .fill('#000000') // BLACK text for visibility
         .text(text, 10, y + 5);
      
      return y + 35;
    };

    // Helper function to add content
    const addContent = (text, y, fontSize = 12) => {
      doc.fontSize(fontSize)
         .fill('#000000') // BLACK text for visibility
         .text(text, 10, y, { width: doc.page.width - 20 });
      
      return y + (fontSize * 1.5);
    };

    let currentY = 130;
    
    // Helper function to check if we need a new page
    const checkPageBreak = (requiredHeight) => {
      if (currentY + requiredHeight > doc.page.height - 100) {
        doc.addPage();
        currentY = 120; // Reset Y position for new page
        return true;
      }
      return false;
    };

    // Add client information section with better layout
    currentY = addSectionHeader('CLIENT INFORMATION', currentY);
    
    const clientInfo = [
      `Name: ${request.member_first_name} ${request.member_last_name}`,
      `Fitness Goal: ${request.fitness_goal || 'No data'}`,
      `Current Weight: ${request.current_weight || 'No data'} kg`,
      `Target Weight: ${request.target_weight || 'No data'} kg`,
      `Height: ${request.height || 'No data'} cm`,
      `Activity Level: ${request.activity_level || 'No data'}`,
      `Monthly Budget: PKR ${request.monthly_budget || 'No data'}`,
      `Dietary Restrictions: ${request.dietary_restrictions || 'No data'}`,
      `Additional Notes: ${request.additional_notes || 'No data'}`
    ];

    clientInfo.forEach(info => {
      currentY = addContent(info, currentY);
    });

    currentY += 10;

    // Add nutritionist information
    currentY = addSectionHeader('NUTRITIONIST CONTACT INFORMATION', currentY);
    
    const nutritionistInfo = [
      `Name: ${request.nutritionist_first_name} ${request.nutritionist_last_name}`,
      `Email: ${request.nutritionist_email || 'No data'}`,
      `Plan Created: ${request.plan_created_at ? new Date(request.plan_created_at).toLocaleDateString() : 'No data'}`,
      `Last Updated: ${request.plan_updated_at ? new Date(request.plan_updated_at).toLocaleDateString() : 'No data'}`
    ];

    nutritionistInfo.forEach(info => {
      currentY = addContent(info, currentY);
    });

    currentY += 10;

    // Add nutritionist notes
    if (request.nutritionist_notes) {
      currentY = addSectionHeader('NUTRITIONIST NOTES', currentY);
      currentY = addContent(request.nutritionist_notes, currentY);
      currentY += 10;
    }

    // Add meal plan if exists
    if (request.meal_plan) {
      currentY = addSectionHeader('MEAL PLAN', currentY);
      currentY = addContent(request.meal_plan, currentY);
      currentY += 10;
    }

    // Add comprehensive plan data if exists
    if (request.comprehensive_plan_data) {
      const planData = request.comprehensive_plan_data;
      
      // Plan Overview
      if (planData.plan_name || planData.description || planData.total_weeks) {
        currentY = addSectionHeader('PLAN OVERVIEW', currentY);
        
        if (planData.plan_name) currentY = addContent(`Plan Name: ${planData.plan_name}`, currentY);
        if (planData.description) currentY = addContent(`Description: ${planData.description}`, currentY);
        if (planData.total_weeks) currentY = addContent(`Total Weeks: ${planData.total_weeks}`, currentY);
        
        currentY += 10;
      }

      // Overall Goals
      if (planData.overall_goals) {
        currentY = addSectionHeader('OVERALL GOALS', currentY);
        
        if (typeof planData.overall_goals === 'object') {
          // Handle structured goals object
          const goals = planData.overall_goals;
          if (goals.target_calories) currentY = addContent(`Target Calories: ${goals.target_calories}`, currentY, 11);
          if (goals.target_protein) currentY = addContent(`Target Protein: ${goals.target_protein}g`, currentY, 11);
          if (goals.target_carbs) currentY = addContent(`Target Carbs: ${goals.target_carbs}g`, currentY, 11);
          if (goals.target_fats) currentY = addContent(`Target Fats: ${goals.target_fats}g`, currentY, 11);
          if (goals.target_fiber) currentY = addContent(`Target Fiber: ${goals.target_fiber}g`, currentY, 11);
          if (goals.target_sugar) currentY = addContent(`Target Sugar: ${goals.target_sugar}g`, currentY, 11);
          if (goals.target_sodium) currentY = addContent(`Target Sodium: ${goals.target_sodium}mg`, currentY, 11);
        } else {
          // Handle string goals
          currentY = addContent(planData.overall_goals, currentY);
        }
        currentY += 10;
      }

      // Dietary Guidelines
      if (planData.dietary_guidelines) {
        currentY = addSectionHeader('DIETARY GUIDELINES', currentY);
        
        if (Array.isArray(planData.dietary_guidelines)) {
          planData.dietary_guidelines.forEach((guideline, index) => {
            currentY = addContent(`${index + 1}. ${guideline}`, currentY, 11);
            currentY += 8;
          });
        } else if (typeof planData.dietary_guidelines === 'string') {
          currentY = addContent(planData.dietary_guidelines, currentY);
        } else {
          currentY = addContent(JSON.stringify(planData.dietary_guidelines, null, 2), currentY, 10);
        }
        currentY += 10;
      }

      // Shopping List
      if (planData.shopping_list) {
        currentY = addSectionHeader('SHOPPING LIST', currentY);
        
        if (Array.isArray(planData.shopping_list)) {
          planData.shopping_list.forEach((item, index) => {
            currentY = addContent(`• ${item}`, currentY, 11);
            currentY += 8;
          });
        } else if (typeof planData.shopping_list === 'string') {
          currentY = addContent(planData.shopping_list, currentY);
        } else {
          currentY = addContent(JSON.stringify(planData.shopping_list, null, 2), currentY, 10);
        }
        currentY += 10;
      }

      // Preparation Tips
      if (planData.preparation_tips) {
        currentY = addSectionHeader('PREPARATION TIPS', currentY);
        
        if (Array.isArray(planData.preparation_tips)) {
          planData.preparation_tips.forEach((tip, index) => {
            currentY = addContent(`${index + 1}. ${tip}`, currentY, 11);
            currentY += 8;
          });
        } else if (typeof planData.preparation_tips === 'string') {
          currentY = addContent(planData.preparation_tips, currentY);
        } else {
          currentY = addContent(JSON.stringify(planData.preparation_tips, null, 2), currentY, 10);
        }
        currentY += 10;
      }

      // Weekly Plans - ENTERPRISE-LEVEL PROFESSIONAL FORMAT
      if (planData.weekly_plans) {
        currentY = addSectionHeader('WEEKLY MEAL PLANS', currentY);
        
        // Check if we need a new page for weekly plans
        checkPageBreak(300);
        
        if (Array.isArray(planData.weekly_plans)) {
          planData.weekly_plans.forEach((week, weekIndex) => {
            // Add week header with professional styling
            doc.rect(0, currentY, doc.page.width, 25)
               .fill('#F8FAFC') // Very light blue background
               .stroke('#3B82F6'); // Blue border
            
            doc.fontSize(16)
               .fill('#1E40AF') // Dark blue text
               .text(`Week ${week.week_number || weekIndex + 1}`, 15, currentY + 5);
            
            if (week.start_date && week.end_date) {
              doc.fontSize(10)
                 .fill('#6B7280')
                 .text(`${week.start_date} - ${week.end_date}`, 15, currentY + 20);
            }
            
            currentY += 30;
            
            // Handle daily plans structure
            if (week.daily_plans && Array.isArray(week.daily_plans)) {
              week.daily_plans.forEach((day, dayIndex) => {
                // Day header
                doc.rect(0, currentY, doc.page.width, 20)
                   .fill('#EFF6FF') // Light blue background
                   .stroke('#93C5FD'); // Light blue border
                
                doc.fontSize(12)
                   .fill('#1E40AF')
                   .text(`Day ${day.day_of_week || dayIndex + 1}`, 20, currentY + 5);
                
                currentY += 25;
                
                // Daily nutritional summary
                if (day.total_calories || day.total_protein || day.total_carbs || day.total_fats) {
                  currentY = addContent('Daily Nutritional Summary:', currentY, 11);
                  currentY += 10;
                  
                  const nutritionInfo = [];
                  if (day.total_calories) nutritionInfo.push(`Calories: ${day.total_calories.toFixed(0)}`);
                  if (day.total_protein) nutritionInfo.push(`Protein: ${day.total_protein.toFixed(0)}g`);
                  if (day.total_carbs) nutritionInfo.push(`Carbs: ${day.total_carbs.toFixed(0)}g`);
                  if (day.total_fats) nutritionInfo.push(`Fats: ${day.total_fats.toFixed(0)}g`);
                  
                  currentY = addContent(`  ${nutritionInfo.join(' | ')}`, currentY, 10);
                  currentY += 15;
                }
                
                // Meals
                if (day.meals && Array.isArray(day.meals)) {
                  day.meals.forEach((meal, mealIndex) => {
                    // Meal header
                    doc.fontSize(11)
                       .fill('#059669') // Green text for meal types
                       .text(`${meal.meal_type || `Meal ${mealIndex + 1}`}:`, 25, currentY);
                    
                    currentY += 15;
                    
                    // Meal time if available
                    if (meal.time) {
                      currentY = addContent(`  Time: ${meal.time}`, currentY, 10);
                      currentY += 10;
                    }
                    
                    // Meal items
                    if (meal.items && Array.isArray(meal.items)) {
                      meal.items.forEach((item, itemIndex) => {
                        const itemText = `${item.food_name} - ${item.quantity}${item.unit}`;
                        currentY = addContent(`  • ${itemText}`, currentY, 10);
                        currentY += 8;
                        
                        // Item nutritional info
                        const itemNutrition = [];
                        if (item.calories) itemNutrition.push(`${item.calories.toFixed(0)} cal`);
                        if (item.protein) itemNutrition.push(`${item.protein.toFixed(0)}g protein`);
                        if (item.carbs) itemNutrition.push(`${item.carbs.toFixed(0)}g carbs`);
                        if (item.fats) itemNutrition.push(`${item.fats.toFixed(0)}g fats`);
                        
                        if (itemNutrition.length > 0) {
                          currentY = addContent(`    (${itemNutrition.join(', ')})`, currentY, 9);
                          currentY += 8;
                        }
                      });
                    }
                    
                    // Meal notes
                    if (meal.notes) {
                      currentY = addContent(`  Notes: ${meal.notes}`, currentY, 10);
                      currentY += 10;
                    }
                    
                    // Meal nutritional summary
                    if (meal.calories || meal.protein || meal.carbs || meal.fats) {
                      const mealNutrition = [];
                      if (meal.calories) mealNutrition.push(`${meal.calories.toFixed(0)} cal`);
                      if (meal.protein) mealNutrition.push(`${meal.protein.toFixed(0)}g protein`);
                      if (meal.carbs) mealNutrition.push(`${meal.carbs.toFixed(0)}g carbs`);
                      if (meal.fats) mealNutrition.push(`${meal.fats.toFixed(0)}g fats`);
                      
                      currentY = addContent(`  Total: ${mealNutrition.join(' | ')}`, currentY, 10);
                      currentY += 10;
                    }
                    
                    currentY += 5;
                  });
                }
                
                // Day notes
                if (day.notes) {
                  currentY = addContent(`Day Notes: ${day.notes}`, currentY, 10);
                  currentY += 10;
                }
                
                // Cheat day indicator
                if (day.is_cheat_day) {
                  doc.fontSize(10)
                     .fill('#DC2626') // Red text for cheat day
                     .text('  ⚠️ CHEAT DAY', 25, currentY);
                  currentY += 15;
                }
                
                currentY += 10;
              });
            }
            
            // Weekly goals if available
            if (week.weekly_goals) {
              currentY = addContent('Weekly Goals:', currentY, 11);
              currentY += 10;
              
              const goals = week.weekly_goals;
              if (goals.target_calories) currentY = addContent(`  Target Calories: ${goals.target_calories}`, currentY, 10);
              if (goals.target_protein) currentY = addContent(`  Target Protein: ${goals.target_protein}g`, currentY, 10);
              if (goals.target_carbs) currentY = addContent(`  Target Carbs: ${goals.target_carbs}g`, currentY, 10);
              if (goals.target_fats) currentY = addContent(`  Target Fats: ${goals.target_fats}g`, currentY, 10);
              if (goals.cheat_days_allowed) currentY = addContent(`  Cheat Days Allowed: ${goals.cheat_days_allowed}`, currentY, 10);
              
              currentY += 15;
            }
            
            currentY += 15;
          });
        } else {
          // Fallback for other structures
          currentY = addContent('Weekly plans data structure not recognized. Please contact support.', currentY, 11);
          currentY += 20;
        }
      } else {
        // No weekly plans data
        currentY = addContent('No weekly meal plans data available', currentY, 11);
        currentY += 20;
      }

      // Progress Tracking
      if (planData.current_step || planData.total_steps) {
        currentY = addSectionHeader('PROGRESS TRACKING', currentY);
        
        if (planData.current_step) currentY = addContent(`Current Step: ${planData.current_step}`, currentY);
        if (planData.total_steps) currentY = addContent(`Total Steps: ${planData.total_steps}`, currentY);
        
        currentY += 10;
      }

      // Professional note about plan customization
      currentY = addContent('This plan has been customized based on your specific needs and goals.', currentY, 10);
      currentY += 10;

      // Professional footer note
      currentY = addContent('This diet plan has been professionally designed by your nutritionist.', currentY, 10);
      currentY += 10;
    }

    // Add footer with better styling
    doc.rect(0, doc.page.height - 60, doc.page.width, 60)
       .fill('#F3F4F6') // Light background
       .stroke('#6B7280'); // Dark border
    
    doc.fontSize(10)
       .fill('#000000') // BLACK text for visibility
       .text('Generated by Finova Fitness Nutrition Portal', 0, doc.page.height - 50, { align: 'center', width: doc.page.width })
       .text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 0, doc.page.height - 35, { align: 'center', width: doc.page.width });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Download diet plan PDF error:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
};

// Debug endpoint to inspect comprehensive plan data structure
export const debugDietPlanData = async (req, res) => {
  try {
    const nutritionistId = req.userId;
    const { requestId } = req.params;

    // Get the diet plan request with comprehensive data
    const result = await query(
      `SELECT 
         dpr.*,
         u.first_name, u.last_name, u.email,
         m.first_name as member_first_name, m.last_name as member_last_name,
         n.first_name as nutritionist_first_name, n.last_name as nutritionist_last_name, n.email as nutritionist_email
       FROM diet_plan_requests dpr
       JOIN users u ON dpr.nutritionist_id = u.id
       JOIN users m ON dpr.user_id = m.id
       JOIN users n ON dpr.nutritionist_id = n.id
       WHERE dpr.id = $1 AND dpr.nutritionist_id = $2`,
      [requestId, nutritionistId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Diet plan request not found' });
    }

    const request = result.rows[0];
    
    // Return detailed information about the data structure
    res.json({
      request_id: request.id,
      status: request.status,
      client_name: `${request.member_first_name} ${request.member_last_name}`,
      nutritionist_name: `${request.nutritionist_first_name} ${request.nutritionist_last_name}`,
      basic_info: {
        fitness_goal: request.fitness_goal,
        current_weight: request.current_weight,
        target_weight: request.target_weight,
        height: request.height,
        activity_level: request.activity_level,
        monthly_budget: request.monthly_budget,
        dietary_restrictions: request.dietary_restrictions,
        additional_notes: request.additional_notes,
        nutritionist_notes: request.nutritionist_notes,
        meal_plan: request.meal_plan
      },
      comprehensive_plan_data: request.comprehensive_plan_data,
      comprehensive_plan_data_type: typeof request.comprehensive_plan_data,
      comprehensive_plan_data_keys: request.comprehensive_plan_data ? Object.keys(request.comprehensive_plan_data) : null,
      weekly_plans_type: request.comprehensive_plan_data?.weekly_plans ? typeof request.comprehensive_plan_data.weekly_plans : null,
      weekly_plans_length: request.comprehensive_plan_data?.weekly_plans ? request.comprehensive_plan_data.weekly_plans.length : null,
      weekly_plans_sample: request.comprehensive_plan_data?.weekly_plans ? request.comprehensive_plan_data.weekly_plans[0] : null,
      plan_created_at: request.plan_created_at,
      plan_updated_at: request.plan_updated_at,
      created_at: request.created_at,
      updated_at: request.updated_at
    });

  } catch (error) {
    console.error('Debug diet plan data error:', error);
    res.status(500).json({ error: 'Failed to debug diet plan data' });
  }
};
