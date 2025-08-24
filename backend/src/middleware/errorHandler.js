const { ErrorHandler } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Global error handling middleware
 * This middleware catches all errors and provides standardized error responses
 */
const globalErrorHandler = (error, req, res, next) => {
  // Log the error for debugging
  logger.error(`Unhandled error: ${error.message}`, {
    error: error,
    url: req.url,
    method: req.method,
    userId: req.user?.id,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Use the ErrorHandler utility to create standardized error response
  ErrorHandler.handleError(error, req, res);
};

/**
 * 404 Not Found middleware
 * This middleware handles requests to non-existent routes
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Route ${req.originalUrl} not found`);
  error.name = 'NotFoundError';
  error.statusCode = 404;
  
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`, {
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  ErrorHandler.handleError(error, req, res);
};

/**
 * Request validation middleware
 * This middleware validates common request patterns
 */
const requestValidator = (req, res, next) => {
  // Validate Content-Type for POST/PUT requests
  if ((req.method === 'POST' || req.method === 'PUT') && req.headers['content-type']) {
    if (!req.headers['content-type'].includes('application/json')) {
      const error = new Error('Content-Type must be application/json');
      error.name = 'ValidationError';
      error.statusCode = 400;
      return ErrorHandler.handleError(error, req, res);
    }
  }

  // Validate request body size (limit to 1MB)
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > 1024 * 1024) {
    const error = new Error('Request body too large');
    error.name = 'ValidationError';
    error.statusCode = 413;
    return ErrorHandler.handleError(error, req, res);
  }

  next();
};

/**
 * Request logging middleware
 * This middleware logs all incoming requests
 */
const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log the incoming request
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    userId: req.user?.id,
    timestamp: new Date().toISOString()
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Log the response
    logger.info(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`, {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });

    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Security middleware
 * This middleware adds basic security headers
 */
const securityHeaders = (req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add CORS headers if needed
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  next();
};

/**
 * Rate limiting middleware (basic implementation)
 * This middleware implements basic rate limiting
 */
const rateLimiter = (req, res, next) => {
  // Simple in-memory rate limiting (in production, use Redis or similar)
  const clientIp = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // 100 requests per window

  // Initialize rate limit store if not exists
  if (!req.app.locals.rateLimitStore) {
    req.app.locals.rateLimitStore = new Map();
  }

  const store = req.app.locals.rateLimitStore;
  
  // Clean old entries
  for (const [key, value] of store.entries()) {
    if (now - value.timestamp > windowMs) {
      store.delete(key);
    }
  }

  // Check rate limit
  const clientData = store.get(clientIp);
  if (!clientData) {
    store.set(clientIp, { count: 1, timestamp: now });
  } else if (now - clientData.timestamp > windowMs) {
    store.set(clientIp, { count: 1, timestamp: now });
  } else if (clientData.count >= maxRequests) {
    const error = new Error('Too many requests');
    error.name = 'RateLimitError';
    error.statusCode = 429;
    return ErrorHandler.handleError(error, req, res);
  } else {
    clientData.count++;
  }

  next();
};

module.exports = {
  globalErrorHandler,
  notFoundHandler,
  requestValidator,
  requestLogger,
  securityHeaders,
  rateLimiter
};
