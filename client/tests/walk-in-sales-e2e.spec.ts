import { test, expect } from '@playwright/test';

test.describe('Walk-In Sales End-to-End Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate directly to front desk (authentication is handled by setup)
    await page.goto('http://localhost:5173/frontdesk');
    
    // Wait for front desk portal to load
    await page.waitForSelector('text=Front Desk Portal');
    
    // Click on Walk-In Sales tab
    await page.click('text=Walk-In Sales');
  });

  test('Complete walk-in sales flow with all required fields', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Wait for membership plans to load and select one
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1'); // Select first plan
    
    // Select payment method
    await page.selectOption('select[name="payment_method"]', 'card');
    
    // Check payment confirmation
    await page.check('input[name="payment_confirmed"]');
    
    // Submit the form
    await page.click('button:has-text("Complete Sale")');
    
    // Wait for success message
    await expect(page.locator('text=Member created successfully')).toBeVisible();
    
    // Verify API was called successfully
    const apiResponse = await page.waitForResponse(response => 
      response.url().includes('/api/frontdesk/create-member') && 
      response.status() === 201
    );
    
    const responseData = await apiResponse.json();
    expect(responseData.success).toBe(true);
    expect(responseData.data.user.role).toBe('member');
    expect(responseData.data.user.email).toBe('john.doe@example.com');
  });

  test('Form validation for required fields', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Try to submit without filling required fields
    await page.click('button:has-text("Complete Sale")');
    
    // Check for validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Phone number is required')).toBeVisible();
    await expect(page.locator('text=Please select a membership plan')).toBeVisible();
    await expect(page.locator('text=Please select a payment method')).toBeVisible();
    await expect(page.locator('text=Payment confirmation is required')).toBeVisible();
  });

  test('Email format validation', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields with invalid email
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Select plan and payment
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit and check for email validation error
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('Phone number format validation', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields with invalid phone
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', 'abc123'); // Invalid phone
    
    // Select plan and payment
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit and check for phone validation error
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=Please enter a valid phone number')).toBeVisible();
  });

  test('Name format validation', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields with invalid names (numbers)
    await page.fill('input[name="first_name"]', 'John123');
    await page.fill('input[name="last_name"]', 'Doe456');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Select plan and payment
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit and check for name validation errors
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=First name can only contain letters and spaces')).toBeVisible();
    await expect(page.locator('text=Last name can only contain letters and spaces')).toBeVisible();
  });

  test('Membership plans loading and selection', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Wait for plans to load
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    
    // Check that plans are populated
    const planOptions = await page.locator('select[name="membership_plan_id"] option').count();
    expect(planOptions).toBeGreaterThan(1); // Should have at least one plan + empty option
    
    // Select a plan and verify plan summary appears
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await expect(page.locator('text=Selected Plan Details')).toBeVisible();
  });

  test('Payment method selection and validation', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Select plan
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    
    // Test different payment methods
    const paymentMethods = ['cash', 'card', 'check', 'bank_transfer'];
    
    for (const method of paymentMethods) {
      await page.selectOption('select[name="payment_method"]', method);
      await page.check('input[name="payment_confirmed"]');
      
      // Submit form
      await page.click('button:has-text("Complete Sale")');
      
      // Wait for success or check if we're still on form (indicating validation error)
      const successMessage = page.locator('text=Member created successfully');
      const isSuccess = await successMessage.isVisible().catch(() => false);
      
      if (isSuccess) {
        // If successful, break out of loop
        break;
      } else {
        // Clear form for next iteration
        await page.reload();
        await page.click('text=Walk-In Sales');
        await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
        
        // Fill required fields again
        await page.fill('input[name="first_name"]', 'Test');
        await page.fill('input[name="last_name"]', 'User');
        await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
        await page.fill('input[name="phone"]', '1234567890');
        
        await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
        await page.selectOption('select[name="membership_plan_id"]', '1');
      }
    }
  });

  test('Optional fields functionality', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields
    await page.fill('input[name="first_name"]', 'Jane');
    await page.fill('input[name="last_name"]', 'Smith');
    await page.fill('input[name="email"]', 'jane.smith@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Fill optional fields
    await page.fill('input[name="date_of_birth"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'female');
    await page.fill('input[name="address"]', '123 Main Street, City, State 12345');
    await page.fill('input[name="emergency_contact"]', 'John Smith - 0987654321');
    
    // Select plan and payment
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'cash');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit form
    await page.click('button:has-text("Complete Sale")');
    
    // Wait for success message
    await expect(page.locator('text=Member created successfully')).toBeVisible();
  });

  test('Age validation for date of birth', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields
    await page.fill('input[name="first_name"]', 'Young');
    await page.fill('input[name="last_name"]', 'Person');
    await page.fill('input[name="email"]', 'young@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Fill date of birth for someone under 13
    const underAgeDate = new Date();
    underAgeDate.setFullYear(underAgeDate.getFullYear() - 10); // 10 years old
    await page.fill('input[name="date_of_birth"]', underAgeDate.toISOString().split('T')[0]);
    
    // Select plan and payment
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit and check for age validation error
    await page.click('button:has-text("Complete Sale")');
    await expect(page.locator('text=Age must be between 13 and 100 years')).toBeVisible();
  });

  test('API error handling', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields with duplicate email (assuming this will cause an error)
    await page.fill('input[name="first_name"]', 'Duplicate');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'john.doe@example.com'); // Use same email as previous test
    await page.fill('input[name="phone"]', '1234567890');
    
    // Select plan and payment
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit form
    await page.click('button:has-text("Complete Sale")');
    
    // Check for API error display
    await expect(page.locator('.bg-red-900\\/20')).toBeVisible();
  });

  test('Loading states during form submission', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill required fields
    await page.fill('input[name="first_name"]', 'Loading');
    await page.fill('input[name="last_name"]', 'Test');
    await page.fill('input[name="email"]', 'loading@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Select plan and payment
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit form and check loading state
    await page.click('button:has-text("Complete Sale")');
    
    // Check that button shows loading state
    await expect(page.locator('button:has-text("Creating Member...")')).toBeVisible();
    
    // Wait for completion
    await expect(page.locator('text=Member created successfully')).toBeVisible();
  });

  test('Form reset and clear functionality', async ({ page }) => {
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Fill some fields
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    
    // Refresh page to clear form
    await page.reload();
    await page.click('text=Walk-In Sales');
    
    // Verify form is cleared
    await expect(page.locator('input[name="first_name"]')).toHaveValue('');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
  });

  test('Responsive design on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Verify form is responsive
    await expect(page.locator('form')).toBeVisible();
    
    // Check that grid layouts adapt to mobile
    const gridContainer = page.locator('.grid.grid-cols-1.md\\:grid-cols-2');
    await expect(gridContainer).toBeVisible();
    
    // Fill form on mobile
    await page.fill('input[name="first_name"]', 'Mobile');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'mobile@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Select plan and payment
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit form
    await page.click('button:has-text("Complete Sale")');
    
    // Wait for success message
    await expect(page.locator('text=Member created successfully')).toBeVisible();
  });
});
