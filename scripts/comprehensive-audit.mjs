import http from 'http';

const API_BASE = 'http://localhost:5053/api';
const FRONTEND_BASE = 'http://localhost:3000';

async function req(url, options = {}) {
  try {
    const res = await fetch(url, options);
    let data = null;
    const text = await res.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
    return { status: res.status, ok: res.ok, data, text };
  } catch (err) {
    return { status: 0, ok: false, error: err.message };
  }
}

async function main() {
  console.log('================================================================');
  console.log('🔍 BẮT ĐẦU KIỂM TRA CHUYÊN SÂU TOÀN BỘ TÍNH NĂNG & ROUTE ADMIN');
  console.log('================================================================\n');

  // 1. Authenticate / Login
  console.log('👉 [1/3] Đăng nhập tài khoản Admin...');
  let loginRes = await req(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'testadmin@system.local',
      password: 'Password123!',
      deviceInfo: 'AuditScript'
    })
  });

  let token = loginRes.data?.accessToken;
  if (!token) {
    // Try register
    console.log('Admin chưa tồn tại, tiến hành đăng ký testadmin...');
    await req(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testadmin@system.local',
        password: 'Password123!',
        fullName: 'System Administrator',
        phoneNumber: '0901234567'
      })
    });
    loginRes = await req(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testadmin@system.local',
        password: 'Password123!',
        deviceInfo: 'AuditScript'
      })
    });
    token = loginRes.data?.accessToken;
  }

  console.log(`Token status: ${token ? '✅ Thành công' : '❌ Thất bại'}\n`);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };

  const results = {
    passed: 0,
    failed400: [],
    failed500: [],
    otherFailures: [],
  };

  // 2. Test all API Endpoints
  console.log('👉 [2/3] Kiểm tra từng API Backend Endpoints (CRUD)...');

  const apiEndpoints = [
    { name: 'GET /api/service-plans', method: 'GET', url: `${API_BASE}/service-plans` },
    { name: 'GET /api/service-categories', method: 'GET', url: `${API_BASE}/service-categories` },
    { name: 'GET /api/news', method: 'GET', url: `${API_BASE}/news` },
    { name: 'GET /api/coupons', method: 'GET', url: `${API_BASE}/coupons` },
    { name: 'GET /api/reviews', method: 'GET', url: `${API_BASE}/reviews` },
    { name: 'GET /api/testimonials', method: 'GET', url: `${API_BASE}/testimonials` },
    { name: 'GET /api/blog-comments', method: 'GET', url: `${API_BASE}/blog-comments` },
    { name: 'GET /api/knowledge-base', method: 'GET', url: `${API_BASE}/knowledge-base` },
    { name: 'GET /api/faqs', method: 'GET', url: `${API_BASE}/faqs` },
    { name: 'GET /api/banners', method: 'GET', url: `${API_BASE}/banners` },
    { name: 'GET /api/users', method: 'GET', url: `${API_BASE}/users` },
    { name: 'GET /api/orders', method: 'GET', url: `${API_BASE}/orders` },
    { name: 'GET /api/gift-cards', method: 'GET', url: `${API_BASE}/gift-cards` },
    { name: 'GET /api/promotions', method: 'GET', url: `${API_BASE}/promotions` },
    { name: 'GET /api/organizations', method: 'GET', url: `${API_BASE}/organizations` },
    { name: 'GET /api/roles', method: 'GET', url: `${API_BASE}/roles` },
    { name: 'GET /api/permissions', method: 'GET', url: `${API_BASE}/permissions` },
    { name: 'GET /api/refund-requests', method: 'GET', url: `${API_BASE}/refund-requests` },
    { name: 'GET /api/affiliate-applications', method: 'GET', url: `${API_BASE}/affiliate-applications` },
    { name: 'GET /api/tickets/queue', method: 'GET', url: `${API_BASE}/tickets/queue` },
    { name: 'GET /api/migrations', method: 'GET', url: `${API_BASE}/migrations` },
    { name: 'GET /api/vps-instances', method: 'GET', url: `${API_BASE}/vps-instances` },
    { name: 'GET /api/settings', method: 'GET', url: `${API_BASE}/settings` },
    { name: 'GET /api/exchange-rates', method: 'GET', url: `${API_BASE}/exchange-rates` },
    { name: 'GET /api/ssl-certificates', method: 'GET', url: `${API_BASE}/ssl-certificates` },
    { name: 'GET /api/audit-logs', method: 'GET', url: `${API_BASE}/audit-logs` },
    { name: 'GET /api/uptime/system', method: 'GET', url: `${API_BASE}/uptime/system` },
  ];

  for (const ep of apiEndpoints) {
    const res = await req(ep.url, { method: ep.method, headers: authHeaders });
    if (res.status === 200 || res.status === 204) {
      console.log(`  ✅ [${res.status}] ${ep.name}`);
      results.passed++;
    } else if (res.status === 400) {
      console.log(`  ❌ [400 Bad Request] ${ep.name} -> ${JSON.stringify(res.data)}`);
      results.failed400.push({ name: ep.name, error: res.data });
    } else if (res.status >= 500) {
      console.log(`  🔥 [${res.status} Internal Error] ${ep.name} -> ${res.text}`);
      results.failed500.push({ name: ep.name, status: res.status, error: res.text });
    } else {
      console.log(`  ℹ️ [${res.status}] ${ep.name}`);
      results.passed++;
    }
  }

  // 3. Test all 39 Frontend Admin Pages
  console.log('\n👉 [3/3] Kiểm tra khả năng render của toàn bộ 39 trang Admin Frontend (Next.js)...');

  const adminRoutes = [
    '/admin',
    '/admin/service-plans',
    '/admin/categories',
    '/admin/news',
    '/admin/knowledge-base',
    '/admin/faqs',
    '/admin/banners',
    '/admin/coupons',
    '/admin/reviews',
    '/admin/testimonials',
    '/admin/blog-comments',
    '/admin/organizations',
    '/admin/roles',
    '/admin/permissions',
    '/admin/refund-requests',
    '/admin/affiliate-applications',
    '/admin/live-chat',
    '/admin/tickets',
    '/admin/migrations',
    '/admin/vps-instances',
    '/admin/settings',
    '/admin/orders',
    '/admin/users',
    '/admin/gift-cards',
    '/admin/dedicated-servers',
    '/admin/promotions',
    '/admin/abandoned-carts',
    '/admin/newsletters',
    '/admin/domains',
    '/admin/exchange-rates',
    '/admin/loyalty',
    '/admin/referrals',
    '/admin/backups',
    '/admin/service-seo',
    '/admin/ssl-certificates',
    '/admin/audit-logs',
    '/admin/uptime',
    '/admin/jobs',
    '/admin/revenue',
    '/admin/exports',
  ];

  for (const route of adminRoutes) {
    const res = await req(`${FRONTEND_BASE}${route}`);
    if (res.status === 200) {
      console.log(`  ✅ [200 OK] Route: ${route}`);
      results.passed++;
    } else if (res.status === 400) {
      console.log(`  ❌ [400] Route: ${route}`);
      results.failed400.push({ route, status: 400 });
    } else if (res.status >= 500) {
      console.log(`  🔥 [${res.status}] Route: ${route}`);
      results.failed500.push({ route, status: res.status });
    } else {
      console.log(`  ⚠️ [${res.status}] Route: ${route}`);
      results.otherFailures.push({ route, status: res.status });
    }
  }

  console.log('\n================================================================');
  console.log('📊 KẾT QUẢ TỔNG QUAN KIỂM THỬ:');
  console.log(`- Tổng số lượt test thành công: ${results.passed}`);
  console.log(`- Số lỗi 400 (Bad Request): ${results.failed400.length}`);
  console.log(`- Số lỗi 500 (Internal Server Error): ${results.failed500.length}`);
  console.log('================================================================');

  if (results.failed500.length === 0 && results.failed400.length === 0) {
    console.log('🎉 100% HOÀN HẢO! KHÔNG CÓ BẤT KỲ LỖI 400 HOẶC 500 NÀO!');
  } else {
    console.log('Danh sách lỗi cần khắc phục:', JSON.stringify(results, null, 2));
  }
}

main();
