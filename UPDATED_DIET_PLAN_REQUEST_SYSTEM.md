# Updated Diet Plan Request System

This document describes the enhanced diet plan request system for Finova Fitness, which now includes all the requested fields and improved functionality.

## Overview

The diet plan request system allows members to submit comprehensive diet plan requests to nutritionists with detailed information about their goals, current status, and preferences. The system tracks the entire lifecycle of requests from submission to completion.

## New Features

### Enhanced Form Fields

The diet plan request form now includes all the requested fields:

1. **Select Goal** - Can be custom with description
   - Weight Loss
   - Muscle Gain
   - Maintenance
   - Performance
   - Custom Goal (with description field)

2. **Current Weight** - In kilograms (required)

3. **Height** - In centimeters (required)

4. **Goal Weight** - In kilograms (required)

5. **Activity Level** - Detailed activity level selection (required)
   - Sedentary (Little to no exercise)
   - Lightly Active (Light exercise 1-3 days/week)
   - Moderately Active (Moderate exercise 3-5 days/week)
   - Very Active (Hard exercise 6-7 days/week)
   - Extremely Active (Very hard exercise, physical job)

6. **Budget Monthly** - Monthly budget in PKR (required)

7. **Dietary Restrictions** - Any allergies or dietary preferences (optional)

8. **Additional Notes** - Any other information (optional)

### Request Status Tracking

The system tracks requests through the following statuses:

- **Pending** - Request submitted, awaiting nutritionist review
- **Approved** - Request approved with preparation time estimate
- **Rejected** - Request rejected with reason
- **Completed** - Diet plan delivered and marked complete

## Database Schema

### Updated `diet_plan_requests` Table

