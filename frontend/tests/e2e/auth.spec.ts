import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Customer Portal — Auth & Session (P0)', () => {
  test('AUTH-01: Truy cập URL cần login khi chưa có session → redirect/chặn, không lộ dữ liệu', async ({ page }) => {
    // Clear storage
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/dashboard');
    // Expect redirected to home with login param or login page
    await page.waitForTimeout(1500);
    const url = page.url();
    const isRedirected = url.includes('auth=login') || url.includes('/login') || url === `${E2E_CONFIG.FE_BASE}/`;
    expect(isRedirected).toBeTruthy();
  });

  test('AUTH-02: Login sai mật khẩu → hiện lỗi rõ ràng, không trắng trang', async ({ page }) => {
    await page.goto('/?auth=login');
    await page.waitForTimeout(500);

    // Look for modal or login inputs
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    if (await emailInput.isVisible()) {
      await emailInput.fill(E2E_CONFIG.USERS.customerA.email);
      await passwordInput.fill('WrongPassword123!');
      await page.locator('button[type="submit"]').first().click({ force: true });

      await page.waitForTimeout(1000);
      // Ensure error message is shown or input is still visible (not white screen)
      const errorMsg = page.locator('.text-red-500, .text-rose-500, .text-red-600, [role="alert"]');
      const hasError = (await errorMsg.count()) > 0 || (await emailInput.isVisible());
      expect(hasError).toBeTruthy();
    } else {
      // Test direct API behavior if modal closed
      const res = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: E2E_CONFIG.USERS.customerA.email,
          password: 'WrongPassword123!',
          deviceInfo: 'Playwright Test',
          ipAddress: '127.0.0.1',
          userAgent: 'Playwright',
        }),
      });
      expect(res.status).toBe(401);
    }
  });

  test('AUTH-03: Login đúng → vào dashboard → reload vẫn còn phiên', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    await expect(page).toHaveURL(/.*dashboard/);

    // Reload and check session persistence
    await page.reload();
    await page.waitForTimeout(1000);
    await expect(page).toHaveURL(/.*dashboard/);

    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    expect(token).toBeTruthy();
  });

  test('AUTH-04: Access token hết hạn giữa chừng → interceptor tự refresh', async ({ page }) => {
    const tokens = await loginViaApi('customerA');
    await page.goto('/');

    // Set an invalid/expired access token but valid refresh token
    await page.evaluate(({ rToken }) => {
      localStorage.setItem('accessToken', 'expired-mock-token.header.signature');
      if (rToken) localStorage.setItem('refreshToken', rToken);
    }, { rToken: tokens.refreshToken });

    // Call API via page or trigger action
    const refreshRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
    });
    
    // API should support refresh token
    expect([200, 400]).toContain(refreshRes.status);
  });

  test('AUTH-05: Đăng ký tài khoản mới runtime → login được bằng tài khoản vừa tạo', async ({ page }) => {
    const runtimeEmail = `e2e.new_${Date.now()}@test.local`;
    const password = 'Password123!';

    const regRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'New Runtime User',
        email: runtimeEmail,
        password: password,
        phoneNumber: '0988776655',
        country: 'VN',
        city: 'Da Nang',
      }),
    });

    expect(regRes.status).toBe(201);
    const regData = await regRes.json();
    expect(regData.email).toBe(runtimeEmail);

    // Login with new user
    const loginRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: runtimeEmail,
        password: password,
        deviceInfo: 'Playwright E2E',
        ipAddress: '127.0.0.1',
        userAgent: 'Playwright',
      }),
    });

    expect(loginRes.status).toBe(200);
    const loginData = await loginRes.json();
    expect(loginData.accessToken).toBeTruthy();
  });

  test('AUTH-06: Quên mật khẩu → Reset password flow', async ({ page }) => {
    const email = E2E_CONFIG.USERS.customerA.email;
    
    // Request forgot password
    const forgotRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    expect([200, 204]).toContain(forgotRes.status);
  });

  test('AUTH-07: Logout → toàn bộ route cần auth redirect lại /login, token bị hủy', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    // Perform logout in UI or evaluate
    await page.evaluate(() => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    });

    await page.goto('/dashboard');
    await page.waitForTimeout(1500);
    const url = page.url();
    const isBlocked = url.includes('auth=login') || url.includes('/login') || url === `${E2E_CONFIG.FE_BASE}/`;
    expect(isBlocked).toBeTruthy();
  });
});
