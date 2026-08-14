import { test, expect } from '@playwright/test';

test.describe('Customer FE Modules - Mock UI Tests', () => {
  
  test('1. Promotions page should display mock promotions', async ({ page }) => {
    await page.goto('/promotions');
    await expect(page.locator('h1')).toContainText('Chương Trình Khuyến Mãi');
    
    // Check if the mock promotions are rendered
    const promoCards = page.locator('.grid > div');
    await expect(promoCards).toHaveCount(3);
    await expect(page.getByText('Khuyến mãi Hè 2024 - Giảm 50% Cloud VPS')).toBeVisible();
    await expect(page.getByText('GIẢM 50%')).toBeVisible();
  });

  test('2. Dashboard Refund Requests should allow mock creation', async ({ page }) => {
    await page.goto('/dashboard/refund-requests');
    await expect(page.locator('h1')).toContainText('Yêu cầu hoàn tiền');
    
    // Check initial mock data
    await expect(page.getByText('REF-1001')).toBeVisible();
    
    // Create new request (Mock)
    await page.click('button:has-text("Tạo yêu cầu mới")');
    await page.fill('input[placeholder="VD: ORD-1234"]', 'ORD-9999');
    await page.fill('input[type="number"]', '200000');
    await page.fill('textarea', 'Test reason');
    await page.click('button[type="submit"]');
    
    // Check if added to list
    await expect(page.getByText('ORD-9999')).toBeVisible();
    await expect(page.getByText('Test reason')).toBeVisible();
  });

  test('3. Dashboard Reviews should display and allow mock deletion', async ({ page }) => {
    await page.goto('/dashboard/reviews');
    await expect(page.locator('h1')).toContainText('Đánh giá của tôi');
    
    // Check initial mock data
    await expect(page.getByText('Cloud VPS Enterprise - 4GB RAM')).toBeVisible();
    
    // Mock delete
    page.on('dialog', dialog => dialog.accept());
    const deleteButtons = page.locator('button:has(svg.lucide-trash2)');
    await deleteButtons.first().click();
    
    // Should have 1 review left
    const reviewCards = page.locator('.grid > div');
    await expect(reviewCards).toHaveCount(1);
  });

  test('4. Footer Newsletter should show mock success message', async ({ page }) => {
    await page.goto('/');
    
    const emailInput = page.locator('input[placeholder="Nhập email của bạn..."]');
    await emailInput.fill('test@example.com');
    await page.click('button:has-text("Đăng ký")');
    
    // Mock delay is 500ms
    await expect(page.getByText('Cảm ơn bạn đã đăng ký!')).toBeVisible({ timeout: 2000 });
  });

  test('5. Blog Comments should allow posting a mock comment', async ({ page }) => {
    // Navigate to a fake blog post slug
    await page.goto('/blog/huong-dan-vps');
    
    // Wait for mock data to load (500ms delay in component)
    await expect(page.locator('h1')).toContainText('Hướng dẫn cài đặt VPS', { timeout: 2000 });
    
    // Scroll to comments
    await expect(page.getByText('Bình luận (2)')).toBeVisible();
    
    // Post new comment
    await page.fill('textarea[placeholder="Viết bình luận của bạn..."]', 'Hay quá admin ơi');
    await page.click('button[type="submit"]');
    
    // Check if comment is added
    await expect(page.getByText('Hay quá admin ơi')).toBeVisible();
    await expect(page.getByText('Bình luận (3)')).toBeVisible();
  });

  test('6. Live Chat Widget should have automated bot response', async ({ page }) => {
    await page.goto('/');
    
    // Open chat
    await page.locator('.fixed.bottom-6.right-6 button').click();
    
    // Check welcome message
    await expect(page.getByText('Xin chào! Tôi là Trợ lý AI')).toBeVisible();
    
    // Send message
    await page.fill('input[placeholder="Nhập tin nhắn tư vấn..."]', 'Cho hỏi về tên miền');
    await page.click('form.p-3 button[type="submit"]');
    
    // Check user message
    await expect(page.getByText('Cho hỏi về tên miền')).toBeVisible();
    
    // Check bot response (Mock delay is 800ms)
    await expect(page.getByText('Tên miền quốc tế .COM chỉ 290k/năm')).toBeVisible({ timeout: 2000 });
  });

  test('7. Header Currency Switcher should update UI state', async ({ page }) => {
    await page.goto('/');
    
    // Default is VND
    const currencyBtn = page.locator('.hidden.sm\\:block button').first();
    await expect(currencyBtn).toContainText('VND');
    
    // Change to USD
    await currencyBtn.click();
    await page.click('button:has-text("USD ($)")');
    
    // Should update to USD
    await expect(currencyBtn).toContainText('USD');
  });

});
