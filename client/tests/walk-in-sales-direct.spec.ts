import { test, expect } from '@playwright/test';

test.describe('Walk-In Sales Direct Tests', () => {
  test('Test walk-in sales form validation', async ({ page }) => {
    // Navigate directly to the front desk portal
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForSelector('text=Sign In');
    
    // Try to access front desk directly by setting localStorage
    await page.evaluate(() => {
      localStorage.setItem('currentPortal', 'front_desk');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        first_name: 'Front Desk',
        last_name: 'User',
        email: 'frontdesk@finovafitness.com',
        role: 'front_desk',
        is_active: true
      }));
      localStorage.setItem('token', 'test-token');
    });
    
    // Reload the page to apply the localStorage changes
    await page.reload();
    
    // Wait for front desk portal to load
    await page.waitForSelector('text=Front Desk Portal', { timeout: 10000 });
    
    // Click on Walk-In Sales tab
    await page.click('text=Walk-In Sales');
    
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Test form validation by trying to submit without filling required fields
    await page.click('button:has-text("Complete Sale")');
    
    // Check for validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Phone number is required')).toBeVisible();
  });

  test('Test membership plans loading', async ({ page }) => {
    // Navigate directly to the front desk portal
    await page.goto('http://localhost:5173');
    
    // Set up authentication state
    await page.evaluate(() => {
      localStorage.setItem('currentPortal', 'front_desk');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        first_name: 'Front Desk',
        last_name: 'User',
        email: 'frontdesk@finovafitness.com',
        role: 'front_desk',
        is_active: true
      }));
      localStorage.setItem('token', 'test-token');
    });
    
    // Reload the page
    await page.reload();
    
    // Wait for front desk portal to load
    await page.waitForSelector('text=Front Desk Portal', { timeout: 10000 });
    
    // Click on Walk-In Sales tab
    await page.click('text=Walk-In Sales');
    
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Wait for membership plans to load
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])', { timeout: 10000 });
    
    // Check that plans are populated
    const planOptions = await page.locator('select[name="membership_plan_id"] option').count();
    expect(planOptions).toBeGreaterThan(1);
  });

  test('Test form field interactions', async ({ page }) => {
    // Navigate directly to the front desk portal
    await page.goto('http://localhost:5173');
    
    // Set up authentication state
    await page.evaluate(() => {
      localStorage.setItem('currentPortal', 'front_desk');
      localStorage.setItem('user', JSON.stringify({
        id: 1,
        first_name: 'Front Desk',
        last_name: 'User',
        email: 'frontdesk@finovafitness.com',
        role: 'front_desk',
        is_active: true
      }));
      localStorage.setItem('token', 'test-token');
    });
    
    // Reload the page
    await page.reload();
    
    // Wait for front desk portal to load
    await page.waitForSelector('text=Front Desk Portal', { timeout: 10000 });
    
    // Click on Walk-In Sales tab
    await page.click('text=Walk-In Sales');
    
    // Wait for the form to load
    await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")');
    
    // Test filling form fields
    await page.fill('input[name="first_name"]', 'John');
    await page.fill('input[name="last_name"]', 'Doe');
    await page.fill('input[name="email"]', 'john.doe@example.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Verify fields are filled
    await expect(page.locator('input[name="first_name"]')).toHaveValue('John');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('Doe');
    await expect(page.locator('input[name="email"]')).toHaveValue('john.doe@example.com');
    await expect(page.locator('input[name="phone"]')).toHaveValue('1234567890');
  });
});
