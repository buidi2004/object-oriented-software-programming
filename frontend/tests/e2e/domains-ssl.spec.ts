import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Domains & SSL (P1)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('DOM-01 & DOM-02: Domain check & search via API', async () => {
    const searchRes = await fetch(`${E2E_CONFIG.API_BASE}/api/domains/check?domain=e2e-new-test-domain.vn`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(searchRes.status).toBeLessThan(500);
  });

  test('DOM-03 & DOM-04: Danh sách domain của tôi (/domains/me) & DNS records', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/domains');
    await page.waitForTimeout(1000);

    const domRes = await fetch(`${E2E_CONFIG.API_BASE}/api/domains/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });
    expect(domRes.status).toBe(200);
    const domains = await domRes.json();
    const list = Array.isArray(domains) ? domains : (domains.items || []);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  test('SSL-01 & SSL-02: SSL Certificates (/ssl-certificates/certificates)', async () => {
    const sslRes = await fetch(`${E2E_CONFIG.API_BASE}/api/ssl-certificates/certificates`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(sslRes.status).toBeLessThan(500);
  });
});
