import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi, authenticatePage } from './fixtures/auth';

test.describe('SePay & VietQR Payment Flow (Exclusive Automated Bank Transfer)', () => {
  test.describe.configure({ mode: 'serial' });
  const SEPAY_API_KEY = 'HIJJSQ245A0AONRTKFRAG4G1HWWXIEUJFMW2OEHCZZXUPV5ZTWU3JQF6PPYMBE6Q';
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('SEPAY-01: Tạo Payment trả về đường link ảnh VietQR (MB Bank) chuẩn xác', async () => {
    // 1. Add item to cart to ensure fresh checkout
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

    // 2. Checkout to create a Pending Order
    const checkoutRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({ couponCode: null }),
    });

    expect(checkoutRes.status).toBeLessThan(500);
    const orderData = await checkoutRes.json();
    const orderId = orderData.orderId || orderData.id || E2E_CONFIG.CUSTOMER_A.orderPendingId;

    // 2. Create Payment for this Order
    const paymentRes = await fetch(`${E2E_CONFIG.API_BASE}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({ orderRequestId: orderId }),
    });

    expect(paymentRes.status).toBe(200);
    const paymentData = await paymentRes.json();
    expect(paymentData.url).toContain('vietqr.io/image/MB-0987654321');
    expect(paymentData.url).toContain('accountName=CLOUD%20SERVICE%20STORE');
  });

  test('SEPAY-02: SePay Webhook tự động chốt đơn khi nhận đúng API Key và tiền vào', async () => {
    const orderId = E2E_CONFIG.CUSTOMER_A.orderPendingId;

    // Simulate SePay Webhook POST request
    const webhookRes = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/sepay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Apikey ${SEPAY_API_KEY}`,
      },
      body: JSON.stringify({
        id: 999901,
        gateway: 'MBBank',
        transactionDate: new Date().toISOString(),
        accountNumber: '0987654321',
        code: null,
        content: `Thanh toan don hang PAY_${orderId}`,
        transferType: 'in',
        transferAmount: 450000.0,
        accumulated: 450000.0,
        subAccount: null,
        referenceCode: 'FT2608170001',
        description: 'Chuyen tien MB Bank',
      }),
    });

    expect(webhookRes.status).toBe(200);
    const resBody = await webhookRes.json();
    expect(resBody.success).toBe(true);

    // Verify Order is updated in DB
    const orderRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/${orderId}`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });
    expect(orderRes.status).toBe(200);
    const order = await orderRes.json();
    // Order status should be 2 (Completed) or Paid
    expect([2, 'Completed', 'Paid']).toContain(order.status);
  });

  test('SEPAY-03: Chặn Webhook giả mạo khi sai hoặc thiếu API Key (401 Unauthorized)', async () => {
    // 1. Missing Authorization header
    const noKeyRes = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/sepay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: 999902,
        transferType: 'in',
        transferAmount: 100000,
        content: 'PAY_fake',
      }),
    });
    expect(noKeyRes.status).toBe(401);

    // 2. Invalid API Key
    const badKeyRes = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/sepay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Apikey WRONG_API_KEY_12345',
      },
      body: JSON.stringify({
        id: 999903,
        transferType: 'in',
        transferAmount: 100000,
        content: 'PAY_fake',
      }),
    });
    expect(badKeyRes.status).toBe(401);
  });

  test('SEPAY-04: Xử lý Idempotent khi SePay gửi Webhook retry nhiều lần', async () => {
    const orderId = E2E_CONFIG.CUSTOMER_A.orderPendingId;

    const payload = {
      id: 999904,
      gateway: 'MBBank',
      accountNumber: '0987654321',
      content: `PAY_${orderId}`,
      transferType: 'in',
      transferAmount: 450000.0,
    };

    // First call
    const res1 = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/sepay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Apikey ${SEPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    expect(res1.status).toBe(200);

    // Duplicate retry call
    const res2 = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/sepay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Apikey ${SEPAY_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });
    // Must succeed without 500 error
    expect(res2.status).toBe(200);
  });

  test('SEPAY-05: Bỏ qua biến động số dư tiền ra (transferType: "out")', async () => {
    const res = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/sepay`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Apikey ${SEPAY_API_KEY}`,
      },
      body: JSON.stringify({
        id: 999905,
        transferType: 'out',
        transferAmount: 500000,
        content: 'Chuyen tien mua hang ngoai',
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain('Ignored outgoing transfer');
  });

  test('SEPAY-06: UI Checkout hiển thị giao diện VietQR MB Bank sắc nét', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/checkout');
    await page.waitForTimeout(1000);

    // Verify VietQR MB Bank is selected as the payment method
    const vietqrText = page.locator('text=Chuyển khoản VietQR (MB Bank)');
    await expect(vietqrText.first()).toBeVisible();

    // Verify VNPay and MoMo are NOT present in the payment choices
    const vnpayOption = page.locator('text=VNPAY QR');
    const momoOption = page.locator('text=MoMo Wallet');
    expect(await vnpayOption.count()).toBe(0);
    expect(await momoOption.count()).toBe(0);
  });
});
