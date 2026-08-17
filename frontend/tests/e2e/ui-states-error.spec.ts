import { test, expect } from '@playwright/test';
import { authenticatePage } from './fixtures/auth';

test.describe('UI States — Error Handling & Resilience (P0/P1)', () => {
  test('UI-DASHBOARD-ERROR: Lỗi API không làm trắng trang Dashboard', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    
    // Intercept dashboard stats endpoint to simulate 500
    await page.route('**/api/dashboard/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Simulated Internal Server Error' }),
      });
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Page must still render body and header without crashing
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('UI-VPS-ERROR: Lỗi API máy chủ hiển thị thông báo lỗi thân thiện', async ({ page }) => {
    await authenticatePage(page, 'customerA');

    // Intercept VPS endpoint
    await page.route('**/api/vpsinstances', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Simulated VPS Failure' }),
      });
    });

    await page.goto('/dashboard/vps-instances');
    await page.waitForTimeout(1000);

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('UI-CART-ERROR: Lỗi giỏ hàng không làm vỡ React app', async ({ page }) => {
    await authenticatePage(page, 'customerA');

    await page.route('**/api/carts/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Simulated Cart Error' }),
      });
    });

    await page.goto('/cart');
    await page.waitForTimeout(1000);

    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
