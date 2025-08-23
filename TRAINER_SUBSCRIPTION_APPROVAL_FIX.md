# Trainer Subscription Approval System Fix

## Problem
When trainers tried to approve subscription requests in the trainer subscription management portal, they received a 500 Internal Server Error. The error was caused by missing database columns and constraints that the backend controller expected to exist.

## Root Cause
The `trainerSubscriptionController.js` was trying to update columns that didn't exist in the `monthly_plan_subscriptions` table:
- `trainer_approval_date`
- `trainer_approval_notes`
- `trainer_rejection_date`
- `trainer_rejection_reason`

Additionally, the status constraint didn't include 'rejected' as a valid status.

## Solution
Applied the following database migrations:

### 1. Added Trainer Approval Columns
```sql
ALTER TABLE monthly_plan_subscriptions 
ADD COLUMN IF NOT EXISTS trainer_approval_date TIMESTAMP;

ALTER TABLE monthly_plan_subscriptions 
ADD COLUMN IF NOT EXISTS trainer_approval_notes TEXT;
```

### 2. Added Trainer Rejection Columns
```sql
ALTER TABLE monthly_plan_subscriptions 
ADD COLUMN IF NOT EXISTS trainer_rejection_date TIMESTAMP;

ALTER TABLE monthly_plan_subscriptions 
ADD COLUMN IF NOT EXISTS trainer_rejection_reason TEXT;
```

### 3. Updated Status Constraint
```sql
ALTER TABLE monthly_plan_subscriptions 
DROP CONSTRAINT IF EXISTS monthly_plan_subscriptions_status_check;

ALTER TABLE monthly_plan_subscriptions 
ADD CONSTRAINT monthly_plan_subscriptions_status_check 
CHECK (status IN ('active', 'cancelled', 'expired', 'pending', 'paused', 'rejected'));
```

### 4. Added Performance Indexes
```sql
CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_trainer_approval_date 
ON monthly_plan_subscriptions(trainer_approval_date);

CREATE INDEX IF NOT EXISTS idx_monthly_plan_subscriptions_trainer_rejection_date 
ON monthly_plan_subscriptions(trainer_rejection_date);
```

## Files Modified
- `backend/src/database/add-trainer-approval-columns.sql` - Migration for approval columns
- `backend/src/database/add-trainer-rejection-columns.sql` - Migration for rejection columns
- `backend/src/database/add-rejected-status.sql` - Migration for status constraint
- `backend/src/database/schemas/monthly-plan-system.sql` - Updated main schema file
- `backend/run-complete-trainer-subscription-fix.js` - Comprehensive fix script

## How to Apply the Fix
Run the comprehensive fix script:
```bash
cd backend
node run-complete-trainer-subscription-fix.js
```

## Testing
After applying the fix, trainers should be able to:
1. View pending subscription requests
2. Approve subscription requests (status changes to 'active')
3. Reject subscription requests (status changes to 'rejected')
4. Add notes/reasons when approving or rejecting

## API Endpoints Affected
- `POST /api/trainer/subscriptions/approve` - Now works correctly
- `POST /api/trainer/subscriptions/reject` - Now works correctly

## Status Values
The `monthly_plan_subscriptions` table now supports these status values:
- `active` - Approved and active subscription
- `pending` - Waiting for trainer approval
- `rejected` - Rejected by trainer
- `cancelled` - Cancelled by member
- `expired` - Subscription has expired
- `paused` - Temporarily paused

## Notes
- The fix is backward compatible
- Existing data is preserved
- Performance indexes were added for optimal query performance
- The main schema file was updated for future deployments
