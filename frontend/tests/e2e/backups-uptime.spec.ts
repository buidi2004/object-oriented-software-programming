import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Backups & Uptime (P2)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('BAK-01 & BAK-02: Lịch sử Backup (/backups/me)', async () => {
    const backupRes = await fetch(`${E2E_CONFIG.API_BASE}/api/backups/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(backupRes.status).toBe(200);
    const backups = await backupRes.json();
    expect(Array.isArray(backups)).toBeTruthy();
  });

  test('UP-01: Trang Uptime hệ thống (/uptime/system)', async () => {
    const uptimeRes = await fetch(`${E2E_CONFIG.API_BASE}/api/uptime/system`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(uptimeRes.status).toBe(200);
  });
});
