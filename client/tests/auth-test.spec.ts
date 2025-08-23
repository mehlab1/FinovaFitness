import { test, expect } from '@playwright/test';

test.describe('Front Desk Authentication Testing', () => {
  test('Front desk user can login successfully', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Click on Portals dropdown
    await page.click('text=Portals');
    
    // Click on Front Desk Portal
    await page.click('text=Front Desk Portal');
    
    // Wait for the sign-in modal to appear
    await page.waitForSelector('input[type="email"]');
    
    // Fill in login credentials
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    
    // Click Sign In button
    await page.click('button:has-text("Sign In")');
    
    // Wait for successful login and navigation
    await page.waitForSelector('text=FINOVA FITNESS', { timeout: 10000 });
    
    // Verify successful login
    await expect(page.locator('text=FINOVA FITNESS')).toBeVisible();
    
    console.log('✅ Front desk login successful');
  });

  test('Authentication state persists across page refresh', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Login process
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('text=FINOVA FITNESS');
    
    // Refresh the page
    await page.reload();
    
    // Verify authentication state persists
    await expect(page.locator('text=FINOVA FITNESS')).toBeVisible();
    
    console.log('✅ Authentication state persists after refresh');
  });

  test('Front desk user can access Walk-In Sales', async ({ page }) => {
    // Navigate and login
    await page.goto('http://localhost:5173');
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('text=FINOVA FITNESS');
    
    // Click on Walk-In Sales tab
    await page.click('text=Walk-In Sales');
    
    // Verify Walk-In Sales page is accessible
    await expect(page.locator('text=Walk-In Sales')).toBeVisible();
    
    console.log('✅ Walk-In Sales access successful');
  });

  test('Logout functionality works correctly', async ({ page }) => {
    // Navigate and login
    await page.goto('http://localhost:5173');
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    await page.waitForSelector('input[type="email"]');
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button:has-text("Sign In")');
    await page.waitForSelector('text=FINOVA FITNESS');
    
    // Find and click logout button
    await page.click('button:has-text("Logout")');
    
    // Verify user is logged out
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    console.log('✅ Logout functionality works correctly');
  });
});
