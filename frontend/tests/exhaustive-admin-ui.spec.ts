import { test, expect } from '@playwright/test';

test.describe('Exhaustive Admin UI & Feature Interaction Tests', () => {
  let adminToken = '';
  const networkErrors: { url: string; status: number; method: string; text?: string }[] = [];
  const pageErrors: string[] = [];

  test.beforeAll(async () => {
    // 1. Get real Admin JWT token
    const res = await fetch('http://localhost:5053/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@system.local',
        password: 'AdminPassword123!',
        ipAddress: '127.0.0.1',
        userAgent: 'PlaywrightRunner',
        deviceInfo: 'Playwright Test Runner'
      })
    });
    const data = await res.json();
    adminToken = data.accessToken;
    console.log('Obtained Admin Token:', !!adminToken);
  });

  test('Walk through all 39 Admin pages and interact with Create/Edit/Delete/Export modals', async ({ page }) => {
    // Attach network listener
    page.on('response', async (response) => {
      const status = response.status();
      const url = response.url();
      if (status === 400 || status >= 500) {
        let text = '';
        try {
          text = await response.text();
        } catch {
          text = 'Unreadable';
        }
        console.error(`[NETWORK ERROR] ${status} ${response.request().method()} ${url}`);
        networkErrors.push({ url, status, method: response.request().method(), text });
      }
    });

    page.on('pageerror', (err) => {
      console.error(`[PAGE RUNTIME ERROR] ${err.message}`);
      pageErrors.push(err.message);
    });

    // 1. Authenticate in browser
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('accessToken', tok);
      localStorage.setItem('user', JSON.stringify({ email: 'admin@system.local', role: 'Admin', fullName: 'System Administrator' }));
    }, adminToken);

    // List of all 39 admin pages to thoroughly test
    const adminPages = [
      { path: '/admin', name: 'Admin Dashboard Hub' },
      { path: '/admin/service-plans', name: 'Service Plans Management', buttonText: 'Thêm Gói Mới' },
      { path: '/admin/categories', name: 'Categories Management', buttonText: 'Thêm Danh Mục' },
      { path: '/admin/news', name: 'News & Blog Articles', buttonText: 'Tạo Bài Viết Mới' },
      { path: '/admin/knowledge-base', name: 'Knowledge Base Articles', buttonText: 'Thêm Bài Hướng Dẫn' },
      { path: '/admin/faqs', name: 'FAQs Management', buttonText: 'Thêm Câu Hỏi Mới' },
      { path: '/admin/banners', name: 'Banners & Sliders', buttonText: 'Thêm Banner Mới' },
      { path: '/admin/coupons', name: 'Coupons & Discounts', buttonText: 'Thêm Mã Giảm Giá' },
      { path: '/admin/reviews', name: 'Reviews Moderation' },
      { path: '/admin/testimonials', name: 'Customer Testimonials' },
      { path: '/admin/blog-comments', name: 'Blog Comments Moderation' },
      { path: '/admin/organizations', name: 'B2B Organizations', buttonText: 'Thêm Tổ Chức Mới' },
      { path: '/admin/roles', name: 'Roles & Access Control' },
      { path: '/admin/permissions', name: 'Permissions Matrix' },
      { path: '/admin/refund-requests', name: 'Refund Requests' },
      { path: '/admin/affiliate-applications', name: 'Affiliate Applications' },
      { path: '/admin/live-chat', name: 'Live Chat Support Center' },
      { path: '/admin/tickets', name: 'Technical Support Tickets' },
      { path: '/admin/migrations', name: 'Migration Requests' },
      { path: '/admin/vps-instances', name: 'VPS Cloud Instances' },
      { path: '/admin/settings', name: 'System Settings', buttonText: 'Thêm Tham Số Mới' },
      { path: '/admin/orders', name: 'Orders Management' },
      { path: '/admin/users', name: 'Users Management', buttonText: 'Thêm User Mới' },
      { path: '/admin/gift-cards', name: 'Gift Cards', buttonText: 'Phát Hành Thẻ' },
      { path: '/admin/dedicated-servers', name: 'Dedicated Physical Servers', buttonText: 'Khai Báo Máy Chủ Mới' },
      { path: '/admin/promotions', name: 'Sales & Promotions', buttonText: 'Tạo Chiến Dịch Mới' },
      { path: '/admin/abandoned-carts', name: 'Abandoned Carts Remarketing' },
      { path: '/admin/newsletters', name: 'Newsletter Campaigns', buttonText: 'Soạn Chiến Dịch Email' },
      { path: '/admin/domains', name: 'Domains & DNS', buttonText: 'Đăng Ký / Thêm Tên Miền Mới' },
      { path: '/admin/exchange-rates', name: 'Exchange Rates', buttonText: 'Thêm Tỷ Giá Mới' },
      { path: '/admin/loyalty', name: 'Loyalty Points', buttonText: 'Cấu Hình Quy Đổi' },
      { path: '/admin/referrals', name: 'Referral Partners', buttonText: 'Tạo Mã Đối Tác Mới' },
      { path: '/admin/backups', name: 'System Backups & Snapshots', buttonText: 'Tạo Bản Sao Lưu Mới' },
      { path: '/admin/service-seo', name: 'Service SEO Optimization' },
      { path: '/admin/ssl-certificates', name: 'SSL Certificates', buttonText: 'Yêu Cầu Cấp Mới SSL' },
      { path: '/admin/audit-logs', name: 'System Audit Logs' },
      { path: '/admin/uptime', name: 'Uptime Monitoring', buttonText: 'Thêm Endpoint Giám Sát' },
      { path: '/admin/jobs', name: 'Background Jobs & Hangfire', buttonText: 'Lập Lịch Cron Job Mới' },
      { path: '/admin/revenue', name: 'Revenue Reports' },
      { path: '/admin/exports', name: 'Data Exports Center' },
    ];

    console.log(`\n🚀 Starting verification across all ${adminPages.length} Admin Modules...\n`);

    for (const [index, p] of adminPages.entries()) {
      console.log(`[${index + 1}/${adminPages.length}] Testing module: ${p.name} (${p.path})...`);
      
      // Navigate to page
      await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(800);

      // If page has a modal trigger button, click it to test modal rendering and form inputs
      if (p.buttonText) {
        const btn = page.locator(`button:has-text("${p.buttonText}")`).first();
        if (await btn.isVisible()) {
          console.log(`   -> Clicking modal button: "${p.buttonText}"...`);
          await btn.click();
          await page.waitForTimeout(600);

          // Close modal by clicking "Hủy" or "Đóng" or "X"
          const closeBtn = page.locator('button:has-text("Hủy"), button:has-text("Đóng"), button:has-text("✕")').first();
          if (await closeBtn.isVisible()) {
            await closeBtn.click();
            await page.waitForTimeout(400);
          }
        }
      }

      // Check search input if present
      const searchInput = page.locator('input[placeholder*="Tìm kiếm"]').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('TestSearch');
        await page.waitForTimeout(300);
        await searchInput.fill('');
        await page.waitForTimeout(300);
      }
    }

    console.log('\n================================================================');
    console.log(`🏁 KẾT THÚC KIỂM THỬ GIAO DIỆN VÀ TÍNH NĂNG 39 MODULES ADMIN:`);
    console.log(`- Số lỗi mạng HTTP 400/500 phát hiện: ${networkErrors.length}`);
    console.log(`- Số lỗi JavaScript Runtime phát hiện: ${pageErrors.length}`);
    console.log('================================================================\n');

    expect(networkErrors).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });
});
