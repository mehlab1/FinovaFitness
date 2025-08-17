import express from 'express';
import { verifyToken, verifyNutritionist } from '../middleware/auth.js';
import * as nutritionistController from '../controllers/nutritionistController.js';
import { query } from '../config/database.js';

const router = express.Router();

// Public route for members to get available slots (no nutritionist auth required)
router.get('/:nutritionistId/available-slots/:date', async (req, res) => {
  try {
    const { nutritionistId, date } = req.params;
    
    // PostgreSQL DOW: 0=Sunday, 1=Monday, 2=Tuesday, etc.
    // JavaScript getDay(): 0=Sunday, 1=Monday, 2=Tuesday, etc.
    const dayOfWeek = new Date(date).getDay();
    
    console.log(`Fetching slots for nutritionist ${nutritionistId} on date ${date} (day ${dayOfWeek})`);
    
    // First, let's see what's actually in the database for this nutritionist and day
    const debugResult = await query(
      `SELECT 
         ns.id,
         ns.day_of_week,
         ns.time_slot,
         ns.status,
         ns.booking_id,
         ns.client_id
       FROM nutritionist_schedules ns
       WHERE ns.nutritionist_id = $1 
         AND ns.day_of_week = $2`,
      [nutritionistId, dayOfWeek]
    );
    
    console.log(`Debug - Found ${debugResult.rows.length} slots for day ${dayOfWeek}:`, debugResult.rows);
    
    // Now get only available slots
    const result = await query(
      `SELECT 
         ns.id,
         ns.time_slot,
         ns.status,
         ns.booking_id,
         ns.client_id
       FROM nutritionist_schedules ns
       WHERE ns.nutritionist_id = $1 
         AND ns.day_of_week = $2
         AND ns.status = 'available'
       ORDER BY ns.time_slot`,
      [nutritionistId, dayOfWeek]
    );

    console.log(`Available slots: ${result.rows.length}`);
    res.json(result.rows);

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

// Apply authentication middleware to all other routes
router.use(verifyToken);
router.use(verifyNutritionist);

// Dashboard routes
router.get('/dashboard', nutritionistController.getNutritionistDashboard);

// Diet plan request routes
router.get('/diet-plan-requests', nutritionistController.getDietPlanRequests);
router.put('/diet-plan-requests/:requestId', nutritionistController.updateDietPlanRequest);

// Diet plan PDF download route
router.get('/diet-plan-requests/:requestId/download-pdf', nutritionistController.downloadDietPlanPDF);

// Debug endpoint to inspect comprehensive plan data
router.get('/diet-plan-requests/:requestId/debug', nutritionistController.debugDietPlanData);

// Comprehensive Diet Plan routes
router.post('/comprehensive-diet-plans', nutritionistController.createComprehensiveDietPlan);
router.get('/comprehensive-diet-plans/:requestId', nutritionistController.getComprehensiveDietPlan);
router.put('/comprehensive-diet-plans/:requestId', nutritionistController.updateComprehensiveDietPlan);
router.patch('/comprehensive-diet-plans/:requestId/progress', nutritionistController.saveDietPlanProgress);

// Schedule and availability routes
router.get('/availability', nutritionistController.getAvailability);
router.put('/availability', nutritionistController.updateAvailability);
router.post('/generate-time-slots', nutritionistController.generateTimeSlots);
router.get('/available-slots/:date', nutritionistController.getAvailableSlots);
router.get('/schedule', nutritionistController.getSchedule);
router.post('/block-time-slots', nutritionistController.blockTimeSlots);
router.delete('/block-time-slots/:blockId', nutritionistController.unblockTimeSlots);

// Session request routes
router.get('/session-requests', nutritionistController.getSessionRequests);
router.put('/session-requests/:requestId', nutritionistController.updateSessionRequest);

// Session management routes
router.put('/sessions/:sessionId/complete', nutritionistController.markSessionCompleted);

// Get nutritionist ratings and reviews
router.get('/ratings', async (req, res) => {
  try {
    const nutritionistId = req.nutritionist.id;
    
    // Get session ratings
    const sessionRatings = await query(
      `SELECT 
         nsr.rating,
         nsr.review_text,
         nsr.nutritional_guidance,
         nsr.communication,
         nsr.punctuality,
         nsr.professionalism,
         nsr.session_effectiveness,
         nsr.created_at,
         CONCAT(u.first_name, ' ', u.last_name) as client_name,
         nsr.session_request_id,
         nsr.session_type
       FROM nutritionist_session_ratings nsr
       JOIN users u ON nsr.client_id = u.id
       JOIN nutritionist_session_requests nsr2 ON nsr.session_request_id = nsr2.id
       WHERE nsr.nutritionist_id = $1
       ORDER BY nsr.created_at DESC`,
      [nutritionistId]
    );

    // Get diet plan ratings
    const dietPlanRatings = await query(
      `SELECT 
         ndpr.rating,
         ndpr.review_text,
         ndpr.meal_plan_quality,
         ndpr.nutritional_accuracy,
         ndpr.customization_level,
         ndpr.support_quality,
         ndpr.follow_up_support,
         ndpr.created_at,
         CONCAT(u.first_name, ' ', u.last_name) as client_name,
         ndpr.diet_plan_request_id,
         dpr.fitness_goal
       FROM nutritionist_diet_plan_ratings ndpr
       JOIN users u ON ndpr.client_id = u.id
       JOIN diet_plan_requests dpr ON ndpr.diet_plan_request_id = dpr.id
       WHERE ndpr.nutritionist_id = $1
       ORDER BY ndpr.created_at DESC`,
      [nutritionistId]
    );

    // Calculate overall statistics
    const overallRating = await query(
      `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews
       FROM (
         SELECT rating FROM nutritionist_session_ratings WHERE nutritionist_id = $1
         UNION ALL
         SELECT rating FROM nutritionist_diet_plan_ratings WHERE nutritionist_id = $1
       ) all_ratings`,
      [nutritionistId]
    );

    res.json({
      sessionRatings: sessionRatings.rows,
      dietPlanRatings: dietPlanRatings.rows,
      overallRating: overallRating.rows[0]?.avg_rating || 0,
      totalReviews: overallRating.rows[0]?.total_reviews || 0
    });

  } catch (error) {
    console.error('Nutritionist ratings error:', error);
    res.status(500).json({ error: 'Failed to get nutritionist ratings' });
  }
});

export default router;
