# Monthly Plan System - Complete Testing Guide

## Overview
This guide provides step-by-step instructions to test the complete Monthly Plan System flow across all three phases:
1. **Admin Approval System** - Admins approve/reject trainer monthly plans
2. **Member Portal Integration** - Members browse and subscribe to approved plans
3. **Trainer Subscription Management** - Trainers manage member subscription requests

## Prerequisites
- Backend server running (`cd backend && npm start`)
- Frontend server running (`cd client && npm run dev`)
- Database populated with sample data
- Test users created for each role

## Phase 1: Admin Approval System Testing

### Step 1: Backend API Testing
```bash
# Navigate to backend directory
cd backend

# Test admin monthly plan endpoints
node test-admin-api.js
```

**Expected Results:**
- ✅ Authentication working (401 for invalid token)
- ✅ Admin access working (403 for non-admin users)
- ✅ GET /api/admin/monthly-plans/pending returns pending plans
- ✅ GET /api/admin/monthly-plans/approved returns approved plans
- ✅ GET /api/admin/monthly-plans/stats returns statistics
- ✅ POST /api/admin/monthly-plans/{id}/approve approves plans
- ✅ POST /api/admin/monthly-plans/{id}/reject rejects plans

### Step 2: Frontend Testing
1. **Access Admin Portal:**
   - Open browser to `http://localhost:5173`
   - Login as admin user
   - Navigate to Admin Portal

2. **Test Monthly Plan Approval:**
   - Click on "Monthly Plan Approval" in the navigation
   - Verify pending plans are displayed
   - Test approval flow:
     - Click "Approve" on a pending plan
     - Verify plan moves to "Approved Plans" tab
     - Check status changes to "Approved"
   - Test rejection flow:
     - Click "Reject" on a pending plan
     - Verify plan moves to "Rejected Plans" tab
     - Check status changes to "Rejected"

3. **Test Statistics:**
   - Verify statistics panel shows correct counts
   - Check that numbers update after approval/rejection actions

## Phase 2: Member Portal Integration Testing

### Step 1: Backend API Testing
```bash
# Test member monthly plan endpoints
node test-member-monthly-plan-api.js
```

**Expected Results:**
- ✅ Authentication working (401 for invalid token)
- ✅ Member access working (403 for non-member users)
- ✅ GET /api/member/monthly-plans/{memberId}/available returns approved plans
- ✅ POST /api/member/monthly-plans/{memberId}/subscribe creates subscription
- ✅ GET /api/member/monthly-plans/{memberId}/subscriptions returns member subscriptions
- ✅ POST /api/member/monthly-plans/{memberId}/subscriptions/{subscriptionId}/cancel cancels subscription

### Step 2: Frontend Testing
1. **Access Member Portal:**
   - Login as member user
   - Navigate to Member Portal

2. **Test Plan Browsing:**
   - Click on "Monthly Plans" in the navigation
   - Verify approved plans are displayed
   - Test filtering by trainer name
   - Test plan details view

3. **Test Subscription Flow:**
   - Click "Request Subscription" on a plan
   - Verify subscription request is created
   - Check subscription appears in "My Subscriptions" tab
   - Test subscription cancellation

## Phase 3: Trainer Subscription Management Testing

### Step 1: Backend API Testing
```bash
# Test trainer subscription endpoints
node test-trainer-subscription-api.js
```

**Expected Results:**
- ✅ Authentication working (401 for invalid token)
- ✅ Trainer access working (403 for non-trainer users)
- ✅ GET /api/trainer/subscriptions/{trainerId}/pending returns pending requests
- ✅ GET /api/trainer/subscriptions/{trainerId}/all returns all subscriptions
- ✅ POST /api/trainer/subscriptions/{trainerId}/approve approves requests
- ✅ POST /api/trainer/subscriptions/{trainerId}/reject rejects requests
- ✅ GET /api/trainer/subscriptions/{trainerId}/stats returns statistics

