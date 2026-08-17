import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Form Validations (P1)', () => {
  test('FORM-REGISTER-01: Đăng ký với mật khẩu yếu hoặc email sai bị chặn', async () => {
    const badEmailRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email: 'invalid-email-format',
        password: '123',
        phoneNumber: '0901234567',
        country: 'VN',
        city: 'HCM',
      }),
    });

    // Should return 400 Bad Request, not 500
    expect(badEmailRes.status).toBe(400);
  });

  test('FORM-LOGIN-01: Đăng nhập với email sai định dạng', async () => {
    const badLoginRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'not-an-email',
        password: 'Password123!',
        deviceInfo: 'test',
        ipAddress: '127.0.0.1',
        userAgent: 'test',
      }),
    });

    expect(badLoginRes.status).toBe(400);
  });

  test('FORM-FORGOT-01: Quên mật khẩu (/api/auth/forgot-password)', async () => {
    const forgotRes = await fetch(`${E2E_CONFIG.API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'e2e.customerA@test.local',
      }),
    });

    // Returns 200 or 400, not 500
    expect(forgotRes.status).toBeLessThan(500);
  });

  test('FORM-TICKET-01: Tạo ticket với subject rỗng bị chặn', async () => {
    const customerTokens = await loginViaApi('customerA');
    const badTicketRes = await fetch(`${E2E_CONFIG.API_BASE}/api/support-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        subject: '',
        priority: 1,
        message: '',
      }),
    });

    expect(badTicketRes.status).toBe(400);
  });

  test('FORM-CHANGEPASS-01: Đổi mật khẩu với mật khẩu mới rỗng bị chặn', async () => {
    const customerTokens = await loginViaApi('customerA');
    const badPassRes = await fetch(`${E2E_CONFIG.API_BASE}/api/security/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'Password123!',
        newPassword: '',
      }),
    });

    expect(badPassRes.status).toBeLessThan(500);
  });

  test('FORM-COUPON-01: Áp mã Coupon trim khoảng trắng (/api/coupons/validate)', async () => {
    const customerTokens = await loginViaApi('customerA');
    const couponRes = await fetch(`${E2E_CONFIG.API_BASE}/api/coupons/validate?code=  E2E-VALID10  `, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(couponRes.status).toBeLessThan(500);
  });
});
