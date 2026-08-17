import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('MoMo Sandbox Payment Flow (E2E Automated Gateway)', () => {
  test.describe.configure({ mode: 'serial' });
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('MOMO-01: Tạo đơn hàng và tạo phiên thanh toán MoMo Sandbox', async () => {
    // 1. Add item to cart
    const addCartRes = await fetch(`${E2E_CONFIG.API_BASE}/api/carts/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        servicePlanId: '539a444b-9143-4660-85a4-0fe1c3857179',
        billingCycle: 1,
        quantity: 1,
      }),
    });
    expect(addCartRes.status).toBeLessThan(500);

    // 2. Checkout
    const checkoutRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({ couponCode: null }),
    });
    expect(checkoutRes.status).toBe(200);
    const checkoutData = await checkoutRes.json();
    const orderId = checkoutData.orderId || checkoutData.id;
    expect(orderId).toBeDefined();

    // 3. Create payment
    const payRes = await fetch(`${E2E_CONFIG.API_BASE}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({ orderRequestId: orderId }),
    });
    expect(payRes.status).toBe(200);
  });

  test('MOMO-02: MoMo Webhook IPN xử lý thành công (resultCode: 0) → Chuyển trạng thái Paid (2)', async () => {
    // 1. Checkout a new order
    await fetch(`${E2E_CONFIG.API_BASE}/api/carts/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        servicePlanId: '539a444b-9143-4660-85a4-0fe1c3857179',
        billingCycle: 1,
        quantity: 1,
      }),
    });

    const checkoutRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({ couponCode: null }),
    });
    const { orderId } = await checkoutRes.json();

    // 2. Send MoMo Webhook IPN with resultCode 0
    const webhookRes = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/momo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode: 'MOMO',
        orderId: `PAY_${orderId}`,
        requestId: `REQ_${Date.now()}`,
        amount: 399000,
        orderInfo: `Thanh toan don hang MoMo ${orderId}`,
        resultCode: 0,
        message: 'Successful.',
        transId: `${Date.now()}`,
      }),
    });

    expect(webhookRes.status).toBe(200);
    const webhookData = await webhookRes.json();
    expect(webhookData.resultCode).toBe(0);

    // 3. Verify Order status is now Paid (2) or Completed (3)
    const orderRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });
    expect(orderRes.status).toBe(200);
    const orderData = await orderRes.json();
    expect([2, 3, 'Paid', 'Completed', 'Processing']).toContain(orderData.status);
  });

  test('MOMO-03: MoMo Webhook thông báo giao dịch thất bại (resultCode != 0) → Đơn hàng không bị kích hoạt', async () => {
    // 1. Checkout
    await fetch(`${E2E_CONFIG.API_BASE}/api/carts/items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        servicePlanId: '539a444b-9143-4660-85a4-0fe1c3857179',
        billingCycle: 1,
        quantity: 1,
      }),
    });

    const checkoutRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({ couponCode: null }),
    });
    const { orderId } = await checkoutRes.json();

    // 2. Send MoMo Webhook with user cancelled resultCode: 1006
    const webhookRes = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/momo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode: 'MOMO',
        orderId: `PAY_${orderId}`,
        requestId: `REQ_${Date.now()}`,
        amount: 399000,
        orderInfo: `Khach hang huy`,
        resultCode: 1006,
        message: 'Transaction cancelled by user.',
        transId: `${Date.now()}`,
      }),
    });

    expect(webhookRes.status).toBe(200);
    const webhookData = await webhookRes.json();
    expect(webhookData.resultCode).toBe(1006);

    // 3. Verify Order is still Pending (1)
    const orderRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });
    const orderData = await orderRes.json();
    expect([1, 'Pending']).toContain(orderData.status);
  });

  test('MOMO-04: Xử lý idempotent khi MoMo gửi webhook lặp lại nhiều lần', async () => {
    const fakeOrderId = '11111111-1111-1111-1111-111111111111';
    
    // First call
    const res1 = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/momo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode: 'MOMO',
        orderId: `PAY_${fakeOrderId}`,
        requestId: 'REQ_IDEMPOTENT_1',
        amount: 500000,
        resultCode: 0,
        message: 'Successful.',
      }),
    });
    expect(res1.status).toBe(200);

    // Repeated call (idempotent)
    const res2 = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/momo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        partnerCode: 'MOMO',
        orderId: `PAY_${fakeOrderId}`,
        requestId: 'REQ_IDEMPOTENT_1',
        amount: 500000,
        resultCode: 0,
        message: 'Successful.',
      }),
    });
    expect(res2.status).toBe(200);
  });

  test('MOMO-05: UI MoMo Sandbox Page mô phỏng thanh toán 1-click thành công', async ({ page }) => {
    const sampleOrderId = 'PAY_MOMO_TEST_E2E_9999';
    await page.goto(`${E2E_CONFIG.FE_BASE}/sandbox/momo?orderId=${sampleOrderId}&amount=499000`);

    // Verify MoMo Sandbox UI elements
    await expect(page.locator('text=Cổng Thanh Toán MoMo (Sandbox)')).toBeVisible();
    await expect(page.locator(`text=${sampleOrderId}`)).toBeVisible();
    await expect(page.locator('text=499.000 đ')).toBeVisible();

    // Click "Xác Nhận Thanh Toán MoMo Thành Công"
    const payBtn = page.locator('button:has-text("Xác Nhận Thanh Toán MoMo Thành Công")');
    await expect(payBtn).toBeVisible();
    await payBtn.click();

    // Verify Success screen is displayed
    await expect(page.getByRole('heading', { name: 'MoMo Sandbox Thành Công!' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Truy Cập Máy Chủ VPS')).toBeVisible();
  });
});
