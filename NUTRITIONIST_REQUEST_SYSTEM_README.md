# Nutritionist Request System

This document describes the implementation of the nutritionist request system for Finova Fitness, which allows members to request diet plans from nutritionists and track their status.

## Overview

The nutritionist request system consists of:

1. **Member Portal**: Members can view available nutritionists and submit diet plan requests
2. **Nutritionist Portal**: Nutritionists can view, approve, reject, and complete diet plan requests
3. **Database**: Stores all request data and status information
4. **API Endpoints**: Backend services to handle all operations

## Features

### For Members
- View list of available nutritionists
- Submit diet plan requests with detailed information
- Track request status (pending, approved, rejected, completed)
- View nutritionist notes and meal plans
- Access to different tabs for different request statuses

### For Nutritionists
- View all diet plan requests assigned to them
- Approve or reject pending requests
- Add notes and meal plans when approving
- Mark approved requests as completed
- View request history and statistics

## Database Schema

### `diet_plan_requests` Table

```sql
CREATE TABLE diet_plan_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    fitness_goal VARCHAR(100) NOT NULL,
    current_weight DECIMAL(5,2) NOT NULL,
    target_weight DECIMAL(5,2) NOT NULL,
    monthly_budget DECIMAL(10,2) NOT NULL,
    dietary_restrictions TEXT,
    additional_notes TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    nutritionist_notes TEXT,
    preparation_time VARCHAR(100),
    meal_plan TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Member Endpoints

- `POST /api/members/diet-plan-request` - Create a new diet plan request
- `GET /api/members/diet-plan-requests` - Get all diet plan requests for the logged-in member
- `GET /api/members/nutritionists` - Get list of available nutritionists

### Nutritionist Endpoints

- `GET /api/nutritionists/diet-plan-requests` - Get all diet plan requests for the logged-in nutritionist
- `PUT /api/nutritionists/diet-plan-requests/:requestId` - Update request status and add notes/meal plan
- `GET /api/nutritionists/dashboard` - Get nutritionist dashboard statistics

## Setup Instructions

### 1. Database Migration

Run the migration script to create the required table:

```bash
cd backend/src/scripts
node run-diet-plan-requests-migration.js
```

### 2. Backend Setup

The backend is already configured with:
- Nutritionist controller (`nutritionistController.js`)
- Nutritionist routes (`nutritionists.js`)
- Authentication middleware for nutritionists
- Integration with main Express app

### 3. Frontend Setup

The frontend components are already updated:
- `NutritionistsTab` in `MemberPortal.tsx`
- `DietPlanRequests` in `NutritionistPortal.tsx`
- API integration in `memberApi.ts`

## Usage Flow

### Member Request Flow

1. Member navigates to Nutritionists tab in Member Portal
2. Views list of available nutritionists
3. Clicks "Request Diet Plan" on a nutritionist
4. Fills out the diet plan request form:
   - Fitness goal
   - Current and target weight
   - Monthly budget
   - Dietary restrictions
   - Additional notes
5. Submits the request
6. Can track request status in different tabs

### Nutritionist Response Flow

1. Nutritionist logs into Nutritionist Portal
2. Navigates to "Diet Plan Requests" section
3. Views pending requests in the "Pending Requests" tab
4. For each request, can:
   - **Approve**: Add approval notes, preparation time estimate, and optionally the meal plan
   - **Reject**: Add rejection reason
5. When approving, nutritionist must specify preparation time (e.g., "2-3 days", "1 week")
6. Meal plan can be added during approval OR added later when ready
7. Approved requests move to "Approved Requests" tab
8. Can mark approved requests as "Completed" when meal plan is delivered
9. All actions are logged with timestamps

## Request Statuses

- **Pending**: New request submitted by member
- **Approved**: Nutritionist has approved and provided meal plan
- **Rejected**: Nutritionist has rejected the request
- **Completed**: Approved request marked as completed

## Data Flow

```
Member submits request → Database stores as 'pending' → 
Nutritionist reviews → Updates status to 'approved'/'rejected' → 
Member sees updated status → If approved, nutritionist can mark as 'completed'
```

## Security Features

- JWT token authentication required for all endpoints
- Role-based access control (members can only see their own requests)
- Nutritionists can only access requests assigned to them
- Input validation and sanitization

## Error Handling

- Graceful fallbacks for API failures
- User-friendly error messages
- Toast notifications for success/error states
- Loading states during API calls

## Future Enhancements

- Email notifications for status changes
- File uploads for meal plan documents
- Scheduling consultation appointments
- Payment integration for premium services
- Analytics and reporting dashboard

## Troubleshooting

### Common Issues

1. **Migration fails**: Ensure database connection is working
2. **API calls fail**: Check if backend server is running on port 3001
3. **Authentication errors**: Verify JWT token is valid and user role is correct
4. **Empty nutritionist list**: Ensure there are users with 'nutritionist' role in the database

### Debug Steps

1. Check browser console for JavaScript errors
2. Verify API endpoints are accessible
3. Check database table exists and has correct structure
4. Verify user roles in the database

## Testing

To test the system:

1. Create a member account
2. Create a nutritionist account
3. Login as member and submit a diet plan request
4. Login as nutritionist and process the request
5. Verify status updates are reflected in both portals

## Support

For technical issues or questions about the nutritionist request system, please refer to the development team or create an issue in the project repository.
