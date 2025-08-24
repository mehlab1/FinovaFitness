/**
 * Custom Logger Utility for Finova Fitness Application
 * Provides structured logging with different levels and specialized methods
 */

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
    this.logLevels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3
    };
    this.requestIdCounter = 0;
  }

  /**
   * Get current timestamp
   * @returns {string} Formatted timestamp
   */
  getTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Check if a log level should be output
   * @param {string} level - Log level to check
   * @returns {boolean} True if should log
   */
  shouldLog(level) {
    return this.logLevels[level] <= this.logLevels[this.logLevel];
  }

  /**
   * Format log message
   * @param {string} level - Log level
   * @param {string} message - Log message
   * @param {Object} data - Additional data
   * @returns {string} Formatted log message
   */
  formatMessage(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const baseMessage = `[${timestamp}] [${level}] ${message}`;
    
    if (data) {
      if (typeof data === 'object') {
        return `${baseMessage} - ${JSON.stringify(data)}`;
      }
      return `${baseMessage} - ${data}`;
    }
    
    return baseMessage;
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error|Object} error - Error object or additional data
   */
  error(message, error = null) {
    if (!this.shouldLog('ERROR')) return;
    
    let logData = null;
    if (error) {
      if (error instanceof Error) {
        logData = {
          message: error.message,
          stack: error.stack,
          name: error.name
        };
      } else {
        logData = error;
      }
    }
    
    console.error(this.formatMessage('ERROR', message, logData));
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   * @param {Object} data - Additional data
   */
  warn(message, data = null) {
    if (!this.shouldLog('WARN')) return;
    console.warn(this.formatMessage('WARN', message, data));
  }

  /**
   * Log info message
   * @param {string} message - Info message
   * @param {Object} data - Additional data
   */
  info(message, data = null) {
    if (!this.shouldLog('INFO')) return;
    console.info(this.formatMessage('INFO', message, data));
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   * @param {Object} data - Additional data
   */
  debug(message, data = null) {
    if (!this.shouldLog('DEBUG')) return;
    console.debug(this.formatMessage('DEBUG', message, data));
  }

  /**
   * Log check-in operations
   * @param {string} message - Log message
   * @param {Object} data - Check-in data
   */
  logCheckIn(message, data = null) {
    this.info(`[CHECK-IN] ${message}`, data);
  }

  /**
   * Log consistency check operations
   * @param {string} message - Log message
   * @param {Object} data - Consistency data
   */
  logConsistencyCheck(message, data = null) {
    this.info(`[CONSISTENCY] ${message}`, data);
  }

  /**
   * Log loyalty award operations
   * @param {string} message - Log message
   * @param {Object} data - Loyalty data
   */
  logLoyaltyAward(message, data = null) {
    this.info(`[LOYALTY] ${message}`, data);
  }

  /**
   * Log search operations
   * @param {string} message - Log message
   * @param {Object} data - Search data
   */
  logSearch(message, data = null) {
    this.debug(`[SEARCH] ${message}`, data);
  }

  /**
   * Log API request
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} params - Request parameters
   * @param {string} userId - User ID (optional)
   */
  logApiRequest(method, url, params = null, userId = null) {
    const data = {
      method,
      url,
      params,
      userId
    };
    this.debug(`[API REQUEST] ${method} ${url}`, data);
  }

  /**
   * Log API response
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} statusCode - Response status code
   * @param {number} responseTime - Response time in ms
   * @param {string} userId - User ID (optional)
   */
  logApiResponse(method, url, statusCode, responseTime = null, userId = null) {
    const data = {
      method,
      url,
      statusCode,
      responseTime,
      userId
    };
    this.debug(`[API RESPONSE] ${method} ${url} - ${statusCode}`, data);
  }

  /**
   * Log database operation
   * @param {string} operation - Database operation
   * @param {string} table - Table name
   * @param {Object} data - Operation data
   * @param {number} duration - Operation duration in ms
   */
  logDatabaseOperation(operation, table, data = null, duration = null) {
    const message = `[DB] ${operation} on ${table}`;
    const logData = {
      operation,
      table,
      data,
      duration
    };
    this.debug(message, logData);
  }

  /**
   * Log performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in ms
   * @param {Object} metrics - Additional metrics
   */
  logPerformance(operation, duration, metrics = null) {
    const data = {
      operation,
      duration,
      metrics
    };
    this.info(`[PERFORMANCE] ${operation} completed in ${duration}ms`, data);
  }

  /**
   * Log security events
   * @param {string} event - Security event
   * @param {Object} data - Event data
   * @param {string} userId - User ID (optional)
   */
  logSecurity(event, data = null, userId = null) {
    const logData = {
      event,
      data,
      userId
    };
    this.warn(`[SECURITY] ${event}`, logData);
  }

  /**
   * Set log level
   * @param {string} level - Log level (ERROR, WARN, INFO, DEBUG)
   */
  setLogLevel(level) {
    if (this.logLevels.hasOwnProperty(level)) {
      this.logLevel = level;
      this.info(`Log level set to ${level}`);
    } else {
      this.error(`Invalid log level: ${level}`);
    }
  }

  /**
   * Get current log level
   * @returns {string} Current log level
   */
  getLogLevel() {
    return this.logLevel;
  }

  /**
   * Generate unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    this.requestIdCounter++;
    return `req_${Date.now()}_${this.requestIdCounter}`;
  }

  /**
   * Log database operation
   * @param {string} operation - Database operation (SELECT, INSERT, UPDATE, DELETE)
   * @param {string} table - Table name
   * @param {Object} data - Operation data
   * @param {number} duration - Operation duration in ms
   * @param {string} requestId - Request ID for tracking
   */
  logDatabaseOperation(operation, table, data = null, duration = null, requestId = null) {
    const logData = {
      operation,
      table,
      data,
      duration,
      requestId,
      timestamp: this.getTimestamp()
    };
    
    this.info(`[DB] ${operation} on ${table}${duration ? ` (${duration}ms)` : ''}`, logData);
  }

  /**
   * Log API request
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {Object} params - Request parameters
   * @param {string} userId - User ID (optional)
   * @param {string} requestId - Request ID for tracking
   */
  logApiRequest(method, url, params = null, userId = null, requestId = null) {
    const data = {
      method,
      url,
      params,
      userId,
      requestId,
      timestamp: this.getTimestamp()
    };
    this.debug(`[API REQUEST] ${method} ${url}`, data);
  }

  /**
   * Log API response
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} statusCode - Response status code
   * @param {number} responseTime - Response time in ms
   * @param {string} userId - User ID (optional)
   * @param {string} requestId - Request ID for tracking
   */
  logApiResponse(method, url, statusCode, responseTime = null, userId = null, requestId = null) {
    const data = {
      method,
      url,
      statusCode,
      responseTime,
      userId,
      requestId,
      timestamp: this.getTimestamp()
    };
    this.debug(`[API RESPONSE] ${method} ${url} - ${statusCode}${responseTime ? ` (${responseTime}ms)` : ''}`, data);
  }

  /**
   * Log performance metrics
   * @param {string} operation - Operation name
   * @param {number} duration - Duration in ms
   * @param {Object} metrics - Additional metrics
   * @param {string} requestId - Request ID for tracking
   */
  logPerformance(operation, duration, metrics = null, requestId = null) {
    const data = {
      operation,
      duration,
      metrics,
      requestId,
      timestamp: this.getTimestamp()
    };
    this.info(`[PERFORMANCE] ${operation} completed in ${duration}ms`, data);
  }

  /**
   * Log security events
   * @param {string} event - Security event
   * @param {Object} data - Event data
   * @param {string} userId - User ID (optional)
   * @param {string} requestId - Request ID for tracking
   */
  logSecurity(event, data = null, userId = null, requestId = null) {
    const logData = {
      event,
      data,
      userId,
      requestId,
      timestamp: this.getTimestamp()
    };
    this.warn(`[SECURITY] ${event}`, logData);
  }

  /**
   * Log business logic events
   * @param {string} event - Business event
   * @param {Object} data - Event data
   * @param {string} userId - User ID (optional)
   * @param {string} requestId - Request ID for tracking
   */
  logBusinessEvent(event, data = null, userId = null, requestId = null) {
    const logData = {
      event,
      data,
      userId,
      requestId,
      timestamp: this.getTimestamp()
    };
    this.info(`[BUSINESS] ${event}`, logData);
  }

  /**
   * Log system events
   * @param {string} event - System event
   * @param {Object} data - Event data
   * @param {string} requestId - Request ID for tracking
   */
  logSystemEvent(event, data = null, requestId = null) {
    const logData = {
      event,
      data,
      requestId,
      timestamp: this.getTimestamp()
    };
    this.info(`[SYSTEM] ${event}`, logData);
  }

  /**
   * Create a child logger with additional context
   * @param {Object} context - Additional context
   * @returns {Object} Child logger methods
   */
  child(context) {
    const childLogger = {
      error: (message, error) => this.error(`[${context.module}] ${message}`, error),
      warn: (message, data) => this.warn(`[${context.module}] ${message}`, data),
      info: (message, data) => this.info(`[${context.module}] ${message}`, data),
      debug: (message, data) => this.debug(`[${context.module}] ${message}`, data),
      logCheckIn: (message, data) => this.logCheckIn(`[${context.module}] ${message}`, data),
      logConsistencyCheck: (message, data) => this.logConsistencyCheck(`[${context.module}] ${message}`, data),
      logLoyaltyAward: (message, data) => this.logLoyaltyAward(`[${context.module}] ${message}`, data),
      logSearch: (message, data) => this.logSearch(`[${context.module}] ${message}`, data),
      logDatabaseOperation: (operation, table, data, duration, requestId) => 
        this.logDatabaseOperation(operation, table, data, duration, requestId),
      logApiRequest: (method, url, params, userId, requestId) => 
        this.logApiRequest(method, url, params, userId, requestId),
      logApiResponse: (method, url, statusCode, responseTime, userId, requestId) => 
        this.logApiResponse(method, url, statusCode, responseTime, userId, requestId),
      logPerformance: (operation, duration, metrics, requestId) => 
        this.logPerformance(operation, duration, metrics, requestId),
      logSecurity: (event, data, userId, requestId) => 
        this.logSecurity(event, data, userId, requestId),
      logBusinessEvent: (event, data, userId, requestId) => 
        this.logBusinessEvent(event, data, userId, requestId),
      logSystemEvent: (event, data, requestId) => 
        this.logSystemEvent(event, data, requestId)
    };

    return childLogger;
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;
