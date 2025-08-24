import { query, getClient } from '../database.js';
import consistencyService from './consistencyService.js';
import loyaltyService from './loyaltyService.js';
import logger from '../utils/logger.js';
import { ErrorHandler, DatabaseError, NotFoundError } from '../utils/errorHandler.js';

class CheckInService {
  /**
   * Search for active members by name, email, or member ID
   * @param {string} searchTerm - Search term (name, email, or member ID)
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of active members
   */
            async searchActiveMembers(searchTerm, limit = 10) {
            try {
              logger.logSearch(`Searching active members with term: ${searchTerm}`);
              
              const queryText = `
                SELECT 
                  u.id,
                  u.first_name,
                  u.last_name,
                  u.email,
                  mp.subscription_status as membership_status,
                  mp.loyalty_points,
                  mp.membership_start_date,
                  mp.membership_end_date,
                  COALESCE(mpl.name, 'Basic') as membership_plan
                FROM users u
                INNER JOIN member_profiles mp ON u.id = mp.user_id
                LEFT JOIN membership_plans mpl ON mp.current_plan_id = mpl.id
                WHERE 
                  u.is_active = true
                  AND mp.subscription_status = 'active'
                  AND (
                    LOWER(u.first_name) LIKE LOWER($1) OR
                    LOWER(u.last_name) LIKE LOWER($1) OR
                    LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE LOWER($1) OR
                    LOWER(u.email) LIKE LOWER($1) OR
                    CAST(u.id AS TEXT) = $1
                  )
                ORDER BY 
                  CASE 
                    WHEN LOWER(u.first_name) = LOWER($1) THEN 1
                    WHEN LOWER(u.last_name) = LOWER($1) THEN 2
                    WHEN LOWER(u.email) = LOWER($1) THEN 3
                    WHEN CAST(u.id AS TEXT) = $1 THEN 4
                    ELSE 5
                  END,
                  u.first_name, u.last_name
                LIMIT $2
              `;
              
              const searchPattern = `%${searchTerm}%`;
              const result = await query(queryText, [searchPattern, limit]);
              
              logger.logSearch(`Found ${result.rows.length} active members for term: ${searchTerm}`);
              
              return result.rows.map(row => ({
                id: row.id,
                first_name: row.first_name,
                last_name: row.last_name,
                email: row.email,
                membership_status: row.membership_status,
                membership_plan: row.membership_plan,
                loyalty_points: row.loyalty_points,
                membership_start_date: row.membership_start_date,
                membership_end_date: row.membership_end_date,
                full_name: `${row.first_name} ${row.last_name}`
              }));
            } catch (error) {
              logger.error(`Error in searchActiveMembers: ${error.message}`, error);
              throw ErrorHandler.createDatabaseError('Failed to search active members', error);
            }
          }

  /**
   * Record a check-in for a member
   * @param {Object} checkInData - Check-in data
   * @param {number} checkInData.user_id - User ID
   * @param {Date} checkInData.check_in_time - Check-in time
   * @param {string} checkInData.check_in_type - Type of check-in
   * @returns {Promise<Object>} Check-in result
   */
  async recordCheckIn(checkInData) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      const { user_id, check_in_time, check_in_type = 'manual' } = checkInData;
      
      logger.logCheckIn(`Recording check-in for user ${user_id} at ${check_in_time}`);
      
      // Verify user exists and is active
      const userQuery = `
        SELECT u.id 
        FROM users u 
        INNER JOIN member_profiles mp ON u.id = mp.user_id 
        WHERE u.id = $1
      `;
      
      const userResult = await client.query(userQuery, [user_id]);
      
      logger.logCheckIn(`User query result for user ${user_id}: ${userResult.rows.length} rows found`);
      
      if (userResult.rows.length === 0) {
        throw ErrorHandler.createNotFoundError('Member not found or inactive');
      }
      
      // Calculate week start for consistency tracking
      const weekStart = consistencyService.calculateWeekStart(check_in_time);
      
