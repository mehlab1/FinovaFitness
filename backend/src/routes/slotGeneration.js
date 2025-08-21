import express from 'express';
import {
  createSlotGenerationBatch,
  getTrainerSlotBatches,
  getAvailableSlotsForDate,
  getMonthlyPlanAssignments,
  updateSlotGenerationBatch,
  deleteSlotGenerationBatch
} from '../controllers/slotGenerationController.js';

const router = express.Router();

// ==============================================
// SLOT GENERATION ROUTES
// ==============================================

// Create a new slot generation batch
router.post('/create', createSlotGenerationBatch);

// Get all slot generation batches for a specific trainer
router.get('/trainer/:trainer_id', getTrainerSlotBatches);

// Get available slots for a trainer on a specific date
router.get('/trainer/:trainer_id/available-slots', getAvailableSlotsForDate);

// Get monthly plan assignments for a trainer
router.get('/trainer/:trainer_id/monthly-plan-assignments', getMonthlyPlanAssignments);

// Update a slot generation batch
router.put('/batch/:batch_id', updateSlotGenerationBatch);

// Delete a slot generation batch
router.delete('/batch/:batch_id', deleteSlotGenerationBatch);

export default router;
