import { test, expect } from '@playwright/test';

test.describe('Missing FE Pages - Phase 4', () => {
  // Helper to setup auth via addInitScript
  async function setupAuth(page: any, role: 'Admin' | 'User') {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', role === 'Admin' ? 'mock-admin-token' : 'mock-user-token');
    });
    
    // Mock all API responses
    await page.route('/api/**', async (route: any) => {
      const url = route.request().url();
      if (url.includes('/api/users/me')) {
        await route.fulfill({ 
          json: { 
            role, 
            id: role === 'Admin' ? 'admin-id' : 'user-1', 
            fullName: role === 'Admin' ? 'Admin' : 'User',
            email: 'test@example.com'
          } 
        });
        return;
      }
      await route.fulfill({ json: [] });
    });
  }

  // Test that page loads without crashing
  async function testPageExists(page: any, path: string) {
    await setupAuth(page, path.startsWith('/admin') ? 'Admin' : 'User');
    await page.goto(path);
    
    // Wait for page to stop loading
    await page.waitForLoadState('networkidle', { timeout: 10000 });
    
    // Page should have loaded without redirecting to login
    expect(page.url()).toContain(path);
    
    // Body should have some content (not just spinner)
    const bodyText = await page.locator('body').innerText();
    expect(bodyText.length).toBeGreaterThan(10);
  }

  // ===== ADMIN PAGES =====

  test('1. Admin Exchange Rates page loads', async ({ page }) => {
    await testPageExists(page, '/admin/exchange-rates');
  });

  test('2. Admin Gift Cards page loads', async ({ page }) => {
    await testPageExists(page, '/admin/gift-cards');
  });

  test('3. Admin Promotions page loads', async ({ page }) => {
    await testPageExists(page, '/admin/promotions');
  });

  test('4. Admin Testimonials page loads', async ({ page }) => {
    await testPageExists(page, '/admin/testimonials');
  });

  test('5. Admin Newsletters page loads', async ({ page }) => {
    await testPageExists(page, '/admin/newsletters');
  });

  test('6. Admin Permissions page loads', async ({ page }) => {
    await testPageExists(page, '/admin/permissions');
  });

  test('7. Admin Service SEO page loads', async ({ page }) => {
    await testPageExists(page, '/admin/service-seo');
  });

  test('8. Admin Uptime page loads', async ({ page }) => {
    await testPageExists(page, '/admin/uptime');
  });

  test('9. Admin Abandoned Carts page loads', async ({ page }) => {
    await testPageExists(page, '/admin/abandoned-carts');
  });

  // ===== DASHBOARD PAGES =====

  test('10. Dashboard Invoices page loads', async ({ page }) => {
    await testPageExists(page, '/dashboard/invoices');
  });

  test('11. Dashboard Payments page loads', async ({ page }) => {
    await testPageExists(page, '/dashboard/payments');
  });

  test('12. Dashboard Auto Renew page loads', async ({ page }) => {
    await testPageExists(page, '/dashboard/auto-renew');
  });

  test('13. Dashboard Control Panel page loads', async ({ page }) => {
    await testPageExists(page, '/dashboard/control-panel');
  });

  test('14. Dashboard VPS Backups page loads', async ({ page }) => {
    await testPageExists(page, '/dashboard/vps-backups');
  });

  test('15. Dashboard Uptime page loads', async ({ page }) => {
    await testPageExists(page, '/dashboard/uptime');
  });

  test('16. Dashboard Recently Viewed page loads', async ({ page }) => {
    await testPageExists(page, '/dashboard/recently-viewed');
  });

  // ===== PUBLIC PAGES =====

  test('17. Global Search page loads and responds', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await page.locator('input[type="text"]').fill('vps');
    await page.keyboard.press('Enter');
    // Should show search results or "no results" message
    await expect(page.locator('body')).toContainText(/Tìm thấy|Không tìm thấy|VPS/i, { timeout: 5000 });
  });
});
