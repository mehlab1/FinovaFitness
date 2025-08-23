import frontDeskService from '../services/frontDeskService.js';
import { validationResult } from 'express-validator';

const frontDeskController = {
  // Create new member
  async createMember(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const memberData = req.body;
      const result = await frontDeskService.createMember(memberData);

      res.status(201).json({
        success: true,
        message: 'Member created successfully',
        data: result
      });
    } catch (error) {
      console.error('Error creating member:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create member',
        error: error.message
      });
    }
  },

  // Get membership plans
  async getMembershipPlans(req, res) {
    try {
      const plans = await frontDeskService.getMembershipPlans();
      
      res.json({
        success: true,
        data: plans
      });
    } catch (error) {
      console.error('Error fetching membership plans:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch membership plans',
        error: error.message
      });
    }
  },

  // Get POS summary
  async getPOSSummary(req, res) {
    try {
      const summary = await frontDeskService.getPOSSummary();
      
      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Error fetching POS summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch POS summary',
        error: error.message
      });
    }
  }
};

export default frontDeskController;
