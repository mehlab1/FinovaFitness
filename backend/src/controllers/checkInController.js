import checkInService from '../services/checkInService.js';
import logger from '../utils/logger.js';
import { ErrorHandler, ValidationError, NotFoundError } from '../utils/errorHandler.js';

class CheckInController {
  /**
   * Search for active members by name, email, or member ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async searchMembers(req, res) {
    try {
      const { q: searchTerm, limit = 10 } = req.query;
      
      logger.logSearch(`Searching members with term: ${searchTerm}`);
      
      // Validate search term
      if (!searchTerm || searchTerm.trim().length < 2) {
        throw ErrorHandler.createValidationError('Search term must be at least 2 characters long', 'searchTerm');
      }

      // Validate limit
      if (limit) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
          throw ErrorHandler.createValidationError('Limit must be a number between 1 and 50', 'limit');
        }
      }

      const members = await checkInService.searchActiveMembers(searchTerm.trim(), parseInt(limit));
      
      logger.logSearch(`Found ${members.length} members for search term: ${searchTerm}`);
      
      res.json({
        success: true,
        data: members,
        count: members.length
      });
    } catch (error) {
      ErrorHandler.handleError(error, req, res);
    }
  }

    /**
   * Record a check-in for a member
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async checkInMember(req, res) {
    try {
      const { user_id, check_in_time, check_in_type = 'manual' } = req.body;
      
      logger.logCheckIn(`Recording check-in for user ${user_id} at ${check_in_time}`);
      
      // Validate required fields
      ErrorHandler.validateRequiredFields({ user_id, check_in_time }, ['user_id', 'check_in_time']);
      
      // Validate user_id type
      ErrorHandler.validateFieldType(parseInt(user_id), 'user_id', 'number');
      if (parseInt(user_id) <= 0) {
        throw ErrorHandler.createValidationError('User ID must be a positive integer', 'user_id');
      }

      // Validate check-in time format
      const checkInDate = new Date(check_in_time);
      if (isNaN(checkInDate.getTime())) {
        throw ErrorHandler.createValidationError('Invalid check-in time format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)', 'check_in_time');
      }

      // Check if check-in time is not in the future
      const now = new Date();
      if (checkInDate > now) {
        throw ErrorHandler.createValidationError('Check-in time cannot be in the future', 'check_in_time');
      }

      // Validate check_in_type
      if (check_in_type && typeof check_in_type !== 'string') {
        throw ErrorHandler.createValidationError('Check-in type must be a string', 'check_in_type');
      }
      if (check_in_type && check_in_type.length > 20) {
        throw ErrorHandler.createValidationError('Check-in type must be 20 characters or less', 'check_in_type');
      }
    
      const checkInData = {
        user_id: parseInt(user_id),
        check_in_time: checkInDate,
        check_in_type: check_in_type
      };

      const result = await checkInService.recordCheckIn(checkInData);
      
      logger.logCheckIn(`Successfully recorded check-in for user ${user_id}, check-in ID: ${result.check_in_id}`);
      
      res.status(201).json({
        success: true,
        data: {
          check_in_id: result.check_in_id,
          user_id: result.user_id,
          check_in_time: result.check_in_time,
          check_in_type: result.check_in_type,
          consistency_updated: result.consistency_updated,
          loyalty_points_awarded: result.loyalty_points_awarded
        },
        message: 'Check-in recorded successfully'
      });
    } catch (error) {
      ErrorHandler.handleError(error, req, res);
    }
  }

  /**
   * Get recent check-ins for display
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getRecentCheckIns(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;
      
      logger.logCheckIn(`Fetching recent check-ins with limit: ${limit}, offset: ${offset}`);
      
      // Validate pagination parameters
      if (limit) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
          throw ErrorHandler.createValidationError('Limit must be a number between 1 and 100', 'limit');
        }
      }
      
      if (offset) {
        const offsetNum = parseInt(offset);
        if (isNaN(offsetNum) || offsetNum < 0) {
          throw ErrorHandler.createValidationError('Offset must be a non-negative number', 'offset');
        }
      }
      
      const checkIns = await checkInService.getRecentCheckIns(parseInt(limit), parseInt(offset));
      
      logger.logCheckIn(`Retrieved ${checkIns.length} recent check-ins`);
      
      res.json({
        success: true,
        data: checkIns,
        count: checkIns.length,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      ErrorHandler.handleError(error, req, res);
    }
  }

  /**
   * Get check-in history for a specific member
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMemberCheckInHistory(req, res) {
    try {
      const { userId } = req.params;
      const { limit = 50, offset = 0, start_date, end_date } = req.query;
      
      logger.logCheckIn(`Fetching check-in history for user ${userId}`);
      
      // Validate user ID
      if (!userId || isNaN(parseInt(userId)) || parseInt(userId) <= 0) {
        throw ErrorHandler.createValidationError('Valid user ID is required', 'userId');
      }

      // Validate pagination parameters
      if (limit) {
        const limitNum = parseInt(limit);
        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
          throw ErrorHandler.createValidationError('Limit must be a number between 1 and 100', 'limit');
        }
      }
      
      if (offset) {
        const offsetNum = parseInt(offset);
        if (isNaN(offsetNum) || offsetNum < 0) {
          throw ErrorHandler.createValidationError('Offset must be a non-negative number', 'offset');
        }
      }

      // Validate date range if provided
      if (start_date && end_date) {
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw ErrorHandler.createValidationError('Invalid date format. Use YYYY-MM-DD format', 'date');
        }
        
        if (startDate > endDate) {
          throw ErrorHandler.createValidationError('Start date cannot be after end date', 'date');
        }
        
        // Check if date range is not too large (max 1 year)
        const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        if (daysDiff > 365) {
          throw ErrorHandler.createValidationError('Date range cannot exceed 1 year', 'date');
        }
      }

      const history = await checkInService.getMemberCheckInHistory(
        parseInt(userId),
        parseInt(limit),
        parseInt(offset),
        start_date,
        end_date
      );
      
      logger.logCheckIn(`Retrieved ${history.length} check-ins for user ${userId}`);
      
      res.json({
        success: true,
        data: history,
        count: history.length,
        user_id: parseInt(userId),
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    } catch (error) {
      ErrorHandler.handleError(error, req, res);
    }
  }

  /**
   * Get member consistency data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getMemberConsistency(req, res) {
    try {
      const { userId } = req.params;
      const { weeks = 4 } = req.query;
      
      logger.logConsistencyCheck(`Fetching consistency data for user ${userId}`);
      
      // Validate user ID
      if (!userId || isNaN(parseInt(userId)) || parseInt(userId) <= 0) {
        throw ErrorHandler.createValidationError('Valid user ID is required', 'userId');
      }

      // Validate weeks parameter
      if (weeks) {
        const weeksNum = parseInt(weeks);
        if (isNaN(weeksNum) || weeksNum < 1 || weeksNum > 52) {
          throw ErrorHandler.createValidationError('Weeks must be a number between 1 and 52', 'weeks');
        }
      }

      const consistency = await checkInService.getMemberConsistency(parseInt(userId), parseInt(weeks));
      
      logger.logConsistencyCheck(`Retrieved consistency data for user ${userId}: ${consistency.weeks.length} weeks`);
      
      res.json({
        success: true,
        data: consistency,
        user_id: parseInt(userId)
      });
    } catch (error) {
      ErrorHandler.handleError(error, req, res);
    }
  }
}

export default new CheckInController();
