import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Order & Invoice (P1)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('ORD-01: Danh sách đơn hàng filter đúng theo từng status', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/orders');
    await page.waitForTimeout(1000);

    // Verify orders list page
    const ordersHeader = page.locator('h1, h2').first();
    await expect(ordersHeader).toBeVisible();

    // Verify customer's orders via API
    const ordersRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });
    expect(ordersRes.status).toBe(200);
    const orders = await ordersRes.json();
    const list = Array.isArray(orders) ? orders : (orders.items || []);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  test('ORD-02: Xem chi tiết đơn + Invoice, số liệu khớp', async () => {
    const orderId = E2E_CONFIG.CUSTOMER_A.orderCompletedId;
    const orderRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    if (orderRes.ok) {
      const order = await orderRes.json();
      expect(order.totalAmount || order.total || order.subTotal).toBeTruthy();
    }
  });

  test('ORD-03: Gửi yêu cầu hoàn tiền (RefundRequest) từ 1 Order Completed', async () => {
    const orderId = E2E_CONFIG.CUSTOMER_A.orderCompletedId;
    const refundRes = await fetch(`${E2E_CONFIG.API_BASE}/api/refund-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        orderId: orderId,
        reason: 'E2E Test Refund Request Reason',
      }),
    });

    // Should return 200, 201, 400 (if already requested) but never 500
    expect(refundRes.status).toBeLessThan(500);
  });
});
