import express from 'express';
const router = express.Router();
import frontDeskController from '../controllers/frontDeskController.js';
import frontDeskValidation from '../middleware/frontDeskValidation.js';
import checkInRoutes from './checkIn.js';

// Member creation endpoint
router.post('/create-member', 
  frontDeskValidation.validateMemberCreation, 
  frontDeskController.createMember
);

// Get membership plans for front desk
router.get('/membership-plans', frontDeskController.getMembershipPlans);

// Get POS summary for front desk
router.get('/pos-summary', frontDeskController.getPOSSummary);

// Include check-in routes
router.use('/checkin', checkInRoutes);

export default router;
