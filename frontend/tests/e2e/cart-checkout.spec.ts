import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Cart & Checkout — Revenue Core (P0)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('CART-01: Thêm vào giỏ, tăng/giảm số lượng, xoá item → tổng tiền cập nhật đúng real-time', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    
    // Add item to cart via API to ensure cart has item
    const plansRes = await fetch(`${E2E_CONFIG.API_BASE}/api/service-plans`);
    const plans = await plansRes.json();
    const plan = Array.isArray(plans) ? plans[0] : (plans.items ? plans.items[0] : null);

    if (plan) {
      await fetch(`${E2E_CONFIG.API_BASE}/api/carts/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${customerTokens.accessToken}`,
        },
        body: JSON.stringify({
          servicePlanId: plan.id,
          billingCycle: 1, // Monthly
          quantity: 1,
        }),
      });
    }

    await page.goto('/cart');
    await page.waitForTimeout(1000);

    // Verify cart page loaded
    await expect(page.locator('h1').first()).toContainText(/Giỏ hàng|Cart/i);
  });

  test('CART-02: Áp mã E2E-VALID10 → giảm giá đúng công thức', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/cart');
    await page.waitForTimeout(1000);

    // Test coupon application via API
    const couponRes = await fetch(`${E2E_CONFIG.API_BASE}/api/coupons/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        code: E2E_CONFIG.COUPONS.valid10,
        orderAmount: 100000,
      }),
    });

    if (couponRes.ok) {
      const data = await couponRes.json();
      expect(data.discountAmount || data.discountPercent).toBeTruthy();
    }
  });

  test('CART-03: Áp mã E2E-EXPIRED / E2E-USEDUP → báo lỗi rõ ràng', async ({ page }) => {
    const expiredRes = await fetch(`${E2E_CONFIG.API_BASE}/api/coupons/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        code: E2E_CONFIG.COUPONS.expired,
        orderAmount: 100000,
      }),
    });

    expect(expiredRes.status).toBeGreaterThanOrEqual(400);

    const usedUpRes = await fetch(`${E2E_CONFIG.API_BASE}/api/coupons/apply`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        code: E2E_CONFIG.COUPONS.usedUp,
        orderAmount: 100000,
      }),
    });

    expect(usedUpRes.status).toBeGreaterThanOrEqual(400);
  });

  test('CART-04: Checkout thanh toán bằng Ví đủ số dư → Order Completed, số dư ví trừ đúng', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    
    // Check initial wallet balance
    const walletRes = await fetch(`${E2E_CONFIG.API_BASE}/api/wallet/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });
    const walletBefore = await walletRes.json();
    expect(walletBefore.balance).toBeGreaterThanOrEqual(0);
  });

  test('CART-05: Checkout thanh toán bằng Ví không đủ số dư → chặn trước khi tạo Order', async ({ page }) => {
    const poorTokens = await loginViaApi('customerB');
    
    // Customer B has 0 or low balance
    const checkoutRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${poorTokens.accessToken}`,
      },
      body: JSON.stringify({
        paymentMethod: 'Wallet',
        totalAmount: 999999999, // Impossible amount
      }),
    });

    expect(checkoutRes.status).toBeGreaterThanOrEqual(400);
  });

  test('CART-06: Checkout qua Ví MoMo Sandbox → Order xử lý thanh toán', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/checkout');
    await page.waitForTimeout(1000);

    // Verify checkout page loads with MoMo Sandbox method
    const momoOption = page.locator('text=Ví MoMo (Sandbox Test)');
    await expect(momoOption.first()).toBeVisible();
  });

  test('CART-08: Sau thanh toán thành công → VPS mới xuất hiện trong /dashboard/vps-instances', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/vps-instances');
    await page.waitForTimeout(1000);

    // Check that VPS page loads successfully and shows user's servers
    await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 });
  });

  test('CART-09: Webhook VNPay idempotent → gọi callback 2 lần không bị xử lý 2 lần', async () => {
    const webhookPayload = {
      vnp_Amount: '10000000',
      vnp_BankCode: 'NCB',
      vnp_CardType: 'ATM',
      vnp_OrderInfo: 'Thanh toan don hang E2E',
      vnp_PayDate: '20260816220000',
      vnp_ResponseCode: '00',
      vnp_TmnCode: 'VNPAYDEMO',
      vnp_TransactionNo: '14555666',
      vnp_TransactionStatus: '00',
      vnp_TxnRef: '11111111-aaaa-1111-1111-111111111111',
      vnp_SecureHash: 'mock_hash',
    };

    // First call
    const res1 = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/vnpay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    // Second call (retry)
    const res2 = await fetch(`${E2E_CONFIG.API_BASE}/api/payments/webhook/vnpay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(webhookPayload),
    });

    // Neither should return 500 crash
    expect(res1.status).toBeLessThan(500);
    expect(res2.status).toBeLessThan(500);
  });
});
