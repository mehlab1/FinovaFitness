import express from 'express';
import checkInController from '../controllers/checkInController.js';
import { verifyToken } from '../middleware/auth.js';
import { 
  validateCheckIn, 
  validateSearchQuery, 
  validateUserId, 
  validateLimit 
} from '../middleware/checkInValidation.js';

// Middleware to verify front desk role
const verifyFrontDesk = (req, res, next) => {
  if (req.user.role !== 'front_desk') {
    return res.status(403).json({ error: 'Access denied. Front desk role required.' });
  }
  next();
};

const router = express.Router();

/**
 * @route   GET /api/checkin/search
 * @desc    Search for active members by name, email, or member ID
 * @access  Private (Front desk users)
 */
router.get('/search', 
  verifyToken, 
  verifyFrontDesk,
  validateSearchQuery, 
  checkInController.searchMembers
);

/**
 * @route   POST /api/checkin/checkin
 * @desc    Record a check-in for a member
 * @access  Private (Front desk users)
 */
router.post('/checkin', 
  verifyToken, 
  verifyFrontDesk,
  validateCheckIn, 
  checkInController.checkInMember
);

/**
 * @route   GET /api/checkin/recent
 * @desc    Get recent check-ins with pagination
 * @access  Private (Front desk users)
 */
router.get('/recent', 
  verifyToken, 
  verifyFrontDesk,
  validateLimit, 
  checkInController.getRecentCheckIns
);

/**
 * @route   GET /api/checkin/history/:userId
 * @desc    Get check-in history for a specific member
 * @access  Private (Front desk users)
 */
router.get('/history/:userId', 
  verifyToken, 
  verifyFrontDesk,
  validateUserId, 
  validateLimit, 
  checkInController.getMemberCheckInHistory
);

/**
 * @route   GET /api/checkin/consistency/:userId
 * @desc    Get member consistency data
 * @access  Private (Front desk users)
 */
router.get('/consistency/:userId', 
  verifyToken, 
  verifyFrontDesk,
  validateUserId, 
  checkInController.getMemberConsistency
);

export default router;
