import { query } from '../config/database.js';

// Get chat messages for a specific diet plan request
export const getChatMessages = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    // Verify the user has access to this chat
    const accessResult = await query(
      `SELECT id FROM diet_plan_requests 
       WHERE id = $1 AND (
         user_id = $2 OR nutritionist_id = $2
       )`,
      [requestId, userId]
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this chat' });
    }

    // Get chat messages
    const result = await query(
      `SELECT 
         cm.*,
         u.first_name, u.last_name
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.diet_plan_request_id = $1
       ORDER BY cm.created_at ASC`,
      [requestId]
    );

    // Mark messages as read for the other user
    await query(
      `UPDATE chat_messages 
       SET is_read = TRUE 
       WHERE diet_plan_request_id = $1 
       AND sender_id != $2`,
      [requestId, userId]
    );

    res.json(result.rows);

  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({ error: 'Failed to get chat messages' });
  }
};

// Send a new chat message
export const sendMessage = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { message, messageType = 'text', fileUrl } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    // Verify the user has access to this chat
    const accessResult = await query(
      `SELECT id FROM diet_plan_requests 
       WHERE id = $1 AND (
         user_id = $2 OR nutritionist_id = $2
       )`,
      [requestId, userId]
    );

    if (accessResult.rows.length === 0) {
      return res.status(403).json({ error: 'Access denied to this chat' });
    }

    // Determine sender type
    const senderType = userRole === 'nutritionist' ? 'nutritionist' : 'member';

    // Insert the message
    const result = await query(
      `INSERT INTO chat_messages 
       (diet_plan_request_id, sender_id, sender_type, message, message_type, file_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [requestId, userId, senderType, message, messageType, fileUrl]
    );

    // Get the message with sender details
    const messageWithSender = await query(
      `SELECT 
         cm.*,
         u.first_name, u.last_name
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.id = $1`,
      [result.rows[0].id]
    );

    res.json(messageWithSender.rows[0]);

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};

// Get unread message count for a user
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let queryString;
    let params;

    if (userRole === 'nutritionist') {
      // Get unread messages for nutritionist (from members)
      queryString = `
        SELECT COUNT(*) as unread_count
        FROM chat_messages cm
        JOIN diet_plan_requests dpr ON cm.diet_plan_request_id = dpr.id
        WHERE dpr.nutritionist_id = $1 
        AND cm.sender_type = 'member' 
        AND cm.is_read = FALSE
      `;
      params = [userId];
    } else {
      // Get unread messages for member (from nutritionist)
      queryString = `
        SELECT COUNT(*) as unread_count
        FROM chat_messages cm
        JOIN diet_plan_requests dpr ON cm.diet_plan_request_id = dpr.id
        WHERE dpr.user_id = $1 
        AND cm.sender_type = 'nutritionist' 
        AND cm.is_read = FALSE
      `;
      params = [userId];
    }

    const result = await query(queryString, params);
    res.json({ unreadCount: parseInt(result.rows[0].unread_count) });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to get unread count' });
  }
};

// Get chat summary for a user (list of active chats)
export const getChatSummary = async (req, res) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    let queryString;
    let params;

    if (userRole === 'nutritionist') {
      // Get chats where nutritionist is assigned
      queryString = `
        SELECT 
          dpr.id as request_id,
          dpr.fitness_goal,
          dpr.status,
          u.first_name, u.last_name,
          (
            SELECT COUNT(*) 
            FROM chat_messages cm 
            WHERE cm.diet_plan_request_id = dpr.id 
            AND cm.sender_type = 'member' 
            AND cm.is_read = FALSE
          ) as unread_count,
          (
            SELECT cm.message 
            FROM chat_messages cm 
            WHERE cm.diet_plan_request_id = dpr.id 
            ORDER BY cm.created_at DESC 
            LIMIT 1
          ) as last_message,
          (
            SELECT cm.created_at 
            FROM chat_messages cm 
            WHERE cm.diet_plan_request_id = dpr.id 
            ORDER BY cm.created_at DESC 
            LIMIT 1
          ) as last_message_time
        FROM diet_plan_requests dpr
        JOIN users u ON dpr.user_id = u.id
        WHERE dpr.nutritionist_id = $1
        ORDER BY last_message_time DESC NULLS LAST
      `;
      params = [userId];
    } else {
      // Get chats where member is the requester
      queryString = `
        SELECT 
          dpr.id as request_id,
          dpr.fitness_goal,
          dpr.status,
          u.first_name, u.last_name,
          (
            SELECT COUNT(*) 
            FROM chat_messages cm 
            WHERE cm.diet_plan_request_id = dpr.id 
            AND cm.sender_type = 'nutritionist' 
            AND cm.is_read = FALSE
          ) as unread_count,
          (
            SELECT cm.message 
            FROM chat_messages cm 
            WHERE cm.diet_plan_request_id = dpr.id 
            ORDER BY cm.created_at DESC 
            LIMIT 1
          ) as last_message,
          (
            SELECT cm.created_at 
            FROM chat_messages cm 
            WHERE cm.diet_plan_request_id = dpr.id 
            ORDER BY cm.created_at DESC 
            LIMIT 1
          ) as last_message_time
        FROM diet_plan_requests dpr
        JOIN users u ON dpr.nutritionist_id = u.id
        WHERE dpr.user_id = $1
        ORDER BY last_message_time DESC NULLS LAST
      `;
      params = [userId];
    }

    const result = await query(queryString, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Get chat summary error:', error);
    res.status(500).json({ error: 'Failed to get chat summary' });
  }
};
