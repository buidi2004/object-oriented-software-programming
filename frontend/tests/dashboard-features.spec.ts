import { test, expect } from '@playwright/test';

test.describe('Dashboard Features - Export Orders & Sessions', () => {

  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3002',
          localStorage: [{ name: 'accessToken', value: 'fake-jwt-token' }]
        }
      ]
    }
  });

  test.beforeEach(async ({ page }) => {
    // Mock user profile API called by dashboard layout
    await page.route('**/api/users/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'user-1', fullName: 'Test User', email: 'test@example.com' })
      });
    });
  });

  test('1. Orders page should have Export CSV button and trigger download', async ({ page }) => {
    // Mock orders API
    await page.route('**/api/orders/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '123456789', servicePlanName: 'Cloud VPS Pro', status: 'Paid', totalAmount: 500000, createdAt: new Date().toISOString() }
        ])
      });
    });

    // Mock exports API
    await page.route('**/api/exports/orders?format=csv', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'text/csv',
        headers: { 'Content-Disposition': 'attachment; filename="orders.csv"' },
        body: 'id,servicePlanName,status,totalAmount\n123456789,Cloud VPS Pro,Paid,500000'
      });
    });

    await page.goto('/dashboard/orders');
    
    // Check if Export button exists
    const exportBtn = page.getByTestId('export-csv-btn');
    await expect(exportBtn).toBeVisible();

    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    await exportBtn.click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('orders.csv');
  });

  test('2. Security page should display active sessions and allow revocation', async ({ page }) => {
    // Mock sessions API
    await page.route('**/api/security/sessions', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: 'session-1', deviceInfo: 'Chrome on Windows 11', expiresAt: '2030-01-01T00:00:00Z', isRevoked: false },
            { id: 'session-2', deviceInfo: 'Safari on iPhone', expiresAt: '2030-01-01T00:00:00Z', isRevoked: true }
          ])
        });
      }
    });

    // Mock delete session API
    await page.route('**/api/security/sessions/*', async (route) => {
      if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 204 });
      }
    });

    await page.goto('/dashboard/security');

    // Verify session section
    await expect(page.getByText('Phiên Đăng Nhập')).toBeVisible();
    await expect(page.getByText('Chrome on Windows 11')).toBeVisible();
    await expect(page.getByText('Safari on iPhone')).toBeVisible();
    
    // Safari is revoked, should show 'Đã đăng xuất'
    await expect(page.getByText('Đã đăng xuất')).toBeVisible();

    // Chrome should have a logout button
    const logoutBtn = page.getByTitle('Đăng xuất thiết bị này');
    await expect(logoutBtn).toBeVisible();

    // Click logout
    await logoutBtn.click();
    
    // In our UI, revoking updates the state to isRevoked = true, so the button should disappear
    await expect(logoutBtn).toBeHidden();
  });
});
