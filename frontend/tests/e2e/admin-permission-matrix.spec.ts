import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Admin Permission Matrix — Data Driven (P0/P1)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  const adminOnlyEndpoints = [
    { method: 'GET', url: '/api/audit-logs', name: 'Audit Logs' },
    { method: 'GET', url: '/api/roles', name: 'Roles Management' },
    { method: 'GET', url: '/api/permissions', name: 'Permissions Management' },
    { method: 'GET', url: '/api/VpsInstances/admin', name: 'VPS Admin Management' },
    { method: 'GET', url: '/api/refund-requests', name: 'Refund Requests Management' },
    { method: 'POST', url: '/api/jobs/process-renewals', name: 'Jobs Trigger' },
    { method: 'GET', url: '/api/system-settings', name: 'System Settings' },
  ];

  for (const ep of adminOnlyEndpoints) {
    test(`PERM-CHECK: User không có quyền Admin bị chặn 401/403 tại ${ep.name} (${ep.url})`, async () => {
      const res = await fetch(`${E2E_CONFIG.API_BASE}${ep.url}`, {
        method: ep.method,
        headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
      });

      expect([401, 403]).toContain(res.status);
    });
  }
});
