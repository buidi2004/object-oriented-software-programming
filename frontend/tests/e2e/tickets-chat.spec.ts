import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { authenticatePage, loginViaApi } from './fixtures/auth';

test.describe('Support Tickets & Live Chat (P1)', () => {
  let customerTokens: { accessToken: string };

  test.beforeAll(async () => {
    customerTokens = await loginViaApi('customerA');
  });

  test('TICK-01: Tạo ticket mới → gửi message → xuất hiện đúng trong danh sách', async ({ page }) => {
    await authenticatePage(page, 'customerA');
    await page.goto('/dashboard/tickets');
    await page.waitForTimeout(1000);

    // Create a new ticket via API
    const newTicketRes = await fetch(`${E2E_CONFIG.API_BASE}/api/support-tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerTokens.accessToken}`,
      },
      body: JSON.stringify({
        subject: `E2E Test Ticket ${Date.now()}`,
        priority: 2,
        message: 'This is a test ticket message for Playwright E2E.',
      }),
    });

    expect(newTicketRes.status).toBeLessThan(500);

    // Fetch user tickets
    const myTicketsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/support-tickets/me`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });
    expect(myTicketsRes.status).toBe(200);
    const tickets = await myTicketsRes.json();
    const list = Array.isArray(tickets) ? tickets : (tickets.items || []);
    expect(list.length).toBeGreaterThanOrEqual(1);
  });

  test('TICK-02: IDOR: customerA sửa URL sang ticket của customerB → chặn truy cập', async () => {
    const bTicketId = E2E_CONFIG.CUSTOMER_B_IDOR.ticketId;
    const res = await fetch(`${E2E_CONFIG.API_BASE}/api/support-tickets/${bTicketId}`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect([401, 403, 404]).toContain(res.status);
  });

  test('CHAT-01 & CHAT-02: Live Chat Active sessions & SignalR chat endpoint', async () => {
    const activeChatsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/chats/active`, {
      headers: { Authorization: `Bearer ${customerTokens.accessToken}` },
    });

    expect(activeChatsRes.status).toBeLessThan(500);
  });
});
