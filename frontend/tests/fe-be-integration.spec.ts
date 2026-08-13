import { test, expect } from '@playwright/test';

test.describe('Task 3.1: Gift Cards Integration', () => {
  test('should display gift card page with input field', async ({ page }) => {
    await page.goto('/dashboard/gift-cards');
    
    // Should show the page title
    await expect(page.locator('h1').first()).toContainText('Thẻ quà tặng');
    
    // Should have input field for code
    await expect(page.locator('input[placeholder="NHAP-MATYPE-CUA-BAN"]')).toBeVisible();
    
    // Should have check and redeem buttons
    await expect(page.locator('button:has-text("Kiểm tra")')).toBeVisible();
    await expect(page.locator('button:has-text("Đổi ngay")')).toBeVisible();
  });

  test('should check gift card balance via API', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/gift-cards/*/balance', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'TEST123',
          balance: 500000,
          isRedeemed: false
        })
      });
    });

    await page.goto('/dashboard/gift-cards');
    await page.fill('input[placeholder*="MA"]', 'TEST123');
    await page.click('button:has-text("Kiểm tra")');
    
    // Should show balance result
    await expect(page.locator('text=500.000')).toBeVisible();
  });

  test('should redeem gift card via API', async ({ page }) => {
    // Mock the API responses
    await page.route('**/api/gift-cards/*/balance', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ balance: 500000, isRedeemed: false })
      });
    });
    
    await page.route('**/api/gift-cards/redeem', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ remainingAmount: 0 })
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-token');
    });

    await page.goto('/dashboard/gift-cards');
    await page.fill('input[placeholder*="MA"]', 'TEST123');
    await page.click('button:has-text("Kiểm tra")');
    await page.waitForSelector('text=Đổi ngay');
    await page.click('button:has-text("Đổi ngay")');
    
    // Should show success message
    await expect(page.locator('text=Đã đổi thành công')).toBeVisible();
  });
});

test.describe('Task 3.2: Coupons Integration', () => {
  test('should display coupon input in cart', async ({ page }) => {
    // Mock cart data
    await page.route('**/api/carts/me', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ items: [
          { id: '1', title: 'VPS Basic', price: 150000 }
        ]})
      });
    });

    await page.goto('/cart');
    
    // Should show coupon section
    await expect(page.locator('text=Mã giảm giá')).toBeVisible();
  });

  test('should apply coupon and recalculate total', async ({ page }) => {
    // Mock APIs
    await page.route('**/api/carts/me', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ items: [
          { id: '1', title: 'VPS Basic', price: 150000 }
        ]})
      });
    });
    
    await page.route('**/api/coupons/active', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify([
          { code: 'SAVE10', discountType: 'percentage', discountValue: 10 }
        ])
      });
    });

    await page.goto('/cart');
    await page.fill('input[placeholder*="MÃ GIẢM GIÁ"]', 'SAVE10');
    await page.click('button:has-text("Áp dụng")');
    
    // Should show discount applied
    await expect(page.locator('text=Giảm giá').first()).toBeVisible();
    await expect(page.locator('text=15.000 đ').first()).toBeVisible();
  });
});

test.describe('FE-BE Integration Tests', () => {
  test('Control Panel should use correct API endpoint', async ({ page }) => {
    // Mock the BE API response
    await page.route('**/api/orders/*/control-panel', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          orderId: '00000000-0000-0000-0000-000000000001',
          username: 'test_user',
          url: 'https://test.vps.vn:2083',
          isActive: true
        })
      });
    });

    await page.goto('/dashboard/control-panel');
    
    // Should load without error
    await expect(page.locator('h1').first()).toContainText('Control Panel');
    
    // Should show credentials from API
    await expect(page.locator('input[readonly]').first()).toHaveValue('https://test.vps.vn:2083');
  });

  test('Recently Viewed should sync with BE API', async ({ page }) => {
    // Mock the BE API response
    await page.route('**/api/recently-viewed/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: '1',
            type: 'service',
            title: 'VPS Cloud Basic',
            description: '1 CPU, 1GB RAM',
            url: '/services/cloud-vps',
            viewedAt: new Date().toISOString()
          }
        ])
      });
    });

    await page.goto('/dashboard/recently-viewed');
    
    // Should load from API, not localStorage
    await expect(page.locator('h1').first()).toContainText('Lịch sử xem gần đây');
    
    // Should show items from API response
    await expect(page.locator('a').first()).toContainText('VPS Cloud Basic');
  });

  test('Blog post should load with correct slug', async ({ page }) => {
    await page.goto('/blog/huong-dan-cai-dat-vps');
    
    // Should display blog content
    await expect(page.locator('h1').first()).toBeVisible();
    
    // Should have back button
    await expect(page.locator('a[href="/news"]')).toBeVisible();
  });

  test('Dashboard should authenticate properly', async ({ page }) => {
    // Mock auth endpoints
    await page.route('**/api/users/me', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          email: 'test@example.com',
          fullName: 'Test User',
          role: 'user'
        })
      });
    });

    await page.addInitScript(() => {
      localStorage.setItem('accessToken', 'mock-token-123');
    });

    await page.goto('/dashboard');
    
    // Should show user info, not login prompt
    await expect(page.locator('text=Test User')).toBeVisible();
    await expect(page.locator('text=Xin chào')).toBeVisible();
  });

  test('Services page should load categories and prices from API', async ({ page }) => {
    await page.route('**/api/categories', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'cat-1', name: 'Cloud VPS', slug: 'cloud-vps' },
        ]),
      });
    });

    await page.route('**/api/categories/cloud-vps/plans*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categoryId: 'cat-1',
          categoryName: 'Cloud VPS',
          categorySlug: 'cloud-vps',
          plans: [
            {
              id: 'plan-1',
              name: 'Cloud VPS Pro',
              monthlyPrice: 650000,
              yearlyPrice: 6240000,
              currency: 'VND',
            },
          ],
        }),
      });
    });

    await page.goto('/services');

    await expect(page.locator('text=Cloud VPS Pro')).toBeVisible();
    await expect(page.locator('text=650.000')).toBeVisible();
  });

  test('Search should connect to BE API', async ({ page }) => {
    await page.route('**/api/search*', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            type: 'service',
            title: 'VPS Cloud',
            description: 'Máy chủ cloud giá rẻ',
            url: '/services/cloud-vps'
          }
        ])
      });
    });

    await page.goto('/search');
    await page.fill('input[type="text"]', 'VPS');
    await page.keyboard.press('Enter');
    
    // Wait for search results
    await expect(page.locator('text=VPS Cloud')).toBeVisible();
  });
});
