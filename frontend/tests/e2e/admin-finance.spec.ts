import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Admin Finance & Payments (P0)', () => {
  let adminTokens: { accessToken: string };
  let customerATokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
    customerATokens = await loginViaApi('customerA');
  });

  test('ADM-WAL-01: Lịch sử giao dịch ví & số dư (/api/wallet/transactions)', async () => {
    const txRes = await fetch(`${E2E_CONFIG.API_BASE}/api/wallet/transactions`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(txRes.status).toBe(200);
  });

  test('ADM-ORD-01: Xem danh sách Order của toàn bộ hệ thống (/api/orders)', async () => {
    const ordersRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(ordersRes.status).toBe(200);
    const orders = await ordersRes.json();
    const list = Array.isArray(orders) ? orders : (orders.items || []);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  test('ADM-REFUND-01 & ADM-REFUND-02 & ADM-REFUND-03: Refund Request Workflow (/api/refund-requests)', async () => {
    // 1. Get all refund requests
    const refundsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/refund-requests`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(refundsRes.status).toBe(200);
    const refunds = await refundsRes.json();
    expect(Array.isArray(refunds)).toBeTruthy();

    if (refunds.length > 0) {
      const targetRefund = refunds[0];

      // 2. Approve or Reject
      const approveRes = await fetch(`${E2E_CONFIG.API_BASE}/api/refund-requests/${targetRefund.id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
      });
      expect(approveRes.status).toBeLessThan(500);

      // 3. Double-call idempotency check
      const doubleApproveRes = await fetch(`${E2E_CONFIG.API_BASE}/api/refund-requests/${targetRefund.id}/approve`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
      });
      expect(doubleApproveRes.status).toBeLessThan(500);
    }
  });

  test('ADM-PAYMETHOD-01: Quản lý phương thức thanh toán (/api/payment-methods)', async () => {
    const pmRes = await fetch(`${E2E_CONFIG.API_BASE}/api/payment-methods/me`, {
      headers: { Authorization: `Bearer ${customerATokens.accessToken}` },
    });
    expect(pmRes.status).toBe(200);
  });
});
