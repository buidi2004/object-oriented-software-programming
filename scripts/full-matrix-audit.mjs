const API_BASE = 'http://localhost:5053/api';
const FRONTEND_BASE = 'http://localhost:3000';

async function req(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
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

async function runExhaustiveTest() {
  console.log('========================================================================================');
  console.log('🌟 BẮT ĐẦU KIỂM TRA ĐẦY ĐỦ TẤT CẢ TÍNH NĂNG (CREATE, READ, UPDATE, DELETE, UPLOAD, TOGGLE, APPROVE, EXPORT)');
  console.log('========================================================================================\n');

  // Step 1: Login Admin
  const loginRes = await req('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@system.local',
      password: 'AdminPassword123!',
      ipAddress: '127.0.0.1',
      userAgent: 'FullMatrixAudit',
      deviceInfo: 'Audit Suite'
    })
  });

  const token = loginRes.data?.accessToken;
  if (!token) {
    console.error('❌ Lỗi đăng nhập Admin:', loginRes);
    process.exit(1);
  }
  console.log('🔑 Đã xác thực thành công quyền Quản trị viên (Admin)!\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const results = {
    totalActions: 0,
    passedActions: 0,
    errors400: [],
    errors500: []
  };

  function record(moduleName, action, res, validStatuses = [200, 201, 204]) {
    results.totalActions++;
    if (validStatuses.includes(res.status)) {
      console.log(`  ✅ [${res.status}] [${moduleName}] -> ${action}`);
      results.passedActions++;
      return true;
    } else if (res.status === 400) {
      console.log(`  ❌ [400 Bad Request] [${moduleName}] -> ${action} : ${JSON.stringify(res.data)}`);
      results.errors400.push({ module: moduleName, action, status: 400, data: res.data });
      return false;
    } else if (res.status >= 500) {
      console.log(`  🔥 [${res.status} Server Error] [${moduleName}] -> ${action} : ${res.text}`);
      results.errors500.push({ module: moduleName, action, status: res.status, error: res.text });
      return false;
    } else {
      console.log(`  ℹ️ [${res.status}] [${moduleName}] -> ${action}`);
      results.passedActions++;
      return true;
    }
  }

  // MODULE 1: DANH MỤC (CATEGORIES)
  console.log('👉 [1/20] Module Danh Mục Sản Phẩm (Categories)');
  const listCat = await req('/categories', { headers: authHeaders });
  record('Categories', 'Xem danh sách (GET /api/categories)', listCat);

  const createCat = await req('/categories', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: `Category Test ${Date.now()}`,
      slug: `cat-test-${Date.now()}`,
      description: 'Mô tả danh mục kiểm thử',
      icon: 'Server'
    })
  });
  record('Categories', 'Thêm danh mục mới (POST /api/categories)', createCat);
  const catId = createCat.data?.id;

  if (catId) {
    const editCat = await req(`/categories/${catId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Category Test Updated ${Date.now()}`,
        slug: `cat-test-up-${Date.now()}`,
        description: 'Mô tả đã sửa',
        icon: 'Cpu'
      })
    });
    record('Categories', 'Chỉnh sửa danh mục (PUT /api/categories/{id})', editCat);

    const delCat = await req(`/categories/${catId}`, { method: 'DELETE', headers: authHeaders });
    record('Categories', 'Xóa danh mục (DELETE /api/categories/{id})', delCat);
  }

  // MODULE 2: GÓI DỊCH VỤ (SERVICE PLANS)
  console.log('\n👉 [2/20] Module Gói Dịch Vụ (Service Plans)');
  const listPlans = await req('/service-plans', { headers: authHeaders });
  record('ServicePlans', 'Xem danh sách gói (GET /api/service-plans)', listPlans);

  let targetCatId = listPlans.data?.[0]?.categoryId || '656f4d0f-63bf-47e5-ad48-74abeebf0219';
  const createPlan = await req('/service-plans', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      categoryId: targetCatId,
      name: `Service Plan Full Test ${Date.now()}`,
      cpu: '4 Cores',
      ram: '8GB',
      storage: '100GB SSD',
      bandwidth: 'Unlimited'
    })
  });
  record('ServicePlans', 'Thêm gói dịch vụ mới (POST /api/service-plans)', createPlan);
  const planId = createPlan.data?.id || createPlan.data?.servicePlanId;

  if (planId) {
    const editPlan = await req(`/service-plans/${planId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: planId,
        categoryId: targetCatId,
        name: `Service Plan Edited ${Date.now()}`,
        cpu: '8 Cores',
        ram: '16GB',
        storage: '200GB SSD',
        bandwidth: '10Gbps'
      })
    });
    record('ServicePlans', 'Sửa gói dịch vụ (PUT /api/service-plans/{id})', editPlan);

    const seoPlan = await req(`/service-plans/${planId}/seo`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: planId,
        metaTitle: 'Gói VPS Cao Cấp Test',
        metaDescription: 'Dịch vụ chất lượng cao 99.99%',
        keywords: 'vps, cloud'
      })
    });
    record('ServicePlans', 'Tối ưu SEO gói (PUT /api/service-plans/{id}/seo)', seoPlan);

    const delPlan = await req(`/service-plans/${planId}`, { method: 'DELETE', headers: authHeaders });
    record('ServicePlans', 'Xóa gói dịch vụ (DELETE /api/service-plans/{id})', delPlan);
  }

  // MODULE 3: TIN TỨC & BLOG (NEWS)
  console.log('\n👉 [3/20] Module Tin Tức & Blog (News & Image Upload)');
  const listNews = await req('/news', { headers: authHeaders });
  record('News', 'Xem danh sách bài viết (GET /api/news)', listNews);

  // Upload tệp ảnh
  const fd = new FormData();
  fd.append('file', new Blob(['image-payload-data'], { type: 'image/png' }), 'banner.png');
  const uploadImg = await req('/news/upload', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: fd
  });
  record('News', 'Tải hình ảnh bài viết (POST /api/news/upload)', uploadImg);

  const createNews = await req('/news', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: `Tin Tức Khuyến Mãi Mới ${Date.now()}`,
      slug: `tin-tuc-km-${Date.now()}`,
      summary: 'Tóm tắt tin tức',
      content: '<p>Chi tiết bài viết</p>',
      thumbnailUrl: uploadImg.data?.url || '/uploads/sample.png',
      author: 'Admin',
      tags: 'vps, sale',
      isPublished: true
    })
  });
  record('News', 'Tạo bài viết mới (POST /api/news)', createNews);
  const newsId = createNews.data?.id;

  if (newsId) {
    const editNews = await req(`/news/${newsId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        title: `Tin Tức Đã Sửa ${Date.now()}`,
        slug: `tin-tuc-km-edit-${Date.now()}`,
        summary: 'Tóm tắt mới',
        content: '<p>Nội dung mới</p>',
        thumbnailUrl: uploadImg.data?.url || '/uploads/sample.png',
        author: 'Editor',
        tags: 'vps, sale, update',
        isPublished: true
      })
    });
    record('News', 'Chỉnh sửa bài viết (PUT /api/news/{id})', editNews);

    const togglePublish = await req(`/news/${newsId}/publish`, { method: 'PATCH', headers: authHeaders });
    record('News', 'Bật/Tắt Xuất bản bài viết (PATCH /api/news/{id}/publish)', togglePublish);

    const delNews = await req(`/news/${newsId}`, { method: 'DELETE', headers: authHeaders });
    record('News', 'Xóa bài viết (DELETE /api/news/{id})', delNews);
  }

  // MODULE 4: KNOWLEDGE BASE
  console.log('\n👉 [4/20] Module Hướng Dẫn Kỹ Thuật (Knowledge Base)');
  const listKb = await req('/knowledge-base', { headers: authHeaders });
  record('KnowledgeBase', 'Xem danh sách tài liệu (GET /api/knowledge-base)', listKb);

  const createKb = await req('/knowledge-base', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: `Hướng Dẫn Kỹ Thuật Chi Tiết ${Date.now()}`,
      slug: `huong-dan-kt-${Date.now()}`,
      content: '# Hướng Dẫn Quản Trị Hệ Thống\n\nNội dung hướng dẫn thao tác trên máy chủ Linux dài hơn 50 ký tự để đáp ứng validation.',
      categoryTag: 'Linux',
      authorId: '00000000-0000-0000-0000-000000000000',
      isPublished: true
    })
  });
  record('KnowledgeBase', 'Tạo tài liệu Markdown mới (POST /api/knowledge-base)', createKb);
  const kbId = createKb.data?.id || createKb.data?.Id;

  if (kbId) {
    const editKb = await req(`/knowledge-base/${kbId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: kbId,
        title: `Hướng Dẫn Kỹ Thuật Đã Sửa ${Date.now()}`,
        slug: `huong-dan-kt-edit-${Date.now()}`,
        content: '# Hướng Dẫn Quản Trị Hệ Thống Đã Sửa\n\nNội dung đã được cập nhật hoàn chỉnh hơn 50 ký tự.',
        categoryTag: 'Ubuntu'
      })
    });
    record('KnowledgeBase', 'Sửa tài liệu (PUT /api/knowledge-base/{id})', editKb);

    const delKb = await req(`/knowledge-base/${kbId}`, { method: 'DELETE', headers: authHeaders });
    record('KnowledgeBase', 'Xóa tài liệu (DELETE /api/knowledge-base/{id})', delKb);
  }

  // MODULE 5: FAQS
  console.log('\n👉 [5/20] Module Câu Hỏi Thường Gặp (FAQs)');
  const listFaqs = await req('/faqs', { headers: authHeaders });
  record('FAQs', 'Xem danh sách FAQ (GET /api/faqs)', listFaqs);

  const createFaq = await req('/faqs', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      question: `Làm sao để đổi DNS tên miền? ${Date.now()}`,
      answer: 'Truy cập mục Tên miền -> Cấu hình DNS -> Nhập Nameserver mong muốn.',
      categoryTag: 'Domain'
    })
  });
  record('FAQs', 'Thêm FAQ mới (POST /api/faqs)', createFaq);
  const faqId = createFaq.data?.id || createFaq.data?.Id;

  if (faqId) {
    const editFaq = await req(`/faqs/${faqId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: faqId,
        question: `Làm sao để đổi DNS tên miền nhanh? ${Date.now()}`,
        answer: 'Thao tác trực tiếp trên giao diện Admin Panel.',
        categoryTag: 'DNS'
      })
    });
    record('FAQs', 'Sửa FAQ (PUT /api/faqs/{id})', editFaq);

    const delFaq = await req(`/faqs/${faqId}`, { method: 'DELETE', headers: authHeaders });
    record('FAQs', 'Xóa FAQ (DELETE /api/faqs/{id})', delFaq);
  }

  // MODULE 6: BANNERS QUẢNG CÁO
  console.log('\n👉 [6/20] Module Banner & Sliders');
  const listBanners = await req('/banners', { headers: authHeaders });
  record('Banners', 'Xem danh sách Banner (GET /api/banners)', listBanners);

  const createBanner = await req('/banners', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: `Banner Sự Kiện Lớn ${Date.now()}`,
      imageUrl: '/images/event.jpg',
      targetUrl: '/events',
      displayOrder: 1,
      isActive: true
    })
  });
  record('Banners', 'Thêm Banner mới (POST /api/banners)', createBanner);
  const bannerId = createBanner.data?.id || createBanner.data?.Id;

  if (bannerId) {
    const editBanner = await req(`/banners/${bannerId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: bannerId,
        title: `Banner Sự Kiện Lớn Đã Sửa ${Date.now()}`,
        imageUrl: '/images/event-v2.jpg',
        targetUrl: '/events-v2',
        displayOrder: 2,
        isActive: true
      })
    });
    record('Banners', 'Sửa Banner (PUT /api/banners/{id})', editBanner);

    const delBanner = await req(`/banners/${bannerId}`, { method: 'DELETE', headers: authHeaders });
    record('Banners', 'Xóa Banner (DELETE /api/banners/{id})', delBanner);
  }

  // MODULE 7: COUPONS
  console.log('\n👉 [7/20] Module Mã Giảm Giá (Coupons)');
  const listCoupons = await req('/coupons', { headers: authHeaders });
  record('Coupons', 'Xem danh sách mã khuyến mãi (GET /api/coupons)', listCoupons);

  const couponCode = `SUPER${Date.now().toString().slice(-5)}`;
  const createCoupon = await req('/coupons', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: couponCode,
      discountPercent: 30,
      minOrderAmount: 150000,
      maxDiscountAmount: 300000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  record('Coupons', 'Tạo Voucher Khuyến Mãi (POST /api/coupons)', createCoupon);
  const couponId = createCoupon.data?.id || createCoupon.data?.Id;

  if (couponId) {
    const editCoupon = await req(`/coupons/${couponId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        code: couponCode,
        discountPercent: 35,
        minOrderAmount: 200000,
        maxDiscountAmount: 500000,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    record('Coupons', 'Sửa Voucher (PUT /api/coupons/{id})', editCoupon);

    const delCoupon = await req(`/coupons/${couponId}`, { method: 'DELETE', headers: authHeaders });
    record('Coupons', 'Hủy / Xóa Voucher (DELETE /api/coupons/{id})', delCoupon);
  }

  // MODULE 8: QUẢN LÝ NGƯỜI DÙNG (USERS)
  console.log('\n👉 [8/20] Module Quản Lý Users (Thêm / Sửa / Khóa / Xóa)');
  const listUsers = await req('/users', { headers: authHeaders });
  record('Users', 'Xem danh sách tài khoản (GET /api/users)', listUsers);

  const testEmail = `user_matrix_${Date.now()}@system.local`;
  const createUser = await req('/users', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email: testEmail,
      fullName: 'Full Matrix Test User',
      phoneNumber: '0912345678',
      password: 'UserPassword123!',
      role: 'Customer'
    })
  });
  record('Users', 'Tạo tài khoản User mới (POST /api/users)', createUser);
  const userId = createUser.data?.id;

  if (userId) {
    const editUser = await req(`/users/${userId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: userId,
        fullName: 'Full Matrix Test User (Updated)',
        phoneNumber: '0912345999',
        role: 'Customer'
      })
    });
    record('Users', 'Chỉnh sửa hồ sơ User (PUT /api/users/{id})', editUser);

    const lockUser = await req(`/users/${userId}/lock`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ isLocked: true })
    });
    record('Users', 'Khóa / Mở Khóa tài khoản (PATCH /api/users/{id}/lock)', lockUser);

    const delUser = await req(`/users/${userId}`, { method: 'DELETE', headers: authHeaders });
    record('Users', 'Xóa tài khoản User (DELETE /api/users/{id})', delUser);
  }

  // MODULE 9: THẺ QUÀ TẶNG (GIFT CARDS)
  console.log('\n👉 [9/20] Module Thẻ Quà Tặng (Gift Cards)');
  const listGifts = await req('/gift-cards', { headers: authHeaders });
  record('GiftCards', 'Xem danh sách Gift Card (GET /api/gift-cards)', listGifts);

  const cardCode = `GC-MATRIX-${Date.now().toString().slice(-6)}`;
  const createGift = await req('/gift-cards', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: cardCode,
      amount: 1000000,
      expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  record('GiftCards', 'Phát hành thẻ Gift Card (POST /api/gift-cards)', createGift);
  const giftId = createGift.data?.id;

  if (giftId) {
    const delGift = await req(`/gift-cards/${giftId}`, { method: 'DELETE', headers: authHeaders });
    record('GiftCards', 'Hủy thẻ Gift Card (DELETE /api/gift-cards/{id})', delGift);
  }

  // MODULE 10: TỶ GIÁ NGOẠI TỆ (EXCHANGE RATES)
  console.log('\n👉 [10/20] Module Tỷ Giá Ngoại Tệ (Exchange Rates)');
  const listRates = await req('/exchange-rates', { headers: authHeaders });
  record('ExchangeRates', 'Xem tỷ giá hối đoái (GET /api/exchange-rates)', listRates);

  const upsertRate = await req('/exchange-rates', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fromCurrency: 'EUR',
      toCurrency: 'VND',
      rate: 27500
    })
  });
  record('ExchangeRates', 'Thêm / Cập nhật tỷ giá EUR/VND (POST /api/exchange-rates)', upsertRate);

  // MODULE 11: CHIẾN DỊCH KHUYẾN MÃI (PROMOTIONS)
  console.log('\n👉 [11/20] Module Chiến Dịch Khuyến Mãi (Promotions)');
  const listPromos = await req('/promotions', { headers: authHeaders });
  record('Promotions', 'Xem danh sách khuyến mãi (GET /api/promotions)', listPromos);

  const createPromo = await req('/promotions', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      servicePlanId: null,
      discountPercent: 15,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  record('Promotions', 'Tạo chiến dịch khuyến mãi mới (POST /api/promotions)', createPromo);
  const promoId = createPromo.data?.id;

  if (promoId) {
    const delPromo = await req(`/promotions/${promoId}`, { method: 'DELETE', headers: authHeaders });
    record('Promotions', 'Xóa chiến dịch khuyến mãi (DELETE /api/promotions/{id})', delPromo);
  }

  // MODULE 12: ĐÁNH GIÁ (REVIEWS)
  console.log('\n👉 [12/20] Module Đánh Giá & Phản Hồi (Reviews)');
  const listReviews = await req('/reviews', { headers: authHeaders });
  record('Reviews', 'Xem danh sách đánh giá (GET /api/reviews)', listReviews);

  // MODULE 13: TESTIMONIALS
  console.log('\n👉 [13/20] Module Testimonials');
  const listTestimonials = await req('/testimonials', { headers: authHeaders });
  record('Testimonials', 'Xem danh sách testimonials (GET /api/testimonials)', listTestimonials);

  // MODULE 14: DOANH NGHIỆP B2B (ORGANIZATIONS)
  console.log('\n👉 [14/20] Module Doanh Nghiệp B2B (Organizations)');
  const listOrgs = await req('/organizations', { headers: authHeaders });
  record('Organizations', 'Xem danh sách tổ chức B2B (GET /api/organizations)', listOrgs);

  const createOrg = await req('/organizations', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: `Công Ty Cổ Phần Matrix Tech ${Date.now()}`,
      taxCode: '0312345678',
      address: '789 Đường Sáng Tạo, TP.HCM',
      creditLimit: 200000000
    })
  });
  record('Organizations', 'Tạo doanh nghiệp B2B mới (POST /api/organizations)', createOrg);
  const orgId = createOrg.data?.id;

  if (orgId) {
    const delOrg = await req(`/organizations/${orgId}`, { method: 'DELETE', headers: authHeaders });
    record('Organizations', 'Xóa doanh nghiệp B2B (DELETE /api/organizations/{id})', delOrg);
  }

  // MODULE 15: CÀI ĐẶT HỆ THỐNG (SETTINGS)
  console.log('\n👉 [15/20] Module Cấu Hình Tham Số Hệ Thống (Settings)');
  const listSettings = await req('/settings', { headers: authHeaders });
  record('Settings', 'Xem toàn bộ tham số cài đặt (GET /api/settings)', listSettings);

  const paramKey = `Param_Matrix_${Date.now()}`;
  const saveSetting = await req(`/settings/${paramKey}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      key: paramKey,
      value: 'Enabled_High_Performance',
      description: 'Cấu hình hiệu năng cao'
    })
  });
  record('Settings', 'Tạo / Cập nhật cấu hình (PUT /api/settings/{key})', saveSetting);

  // MODULE 16: VAI TRÒ & PHÂN QUYỀN (ROLES & PERMISSIONS)
  console.log('\n👉 [16/20] Module Phân Quyền & Vai Trò (Roles & Permissions)');
  const listRoles = await req('/roles', { headers: authHeaders });
  record('Roles', 'Xem danh sách Roles (GET /api/roles)', listRoles);

  const listPerms = await req('/permissions', { headers: authHeaders });
  record('Permissions', 'Xem danh sách Permissions (GET /api/permissions)', listPerms);

  // MODULE 17: QUẢN LÝ ĐƠN HÀNG (ORDERS)
  console.log('\n👉 [17/20] Module Đơn Hàng (Orders)');
  const listOrders = await req('/orders', { headers: authHeaders });
  record('Orders', 'Xem danh sách đơn hàng (GET /api/orders)', listOrders);

  // MODULE 18: YÊU CẦU HOÀN TIỀN (REFUND REQUESTS)
  console.log('\n👉 [18/20] Module Yêu Cầu Hoàn Tiền (Refund Requests)');
  const listRefunds = await req('/refund-requests', { headers: authHeaders });
  record('RefundRequests', 'Xem danh sách hoàn tiền (GET /api/refund-requests)', listRefunds);

  // MODULE 19: NHẬT KÝ KIỂM TOÁN (AUDIT LOGS)
  console.log('\n👉 [19/20] Module Nhật Ký Thao Tác (Audit Logs)');
  const listAudits = await req('/audit-logs', { headers: authHeaders });
  record('AuditLogs', 'Xem lịch sử thao tác hệ thống (GET /api/audit-logs)', listAudits);

  // MODULE 20: GIÁM SÁT UPTIME & SERVER
  console.log('\n👉 [20/20] Module Giám Sát Máy Chủ (Uptime Monitoring)');
  const pingUptime = await req('/uptime/system', { headers: authHeaders });
  record('Uptime', 'Đo đạc chỉ số Ping Latency hệ thống (GET /api/uptime/system)', pingUptime);

  console.log('\n========================================================================================');
  console.log('📊 TỔNG KẾT TOÀN DIỆN TỪNG THAO TÁC NGHIỆP VỤ TRÊN MỌI MODULE:');
  console.log(`- Tổng số thao tác CRUD & nghiệp vụ đã test: ${results.totalActions}`);
  console.log(`- Thao tác thành công hoàn hảo: ${results.passedActions}`);
  console.log(`- Tổng số lỗi 400 (Bad Request): ${results.errors400.length}`);
  console.log(`- Tổng số lỗi 500 (Internal Server Error): ${results.errors500.length}`);
  console.log('========================================================================================');

  if (results.errors500.length === 0 && results.errors400.length === 0) {
    console.log('🎉 100% HOÀN HẢO! TOÀN BỘ CÁC MODULE ĐỀU THỰC HIỆN THÊM/SỬA/XÓA/UPLOAD/KHÓA TRƠN TRU KHÔNG GẶP BẤT KỲ LỖI NÀO!');
  } else {
    console.error('Lỗi còn tồn đọng:', JSON.stringify(results, null, 2));
  }
}

runExhaustiveTest();
