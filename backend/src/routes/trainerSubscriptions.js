import express from 'express';
import { verifyToken, verifyTrainer } from '../middleware/auth.js';
import {
  getPendingSubscriptions,
  getTrainerSubscriptions,
  approveSubscriptionRequest,
  rejectSubscriptionRequest,
  getTrainerSubscriptionStats,
  getSubscriptionDetails
} from '../controllers/trainerSubscriptionController.js';

const router = express.Router();

// Get pending subscription requests (trainer_id will be extracted from authenticated user)
router.get('/pending', verifyToken, verifyTrainer, getPendingSubscriptions);

// Get all trainer subscriptions
router.get('/subscriptions', verifyToken, verifyTrainer, getTrainerSubscriptions);

// Get subscription statistics
router.get('/stats', verifyToken, verifyTrainer, getTrainerSubscriptionStats);

// Get subscription details
router.get('/subscriptions/:subscription_id', verifyToken, verifyTrainer, getSubscriptionDetails);

// Approve subscription request
router.post('/approve', verifyToken, verifyTrainer, approveSubscriptionRequest);

// Reject subscription request
router.post('/reject', verifyToken, verifyTrainer, rejectSubscriptionRequest);

export default router;
