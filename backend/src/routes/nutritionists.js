import express from 'express';
import { verifyToken, verifyNutritionist } from '../middleware/auth.js';
import * as nutritionistController from '../controllers/nutritionistController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(verifyNutritionist);

// Dashboard routes
router.get('/dashboard', nutritionistController.getNutritionistDashboard);

// Diet plan request routes
router.get('/diet-plan-requests', nutritionistController.getDietPlanRequests);
router.put('/diet-plan-requests/:requestId', nutritionistController.updateDietPlanRequest);

export default router;
