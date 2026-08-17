import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

// 26 modules mapping to their REST endpoints for Fuzzing
const API_ENDPOINTS = [
  { name: 'User Management', method: 'POST', path: '/api/users' },
  { name: 'Orders', method: 'POST', path: '/api/orders' },
  { name: 'Tickets', method: 'POST', path: '/api/tickets' },
  { name: 'VPS Instances', method: 'POST', path: '/api/vps-instances' },
  { name: 'Service Plans', method: 'POST', path: '/api/service-plans' },
  { name: 'Revenue', method: 'POST', path: '/api/revenue/generate-report' }, // example edge case
  { name: 'Categories', method: 'POST', path: '/api/categories' },
  { name: 'Coupons', method: 'POST', path: '/api/coupons' },
  { name: 'Banners', method: 'POST', path: '/api/banners' },
  { name: 'Knowledge Base', method: 'POST', path: '/api/knowledge-base' },
  { name: 'News', method: 'POST', path: '/api/news' },
  { name: 'FAQ', method: 'POST', path: '/api/faqs' },
  { name: 'Cashbacks', method: 'POST', path: '/api/cashbacks' },
  { name: 'Audit Logs', method: 'POST', path: '/api/audit-logs/export' }, // usually no POST for audit logs except export
  { name: 'Roles', method: 'POST', path: '/api/roles' },
  { name: 'Settings', method: 'POST', path: '/api/settings' },
  { name: 'Exchange Rates', method: 'POST', path: '/api/exchange-rates' },
  { name: 'Promotions', method: 'POST', path: '/api/promotions' },
  { name: 'Testimonials', method: 'POST', path: '/api/testimonials' },
  { name: 'Uptime SLA', method: 'POST', path: '/api/uptime' },
  { name: 'Gift Cards', method: 'POST', path: '/api/gift-cards' },
  { name: 'Newsletter', method: 'POST', path: '/api/newsletter' },
  { name: 'Permissions', method: 'POST', path: '/api/permissions' },
  { name: 'Abandoned Carts', method: 'POST', path: '/api/abandoned-carts/remind' },
  { name: 'Service SEO', method: 'PUT', path: '/api/seo/update' }
];

const BAD_PAYLOADS = [
  { description: 'Empty object', payload: {} },
  { description: 'Missing required string fields', payload: { title: null, name: undefined } },
  { description: 'Wrong data types', payload: { price: "invalid", quantity: "string_not_int" } },
  { description: 'Massive string (Buffer overflow attempt)', payload: { name: 'A'.repeat(50000) } },
  { description: 'SQL Injection attempt', payload: { search: "1' OR '1'='1" } },
  { description: 'XSS attempt', payload: { content: "<script>alert(1)</script>" } },
];

test.describe('Admin Modules - Comprehensive 400 & 500 Fuzzing', () => {
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
  });

  for (const endpoint of API_ENDPOINTS) {
    test.describe(`Module: ${endpoint.name}`, () => {
      for (const scenario of BAD_PAYLOADS) {
        test(`Should handle ${scenario.description} without 500 Error`, async () => {
          const res = await fetch(`${E2E_CONFIG.API_BASE}${endpoint.path}`, {
            method: endpoint.method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${adminTokens.accessToken}`,
            },
            body: JSON.stringify(scenario.payload),
          });

          // The core requirement: NEVER return 500 Internal Server Error
          expect(res.status).not.toBe(500);

          // We expect a 400 Bad Request (Validation failed), or 404 (if ID is missing from path), or 415/etc.
          // But it shouldn't succeed (200/201) because the payload is garbage.
          // Allowing 4xx or 204 (in case some API just ignores bad fields without crashing).
          expect(res.status).toBeGreaterThanOrEqual(400);
          expect(res.status).toBeLessThan(500);
        });
      }
    });
  }
});
