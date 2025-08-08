# Finova Fitness - Backend API

Backend API server for the Finova Fitness Gym Management System with Neon PostgreSQL database.

## Features

- **Express.js** server with modern ES modules
- **Neon PostgreSQL** database integration
- **CORS** enabled for frontend communication
- **Helmet** for security headers
- **Morgan** for request logging
- **Environment** configuration
- **Health check** endpoint with database status
- **Error handling** middleware
- **JWT Authentication** ready
- **Database schema** with comprehensive gym management tables

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon PostgreSQL database (already configured)

### Installation

```bash
cd backend
npm install
```

### Environment Setup

1. Copy the environment example file:
   ```bash
   cp env.example .env
   ```

2. The `.env` file should contain:
   ```env
   # Server Configuration
   PORT=3001
   NODE_ENV=development

   # Database Configuration - Neon PostgreSQL
   DATABASE_URL=postgresql://neondb_owner:npg_0XIPRzqt3dUy@ep-broad-dew-a1l4ccp3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d

   # CORS Configuration
   CORS_ORIGIN=http://localhost:5173

   # Logging
   LOG_LEVEL=info
   ```

### Database Setup

Initialize the database schema:

```bash
npm run init-db
```

This will create all necessary tables for the gym management system.

### Development

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

### Production

```bash
npm start
```

## API Endpoints

### Health & Status
- `GET /api/health` - Server health status with database connection
- `GET /api/db-test` - Test database connection specifically
- `GET /api` - API information and available endpoints

### Database Schema

The database includes the following tables:
- **users** - All user types (members, trainers, staff, etc.)
- **trainers** - Trainer-specific information
- **classes** - Gym classes and activities
- **class_schedules** - Class scheduling
- **bookings** - Class and session bookings
- **membership_plans** - Membership options
- **equipment** - Gym equipment tracking
- **payments** - Payment records
- **workout_logs** - Member workout tracking
- **nutrition_consultations** - Nutritionist consultations

## Project Structure

```
backend/
├── src/
│   ├── index.js          # Main server file
│   ├── database.js       # Database connection and utilities
│   ├── init-db.js        # Database initialization script
│   └── schema.sql        # Database schema
├── package.json          # Dependencies and scripts
├── env.example          # Environment variables template
└── README.md           # This file
```

## Database Connection

The backend is configured to connect to a Neon PostgreSQL database with the following features:

- **Connection Pooling** for efficient database connections
- **SSL Support** for secure connections
- **Error Handling** for connection failures
- **Query Logging** for debugging
- **Health Checks** to monitor database status

## Future Features

- User authentication and authorization
- File upload handling
- Email notifications
- Payment processing
- Real-time notifications (WebSocket)
- Advanced analytics and reporting
- Backup and recovery procedures

## Troubleshooting

### Database Connection Issues

1. Check your `.env` file has the correct `DATABASE_URL`
2. Ensure the Neon database is active
3. Test connection with: `GET /api/db-test`
4. Check server logs for detailed error messages

### Common Issues

- **SSL Connection**: The connection string includes SSL requirements
- **Connection Pool**: The app uses connection pooling for better performance
- **Environment Variables**: Make sure all required env vars are set

## License

MIT License 