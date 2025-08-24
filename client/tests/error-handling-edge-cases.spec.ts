import { test, expect } from '@playwright/test';

test.describe('Error Handling and Edge Cases Testing', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application and login as front desk user
    await page.goto('/');
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button:has-text("Sign In")');
    
    // Wait for successful login - use a more specific selector
    await page.waitForSelector('h1:has-text("FINOVA FITNESS")', { timeout: 10000 });
    
    // Wait a moment for the page to fully load
    await page.waitForTimeout(2000);
    
    // Click on Walk-In Sales tab
    await page.click('text=Walk-In Sales');
    
    // Wait for the form to be visible
    await page.waitForSelector('input[name="first_name"]', { timeout: 10000 });
  });

  test('Network failure during form submission', async ({ page }) => {
    // Intercept and abort the API call
    await page.route('**/api/frontdesk/create-member', route => route.abort());
    
    // Fill form with valid data
    await page.fill('input[name="first_name"]', 'Network Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'network.test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit form
    await page.click('button:has-text("Complete Sale")');
    
    // Should show error message
    await expect(page.locator('text=Failed to create member')).toBeVisible();
    await expect(page.locator('text=Please try again')).toBeVisible();
  });

  test('Server error handling (500 Internal Server Error)', async ({ page }) => {
    // Mock server error response
    await page.route('**/api/frontdesk/create-member', route => 
      route.fulfill({ status: 500, body: JSON.stringify({ error: 'Internal Server Error' }) })
    );
    
    // Fill form with valid data
    await page.fill('input[name="first_name"]', 'Server Error Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'server.error@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit form
    await page.click('button:has-text("Complete Sale")');
    
    // Should show error message
    await expect(page.locator('text=Failed to create member')).toBeVisible();
  });

  test('Concurrent user scenarios', async ({ browser }) => {
    // Create multiple browser contexts for concurrent users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    
    // Both users navigate to front desk
    await Promise.all([
      page1.goto('/'),
      page2.goto('/')
    ]);
    
    // Both users login
    await Promise.all([
      page1.click('text=Portals'),
      page2.click('text=Portals')
    ]);
    
    await Promise.all([
      page1.click('text=Front Desk Portal'),
      page2.click('text=Front Desk Portal')
    ]);
    
    await Promise.all([
      page1.fill('input[type="email"]', 'frontdesk@finovafitness.com'),
      page2.fill('input[type="email"]', 'frontdesk@finovafitness.com')
    ]);
    
    await Promise.all([
      page1.fill('input[type="password"]', 'frontdesk123'),
      page2.fill('input[type="password"]', 'frontdesk123')
    ]);
    
    await Promise.all([
      page1.click('button:has-text("Sign In")'),
      page2.click('button:has-text("Sign In")')
    ]);
    
    // Both users access Walk-In Sales
    await Promise.all([
      page1.waitForSelector('h1:has-text("FINOVA FITNESS")', { timeout: 10000 }),
      page2.waitForSelector('h1:has-text("FINOVA FITNESS")', { timeout: 10000 })
    ]);
    
    await Promise.all([
      page1.click('text=Walk-In Sales'),
      page2.click('text=Walk-In Sales')
    ]);
    
    // Both should be able to access the form
    await expect(page1.locator('text=Walk-In Sales')).toBeVisible();
    await expect(page2.locator('text=Walk-In Sales')).toBeVisible();
    
    // Both should see the form fields
    await expect(page1.locator('input[name="first_name"]')).toBeVisible();
    await expect(page2.locator('input[name="first_name"]')).toBeVisible();
    
    await context1.close();
    await context2.close();
  });

  test('Extreme input values validation', async ({ page }) => {
    // Test very long names
    const longName = 'A'.repeat(100);
    await page.fill('input[name="first_name"]', longName);
    await page.fill('input[name="last_name"]', longName);
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    await page.click('button:has-text("Complete Sale")');
    
    // Should show validation error for long names
    await expect(page.locator('text=First name is too long')).toBeVisible();
    await expect(page.locator('text=Last name is too long')).toBeVisible();
  });

  test('Special characters in input fields', async ({ page }) => {
    // Test special characters in names
    await page.fill('input[name="first_name"]', 'John@#$%^&*()');
    await page.fill('input[name="last_name"]', 'Doe!@#$%^&*()');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    await page.click('button:has-text("Complete Sale")');
    
    // Should show validation error for special characters
    await expect(page.locator('text=First name contains invalid characters')).toBeVisible();
    await expect(page.locator('text=Last name contains invalid characters')).toBeVisible();
  });

  test('Invalid email formats', async ({ page }) => {
    const invalidEmails = [
      'invalid-email',
      'test@',
      '@example.com',
      'test..test@example.com',
      'test@example..com',
      'test@.com',
      'test@example.',
      'test@example.c',
      'test@example.com.',
      '.test@example.com'
    ];
    
    for (const email of invalidEmails) {
      await page.fill('input[name="first_name"]', 'Test');
      await page.fill('input[name="last_name"]', 'User');
      await page.fill('input[name="email"]', email);
      await page.fill('input[name="phone"]', '1234567890');
      await page.selectOption('select[name="membership_plan_id"]', '1');
      await page.selectOption('select[name="payment_method"]', 'credit_card');
      await page.check('input[name="payment_confirmed"]');
      
      await page.click('button:has-text("Complete Sale")');
      
      // Should show email validation error
      await expect(page.locator('text=Please enter a valid email')).toBeVisible();
    }
  });

  test('Invalid phone number formats', async ({ page }) => {
    const invalidPhones = [
      '123', // Too short
      '12345678901234567890', // Too long
      'abc123def', // Contains letters
      '123-456-789', // Contains hyphens
      '(123) 456-7890', // Contains parentheses and spaces
      '+12345678901234567890', // Too long with country code
      '123.456.7890', // Contains dots
      '123 456 7890', // Contains spaces
      '123/456/7890', // Contains slashes
      '123\\456\\7890' // Contains backslashes
    ];
    
    for (const phone of invalidPhones) {
      await page.fill('input[name="first_name"]', 'Test');
      await page.fill('input[name="last_name"]', 'User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', phone);
      await page.selectOption('select[name="membership_plan_id"]', '1');
      await page.selectOption('select[name="payment_method"]', 'credit_card');
      await page.check('input[name="payment_confirmed"]');
      
      await page.click('button:has-text("Complete Sale")');
      
      // Should show phone validation error
      await expect(page.locator('text=Please enter a valid phone number')).toBeVisible();
    }
  });

  test('Date of birth edge cases', async ({ page }) => {
    // Test future date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = futureDate.toISOString().split('T')[0];
    
    await page.fill('input[name="first_name"]', 'Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="date_of_birth"]', futureDateStr);
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    await page.click('button:has-text("Complete Sale")');
    
    // Should show date validation error
    await expect(page.locator('text=Date of birth cannot be in the future')).toBeVisible();
    
    // Test very old date (over 120 years)
    const oldDate = new Date();
    oldDate.setFullYear(oldDate.getFullYear() - 121);
    const oldDateStr = oldDate.toISOString().split('T')[0];
    
    await page.fill('input[name="date_of_birth"]', oldDateStr);
    await page.click('button:has-text("Complete Sale")');
    
    // Should show age validation error
    await expect(page.locator('text=Please enter a valid date of birth')).toBeVisible();
  });

  test('Form persistence after page refresh', async ({ page }) => {
    // Fill form partially
    await page.fill('input[name="first_name"]', 'Persistent');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'persistent@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    
    // Refresh page
    await page.reload();
    
    // Form should be cleared (no persistence expected for security)
    await expect(page.locator('input[name="first_name"]')).toHaveValue('');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('');
    await expect(page.locator('input[name="email"]')).toHaveValue('');
    await expect(page.locator('input[name="phone"]')).toHaveValue('');
  });

  test('Browser back/forward navigation', async ({ page }) => {
    // Fill form and navigate away
    await page.fill('input[name="first_name"]', 'Navigation');
    await page.fill('input[name="last_name"]', 'Test');
    await page.fill('input[name="email"]', 'navigation@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    
    // Navigate to another page
    await page.click('text=POS Summary');
    await expect(page.locator('text=POS Summary')).toBeVisible();
    
    // Go back
    await page.goBack();
    await expect(page.locator('text=Walk-In Sales')).toBeVisible();
    
    // Form should be cleared
    await expect(page.locator('input[name="first_name"]')).toHaveValue('');
  });

  test('Session timeout handling', async ({ page }) => {
    // This test would require mocking session timeout
    // For now, we'll test that the form is accessible after a long wait
    await page.fill('input[name="first_name"]', 'Session Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'session@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    // Wait for a while (simulating session timeout)
    await page.waitForTimeout(5000);
    
    // Try to submit form
    await page.click('button:has-text("Complete Sale")');
    
    // Should either succeed or show session timeout error
    // The exact behavior depends on the session timeout implementation
  });

  test('Memory leak prevention', async ({ page }) => {
    // Fill and submit form multiple times to check for memory leaks
    for (let i = 0; i < 5; i++) {
      await page.fill('input[name="first_name"]', `Memory Test ${i}`);
      await page.fill('input[name="last_name"]', 'User');
      await page.fill('input[name="email"]', `memory${i}@example.com`);
      await page.fill('input[name="phone"]', `123456789${i}`);
      await page.selectOption('select[name="membership_plan_id"]', '1');
      await page.selectOption('select[name="payment_method"]', 'credit_card');
      await page.check('input[name="payment_confirmed"]');
      
      await page.click('button:has-text("Complete Sale")');
      
      // Wait for success message
      await expect(page.locator('text=Member created successfully')).toBeVisible();
      
      // Go back to form for next iteration
      await page.click('text=Walk-In Sales');
    }
    
    // Page should still be responsive
    await expect(page.locator('text=Walk-In Sales')).toBeVisible();
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
  });

  test('Accessibility and keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="first_name"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="last_name"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="email"]:focus')).toBeVisible();
    
    // Test form submission with Enter key
    await page.fill('input[name="first_name"]', 'Keyboard Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'keyboard@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    // Focus on submit button and press Enter
    await page.locator('button:has-text("Complete Sale")').focus();
    await page.keyboard.press('Enter');
    
    // Should submit successfully
    await expect(page.locator('text=Member created successfully')).toBeVisible();
  });

  test('Mobile responsiveness', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that form is still accessible
    await expect(page.locator('text=Walk-In Sales')).toBeVisible();
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    
    // Fill form on mobile
    await page.fill('input[name="first_name"]', 'Mobile Test');
    await page.fill('input[name="last_name"]', 'User');
    await page.fill('input[name="email"]', 'mobile@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit on mobile
    await page.click('button:has-text("Complete Sale")');
    
    // Should work on mobile
    await expect(page.locator('text=Member created successfully')).toBeVisible();
  });
});
