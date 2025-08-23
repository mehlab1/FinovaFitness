import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getAvailableMonthlyPlans,
  requestSubscription,
  getMemberSubscriptions,
  cancelSubscription,
  getSubscriptionDetails
} from '../controllers/memberMonthlyPlanController.js';

const router = express.Router();

// Middleware to check if user is a member
const requireMember = (req, res, next) => {
  if (req.user && req.user.role === 'member') {
    next();
  } else {
    res.status(403).json({ error: 'Member access required' });
  }
};

// Get available monthly plans for browsing
router.get('/:member_id/available', verifyToken, requireMember, getAvailableMonthlyPlans);

// Get member's subscriptions
router.get('/:member_id/subscriptions', verifyToken, requireMember, getMemberSubscriptions);

// Get subscription details
router.get('/:member_id/subscriptions/:subscription_id', verifyToken, requireMember, getSubscriptionDetails);

// Request subscription to a plan
router.post('/:member_id/request-subscription', verifyToken, requireMember, requestSubscription);

// Cancel a subscription
router.post('/:member_id/cancel-subscription', verifyToken, requireMember, cancelSubscription);

export default router;
