# Pause Subscription Feature

## Overview
The pause subscription feature allows members to temporarily pause their gym membership for a specified duration. When paused, the membership end date is automatically extended by the pause duration, ensuring members don't lose any time.

## Features

### 1. Pause Options
- **15 Days**: Short-term pause for vacations or temporary absences
- **1 Month (30 Days)**: Medium-term pause for extended absences
- **3 Months (90 Days)**: Long-term pause for seasonal breaks

### 2. How It Works
1. Member clicks "Pause Subscription" button
2. Wizard opens with pause duration options
3. Member selects desired duration
4. Confirmation page shows pause details
5. Upon confirmation:
   - Subscription status changes to "Paused"
   - Membership end date is extended by pause duration
   - Pause record is created in database

### 3. Database Changes
- New table: `subscription_pauses`
- Tracks pause start/end dates, duration, and status
- Automatically extends membership end date

### 4. Resume Functionality
- Members can resume subscription early
- Remaining pause days are subtracted from extended end date
- Subscription returns to "Active" status

## Technical Implementation

### Backend Endpoints
- `POST /api/members/pause-subscription` - Pause subscription
- `POST /api/members/resume-subscription` - Resume subscription early

### Database Schema
```sql
CREATE TABLE subscription_pauses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    pause_start_date DATE NOT NULL,
    pause_end_date DATE NOT NULL,
    pause_duration_days INTEGER NOT NULL,
    reason TEXT,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Frontend Components
- Pause subscription wizard with 2-step process
- Dynamic button states (Pause/Resume)
- Real-time status updates
- Toast notifications for user feedback

## Usage Instructions

### For Members
1. Navigate to Membership tab in Member Portal
2. Click "Pause Subscription" button
3. Select pause duration from available options
4. Review confirmation details
5. Click "Confirm Pause" to activate

### For Administrators
- Monitor pause status in member profiles
- View pause history in subscription_pauses table
- Automatic membership extension handling

## Testing

### Database Test
Run the test script to verify database setup:
```bash
cd backend
node test-pause-subscription.js
```

### API Testing
Test the pause functionality using the frontend:
1. Login as a member
2. Navigate to Membership tab
3. Test pause wizard flow
4. Verify database updates

## Benefits

1. **Member Retention**: Allows members to pause instead of canceling
2. **Flexibility**: Multiple pause duration options
3. **Fairness**: No time lost during pause period
4. **Automation**: Seamless database updates
5. **User Experience**: Simple wizard interface

## Future Enhancements

- Custom pause duration input
- Pause reason tracking
- Admin approval workflow
- Bulk pause operations
- Pause analytics and reporting
