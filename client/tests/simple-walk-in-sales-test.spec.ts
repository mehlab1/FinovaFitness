import { test, expect } from '@playwright/test';

test.describe('Simple Walk-In Sales Test', () => {
  test('Basic walk-in sales form functionality', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click on Portals dropdown
    await page.click('text=Portals');
    
    // Click on Front Desk Portal
    await page.click('text=Front Desk Portal');
    
    // Wait for login form to appear
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    // Login
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button:has-text("Sign In")');
    
    // Wait for successful login
    await page.waitForSelector('h1:has-text("FINOVA FITNESS")', { timeout: 15000 });
    
    // Wait a moment for the page to fully load
    await page.waitForTimeout(3000);
    
    // Click on Walk-In Sales tab
    await page.click('text=Walk-In Sales');
    
    // Wait for the form to be visible
    await page.waitForSelector('input[name="first_name"]', { timeout: 10000 });
    
    // Verify form fields are present
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('select[name="membership_plan_id"]')).toBeVisible();
    await expect(page.locator('select[name="payment_method"]')).toBeVisible();
    
    // Fill out the form with valid data
    await page.fill('input[name="first_name"]', 'Test User');
    await page.fill('input[name="last_name"]', 'Simple Test');
    await page.fill('input[name="email"]', 'test.simple@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Wait for membership plans to load
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])', { timeout: 10000 });
    
    // Select a membership plan
    await page.selectOption('select[name="membership_plan_id"]', '1');
    
    // Select payment method
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    
    // Check payment confirmation
    await page.check('input[name="payment_confirmed"]');
    
    // Submit the form
    await page.click('button:has-text("Complete Sale")');
    
    // Wait for success message
    await expect(page.locator('text=Member created successfully')).toBeVisible({ timeout: 15000 });
    
    // Verify receipt is generated
    await expect(page.locator('text=Receipt Generated')).toBeVisible();
    
    console.log('✅ Basic walk-in sales test completed successfully!');
  });
});
