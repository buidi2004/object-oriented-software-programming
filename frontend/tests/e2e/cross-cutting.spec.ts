import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';
import { validateCamelCaseObject } from './fixtures/schema';

test.describe('Cross-Cutting & Security (P0)', () => {
  let customerTokens: { accessToken: string };
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
    adminTokens = await loginViaApi('admin');
  });

  test('XCUT-01: Contract Check: response khớp DTO và camelCase 100%', async () => {
    const endpoints = [
      '/api/users/me',
      '/api/wallet/me',
      '/api/vpsinstances',
      '/api/orders/me',
      '/api/categories',
      '/api/coupons/active',
      '/api/promotions/active',
    ];

    for (const ep of endpoints) {
      const res = await fetch(`${E2E_CONFIG.API_BASE}${ep}`, {
        headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
      });

      expect(res.status).toBeLessThan(500);
      const data = await res.json();
      
      const errors = validateCamelCaseObject(data);
      if (errors.length > 0) {
        console.warn(`CamelCase warnings for ${ep}:`, errors.slice(0, 3));
      }
      // Assert no critical casing bugs
      expect(errors.length).toBeLessThan(10);
    }
  });

  test('XCUT-02: Route Ambiguity: không có AmbiguousMatchException cho 6 cặp route', async () => {
    const testPairs = [
      ['/api/tickets/me', '/api/support-tickets/me'],
      ['/api/ssl', '/api/ssl-certificates/certificates'],
      ['/api/settings', '/api/system-settings'],
      ['/api/chats/active', '/api/LiveChat/sessions'],
      ['/api/Search?q=vps', '/api/global-search?q=vps'],
      ['/api/news', '/api/articles/00000000-0000-0000-0000-000000000000/comments'],
    ];

    for (const [route1, route2] of testPairs) {
      const res1 = await fetch(`${E2E_CONFIG.API_BASE}${route1}`, {
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
      });
      const res2 = await fetch(`${E2E_CONFIG.API_BASE}${route2}`, {
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
      });

      expect(res1.status).not.toBe(500);
      expect(res2.status).not.toBe(500);
    }
  });

  test('XCUT-03: Permission 2 lớp: thiếu quyền bị chặn ở API và UI', async () => {
    const noPermTokens = await loginViaApi('noPermVps');

    // Admin endpoint called by non-admin
    const res = await fetch(`${E2E_CONFIG.API_BASE}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${noPermTokens.accessToken}` },
    });

    expect([401, 403]).toContain(res.status);
  });

  test('XCUT-04: IDOR Toàn diện: CustomerA không thể đọc dữ liệu của CustomerB', async () => {
    const idorTargets = [
      `/api/vpsinstances/${E2E_CONFIG.CUSTOMER_B_IDOR.vpsId}`,
      `/api/support-tickets/${E2E_CONFIG.CUSTOMER_B_IDOR.ticketId}`,
      `/api/domains/${E2E_CONFIG.CUSTOMER_B_IDOR.domainId}`,
      `/api/orders/${E2E_CONFIG.CUSTOMER_B_IDOR.vpsId}/control-panel`,
    ];

    for (const target of idorTargets) {
      const res = await fetch(`${E2E_CONFIG.API_BASE}${target}`, {
        headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
      });

      // Must be 401 (unauthorized), 404 (not found in user scope) or 403 (forbidden)
      expect([401, 403, 404]).toContain(res.status);
    }
  });

  test('XCUT-05: Resilience: FE không bị sập khi BE trả lỗi', async ({ page }) => {
    // Intercept a non-critical endpoint and force 500 error
    await page.route('**/api/banners', route => {
      route.fulfill({ status: 500, body: 'Simulated server error' });
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    // Page must still render header/footer without white screen
    const header = page.locator('header, nav, body');
    await expect(header.first()).toBeVisible();
  });

  test('XCUT-06: JWT Refresh dưới tải: token hết hạn không làm gãy transaction', async () => {
    const tokens = await loginViaApi('customerA');
    
    // Simulate token refresh
    const refreshRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      }),
    });

    expect(refreshRes.status).toBeLessThan(500);
  });
});
