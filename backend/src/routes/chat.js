import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
  getChatMessages,
  sendMessage,
  getUnreadCount,
  getChatSummary,
  uploadFile
} from '../controllers/chatController.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for PDF uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/diet-plans/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'diet-plan-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for PDFs
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed!'), false);
    }
  }
});

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Get chat messages for a specific diet plan request
router.get('/messages/:requestId', getChatMessages);

// Send a new message
router.post('/send/:requestId', sendMessage);

// Upload a file (PDF) to chat
router.post('/upload/:requestId', upload.single('file'), (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 10MB.' });
    }
    return res.status(400).json({ error: 'File upload error: ' + err.message });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
}, uploadFile);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Get chat summary (list of active chats)
router.get('/summary', getChatSummary);

export default router;
