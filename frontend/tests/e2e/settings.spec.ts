import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Account Settings (P1)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('SET-01: Cập nhật profile (/users/me)', async () => {
    const updateRes = await fetch(`${E2E_CONFIG.API_BASE}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        fullName: 'E2E Customer A Updated',
        phoneNumber: '0912345678',
        country: 'VN',
        city: 'Da Nang',
      }),
    });

    expect(updateRes.status).toBeLessThan(500);
  });

  test('SET-02: Đổi mật khẩu (/security/change-password)', async () => {
    const changeRes = await fetch(`${E2E_CONFIG.API_BASE}/api/security/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        currentPassword: 'WrongOldPassword!',
        newPassword: 'NewPassword123!',
      }),
    });

    // Should reject wrong current password with 400/401, not crash 500
    expect([400, 401, 403]).toContain(changeRes.status);
  });

  test('SET-03: Danh sách phiên đăng nhập (UserSession) (/security/sessions)', async () => {
    const sessionsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/security/sessions`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(sessionsRes.status).toBeLessThan(500);
  });

  test('SET-04: Notification settings (/notification-settings/me)', async () => {
    const notifRes = await fetch(`${E2E_CONFIG.API_BASE}/api/notification-settings/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(notifRes.status).toBeLessThan(500);
  });
});
