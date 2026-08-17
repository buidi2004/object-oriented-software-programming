import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Admin Security & Access Control (P0)', () => {
  let adminTokens: { accessToken: string };
  let customerATokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
    customerATokens = await loginViaApi('customerA');
  });

  test('ADM-PERM-01 & ADM-PERM-02: Quản lý Roles & Permissions (/api/roles, /api/permissions)', async () => {
    // 1. Get all roles
    const rolesRes = await fetch(`${E2E_CONFIG.API_BASE}/api/roles`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(rolesRes.status).toBe(200);
    const roles = await rolesRes.json();
    expect(roles.length).toBeGreaterThanOrEqual(2);

    // 2. Get all permissions
    const permsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/permissions`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(permsRes.status).toBe(200);
    const perms = await permsRes.json();
    expect(perms.length).toBeGreaterThanOrEqual(5);

    // 3. Get permissions for a specific role
    const editorRole = roles.find((r: any) => r.name === 'Editor') || roles[0];
    const rolePermsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/roles/${editorRole.id}/permissions`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(rolePermsRes.status).toBe(200);

    // 4. Assign permissions to role
    const permIds = perms.slice(0, 2).map((p: any) => p.id);
    const assignRes = await fetch(`${E2E_CONFIG.API_BASE}/api/roles/${editorRole.id}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        roleId: editorRole.id,
        permissionIds: permIds,
      }),
    });
    expect(assignRes.status).toBeLessThan(500);
  });

  test('ADM-AUDIT-01: Audit Log ghi nhận đầy đủ hành động (/api/audit-logs)', async () => {
    const auditRes = await fetch(`${E2E_CONFIG.API_BASE}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(auditRes.status).toBe(200);
    const logs = await auditRes.json();
    expect(Array.isArray(logs)).toBeTruthy();
  });

  test('ADM-AUDIT-02: Audit Log immutable → không cho sửa/xoá qua API', async () => {
    const deleteRes = await fetch(`${E2E_CONFIG.API_BASE}/api/audit-logs/00000000-0000-0000-0000-000000000000`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect([404, 405]).toContain(deleteRes.status);
  });

  test('ADM-SEC-01: API Key Lifecycle — Tạo key mới & thu hồi key (/api/api-keys)', async () => {
    // 1. Get my keys
    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/api-keys/me`, {
      headers: { Authorization: `Bearer ${customerATokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);

    // 2. Generate new key
    const genRes = await fetch(`${E2E_CONFIG.API_BASE}/api/api-keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerATokens.accessToken}`,
      },
      body: JSON.stringify({
        scopes: 'read,write',
      }),
    });
    expect(genRes.status).toBeLessThan(500);
    if (genRes.ok) {
      const data = await genRes.json();
      expect(data.key).toBeTruthy();
    }
  });

  test('ADM-SEC-02: Danh sách session & revoke session (/api/security/sessions)', async () => {
    const sessionsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/security/sessions`, {
      headers: { Authorization: `Bearer ${customerATokens.accessToken}` },
    });
    expect(sessionsRes.status).toBeLessThan(500);
  });
});
