import logger from './logger.js';

/**
 * Custom Error Classes for different types of errors
 */
class ValidationError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.statusCode = 400;
  }
}

class DatabaseError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
    this.statusCode = 500;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = 403;
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
    this.statusCode = 409;
  }
}

/**
 * Error Response Utility
 */
class ErrorHandler {
  /**
   * Create standardized error response
   * @param {Error} error - Error object
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  static handleError(error, req, res) {
    const errorId = this.generateErrorId();
    const timestamp = new Date().toISOString();
    
    // Log the error with context
    logger.error(`Error ${errorId}: ${error.message}`, {
      errorId,
      errorName: error.name,
      statusCode: error.statusCode || 500,
      url: req.url,
      method: req.method,
      userId: req.user?.id,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      timestamp,
      stack: error.stack
    });

    // Determine status code
    const statusCode = error.statusCode || 500;
    
    // Create error response
    const errorResponse = {
      success: false,
      error: {
        id: errorId,
        message: this.getUserFriendlyMessage(error),
        type: error.name || 'InternalServerError',
        timestamp
      }
    };

    // Add field-specific error for validation errors
    if (error instanceof ValidationError && error.field) {
      errorResponse.error.field = error.field;
    }

    // Add additional details in development mode
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.details = {
        originalMessage: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method
      };
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
  }

  /**
   * Generate unique error ID
   * @returns {string} Unique error ID
   */
  static generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly message
   */
  static getUserFriendlyMessage(error) {
    // Custom error messages for different error types
    const errorMessages = {
      ValidationError: {
        'User ID is required': 'Please provide a valid member ID',
        'Check-in time is required': 'Please provide a valid check-in time',
        'Invalid check-in time format': 'Please provide a valid date and time',
        'Check-in time cannot be in the future': 'Check-in time cannot be in the future',
        'Search term must be at least 2 characters long': 'Please enter at least 2 characters to search',
        'Search term must be 100 characters or less': 'Search term is too long',
        'Limit must be a number between 1 and 50': 'Invalid limit value',
        'User ID must be a positive integer': 'Invalid member ID format',
        'Start date cannot be after end date': 'Invalid date range',
        'Date range cannot exceed 1 year': 'Date range is too large'
      },
      DatabaseError: {
        'Member not found or inactive': 'Member not found or membership is inactive',
        'Failed to search active members': 'Unable to search members at this time',
        'Failed to record check-in': 'Unable to record check-in at this time',
        'Failed to retrieve recent check-ins': 'Unable to load recent check-ins',
        'Failed to retrieve member check-in history': 'Unable to load check-in history',
        'Failed to retrieve member consistency data': 'Unable to load consistency data',
        'Failed to process weekly consistency': 'Unable to process consistency data',
        'Failed to award consistency points': 'Unable to award loyalty points',
        'Failed to get loyalty balance': 'Unable to load loyalty balance',
        'Failed to record loyalty transaction': 'Unable to process loyalty transaction'
      },
      AuthenticationError: {
        'Authentication required': 'Please log in to access this feature',
        'Invalid token': 'Your session has expired. Please log in again',
        'Token expired': 'Your session has expired. Please log in again'
      },
      AuthorizationError: {
        'Access denied': 'You do not have permission to access this feature',
        'Front desk access required': 'This feature is only available to front desk staff'
      },
      NotFoundError: {
        'Member not found': 'Member not found in the system',
        'Check-in record not found': 'Check-in record not found',
        'Consistency record not found': 'Consistency record not found'
      },
      ConflictError: {
        'Points already awarded for this week': 'Loyalty points have already been awarded for this week',
        'Check-in already exists': 'This check-in has already been recorded'
      }
    };

    // Get specific error type messages
    const typeMessages = errorMessages[error.name] || {};
    
    // Return specific message if available, otherwise return generic message
    return typeMessages[error.message] || error.message || 'An unexpected error occurred';
  }

  /**
   * Create validation error
   * @param {string} message - Error message
   * @param {string} field - Field name (optional)
   * @returns {ValidationError} Validation error instance
   */
  static createValidationError(message, field = null) {
    return new ValidationError(message, field);
  }

  /**
   * Create database error
   * @param {string} message - Error message
   * @param {Error} originalError - Original database error
   * @returns {DatabaseError} Database error instance
   */
  static createDatabaseError(message, originalError = null) {
    return new DatabaseError(message, originalError);
  }

  /**
   * Create not found error
   * @param {string} message - Error message
   * @returns {NotFoundError} Not found error instance
   */
  static createNotFoundError(message = 'Resource not found') {
    return new NotFoundError(message);
  }

  /**
   * Create conflict error
   * @param {string} message - Error message
   * @returns {ConflictError} Conflict error instance
   */
  static createConflictError(message = 'Resource conflict') {
    return new ConflictError(message);
  }

  /**
   * Handle async route errors
   * @param {Function} fn - Async route function
   * @returns {Function} Express middleware function
   */
  static asyncHandler(fn) {
    return (req, res, next) => {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }

  /**
   * Validate required fields
   * @param {Object} data - Data object to validate
   * @param {Array} requiredFields - Array of required field names
   * @param {string} context - Context for error messages
   * @throws {ValidationError} If required fields are missing
   */
  static validateRequiredFields(data, requiredFields, context = 'data') {
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === '') {
        throw this.createValidationError(`${field} is required`, field);
      }
    }
  }

  /**
   * Validate field type
   * @param {*} value - Value to validate
   * @param {string} fieldName - Field name
   * @param {string} expectedType - Expected type
   * @throws {ValidationError} If type is invalid
   */
  static validateFieldType(value, fieldName, expectedType) {
    let isValid = false;
    
    switch (expectedType) {
      case 'number':
        isValid = typeof value === 'number' && !isNaN(value);
        break;
      case 'string':
        isValid = typeof value === 'string';
        break;
      case 'boolean':
        isValid = typeof value === 'boolean';
        break;
      case 'date':
        isValid = value instanceof Date && !isNaN(value.getTime());
        break;
      case 'array':
        isValid = Array.isArray(value);
        break;
      case 'object':
        isValid = typeof value === 'object' && value !== null && !Array.isArray(value);
        break;
      default:
        isValid = true;
    }

    if (!isValid) {
      throw this.createValidationError(`${fieldName} must be a ${expectedType}`, fieldName);
    }
  }

  /**
   * Validate field range
   * @param {number} value - Value to validate
   * @param {string} fieldName - Field name
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @throws {ValidationError} If value is out of range
   */
  static validateFieldRange(value, fieldName, min, max) {
    if (value < min || value > max) {
      throw this.createValidationError(`${fieldName} must be between ${min} and ${max}`, fieldName);
    }
  }

  /**
   * Validate string length
   * @param {string} value - Value to validate
   * @param {string} fieldName - Field name
   * @param {number} minLength - Minimum length
   * @param {number} maxLength - Maximum length
   * @throws {ValidationError} If string length is invalid
   */
  static validateStringLength(value, fieldName, minLength, maxLength) {
    if (value.length < minLength) {
      throw this.createValidationError(`${fieldName} must be at least ${minLength} characters long`, fieldName);
    }
    if (value.length > maxLength) {
      throw this.createValidationError(`${fieldName} must be ${maxLength} characters or less`, fieldName);
    }
  }
}

export {
  ErrorHandler,
  ValidationError,
  DatabaseError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError
};
