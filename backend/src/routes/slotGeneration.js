import express from 'express';
import { verifyToken, verifyTrainer } from '../middleware/auth.js';
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
router.post('/create', verifyToken, verifyTrainer, createSlotGenerationBatch);

// Get all slot generation batches for the authenticated trainer
router.get('/trainer/me', verifyToken, verifyTrainer, getTrainerSlotBatches);

// Get available slots for a trainer on a specific date
router.get('/trainer/:trainer_id/available-slots', verifyToken, verifyTrainer, getAvailableSlotsForDate);

// Get monthly plan assignments for a trainer
router.get('/trainer/:trainer_id/monthly-plan-assignments', verifyToken, verifyTrainer, getMonthlyPlanAssignments);

// Update a slot generation batch
router.put('/batch/:batch_id', verifyToken, verifyTrainer, updateSlotGenerationBatch);

// Delete a slot generation batch
router.delete('/batch/:batch_id', verifyToken, verifyTrainer, deleteSlotGenerationBatch);

export default router;
