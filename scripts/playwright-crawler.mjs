import { chromium } from '@playwright/test';

async function main() {
  console.log('========================================================================================');
  console.log('🌐 BẮT ĐẦU CÀO & KIỂM THỬ GIAO DIỆN TRÌNH DUYỆT THẬT VỚI CHROMIUM (HEADLESS)');
  console.log('========================================================================================\n');

  // 1. Get Token
  const authRes = await fetch('http://localhost:5053/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@system.local',
      password: 'AdminPassword123!',
      ipAddress: '127.0.0.1',
      userAgent: 'CrawlerRunner',
      deviceInfo: 'Playwright Crawler'
    })
  });
  const authData = await authRes.json();
  const token = authData.accessToken;
  console.log('🔑 JWT Token Admin:', !!token ? 'Hợp lệ' : 'Lỗi');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const networkErrors = [];
  const jsErrors = [];

  page.on('response', async (res) => {
    const status = res.status();
    const url = res.url();
    if (status === 400 || status >= 500) {
      console.error(`  ❌ [NETWORK ERROR] ${status} ${res.request().method()} ${url}`);
      networkErrors.push({ url, status, method: res.request().method() });
    }
  });

  page.on('pageerror', (err) => {
    console.error(`  ❌ [JS RUNTIME ERROR] ${err.message}`);
    jsErrors.push(err.message);
  });

  // Inject token
  await page.goto('http://localhost:3000/');
  await page.evaluate((tok) => {
    localStorage.setItem('accessToken', tok);
    localStorage.setItem('user', JSON.stringify({ email: 'admin@system.local', role: 'Admin', fullName: 'System Administrator' }));
  }, token);

  const adminModules = [
    { path: '/admin', name: 'Admin Dashboard Hub' },
    { path: '/admin/service-plans', name: 'Gói Dịch Vụ', modalBtn: 'Thêm Gói Mới' },
    { path: '/admin/categories', name: 'Danh Mục', modalBtn: 'Thêm Danh Mục' },
    { path: '/admin/news', name: 'Tin Tức', modalBtn: 'Tạo Bài Viết Mới' },
    { path: '/admin/knowledge-base', name: 'Knowledge Base', modalBtn: 'Thêm Bài Hướng Dẫn' },
    { path: '/admin/faqs', name: 'FAQs', modalBtn: 'Thêm Câu Hỏi Mới' },
    { path: '/admin/banners', name: 'Banners', modalBtn: 'Thêm Banner Mới' },
    { path: '/admin/coupons', name: 'Coupons', modalBtn: 'Thêm Mã Giảm Giá' },
    { path: '/admin/reviews', name: 'Reviews' },
    { path: '/admin/testimonials', name: 'Testimonials' },
    { path: '/admin/blog-comments', name: 'Blog Comments' },
    { path: '/admin/organizations', name: 'Organizations B2B', modalBtn: 'Thêm Tổ Chức Mới' },
    { path: '/admin/roles', name: 'Roles' },
    { path: '/admin/permissions', name: 'Permissions' },
    { path: '/admin/refund-requests', name: 'Refund Requests' },
    { path: '/admin/affiliate-applications', name: 'Affiliate Applications' },
    { path: '/admin/live-chat', name: 'Live Chat' },
    { path: '/admin/tickets', name: 'Tickets' },
    { path: '/admin/migrations', name: 'Migrations' },
    { path: '/admin/vps-instances', name: 'VPS Instances' },
    { path: '/admin/settings', name: 'Settings', modalBtn: 'Thêm Tham Số Mới' },
    { path: '/admin/orders', name: 'Orders' },
    { path: '/admin/users', name: 'Users', modalBtn: 'Thêm User Mới' },
    { path: '/admin/gift-cards', name: 'Gift Cards', modalBtn: 'Phát Hành Thẻ' },
    { path: '/admin/dedicated-servers', name: 'Dedicated Servers', modalBtn: 'Khai Báo Máy Chủ Mới' },
    { path: '/admin/promotions', name: 'Promotions', modalBtn: 'Tạo Chiến Dịch Mới' },
    { path: '/admin/abandoned-carts', name: 'Abandoned Carts' },
    { path: '/admin/newsletters', name: 'Newsletters', modalBtn: 'Soạn Chiến Dịch Email' },
    { path: '/admin/domains', name: 'Domains', modalBtn: 'Đăng Ký / Thêm Tên Miền Mới' },
    { path: '/admin/exchange-rates', name: 'Exchange Rates', modalBtn: 'Thêm Tỷ Giá Mới' },
    { path: '/admin/loyalty', name: 'Loyalty', modalBtn: 'Cấu Hình Quy Đổi' },
    { path: '/admin/referrals', name: 'Referrals', modalBtn: 'Tạo Mã Đối Tác Mới' },
    { path: '/admin/backups', name: 'Backups', modalBtn: 'Tạo Bản Sao Lưu Mới' },
    { path: '/admin/service-seo', name: 'Service SEO' },
    { path: '/admin/ssl-certificates', name: 'SSL Certificates', modalBtn: 'Yêu Cầu Cấp Mới SSL' },
    { path: '/admin/audit-logs', name: 'Audit Logs' },
    { path: '/admin/uptime', name: 'Uptime Monitoring', modalBtn: 'Thêm Endpoint Giám Sát' },
    { path: '/admin/jobs', name: 'Background Jobs', modalBtn: 'Lập Lịch Cron Job Mới' },
    { path: '/admin/revenue', name: 'Revenue Reports' },
    { path: '/admin/exports', name: 'Data Exports' },
  ];

  for (const [i, mod] of adminModules.entries()) {
    console.log(`[${i + 1}/${adminModules.length}] 🔍 Kiểm tra trang: ${mod.name} (${mod.path})...`);
    await page.goto(`http://localhost:3000${mod.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(600);

    if (mod.modalBtn) {
      const btn = page.locator(`button:has-text("${mod.modalBtn}")`).first();
      if (await btn.isVisible()) {
        console.log(`   👉 Bấm thử nút mở modal: "${mod.modalBtn}"`);
        await btn.click();
        await page.waitForTimeout(500);

        const closeBtn = page.locator('button:has-text("Hủy"), button:has-text("Đóng"), button:has-text("✕")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(300);
        }
      }
    }
  }

  await browser.close();

  console.log('\n========================================================================================');
  console.log('📊 TỔNG KẾT KIỂM THỬ TRÊN TRÌNH DUYỆT THỰC TẾ:');
  console.log(`- Tổng số trang Admin đã tương tác: ${adminModules.length}`);
  console.log(`- Số lỗi mạng HTTP 400 hoặc 500: ${networkErrors.length}`);
  console.log(`- Số lỗi JavaScript Runtime Crash: ${jsErrors.length}`);
  console.log('========================================================================================');

  if (networkErrors.length === 0 && jsErrors.length === 0) {
    console.log('🎉 100% HOÀN HẢO! KHÔNG CÓ BẤT KỲ LỖI 400, 500 HOẶC CRASH NÀO XẢY RA!');
  } else {
    console.error('Chi tiết lỗi:', { networkErrors, jsErrors });
  }
}

main();
