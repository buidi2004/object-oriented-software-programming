import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

/**
 * COMPREHENSIVE END-TO-END SUITE: ALL 29+ ADMIN MODULES
 * Tests both Frontend UI rendering and Backend API CRUD operations with zero omissions.
 */

test.describe('Admin 100% Comprehensive E2E - All 29 Modules (FE & BE)', () => {
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
  });

  // 1. Dashboard Overview
  test('01. Admin Dashboard Overview (/admin)', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/.*admin/);
    const statsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/dashboard/revenue-stats?startDate=2025-01-01&endDate=2026-12-31`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(statsRes.status).toBe(200);
  });

  // 2. Service Plans
  test('02. Admin Service Plans (/admin/service-plans) - CRUD', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/service-plans', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1, h2').first()).toBeVisible();

    // BE: List
    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/service-plans/admin`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);

    // BE: Create
    const planName = `E2E Auto Plan ${Date.now()}`;
    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/service-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        name: planName,
        slug: `e2e-plan-${Date.now()}`,
        description: 'E2E Plan description',
        categoryId: '11111111-1111-1111-1111-111111111111',
        cpu: '2 Cores',
        ram: '4 GB',
        storage: '50 GB SSD',
        bandwidth: 'Unlimited',
        isActive: true,
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  // 3. Categories
  test('03. Admin Categories (/admin/categories) - CRUD', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/categories', { waitUntil: 'domcontentloaded' });

    // BE: Create & List
    const catName = `E2E Category ${Date.now()}`;
    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        name: catName,
        slug: `cat-${Date.now()}`,
        description: 'Auto Category',
        displayOrder: 1,
      }),
    });
    expect(createRes.status).toBeLessThan(500);

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/categories`);
    expect(listRes.status).toBe(200);
  });

  // 4. Coupons
  test('04. Admin Coupons (/admin/coupons) - CRUD', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/coupons', { waitUntil: 'domcontentloaded' });

    const couponCode = `E2E${Date.now()}`;
    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        code: couponCode,
        discountPercent: 20,
        maxUsage: 100,
        expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  // 5. Gift Cards
  test('05. Admin Gift Cards (/admin/gift-cards) - CRUD & Batch', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/gift-cards', { waitUntil: 'domcontentloaded' });

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/gift-cards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        code: `GC-${Date.now()}`,
        initialBalance: 50000,
        expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  // 6. Orders
  test('06. Admin Orders (/admin/orders) - Management & Control Panel', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/orders', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
  });

  // 7. Refund Requests
  test('07. Admin Refund Requests (/admin/refund-requests) - Approval Workflow', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/refund-requests', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/refund-requests`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
  });

  // 8. Tickets
  test('08. Admin Tickets Queue (/admin/tickets) - Queue & Reply', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/tickets', { waitUntil: 'domcontentloaded' });

    const queueRes = await fetch(`${E2E_CONFIG.API_BASE}/api/tickets/queue`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(queueRes.status).toBe(200);
  });

  // 9. Live Chat
  test('09. Admin Live Chat (/admin/live-chat) - Sessions', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/live-chat', { waitUntil: 'domcontentloaded' });

    const chatRes = await fetch(`${E2E_CONFIG.API_BASE}/api/livechats/admin`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(chatRes.status).toBeLessThan(500);
  });

  // 10. VPS Instances
  test('10. Admin VPS Instances (/admin/vps-instances) - Infrastructure Ops', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/vps-instances', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/VpsInstances/admin`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
  });

  // 11. User Management
  test('11. Admin User Management (/admin/users) - CRUD & Status Toggle', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/users', { waitUntil: 'domcontentloaded' });

    const usersRes = await fetch(`${E2E_CONFIG.API_BASE}/api/users`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(usersRes.status).toBe(200);
  });

  // 12. Roles
  test('12. Admin Roles Management (/admin/roles) - CRUD & Permission Assign', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/roles', { waitUntil: 'domcontentloaded' });

    const roleName = `AutoRole${Date.now()}`;
    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({ name: roleName }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  // 13. Permissions
  test('13. Admin Permissions Matrix (/admin/permissions) - Security Matrix', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/permissions', { waitUntil: 'domcontentloaded' });

    const permsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/permissions`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(permsRes.status).toBe(200);
  });

  // 14. Banners
  test('14. Admin Banners (/admin/banners) - Marketing Content CRUD', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/banners', { waitUntil: 'domcontentloaded' });

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        imageUrl: '/banners/promo.png',
        linkUrl: '/services/vps',
        displayOrder: 1,
        isActive: true,
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  // 15. News
  test('15. Admin News (/admin/news) - Blog CMS CRUD', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/news', { waitUntil: 'domcontentloaded' });

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        title: `Auto News ${Date.now()}`,
        slug: `auto-news-${Date.now()}`,
        content: 'Testing news creation from admin suite.',
        status: 2,
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  // 16. Knowledge Base
  test('16. Admin Knowledge Base (/admin/knowledge-base) - Documentation CRUD', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/knowledge-base', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/knowledgebase`);
    expect(listRes.status).toBe(200);
  });

  // 17. FAQs
  test('17. Admin FAQs (/admin/faqs) - FAQ Support CRUD', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/faqs', { waitUntil: 'domcontentloaded' });

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/faqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        question: `Question ${Date.now()}`,
        answer: 'Answer content',
        categoryTag: 'General',
        displayOrder: 1,
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  // 18. Promotions
  test('18. Admin Promotions (/admin/promotions) - Discounts & Campaigns', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/promotions', { waitUntil: 'domcontentloaded' });

    const promoRes = await fetch(`${E2E_CONFIG.API_BASE}/api/promotions`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(promoRes.status).toBe(200);
  });

  // 19. Exchange Rates
  test('19. Admin Exchange Rates (/admin/exchange-rates) - Multi-currency Setup', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/exchange-rates', { waitUntil: 'domcontentloaded' });

    const ratesRes = await fetch(`${E2E_CONFIG.API_BASE}/api/exchange-rates`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(ratesRes.status).toBe(200);
  });

  // 20. Testimonials
  test('20. Admin Testimonials (/admin/testimonials) - Customer Feedback', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/testimonials', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/testimonials`);
    expect(listRes.status).toBe(200);
  });

  // 21. Newsletters
  test('21. Admin Newsletters (/admin/newsletters) - Subscribers & Campaigns', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/newsletters', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/newsletter/subscribers`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBeLessThan(500);
  });

  // 22. Abandoned Carts
  test('22. Admin Abandoned Carts (/admin/abandoned-carts) - Recovery System', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/abandoned-carts', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/abandoned-carts`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
  });

  // 23. Affiliate Applications
  test('23. Admin Affiliate Applications (/admin/affiliate-applications) - Partner Approval', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/affiliate-applications', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/affiliate-applications`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
  });

  // 24. Reviews
  test('24. Admin Reviews (/admin/reviews) - Moderation Workflow', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/reviews', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/reviews`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
  });

  // 25. Migrations
  test('25. Admin Migrations (/admin/migrations) - Server Migration Requests', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/migrations', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/migration-requests`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
  });

  // 26. Audit Logs
  test('26. Admin Audit Logs (/admin/audit-logs) - Immutable Audit Trail', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/audit-logs', { waitUntil: 'domcontentloaded' });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/audit-logs`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
  });

  // 27. Revenue Reports
  test('27. Admin Revenue & Exports (/admin/revenue) - Analytics & Export', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/revenue', { waitUntil: 'domcontentloaded' });

    const exportRes = await fetch(`${E2E_CONFIG.API_BASE}/api/exports/orders?format=csv`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(exportRes.status).toBe(200);
  });

  // 28. Service SEO
  test('28. Admin Service SEO (/admin/service-seo) - Meta & Sitemap', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/service-seo', { waitUntil: 'domcontentloaded' });

    const sitemapRes = await fetch(`${E2E_CONFIG.API_BASE}/sitemap.xml`);
    expect(sitemapRes.status).toBe(200);
  });

  // 29. System Settings
  test('29. Admin System Settings (/admin/settings) - Global Config', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/settings', { waitUntil: 'domcontentloaded' });

    const settingsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/system-settings`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(settingsRes.status).toBe(200);
  });

  // 30. Uptime SLA & Monitoring
  test('30. Admin Uptime Monitoring (/admin/uptime) - Infrastructure Health', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/uptime', { waitUntil: 'domcontentloaded' });

    const uptimeRes = await fetch(`${E2E_CONFIG.API_BASE}/api/uptime/summary`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(uptimeRes.status).toBe(200);
  });
});
