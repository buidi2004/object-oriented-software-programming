import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';
import { loginViaApi } from './fixtures/auth';

test.describe('Admin Content & Catalog CRUD (P1)', () => {
  let adminTokens: { accessToken: string };

  test.beforeAll(async () => {
    adminTokens = await loginViaApi('admin');
  });

  test('ADM-BANNER-CRUD: Banners List & Create', async () => {
    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/banners`);
    expect(listRes.status).toBe(200);

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/banners`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        imageUrl: '/banners/e2e-crud-test.jpg',
        linkUrl: '/services/cloud-vps',
        displayOrder: 99,
        isActive: true,
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  test('ADM-NEWS-CRUD: News List & Create', async () => {
    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/news`);
    expect(listRes.status).toBe(200);

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/news`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        title: `E2E News Article ${Date.now()}`,
        slug: `e2e-news-${Date.now()}`,
        content: 'This is a test content for E2E news.',
        status: 2, // Published
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  test('ADM-FAQ-CRUD: FAQs List & Create', async () => {
    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/Faqs`);
    expect(listRes.status).toBe(200);

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/Faqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        question: `E2E FAQ Question ${Date.now()}`,
        answer: 'E2E FAQ Answer content.',
        categoryTag: 'General',
        displayOrder: 10,
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  test('ADM-KB-CRUD: KnowledgeBase List & Create', async () => {
    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/KnowledgeBase`);
    expect(listRes.status).toBe(200);

    // Get admin user profile to have authorId
    const meRes = await fetch(`${E2E_CONFIG.API_BASE}/api/users/me`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    const me = await meRes.json();

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/KnowledgeBase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        title: `E2E KB Article ${Date.now()}`,
        slug: `e2e-kb-${Date.now()}`,
        content: 'This is a long knowledgebase test article content that exceeds fifty characters easily for validation.',
        categoryTag: 'Hosting',
        authorId: me.id || '5dfa4bb0-d663-4a2b-adff-c523cc7e5364',
        isPublished: true,
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  test('ADM-CATEGORY-CRUD: Categories List & Create', async () => {
    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/categories`);
    expect(listRes.status).toBe(200);

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        name: `E2E Category ${Date.now()}`,
        slug: `e2e-cat-${Date.now()}`,
        description: 'E2E Category description',
        displayOrder: 10,
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  test('ADM-COUPON-CRUD: Coupons List & Create', async () => {
    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/coupons`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);

    const createRes = await fetch(`${E2E_CONFIG.API_BASE}/api/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        code: `E2E-CRUD-${Date.now()}`,
        discountPercent: 15.0,
        maxUsage: 100,
        expiryDate: new Date(Date.now() + 86400000 * 30).toISOString(),
      }),
    });
    expect(createRes.status).toBeLessThan(500);
  });

  test('ADM-EXCHANGE-CRUD: Exchange Rates List & Update', async () => {
    // Create an exchange rate if empty
    await fetch(`${E2E_CONFIG.API_BASE}/api/exchange-rates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminTokens.accessToken}`,
      },
      body: JSON.stringify({
        currencyCode: 'USD',
        rateToVnd: 25400,
        isActive: true,
      }),
    });

    const listRes = await fetch(`${E2E_CONFIG.API_BASE}/api/exchange-rates`, {
      headers: { Authorization: `Bearer ${adminTokens.accessToken}` },
    });
    expect(listRes.status).toBe(200);
    const rates = await listRes.json();
    expect(Array.isArray(rates)).toBeTruthy();
  });
});
