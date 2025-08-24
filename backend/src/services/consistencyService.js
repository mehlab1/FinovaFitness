import { query } from '../database.js';
import loyaltyService from './loyaltyService.js';
import logger from '../utils/logger.js';

class ConsistencyService {
  /**
   * Calculate the start of the calendar week (Monday)
   * @param {Date} date - Date to calculate week start for
   * @returns {string} Week start date in YYYY-MM-DD format
   */
  calculateWeekStart(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  }

  /**
   * Calculate the end of the calendar week (Sunday)
   * @param {Date} date - Date to calculate week end for
   * @returns {string} Week end date in YYYY-MM-DD format
   */
  calculateWeekEnd(date) {
    const weekStart = this.calculateWeekStart(date);
    const endDate = new Date(weekStart);
    endDate.setDate(endDate.getDate() + 6); // Add 6 days to get Sunday
    return endDate.toISOString().split('T')[0];
  }

  /**
   * Get check-ins for a specific week
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date (YYYY-MM-DD)
   * @returns {Promise<Array>} Array of check-ins for the week
   */
  async getWeeklyCheckIns(userId, weekStart) {
    try {
      const queryText = `
        SELECT 
          id,
          visit_date,
          check_in_time,
          check_in_type
        FROM gym_visits
        WHERE user_id = $1 
        AND consistency_week_start = $2
        ORDER BY check_in_time ASC
      `;
      
      const result = await query(queryText, [userId, weekStart]);
      return result.rows;
    } catch (error) {
      logger.error(`Error in getWeeklyCheckIns: ${error.message}`, error);
      throw new Error('Failed to get weekly check-ins');
    }
  }

  /**
   * Check if consistency is achieved for a week (5+ days)
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date (YYYY-MM-DD)
   * @returns {Promise<boolean>} True if consistency is achieved
   */
  async checkConsistencyAchievement(userId, weekStart) {
    try {
      const checkIns = await this.getWeeklyCheckIns(userId, weekStart);
      
      // Count unique days with check-ins
      const uniqueDays = new Set(checkIns.map(checkIn => checkIn.visit_date));
      const checkInsCount = uniqueDays.size;
      
      const isConsistent = checkInsCount >= 5;
      
      logger.logConsistencyCheck(`User ${userId} has ${checkInsCount} check-in days for week ${weekStart}, consistency: ${isConsistent}`);
      
      return isConsistent;
    } catch (error) {
      logger.error(`Error in checkConsistencyAchievement: ${error.message}`, error);
      throw new Error('Failed to check consistency achievement');
    }
  }

  /**
   * Award consistency points for a week
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date (YYYY-MM-DD)
   * @returns {Promise<Object>} Award result
   */
  async awardConsistencyPoints(userId, weekStart) {
    try {
      // Check if points were already awarded for this week
      const existingRecord = await this.getConsistencyRecord(userId, weekStart);
      
      if (existingRecord && existingRecord.points_awarded > 0) {
        logger.logLoyaltyAward(`Points already awarded for user ${userId}, week ${weekStart}`);
        return {
          awarded: false,
          reason: 'Points already awarded for this week',
          points_awarded: existingRecord.points_awarded
        };
      }
      
      // Award 10 loyalty points
      const awardResult = await loyaltyService.awardPoints(
        userId,
        10,
        'consistency_achievement',
        null // Don't use reference_id for now
      );
      
      if (awardResult.success) {
        logger.logLoyaltyAward(`Awarded 10 loyalty points to user ${userId} for consistency in week ${weekStart}`);
        
        // Update consistency record with points awarded
        await this.updateConsistencyRecord(userId, weekStart, 5, true, 10);
        
        return {
          awarded: true,
          points_awarded: 10,
          new_balance: awardResult.new_balance
        };
      } else {
        throw new Error('Failed to award loyalty points');
      }
    } catch (error) {
      logger.error(`Error in awardConsistencyPoints: ${error.message}`, error);
      throw new Error('Failed to award consistency points');
    }
  }

  /**
   * Process weekly consistency and award points if applicable
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date (YYYY-MM-DD)
   * @returns {Promise<Object>} Processing result
   */
  async processWeeklyConsistency(userId, weekStart) {
    try {
      logger.logConsistencyCheck(`Processing weekly consistency for user ${userId}, week ${weekStart}`);
      
      // Check if consistency is achieved
      const isConsistent = await this.checkConsistencyAchievement(userId, weekStart);
      
      // Get or create consistency record
      let record = await this.getConsistencyRecord(userId, weekStart);
      
      if (!record) {
        // Create new record
        const checkIns = await this.getWeeklyCheckIns(userId, weekStart);
        const uniqueDays = new Set(checkIns.map(checkIn => checkIn.visit_date));
        const checkInsCount = uniqueDays.size;
        
        record = await this.createConsistencyRecord(userId, weekStart, checkInsCount, isConsistent);
      } else {
        // Update existing record
        const checkIns = await this.getWeeklyCheckIns(userId, weekStart);
        const uniqueDays = new Set(checkIns.map(checkIn => checkIn.visit_date));
        const checkInsCount = uniqueDays.size;
        
        record = await this.updateConsistencyRecord(userId, weekStart, checkInsCount, isConsistent);
      }
      
      let pointsAwarded = 0;
      let updated = false;
      
      // Award points if consistency is achieved and not already awarded
      if (isConsistent && record.points_awarded === 0) {
        const awardResult = await this.awardConsistencyPoints(userId, weekStart);
        pointsAwarded = awardResult.points_awarded || 0;
        updated = true;
      }
      
      logger.logConsistencyCheck(`Completed consistency processing for user ${userId}, week ${weekStart}: consistent=${isConsistent}, points_awarded=${pointsAwarded}`);
      
      return {
        updated,
        consistency_achieved: isConsistent,
        check_ins_count: record.check_ins_count,
        points_awarded: pointsAwarded,
        week_start: weekStart
      };
    } catch (error) {
      logger.error(`Error in processWeeklyConsistency: ${error.message}`, error);
      throw new Error('Failed to process weekly consistency');
    }
  }

