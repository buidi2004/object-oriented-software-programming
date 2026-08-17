import { test, expect } from '@playwright/test';
import fs from 'fs';

test('Crawl UI and find 500 errors', async ({ page }) => {
  const errors500: any[] = [];

  page.on('response', async (response) => {
    if (response.status() >= 500) {
      const url = response.url();
      let text = '';
      try {
        text = await response.text();
      } catch (e) {
        text = 'Could not read response text';
      }
      console.error(`[500 ERROR] Network Request: ${response.status()} ${response.request().method()} ${url}`);
      errors500.push({ url, status: response.status(), method: response.request().method(), text });
    }
  });

  console.log('Fetching auth token via API...');
  const res = await fetch('http://localhost:5053/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testadmin@system.local', password: 'Password123!', deviceInfo: 'E2E' })
  });
  const data = await res.json();
  const token = data.accessToken;

  // Inject token
  await page.goto('/');
  await page.evaluate((token) => {
    localStorage.setItem('accessToken', token);
  }, token);

  const pagesToVisit = [
    '/dashboard',
    '/dashboard/wallet',
    '/dashboard/orders',
    '/dashboard/vps-instances',
    '/dashboard/tickets',
    '/admin',
    '/admin/users',
    '/admin/orders',
    '/admin/vps-instances',
    '/admin/live-chat',
    '/admin/settings',
    '/services/cloud-vps',
    '/cart',
    '/checkout'
  ];

  for (const p of pagesToVisit) {
    console.log(`Visiting ${p}...`);
    await page.goto(p, { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.error(`Error navigating to ${p}:`, e.message));
    await page.waitForTimeout(1000); // give it time to fetch
  }

  console.log('\n--- FRONTEND TEST SUMMARY ---');
  console.log(`Total pages visited: ${pagesToVisit.length}`);
  console.log(`Total 500+ network errors found: ${errors500.length}`);
  
  fs.writeFileSync('frontend-500-errors.json', JSON.stringify(errors500, null, 2));

  if (errors500.length > 0) {
    console.log('List of UI 500 errors saved to frontend-500-errors.json');
    errors500.forEach(e => console.log(`- [${e.status}] ${e.method} ${e.url}`));
  }
});
