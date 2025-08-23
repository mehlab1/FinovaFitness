# Walk-In Sales Technical Documentation
## Finova Fitness Front Desk Portal

### Table of Contents
1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [API Documentation](#api-documentation)
4. [Database Schema](#database-schema)
5. [Frontend Components](#frontend-components)
6. [Backend Services](#backend-services)
7. [Configuration](#configuration)
8. [Deployment Guide](#deployment-guide)
9. [Security Considerations](#security-considerations)
10. [Testing](#testing)
11. [Monitoring and Logging](#monitoring-and-logging)
12. [Troubleshooting](#troubleshooting)

---

## System Overview

### Purpose
The Walk-In Sales system enables front desk staff to create new member accounts with complete member details, payment processing, and automatic revenue tracking.

### Key Features
- Member creation with comprehensive form validation
- Payment method selection and confirmation
- Membership plan integration
- Automatic email and WhatsApp notifications
- Receipt generation and printing
- POS summary and revenue tracking
- Real-time data updates

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, PostgreSQL
- **Testing**: Playwright
- **Email**: Nodemailer
- **WhatsApp**: WhatsApp Business API
- **Printing**: Browser print API

---

## Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│  (PostgreSQL)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Email Service │    │ WhatsApp API    │    │   File System   │
│  (Nodemailer)   │    │  (External)     │    │  (Templates)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Data Flow
1. Front desk user fills member creation form
2. Form validation occurs on frontend
3. Data sent to backend API
4. Backend validates data and creates database records
5. Revenue tracking updated
6. Email and WhatsApp notifications sent
7. Success response with member details returned
8. Receipt generated and displayed

---

## API Documentation

### Base URL
```
http://localhost:3001/api/frontdesk
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <token>
```

### Endpoints

#### 1. Create Member
**POST** `/create-member`

Creates a new member account with complete details.

**Request Body:**
```json
{
  "first_name": "string (required, 2-50 chars)",
  "last_name": "string (required, 2-50 chars)",
  "email": "string (required, valid email)",
  "phone": "string (required, 10 digits)",
  "date_of_birth": "string (optional, YYYY-MM-DD)",
  "gender": "string (optional, male|female|other)",
  "address": "string (optional, max 200 chars)",
  "emergency_contact": "string (optional, max 100 chars)",
  "membership_plan_id": "number (required)",
  "payment_method": "string (required, cash|card|check|bank_transfer)",
  "payment_confirmed": "boolean (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member created successfully",
  "data": {
    "user": {
      "id": 123,
      "email": "john.smith@example.com",
      "role": "member",
      "created_at": "2024-01-15T10:30:00Z"
    },
    "member_profile": {
      "id": 456,
      "user_id": 123,
      "first_name": "John",
      "last_name": "Smith",
      "phone": "1234567890",
      "date_of_birth": "1990-01-01",
      "gender": "male",
      "address": "123 Main St",
      "emergency_contact": "Jane Smith"
    },
    "default_password": "Welcome123!",
    "transaction_id": "TXN-2024-001",
    "revenue_amount": 99.99
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": ["Email already exists"],
    "phone": ["Phone number must be 10 digits"]
  }
}
```

#### 2. Get Membership Plans
**GET** `/membership-plans`

Retrieves available membership plans.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Monthly Plan",
      "price": 99.99,
      "duration": "1 month",
      "description": "Access to all facilities",
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### 3. Get POS Summary
**GET** `/pos-summary`

Retrieves POS summary data with optional filters.

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `payment_method` (optional): cash|card|check|bank_transfer
- `transaction_status` (optional): completed|pending|cancelled
- `refresh` (optional): true to force cache refresh

**Response:**
```json
{
  "success": true,
  "data": {
    "total_revenue": 9999.99,
    "total_transactions": 100,
    "today_revenue": 299.97,
    "today_transactions": 3,
    "payment_methods": {
      "cash": 1500.00,
      "card": 6000.00,
      "check": 2000.00,
      "bank_transfer": 499.99
    },
    "recent_transactions": [
      {
        "id": 1,
        "member_name": "John Smith",
        "member_email": "john.smith@example.com",
        "plan_name": "Monthly Plan",
        "plan_price": 99.99,
        "payment_method": "card",
        "transaction_date": "2024-01-15T10:30:00Z",
        "transaction_status": "completed",
        "revenue_amount": 99.99
      }
    ]
  }
}
```

#### 4. Get Recent Transactions
**GET** `/recent-transactions`

Retrieves recent transactions with limit.

**Query Parameters:**
- `limit` (optional): number, default 10

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "member_name": "John Smith",
      "member_email": "john.smith@example.com",
      "plan_name": "Monthly Plan",
      "plan_price": 99.99,
      "payment_method": "card",
      "transaction_date": "2024-01-15T10:30:00Z",
      "transaction_status": "completed",
      "revenue_amount": 99.99
    }
  ]
}
```

#### 5. Export POS Data
**GET** `/export-pos-data`

Exports POS data to CSV format.

**Query Parameters:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `payment_method` (optional): cash|card|check|bank_transfer
- `transaction_status` (optional): completed|pending|cancelled

**Response:** CSV file download

---

## Database Schema

### Tables

#### 1. users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'member',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. member_profiles
```sql
CREATE TABLE member_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10),
  address TEXT,
  emergency_contact VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 3. membership_plans
```sql
CREATE TABLE membership_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration VARCHAR(50) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### 4. gym_revenue
```sql
CREATE TABLE gym_revenue (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  membership_plan_id INTEGER REFERENCES membership_plans(id),
  revenue_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  transaction_status VARCHAR(20) DEFAULT 'completed',
  revenue_source VARCHAR(50) DEFAULT 'walk_in_sales',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes
```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_member_profiles_user_id ON member_profiles(user_id);
CREATE INDEX idx_gym_revenue_user_id ON gym_revenue(user_id);
CREATE INDEX idx_gym_revenue_transaction_date ON gym_revenue(transaction_date);
CREATE INDEX idx_gym_revenue_payment_method ON gym_revenue(payment_method);
```

---

## Frontend Components

### Component Structure
```
src/components/WalkInSales/
├── WalkInSalesForm.tsx          # Main form component
├── WalkInSalesPreview.tsx       # Preview component
├── WalkInSalesPreviewModal.tsx  # Modal wrapper
├── WalkInSalesReceipt.tsx       # Receipt display
├── WalkInSalesReceiptTemplate.tsx # Print template
└── index.ts                     # Export file
```

### Key Components

#### WalkInSalesForm
- Handles form input and validation
- Manages form state and submission
- Integrates with API services
- Provides error handling and loading states

#### WalkInSalesPreview
- Displays member information for review
- Shows plan details and pricing
- Confirms payment information
- Allows editing before submission

#### WalkInSalesReceipt
- Generates printable receipt
- Includes transaction details
- Shows login credentials
- Provides print functionality

### State Management
- Uses React hooks for local state
- Custom hooks for API integration
- Form validation with real-time feedback
- Error handling and user notifications

---

## Backend Services

### Service Architecture
```
src/
├── routes/
│   └── frontdesk.js              # API routes
├── controllers/
│   └── frontDeskController.js    # Request handling
├── services/
│   ├── frontDeskService.js       # Business logic
│   ├── revenueService.js         # Revenue tracking
│   ├── emailService.js           # Email notifications
│   └── whatsappService.js        # WhatsApp notifications
├── middleware/
│   └── frontDeskValidation.js    # Input validation
└── templates/
    ├── emails/
    │   └── welcomeMember.html    # Email template
    └── whatsapp/
        └── welcomeMember.js      # WhatsApp template
```

### Key Services

#### frontDeskService
- Member creation logic
- Database transaction management
- Integration with other services
- Error handling and rollback

#### revenueService
- Revenue tracking and recording
- Payment method handling
- Transaction status management
- Financial reporting

#### emailService
- Email template rendering
- SMTP configuration
- Email delivery tracking
- Error handling

#### whatsappService
- WhatsApp Business API integration
- Message template rendering
- Delivery status tracking
- Rate limiting handling

---

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/finovafitness

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@finovafitness.com

# WhatsApp Configuration
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token

# Application
PORT=3001
NODE_ENV=development
JWT_SECRET=your-jwt-secret
```

### Frontend Configuration
```typescript
// src/config/api.ts
export const API_CONFIG = {
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
};
```

### Database Configuration
```javascript
// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

## Deployment Guide

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed
- SMTP server configured
- WhatsApp Business API access

### Development Setup
1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd FinovaFitnessSite
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create database
   createdb finovafitness
   
   # Run migrations
   cd backend
   npm run migrate
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit environment variables
   nano .env
   ```

5. **Start Development Servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm run dev
   
   # Frontend (Terminal 2)
   cd client
   npm run dev
   ```

### Production Deployment

#### Backend Deployment
1. **Build Application**
   ```bash
   cd backend
   npm run build
   ```

2. **Environment Setup**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL=your-production-db-url
   ```

3. **Start Application**
   ```bash
   npm start
   ```

#### Frontend Deployment
1. **Build Application**
   ```bash
   cd client
   npm run build
   ```

2. **Serve Static Files**
   ```bash
   # Using nginx
   sudo cp -r dist/* /var/www/html/
   ```

### Docker Deployment
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/finovafitness
    depends_on:
      - db
  
  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
  
  db:
    image: postgres:14
    environment:
      - POSTGRES_DB=finovafitness
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## Security Considerations

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control
- Token expiration and refresh
- Secure password hashing with bcrypt

### Data Validation
- Input sanitization and validation
- SQL injection prevention
- XSS protection
- CSRF protection

### API Security
- Rate limiting
- Request size limits
- HTTPS enforcement
- CORS configuration

### Database Security
- Connection encryption
- Prepared statements
- User permission restrictions
- Regular security updates

### Environment Security
- Secure environment variable storage
- No hardcoded secrets
- Regular secret rotation
- Access logging

---

## Testing

### Test Structure
```
tests/
├── auth.setup.ts                 # Authentication setup
├── walk-in-sales-e2e.spec.ts     # End-to-end tests
├── performance.spec.ts           # Performance tests
└── api/
    ├── frontdesk.spec.ts         # API tests
    └── validation.spec.ts        # Validation tests
```

### Running Tests
```bash
# Install Playwright
npm install @playwright/test

# Run all tests
npm test

# Run specific test file
npx playwright test walk-in-sales-e2e.spec.ts

# Run with UI
npx playwright test --ui

# Run performance tests
npx playwright test performance.spec.ts
```

### Test Coverage
- **Unit Tests**: Component logic, utility functions
- **Integration Tests**: API endpoints, database operations
- **E2E Tests**: Complete user workflows
- **Performance Tests**: Load testing, response times
- **Security Tests**: Authentication, authorization

---

## Monitoring and Logging

### Application Logging
```javascript
// Winston logger configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

### Performance Monitoring
- Response time tracking
- Database query monitoring
- Memory usage monitoring
- Error rate tracking

### Health Checks
```javascript
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### Error Tracking
- Error logging and alerting
- Stack trace analysis
- User impact assessment
- Error resolution tracking

---

## Troubleshooting

### Common Issues

#### Database Connection Issues
**Problem**: Cannot connect to database
**Solution**:
1. Check database service status
2. Verify connection string
3. Check network connectivity
4. Verify user permissions

#### Email Delivery Issues
**Problem**: Emails not being sent
**Solution**:
1. Check SMTP configuration
2. Verify email credentials
3. Check spam filters
4. Monitor email service logs

#### WhatsApp API Issues
**Problem**: WhatsApp messages not delivered
**Solution**:
1. Verify API credentials
2. Check rate limits
3. Validate phone number format
4. Monitor API response codes

#### Performance Issues
**Problem**: Slow response times
**Solution**:
1. Check database query performance
2. Monitor server resources
3. Review caching strategy
4. Optimize database indexes

### Debug Mode
```bash
# Enable debug logging
export DEBUG=finovafitness:*

# Start application in debug mode
npm run dev:debug
```

### Log Analysis
```bash
# View application logs
tail -f logs/combined.log

# Search for errors
grep "ERROR" logs/combined.log

# Monitor real-time requests
tail -f logs/access.log
```

---

## Version History

### v1.0.0 (Current)
- Initial release
- Basic member creation functionality
- Payment processing
- Email and WhatsApp notifications
- Receipt generation
- POS summary

### Planned Features
- Advanced reporting
- Bulk member import
- Payment gateway integration
- Mobile app support
- Advanced analytics

---

## Support and Maintenance

### Regular Maintenance
- Database backups (daily)
- Log rotation (weekly)
- Security updates (monthly)
- Performance monitoring (continuous)

### Backup Procedures
```bash
# Database backup
pg_dump finovafitness > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf app_backup_$(date +%Y%m%d).tar.gz /app/
```

### Update Procedures
1. Backup current system
2. Deploy new version
3. Run database migrations
4. Verify functionality
5. Monitor for issues

---

*This documentation is maintained by the Finova Fitness development team. For questions or updates, contact the technical team.*
