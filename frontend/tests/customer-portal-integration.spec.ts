import { test, expect } from '@playwright/test';

test.describe('Customer Frontend & Dashboard Comprehensive Integration Verification', () => {
  let customerToken = '';
  const networkErrors: { url: string; status: number; method: string; text?: string }[] = [];
  const pageErrors: string[] = [];

  test.beforeAll(async () => {
    // 1. Create/Login a real Customer account
    const email = `customer_e2e_${Date.now()}@system.local`;
    const password = 'CustomerPass123!';

    // Register
    await fetch('http://localhost:5053/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        fullName: 'E2E Test Customer',
        phoneNumber: '0901234567'
      })
    });

    // Login
    const loginRes = await fetch('http://localhost:5053/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        ipAddress: '127.0.0.1',
        userAgent: 'CustomerPlaywrightRunner',
        deviceInfo: 'Customer E2E Agent'
      })
    });

    const loginData = await loginRes.json();
    customerToken = loginData.accessToken;
    console.log('Customer JWT Token generated:', !!customerToken);
  });

  test('Walk through all Customer Public & Dashboard Pages with interactive checks', async ({ page }) => {
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
        console.error(`[CUSTOMER NETWORK ERROR] ${status} ${response.request().method()} ${url}`);
        networkErrors.push({ url, status, method: response.request().method(), text });
      }
    });

    page.on('pageerror', (err) => {
      console.error(`[CUSTOMER JS RUNTIME ERROR] ${err.message}`);
      pageErrors.push(err.message);
    });

    // Set Customer session in browser
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await page.evaluate((tok) => {
      localStorage.setItem('accessToken', tok);
      localStorage.setItem('user', JSON.stringify({ email: 'customer@system.local', role: 'Customer', fullName: 'E2E Test Customer' }));
    }, customerToken);

    // List of customer routes
    const customerPages = [
      // Public User Portal
      { path: '/', name: 'Trang Chủ Khách Hàng (Home)' },
      { path: '/services', name: 'Bảng Giá & Gói Dịch Vụ' },
      { path: '/categories', name: 'Danh Mục Sản Phẩm' },
      { path: '/news', name: 'Tin Tức & Thông Báo' },
      { path: '/knowledge-base', name: 'Tài Liệu Hướng Dẫn Kỹ Thuật' },
      { path: '/faqs', name: 'Câu Hỏi Thường Gặp (FAQs)' },
      { path: '/promotions', name: 'Khuyến Mãi & Giảm Giá' },
      { path: '/coupons', name: 'Kho Mã Giảm Giá' },
      { path: '/testimonials', name: 'Khách Hàng Đánh Giá' },
      { path: '/domains', name: 'Tra Cứu & Đăng Ký Tên Miền' },
      { path: '/marketplace', name: 'Marketplace Tiện Ích Mở Rộng' },
      { path: '/cart', name: 'Giỏ Hàng Mua Sắm' },
      { path: '/checkout', name: 'Thanh Toán Đơn Hàng' },
      { path: '/wallet', name: 'Ví Điện Tử & Nạp Tiền' },
      { path: '/gift-cards', name: 'Nạp Thẻ Gift Card' },
      { path: '/loyalty', name: 'Điểm Thưởng & Đổi Quà' },
      { path: '/support', name: 'Trung Tâm Trợ Giúp' },
      { path: '/wishlist', name: 'Danh Sách Yêu Thích' },

      // Customer Dashboard Portal
      { path: '/dashboard', name: 'Dashboard Tổng Quan Khách Hàng' },
      { path: '/dashboard/vps-instances', name: 'Quản Lý Máy Chủ VPS' },
      { path: '/dashboard/orders', name: 'Lịch Sử Đơn Hàng' },
      { path: '/dashboard/invoices', name: 'Hóa Đơn & Chứng Từ' },
      { path: '/dashboard/tickets', name: 'Yêu Cầu Hỗ Trợ (Tickets)' },
      { path: '/dashboard/refund-requests', name: 'Yêu Cầu Hoàn Tiền' },
      { path: '/dashboard/ssl-certificates', name: 'Chứng Chỉ Bảo Mật SSL' },
      { path: '/dashboard/vps-backups', name: 'Bản Sao Lưu (Backups)' },
      { path: '/dashboard/databases', name: 'Cơ Sở Dữ Liệu Managed DB' },
      { path: '/dashboard/storage', name: 'Object Storage (S3 Buckets)' },
      { path: '/dashboard/cdn', name: 'Mạng Phân Phối CDN' },
      { path: '/dashboard/game-servers', name: 'Máy Chủ Game Chuyên Dụng' },
      { path: '/dashboard/static-sites', name: 'Static Site Hosting' },
      { path: '/dashboard/email-hosting', name: 'Hộp Thư Doanh Nghiệp' },
      { path: '/dashboard/website-builder', name: 'Công Cụ Thiết Kế Web' },
      { path: '/dashboard/security', name: 'Bảo Mật WAF & Quét Mã Độc' },
      { path: '/dashboard/affiliates', name: 'Tiếp Thị Liên Kết (Affiliate)' },
      { path: '/dashboard/api-keys', name: 'Khóa API Cho Lập Trình Viên' },
      { path: '/dashboard/auto-renew', name: 'Cấu Hình Tự Động Gia Hạn' },
      { path: '/dashboard/notifications', name: 'Cài Đặt Nhận Thông Báo' },
      { path: '/dashboard/profile', name: 'Hồ Sơ & Bảo Mật 2 Lớp' },
      { path: '/dashboard/recently-viewed', name: 'Sản Phẩm Đã Xem Gần Đây' },
      { path: '/dashboard/uptime', name: 'Trạng Thái Hoạt Động Hệ Thống' }
    ];

    console.log(`\n🚀 Bắt đầu kiểm tra ${customerPages.length} trang Người Dùng & Khách Hàng...\n`);

    for (const [index, p] of customerPages.entries()) {
      console.log(`[${index + 1}/${customerPages.length}] 🔍 Truy cập & tương tác: ${p.name} (${p.path})...`);
      
      await page.goto(`http://localhost:3000${p.path}`, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(600);

      // Interact with buttons like "Xem ngay", "Chi tiết", "Tìm kiếm", "Bộ lọc"
      const actionButton = page.locator('button:visible').first();
      if (await actionButton.isVisible()) {
        const btnText = (await actionButton.textContent()) || '';
        if (!btnText.includes('Đăng xuất') && !btnText.includes('Xóa')) {
          await actionButton.hover();
          await page.waitForTimeout(200);
        }
      }
    }

    console.log('\n================================================================');
    console.log(`🏁 KẾT QUẢ KIỂM THỬ KHÁCH HÀNG & DASHBOARD TOÀN DIỆN:`);
    console.log(`- Số lỗi mạng HTTP 400/500: ${networkErrors.length}`);
    console.log(`- Số lỗi JavaScript Runtime: ${pageErrors.length}`);
    console.log('================================================================\n');

    expect(networkErrors).toHaveLength(0);
    expect(pageErrors).toHaveLength(0);
  });
});
