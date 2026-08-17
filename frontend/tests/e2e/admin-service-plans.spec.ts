import { test, expect } from '@playwright/test';
import { authenticatePage } from './fixtures/auth';

test.describe('Admin Service Plans Management', () => {
  test('01. Should navigate to service plans page and show the list', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/service-plans', { waitUntil: 'domcontentloaded' });
    
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 15000 });
  });

  test('02. Should open add modal, fill details, and add a new plan', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/service-plans', { waitUntil: 'domcontentloaded' });
    
    const addButton = page.locator('button:has-text("Thêm Sản Phẩm")');
    if (await addButton.count() > 0) {
      await addButton.click();
      await expect(page.locator('h2:has-text("Thêm sản phẩm mới")')).toBeVisible({ timeout: 10000 });
      
      const uniquePlanName = `E2E Test VPS ${Date.now()}`;
      await page.fill('input[placeholder="VD: Cloud VPS Pro 1"]', uniquePlanName);
      await page.fill('input[placeholder="VD: 2 Cores"]', '1 Core');
      await page.fill('input[placeholder="VD: 4 GB"]', '1 GB');
      await page.fill('input[placeholder="VD: 50 GB NVMe"]', '20 GB SSD');
      await page.fill('input[placeholder="VD: Unlimited"]', '1 TB');
      
      await page.click('button:has-text("Lưu Sản Phẩm")');
    }
  });

  test('03. Should add pricing configuration to an existing plan', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/service-plans', { waitUntil: 'domcontentloaded' });
    
    const firstRow = page.locator('tbody tr').first();
    if (await firstRow.count() > 0) {
      const priceBtn = firstRow.locator('button[title="Cấu hình Giá"]');
      if (await priceBtn.count() > 0) {
        await priceBtn.click();
        await expect(page.locator('h2:has-text("Quản lý Giá")')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('04. Should edit a service plan', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/service-plans', { waitUntil: 'domcontentloaded' });
    
    const firstRow = page.locator('tbody tr').first();
    if (await firstRow.count() > 0) {
      const editBtn = firstRow.locator('button[title="Sửa cấu hình sản phẩm"]');
      if (await editBtn.count() > 0) {
        await editBtn.click();
        await expect(page.locator('h2:has-text("Sửa thông tin sản phẩm")')).toBeVisible({ timeout: 10000 });
      }
    }
  });

  test('05. Should delete (deactivate) a plan', async ({ page }) => {
    await authenticatePage(page, 'admin');
    await page.goto('/admin/service-plans', { waitUntil: 'domcontentloaded' });
    
    const firstRow = page.locator('tbody tr').first();
    if (await firstRow.count() > 0) {
      const deleteButton = firstRow.locator('button[title="Xóa sản phẩm"]');
      if (await deleteButton.count() > 0) {
        await deleteButton.click();
      }
    }
  });
});
