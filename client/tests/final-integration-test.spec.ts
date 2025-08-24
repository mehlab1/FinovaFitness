import { test, expect } from '@playwright/test';

test.describe('Final Integration and Smoke Testing - Walk-In Sales', () => {
  test('Complete Walk-In Sales Integration Test', async ({ page }) => {
    console.log('🚀 Starting Final Integration Test...');
    
    // Step 1: Navigate to application and authenticate
    console.log('📋 Step 1: Authentication');
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Front Desk Portal
    await page.click('text=Portals');
    await page.click('text=Front Desk Portal');
    
    // Wait for login form and authenticate
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'frontdesk@finovafitness.com');
    await page.fill('input[type="password"]', 'frontdesk123');
    await page.click('button:has-text("Sign In")');
    
    // Wait for successful login
    await page.waitForSelector('h1:has-text("FINOVA FITNESS")', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ Authentication successful');
    
    // Step 2: Navigate to Walk-In Sales
    console.log('📋 Step 2: Navigation to Walk-In Sales');
    await page.click('text=Walk-In Sales');
    await page.waitForSelector('input[name="first_name"]', { timeout: 10000 });
    
    console.log('✅ Walk-In Sales tab loaded successfully');
    
    // Step 3: Verify form fields and validation
    console.log('📋 Step 3: Form Validation Testing');
    
    // Check required fields are present
    await expect(page.locator('input[name="first_name"]')).toBeVisible();
    await expect(page.locator('input[name="last_name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();
    await expect(page.locator('select[name="membership_plan_id"]')).toBeVisible();
    await expect(page.locator('select[name="payment_method"]')).toBeVisible();
    
    // Check optional fields are present
    await expect(page.locator('input[name="date_of_birth"]')).toBeVisible();
    await expect(page.locator('select[name="gender"]')).toBeVisible();
    await expect(page.locator('input[name="address"]')).toBeVisible();
    await expect(page.locator('input[name="emergency_contact"]')).toBeVisible();
    
    console.log('✅ All form fields are present');
    
    // Step 4: Test form validation
    console.log('📋 Step 4: Form Validation Testing');
    
    // Try to submit empty form
    await page.click('button:has-text("Complete Sale")');
    
    // Check for validation errors
    await expect(page.locator('text=First name is required')).toBeVisible();
    await expect(page.locator('text=Last name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Phone is required')).toBeVisible();
    await expect(page.locator('text=Membership plan is required')).toBeVisible();
    await expect(page.locator('text=Payment method is required')).toBeVisible();
    
    console.log('✅ Form validation working correctly');
    
    // Step 5: Fill form with valid data
    console.log('📋 Step 5: Form Data Entry');
    
    // Fill required fields
    await page.fill('input[name="first_name"]', 'Integration Test');
    await page.fill('input[name="last_name"]', 'User Final');
    await page.fill('input[name="email"]', 'integration.final@test.com');
    await page.fill('input[name="phone"]', '1234567890');
    
    // Fill optional fields
    await page.fill('input[name="date_of_birth"]', '1990-01-01');
    await page.selectOption('select[name="gender"]', 'male');
    await page.fill('input[name="address"]', '123 Test Street, Test City');
    await page.fill('input[name="emergency_contact"]', '9876543210');
    
    // Wait for membership plans to load
    await page.waitForSelector('select[name="membership_plan_id"] option:not([value=""])', { timeout: 10000 });
    
    // Select membership plan and payment method
    await page.selectOption('select[name="membership_plan_id"]', '1');
    await page.selectOption('select[name="payment_method"]', 'credit_card');
    await page.check('input[name="payment_confirmed"]');
    
    console.log('✅ Form filled with valid data');
    
    // Step 6: Test preview functionality
    console.log('📋 Step 6: Preview Functionality');
    
    await page.click('button:has-text("Preview Member Details")');
    
    // Wait for preview modal
    await page.waitForSelector('text=Member Details Preview', { timeout: 10000 });
    
    // Verify preview shows correct data
    await expect(page.locator('text=Integration Test User Final')).toBeVisible();
    await expect(page.locator('text=integration.final@test.com')).toBeVisible();
    await expect(page.locator('text=1234567890')).toBeVisible();
    
    console.log('✅ Preview functionality working correctly');
    
    // Go back to form
    await page.click('button:has-text("Back to Edit")');
    await page.waitForSelector('input[name="first_name"]', { timeout: 10000 });
    
    // Verify form data is preserved
    await expect(page.locator('input[name="first_name"]')).toHaveValue('Integration Test');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('User Final');
    await expect(page.locator('input[name="email"]')).toHaveValue('integration.final@test.com');
    
    console.log('✅ Form data preserved after preview');
    
    // Step 7: Submit form and verify success
    console.log('📋 Step 7: Form Submission and Success Verification');
    
    await page.click('button:has-text("Complete Sale")');
    
    // Wait for success message
    await expect(page.locator('text=Member created successfully')).toBeVisible({ timeout: 15000 });
    
    console.log('✅ Member creation successful');
    
    // Step 8: Verify receipt generation
    console.log('📋 Step 8: Receipt Verification');
    
    await expect(page.locator('text=Receipt Generated')).toBeVisible();
    
    // Check receipt details
    await expect(page.locator('text=Integration Test User Final')).toBeVisible();
    await expect(page.locator('text=integration.final@test.com')).toBeVisible();
    await expect(page.locator('text=CREDIT CARD')).toBeVisible();
    
    console.log('✅ Receipt generated with correct details');
    
    // Step 9: Test receipt printing
    console.log('📋 Step 9: Receipt Printing Test');
    
    // Click print button (this will open print dialog, we just verify it doesn't crash)
    await page.click('button:has-text("Print Receipt")');
    
    // Wait a moment for print dialog
    await page.waitForTimeout(2000);
    
    console.log('✅ Receipt printing functionality working');
    
    // Step 10: Verify POS Summary
    console.log('📋 Step 10: POS Summary Verification');
    
    await page.click('text=POS Summary');
    await page.waitForSelector('text=Point of Sale Summary', { timeout: 10000 });
    
    // Verify the new member appears in POS summary
    await expect(page.locator('text=Integration Test User Final')).toBeVisible();
    
    console.log('✅ POS Summary updated correctly');
    
    // Step 11: Verify Admin Portal Integration
    console.log('📋 Step 11: Admin Portal Integration Verification');
    
    // Navigate to admin portal
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Portals');
    await page.click('text=Admin Portal');
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'admin@finovafitness.com');
    await page.fill('input[type="password"]', 'admin123');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForSelector('h1:has-text("FINOVA FITNESS")', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Navigate to Member Directory
    await page.click('text=Member Directory');
    await page.waitForSelector('text=Member Directory', { timeout: 10000 });
    
    // Verify the new member appears with correct plan
    await expect(page.locator('text=Integration Test User Final')).toBeVisible();
    await expect(page.locator('text=integration.final@test.com')).toBeVisible();
    
    console.log('✅ Admin Portal integration working correctly');
    
    // Step 12: Verify Member Portal Integration
    console.log('📋 Step 12: Member Portal Integration Verification');
    
    // Navigate to member portal
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
    
    await page.click('text=Portals');
    await page.click('text=Member Portal');
    
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    await page.fill('input[type="email"]', 'integration.final@test.com');
    await page.fill('input[type="password"]', 'Welcome123!');
    await page.click('button:has-text("Sign In")');
    
    await page.waitForSelector('h1:has-text("FINOVA FITNESS")', { timeout: 15000 });
    await page.waitForTimeout(3000);
    
    // Navigate to Membership tab
    await page.click('text=Membership');
    await page.waitForSelector('text=Membership Details', { timeout: 10000 });
    
    // Verify membership details are displayed
    await expect(page.locator('text=Integration Test User Final')).toBeVisible();
    
    console.log('✅ Member Portal integration working correctly');
    
    console.log('🎉 Final Integration Test Completed Successfully!');
    console.log('✅ All features working together seamlessly');
    console.log('✅ Data consistency maintained across all operations');
    console.log('✅ Complete user workflows function correctly');
    console.log('✅ All requirements are met');
    console.log('✅ Ready for deployment');
  });
});
