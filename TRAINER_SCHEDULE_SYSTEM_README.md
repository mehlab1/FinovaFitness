# Trainer Schedule System

## Overview

The Trainer Schedule System allows trainers to design their own training schedules and enables members to book sessions based on available time slots. The system automatically generates time slots based on trainer availability settings.

## How It Works

### 1. Trainer Schedule Setup

Trainers can configure their availability through the **Setup Schedule** mode:

- **Global Settings**: Set default working hours, session duration, and break times
- **Daily Configuration**: Configure availability for each day of the week
  - Enable/disable specific days
  - Set start and end times for each day
  - Configure session duration and break duration between sessions
  - Preview generated time slots

### 2. Automatic Time Slot Generation

When a trainer saves their availability:
1. The system clears existing time slots for that trainer
2. Generates new time slots based on:
   - Working days (enabled days)
   - Start and end times for each day
   - Session duration
   - Break duration between sessions
3. All generated slots are marked as "available"

### 3. Member Booking Process

Members can:
1. Browse available trainers
2. Select a trainer and date
3. View available time slots for that date
4. Book sessions by selecting an available slot
5. Choose session type and add notes

## Database Schema

### Core Tables

#### `trainer_availability`
Stores trainer's working schedule configuration:
```sql
CREATE TABLE trainer_availability (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id),
    day_of_week INTEGER NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    session_duration_minutes INTEGER DEFAULT 60,
    max_sessions_per_day INTEGER DEFAULT 8,
    break_duration_minutes INTEGER DEFAULT 15
);
```

#### `trainer_schedules`
Stores generated time slots:
```sql
CREATE TABLE trainer_schedules (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id),
    day_of_week INTEGER NOT NULL,
    time_slot TIME NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    booking_id INTEGER REFERENCES training_sessions(id),
    client_id INTEGER REFERENCES users(id),
    session_date DATE,
    notes TEXT
);
```

#### `training_sessions`
Stores actual booked sessions:
```sql
CREATE TABLE training_sessions (
    id SERIAL PRIMARY KEY,
    trainer_id INTEGER REFERENCES trainers(id),
    client_id INTEGER REFERENCES users(id),
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    session_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'scheduled',
    price DECIMAL(10,2),
    notes TEXT
);
```

## API Endpoints

### Trainer Endpoints

#### `GET /api/trainers/availability`
Get trainer's current availability settings

#### `PUT /api/trainers/availability`
Update trainer's availability settings

#### `POST /api/trainers/generate-slots`
Generate time slots based on availability

#### `GET /api/trainers/available-slots?date=YYYY-MM-DD`
Get available time slots for a specific date

#### `POST /api/trainers/block-slots`
Block specific time slots (mark as unavailable)

#### `DELETE /api/trainers/block-slots/:id`
Unblock time slots (mark as available again)

### Member Endpoints

#### `GET /api/members/trainers`
Get list of available trainers

#### `GET /api/members/trainers/:trainerId/schedule/:date`
Get trainer's schedule for a specific date

#### `POST /api/members/book-training-session`
Book a training session

## Frontend Components

### TrainerSchedule Component
- **Setup Mode**: Configure availability and generate time slots
- **View Mode**: View current schedule and booked sessions
- Real-time preview of generated time slots
- Statistics dashboard

### TrainersTab Component (Member Portal)
- Browse available trainers
- View trainer profiles and ratings
- Select dates and view available slots
- Book training sessions

## Usage Flow

### For Trainers:
1. Navigate to Trainer Portal → Schedule
2. Click "Setup Schedule"
3. Configure global settings (default times, session duration)
4. Set availability for each day of the week
5. Preview generated time slots
6. Click "Save Schedule" to generate slots
7. Switch to "View Schedule" to see current bookings

### For Members:
1. Navigate to Member Portal → Trainers
2. Select a trainer from the list
3. Choose a date for the session
4. View available time slots
5. Click on an available slot to book
6. Fill in session details (type, notes)
7. Confirm booking

## Features

### ✅ Implemented
- Trainer availability configuration
- Automatic time slot generation
- Member booking system
- Real-time slot status updates
- Session management
- Trainer profiles and ratings

### 🔄 Future Enhancements
- Recurring session bookings
- Bulk time slot blocking
- Calendar integration
- Email notifications
- Payment processing
- Session rescheduling
- Waitlist functionality

## Technical Notes

### Time Slot Generation Algorithm
```javascript
const generateTimeSlots = (day) => {
  const slots = [];
  const startTime = new Date(`2000-01-01T${day.startTime}`);
  const endTime = new Date(`2000-01-01T${day.endTime}`);
  const sessionDurationMs = day.sessionDuration * 60 * 1000;
  const breakDurationMs = day.breakDuration * 60 * 1000;
  
  let currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    slots.push(currentTime.toTimeString().slice(0, 5));
    currentTime = new Date(currentTime.getTime() + sessionDurationMs + breakDurationMs);
  }
  
  return slots;
};
```

### Database Triggers
The system uses database triggers to automatically:
- Update slot status when sessions are booked/cancelled
- Maintain referential integrity
- Update trainer statistics

## Testing

To test the system:

1. **Create a trainer account** and log in
2. **Set up availability** in the Schedule section
3. **Generate time slots** by saving the schedule
4. **Create a member account** and log in
5. **Browse trainers** and select the created trainer
6. **Book a session** by selecting an available time slot
7. **Verify** the slot is marked as booked in the trainer's schedule

## Troubleshooting

### Common Issues

1. **No time slots generated**: Check if availability is properly configured
2. **Slots not showing as available**: Verify trainer_schedules table has correct status
3. **Booking fails**: Check if slot is actually available and not already booked
4. **Date mismatch**: Ensure date format is YYYY-MM-DD

### Database Queries for Debugging

```sql
-- Check trainer availability
SELECT * FROM trainer_availability WHERE trainer_id = [TRAINER_ID];

-- Check generated time slots
SELECT * FROM trainer_schedules WHERE trainer_id = [TRAINER_ID];

-- Check booked sessions
SELECT * FROM training_sessions WHERE trainer_id = [TRAINER_ID];
```

## Security Considerations

- All endpoints require proper authentication
- Trainers can only modify their own schedules
- Members can only book available slots
- Input validation on all form fields
- SQL injection protection through parameterized queries
