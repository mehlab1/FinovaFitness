import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getPendingMonthlyPlans,
  approveMonthlyPlan,
  rejectMonthlyPlan,
  getApprovedMonthlyPlans,
  getMonthlyPlanStats,
  getMonthlyPlanDetails
} from '../controllers/adminMonthlyPlanController.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Get pending monthly plans awaiting approval
router.get('/pending', verifyToken, requireAdmin, getPendingMonthlyPlans);

// Get approved monthly plans
router.get('/approved', verifyToken, requireAdmin, getApprovedMonthlyPlans);

// Get monthly plan statistics
router.get('/stats', verifyToken, requireAdmin, getMonthlyPlanStats);

// Get detailed view of a specific monthly plan
router.get('/:plan_id', verifyToken, requireAdmin, getMonthlyPlanDetails);

// Approve a monthly plan
router.post('/:plan_id/approve', verifyToken, requireAdmin, approveMonthlyPlan);

// Reject a monthly plan
router.post('/:plan_id/reject', verifyToken, requireAdmin, rejectMonthlyPlan);

export default router;
