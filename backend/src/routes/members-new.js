import express from 'express';
import { verifyToken, verifyMember } from '../middleware/auth.js';
import * as memberController from '../controllers/memberController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(verifyMember);

// Dashboard and profile routes
router.get('/dashboard', memberController.getDashboard);
router.get('/bookings', memberController.getBookings);
router.get('/workout-schedule', memberController.getWorkoutSchedule);

// Staff and services routes
router.get('/trainers', memberController.getTrainers);
router.get('/nutritionists', memberController.getNutritionists);

// Booking and request routes
router.post('/training-request', memberController.createTrainingRequest);

export default router;
