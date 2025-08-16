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
    const { status, nutritionist_notes, meal_plan, preparation_time } = req.body;

    // Verify the request belongs to this nutritionist
    const verifyResult = await query(
      'SELECT id FROM diet_plan_requests WHERE id = $1 AND nutritionist_id = $2',
      [requestId, nutritionistId]
    );

    if (verifyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Diet plan request not found' });
    }

    // Update the request
    const result = await query(
      `UPDATE diet_plan_requests 
       SET status = $1, nutritionist_notes = $2, meal_plan = $3, preparation_time = $4, updated_at = CURRENT_TIMESTAMP
       WHERE id = $5 AND nutritionist_id = $6
       RETURNING *`,
      [status, nutritionist_notes, meal_plan, preparation_time, requestId, nutritionistId]
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

    const stats = {
      pending: 0,
      approved: 0,
      rejected: 0,
      completed: 0
    };

    statsResult.rows.forEach(row => {
      stats[row.status] = parseInt(row.count);
    });

    res.json({
      stats,
      recentRequests: recentRequestsResult.rows
    });

  } catch (error) {
    console.error('Get nutritionist dashboard error:', error);
    res.status(500).json({ error: 'Failed to get nutritionist dashboard' });
  }
};
