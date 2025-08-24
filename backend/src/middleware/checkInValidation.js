import logger from '../utils/logger.js';

/**
 * Validate check-in data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateCheckIn = (req, res, next) => {
  try {
    const { user_id, check_in_time, check_in_type } = req.body;
    
    // Validate user_id
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    if (isNaN(parseInt(user_id)) || parseInt(user_id) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'User ID must be a positive integer'
      });
    }
    
    // Validate check_in_time
    if (!check_in_time) {
      return res.status(400).json({
        success: false,
        error: 'Check-in time is required'
      });
    }
    
    const checkInDate = new Date(check_in_time);
    if (isNaN(checkInDate.getTime())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid check-in time format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)'
      });
    }
    
    // Check if check-in time is not in the future
    const now = new Date();
    if (checkInDate > now) {
      return res.status(400).json({
        success: false,
        error: 'Check-in time cannot be in the future'
      });
    }
    
    // Validate check_in_type (optional)
    if (check_in_type && typeof check_in_type !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Check-in type must be a string'
      });
    }
    
    if (check_in_type && check_in_type.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Check-in type must be 20 characters or less'
      });
    }
    
    // Add validated data to request
    req.validatedCheckIn = {
      user_id: parseInt(user_id),
      check_in_time: checkInDate,
      check_in_type: check_in_type || 'manual'
    };
    
    logger.info(`Check-in validation passed for user ${user_id}`);
    next();
  } catch (error) {
    logger.error(`Error in validateCheckIn: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: 'Validation error occurred'
    });
  }
};

/**
 * Validate search query parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateSearchQuery = (req, res, next) => {
  try {
    const { q: searchTerm, limit } = req.query;
    
    // Validate search term
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term (q) is required'
      });
    }
    
    if (typeof searchTerm !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Search term must be a string'
      });
    }
    
    const trimmedSearchTerm = searchTerm.trim();
    if (trimmedSearchTerm.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search term must be at least 2 characters long'
      });
    }
    
    if (trimmedSearchTerm.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Search term must be 100 characters or less'
      });
    }
    
    // Validate limit (optional)
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
        return res.status(400).json({
          success: false,
          error: 'Limit must be a number between 1 and 50'
        });
      }
    }
    
    // Add validated data to request
    req.validatedSearch = {
      searchTerm: trimmedSearchTerm,
      limit: limit ? parseInt(limit) : 10
    };
    
    logger.info(`Search validation passed for term: ${trimmedSearchTerm}`);
    next();
  } catch (error) {
    logger.error(`Error in validateSearchQuery: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: 'Validation error occurred'
    });
  }
};

/**
 * Validate user ID parameter
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateUserId = (req, res, next) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }
    
    if (isNaN(parseInt(userId)) || parseInt(userId) <= 0) {
      return res.status(400).json({
        success: false,
        error: 'User ID must be a positive integer'
      });
    }
    
    // Add validated data to request
    req.validatedUserId = parseInt(userId);
    
    logger.info(`User ID validation passed: ${userId}`);
    next();
  } catch (error) {
    logger.error(`Error in validateUserId: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: 'Validation error occurred'
    });
  }
};

/**
 * Validate limit and offset parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateLimit = (req, res, next) => {
  try {
    const { limit, offset } = req.query;
    
    // Validate limit (optional)
    if (limit) {
      const limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        return res.status(400).json({
          success: false,
          error: 'Limit must be a number between 1 and 100'
        });
      }
    }
    
    // Validate offset (optional)
    if (offset) {
      const offsetNum = parseInt(offset);
      if (isNaN(offsetNum) || offsetNum < 0) {
        return res.status(400).json({
          success: false,
          error: 'Offset must be a non-negative number'
        });
      }
    }
    
    // Add validated data to request
    req.validatedPagination = {
      limit: limit ? parseInt(limit) : 20,
      offset: offset ? parseInt(offset) : 0
    };
    
    logger.info(`Pagination validation passed - limit: ${req.validatedPagination.limit}, offset: ${req.validatedPagination.offset}`);
    next();
  } catch (error) {
    logger.error(`Error in validateLimit: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: 'Validation error occurred'
    });
  }
};

/**
 * Validate date range parameters
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const validateDateRange = (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Validate start_date (optional)
    if (start_date) {
      const startDate = new Date(start_date);
      if (isNaN(startDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid start date format. Use YYYY-MM-DD format'
        });
      }
    }
    
    // Validate end_date (optional)
    if (end_date) {
      const endDate = new Date(end_date);
      if (isNaN(endDate.getTime())) {
        return res.status(400).json({
          success: false,
          error: 'Invalid end date format. Use YYYY-MM-DD format'
        });
      }
    }
    
    // Validate date range if both dates are provided
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      
      if (startDate > endDate) {
        return res.status(400).json({
          success: false,
          error: 'Start date cannot be after end date'
        });
      }
      
      // Check if date range is not too large (e.g., max 1 year)
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      if (daysDiff > 365) {
        return res.status(400).json({
          success: false,
          error: 'Date range cannot exceed 1 year'
        });
      }
    }
    
    // Add validated data to request
    req.validatedDateRange = {
      start_date: start_date ? new Date(start_date) : null,
      end_date: end_date ? new Date(end_date) : null
    };
    
    logger.info(`Date range validation passed - start: ${start_date}, end: ${end_date}`);
    next();
  } catch (error) {
    logger.error(`Error in validateDateRange: ${error.message}`, error);
    res.status(500).json({
      success: false,
      error: 'Validation error occurred'
    });
  }
};

export {
  validateCheckIn,
  validateSearchQuery,
  validateUserId,
  validateLimit,
  validateDateRange
};