      // Insert check-in record
      const insertQuery = `
        INSERT INTO gym_visits (
          user_id, 
          visit_date, 
          check_in_time, 
          check_in_type, 
          consistency_week_start
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id, user_id, visit_date, check_in_time, check_in_type
      `;
      
      // Use provided check_in_time and extract visit date
      const checkInDate = new Date(check_in_time);
      const visitDate = checkInDate.getFullYear() + '-' + 
                       String(checkInDate.getMonth() + 1).padStart(2, '0') + '-' + 
                       String(checkInDate.getDate()).padStart(2, '0');
      
      // Use provided check_in_time
      const localCheckInTime = check_in_time;
      
      const checkInResult = await client.query(insertQuery, [
        user_id,
        visitDate,
        localCheckInTime,
        check_in_type,
        weekStart
      ]);
      
      const checkIn = checkInResult.rows[0];
      
      // Process consistency tracking
      let consistencyUpdated = false;
      let loyaltyPointsAwarded = 0;
      
      try {
        const consistencyResult = await consistencyService.processWeeklyConsistency(user_id, weekStart);
        consistencyUpdated = consistencyResult.updated;
        loyaltyPointsAwarded = consistencyResult.points_awarded || 0;
        
        if (consistencyResult.updated) {
          logger.logConsistencyCheck(`Consistency updated for user ${user_id}, week starting ${weekStart}`);
        }
        
        if (loyaltyPointsAwarded > 0) {
          logger.logLoyaltyAward(`Awarded ${loyaltyPointsAwarded} loyalty points to user ${user_id} for consistency`);
        }
      } catch (consistencyError) {
        logger.error(`Error processing consistency for user ${user_id}: ${consistencyError.message}`, consistencyError);
        // Don't fail the check-in if consistency processing fails
      }
      
      await client.query('COMMIT');
      
      logger.logCheckIn(`Successfully recorded check-in for user ${user_id}, check-in ID: ${checkIn.id}`);
      
