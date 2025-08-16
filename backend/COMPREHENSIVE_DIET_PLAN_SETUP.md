# Comprehensive Diet Plan Setup Guide

## 🚀 Overview
This implementation adds comprehensive diet plan functionality to the existing diet plan request system, allowing nutritionists to create detailed meal plans with weekly breakdowns.

## 🗄️ Database Changes
The system extends the existing `diet_plan_requests` table with new fields:

- `diet_plan_completed` (BOOLEAN) - Indicates if comprehensive diet plan is completed
- `comprehensive_plan_data` (JSONB) - Stores complete diet plan data including weekly meal plans
- `plan_created_at` (TIMESTAMP) - When the plan was first created
- `plan_updated_at` (TIMESTAMP) - When the plan was last updated

## 🔧 Setup Instructions

### 1. Run Database Migration
```bash
cd backend
node scripts/run-comprehensive-diet-plan-migration.js
```

### 2. Verify Migration
The script will automatically verify that all new fields were added correctly.

### 3. Restart Backend Server
```bash
npm run dev
```

## 📡 New API Endpoints

### POST `/api/nutritionists/comprehensive-diet-plans`
- Creates a new comprehensive diet plan
- Stores plan data as JSONB in the database
- Links plan to client and nutritionist

### GET `/api/nutritionists/comprehensive-diet-plans/:requestId`
- Retrieves comprehensive diet plan data
- Includes all plan details and metadata

### PUT `/api/nutritionists/comprehensive-diet-plans/:requestId`
- Updates existing comprehensive diet plan
- Preserves existing data while updating specified fields

### PATCH `/api/nutritionists/comprehensive-diet-plans/:requestId/progress`
- Saves progress during plan creation
- Allows nutritionists to continue later

## 🔄 Updated Existing Endpoints

### PUT `/api/nutritionists/diet-plan-requests/:requestId`
- Now supports `diet_plan_completed` field
- Dynamically builds update queries based on provided fields

### GET `/api/nutritionists/diet-plan-requests`
- Returns enhanced data including new comprehensive plan fields
- Maintains backward compatibility

## 🏗️ Architecture Benefits

### Enterprise-Level Features:
- **Data Integrity**: Maintains referential integrity with existing tables
- **Performance**: GIN indexes on JSONB fields for optimal query performance
- **Scalability**: JSONB storage allows flexible plan structures
- **Security**: Proper authentication and authorization on all endpoints
- **Monitoring**: Comprehensive error logging and validation

### Data Structure:
- **Client Linking**: Each plan is properly linked to client and nutritionist
- **Version Control**: Tracks creation and update timestamps
- **Flexible Storage**: JSONB allows for complex meal plan structures
- **Progress Tracking**: Supports saving and resuming plan creation

## 🧪 Testing

### Test the "Create Plan" Button:
1. Go to Nutritionist Portal → Meal Plan Templates → Diet Plan Requests
2. Select a pending request
3. Click "Create Diet Plan" → "Continue"
4. Complete all 6 steps
5. Click "Create Plan" on step 6
6. Verify request moves to Final Review tab

### Test Progress Saving:
1. Start creating a diet plan
2. Click "Save Progress" at any step
3. Close the modal
4. Reopen the request
5. Verify progress is loaded correctly

## 🔍 Troubleshooting

### Common Issues:
1. **404 Error on Create Plan**: Ensure migration script ran successfully
2. **Database Connection**: Verify database is running and accessible
3. **Permission Errors**: Check that nutritionist authentication is working

### Migration Verification:
```sql
-- Check if new fields exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'diet_plan_requests' 
AND column_name IN ('diet_plan_completed', 'comprehensive_plan_data');

-- Check if indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'diet_plan_requests' 
AND indexname LIKE '%comprehensive%';
```

## 📝 Notes
- All existing functionality remains unchanged
- Final review tab works exactly as before
- Progress saving works with both database and localStorage
- System automatically handles pending vs final review scenarios
