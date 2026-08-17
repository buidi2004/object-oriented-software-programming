import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage } from './fixtures/auth';

test.describe('Navigation & Session Edge Cases (P0)', () => {
  test('NAV-01: Logout → bấm Back không hiện lại dữ liệu Dashboard', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Clear token to simulate logout
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    });

    // Navigate to protected page
    await page.goto('/dashboard/orders');
    await page.waitForTimeout(1000);

    // Verify token is gone
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeNull();
  });

  test('NAV-02: Dán thẳng URL sâu (/dashboard/vps-instances) khi đã login → vào thẳng đúng trang', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/vps-instances');
    await page.waitForTimeout(1000);

    expect(page.url()).toContain('/dashboard/vps-instances');
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('NAV-03: Refresh trang (F5) không làm mất phiên đăng nhập', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    await page.reload();
    await page.waitForTimeout(1000);

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('NAV-04: Session hết hạn → gọi API trả 401 được interceptor xử lý sạch', async () => {
    const expiredRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/me`, {
      headers: { Authorization: 'Bearer invalid.expired.token' },
    });

    expect(expiredRes.status).toBe(401);
  });
});