```sql
CREATE TABLE IF NOT EXISTS diet_plan_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    nutritionist_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    fitness_goal VARCHAR(100) NOT NULL,
    current_weight DECIMAL(5,2) NOT NULL,
    height DECIMAL(5,2) NOT NULL,
    target_weight DECIMAL(5,2) NOT NULL,
    activity_level VARCHAR(50) NOT NULL,
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

### New Fields Added

- `height` - Member's height in centimeters
- `activity_level` - Detailed activity level classification
- `preparation_time` - Nutritionist's estimate for plan preparation

## API Endpoints

### Member Endpoints

- `POST /api/members/diet-plan-request` - Create a new diet plan request
- `GET /api/members/diet-plan-requests` - Get all diet plan requests for the logged-in member
- `GET /api/members/nutritionists` - Get list of available nutritionists

### Nutritionist Endpoints

- `GET /api/nutritionists/diet-plan-requests` - Get all diet plan requests for the logged-in nutritionist
- `PUT /api/nutritionists/diet-plan-requests/:requestId` - Update request status and add notes/meal plan
- `GET /api/nutritionists/dashboard` - Get nutritionist dashboard statistics

## Frontend Components

### Member Portal - NutritionistsTab

The member portal now includes a comprehensive diet plan request form with:

- **Goal Selection**: Dropdown with predefined options and custom goal input
- **Physical Measurements**: Current weight, height, and target weight
- **Activity Level**: Detailed dropdown with descriptions
- **Budget**: Monthly budget input in PKR
- **Additional Information**: Dietary restrictions and notes
- **Request Tracking**: Tabs for different request statuses

### Nutritionist Portal - DietPlanRequests

The nutritionist portal includes:

- **Request Management**: View and manage all assigned requests
- **Status Updates**: Approve, reject, or complete requests
- **Preparation Time**: Required field when approving requests
- **Notes and Meal Plans**: Add detailed feedback and meal plans
- **Request History**: Track all requests through their lifecycle

## Setup Instructions

### 1. Database Migration

Run the updated schema migration:

```bash
cd backend/src/scripts
node update-diet-plan-requests-schema.js
```

### 2. Backend Setup

The backend is already configured with:
- Updated member controller (`memberController.js`)
- Updated nutritionist controller (`nutritionistController.js`)
- Updated member routes (`members.js`)
- Authentication middleware for members and nutritionists

### 3. Frontend Setup

The frontend components are updated:
- Enhanced `NutritionistsTab` in `MemberPortal.tsx`
- Updated `DietPlanRequests` in `NutritionistPortal.tsx`
- Enhanced API integration in `memberApi.ts`

## Usage Flow

### Member Request Flow

1. **Navigate to Nutritionists Tab**: Access the nutritionists section in the member portal
2. **Select Nutritionist**: Choose from available nutritionists
3. **Fill Request Form**: Complete all required fields:
   - Select fitness goal (or enter custom goal)
   - Enter current weight, height, and target weight
   - Select activity level
   - Specify monthly budget
   - Add dietary restrictions (optional)
   - Include additional notes (optional)
4. **Submit Request**: Form validation ensures all required fields are completed
5. **Track Progress**: Monitor request status through different tabs

### Nutritionist Response Flow

1. **Review Requests**: View pending requests in the nutritionist portal
2. **Take Action**: For each request:
   - **Approve**: Add approval notes, preparation time estimate, and optionally the meal plan
   - **Reject**: Add rejection reason
   - **Complete**: Mark approved requests as completed
3. **Required Fields**: Preparation time is mandatory when approving requests
4. **Communication**: Use chat system for approved requests

## Form Validation

### Required Fields

- Fitness Goal (or Custom Goal Description)
- Current Weight
- Height
- Target Weight
- Activity Level
- Monthly Budget

### Optional Fields

- Dietary Restrictions
- Additional Notes

### Validation Rules

- Weight and height must be positive numbers
- Budget must be a positive number
- Custom goal requires description when selected
- All required fields must be completed before submission

## Data Display

### Request Status Tabs

- **Pending Requests**: Newly submitted requests awaiting review
- **Approved Requests**: Requests approved with preparation time
- **Rejected Requests**: Requests rejected with reasons
- **Completed Plans**: Finished diet plans

### Request Information Display

Each request shows:
- Client and nutritionist information
- All form fields (goals, measurements, activity level, budget)
- Request status and timestamps
- Nutritionist notes and meal plans
- Preparation time estimates

## Benefits

### For Members

- **Comprehensive Information**: Provide detailed information for better diet plans
- **Goal Customization**: Custom fitness goals with descriptions
- **Activity Level Precision**: Detailed activity level classification
- **Budget Planning**: Clear budget specification for nutrition services
- **Status Tracking**: Real-time updates on request progress

### For Nutritionists

- **Complete Client Profile**: All necessary information for personalized plans
- **Better Planning**: Activity level and budget information for service planning
- **Professional Communication**: Structured notes and preparation time estimates
- **Request Management**: Organized workflow for handling multiple requests

### For the System

- **Data Completeness**: Comprehensive information collection
- **Professional Workflow**: Structured request approval process
- **Quality Assurance**: Required fields ensure complete information
- **Scalability**: Organized system for handling multiple requests

## Technical Implementation

### Database Changes

- Added new columns to existing table
- Maintained backward compatibility
- Added appropriate constraints and validation

### API Updates

- Enhanced request creation with new fields
- Updated request updates to include preparation time
- Maintained existing API structure

### Frontend Enhancements

- Enhanced form with new fields
- Improved validation and user experience
- Better data display and organization

## Future Enhancements

Potential improvements for the system:

1. **File Attachments**: Allow members to upload relevant documents
2. **Progress Tracking**: Track diet plan adherence and results
3. **Automated Reminders**: Notify members of plan updates
4. **Integration**: Connect with workout tracking and progress monitoring
5. **Analytics**: Provide insights on request patterns and success rates

## Conclusion

The updated diet plan request system provides a comprehensive solution for members to request personalized nutrition plans and for nutritionists to manage these requests efficiently. The enhanced form fields ensure that nutritionists have all the necessary information to create effective, personalized diet plans while maintaining a professional and organized workflow.
