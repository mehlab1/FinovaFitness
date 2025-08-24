# 🔧 Manual Check-in System - Technical Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [API Endpoints](#api-endpoints)
3. [Database Schema](#database-schema)
4. [Deployment Guide](#deployment-guide)
5. [Configuration](#configuration)
6. [Consistency Calculation Logic](#consistency-calculation-logic)
7. [Error Handling](#error-handling)
8. [Performance Considerations](#performance-considerations)

---

## 🏗️ System Architecture

### Overview
The Manual Check-in System is built on the existing Finova Fitness platform with the following components:

### Frontend Components
- **Front Desk Portal**: React-based interface for staff
- **Member Search**: Real-time search with autocomplete
- **Check-in Dialog**: Modal for manual check-in process
- **Recent Check-ins**: Display of recent manual check-ins

### Backend Services
- **Check-in Service**: Core business logic for check-ins
- **Consistency Service**: Weekly consistency tracking
- **Loyalty Service**: Points awarding and management
- **Member Search API**: Search functionality

### Database Layer
- **PostgreSQL**: Primary database
- **Real-time Updates**: WebSocket connections for live updates

---

## 🔌 API Endpoints

### Member Search API

#### `GET /api/frontdesk/members/search`
Search for members by name or email.

**Parameters:**
```json
{
  "query": "string",     // Search term (name or email)
  "limit": "number"      // Optional: max results (default: 10)
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 10,
      "first_name": "Muhammad",
      "last_name": "Mehlab",
      "email": "mehlab@gmail.com",
      "is_active": true,
      "membership_plan": "Monthly"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Search query is required"
}
```

### Manual Check-in API

#### `POST /api/frontdesk/checkin`
Record a manual check-in for a member.

**Request Body:**
```json
{
  "user_id": 10,
  "check_in_time": "2025-08-24T22:13:46.054Z",
  "check_in_type": "manual"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "check_in_id": 122,
    "user_id": 10,
    "check_in_time": "2025-08-24T17:13:46.054Z",
    "check_in_type": "manual",
    "consistency_updated": false,
    "loyalty_points_awarded": 0
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Member not found or inactive"
}
```

### Recent Check-ins API

#### `GET /api/frontdesk/checkins/recent`
Get recent manual check-ins.

**Parameters:**
```json
{
  "limit": "number",     // Optional: max results (default: 20)
  "offset": "number"     // Optional: pagination offset (default: 0)
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 122,
      "user_id": 10,
      "first_name": "Muhammad",
      "last_name": "Mehlab",
      "visit_date": "2025-08-25",
      "check_in_time": "2025-08-24T17:13:46.054Z",
      "check_in_type": "manual"
    }
  ]
}
```

---

## 🗄️ Database Schema

### New Tables

#### `gym_visits` (Updated)
```sql
CREATE TABLE gym_visits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    visit_date DATE NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE NOT NULL,
    check_in_type VARCHAR(20) NOT NULL DEFAULT 'manual',
    consistency_week_start DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_gym_visits_user_id ON gym_visits(user_id);
CREATE INDEX idx_gym_visits_visit_date ON gym_visits(visit_date);
CREATE INDEX idx_gym_visits_consistency_week ON gym_visits(consistency_week_start);
CREATE INDEX idx_gym_visits_check_in_time ON gym_visits(check_in_time);
```

#### `consistency_achievements` (Updated)
```sql
CREATE TABLE consistency_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    check_ins_count INTEGER NOT NULL DEFAULT 0,
    consistency_achieved BOOLEAN NOT NULL DEFAULT false,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, week_start_date)
);

-- Indexes for performance
CREATE INDEX idx_consistency_user_id ON consistency_achievements(user_id);
CREATE INDEX idx_consistency_week_start ON consistency_achievements(week_start_date);
```

#### `loyalty_transactions` (Updated)
```sql
CREATE TABLE loyalty_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    points_change INTEGER NOT NULL,
    transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('gym_visit', 'referral', 'purchase', 'bonus', 'redemption')),
    description TEXT,
    reference_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_loyalty_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_created_at ON loyalty_transactions(created_at);
```

### Existing Tables (Referenced)

#### `users`
```sql
-- Key fields used by manual check-in system
id INTEGER PRIMARY KEY,
first_name VARCHAR(100) NOT NULL,
last_name VARCHAR(100) NOT NULL,
email VARCHAR(255) UNIQUE NOT NULL,
is_active BOOLEAN NOT NULL DEFAULT true
```

#### `member_profiles`
```sql
-- Key fields used by manual check-in system
user_id INTEGER PRIMARY KEY REFERENCES users(id),
current_plan_id INTEGER REFERENCES membership_plans(id),
loyalty_points INTEGER NOT NULL DEFAULT 0,
subscription_status VARCHAR(20) NOT NULL DEFAULT 'active'
```

#### `membership_plans`
```sql
-- Key fields used by manual check-in system
id INTEGER PRIMARY KEY,
name VARCHAR(100) NOT NULL,
is_active BOOLEAN NOT NULL DEFAULT true
```

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Existing Finova Fitness application deployed

### Backend Deployment

#### Step 1: Update Dependencies
```bash
cd backend
npm install
```

#### Step 2: Database Migrations
```bash
# Run database migrations
npm run migrate

# Verify migrations
npm run migrate:status
```

#### Step 3: Environment Configuration
Update `.env` file:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finova_fitness
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=production
```

#### Step 4: Start Backend Server
```bash
# Development
npm run dev

# Production
npm start
```

### Frontend Deployment

#### Step 1: Update Dependencies
```bash
cd frontend
npm install
```

#### Step 2: Environment Configuration
Update `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_WS_URL=ws://localhost:5000
```

#### Step 3: Build and Deploy
```bash
# Build for production
npm run build

# Deploy to your web server
# Copy dist/ folder to web server directory
```

### Verification Steps
1. **Database Connection**: Verify database connectivity
2. **API Endpoints**: Test all new endpoints
3. **Frontend Integration**: Verify front desk portal loads
4. **Member Search**: Test search functionality
5. **Check-in Process**: Test complete check-in workflow

---

## ⚙️ Configuration

### Backend Configuration

#### Database Connection Pool
```javascript
// src/database.js
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20, // Maximum number of connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### Logging Configuration
```javascript
// src/utils/logger.js
const logger = {
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
};
```

### Frontend Configuration

#### API Client Configuration
```javascript
// src/services/apiClient.js
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});
```

#### Search Configuration
```javascript
// Search debounce and limits
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_RESULTS_LIMIT = 10;
```

---

## 📊 Consistency Calculation Logic

### Weekly Consistency Rules
- **Week Definition**: Monday to Sunday
- **Consistency Threshold**: 5+ days per week
- **Points Awarded**: 10 loyalty points for consistency
- **Calculation Frequency**: Real-time on each check-in

### Algorithm Implementation
```javascript
// src/services/consistencyService.js

async function processWeeklyConsistency(userId, weekStart) {
  // 1. Get all check-ins for the week
  const weekCheckIns = await getWeekCheckIns(userId, weekStart);
  
  // 2. Count unique days
  const uniqueDays = new Set(weekCheckIns.map(c => c.visit_date)).size;
  
  // 3. Determine consistency
  const isConsistent = uniqueDays >= 5;
  
  // 4. Update consistency record
  await updateConsistencyRecord(userId, weekStart, uniqueDays, isConsistent);
  
  // 5. Award points if consistent and not already awarded
  if (isConsistent && !alreadyAwarded) {
    await awardConsistencyPoints(userId, 10);
  }
}
```

### Date Handling
- **Local Time**: All dates use local timezone
- **Week Boundaries**: Monday 00:00 to Sunday 23:59
- **Date Storage**: ISO format with timezone information

---

## ⚠️ Error Handling

### Error Types

#### Validation Errors
```javascript
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}
```

#### Database Errors
```javascript
class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = 500;
  }
}
```

#### Not Found Errors
```javascript
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}
```

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "errorType": "ValidationError",
  "timestamp": "2025-08-24T22:13:46.054Z"
}
```

### Common Error Scenarios
1. **Invalid User ID**: Member not found or inactive
2. **Missing Parameters**: Required fields not provided
3. **Database Connection**: Connection timeout or failure
4. **Duplicate Check-ins**: Multiple check-ins on same day (allowed)
5. **Consistency Calculation**: Week boundary calculation errors

---

## ⚡ Performance Considerations

### Database Optimization

#### Indexes
```sql
-- Performance indexes for manual check-in queries
CREATE INDEX idx_gym_visits_user_date ON gym_visits(user_id, visit_date);
CREATE INDEX idx_gym_visits_week_consistency ON gym_visits(consistency_week_start, user_id);
CREATE INDEX idx_consistency_user_week ON consistency_achievements(user_id, week_start_date);
```

#### Query Optimization
- **Search Queries**: Use ILIKE with proper indexing
- **Consistency Queries**: Use date ranges for efficiency
- **Recent Check-ins**: Limit results and use pagination

### Caching Strategy
```javascript
// Redis caching for frequently accessed data
const cache = {
  memberSearch: 300, // 5 minutes
  recentCheckIns: 60, // 1 minute
  consistencyData: 3600 // 1 hour
};
```

### Connection Pooling
- **Database**: Configure appropriate pool size
- **API**: Use connection pooling for external APIs
- **WebSocket**: Implement connection limits

### Monitoring
```javascript
// Performance monitoring
const performanceMetrics = {
  searchResponseTime: [],
  checkInResponseTime: [],
  databaseQueryTime: [],
  errorRate: []
};
```

---

## 🔒 Security Considerations

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Front desk staff permissions
- **Session Management**: Proper session handling

### Data Validation
- **Input Sanitization**: Prevent SQL injection
- **Parameter Validation**: Validate all input parameters
- **Output Encoding**: Proper output encoding

### Audit Trail
```sql
-- Audit logging for all check-ins
CREATE TABLE check_in_audit (
    id SERIAL PRIMARY KEY,
    check_in_id INTEGER REFERENCES gym_visits(id),
    action VARCHAR(50) NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    details JSONB
);
```

---

## 📈 Monitoring and Logging

### Application Logs
```javascript
// Structured logging
logger.info('Manual check-in recorded', {
  userId: 10,
  checkInId: 122,
  timestamp: new Date().toISOString(),
  checkInType: 'manual'
});
```

### Performance Metrics
- **Response Times**: Track API response times
- **Error Rates**: Monitor error frequencies
- **Database Performance**: Query execution times
- **User Activity**: Check-in frequency and patterns

### Health Checks
```javascript
// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    database: await checkDatabaseConnection(),
    services: await checkServiceHealth(),
    timestamp: new Date().toISOString()
  };
  res.json(health);
});
```

---

*This technical documentation provides comprehensive information for developers and system administrators working with the Manual Check-in System.*

**Last Updated**: August 2025
**Version**: 1.0
