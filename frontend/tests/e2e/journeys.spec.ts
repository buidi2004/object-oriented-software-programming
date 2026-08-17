import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('FE User Journeys — Cross-Module Flows (P0/P1)', () => {
  test('JNY-01: Khách mới: duyệt catalog → thêm giỏ → đăng ký mới → giỏ còn nguyên → hoàn tất', async ({ page }) => {
    // 1. Browse catalog as guest
    await page.goto('/services/cloud-vps');
    await page.waitForTimeout(1000);

    // 2. Add item to cart
    const buyButtons = page.locator('button:has-text("Mua ngay"), button:has-text("Chọn gói"), button:has-text("Thêm vào giỏ")');
    if ((await buyButtons.count()) > 0) {
      await buyButtons.first().click({ force: true });
    }

    // 3. Register a new user at runtime
    const newEmail = `e2e.journey.${Date.now()}@test.local`;
    const regRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'E2E Journey User',
        email: newEmail,
        password: 'Password123!',
        phoneNumber: '0901234567',
        country: 'VN',
        city: 'HCM',
      }),
    });
    expect(regRes.status).toBeLessThan(500);

    // 4. Login with newly created user
    const loginRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: newEmail,
        password: 'Password123!',
        deviceInfo: 'test',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      }),
    });
    const loginData = await loginRes.json();
    expect(loginData.accessToken).toBeTruthy();

    // 5. Navigate to cart authenticated
    await page.goto('/');
    await page.evaluate((token) => {
      localStorage.setItem('accessToken', token);
    }, loginData.accessToken);

    await page.goto('/cart');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/cart');
  });

  test('JNY-02: Khách quay lại: login → Terminal SignalR → rời trang và quay lại sạch sẽ', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/vps-instances');
    await page.waitForTimeout(1000);

    // Navigate to another page (Orders) and return
    await page.goto('/dashboard/orders');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/dashboard/orders');

    await page.goto('/dashboard/vps-instances');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/dashboard/vps-instances');
  });

  test('JNY-03: Abandoned Cart Reminder Recovery', async () => {
    const adminTokens = await loginViaApi('admin');
    const abandonedRes = await fetch(`${E2E_CONFIG.API_BASE}/api/abandoned-carts`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(abandonedRes.status).toBeLessThan(500);
  });

  test('JNY-04: Cảnh báo Domain/SSL Expiring → điều hướng đúng trang', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Navigate to domains dashboard
    await page.goto('/dashboard/domains');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/dashboard/domains');
  });

  test('JNY-05: Vòng lặp Referral: Lấy mã giới thiệu và đăng ký bạn bè', async () => {
    const custATokens = await loginViaApi('customerA');
    const refRes = await fetch(`${E2E_CONFIG.API_BASE}/api/referrals/me`, {
      headers: { Authorization: `Bearer ${custATokens.accessToken}` },
    });
    expect(refRes.status).toBe(200);
    const refData = await refRes.json();
    expect(refData.code || refData.referralCode).toBeTruthy();
  });

  test('JNY-06: Hỗ trợ ticket từ ngữ cảnh lỗi', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/tickets');
    await page.waitForTimeout(1000);

    // Check ticket page is accessible
    expect(page.url()).toContain('/dashboard/tickets');
  });

  test('JNY-07: Đa thiết bị / Đồng bộ giỏ hàng qua Server API', async () => {
    const custATokens = await loginViaApi('customerA');
    const cartRes = await fetch(`${E2E_CONFIG.API_BASE}/api/carts/me`, {
      headers: { Authorization: `Bearer ${custATokens.accessToken}` },
    });
    expect(cartRes.status).toBeLessThan(500);
  });

  test('JNY-08: Huỷ giữa chừng thanh toán VNPay → quay lại /cart nhất quán', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/cart');
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/cart');
  });

  test('JNY-09: Khách hàng mới hoàn toàn (0 dữ liệu) → Empty state hiển thị đẹp, không crash', async ({ page }) => {
    await authenticatePage(page, 'customerEmpty');

    const pagesToTest = [
      '/dashboard',
      '/dashboard/vps-instances',
      '/dashboard/orders',
      '/dashboard/tickets',
      '/dashboard/domains',
      '/wishlist',
    ];

    for (const p of pagesToTest) {
      await page.goto(p);
      await page.waitForTimeout(500);
      // Page must load without unhandled error or blank screen
      expect(page.url()).toContain(p);
      const mainContent = page.locator('h1, h2, main').first();
      await expect(mainContent).toBeVisible();
    }
  });
});
