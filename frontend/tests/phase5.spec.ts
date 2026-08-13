import { test, expect } from '@playwright/test';

test.describe('E2E Shop Flow - Phase 5', () => {

  // Helper to mock API responses for our new flows
  async function setupMocks(page: any) {
    await page.route('/api/**', async (route: any) => {
      const url = route.request().url();
      
      if (url.includes('/api/categories/vps/plans')) {
        await route.fulfill({
          json: {
            categoryName: "VPS",
            plans: [
              { id: "vps-1", name: "VPS Basic", monthlyPrice: 100000, yearlyPrice: 1000000, attributes: { cpu: "1 Core", ram: "1 GB" } },
              { id: "vps-2", name: "VPS Pro", monthlyPrice: 200000, yearlyPrice: 2000000, attributes: { cpu: "2 Core", ram: "2 GB" } }
            ]
          }
        });
        return;
      }
      
      if (url.includes('/api/categories')) {
        await route.fulfill({
          json: [
            { id: "cat-1", slug: "vps", name: "VPS Hosting", description: "Máy chủ ảo" }
          ]
        });
        return;
      }

      if (url.includes('/api/service-plans/vps-1')) {
        await route.fulfill({
          json: {
            id: "vps-1",
            name: "VPS Basic",
            description: "Gói cơ bản",
            monthlyPrice: 100000,
            yearlyPrice: 1000000,
            attributes: { cpu: "1 Core", ram: "1 GB" }
          }
        });
        return;
      }

      if (url.includes('/api/service-plans/vps-2')) {
        await route.fulfill({
          json: {
            id: "vps-2",
            name: "VPS Pro",
            description: "Gói nâng cao",
            monthlyPrice: 200000,
            yearlyPrice: 2000000,
            attributes: { cpu: "2 Core", ram: "2 GB" }
          }
        });
        return;
      }

      if (url.includes('/api/domains/check')) {
        await route.fulfill({
          json: { isAvailable: true }
        });
        return;
      }

      // Default mock for cart
      if (url.includes('/api/carts/me')) {
        await route.fulfill({ json: { items: [] } });
        return;
      }
      if (url.includes('/api/carts/items')) {
        await route.fulfill({ json: { success: true } });
        return;
      }

      await route.fulfill({ json: {} });
    });
  }

  test.beforeEach(async ({ page }) => {
    await setupMocks(page);
  });

  test('1. Dynamic Landing Page (Category)', async ({ page }) => {
    await page.goto('/services/vps');
    await expect(page.locator('h1').first()).toContainText('VPS Hosting', { timeout: 10000 });
  });

  test('2. Plan Detail & Add to Cart Flow', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-token-for-e2e');
    });

    await page.goto('/services/plans/vps-1');
    await expect(page.getByRole('heading', { name: 'VPS Basic' })).toBeVisible({ timeout: 10000 });

    const buyButton = page.getByRole('button', { name: /Thêm vào giỏ hàng/i });
    await expect(buyButton).toBeVisible();
    await buyButton.click();

    await page.waitForURL('**/cart', { timeout: 10000 });
    expect(page.url()).toContain('/cart');
  });

  test('3. Compare Plans Flow', async ({ page }) => {
    await page.goto('/services/compare?plans=vps-1,vps-2');
    await expect(page.locator('h3', { hasText: 'VPS Basic' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h3', { hasText: 'VPS Pro' })).toBeVisible({ timeout: 10000 });
    
    // Click buy button for VPS Basic
    const buyButton = page.locator('button', { hasText: 'Đăng Ký Ngay' }).first();
    await expect(buyButton).toBeVisible();
    await buyButton.click();
    
    // Should navigate to /cart
    await page.waitForURL('**/cart', { timeout: 10000 });
    expect(page.url()).toContain('/cart');
  });

  test('4. Domain Search Flow', async ({ page }) => {
    await page.goto('/domains/search');
    
    // Fill the input
    const input = page.locator('input[type="text"]');
    await input.fill('cloudhost.vn');
    
    // Submit the form
    await page.locator('button[type="submit"]').click();
    
    // Wait for the result to show up
    await expect(page.locator('text=cloudhost.vn')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Tên miền này đang khả dụng!')).toBeVisible({ timeout: 10000 });
    
    // Click add to cart
    const buyButton = page.locator('button', { hasText: 'Thêm vào giỏ' });
    await expect(buyButton).toBeVisible();
    await buyButton.click();
    
    // Should navigate to /cart
    await page.waitForURL('**/cart', { timeout: 10000 });
    expect(page.url()).toContain('/cart');
  });
});
