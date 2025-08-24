import { query, getClient } from '../database.js';
import logger from '../utils/logger.js';

class LoyaltyService {
  /**
   * Award points to a user
   * @param {number} userId - User ID
   * @param {number} points - Points to award
   * @param {string} reason - Reason for awarding points
   * @param {string} referenceId - Reference ID for the transaction
   * @returns {Promise<Object>} Award result
   */
  async awardPoints(userId, points, reason, referenceId = null) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      logger.logLoyaltyAward(`Awarding ${points} points to user ${userId} for reason: ${reason}`);
      
      // Validate input
      if (!userId || !points || points <= 0) {
        throw new Error('Invalid user ID or points amount');
      }
      
      // Check if user exists and has a member profile
      const userQuery = `
        SELECT u.id, mp.loyalty_points 
        FROM users u 
        INNER JOIN member_profiles mp ON u.id = mp.user_id 
        WHERE u.id = $1
      `;
      
      const userResult = await client.query(userQuery, [userId]);
      
      if (userResult.rows.length === 0) {
        throw new Error('User not found or no member profile exists');
      }
      
      const currentBalance = userResult.rows[0].loyalty_points || 0;
      const newBalance = currentBalance + points;
      
      // Update member profile with new balance
      const updateProfileQuery = `
        UPDATE member_profiles 
        SET loyalty_points = $2, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;
      
      await client.query(updateProfileQuery, [userId, newBalance]);
      
      // Record the transaction
      const transactionId = await this.recordLoyaltyTransaction(
        client,
        userId,
        points,
        'credit',
        reason,
        referenceId
      );
      
      await client.query('COMMIT');
      
      logger.logLoyaltyAward(`Successfully awarded ${points} points to user ${userId}. New balance: ${newBalance}`);
      
      return {
        success: true,
        transaction_id: transactionId,
        points_awarded: points,
        previous_balance: currentBalance,
        new_balance: newBalance,
        reason: reason
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error in awardPoints: ${error.message}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get current loyalty points balance for a user
   * @param {number} userId - User ID
   * @returns {Promise<number>} Current balance
   */
  async getLoyaltyBalance(userId) {
    try {
      const queryText = `
        SELECT loyalty_points 
        FROM member_profiles 
        WHERE user_id = $1
      `;
      
      const result = await query(queryText, [userId]);
      
      if (result.rows.length === 0) {
        throw new Error('User not found or no member profile exists');
      }
      
      return result.rows[0].loyalty_points || 0;
    } catch (error) {
      logger.error(`Error in getLoyaltyBalance: ${error.message}`, error);
      throw new Error('Failed to get loyalty balance');
    }
  }

  /**
   * Record a loyalty transaction
   * @param {Object} client - Database client (for transactions)
   * @param {number} userId - User ID
   * @param {number} points - Points amount
   * @param {string} transactionType - Type of transaction (credit/debit)
   * @param {string} description - Transaction description
   * @param {string} referenceId - Reference ID (optional)
   * @returns {Promise<number>} Transaction ID
   */
  async recordLoyaltyTransaction(client, userId, points, transactionType, description, referenceId = null) {
    try {
      const queryText = `
        INSERT INTO loyalty_transactions (
          user_id,
          points_change,
          transaction_type,
          description,
          reference_id,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING id
      `;
      
      const result = await client.query(queryText, [
        userId,
        points,
        transactionType,
        description,
        referenceId
      ]);
      
      const transactionId = result.rows[0].id;
      
      logger.logLoyaltyAward(`Recorded loyalty transaction ${transactionId} for user ${userId}: ${points} points, type: ${transactionType}`);
      
      return transactionId;
    } catch (error) {
      logger.error(`Error in recordLoyaltyTransaction: ${error.message}`, error);
      throw new Error('Failed to record loyalty transaction');
    }
  }

  /**
   * Update loyalty for consistency achievement
   * @param {number} userId - User ID
   * @param {string} weekStart - Week start date
   * @returns {Promise<Object>} Update result
   */
  async updateLoyaltyForConsistency(userId, weekStart) {
    try {
      logger.logLoyaltyAward(`Updating loyalty for consistency achievement - user ${userId}, week ${weekStart}`);
      
      // Check if points were already awarded for this week
      const existingTransaction = await this.getLoyaltyTransactionByReference(
        userId,
        null // Don't use reference_id for now
      );
      
      if (existingTransaction) {
        logger.logLoyaltyAward(`Consistency points already awarded for user ${userId}, week ${weekStart}`);
        return {
          success: false,
          reason: 'Points already awarded for this week',
          points_awarded: existingTransaction.points_change
        };
      }
      
      // Award 10 points for consistency
      const result = await this.awardPoints(
        userId,
        10,
        'Weekly Consistency Achievement',
        null // Don't use reference_id for now
      );
      
      logger.logLoyaltyAward(`Awarded 10 consistency points to user ${userId} for week ${weekStart}`);
      
      return {
        success: true,
        points_awarded: 10,
        new_balance: result.new_balance
      };
    } catch (error) {
      logger.error(`Error in updateLoyaltyForConsistency: ${error.message}`, error);
      throw new Error('Failed to update loyalty for consistency');
    }
  }

  /**
   * Get loyalty transaction history for a user
   * @param {number} userId - User ID
   * @param {number} limit - Maximum number of transactions
   * @param {number} offset - Number of transactions to skip
   * @returns {Promise<Array>} Array of transactions
   */
  async getLoyaltyHistory(userId, limit = 20, offset = 0) {
    try {
      const queryText = `
        SELECT 
          id,
          points_change,
          transaction_type,
          description,
          reference_id,
          created_at
        FROM loyalty_transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3
      `;
      
      const result = await query(queryText, [userId, limit, offset]);
      
      logger.logLoyaltyAward(`Retrieved ${result.rows.length} loyalty transactions for user ${userId}`);
      
      return result.rows.map(row => ({
        id: row.id,
        points: row.points_change,
        transaction_type: row.transaction_type,
        description: row.description,
        reference_id: row.reference_id,
        created_at: row.created_at
      }));
    } catch (error) {
      logger.error(`Error in getLoyaltyHistory: ${error.message}`, error);
      throw new Error('Failed to get loyalty history');
    }
  }

  /**
   * Deduct points from a user's balance
   * @param {number} userId - User ID
   * @param {number} points - Points to deduct
   * @param {string} reason - Reason for deduction
   * @param {string} referenceId - Reference ID (optional)
   * @returns {Promise<Object>} Deduction result
   */
  async deductPoints(userId, points, reason, referenceId = null) {
    const client = await getClient();
    
    try {
      await client.query('BEGIN');
      
      logger.logLoyaltyAward(`Deducting ${points} points from user ${userId} for reason: ${reason}`);
      
      // Validate input
      if (!userId || !points || points <= 0) {
        throw new Error('Invalid user ID or points amount');
      }
      
      // Check current balance
      const currentBalance = await this.getLoyaltyBalance(userId);
      
      if (currentBalance < points) {
        throw new Error('Insufficient loyalty points balance');
      }
      
      const newBalance = currentBalance - points;
      
      // Update member profile with new balance
      const updateProfileQuery = `
        UPDATE member_profiles 
        SET loyalty_points = $2, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
      `;
      
      await client.query(updateProfileQuery, [userId, newBalance]);
      
      // Record the transaction
      const transactionId = await this.recordLoyaltyTransaction(
        client,
        userId,
        points,
        'debit',
        reason,
        referenceId
      );
      
      await client.query('COMMIT');
      
      logger.logLoyaltyAward(`Successfully deducted ${points} points from user ${userId}. New balance: ${newBalance}`);
      
      return {
        success: true,
        transaction_id: transactionId,
        points_deducted: points,
        previous_balance: currentBalance,
        new_balance: newBalance,
        reason: reason
      };
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error(`Error in deductPoints: ${error.message}`, error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get loyalty statistics for a user
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Loyalty statistics
   */
  async getLoyaltyStats(userId) {
    try {
      // Get current balance
      const currentBalance = await this.getLoyaltyBalance(userId);
      
      // Get total points earned
      const earnedQuery = `
        SELECT COALESCE(SUM(points_change), 0) as total_earned
        FROM loyalty_transactions
        WHERE user_id = $1 AND transaction_type = 'credit'
      `;
      
      const earnedResult = await query(earnedQuery, [userId]);
      const totalEarned = earnedResult.rows[0].total_earned;
      
      // Get total points spent
      const spentQuery = `
        SELECT COALESCE(SUM(points_change), 0) as total_spent
        FROM loyalty_transactions
        WHERE user_id = $1 AND transaction_type = 'debit'
      `;
      
      const spentResult = await query(spentQuery, [userId]);
      const totalSpent = spentResult.rows[0].total_spent;
      
      // Get consistency points earned
      const consistencyQuery = `
        SELECT COALESCE(SUM(points_change), 0) as consistency_points
        FROM loyalty_transactions
        WHERE user_id = $1 
        AND transaction_type = 'credit'
        AND description LIKE '%Consistency%'
      `;
      
      const consistencyResult = await query(consistencyQuery, [userId]);
      const consistencyPoints = consistencyResult.rows[0].consistency_points;
      
      // Get transaction count
      const countQuery = `
        SELECT COUNT(*) as transaction_count
        FROM loyalty_transactions
        WHERE user_id = $1
      `;
      
      const countResult = await query(countQuery, [userId]);
      const transactionCount = countResult.rows[0].transaction_count;
      
      return {
        current_balance: currentBalance,
        total_earned: totalEarned,
        total_spent: totalSpent,
        consistency_points: consistencyPoints,
        transaction_count: transactionCount,
        net_points: totalEarned - totalSpent
      };
    } catch (error) {
      logger.error(`Error in getLoyaltyStats: ${error.message}`, error);
      throw new Error('Failed to get loyalty statistics');
    }
  }

  /**
   * Get loyalty transaction by reference ID
   * @param {number} userId - User ID
   * @param {string} referenceId - Reference ID
   * @returns {Promise<Object|null>} Transaction or null
   */
  async getLoyaltyTransactionByReference(userId, referenceId) {
    try {
      let queryText;
      let params;
      
      if (referenceId === null) {
        queryText = `
          SELECT 
            id,
            points_change,
            transaction_type,
            description,
            reference_id,
            created_at
          FROM loyalty_transactions
          WHERE user_id = $1 AND reference_id IS NULL
          ORDER BY created_at DESC
          LIMIT 1
        `;
        params = [userId];
      } else {
        queryText = `
          SELECT 
            id,
            points_change,
            transaction_type,
            description,
            reference_id,
            created_at
          FROM loyalty_transactions
          WHERE user_id = $1 AND reference_id = $2
          ORDER BY created_at DESC
          LIMIT 1
        `;
        params = [userId, referenceId];
      }
      
      const result = await query(queryText, params);
      return result.rows[0] || null;
    } catch (error) {
      logger.error(`Error in getLoyaltyTransactionByReference: ${error.message}`, error);
      throw new Error('Failed to get loyalty transaction by reference');
    }
  }
}

export default new LoyaltyService();
