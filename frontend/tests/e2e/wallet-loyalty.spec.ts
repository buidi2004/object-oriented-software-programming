import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Wallet, Loyalty, GiftCard, Wishlist & Referral (P1/P2)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('WAL-01: Lịch sử giao dịch ví (/wallet/transactions)', async () => {
    const txRes = await fetch(`${E2E_CONFIG.API_BASE}/api/wallet/transactions`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(txRes.status).toBe(200);
    const txs = await txRes.json();
    expect(Array.isArray(txs) ? txs : txs.items).toBeTruthy();
  });

  test('GIFT-01: Kiểm tra số dư Gift Card (/gift-cards/{code}/balance)', async () => {
    const code = E2E_CONFIG.GIFT_CARDS.gift100k;
    const giftRes = await fetch(`${E2E_CONFIG.API_BASE}/api/gift-cards/${code}/balance`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(giftRes.status).toBeLessThan(500);
  });

  test('LOY-01: Điểm thưởng Loyalty (/loyalty/me)', async () => {
    const loyRes = await fetch(`${E2E_CONFIG.API_BASE}/api/loyalty/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(loyRes.status).toBe(200);
    const loy = await loyRes.json();
    expect(loy.points || loy.totalPoints).toBeGreaterThanOrEqual(0);
  });

  test('REF-01: Mã giới thiệu Referral (/referrals/me)', async () => {
    const refRes = await fetch(`${E2E_CONFIG.API_BASE}/api/referrals/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(refRes.status).toBe(200);
  });

  test('WISH-01: Danh sách yêu thích Wishlist (/wishlist/me)', async () => {
    const wishRes = await fetch(`${E2E_CONFIG.API_BASE}/api/wishlist/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(wishRes.status).toBe(200);
    const wish = await wishRes.json();
    expect(Array.isArray(wish)).toBeTruthy();
  });

  test('RV-01: Sản phẩm đã xem gần đây (/recently-viewed/me)', async () => {
    const rvRes = await fetch(`${E2E_CONFIG.API_BASE}/api/recently-viewed/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(rvRes.status).toBe(200);
  });

  test('AFF-01: Đơn đăng ký Affiliate (/affiliate-applications/me)', async () => {
    const affRes = await fetch(`${E2E_CONFIG.API_BASE}/api/affiliate-applications/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    // 200 or 404 (not applied yet), never 500
    expect(affRes.status).toBeLessThan(500);
  });
});
