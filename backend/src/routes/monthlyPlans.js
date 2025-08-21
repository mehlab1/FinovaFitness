import express from 'express';
import {
  createMonthlyPlan,
  getTrainerMonthlyPlans,
  getApprovedMonthlyPlans,
  updateMonthlyPlan,
  deleteMonthlyPlan,
  debugTrainers
} from '../controllers/monthlyPlanController.js';

const router = express.Router();

// ==============================================
// MONTHLY PLAN ROUTES
// ==============================================

// Debug endpoint to check trainers
router.get('/debug/trainers', debugTrainers);

// Create a new monthly plan (trainer only)
router.post('/create', createMonthlyPlan);

// Get all monthly plans for a specific trainer
router.get('/trainer/:trainer_id', getTrainerMonthlyPlans);

// Get all approved monthly plans (for members to browse)
router.get('/approved', getApprovedMonthlyPlans);

// Update a monthly plan
router.put('/:plan_id', updateMonthlyPlan);

// Delete a monthly plan
router.delete('/:plan_id', deleteMonthlyPlan);

export default router;
