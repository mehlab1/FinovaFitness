const express = require('express');
const router = express.Router();
const errorMonitoringService = require('../services/errorMonitoringService');
const logger = require('../utils/logger');
const { ErrorHandler } = require('../utils/errorHandler');

/**
 * @route   GET /api/monitoring/health
 * @desc    Get system health status
 * @access  Private (Admin only)
 */
router.get('/health', async (req, res) => {
  try {
    const healthStatus = errorMonitoringService.getHealthStatus();
    
    logger.info('Health check requested', {
      status: healthStatus.status,
      uptime: healthStatus.uptime.hours + 'h',
      errorRate: healthStatus.metrics.errorRate
    });
    
    res.json({
      success: true,
      data: healthStatus
    });
  } catch (error) {
    ErrorHandler.handleError(error, req, res);
  }
});

/**
 * @route   GET /api/monitoring/errors
 * @desc    Get error statistics
 * @access  Private (Admin only)
 */
router.get('/errors', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const hoursNum = parseInt(hours);
    
    if (isNaN(hoursNum) || hoursNum < 1 || hoursNum > 168) {
      throw ErrorHandler.createValidationError('Hours must be between 1 and 168 (1 week)', 'hours');
    }
    
    const errorStats = errorMonitoringService.getErrorStats(hoursNum);
    
    logger.info('Error statistics requested', {
      hours: hoursNum,
      totalErrors: errorStats.totalErrors,
      errorRate: errorStats.errorRate
    });
    
    res.json({
      success: true,
      data: errorStats
    });
  } catch (error) {
    ErrorHandler.handleError(error, req, res);
  }
});

/**
 * @route   GET /api/monitoring/performance
 * @desc    Get performance statistics
 * @access  Private (Admin only)
 */
router.get('/performance', async (req, res) => {
  try {
    const performanceStats = errorMonitoringService.getPerformanceStats();
    
    logger.info('Performance statistics requested', {
      totalRequests: performanceStats.overall.totalRequests,
      avgResponseTime: performanceStats.overall.avgResponseTime
    });
    
    res.json({
      success: true,
      data: performanceStats
    });
  } catch (error) {
    ErrorHandler.handleError(error, req, res);
  }
});

/**
 * @route   GET /api/monitoring/status
 * @desc    Get comprehensive system status
 * @access  Private (Admin only)
 */
router.get('/status', async (req, res) => {
  try {
    const healthStatus = errorMonitoringService.getHealthStatus();
    const errorStats = errorMonitoringService.getErrorStats(24);
    const performanceStats = errorMonitoringService.getPerformanceStats();
    
    const systemStatus = {
      health: healthStatus,
      errors: errorStats,
      performance: performanceStats,
      timestamp: new Date().toISOString()
    };
    
    logger.info('System status requested', {
      status: healthStatus.status,
      errorRate: errorStats.errorRate,
      totalRequests: performanceStats.overall.totalRequests
    });
    
    res.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    ErrorHandler.handleError(error, req, res);
  }
});

/**
 * @route   POST /api/monitoring/reset
 * @desc    Reset monitoring data
 * @access  Private (Admin only)
 */
router.post('/reset', async (req, res) => {
  try {
    errorMonitoringService.reset();
    
    logger.warn('Monitoring data reset by admin', {
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Monitoring data reset successfully'
    });
  } catch (error) {
    ErrorHandler.handleError(error, req, res);
  }
});

/**
 * @route   GET /api/monitoring/logs
 * @desc    Get recent system logs (basic implementation)
 * @access  Private (Admin only)
 */
router.get('/logs', async (req, res) => {
  try {
    const { level = 'INFO', limit = 100 } = req.query;
    const limitNum = parseInt(limit);
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      throw ErrorHandler.createValidationError('Limit must be between 1 and 1000', 'limit');
    }
    
    // This is a basic implementation - in production, you'd want to read from log files
    // or use a proper logging service like Winston with file transport
    const logs = {
      message: 'Log retrieval not implemented in this version',
      note: 'In production, implement log file reading or use a logging service',
      level,
      limit: limitNum,
      timestamp: new Date().toISOString()
    };
    
    logger.info('Log retrieval requested', {
      level,
      limit: limitNum,
      userId: req.user?.id
    });
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    ErrorHandler.handleError(error, req, res);
  }
});

module.exports = router;
