import express from 'express';
import { verifyToken, verifyTrainer } from '../middleware/auth.js';
import * as trainerController from '../controllers/trainerController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(verifyTrainer);

// Dashboard routes
router.get('/dashboard', trainerController.getDashboard);
router.get('/schedule', trainerController.getSchedule);
router.get('/analytics', trainerController.getAnalytics);

// Client management routes
router.get('/requests', trainerController.getRequests);
router.put('/requests/:id', trainerController.updateRequest);

export default router;