  /**
   * Get or create consistency record for a week
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date (YYYY-MM-DD)
   * @returns {Promise<Object|null>} Consistency record
   */
  async getConsistencyRecord(userId, weekStart) {
    try {
      const queryText = `
        SELECT 
          id,
          user_id,
          week_start_date,
          week_end_date,
          check_ins_count,
          consistency_achieved,
          points_awarded,
          created_at,
          updated_at
        FROM consistency_achievements
        WHERE user_id = $1 AND week_start_date = $2
      `;
      
      const result = await query(queryText, [userId, weekStart]);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error in getConsistencyRecord: ${error.message}`, error);
      throw new Error('Failed to get consistency record');
    }
  }

  /**
   * Create consistency record for a week
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date (YYYY-MM-DD)
   * @param {number} checkInsCount - Number of check-ins
   * @param {boolean} consistencyAchieved - Whether consistency is achieved
   * @returns {Promise<Object>} Created record
   */
  async createConsistencyRecord(userId, weekStart, checkInsCount, consistencyAchieved) {
    try {
      const weekEnd = this.calculateWeekEnd(new Date(weekStart));
      
      const queryText = `
        INSERT INTO consistency_achievements (
          user_id,
          week_start_date,
          week_end_date,
          check_ins_count,
          consistency_achieved,
          points_awarded
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const result = await query(queryText, [
        userId,
        weekStart,
        weekEnd,
        checkInsCount,
        consistencyAchieved,
        0 // No points awarded initially
      ]);
      
      logger.logConsistencyCheck(`Created consistency record for user ${userId}, week ${weekStart}`);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error in createConsistencyRecord: ${error.message}`, error);
      throw new Error('Failed to create consistency record');
    }
  }

  /**
   * Update consistency record for a week
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date (YYYY-MM-DD)
   * @param {number} checkInsCount - Number of check-ins
   * @param {boolean} consistencyAchieved - Whether consistency is achieved
   * @param {number} pointsAwarded - Points awarded (optional)
   * @returns {Promise<Object>} Updated record
   */
  async updateConsistencyRecord(userId, weekStart, checkInsCount, consistencyAchieved, pointsAwarded = null) {
    try {
      let queryText = `
        UPDATE consistency_achievements
        SET 
          check_ins_count = $3,
          consistency_achieved = $4,
          updated_at = CURRENT_TIMESTAMP
      `;
      
      const params = [userId, weekStart, checkInsCount, consistencyAchieved];
      
      if (pointsAwarded !== null) {
        queryText += `, points_awarded = $5`;
        params.push(pointsAwarded);
      }
      
      queryText += `
        WHERE user_id = $1 AND week_start_date = $2
        RETURNING *
      `;
      
      const result = await query(queryText, params);
      
      if (result.rows.length === 0) {
        throw new Error('Consistency record not found');
      }
      
      logger.logConsistencyCheck(`Updated consistency record for user ${userId}, week ${weekStart}`);
      return result.rows[0];
    } catch (error) {
      logger.error(`Error in updateConsistencyRecord: ${error.message}`, error);
      throw new Error('Failed to update consistency record');
    }
  }

  /**
   * Get consistency history for a member
   * @param {number} userId - User ID
   * @param {number} weeks - Number of weeks to retrieve
   * @returns {Promise<Array>} Array of consistency records
   */
  async getConsistencyHistory(userId, weeks = 8) {
    try {
      const queryText = `
        SELECT 
          id,
          week_start_date,
          week_end_date,
          check_ins_count,
          consistency_achieved,
          points_awarded,
          created_at,
          updated_at
        FROM consistency_achievements
        WHERE user_id = $1
        ORDER BY week_start_date DESC
        LIMIT $2
      `;
      
      const result = await query(queryText, [userId, weeks]);
      
      logger.logConsistencyCheck(`Retrieved ${result.rows.length} consistency records for user ${userId}`);
      return result.rows;
    } catch (error) {
      logger.error(`Error in getConsistencyHistory: ${error.message}`, error);
      throw new Error('Failed to get consistency history');
    }
  }

  /**
   * Get current week consistency data
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date (YYYY-MM-DD)
   * @returns {Promise<Object>} Current week consistency data
   */
  async getCurrentWeekConsistency(userId, weekStart) {
    try {
      const checkIns = await this.getWeeklyCheckIns(userId, weekStart);
      const uniqueDays = new Set(checkIns.map(checkIn => checkIn.visit_date));
      const checkInsCount = uniqueDays.size;
      const isConsistent = checkInsCount >= 5;
      
      // Calculate days remaining in the week
      const today = new Date();
      const weekEnd = new Date(this.calculateWeekEnd(new Date(weekStart)));
      const daysRemaining = Math.max(0, Math.ceil((weekEnd - today) / (1000 * 60 * 60 * 24)));
      
      return {
        week_start: weekStart,
        week_end: this.calculateWeekEnd(new Date(weekStart)),
        check_ins_count: checkInsCount,
        consistency_achieved: isConsistent,
        days_remaining: daysRemaining,
        check_ins: checkIns
      };
    } catch (error) {
      logger.error(`Error in getCurrentWeekConsistency: ${error.message}`, error);
      throw new Error('Failed to get current week consistency');
    }
  }
}

export default new ConsistencyService();
