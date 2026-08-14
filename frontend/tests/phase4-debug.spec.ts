import { test, expect } from '@playwright/test';

test.describe('Missing FE Pages - Phase 4 Debug', () => {
  test('debug detailed', async ({ page }) => {
    const errors: string[] = [];
    const logs: string[] = [];
    
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'warning') {
        errors.push(`[${msg.type()}] ${msg.text()}`);
      } else {
        logs.push(`${msg.type()}: ${msg.text()}`);
      }
    });
    
    // Set auth BEFORE navigation
    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-admin-token');
    });
    
    await page.goto('/admin/exchange-rates');
    await page.waitForTimeout(5000);
    
    console.log('=== PAGE INFO ===');
    console.log('URL:', page.url());
    console.log('Title:', await page.title());
    
    // Check for JS errors
    if (errors.length > 0) {
      console.log('=== ERRORS ===');
      errors.forEach(e => console.log(e));
    }
    
    // Check for console logs
    if (logs.length > 0) {
      console.log('=== LOGS ===');
      logs.slice(-20).forEach(l => console.log(l));
    }
    
    // Get HTML content
    const html = await page.content();
    console.log('HTML length:', html.length);
    
    // Check specific elements
    const h1Count = await page.locator('h1').count();
    console.log('H1 count:', h1Count);
    
    const spinnerCount = await page.locator('.animate-spin').count();
    console.log('Spinner count:', spinnerCount);
    
    // Take screenshot
    await page.screenshot({ path: '/tmp/debug-detailed.png', fullPage: true });
    
    // Check if redirected
    if (page.url().includes('/login')) {
      console.log('REDIRECTED TO LOGIN!');
    }
  });
});