### Step 2: Frontend Testing
1. **Access Trainer Portal:**
   - Login as trainer user
   - Navigate to Trainer Portal

2. **Test Subscription Management:**
   - Click on "Subscription Management" in the navigation
   - Verify pending requests are displayed
   - Test approval flow:
     - Click "Approve" on a pending request
     - Verify request moves to "All Subscriptions" tab
     - Check status changes to "Active"
   - Test rejection flow:
     - Click "Reject" on a pending request
     - Verify request moves to "Rejected" status
   - Test filtering and statistics

## Complete End-to-End Flow Testing

### Scenario 1: Complete Approval and Subscription Flow
1. **Trainer Creates Plan:**
   - Login as trainer
   - Create a new monthly plan
   - Verify plan is created with "Pending" status

2. **Admin Approves Plan:**
   - Login as admin
   - Navigate to Monthly Plan Approval
   - Approve the trainer's plan
   - Verify plan status changes to "Approved"

3. **Member Subscribes:**
   - Login as member
   - Navigate to Monthly Plans
   - Find the approved plan
   - Request subscription
   - Verify subscription request is created

4. **Trainer Manages Subscription:**
   - Login as trainer
   - Navigate to Subscription Management
   - See pending subscription request
   - Approve the request
   - Verify subscription becomes active

### Scenario 2: Rejection Flow
1. **Admin Rejects Plan:**
   - Admin rejects a trainer's plan
   - Verify plan status changes to "Rejected"
   - Confirm plan is not available to members

2. **Member Cannot Subscribe:**
   - Member tries to browse monthly plans
   - Verify rejected plan is not visible

### Scenario 3: Subscription Cancellation
1. **Member Cancels Subscription:**
   - Member cancels an active subscription
   - Verify subscription status changes to "Cancelled"

2. **Trainer Sees Cancellation:**
   - Trainer checks subscription management
   - Verify cancelled subscription is visible in history

## Data Verification

### Database Checks
```sql
-- Check monthly plans
SELECT * FROM trainer_monthly_plans ORDER BY created_at DESC;

-- Check subscriptions
SELECT * FROM monthly_plan_subscriptions ORDER BY created_at DESC;

-- Check session assignments
SELECT * FROM monthly_plan_session_assignments ORDER BY created_at DESC;
```

### API Response Verification
- All endpoints return proper HTTP status codes
- JSON responses contain expected data structure
- Error handling works correctly for invalid requests
- Authentication and authorization work as expected

## Common Issues and Troubleshooting

### Issue: 404 Route Not Found
**Solution:** Restart the backend server after adding new routes
```bash
# Stop backend server (Ctrl+C)
# Restart backend server
cd backend && npm start
```

### Issue: Authentication Errors
**Solution:** Verify JWT token is valid and user has correct role
```bash
# Check user roles in database
SELECT id, username, role FROM users WHERE role IN ('admin', 'member', 'trainer');
```

### Issue: No Data Visible
**Solution:** Run sample data creation scripts
```bash
# Create sample monthly plans
node test-monthly-plan-system.js

# Create additional pending plan
node create-pending-plan.js
```

## Performance Testing

### Load Testing
- Test with multiple concurrent users
- Verify API response times remain acceptable
- Check database performance under load

### Browser Testing
- Test in different browsers (Chrome, Firefox, Safari, Edge)
- Verify responsive design on mobile devices
- Check accessibility features

## Security Testing

### Authentication Testing
- Verify protected routes require valid JWT tokens
- Test role-based access control
- Verify session management

### Input Validation
- Test with invalid/malicious input data
- Verify SQL injection protection
- Check XSS protection

## Conclusion

After completing all testing steps:
1. ✅ All three phases are functional
2. ✅ End-to-end flow works correctly
3. ✅ Data integrity is maintained
4. ✅ Security measures are in place
5. ✅ User experience is smooth across all portals

The Monthly Plan System is now fully operational and ready for production use!
