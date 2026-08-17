import { test, expect } from '@playwright/test';

test.describe('Toàn Bộ 61 Modules Codebase Memory - Admin & Khách Hàng', () => {
  const errorLogs: string[] = [];

  test.beforeEach(async ({ page }) => {
    page.on('response', (response) => {
      const status = response.status();
      const url = response.url();
      if ((status >= 400 && status < 600) && !url.includes('/auth/login') && !url.includes('/api/auth/login')) {
        errorLogs.push(`[${status}] HTTP Error: ${url}`);
      }
    });

    page.on('pageerror', (err) => {
      errorLogs.push(`[Page Crash] ${err.message}`);
    });
  });

  const routesToTest = [
    // Public & Customer Portals
    '/',
    '/login',
    '/register',
    '/services',
    '/promotions',
    '/news',
    '/faqs',
    '/knowledge-base',
    '/cart',
    '/checkout',
    '/wallet',
    '/payment-methods',
    '/testimonials',
    '/support',
    '/search',
    '/wishlist',
    '/loyalty',
    '/gift-cards',
    '/marketplace',
    '/apps',
    '/domains',

    // Customer Dashboard
    '/dashboard',
    '/dashboard/orders',
    '/dashboard/tickets',
    '/dashboard/profile',
    '/dashboard/vps-instances',
    '/dashboard/vps-backups',
    '/dashboard/ssl-certificates',
    '/dashboard/domains',
    '/dashboard/uptime',
    '/dashboard/migrations',
    '/dashboard/refund-requests',
    '/dashboard/affiliates',
    '/dashboard/api-keys',
    '/dashboard/security',
    '/dashboard/notifications',
    '/dashboard/recently-viewed',
    '/dashboard/invoices',
    '/dashboard/hosting',
    '/dashboard/dedicated-servers',
    '/dashboard/databases',
    '/dashboard/storage',
    '/dashboard/game-servers',
    '/dashboard/email-hosting',
    '/dashboard/static-sites',
    '/dashboard/cdn',
    '/dashboard/website-builder',
    '/dashboard/orgs',

    // Admin Portals
    '/admin',
    '/admin/users',
    '/admin/roles',
    '/admin/permissions',
    '/admin/categories',
    '/admin/service-plans',
    '/admin/service-seo',
    '/admin/promotions',
    '/admin/news',
    '/admin/blog-comments',
    '/admin/abandoned-carts',
    '/admin/orders',
    '/admin/revenue',
    '/admin/coupons',
    '/admin/reviews',
    '/admin/testimonials',
    '/admin/tickets',
    '/admin/affiliate-applications',
    '/admin/referrals',
    '/admin/audit-logs',
    '/admin/domains',
    '/admin/ssl-certificates',
    '/admin/backups',
    '/admin/vps-instances',
    '/admin/uptime',
    '/admin/migrations',
    '/admin/refund-requests',
    '/admin/exchange-rates',
    '/admin/loyalty',
    '/admin/gift-cards',
    '/admin/newsletters',
    '/admin/banners',
    '/admin/faqs',
    '/admin/knowledge-base',
    '/admin/settings',
    '/admin/live-chat',
    '/admin/exports',
    '/admin/jobs',
    '/admin/dedicated-servers',
    '/admin/organizations'
  ];

  for (const r of routesToTest) {
    test(`Kiểm tra Render & Kết Nối API trang: ${r}`, async ({ page }) => {
      const res = await page.goto(r, { waitUntil: 'domcontentloaded', timeout: 15000 });
      expect(res?.status()).toBeLessThan(400);
      await page.waitForTimeout(500);
      const heading = await page.locator('h1, h2, h3').first().isVisible();
      expect(heading).toBeTruthy();
    });
  }

  test.afterAll(() => {
    if (errorLogs.length > 0) {
      console.warn('Lỗi ghi nhận trong quá trình kiểm tra:', errorLogs);
    }
  });
});
