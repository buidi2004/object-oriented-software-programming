import { test, expect } from '@playwright/test';

test.describe('Admin Databases Module', () => {
  test('Admin có thể truy cập trang quản lý databases và thấy danh sách', async ({ page }) => {
    // 1. Mock the auth and login as Admin
    await page.goto('/login');
    
    // We should log in using the E2E test account or mock it.
    // For now, let's login with the real admin account or mock the API response.
    // Assuming there's a seeded admin account admin@cloudservicestore.com : Password123!
    await page.fill('input[type="email"]', 'admin@cloudservicestore.com');
    await page.fill('input[type="password"]', 'Password123!');
    
    // Focus on the button inside the form which is likely inside the modal
    await page.click('form button[type="submit"]');

    // Wait for successful login
    await page.waitForURL('/dashboard');
    
    // 2. Navigate to Admin Databases page
    await page.goto('/admin/databases');
    
    // 3. Verify the page is rendered correctly
    await expect(page.locator('h1')).toHaveText('Quản lý Databases');
    
    // Wait for the table to load
    await expect(page.locator('table')).toBeVisible();
    
    // Verify that the table headers exist
    const headers = await page.locator('th').allTextContents();
    expect(headers).toContain('Database Info');
    expect(headers).toContain('Customer');
    expect(headers).toContain('Engine & Version');
    expect(headers).toContain('Status');
  });
});
