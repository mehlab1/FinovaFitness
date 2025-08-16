import express from 'express';
import { verifyToken, verifyNutritionist } from '../middleware/auth.js';
import {
  getMealPlanTemplates,
  getMealPlanTemplate,
  createMealPlanTemplate,
  updateMealPlanTemplate,
  deleteMealPlanTemplate,
  getPublicTemplates
} from '../controllers/mealPlanTemplateController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);
router.use(verifyNutritionist);

// Get all templates for the authenticated nutritionist
router.get('/', getMealPlanTemplates);

// Get a specific template
router.get('/:templateId', getMealPlanTemplate);

// Create a new template
router.post('/', createMealPlanTemplate);

// Update a template
router.put('/:templateId', updateMealPlanTemplate);

// Delete a template (soft delete)
router.delete('/:templateId', deleteMealPlanTemplate);

// Get public templates from other nutritionists
router.get('/public/all', getPublicTemplates);

export default router;
