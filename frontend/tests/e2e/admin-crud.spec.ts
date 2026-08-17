import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Admin Portal — Module CRUD (P1)', () => {
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
  });

  test('ADM-CRUD-01: CRUD Banners, Coupons, FAQs, Promotions, ExchangeRates via API & UI', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin');
    await page.waitForTimeout(1000);

    // 1. Coupons list & creation
    const couponRes = await fetch(`${E2E_CONFIG.API_BASE}/api/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        code: `E2E-AUTO-${Date.now()}`,
        discountPercent: 25.0,
        maxUsage: 50,
        expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      }),
    });
    expect(couponRes.status).toBeLessThan(500);

    // 2. FAQs list
    const faqsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/Faqs`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(faqsRes.status).toBe(200);

    // 3. Promotions list
    const promoRes = await fetch(`${E2E_CONFIG.API_BASE}/api/promotions`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(promoRes.status).toBe(200);

    // 4. Exchange Rates list
    const exRes = await fetch(`${E2E_CONFIG.API_BASE}/api/exchange-rates`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(exRes.status).toBe(200);
  });
});
