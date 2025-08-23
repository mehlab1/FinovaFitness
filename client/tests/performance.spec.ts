import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('Form submission performance under normal load', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate to front desk
    await page.goto('/');
    await page.waitForSelector('text=Sign In');
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    await page.waitForSelector('input[type="email"]');
    
    // Login
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=FINOVA FITNESS');
    
    // Navigate to walk-in sales
    await page.click('text=Walk-In Sales');
    
    // Fill form quickly
    await page.fill('input[name="first_name"]', 'Performance');
    await page.fill('input[name="last_name"]', 'Test');
    await page.fill('input[name="email"]', 'performance.test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit form
    await page.click('button:has-text("Create Member")');
    
    // Wait for success or error
    await Promise.race([
      page.waitForSelector('text=Member created successfully', { timeout: 10000 }),
      page.waitForSelector('.error-message', { timeout: 10000 })
    ]);
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within 15 seconds
    expect(totalTime).toBeLessThan(15000);
    console.log(`Form submission completed in ${totalTime}ms`);
  });

  test('API response time for membership plans', async ({ request }) => {
    const startTime = Date.now();
    
    const response = await request.get('http://localhost:3001/api/frontdesk/membership-plans', {
      headers: {
        'Authorization': 'Bearer test-token'
      }
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // API should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000);
    expect(response.status()).toBe(200);
    
    console.log(`API response time: ${responseTime}ms`);
  });

  test('Concurrent form submissions', async ({ browser }) => {
    const startTime = Date.now();
    
    // Create multiple concurrent sessions
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(contexts.map(ctx => ctx.newPage()));
    
    // Navigate all pages to front desk
    await Promise.all(pages.map(async (page, index) => {
      await page.goto('/');
      await page.waitForSelector('text=Sign In');
      await page.click('text=Portals');
      await page.click('text=Front Desk Portal');
      await page.waitForSelector('input[type="email"]');
      
      // Login
      await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
      await page.fill('input[type="password"]', 'frontdesk123');
      await page.click('button[type="submit"]');
      await page.waitForSelector('text=FINOVA FITNESS');
      
      // Navigate to walk-in sales
      await page.click('text=Walk-In Sales');
      
      // Fill form with unique data
      await page.fill('input[name="first_name"]', `Concurrent${index}`);
      await page.fill('input[name="last_name"]', `User${index}`);
      await page.fill('input[name="email"]', `concurrent${index}@example.com`);
      await page.fill('input[name="phone"]', `123456789${index}`);
      await page.selectOption('select[name="membership_plan_id"]', '1');
      await page.selectOption('select[name="payment_method"]', 'card');
      await page.check('input[name="payment_confirmed"]');
    }));
    
    // Submit all forms concurrently
    await Promise.all(pages.map(page => page.click('button:has-text("Create Member")')));
    
    // Wait for all submissions to complete
    await Promise.all(pages.map(page => 
      Promise.race([
        page.waitForSelector('text=Member created successfully', { timeout: 15000 }),
        page.waitForSelector('.error-message', { timeout: 15000 })
      ])
    ));
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    // Should complete within 20 seconds for 3 concurrent users
    expect(totalTime).toBeLessThan(20000);
    console.log(`Concurrent submissions completed in ${totalTime}ms`);
    
    // Clean up
    await Promise.all(contexts.map(ctx => ctx.close()));
  });

  test('Memory usage during form interactions', async ({ page }) => {
    // Navigate to front desk
    await page.goto('/');
    await page.waitForSelector('text=Sign In');
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    await page.waitForSelector('input[type="email"]');
    
    // Login
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=FINOVA FITNESS');
    
    // Navigate to walk-in sales
    await page.click('text=Walk-In Sales');
    
    // Perform multiple form interactions
    for (let i = 0; i < 10; i++) {
      await page.fill('input[name="first_name"]', `Memory${i}`);
      await page.fill('input[name="last_name"]', `Test${i}`);
      await page.fill('input[name="email"]', `memory${i}@example.com`);
      await page.fill('input[name="phone"]', `123456789${i}`);
      await page.selectOption('select[name="membership_plan_id"]', '1');
      await page.selectOption('select[name="payment_method"]', 'card');
      await page.check('input[name="payment_confirmed"]');
      
      // Clear form
      await page.click('button:has-text("Clear Form")');
    }
    
    // Check that the page is still responsive
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('button:has-text("Create Member")')).toBeVisible();
  });

  test('Large dataset handling', async ({ page }) => {
    // Navigate to front desk
    await page.goto('/');
    await page.waitForSelector('text=Sign In');
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    await page.waitForSelector('input[type="email"]');
    
    // Login
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=FINOVA FITNESS');
    
    // Navigate to walk-in sales
    await page.click('text=Walk-In Sales');
    
    // Test with large text inputs
    const largeText = 'A'.repeat(1000);
    await page.fill('input[name="first_name"]', largeText);
    await page.fill('input[name="last_name"]', largeText);
    await page.fill('input[name="email"]', 'large@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.fill('input[name="address"]', largeText);
    await page.fill('input[name="emergency_contact"]', largeText);
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Submit form
    await page.click('button:has-text("Create Member")');
    
    // Should handle large data gracefully
    await Promise.race([
      page.waitForSelector('text=Member created successfully', { timeout: 10000 }),
      page.waitForSelector('.error-message', { timeout: 10000 })
    ]);
    
    // Check that the page is still responsive
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
  });

  test('Network resilience', async ({ page }) => {
    // Navigate to front desk
    await page.goto('/');
    await page.waitForSelector('text=Sign In');
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    await page.waitForSelector('input[type="email"]');
    
    // Login
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('text=FINOVA FITNESS');
    
    // Navigate to walk-in sales
    await page.click('text=Walk-In Sales');
    
    // Fill form
    await page.fill('input[name="first_name"]', 'Network');
    await page.fill('input[name="last_name"]', 'Test');
    await page.fill('input[name="email"]', 'network.test@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'card');
    await page.check('input[name="payment_confirmed"]');
    
    // Simulate slow network
    await page.route('**/api/frontdesk/create-member', route => {
      // Add artificial delay
      setTimeout(() => route.continue(), 2000);
    });
    
    // Submit form
    await page.click('button:has-text("Create Member")');
    
    // Should show loading state
    await expect(page.locator('.loading-spinner')).toBeVisible();
    
    // Wait for completion
    await Promise.race([
      page.waitForSelector('text=Member created successfully', { timeout: 15000 }),
      page.waitForSelector('.error-message', { timeout: 15000 })
    ]);
    
    // Should not show loading state anymore
    await expect(page.locator('.loading-spinner')).not.toBeVisible();
  });
});
