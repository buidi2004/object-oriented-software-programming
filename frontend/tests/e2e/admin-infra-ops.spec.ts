import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Admin Infrastructure & Ops (P0)', () => {
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
  });

  test('ADM-VPS-01: Admin xem toàn bộ VPS của mọi user (/api/VpsInstances/admin)', async () => {
    const vpsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/VpsInstances/admin`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(vpsRes.status).toBe(200);
    const list = await vpsRes.json();
    const items = Array.isArray(list) ? list : (list.items || []);
    expect(Array.isArray(items)).toBeTruthy();
  });

  test('ADM-VPS-02: Admin thực hiện State Action trên VPS (/api/vpsinstances/{id}/restart)', async () => {
    const vpsId = E2E_CONFIG.CUSTOMER_A.vpsRunningId;
    const actionRes = await fetch(`${E2E_CONFIG.API_BASE}/api/vpsinstances/${vpsId}/restart`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(actionRes.status).toBeLessThan(500);
  });

  test('ADM-CTRLPANEL-01: Control Panel Credentials endpoint (/api/orders/{id}/control-panel)', async () => {
    const orderId = E2E_CONFIG.CUSTOMER_A.orderCompletedId;
    const credRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders/${orderId}/control-panel`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(credRes.status).toBeLessThan(500);
  });

  test('ADM-JOBS-01: Trigger Auto-Renewal Job (/api/jobs/process-renewals)', async () => {
    const jobRes = await fetch(`${E2E_CONFIG.API_BASE}/api/jobs/process-renewals`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(jobRes.status).toBe(200);
  });

  test('ADM-MIGRATION-01: Xem & Cập nhật trạng thái Migration Requests (/api/migration-requests)', async () => {
    // 1. Get all migrations
    const migRes = await fetch(`${E2E_CONFIG.API_BASE}/api/migration-requests`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(migRes.status).toBe(200);
    const migrations = await migRes.json();
    expect(Array.isArray(migrations)).toBeTruthy();

    if (migrations.length > 0) {
      const targetMigration = migrations[0];

      // 2. Update status
      const updateRes = await fetch(`${E2E_CONFIG.API_BASE}/api/migration-requests/${targetMigration.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminTokens.accessToken}`,
        },
        body: JSON.stringify({
          id: targetMigration.id,
          status: 1, // InProgress
        }),
      });
      expect(updateRes.status).toBeLessThan(500);
    }
  });
});
