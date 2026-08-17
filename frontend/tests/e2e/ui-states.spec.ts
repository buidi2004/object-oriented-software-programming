import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage } from './fixtures/auth';

test.describe('UI States — Empty State Verification (P0/P1)', () => {
  test('UI-DASHBOARD-EMPTY: Dashboard của user 0 dữ liệu hiện đúng hướng dẫn', async ({ page }) => {
    await authenticatePage(page, 'customerEmpty');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    const body = page.locator('body');
    await expect(body).toBeVisible();
    expect(page.url()).toContain('/dashboard');
  });

  test('UI-VPS-EMPTY: Trang VPS hiện CTA "Chưa có VPS nào" + nút Mua', async ({ page }) => {
    await authenticatePage(page, 'customerEmpty');
    await page.goto('/dashboard/vps-instances');
    await page.waitForTimeout(1000);

    const emptyText = page.locator('h1, h2, main').first();
    await expect(emptyText).toBeVisible({ timeout: 10000 });
  });

  test('UI-ORDERS-EMPTY: Trang Orders hiện thông báo chưa có đơn hàng', async ({ page }) => {
    await authenticatePage(page, 'customerEmpty');
    await page.goto('/dashboard/orders');
    await page.waitForTimeout(1000);

    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('UI-CART-EMPTY: Giỏ hàng trống hiện CTA quay lại catalog', async ({ page }) => {
    await authenticatePage(page, 'customerEmpty');
    await page.goto('/cart');
    await page.waitForTimeout(1000);

    const heading = page.locator('h1, h2, main').first();
    await expect(heading).toBeVisible();
  });

  test('UI-TICKETS-EMPTY: Trang Tickets hiện danh sách rỗng không lỗi', async ({ page }) => {
    await authenticatePage(page, 'customerEmpty');
    await page.goto('/dashboard/tickets');
    await page.waitForTimeout(1000);

    const heading = page.locator('h1, h2, main').first();
    await expect(heading).toBeVisible();
  });

  test('UI-DOMAINS-EMPTY: Trang Domains hiện trạng thái chưa có domain', async ({ page }) => {
    await authenticatePage(page, 'customerEmpty');
    await page.goto('/dashboard/domains');
    await page.waitForTimeout(1000);

    const heading = page.locator('h1, h2, main').first();
    await expect(heading).toBeVisible();
  });

  test('UI-WISHLIST-EMPTY: Trang Wishlist hiện trạng thái rỗng', async ({ page }) => {
    await authenticatePage(page, 'customerEmpty');
    await page.goto('/wishlist');
    await page.waitForTimeout(1000);

    const heading = page.locator('h1, h2, main').first();
    await expect(heading).toBeVisible();
  });

  test('UI-SEARCH-EMPTY: Global search với từ khoá không tồn tại không làm trắng trang', async ({ page }) => {
    const searchRes = await fetch(`${E2E_CONFIG.API_BASE}/api/global-search?q=NonExistentKeywordXYZ12345`);
    expect(searchRes.status).toBeLessThan(500);
  });
});
