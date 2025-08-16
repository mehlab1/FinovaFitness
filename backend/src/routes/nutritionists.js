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

export default router;
