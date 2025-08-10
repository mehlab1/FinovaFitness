# Finova Fitness - Production User Registration System Setup

## Overview
This guide will help you set up a production-level user registration system for Finova Fitness. The system includes:
- User registration with automatic member profile creation
- Membership plan management
- Database initialization with sample data
- Proper error handling and validation

## Prerequisites
- Node.js 16+ installed
- PostgreSQL database (Neon recommended for production)
- Backend and frontend servers running

## Step 1: Environment Configuration

### Backend (.env file)
Create a `.env` file in the `backend/` directory with the following content:

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

**⚠️ Important:** Replace the `DATABASE_URL` with your actual database connection string and change the `JWT_SECRET` to a secure random string in production.

## Step 2: Database Initialization

### Option A: Complete Database Setup (Recommended)
Run the comprehensive database initialization script:

```bash
cd backend
node src/database/init-complete-db.js
```

This script will:
- Create all necessary database tables
- Set up proper constraints and indexes
- Initialize sample membership plans
- Create sample classes and muscle groups

### Option B: Manual Database Setup
If you prefer to run scripts individually:

```bash
cd backend

# 1. Initialize database schema
node src/database/init-db-new.js

# 2. Initialize sample data
node src/database/init-sample-data.js
```

## Step 3: Verify Backend Setup

### Test Database Connection
```bash
cd backend
node src/test-db-connection.js
```

### Test API Endpoints
Start the backend server and test these endpoints:

```bash
# Test user registration
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "role": "member",
    "phone": "+1234567890"
  }'

# Test membership plans
curl http://localhost:3001/api/members/plans
```

## Step 4: Frontend Integration

The frontend has been updated to:
- Use the correct API endpoints
- Pass membership plan information during registration
- Handle registration responses properly
- Automatically redirect to member portal after successful registration

### Key Changes Made:
1. **PublicPortal.tsx**: Updated to use `authApi` instead of `userApi`
2. **API Service**: Added membership plans API methods
3. **Registration Flow**: Enhanced to include membership plan selection

## Step 5: Testing the Complete Flow

### 1. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

### 2. Test User Registration
1. Go to the frontend (http://localhost:5173)
2. Click "Join Now"
3. Fill out the membership wizard:
   - Step 1: Personal information
   - Step 2: Select membership plan
   - Step 3: Payment method
4. Create account with email/password
5. Verify user is created in database
6. Verify automatic redirect to member portal

### 3. Verify Database Records
Check that the following records were created:
- `users` table: New user with role 'member'
- `member_profiles` table: Member profile with loyalty points
- `loyalty_transactions` table: Welcome bonus transaction
- `membership_plans` table: Sample plans available

## Step 6: Production Considerations

### Security
- Change `JWT_SECRET` to a strong random string
- Use HTTPS in production
- Implement rate limiting
- Add input validation and sanitization

### Database
- Use connection pooling
- Implement proper backup strategies
- Monitor database performance
- Set up proper indexes

### Error Handling
- Implement comprehensive logging
- Add error monitoring (e.g., Sentry)
- Create user-friendly error messages
- Add retry mechanisms for failed operations

## Troubleshooting

### Common Issues

#### 1. "Cannot read properties of undefined (reading 'register')"
- **Cause**: API import issues or backend not running
- **Solution**: Verify backend is running and check API imports

#### 2. "JWT_SECRET is not defined"
- **Cause**: Missing .env file or incorrect environment variable
- **Solution**: Create .env file with proper JWT_SECRET

#### 3. "Database connection failed"
- **Cause**: Incorrect DATABASE_URL or database not accessible
- **Solution**: Verify database connection string and network access

#### 4. "Table already exists"
- **Cause**: Database already initialized
- **Solution**: This is normal, the script will skip existing tables

### Debug Mode
Enable debug logging by setting:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

## API Endpoints Reference

### User Management
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Membership
- `GET /api/members/plans` - Get all membership plans
- `GET /api/members/plans/:id` - Get specific membership plan

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database is accessible and properly initialized
4. Check that all required npm packages are installed

## Next Steps

After successful setup, consider implementing:
- Email verification for new accounts
- Password reset functionality
- Social media login integration
- Advanced membership management
- Payment processing integration
- Analytics and reporting
