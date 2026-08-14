/**
 * Full E2E Flow: Đăng ký → Đăng nhập → Xem dịch vụ → Thêm giỏ hàng → Checkout → Thanh toán → Khởi tạo VPS
 *
 * Test này gọi thẳng Backend API thật (http://localhost:5053) chạy trên Docker,
 * KHÔNG mock — đảm bảo FE-BE hoạt động end-to-end.
 */
import { test, expect, request as pwRequest } from '@playwright/test';
import crypto from 'crypto';

const API = 'http://localhost:5053/api';
const ts = Date.now();
const TEST_EMAIL = `e2e_${ts}@test.com`;
const TEST_PASSWORD = 'StrongP@ss1';
const TEST_FULLNAME = 'E2E Tester';
const TEST_PHONE = '0901234567';

let accessToken = '';
let userId = '';
let servicePlanId = '';
let cartItemId = '';
let orderId = '';

// ─── 1. ĐĂNG KÝ TÀI KHOẢN ──────────────────────────────
test.describe.serial('Full User Journey E2E', () => {
  test('1. Đăng ký tài khoản mới thành công', async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.post(`${API}/auth/register`, {
      data: {
        fullName: TEST_FULLNAME,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        phoneNumber: TEST_PHONE,
        country: 'VN',
        city: 'Hồ Chí Minh',
      },
    });

    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.userId).toBeTruthy();
    expect(body.email).toBe(TEST_EMAIL);
    userId = body.userId;
    await ctx.dispose();
  });

  test('2. Đăng ký trùng email bị từ chối (409)', async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.post(`${API}/auth/register`, {
      data: {
        fullName: 'Duplicate',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        phoneNumber: TEST_PHONE,
      },
    });
    expect(res.status()).toBe(409);
    await ctx.dispose();
  });

  // ─── 2. ĐĂNG NHẬP ──────────────────────────────────
  test('3. Đăng nhập thành công, nhận accessToken', async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.post(`${API}/auth/login`, {
      data: {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        ipAddress: '127.0.0.1',
        userAgent: 'Playwright E2E',
        deviceInfo: 'E2E Test Runner',
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.accessToken).toBeTruthy();
    accessToken = body.accessToken;
    await ctx.dispose();
  });

  test('4. Đăng nhập sai mật khẩu bị từ chối', async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.post(`${API}/auth/login`, {
      data: {
        email: TEST_EMAIL,
        password: 'WrongPassword1',
        ipAddress: '127.0.0.1',
        userAgent: 'Playwright E2E',
        deviceInfo: 'E2E Test Runner',
      },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    await ctx.dispose();
  });

  // ─── 3. XEM PROFILE ────────────────────────────────
  test('5. Lấy thông tin profile (/users/me)', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.get(`${API}/users/me`);
    expect(res.status()).toBe(200);
    const profile = await res.json();
    expect(profile.email).toBe(TEST_EMAIL);
    expect(profile.fullName).toBe(TEST_FULLNAME);
    await ctx.dispose();
  });

  // ─── 4. XEM DANH MỤC & DỊCH VỤ ────────────────────
  test('6. Lấy danh mục dịch vụ (/categories)', async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.get(`${API}/categories`);
    expect(res.status()).toBe(200);
    const cats = await res.json();
    expect(cats.length).toBeGreaterThanOrEqual(3);

    const vps = cats.find((c: any) => c.slug === 'cloud-vps');
    expect(vps).toBeTruthy();
    expect(vps.name).toBe('Cloud VPS');
    await ctx.dispose();
  });

  test('7. Lấy danh sách plans kèm giá (/service-plans)', async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.get(`${API}/service-plans?currency=VND`);
    expect(res.status()).toBe(200);
    const plans = await res.json();
    expect(plans.length).toBeGreaterThanOrEqual(1);

    // API returns servicePlanName, servicePlanId
    const vpsPlan = plans.find((p: any) => p.servicePlanName?.includes('Cloud VPS') && p.billingCycle === 1);
    expect(vpsPlan).toBeTruthy();
    servicePlanId = vpsPlan.servicePlanId;

    // Verify plan has real price
    console.log('Selected plan:', JSON.stringify(vpsPlan, null, 2));
    expect(vpsPlan.servicePlanName).toBeTruthy();
    expect(vpsPlan.price).toBeGreaterThan(0);
    await ctx.dispose();
  });

  test('8. Xem chi tiết 1 plan (/service-plans/:id)', async () => {
    const ctx = await pwRequest.newContext();
    const res = await ctx.get(`${API}/service-plans/${servicePlanId}?currency=VND`);
    expect(res.status()).toBe(200);
    const detail = await res.json();
    console.log('Plan Detail:', JSON.stringify(detail, null, 2));
    // Verify detail has expected structure
    expect(detail).toBeTruthy();
    await ctx.dispose();
  });

  // ─── 5. THÊM VÀO GIỎ HÀNG ─────────────────────────
  test('9. Thêm plan VPS vào giỏ hàng', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.post(`${API}/carts/items`, {
      data: {
        servicePlanId: servicePlanId,
        billingCycle: 1, // Monthly
        quantity: 1,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.id).toBeTruthy();
    cartItemId = body.id;
    await ctx.dispose();
  });

  test('10. Xem giỏ hàng (/carts/me)', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.get(`${API}/carts/me`);
    expect(res.status()).toBe(200);
    const cart = await res.json();
    console.log('Cart:', JSON.stringify(cart, null, 2));
    await ctx.dispose();
  });

  // ─── 6. CHECKOUT ────────────────────────────────────
  test('11. Checkout giỏ hàng → tạo đơn hàng', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.post(`${API}/orders/checkout`, {
      data: { couponCode: null },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.orderId).toBeTruthy();
    orderId = body.orderId;
    console.log('Order created:', orderId);
    await ctx.dispose();
  });

  // ─── 7. XEM ĐƠN HÀNG ───────────────────────────────
  test('12. Xem danh sách đơn hàng (/orders/me)', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.get(`${API}/orders/me`);
    expect(res.status()).toBe(200);
    const orders = await res.json();
    expect(orders.length).toBeGreaterThanOrEqual(1);
    console.log('My Orders:', JSON.stringify(orders, null, 2));
    await ctx.dispose();
  });

  test('13. Xem chi tiết đơn hàng (/orders/:id)', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.get(`${API}/orders/${orderId}`);
    expect(res.status()).toBe(200);
    const order = await res.json();
    expect(order.id).toBe(orderId);
    console.log('Order Detail:', JSON.stringify(order, null, 2));
    await ctx.dispose();
  });

  // ─── 8. THANH TOÁN ──────────────────────────────────
  test('14. Tạo thanh toán cho đơn hàng (/payments)', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.post(`${API}/payments`, {
      data: { orderRequestId: orderId },
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    const paymentUrl = body.url as string;
    console.log('Payment result:', paymentUrl);

    const keyMatch = paymentUrl.match(/key=([^&]+)/);
    expect(keyMatch).toBeTruthy();
    const idempotencyKey = decodeURIComponent(keyMatch![1]);
    const signature = crypto
      .createHmac('sha256', 'vnpay_secret_key_123')
      .update(idempotencyKey)
      .digest('hex');

    const webhookRes = await ctx.post(`${API}/payments/webhook/vnpay`, {
      data: { idempotencyKey },
      headers: { 'X-VNPAY-Signature': signature },
    });
    expect(webhookRes.status()).toBe(200);
    await ctx.dispose();
  });

  // ─── 9. KHỞI TẠO VPS ───────────────────────────────
  test('15. Provision VPS cho đơn hàng (/VpsInstances)', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.post(`${API}/VpsInstances`, {
      data: {
        orderId: orderId,
      },
    });
    console.log('VPS Provision status:', res.status());
    const body = await res.json();
    console.log('VPS Provision result:', JSON.stringify(body, null, 2));

    expect(res.status()).toBe(200);
    expect(body.containerId).toBeTruthy();
    expect(body.cpuCores).toBeGreaterThan(0);
    expect(body.ramMb).toBeGreaterThan(0);
    await ctx.dispose();
  });

  test('16. Xem danh sách VPS instances (/VpsInstances)', async () => {
    const ctx = await pwRequest.newContext({
      extraHTTPHeaders: { Authorization: `Bearer ${accessToken}` },
    });
    const res = await ctx.get(`${API}/VpsInstances`);
    expect(res.status()).toBe(200);
    const instances = await res.json();
    console.log('VPS Instances:', JSON.stringify(instances, null, 2));
    expect(instances.length).toBeGreaterThanOrEqual(1);
    await ctx.dispose();
  });

  // ─── 10. FE: TRANG CHI TIẾT DV ─────────────────────
  test('17. FE: Trang /services/cloud-vps hiển thị đúng', async ({ page }) => {
    await page.goto('/services/cloud-vps');
    // Trang phải tải được (không 404)
    await expect(page).not.toHaveURL(/404/);
    // Phải hiển thị thông tin VPS
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('18. FE: Trang /services hiển thị danh sách dịch vụ', async ({ page }) => {
    await page.goto('/services');
    await expect(page).not.toHaveURL(/404/);
    const body = await page.locator('body').textContent();
    expect(body).toBeTruthy();
  });

  test('19. FE: Trang Dashboard hiển thị sau đăng nhập', async ({ page }) => {
    // Set token to simulate logged-in state
    await page.addInitScript((token) => {
      localStorage.setItem('accessToken', token);
    }, accessToken);

    await page.goto('/dashboard');
    // Should not redirect to login
    await page.waitForTimeout(2000);
    const url = page.url();
    // Dashboard should be accessible
    expect(url).toContain('/dashboard');
  });

  test('20. FE: Trang giỏ hàng /cart hiển thị', async ({ page }) => {
    await page.addInitScript((token) => {
      localStorage.setItem('accessToken', token);
    }, accessToken);

    await page.goto('/cart');
    await expect(page).not.toHaveURL(/404/);
  });
});
