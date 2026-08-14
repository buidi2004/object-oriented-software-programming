import { test, expect } from '@playwright/test';

test.describe('Admin route middleware', () => {
  test('redirects /admin to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });

  test('redirects /admin/users to login when unauthenticated', async ({ page }) => {
    await page.goto('/admin/users');
    await expect(page).toHaveURL(/\/login\?redirect=%2Fadmin%2Fusers/);
  });

  test('allows public /faqs without login', async ({ page }) => {
    await page.goto('/faqs');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /Câu hỏi thường gặp/i })).toBeVisible();
  });

  test('allows public knowledge base list without login', async ({ page }) => {
    await page.goto('/knowledge-base');
    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /Trung tâm trợ giúp/i })).toBeVisible();
  });
});
