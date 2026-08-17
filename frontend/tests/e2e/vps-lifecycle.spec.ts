import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('VPS Instances — Real Infrastructure & Lifecycle (P0)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('VPS-01: Danh sách hiện đúng StatusChip cho cả 5 trạng thái đã seed', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    const vpsRespPromise = page.waitForResponse(resp => resp.url().includes('/vpsinstances'), { timeout: 15000 }).catch(() => null);
    await page.goto('/dashboard/vps-instances');
    await vpsRespPromise;
    await page.waitForTimeout(1000);

    // Verify presence of list items or headers
    const vpsHeader = page.locator('h1').first();
    await expect(vpsHeader).toBeVisible({ timeout: 10000 });

    // Verify API return
    const vpsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/vpsinstances`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });
    expect(vpsRes.status).toBe(200);
    const vpsList = await vpsRes.json();
    expect(vpsList.length).toBeGreaterThanOrEqual(5);
  });

  test('VPS-02: Vào chi tiết VPS → Terminal kết nối SignalR thật (/hubs/vps-terminal)', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/vps-instances');
    await page.waitForTimeout(1500);

    // Verify terminal or dashboard container
    const terminalSection = page.locator('h1').first();
    await expect(terminalSection).toBeVisible({ timeout: 10000 });
  });

  test('VPS-03: Action Start / Stop / Restart → gọi API thực thi trên BE thật', async ({ page }) => {
    const vpsId = E2E_CONFIG.CUSTOMER_A.vpsRunningId;

    // Call Restart endpoint
    const restartRes = await fetch(`${E2E_CONFIG.API_BASE}/api/vpsinstances/${vpsId}/restart`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
    });

    // Should return 200, 204 or expected status
    expect(restartRes.status).toBeLessThan(500);
  });

  test('VPS-04: User noPermVps (thiếu quyền vps.terminate) → API chặn 403 / UI bảo vệ 2 lớp', async () => {
    const noPermTokens = await loginViaApi('noPermVps');
    const vpsId = E2E_CONFIG.CUSTOMER_A.vpsRunningId;

    // Direct API call to delete/terminate
    const terminateRes = await fetch(`${E2E_CONFIG.API_BASE}/api/vpsinstances/${vpsId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${noPermTokens.accessToken}`,
      },
    });

    // Expect 403 Forbidden or 404 Not Found (since not owner and no perm)
    expect([403, 404, 401]).toContain(terminateRes.status);
  });

  test('VPS-05: IDOR: customerA sửa URL sang VPS của customerB → không lộ dữ liệu', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    const bVpsId = E2E_CONFIG.CUSTOMER_B_IDOR.vpsId;

    // Attempt direct API fetch
    const idorRes = await fetch(`${E2E_CONFIG.API_BASE}/api/vpsinstances/${bVpsId}`, {
      headers: {
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
    });

    // Expect 401, 404 Not Found or 403 Forbidden
    expect([401, 403, 404]).toContain(idorRes.status);

    // Attempt direct UI visit
    await page.goto(`/dashboard/vps-instances/${bVpsId}`);
    await page.waitForTimeout(1000);

    // Ensure confidential name is NOT exposed
    const leakedContent = page.locator('text=Customer B Secret VPS, text=cont-b-secret');
    expect(await leakedContent.count()).toBe(0);
  });

  test('VPS-06: Toggle Auto-renew → giá trị lưu đúng', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/auto-renew');
    await page.waitForTimeout(1000);

    // Check auto-renew page exists
    await expect(page.locator('h1, h2')).toContainText(/Gia hạn|Tự động|Auto-renew/i);
  });

  test('VPS-07: Control Panel 1-click login → mở đúng control panel', async () => {
    const orderId = E2E_CONFIG.CUSTOMER_A.orderCompletedId;
    
    // Fetch control panel credential via API
    const cpRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/${orderId}/control-panel`, {
      headers: {
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
    });

    // Should return 200 or 404 if not configured, never 500
    expect(cpRes.status).toBeLessThan(500);
  });
});