      return {
        check_in_id: checkIn.id,
        user_id: checkIn.user_id,
        check_in_time: checkIn.check_in_time,
        check_in_type: checkIn.check_in_type,
        consistency_updated: consistencyUpdated,
        loyalty_points_awarded: loyaltyPointsAwarded
      };
                } catch (error) {
              await client.query('ROLLBACK');
              logger.error(`Error in recordCheckIn: ${error.message}`, error);
              
              // Re-throw as DatabaseError if it's not already a custom error
              if (error.name && ['ValidationError', 'NotFoundError', 'DatabaseError', 'ConflictError'].includes(error.name)) {
                throw error;
              }
              throw ErrorHandler.createDatabaseError('Failed to record check-in', error);
            } finally {
              client.release();
            }
  }

  /**
   * Get recent check-ins with pagination
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Number of results to skip
   * @returns {Promise<Array>} Array of recent check-ins
   */
  async getRecentCheckIns(limit = 20, offset = 0) {
    try {
      logger.logCheckIn(`Fetching recent check-ins with limit: ${limit}, offset: ${offset}`);
      
      const queryText = `
        SELECT 
          gv.id,
          gv.user_id,
          gv.visit_date,
          gv.check_in_time,
          gv.check_in_type,
          u.first_name,
          u.last_name,
          u.email,
          COALESCE(mpl.name, 'Basic') as membership_plan
        FROM gym_visits gv
        INNER JOIN users u ON gv.user_id = u.id
        INNER JOIN member_profiles mp ON u.id = mp.user_id
        LEFT JOIN membership_plans mpl ON mp.current_plan_id = mpl.id
        ORDER BY gv.check_in_time DESC
        LIMIT $1 OFFSET $2
      `;
      
      const result = await query(queryText, [limit, offset]);
      
      logger.logCheckIn(`Retrieved ${result.rows.length} recent check-ins`);
      
      return result.rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        visit_date: row.visit_date,
        check_in_time: row.check_in_time,
        check_in_type: row.check_in_type,
        member_name: `${row.first_name} ${row.last_name}`,
        member_email: row.email,
        membership_plan: row.membership_plan
      }));
                } catch (error) {
              logger.error(`Error in getRecentCheckIns: ${error.message}`, error);
              throw ErrorHandler.createDatabaseError('Failed to retrieve recent check-ins', error);
            }
  }

  /**
   * Get check-in history for a specific member
   * @param {number} userId - User ID
   * @param {number} limit - Maximum number of results
   * @param {number} offset - Number of results to skip
   * @param {string} startDate - Start date filter (optional)
   * @param {string} endDate - End date filter (optional)
   * @returns {Promise<Array>} Array of check-ins
   */
  async getMemberCheckInHistory(userId, limit = 50, offset = 0, startDate = null, endDate = null) {
    try {
      logger.logCheckIn(`Fetching check-in history for user ${userId}`);
      
      let queryText = `
        SELECT 
          gv.id,
          gv.visit_date,
          gv.check_in_time,
          gv.check_in_type,
          gv.consistency_week_start
        FROM gym_visits gv
        WHERE gv.user_id = $1
      `;
      
      const params = [userId];
      let paramIndex = 2;
      
      if (startDate) {
        queryText += ` AND gv.visit_date >= $${paramIndex}`;
        params.push(startDate);
        paramIndex++;
      }
      
      if (endDate) {
        queryText += ` AND gv.visit_date <= $${paramIndex}`;
        params.push(endDate);
        paramIndex++;
      }
      
      queryText += `
        ORDER BY gv.check_in_time DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      
      params.push(limit, offset);
      
      const result = await query(queryText, params);
      
      logger.logCheckIn(`Retrieved ${result.rows.length} check-ins for user ${userId}`);
      
      return result.rows.map(row => ({
        id: row.id,
        visit_date: row.visit_date,
        check_in_time: row.check_in_time,
        check_in_type: row.check_in_type,
        consistency_week_start: row.consistency_week_start
      }));
                } catch (error) {
              logger.error(`Error in getMemberCheckInHistory: ${error.message}`, error);
              throw ErrorHandler.createDatabaseError('Failed to retrieve member check-in history', error);
            }
  }

  /**
   * Get member consistency data
   * @param {number} userId - User ID
   * @param {number} weeks - Number of weeks to retrieve
   * @returns {Promise<Object>} Consistency data
   */
  async getMemberConsistency(userId, weeks = 4) {
    try {
      logger.logConsistencyCheck(`Fetching consistency data for user ${userId}, ${weeks} weeks`);
      
      // Get current week consistency
      const currentWeek = consistencyService.calculateWeekStart(new Date());
      const currentWeekData = await consistencyService.getCurrentWeekConsistency(userId, currentWeek);
      
      // Get historical consistency
      const history = await consistencyService.getConsistencyHistory(userId, weeks);
      
      // Get loyalty balance
      const loyaltyBalance = await loyaltyService.getLoyaltyBalance(userId);
      
      logger.logConsistencyCheck(`Retrieved consistency data for user ${userId}: ${history.length} weeks`);
      
      return {
        current_week: currentWeekData,
        weeks: history,
        loyalty_balance: loyaltyBalance,
        total_consistent_weeks: history.filter(w => w.consistency_achieved).length,
        total_points_earned: history.reduce((sum, w) => sum + (w.points_awarded || 0), 0)
      };
                } catch (error) {
              logger.error(`Error in getMemberConsistency: ${error.message}`, error);
              throw ErrorHandler.createDatabaseError('Failed to retrieve member consistency data', error);
            }
  }

  /**
   * Calculate week start date (Monday)
   * @param {Date} date - Date to calculate week start for
   * @returns {string} Week start date in YYYY-MM-DD format
   */
  calculateWeekStart(date) {
    return consistencyService.calculateWeekStart(date);
  }
}

export default new CheckInService();
