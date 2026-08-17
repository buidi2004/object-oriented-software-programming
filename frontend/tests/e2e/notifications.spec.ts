import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Notification & Toast Alerts (P1)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('TOAST-01: Thông báo lỗi từ API không để lộ stack trace', async () => {
    const res = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    const text = await res.text();
    expect(text).not.toContain('Microsoft.Data.SqlClient');
    expect(text).not.toContain('at CloudServiceStore.');
  });

  test('TOAST-02: Notification Settings API (/api/notification-settings/me)', async () => {
    const notifRes = await fetch(`${E2E_CONFIG.API_BASE}/api/notification-settings/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(notifRes.status).toBeLessThan(500);
  });
});
