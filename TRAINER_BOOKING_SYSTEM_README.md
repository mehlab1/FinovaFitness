# Trainer Booking System - Redesigned Backend

## Overview

The trainer booking system has been redesigned to implement proper slot status management. When a user books a training session, the system now:

1. **Stores booking details** in the `training_sessions` table
2. **Updates slot status** in the `trainer_schedules` table from 'available' to 'booked'
3. **Shows booked slots in red** on the frontend
4. **Makes booked slots unselectable** for users

## Database Schema Changes

### New Table: `trainer_schedules`

```sql
CREATE TABLE trainer_schedules (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    time_slot TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'unavailable', 'break')),
    booking_id INTEGER REFERENCES training_sessions(id) ON DELETE SET NULL,
    client_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(trainer_id, day_of_week, time_slot)
);
```

### Slot Statuses

- **`available`**: Slot is open for booking
- **`booked`**: Slot is already booked by a client
- **`unavailable`**: Trainer is not available during this time
- **`break`**: Trainer is on break during this time

## Key Features

### 1. Automatic Slot Status Updates

The system uses database triggers to automatically update slot statuses when:
- A new training session is created → slot becomes 'booked'
- A session is completed/cancelled → slot becomes 'available' again
- A session is deleted → slot becomes 'available' again

### 2. Real-time Availability Checking

Before allowing a booking, the system:
- Checks if the slot status is 'available' in `trainer_schedules`
- Verifies no existing booking exists in `training_sessions`
- Uses database functions for efficient availability checking

### 3. Frontend Visual Feedback

- **Green slots**: Available for booking
- **Red slots**: Already booked (unselectable)
- **Gray slots**: Unavailable (unselectable)
- **Yellow slots**: Trainer breaks (unselectable)

## Database Functions

### `is_slot_available(trainer_id, session_date, start_time)`
Returns boolean indicating if a specific time slot is available for booking.

### `get_available_slots(trainer_id, session_date)`
Returns all available time slots for a trainer on a specific date.

### `initialize_trainer_schedule(trainer_id)`
Initializes the complete weekly schedule for a trainer with all slots marked as 'available'.

## API Endpoints

### Book Training Session
```
POST /api/members/book-training-session
```

**Request Body:**
```json
{
  "trainer_id": 1,
  "session_date": "2024-01-20",
  "start_time": "09:00",
  "end_time": "10:00",
  "session_type": "personal_training",
  "notes": "Focus on strength training"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Training session booked successfully!",
  "session": {
    "id": 123,
    "trainer_id": 1,
    "client_id": 456,
    "session_date": "2024-01-20",
    "start_time": "09:00",
    "end_time": "10:00",
    "status": "scheduled",
    "price": 75.00
  }
}
```

### Get Trainer Schedule
```
GET /api/members/trainers/:trainerId/schedule/:date
```

Returns the schedule for a specific trainer on a specific date with slot statuses.

## Setup Instructions

### 1. Run Database Migrations

Execute the SQL files in order:
1. `backend/src/database/schemas/trainer-schedules.sql`
2. Any other schema files that reference `trainer_schedules`

### 2. Initialize Trainer Schedules

```bash
cd backend
node run-trainer-schedule-init.js
```

This will:
- Create schedules for all existing trainers
- Mark existing bookings as 'booked' in the schedule
- Set up the trigger system

### 3. Verify Setup

Check that:
- `trainer_schedules` table exists with proper structure
- Triggers are working (test by creating a booking)
- Frontend shows proper slot colors and states

## Frontend Integration

### Slot Status Display

The frontend now properly displays slot statuses:

```typescript
const getSlotStatus = (trainer: any, date: Date, timeSlot: string) => {
  const dayOfWeek = date.getDay();
  return trainer.schedule[dayOfWeek]?.[timeSlot] || 'Available';
};

const isSlotBooked = (status: string) => status === 'Booked';
const isSlotAvailable = (status: string) => status === 'Available';
```

### Visual Styling

```typescript
const getSlotClassName = (status: string, isSelected: boolean) => {
  switch (status) {
    case 'Booked':
      return 'bg-red-600 text-white cursor-not-allowed opacity-75';
    case 'Unavailable':
      return 'bg-gray-500 text-gray-300 cursor-not-allowed opacity-50';
    case 'Break':
      return 'bg-yellow-600 text-white cursor-not-allowed opacity-75';
    default:
      return isSelected 
        ? 'bg-green-500 text-white' 
        : 'bg-gray-700 text-white hover:bg-green-600 hover:text-white';
  }
};
```

## Error Handling

### Common Error Scenarios

1. **Slot Already Booked**
   - Error: "Selected time slot is not available or already booked"
   - Frontend shows slot in red and prevents selection

2. **Invalid Time Slot**
   - Error: "Selected time slot is not available"
   - Occurs when slot doesn't exist in trainer's schedule

3. **Database Transaction Failures**
   - System automatically rolls back changes
   - User receives clear error message

### Validation

The system validates:
- Trainer exists and is active
- Date is in the future
- Time slot is within trainer's working hours
- No double-booking conflicts
- User has permission to book sessions

## Testing

### Manual Testing

1. **Book a session** and verify slot becomes red
2. **Try to book the same slot** and verify it's rejected
3. **Complete a session** and verify slot becomes available again
4. **Check frontend** shows proper colors and states

### Database Testing

```sql
-- Check slot status
SELECT * FROM trainer_schedules WHERE trainer_id = 1 AND day_of_week = 1;

-- Check trigger is working
INSERT INTO training_sessions (trainer_id, client_id, session_date, start_time, end_time, session_type)
VALUES (1, 1, '2024-01-22', '09:00', '10:00', 'personal_training');

-- Verify slot status changed
SELECT status FROM trainer_schedules WHERE trainer_id = 1 AND day_of_week = 1 AND time_slot = '09:00';
```

## Troubleshooting

### Common Issues

1. **Slots not updating after booking**
   - Check if triggers are properly created
   - Verify database function permissions
   - Check for transaction rollbacks

2. **Frontend not showing correct colors**
   - Verify API responses include slot statuses
   - Check frontend state management
   - Ensure proper data refresh after booking

3. **Database connection issues**
   - Verify database credentials
   - Check network connectivity
   - Ensure database is running

### Debug Commands

```bash
# Check database logs
tail -f /var/log/postgresql/postgresql-*.log

# Test database connection
psql -h localhost -U username -d finovafitness

# Check table structure
\d trainer_schedules
```

## Future Enhancements

1. **Recurring Bookings**: Support for weekly/monthly recurring sessions
2. **Waitlist System**: Allow users to join waitlists for popular time slots
3. **Advanced Scheduling**: Support for trainer preferences and constraints
4. **Notification System**: Email/SMS reminders for upcoming sessions
5. **Analytics Dashboard**: Track booking patterns and trainer utilization

## Support

For technical support or questions about the trainer booking system, please refer to the development team or create an issue in the project repository.
