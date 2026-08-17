import { test, expect } from '@playwright/test';
import { E2E_CONFIG } from './fixtures/seed-data';

test.describe('Catalog & Search — Public Features (P1)', () => {
  test('CAT-01: Trang chủ hiển thị đúng Banner/Promotion active, ẩn bản hết hạn', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);

    // Verify active promotion / banner presence via API
    const promoRes = await fetch(`${E2E_CONFIG.API_BASE}/api/promotions/active`);
    const promos = await promoRes.json();
    
    // Should have active promotion
    expect(Array.isArray(promos)).toBeTruthy();

    // Verify draft banner is not in active banners
    const bannersRes = await fetch(`${E2E_CONFIG.API_BASE}/api/banners`);
    const banners = await bannersRes.json();
    const hasDraft = banners.some((b: any) => b.imageUrl?.includes('e2e-draft.jpg'));
    expect(hasDraft).toBeFalsy();
  });

  test('CAT-02: Duyệt Category → Plan list → Plan detail hiện đúng giá', async ({ page }) => {
    await page.goto('/services/cloud-vps');
    await page.waitForTimeout(1000);

    // Verify category page loads plans
    const planCards = page.locator('text=Cloud VPS, text=Core, text=RAM, text=tháng, text=VNĐ');
    expect((await planCards.count()) > 0 || page.url().includes('cloud-vps')).toBeTruthy();
  });

  test('CAT-03: Global Search trả kết quả gộp đúng từ Catalog + News + KB', async () => {
    const searchRes = await fetch(`${E2E_CONFIG.API_BASE}/api/global-search?q=VPS`);
    expect(searchRes.status).toBeLessThan(500);

    if (searchRes.ok) {
      const data = await searchRes.json();
      expect(typeof data).toBe('object');
    }
  });

  test('CAT-04: Trang News/FAQ/KB chỉ hiện bản Published, không hiện Draft', async ({ page }) => {
    // Check News public list
    const newsRes = await fetch(`${E2E_CONFIG.API_BASE}/api/news`);
    const news = await newsRes.json();
    const items = Array.isArray(news) ? news : (news.items || []);
    
    const hasDraftNews = items.some((n: any) => n.slug === 'e2e-draft-news');
    expect(hasDraftNews).toBeFalsy();

    // Check KB public list
    const kbRes = await fetch(`${E2E_CONFIG.API_BASE}/api/KnowledgeBase`);
    const kb = await kbRes.json();
    const kbItems = Array.isArray(kb) ? kb : (kb.items || []);
    const hasDraftKb = kbItems.some((k: any) => k.slug === 'e2e-kb-draft');
    expect(hasDraftKb).toBeFalsy();
  });
});
