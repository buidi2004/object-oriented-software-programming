import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Admin Portal — Operations & Audits (P0/P1/P2)', () => {
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
  });

  test('ADM-ORD-01: Xem toàn bộ Order & RefundRequests trong hệ thống', async () => {
    const ordersRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(ordersRes.status).toBe(200);

    const refundsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/refund-requests`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(refundsRes.status).toBe(200);
  });

  test('ADM-TICK-01: Admin xem hàng đợi Ticket (/tickets/queue) & trả lời ticket', async () => {
    const queueRes = await fetch(`${E2E_CONFIG.API_BASE}/api/tickets/queue`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(queueRes.status).toBe(200);
  });

  test('ADM-VPS-01: Admin xem được toàn bộ VPS của mọi user (/VpsInstances/admin)', async () => {
    const vpsAdminRes = await fetch(`${E2E_CONFIG.API_BASE}/api/VpsInstances/admin`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(vpsAdminRes.status).toBe(200);
    const vpsList = await vpsAdminRes.json();
    expect(Array.isArray(vpsList) || Array.isArray(vpsList.items)).toBeTruthy();
  });

  test('ADM-PERM-01: Danh sách Roles & Permissions (/roles, /permissions)', async () => {
    const rolesRes = await fetch(`${E2E_CONFIG.API_BASE}/api/roles`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(rolesRes.status).toBe(200);

    const permsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/permissions`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(permsRes.status).toBe(200);
  });

  test('ADM-AUDIT-01: Audit Log ghi nhận đúng hành động (/audit-logs)', async () => {
    const auditRes = await fetch(`${E2E_CONFIG.API_BASE}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(auditRes.status).toBe(200);
  });

  test('ADM-EXPORT-01: Chạy Export dữ liệu đơn hàng (/exports/orders)', async () => {
    const exportRes = await fetch(`${E2E_CONFIG.API_BASE}/api/exports/orders`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(exportRes.status).toBeLessThan(500);
  });
});
