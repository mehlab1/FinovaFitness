import { test as setup, expect } from '@playwright/test';

// This file sets up authentication state for all tests
setup('authenticate as front desk user', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:5173');
  
  // Wait for the website to load
  await page.waitForSelector('text=Sign In');
  
  // Click on the Portals dropdown
  await page.click('text=Portals');
  
  // Click on Front Desk Portal
  await page.click('text=Front Desk Portal');
  
  // Wait for login modal to appear
  await page.waitForSelector('input[type="email"]');
  
  // Login as front desk user
  await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
  await page.fill('input[type="password"]', 'frontdesk123');
  await page.click('button[type="submit"]');
  
  // Wait for successful login and navigation to front desk
  await page.waitForSelector('text=FINOVA FITNESS');
  
  // Verify we're logged in as front desk user
  await expect(page.locator('text=FINOVA FITNESS')).toBeVisible();
  
  // Store authentication state
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
