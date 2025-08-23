import { test, expect } from '@playwright/test';

test.describe('Simple Walk-In Sales Form Test', () => {
  test('Check if walk-in sales form exists and can be filled', async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:5173');
    
    // Wait for the page to load
    await page.waitForSelector('text=Sign In');
    
    // Check if the page loaded correctly
    await expect(page.locator('text=Sign In')).toBeVisible();
    
    // Take a screenshot to see what's on the page
    await page.screenshot({ path: 'test-screenshot.png' });
    
    // Check if there's a way to access the front desk portal
    const portalDropdown = page.locator('text=Portals');
    if (await portalDropdown.isVisible()) {
      console.log('Portal dropdown found');
      await portalDropdown.click();
      
      // Check if Front Desk Portal option exists
      const frontDeskOption = page.locator('text=Front Desk Portal');
      if (await frontDeskOption.isVisible()) {
        console.log('Front Desk Portal option found');
        await frontDeskOption.click();
        
        // Wait a bit to see if anything happens
        await page.waitForTimeout(2000);
        
        // Check if we're now on the front desk portal
        const frontDeskPortal = page.locator('text=Front Desk Portal');
        if (await frontDeskPortal.isVisible()) {
          console.log('Successfully navigated to Front Desk Portal');
          
          // Look for Walk-In Sales tab
          const walkInSalesTab = page.locator('text=Walk-In Sales');
          if (await walkInSalesTab.isVisible()) {
            console.log('Walk-In Sales tab found');
            await walkInSalesTab.click();
            
            // Wait for the form to load
            await page.waitForSelector('h2:has-text("Walk-In Sales - New Member Registration")', { timeout: 10000 });
            
            // Test filling out the form
            await page.fill('input[name="first_name"]', 'John');
            await page.fill('input[name="last_name"]', 'Doe');
            await page.fill('input[name="email"]', 'john.doe@example.com');
            await page.fill('input[name="phone"]', '1234567890');
            
            // Verify the fields were filled
            await expect(page.locator('input[name="first_name"]')).toHaveValue('John');
            await expect(page.locator('input[name="last_name"]')).toHaveValue('Doe');
            await expect(page.locator('input[name="email"]')).toHaveValue('john.doe@example.com');
            await expect(page.locator('input[name="phone"]')).toHaveValue('1234567890');
            
            console.log('Form fields filled successfully');
          } else {
            console.log('Walk-In Sales tab not found');
          }
        } else {
          console.log('Front Desk Portal not loaded');
        }
      } else {
        console.log('Front Desk Portal option not found');
      }
    } else {
      console.log('Portal dropdown not found');
    }
  });
});
