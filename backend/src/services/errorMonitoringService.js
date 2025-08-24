const logger = require('../utils/logger');

/**
 * Error Monitoring Service
 * Tracks error rates, patterns, and provides health monitoring
 */
class ErrorMonitoringService {
  constructor() {
    this.errorStore = new Map();
    this.performanceStore = new Map();
    this.healthMetrics = {
      startTime: new Date(),
      totalRequests: 0,
      totalErrors: 0,
      lastError: null,
      systemStatus: 'healthy'
    };
    
    // Clean up old data every hour
    setInterval(() => this.cleanupOldData(), 60 * 60 * 1000);
  }

  /**
   * Record an error
   * @param {Error} error - Error object
   * @param {Object} context - Error context
   */
  recordError(error, context = {}) {
    const timestamp = new Date();
    const errorKey = `${error.name}_${error.message}`;
    
    // Update error store
    if (!this.errorStore.has(errorKey)) {
      this.errorStore.set(errorKey, {
        count: 0,
        firstSeen: timestamp,
        lastSeen: timestamp,
        contexts: []
      });
    }
    
    const errorData = this.errorStore.get(errorKey);
    errorData.count++;
    errorData.lastSeen = timestamp;
    errorData.contexts.push({
      timestamp,
      url: context.url,
      method: context.method,
      userId: context.userId,
      userAgent: context.userAgent,
      ip: context.ip
    });
    
    // Keep only last 10 contexts per error
    if (errorData.contexts.length > 10) {
      errorData.contexts = errorData.contexts.slice(-10);
    }
    
    // Update health metrics
    this.healthMetrics.totalErrors++;
    this.healthMetrics.lastError = {
      timestamp,
      name: error.name,
      message: error.message,
      statusCode: error.statusCode
    };
    
    // Check if system should be marked as degraded
    this.checkSystemHealth();
    
    logger.error(`Error recorded: ${error.name} - ${error.message}`, {
      errorKey,
      count: errorData.count,
      context
    });
  }

  /**
   * Record a request
   * @param {Object} requestData - Request data
   */
  recordRequest(requestData) {
    this.healthMetrics.totalRequests++;
    
    // Record performance metrics
    if (requestData.duration) {
      const endpoint = `${requestData.method}_${requestData.url}`;
      
      if (!this.performanceStore.has(endpoint)) {
        this.performanceStore.set(endpoint, {
          count: 0,
          totalDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          avgDuration: 0
        });
      }
      
      const perfData = this.performanceStore.get(endpoint);
      perfData.count++;
      perfData.totalDuration += requestData.duration;
      perfData.minDuration = Math.min(perfData.minDuration, requestData.duration);
      perfData.maxDuration = Math.max(perfData.maxDuration, requestData.duration);
      perfData.avgDuration = perfData.totalDuration / perfData.count;
    }
  }

  /**
   * Check system health based on error rates
   */
  checkSystemHealth() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    // Count errors in the last hour
    let recentErrors = 0;
    for (const [key, errorData] of this.errorStore.entries()) {
      if (errorData.lastSeen > oneHourAgo) {
        recentErrors += errorData.count;
      }
    }
    
    // Calculate error rate
    const recentRequests = this.healthMetrics.totalRequests;
    const errorRate = recentRequests > 0 ? (recentErrors / recentRequests) * 100 : 0;
    
