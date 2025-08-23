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

      // If user is a member and has a membership plan, validate the plan
      let membershipType = null;
      let membershipStartDate = null;
      let membershipEndDate = null;
      let selectedPlanId = null;

      if (role === 'member' && membership_plan_id) {
        // Get the membership plan details
        const planResult = await client.query(
          'SELECT id, name, duration_months, price FROM membership_plans WHERE id = $1 AND is_active = true',
          [membership_plan_id]
        );

        if (planResult.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Invalid or inactive membership plan selected' });
        }

        const plan = planResult.rows[0];
        membershipType = plan.name;
        membershipStartDate = new Date();
        membershipEndDate = new Date();
        membershipEndDate.setMonth(membershipEndDate.getMonth() + plan.duration_months);
        selectedPlanId = plan.id;
      } else if (role === 'member') {
        // Default membership for members without plan selection
        membershipType = 'basic';
        membershipStartDate = new Date();
        membershipEndDate = new Date();
        membershipEndDate.setMonth(membershipEndDate.getMonth() + 1); // 1 month default
      }

      // Insert new user
      const result = await client.query(
        `INSERT INTO users (email, password_hash, first_name, last_name, role, phone, date_of_birth, gender, address, emergency_contact, membership_type, membership_start_date, membership_end_date, subscription_status, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id, email, first_name, last_name, role, membership_type, membership_start_date, membership_end_date, subscription_status`,
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
          membershipType,
          membershipStartDate,
          membershipEndDate,
          'active',
          true
        ]
      );

      const user = result.rows[0];

      // If user is a member, create member profile
      if (role === 'member') {
        await client.query(
          `INSERT INTO member_profiles (user_id, current_plan_id, loyalty_points, streak_days, subscription_status)
           VALUES ($1, $2, $3, $4, $5)`,
          [user.id, selectedPlanId, 0, 0, 'active']
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
          membership_start_date: user.membership_start_date,
          membership_end_date: user.membership_end_date,
          subscription_status: user.subscription_status
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
        role: user.role,
        is_active: user.is_active
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
      `SELECT 
        u.id, 
        u.email, 
        u.first_name, 
        u.last_name, 
        u.role, 
        u.phone, 
        u.membership_type, 
        u.is_active, 
        u.created_at, 
        u.subscription_status,
        mp.current_plan_id,
        mp.membership_start_date,
        mp.membership_end_date,
        mpl.name as plan_name,
        mpl.price as plan_price
       FROM users u 
       LEFT JOIN member_profiles mp ON u.id = mp.user_id
       LEFT JOIN membership_plans mpl ON mp.current_plan_id = mpl.id
       ORDER BY u.created_at DESC`
    );

    // Transform the data to include membership_type from plan_name for members
    const transformedUsers = result.rows.map(user => {
      if (user.role === 'member') {
        return {
          ...user,
          membership_type: user.plan_name || user.membership_type || null,
          membership_start_date: user.membership_start_date,
          membership_end_date: user.membership_end_date
        };
      }
      return user;
    });

    res.json({ users: transformedUsers });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Deactivate user (admin only)
router.put('/:userId/deactivate', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId } = req.params;

    // Check if user exists
    const userCheck = await query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deactivating admin users
    if (userCheck.rows[0].role === 'admin') {
      return res.status(404).json({ error: 'Cannot deactivate admin users' });
    }

    // Deactivate the user
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, first_name, last_name, role, is_active',
      [userId]
    );

    res.json({ 
      message: 'User deactivated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ error: 'Failed to deactivate user' });
  }
});

// Reactivate user (admin only)
router.put('/:userId/reactivate', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId } = req.params;

    // Check if user exists
    const userCheck = await query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Reactivate the user
    const result = await query(
      'UPDATE users SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, email, first_name, last_name, role, is_active',
      [userId]
    );

    res.json({ 
      message: 'User reactivated successfully',
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Reactivate user error:', error);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

// Delete user permanently (admin only)
router.delete('/:userId', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { userId } = req.params;

    // Check if user exists
    const userCheck = await query('SELECT id, role FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent deleting admin users
    if (userCheck.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Cannot delete admin users' });
    }

    // Start transaction for user deletion
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Get user data before deletion for logging
      const userData = await client.query(
        'SELECT * FROM users WHERE id = $1',
        [userId]
      );

      if (userData.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'User not found' });
      }

      const user = userData.rows[0];

      // Log user data to deleted_users table
      await client.query(
        `INSERT INTO deleted_users (
          original_id, email, first_name, last_name, role, phone, date_of_birth, 
          gender, address, emergency_contact, membership_type, membership_start_date,
          deleted_at, deleted_by_admin_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, CURRENT_TIMESTAMP, $13)`,
        [
          user.id, user.email, user.first_name, user.last_name, user.role,
          user.phone, user.date_of_birth, user.gender, user.address,
          user.emergency_contact, user.membership_type, user.membership_start_date,
          decoded.userId
        ]
      );

      // Delete user from all related tables (only delete from tables that exist)
      // Delete from member_profiles if exists
      try {
        await client.query('DELETE FROM member_profiles WHERE user_id = $1', [userId]);
        console.log('Deleted from member_profiles');
      } catch (error) {
        console.log('member_profiles table does not exist or error:', error.message);
      }
      
      // Delete from trainers if exists
      try {
        await client.query('DELETE FROM trainers WHERE user_id = $1', [userId]);
        console.log('Deleted from trainers');
      } catch (error) {
        console.log('trainers table does not exist or error:', error.message);
      }
      
      // Delete from nutritionists if exists
      try {
        await client.query('DELETE FROM nutritionists WHERE user_id = $1', [userId]);
        console.log('Deleted from nutritionists');
      } catch (error) {
        console.log('nutritionists table does not exist or error:', error.message);
      }
      
      // Delete from front_desk_staff if exists
      try {
        await client.query('DELETE FROM front_desk_staff WHERE user_id = $1', [userId]);
        console.log('Deleted from front_desk_staff');
      } catch (error) {
        console.log('front_desk_staff table does not exist or error:', error.message);
      }
      
      // Delete from other related tables that might exist
      const relatedTables = [
        { table: 'weight_tracking', column: 'user_id' },
        { table: 'workout_logs', column: 'user_id' },
        { table: 'member_workout_schedules', column: 'user_id' },
        { table: 'loyalty_transactions', column: 'user_id' },
        { table: 'member_balance', column: 'user_id' },
        { table: 'member_balance_transactions', column: 'user_id' },
        { table: 'bookings', column: 'user_id' },
        { table: 'training_sessions', column: 'client_id' },
        { table: 'session_notes', column: 'client_id' },
        { table: 'client_progress', column: 'client_id' },
        { table: 'trainer_ratings', column: 'client_id' },
        { table: 'trainer_schedules', column: 'client_id' }
      ];
      
      for (const { table, column } of relatedTables) {
        try {
          const result = await client.query(`DELETE FROM ${table} WHERE ${column} = $1`, [userId]);
          if (result.rowCount > 0) {
            console.log(`Deleted ${result.rowCount} records from ${table}`);
          }
        } catch (error) {
          // Table doesn't exist or error, skip it
          console.log(`Skipping ${table}: ${error.message}`);
        }
      }

      // Finally delete the user
      await client.query('DELETE FROM users WHERE id = $1', [userId]);

      await client.query('COMMIT');

      res.json({ 
        message: 'User deleted successfully',
        deletedUserId: userId
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
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