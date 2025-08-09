import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Verify JWT token middleware
export const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await query(
      'SELECT * FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = userResult.rows[0];
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Verify trainer role middleware
export const verifyTrainer = async (req, res, next) => {
  try {
    if (req.user.role !== 'trainer') {
      return res.status(403).json({ error: 'Access denied. Trainer role required.' });
    }

    // Get trainer record
    const trainerResult = await query(
      'SELECT * FROM trainers WHERE user_id = $1',
      [req.userId]
    );

    if (trainerResult.rows.length === 0) {
      return res.status(403).json({ error: 'Trainer profile not found' });
    }

    req.trainer = trainerResult.rows[0];
    next();
  } catch (error) {
    console.error('Trainer verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Verify admin role middleware
export const verifyAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Verify member role middleware
export const verifyMember = async (req, res, next) => {
  try {
    if (!['member', 'trainer', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied. Member access required.' });
    }
    next();
  } catch (error) {
    console.error('Member verification error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};