    // Update system status
    if (errorRate > 10) {
      this.healthMetrics.systemStatus = 'critical';
      logger.warn(`System health critical: ${errorRate.toFixed(2)}% error rate`);
    } else if (errorRate > 5) {
      this.healthMetrics.systemStatus = 'degraded';
      logger.warn(`System health degraded: ${errorRate.toFixed(2)}% error rate`);
    } else {
      this.healthMetrics.systemStatus = 'healthy';
    }
  }

  /**
   * Get error statistics
   * @param {number} hours - Number of hours to look back
   * @returns {Object} Error statistics
   */
  getErrorStats(hours = 24) {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
    
    const stats = {
      totalErrors: 0,
      errorTypes: {},
      topErrors: [],
      errorRate: 0,
      timeRange: `${hours}h`
    };
    
    // Count errors by type
    for (const [key, errorData] of this.errorStore.entries()) {
      if (errorData.lastSeen > cutoffTime) {
        const errorName = key.split('_')[0];
        stats.totalErrors += errorData.count;
        
        if (!stats.errorTypes[errorName]) {
          stats.errorTypes[errorName] = 0;
        }
        stats.errorTypes[errorName] += errorData.count;
      }
    }
    
    // Calculate error rate
    const recentRequests = this.healthMetrics.totalRequests;
    stats.errorRate = recentRequests > 0 ? (stats.totalErrors / recentRequests) * 100 : 0;
    
    // Get top errors
    const topErrors = Array.from(this.errorStore.entries())
      .filter(([key, errorData]) => errorData.lastSeen > cutoffTime)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([key, errorData]) => ({
        error: key,
        count: errorData.count,
        lastSeen: errorData.lastSeen
      }));
    
    stats.topErrors = topErrors;
    
    return stats;
  }

  /**
   * Get performance statistics
   * @returns {Object} Performance statistics
   */
  getPerformanceStats() {
    const stats = {
      endpoints: {},
      overall: {
        totalRequests: 0,
        avgResponseTime: 0,
        slowestEndpoint: null
      }
    };
    
    let totalRequests = 0;
    let totalDuration = 0;
    let slowestEndpoint = null;
    let slowestDuration = 0;
    
    for (const [endpoint, perfData] of this.performanceStore.entries()) {
      stats.endpoints[endpoint] = {
        count: perfData.count,
        avgDuration: perfData.avgDuration,
        minDuration: perfData.minDuration,
        maxDuration: perfData.maxDuration
      };
      
      totalRequests += perfData.count;
      totalDuration += perfData.totalDuration;
      
      if (perfData.avgDuration > slowestDuration) {
        slowestDuration = perfData.avgDuration;
        slowestEndpoint = endpoint;
      }
    }
    
    stats.overall.totalRequests = totalRequests;
    stats.overall.avgResponseTime = totalRequests > 0 ? totalDuration / totalRequests : 0;
    stats.overall.slowestEndpoint = slowestEndpoint;
    
    return stats;
  }

  /**
   * Get system health status
   * @returns {Object} Health status
   */
  getHealthStatus() {
    const uptime = Date.now() - this.healthMetrics.startTime.getTime();
    const errorRate = this.healthMetrics.totalRequests > 0 
      ? (this.healthMetrics.totalErrors / this.healthMetrics.totalRequests) * 100 
      : 0;
    
    return {
      status: this.healthMetrics.systemStatus,
      uptime: {
        milliseconds: uptime,
        seconds: Math.floor(uptime / 1000),
        minutes: Math.floor(uptime / (1000 * 60)),
        hours: Math.floor(uptime / (1000 * 60 * 60)),
        days: Math.floor(uptime / (1000 * 60 * 60 * 24))
      },
      metrics: {
        totalRequests: this.healthMetrics.totalRequests,
        totalErrors: this.healthMetrics.totalErrors,
        errorRate: errorRate.toFixed(2) + '%',
        lastError: this.healthMetrics.lastError
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Clean up old data
   */
  cleanupOldData() {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Clean up old error data
    for (const [key, errorData] of this.errorStore.entries()) {
      if (errorData.lastSeen < oneDayAgo) {
        this.errorStore.delete(key);
      }
    }
    
    // Clean up old performance data
    for (const [key, perfData] of this.performanceStore.entries()) {
      if (perfData.count === 0) {
        this.performanceStore.delete(key);
      }
    }
    
    logger.info('Cleaned up old monitoring data');
  }

  /**
   * Reset monitoring data
   */
  reset() {
    this.errorStore.clear();
    this.performanceStore.clear();
    this.healthMetrics = {
      startTime: new Date(),
      totalRequests: 0,
      totalErrors: 0,
      lastError: null,
      systemStatus: 'healthy'
    };
    
    logger.info('Monitoring data reset');
  }
}

// Create singleton instance
const errorMonitoringService = new ErrorMonitoringService();

module.exports = errorMonitoringService;
