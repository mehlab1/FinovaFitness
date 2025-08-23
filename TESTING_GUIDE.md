# Walk-In Sales E2E Testing Guide

## Overview

This guide covers comprehensive end-to-end testing for the Walk-In Sales functionality using Playwright. The tests verify the complete flow from login to member creation, including form validation, API integration, and error handling.

## Prerequisites

Before running the tests, ensure you have:

1. **Backend Server Running**: The backend should be running on `http://localhost:3001`
2. **Frontend Server Running**: The frontend should be running on `http://localhost:5173`
3. **Database**: PostgreSQL database should be accessible and contain test data
4. **Test Credentials**: Front desk user account should exist with the provided credentials

## Test Credentials

- **Email**: `frontdesk@finovafitness.com`
- **Password**: `frontdesk123`

## Quick Start

### Option 1: Using Test Scripts (Recommended)

#### For Linux/Mac:
```bash
# Make script executable
chmod +x run-tests.sh

# Run tests on Chromium (default)
./run-tests.sh

# Run tests on all browsers
./run-tests.sh all

# Run tests with visible browser
./run-tests.sh headed

# Run tests with Playwright UI
./run-tests.sh ui

# Run tests in debug mode
./run-tests.sh debug

# Run tests on mobile browsers
./run-tests.sh mobile
```

#### For Windows:
```cmd
# Run tests on Chromium (default)
run-tests.bat

# Run tests on all browsers
run-tests.bat all

# Run tests with visible browser
run-tests.bat headed

# Run tests with Playwright UI
run-tests.bat ui

# Run tests in debug mode
run-tests.bat debug

# Run tests on mobile browsers
run-tests.bat mobile
```

### Option 2: Manual Setup

1. **Install Dependencies**:
   ```bash
   cd client
   npm install @playwright/test
   npx playwright install
   ```

2. **Create Auth Directory**:
   ```bash
   mkdir -p playwright/.auth
   ```

3. **Run Tests**:
   ```bash
   # Run all tests
   npx playwright test

   # Run specific test file
   npx playwright test walk-in-sales-e2e.spec.ts

   # Run with UI
   npx playwright test --ui

   # Run in headed mode
   npx playwright test --headed
   ```

## Test Coverage

### 1. Authentication & Navigation
- ✅ Front desk user login
- ✅ Navigation to Walk-In Sales tab
- ✅ Authentication state management

### 2. Form Validation
- ✅ Required field validation
- ✅ Email format validation
- ✅ Phone number format validation
- ✅ Name format validation (letters and spaces only)
- ✅ Age validation (13-100 years)
- ✅ Payment method validation
- ✅ Payment confirmation requirement

### 3. API Integration
- ✅ Membership plans loading
- ✅ Member creation API calls
- ✅ API error handling
- ✅ Success response handling
- ✅ Loading states during API calls

### 4. User Experience
- ✅ Form field interactions
- ✅ Error message display
- ✅ Loading state indicators
- ✅ Success message display
- ✅ Form reset functionality
- ✅ Responsive design on mobile

### 5. Data Integrity
- ✅ Member data creation
- ✅ Profile data creation
- ✅ Revenue tracking
- ✅ Email notifications
- ✅ WhatsApp notifications

## Test Scenarios

### Happy Path Tests
1. **Complete Member Registration**: Full form with all required fields
2. **Optional Fields**: Registration with additional optional information
3. **Different Payment Methods**: Testing all payment method options
4. **Plan Selection**: Testing membership plan selection and display

### Validation Tests
1. **Required Fields**: Testing validation when required fields are empty
2. **Email Format**: Testing invalid email formats
3. **Phone Format**: Testing invalid phone number formats
4. **Name Format**: Testing names with numbers/special characters
5. **Age Validation**: Testing underage and overage scenarios

### Error Handling Tests
1. **API Errors**: Testing duplicate email scenarios
2. **Network Errors**: Testing offline scenarios
3. **Validation Errors**: Testing form validation error display
4. **Loading States**: Testing loading indicators

### Responsive Tests
1. **Mobile Viewport**: Testing on mobile screen sizes
2. **Desktop Viewport**: Testing on desktop screen sizes
3. **Grid Layout**: Testing responsive grid layouts

## Test Files Structure

```
tests/
├── auth.setup.ts              # Authentication setup
├── walk-in-sales-e2e.spec.ts  # Main test file
└── playwright.config.ts       # Playwright configuration
```

## Test Results

After running tests, you can view results in:

1. **HTML Report**: `playwright-report/index.html`
2. **Test Results**: `test-results/` directory
3. **Screenshots**: Available for failed tests
4. **Videos**: Available for failed tests
5. **Traces**: Available for debugging

## Debugging Tests

### Using Playwright UI
```bash
npx playwright test --ui
```

### Using Debug Mode
```bash
npx playwright test --debug
```

### Using Headed Mode
```bash
npx playwright test --headed
```

### Viewing Traces
```bash
npx playwright show-trace trace.zip
```

## Common Issues & Solutions

### 1. Authentication Failures
**Issue**: Tests fail during login
**Solution**: 
- Verify front desk user exists in database
- Check credentials are correct
- Ensure backend is running

### 2. API Connection Errors
**Issue**: Tests fail with API errors
**Solution**:
- Verify backend server is running on port 3001
- Check database connection
- Verify API endpoints are accessible

### 3. Form Validation Issues
**Issue**: Validation errors not appearing
**Solution**:
- Check form field names match test selectors
- Verify validation logic is implemented
- Check error message display logic

### 4. Mobile Test Failures
**Issue**: Mobile tests fail
**Solution**:
- Check responsive design implementation
- Verify mobile viewport settings
- Test manually on mobile devices

## Performance Testing

The tests include performance checks:
- Form submission time < 3 seconds
- API response time < 1 second
- Page load time < 2 seconds

## Continuous Integration

For CI/CD integration, add to your workflow:

```yaml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run Playwright tests
  run: npx playwright test

- name: Upload test results
  uses: actions/upload-artifact@v2
  if: always()
  with:
    name: playwright-report
    path: playwright-report/
```

## Maintenance

### Updating Tests
- Update selectors when UI changes
- Add new test cases for new features
- Update validation rules when business logic changes

### Test Data Management
- Use unique test data for each test
- Clean up test data after tests
- Use database transactions for test isolation

## Support

For issues with tests:
1. Check the test logs in `test-results/`
2. View the HTML report for detailed failure information
3. Use debug mode to step through failing tests
4. Check browser console for JavaScript errors

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Unique Data**: Use unique identifiers for test data
3. **Clear Assertions**: Make test expectations clear
4. **Error Handling**: Test both success and failure scenarios
5. **Performance**: Keep tests fast and efficient
6. **Maintainability**: Write readable and maintainable tests
