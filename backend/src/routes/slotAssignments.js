import express from 'express';
import {
  assignSlotToMonthlyPlan,
  assignSlotForOneTimeSession,
  getTrainerSlotAssignments,
  updateSlotAssignment,
  deleteSlotAssignment
} from '../controllers/slotAssignmentController.js';

const router = express.Router();

// ==============================================
// SLOT ASSIGNMENT ROUTES
// ==============================================

/**
 * POST /api/slot-assignments/monthly-plan
 * Assign a slot to a monthly plan member
 */
router.post('/monthly-plan', assignSlotToMonthlyPlan);

/**
 * POST /api/slot-assignments/one-time
 * Assign a slot for one-time training session
 */
router.post('/one-time', assignSlotForOneTimeSession);

/**
 * GET /api/slot-assignments/trainer/:trainer_id
 * Get all slot assignments for a trainer
 */
router.get('/trainer/:trainer_id', getTrainerSlotAssignments);

/**
 * PUT /api/slot-assignments/:assignment_id
 * Update a slot assignment
 */
router.put('/:assignment_id', updateSlotAssignment);

/**
 * DELETE /api/slot-assignments/:assignment_id
 * Delete a slot assignment
 */
router.delete('/:assignment_id', deleteSlotAssignment);

export default router;
