import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getChatMessages,
  sendMessage,
  getUnreadCount,
  getChatSummary
} from '../controllers/chatController.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get chat messages for a specific diet plan request
router.get('/messages/:requestId', getChatMessages);

// Send a new message
router.post('/send/:requestId', sendMessage);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Get chat summary (list of active chats)
router.get('/summary', getChatSummary);

export default router;
