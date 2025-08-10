import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, getClient } from '../database.js';

const router = express.Router();

// Register a new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, phone, date_of_birth, gender, address, emergency_contact, membership_plan_id } = req.body;

    console.log('Backend received registration request:');
    console.log('Email:', email);
    console.log('Email type:', typeof email);
    console.log('Email length:', email?.length);
    console.log('Full request body:', req.body);

    // Validate required fields
    if (!email || !password || !first_name || !role) {
      console.log('Validation failed:');
      console.log('- email:', !!email);
      console.log('- password:', !!password);
      console.log('- first_name:', !!first_name);
      console.log('- last_name:', !!last_name);
      console.log('- role:', !!role);
      return res.status(400).json({ error: 'Missing required fields: email, password, first_name, and role are required' });
    }
    
    // Ensure first_name is not just whitespace
    if (!first_name.trim()) {
      return res.status(400).json({ error: 'First name cannot be empty or just whitespace' });
    }

    // Validate role
    const validRoles = ['public', 'member', 'trainer', 'nutritionist', 'admin', 'front_desk'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    
    // Debug: Show all users in database
    const allUsers = await query('SELECT id, email, first_name, last_name FROM users');
    console.log('All users in database:', allUsers.rows);
    
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    console.log('Existing user query result:', existingUser.rows);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Start transaction for user creation
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Insert new user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, date_of_birth, gender, address, emergency_contact, membership_type, membership_start_date, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id, email, first_name, last_name, role, membership_type, membership_start_date`,
        [
          email, 
          password_hash, 
          first_name, 
          last_name, 
          role, 
          phone, 
          date_of_birth, 
          gender, 
          address, 
          emergency_contact,
          role === 'member' ? 'basic' : null, // Default membership type for members
          role === 'member' ? new Date() : null, // Start date for members
          true
        ]
      );

      const user = result.rows[0];

      // If user is a member, create member profile and handle membership
      if (role === 'member') {
        // Create member profile
        await client.query(
          `INSERT INTO member_profiles (user_id, current_plan_id, loyalty_points, streak_days, fitness_goals)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, membership_plan_id || null, 0, 0, 'Get fit and stay healthy']
        );

        // If membership plan is provided, set membership details
        if (membership_plan_id) {
          const planResult = await client.query(
            'SELECT duration_months, price FROM membership_plans WHERE id = $1',
            [membership_plan_id]
          );
          
          if (planResult.rows.length > 0) {
            const plan = planResult.rows[0];
            const startDate = new Date();
            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + plan.duration_months);
            
            await client.query(
              `UPDATE users 
               SET membership_type = (SELECT name FROM membership_plans WHERE id = $1),
                   membership_start_date = $2,
                   membership_end_date = $3
               WHERE id = $4`,
              [membership_plan_id, startDate, endDate, user.id]
            );
          }
        }

        // Create initial loyalty transaction
        await client.query(
          `INSERT INTO loyalty_transactions (user_id, points_change, transaction_type, description)
           VALUES ($1, $2, $3, $4)`,
          [user.id, 100, 'bonus', 'Welcome bonus for new member']
        );

        // Update member profile with initial points
        await client.query(
          `UPDATE member_profiles SET loyalty_points = 100 WHERE user_id = $1`,
          [user.id]
        );
      }

      // If user is a trainer, create trainer profile
      if (role === 'trainer') {
        await client.query(
          `INSERT INTO trainers (user_id, specialization, certification, experience_years, bio, hourly_rate)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [user.id, [], [], 0, '', 0.00]
        );
      }

      // Commit transaction
      await client.query('COMMIT');

      // Generate JWT token for the newly registered user
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          membership_type: user.membership_type,
          membership_start_date: user.membership_start_date
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed: ' + error.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user by email
    const result = await query(
      'SELECT id, email, password_hash, first_name, last_name, role, is_active FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ error: 'Account is deactivated' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await query(
      'SELECT id, email, first_name, last_name, role, phone, date_of_birth, gender, address, emergency_contact, membership_type, membership_start_date, membership_end_date, is_active, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get all users (admin only)
router.get('/', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await query(
      'SELECT id, email, first_name, last_name, role, phone, membership_type, is_active, created_at FROM users ORDER BY created_at DESC'
    );

    res.json({ users: result.rows });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { first_name, last_name, phone, address, emergency_contact } = req.body;

    const result = await query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           emergency_contact = COALESCE($5, emergency_contact),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING id, email, first_name, last_name, role, phone, address, emergency_contact`,
      [first_name, last_name, phone, address, emergency_contact, decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;