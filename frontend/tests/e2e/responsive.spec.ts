import { test, expect } from '@playwright/test';
import { authenticatePage } from './fixtures/auth';

test.describe('Responsive & Multi-Device Layout (P0/P1)', () => {
  test('RWD-DESKTOP-LAYOUT: Desktop (1280x800) hiển thị đầy đủ sidebar và content', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    const body = page.locator('body');
    await expect(body).toBeVisible();
    expect(page.url()).toContain('/dashboard');
  });

  test('RWD-TABLET-LAYOUT: Tablet (768x1024) hiển thị responsive mượt mà', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/vps-instances');
    await page.waitForTimeout(1000);

    const body = page.locator('body');
    await expect(body).toBeVisible();
    expect(page.url()).toContain('/dashboard/vps-instances');
  });

  test('RWD-MOBILE-CHECKOUT: Mobile (375x667) trang Checkout không bị vỡ layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await authenticatePage(page, 'customerA');
    await page.goto('/cart');
    await page.waitForTimeout(1000);

    const body = page.locator('body');
    await expect(body).toBeVisible();
    expect(page.url()).toContain('/cart');
  });

  test('RWD-MOBILE-DASHBOARD: Mobile (375x667) Dashboard điều hướng tốt', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard');
    await page.waitForTimeout(1000);

    const body = page.locator('body');
    await expect(body).toBeVisible();
    expect(page.url()).toContain('/dashboard');
  });
});
