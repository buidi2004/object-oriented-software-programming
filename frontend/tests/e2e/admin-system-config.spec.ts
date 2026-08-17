import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Admin System Settings & Config (P0)', () => {
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
  });

  test('ADM-SETTINGS-01 & ADM-SETTINGS-02: Đọc & Cập nhật System Settings (/api/system-settings)', async () => {
    // 1. Get all settings
    const allRes = await fetch(`${E2E_CONFIG.API_BASE}/api/system-settings`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(allRes.status).toBe(200);
    const settings = await allRes.json();
    expect(Array.isArray(settings)).toBeTruthy();

    // 2. Get setting by key
    const getRes = await fetch(`${E2E_CONFIG.API_BASE}/api/system-settings/SiteName`);
    expect([200, 404]).toContain(getRes.status);

    // 3. Update setting
    const updateRes = await fetch(`${E2E_CONFIG.API_BASE}/api/system-settings/SiteName`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        key: 'SiteName',
        value: 'CloudServiceStore Updated E2E',
      }),
    });
    expect(updateRes.status).toBeLessThan(500);

    // 4. Mismatched key returns 400 Bad Request
    const badRes = await fetch(`${E2E_CONFIG.API_BASE}/api/system-settings/SiteName`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        key: 'DifferentKey',
        value: 'Test',
      }),
    });
    expect(badRes.status).toBe(400);
  });

  test('ADM-SEO-01: Kiểm tra Sitemap XML endpoint (/sitemap.xml)', async () => {
    const sitemapRes = await fetch(`${E2E_CONFIG.API_BASE}/sitemap.xml`);
    expect(sitemapRes.status).toBe(200);
    const xml = await sitemapRes.text();
    expect(xml).toContain('urlset');
  });

  test('ADM-EXPORT-01: Export Đơn hàng ra CSV (/api/exports/orders)', async () => {
    const exportRes = await fetch(`${E2E_CONFIG.API_BASE}/api/exports/orders?format=csv`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(exportRes.status).toBe(200);
    const csvData = await exportRes.text();
    expect(csvData.length).toBeGreaterThan(0);
  });
});
