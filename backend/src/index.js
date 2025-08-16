import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection } from './database.js';
import userRoutes from './routes/users.js';
import trainerRoutes from './routes/trainers.js';
import memberRoutes from './routes/members.js';
import adminRoutes from './routes/admin.js';
import nutritionistRoutes from './routes/nutritionists.js';
import chatRoutes from './routes/chat.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Test database connection on startup
app.get('/api/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({ 
      status: 'OK', 
      message: 'Finova Fitness Backend is running',
      database: dbConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/nutritionists', nutritionistRoutes);
app.use('/api/chat', chatRoutes);

// API routes will be added here
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Finova Fitness API',
    version: '1.0.0',
    database: 'Neon PostgreSQL',
    endpoints: [
      '/api/health',
      '/api/users',
      '/api/users/register',
      '/api/users/login',
      '/api/users/profile',
      '/api/classes',
      '/api/bookings',
      '/api/trainers',
      '/api/memberships',
      '/api/payments'
    ]
  });
});

// Database connection test endpoint
app.get('/api/db-test', async (req, res) => {
  try {
    const isConnected = await testConnection();
    if (isConnected) {
      res.json({ 
        success: true, 
        message: 'Database connection successful',
        database: 'Neon PostgreSQL'
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Database connection failed' 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Database test failed',
      error: error.message 
    });
  }
});

// Temporary endpoint to check chat messages in database
app.get('/api/check-chat-messages', async (req, res) => {
  try {
    const { query } = await import('./config/database.js');
    
    // Check if chat_messages table exists and has data
    const result = await query(`
      SELECT 
        COUNT(*) as total_messages,
        COUNT(DISTINCT diet_plan_request_id) as active_chats,
        COUNT(DISTINCT sender_id) as unique_senders,
        MIN(created_at) as first_message,
        MAX(created_at) as last_message
      FROM chat_messages
    `);
    
    // Get sample messages
    const sampleMessages = await query(`
      SELECT 
        cm.id,
        cm.message,
        cm.sender_type,
        cm.message_type,
        cm.created_at,
        u.first_name,
        u.last_name
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      ORDER BY cm.created_at DESC
      LIMIT 5
    `);
    
    res.json({ 
      success: true, 
      table_stats: result.rows[0],
      sample_messages: sampleMessages.rows
    });
  } catch (error) {
    console.error('Error checking chat messages:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check chat messages',
      error: error.message 
    });
  }
});









// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl 
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Finova Fitness Backend server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔗 API base URL: http://localhost:${PORT}/api`);
  console.log(`🗄️  Database test: http://localhost:${PORT}/api/db-test`);
  
  // Test database connection on startup
  try {
    await testConnection();
  } catch (error) {
    console.error('❌ Database connection failed on startup:', error.message);
  }
}); 