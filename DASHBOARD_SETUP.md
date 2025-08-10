# Member Dashboard Setup Guide

This guide explains how to set up the new member dashboard functionality that fetches real data from the database instead of using hardcoded values.

## What Was Implemented

### Backend Changes
1. **Enhanced Dashboard API** (`/api/members/dashboard`)
   - Fetches current membership plan details
   - Calculates loyalty points from transactions
   - Tracks streak days from gym visits
   - Counts successful referrals
   - Calculates weight change over time
   - Computes BMI from height and weight
   - Tracks workout completion vs scheduled workouts

2. **New Database Tables**
   - `weight_tracking` - For monitoring weight changes over time
   - Enhanced queries for workout completion tracking

### Frontend Changes
1. **Dashboard Component** - Now fetches real data from API
2. **Loading States** - Shows loading spinner while fetching data
3. **Dynamic Content** - Displays real-time data from database

## Database Schema Requirements

### Required Tables
- `users` - User accounts
- `member_profiles` - Member-specific data
- `membership_plans` - Available membership plans
- `loyalty_transactions` - Points earned/spent
- `gym_visits` - For tracking streak days
- `referrals` - For counting successful referrals
- `weight_tracking` - For weight change and BMI calculations
- `workout_logs` - For tracking completed workouts
- `member_workout_schedules` - For scheduled workout days

## Setup Instructions

### 1. Run Database Migrations
```bash
cd backend
npm run migrate
```

### 2. Create Sample Data
Run these scripts to populate sample data for testing:

```bash
# Create sample weight tracking data
node src/create-weight-tracking-sample.js

# Create sample workout data
node src/create-workout-sample.js
```

### 3. Start the Backend
```bash
cd backend
npm start
```

### 4. Start the Frontend
```bash
cd client
npm run dev
```

## Testing the Dashboard

### 1. Login as a Member
- Use the member portal login
- Navigate to the Dashboard tab

### 2. Verify Data Display
The dashboard should now show:
- **Current Plan**: Real membership plan name and days remaining
- **Loyalty Points**: Actual points from loyalty transactions
- **Streak**: Real streak days from gym visits
- **Referrals**: Count of successful referrals
- **Weight Change**: Calculated from weight tracking history
- **BMI**: Computed from latest height and weight
- **Workout Completion**: Ratio of completed vs scheduled workouts

### 3. Sample Data Expected
With the sample data scripts:
- **Weight Change**: -3.7kg (from 75.5kg to 71.8kg)
- **BMI**: ~23.5 (for 71.8kg at 175cm height)
- **Workout Completion**: 5/3 (5 completed workouts, 3 scheduled days)

## API Response Structure

The dashboard API now returns:

```json
{
  "profile": {
    "loyalty_points": 0,
    "streak_days": 0,
    "weight_change": "-3.7",
    "bmi": "23.5"
  },
  "currentPlan": {
    "name": "Premium",
    "days_remaining": 45,
    "price": 89.99
  },
  "referralCount": 2,
  "workoutStats": {
    "completed": 5,
    "total": 3
  }
}
```

## Troubleshooting

### Common Issues

1. **"No data" displayed**
   - Check if sample data was created
   - Verify database connection
   - Check browser console for API errors

2. **BMI shows "N/A"**
   - Ensure weight_tracking table has height data
   - Check if user has recorded weight and height

3. **Workout completion shows "0/0"**
   - Verify workout_logs and member_workout_schedules tables
   - Check if sample workout data was created

### Debug Steps

1. Check backend logs for SQL errors
2. Verify API endpoint returns data: `GET /api/members/dashboard`
3. Check browser Network tab for API responses
4. Verify database tables have data

## Next Steps

After successful setup, you can:
1. Add more sample data for different scenarios
2. Implement weight tracking input forms
3. Add workout logging functionality
4. Enhance the loyalty points system
5. Implement real-time updates

## Support

If you encounter issues:
1. Check the backend console for error messages
2. Verify database schema matches requirements
3. Ensure all required tables have sample data
4. Check API authentication and token handling
