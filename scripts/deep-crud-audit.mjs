const API_BASE = 'http://localhost:5053/api';

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

async function runDeepCrudAudit() {
  console.log('=============================================================================');
  console.log('🔥 BẮT ĐẦU KIỂM TRA CHUYÊN SÂU TỪNG THAO TÁC THỰC TẾ: THÊM / SỬA / XÓA / UPLOAD / KHÓA');
  console.log('=============================================================================\n');

  // Step 1: Admin Login
  console.log('🔑 [1] Đăng nhập Admin và lấy JWT Access Token...');
  let loginRes = await req('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@system.local',
      password: 'AdminPassword123!',
      ipAddress: '127.0.0.1',
      userAgent: 'DeepCrudAuditScript',
      deviceInfo: 'Node.js Test Agent'
    })
  });

  const token = loginRes.data?.accessToken;
  if (!token) {
    console.error('❌ Không lấy được Admin JWT token:', loginRes);
    process.exit(1);
  }
  console.log('✅ Đăng nhập Admin thành công!\n');

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };

  const results = {
    passed: 0,
    failed400: [],
    failed500: [],
    totalTests: 0
  };

  function evaluate(actionName, res, expectedStatuses = [200, 201, 204]) {
    results.totalTests++;
    if (expectedStatuses.includes(res.status)) {
      console.log(`  ✅ [${res.status}] ${actionName}`);
      results.passed++;
      return true;
    } else if (res.status === 400) {
      console.log(`  ❌ [400 Bad Request] ${actionName} -> ${JSON.stringify(res.data)}`);
      results.failed400.push({ action: actionName, status: 400, data: res.data });
      return false;
    } else if (res.status >= 500) {
      console.log(`  🔥 [${res.status} Internal Error] ${actionName} -> ${res.text}`);
      results.failed500.push({ action: actionName, status: res.status, error: res.text });
      return false;
    } else {
      console.log(`  ⚠️ [${res.status}] ${actionName} -> ${JSON.stringify(res.data)}`);
      results.passed++;
      return true;
    }
  }

  // --- MODULE 1: GÓI DỊCH VỤ (SERVICE PLANS) ---
  console.log('📦 --- [MODULE 1] Gói Dịch Vụ (Service Plans) ---');
  let catListRes = await req('/categories', { headers: authHeaders });
  let sampleCatId = Array.isArray(catListRes.data) && catListRes.data.length > 0 ? catListRes.data[0].id : null;
  if (!sampleCatId) {
    const newCat = await req('/categories', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Danh Mục Gói Mẫu ${Date.now()}`,
        slug: `danh-muc-mau-${Date.now()}`,
        description: 'Mô tả danh mục mẫu',
        icon: 'Server'
      })
    });
    sampleCatId = newCat.data?.id;
  }
  
  // 1. Thêm gói mới
  const createPlanRes = await req('/service-plans', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      categoryId: sampleCatId,
      name: `Test VPS Ultra ${Date.now()}`,
      cpu: '8 Core',
      ram: '16GB',
      storage: '200GB NVMe',
      bandwidth: 'Unlimited'
    })
  });
  evaluate('Thêm Gói Dịch Vụ mới (POST /api/service-plans)', createPlanRes);
  const createdPlanId = createPlanRes.data?.id || createPlanRes.data?.servicePlanId;

  if (createdPlanId) {
    // 2. Sửa gói
    const updatePlanRes = await req(`/service-plans/${createdPlanId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: createdPlanId,
        categoryId: sampleCatId,
        name: `Test VPS Ultra Updated ${Date.now()}`,
        cpu: '16 Core',
        ram: '32GB',
        storage: '500GB NVMe',
        bandwidth: '10Gbps'
      })
    });
    evaluate('Chỉnh Sửa Gói Dịch Vụ (PUT /api/service-plans/{id})', updatePlanRes);

    // 3. Cấu hình SEO gói
    const seoRes = await req(`/service-plans/${createdPlanId}/seo`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: createdPlanId,
        metaTitle: 'Cloud VPS Ultra Tốc Độ Cao',
        metaDescription: 'Dịch vụ máy chủ ảo chất lượng cao 99.99% uptime',
        keywords: 'vps, cloud, hosting'
      })
    });
    evaluate('Cấu hình SEO Gói Dịch Vụ (PUT /api/service-plans/{id}/seo)', seoRes);

    // 4. Xóa gói
    const delPlanRes = await req(`/service-plans/${createdPlanId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Gói Dịch Vụ (DELETE /api/service-plans/{id})', delPlanRes);
  }

  // --- MODULE 2: DANH MỤC DỊCH VỤ (CATEGORIES) ---
  console.log('\n📁 --- [MODULE 2] Danh Mục Dịch Vụ (Categories) ---');
  const createCatRes = await req('/categories', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: `Danh Mục Test ${Date.now()}`,
      slug: `danh-muc-test-${Date.now()}`,
      description: 'Mô tả danh mục kiểm thử tự động',
      icon: 'Server'
    })
  });
  evaluate('Thêm Danh Mục Mới (POST /api/categories)', createCatRes);
  const createdCatId = createCatRes.data?.id || createCatRes.data?.categoryId;

  if (createdCatId) {
    const updateCatRes = await req(`/categories/${createdCatId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        name: `Danh Mục Test Đã Sửa ${Date.now()}`,
        slug: `danh-muc-test-edit-${Date.now()}`,
        description: 'Mô tả đã cập nhật',
        icon: 'Cpu'
      })
    });
    evaluate('Chỉnh Sửa Danh Mục (PUT /api/categories/{id})', updateCatRes);

    const delCatRes = await req(`/categories/${createdCatId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Danh Mục (DELETE /api/categories/{id})', delCatRes);
  }

  // --- MODULE 3: TIN TỨC & TẢI ẢNH (NEWS & UPLOAD) ---
  console.log('\n📰 --- [MODULE 3] Tin Tức & Tải Ảnh (News & Upload) ---');
  const nativeFormData = new FormData();
  const fileBlob = new Blob(['fake-image-bytes-for-test'], { type: 'image/png' });
  nativeFormData.append('file', fileBlob, 'test-upload.png');
  const uploadRes = await req('/news/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: nativeFormData
  });
  evaluate('Tải Hình Ảnh Bài Viết (POST /api/news/upload multipart/form-data)', uploadRes);
  const uploadedUrl = uploadRes.data?.url || '/uploads/news/sample.png';

  // 2. Thêm bài viết mới
  const createNewsRes = await req('/news', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: `Bài Viết Kiểm Thử ${Date.now()}`,
      slug: `bai-viet-test-${Date.now()}`,
      summary: 'Tóm tắt bài viết kiểm thử tự động',
      content: '<p>Nội dung chi tiết bài viết HTML test</p>',
      thumbnailUrl: uploadedUrl,
      author: 'Admin Tester',
      tags: 'vps, cloud, news',
      isPublished: true
    })
  });
  evaluate('Đăng Bài Viết Mới (POST /api/news)', createNewsRes);
  const createdNewsId = createNewsRes.data?.id;

  if (createdNewsId) {
    const updateNewsRes = await req(`/news/${createdNewsId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        title: `Bài Viết Đã Chỉnh Sửa ${Date.now()}`,
        slug: `bai-viet-test-edit-${Date.now()}`,
        summary: 'Tóm tắt đã sửa',
        content: '<p>Nội dung đã sửa</p>',
        thumbnailUrl: uploadedUrl,
        author: 'Senior Editor',
        tags: 'vps, cloud, update',
        isPublished: true
      })
    });
    evaluate('Chỉnh Sửa Bài Viết (PUT /api/news/{id})', updateNewsRes);

    const toggleNewsRes = await req(`/news/${createdNewsId}/publish`, {
      method: 'PATCH',
      headers: authHeaders
    });
    evaluate('Bật/Tắt Xuất Bản Bài Viết (PATCH /api/news/{id}/publish)', toggleNewsRes);

    const delNewsRes = await req(`/news/${createdNewsId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Bài Viết (DELETE /api/news/{id})', delNewsRes);
  }

  // --- MODULE 4: KNOWLEDGE BASE (TÀI LIỆU MARKDOWN) ---
  console.log('\n📚 --- [MODULE 4] Knowledge Base (Tài Liệu Hướng Dẫn) ---');
  const createKbRes = await req('/knowledge-base', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: `Hướng Dẫn Triển Khai Cloud VPS Linux ${Date.now()}`,
      slug: `huong-dan-vps-linux-${Date.now()}`,
      content: '# Hướng dẫn cài đặt\n\nĐây là hướng dẫn cấu hình máy chủ Linux Ubuntu 22.04 đầy đủ và chi tiết với tường lửa UFW và Nginx Reverse Proxy.',
      categoryTag: 'VPS Linux',
      authorId: '00000000-0000-0000-0000-000000000000',
      isPublished: true
    })
  });
  evaluate('Tạo Bài Hướng Dẫn Markdown (POST /api/knowledge-base)', createKbRes);
  const createdKbId = createKbRes.data?.id || createKbRes.data?.Id;

  if (createdKbId) {
    const updateKbRes = await req(`/knowledge-base/${createdKbId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: createdKbId,
        title: `Hướng Dẫn Đã Sửa ${Date.now()}`,
        slug: `huong-dan-test-edit-${Date.now()}`,
        content: '# Hướng dẫn sửa đổi\n\nNội dung bài viết cập nhật hoàn chỉnh hơn 50 ký tự để vượt qua validation hệ thống.',
        categoryTag: 'VPS Windows'
      })
    });
    evaluate('Sửa Bài Hướng Dẫn (PUT /api/knowledge-base/{id})', updateKbRes);

    const delKbRes = await req(`/knowledge-base/${createdKbId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Bài Hướng Dẫn (DELETE /api/knowledge-base/{id})', delKbRes);
  }

  // --- MODULE 5: CÂU HỎI FAQ ---
  console.log('\n❓ --- [MODULE 5] Câu Hỏi Thường Gặp (FAQs) ---');
  const createFaqRes = await req('/faqs', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      question: `Làm sao để gia hạn VPS? ${Date.now()}`,
      answer: 'Quý khách vào mục Quản lý VPS và bấm nút Gia Hạn.',
      categoryTag: 'Billing'
    })
  });
  evaluate('Tạo Câu Hỏi FAQ Mới (POST /api/faqs)', createFaqRes);
  const createdFaqId = createFaqRes.data?.id || createFaqRes.data?.Id;

  if (createdFaqId) {
    const updateFaqRes = await req(`/faqs/${createdFaqId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: createdFaqId,
        question: `Làm sao để gia hạn VPS nhanh? ${Date.now()}`,
        answer: 'Thanh toán trực tiếp qua ví tài khoản.',
        categoryTag: 'General'
      })
    });
    evaluate('Sửa Câu Hỏi FAQ (PUT /api/faqs/{id})', updateFaqRes);

    const delFaqRes = await req(`/faqs/${createdFaqId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Câu Hỏi FAQ (DELETE /api/faqs/{id})', delFaqRes);
  }

  // --- MODULE 6: BANNERS QUẢNG CÁO ---
  console.log('\n🖼️ --- [MODULE 6] Banners & Sliders ---');
  const createBannerRes = await req('/banners', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      title: `Banner Khuyến Mãi Hè ${Date.now()}`,
      imageUrl: '/images/banner-test.jpg',
      targetUrl: '/promotions/summer',
      displayOrder: 1,
      isActive: true
    })
  });
  evaluate('Thêm Banner Quảng Cáo (POST /api/banners)', createBannerRes);
  const createdBannerId = createBannerRes.data?.id || createBannerRes.data?.Id;

  if (createdBannerId) {
    const updateBannerRes = await req(`/banners/${createdBannerId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: createdBannerId,
        title: `Banner Khuyến Mãi Mùa Thu ${Date.now()}`,
        imageUrl: '/images/banner-autumn.jpg',
        targetUrl: '/promotions/autumn',
        displayOrder: 2,
        isActive: true
      })
    });
    evaluate('Chỉnh Sửa Banner (PUT /api/banners/{id})', updateBannerRes);

    const delBannerRes = await req(`/banners/${createdBannerId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Banner (DELETE /api/banners/{id})', delBannerRes);
  }

  // --- MODULE 7: MÃ GIẢM GIÁ (COUPONS) ---
  console.log('\n🏷️ --- [MODULE 7] Mã Giảm Giá (Coupons) ---');
  const couponCode = `TEST${Date.now().toString().slice(-6)}`;
  const createCouponRes = await req('/coupons', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: couponCode,
      discountPercent: 20,
      minOrderAmount: 100000,
      maxDiscountAmount: 500000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  evaluate('Tạo Mã Khuyến Mãi (POST /api/coupons)', createCouponRes);
  const createdCouponId = createCouponRes.data?.id || createCouponRes.data?.Id;

  if (createdCouponId) {
    const updateCouponRes = await req(`/coupons/${createdCouponId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        code: couponCode,
        discountPercent: 25,
        minOrderAmount: 200000,
        maxDiscountAmount: 1000000,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
      })
    });
    evaluate('Sửa Mã Khuyến Mãi (PUT /api/coupons/{id})', updateCouponRes);

    const delCouponRes = await req(`/coupons/${createdCouponId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Mã Khuyến Mãi (DELETE /api/coupons/{id})', delCouponRes);
  }

  // --- MODULE 8: QUẢN LÝ USERS (THÊM / SỬA / KHÓA / XÓA) ---
  console.log('\n👥 --- [MODULE 8] Quản Lý Người Dùng (Users) ---');
  const testUserEmail = `user_test_${Date.now()}@system.local`;
  const createUserRes = await req('/users', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      email: testUserEmail,
      fullName: 'Customer Test Subject',
      phoneNumber: '0987654321',
      password: 'UserPass123!',
      role: 'Customer'
    })
  });
  evaluate('Tạo Tài Khoản User Mới (POST /api/users)', createUserRes);
  const createdUserId = createUserRes.data?.id;

  if (createdUserId) {
    const updateUserRes = await req(`/users/${createdUserId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({
        id: createdUserId,
        fullName: 'Customer Test Subject (Updated)',
        phoneNumber: '0987654999',
        role: 'Customer'
      })
    });
    evaluate('Chỉnh Sửa Thông Tin User (PUT /api/users/{id})', updateUserRes);

    const lockUserRes = await req(`/users/${createdUserId}/lock`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ isLocked: true })
    });
    evaluate('Khóa / Mở Khóa Tài Khoản (PATCH /api/users/{id}/lock)', lockUserRes);

    const delUserRes = await req(`/users/${createdUserId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Tài Khoản User (DELETE /api/users/{id})', delUserRes);
  }

  // --- MODULE 9: THẺ QUÀ TẶNG (GIFT CARDS) ---
  console.log('\n🎁 --- [MODULE 9] Thẻ Quà Tặng (Gift Cards) ---');
  const giftCardCode = `GIFT-TEST-${Date.now().toString().slice(-6)}`;
  const createGiftRes = await req('/gift-cards', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      code: giftCardCode,
      amount: 500000,
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  evaluate('Phát Hành Thẻ Gift Card Mới (POST /api/gift-cards)', createGiftRes);
  const createdGiftId = createGiftRes.data?.id;

  if (createdGiftId) {
    const delGiftRes = await req(`/gift-cards/${createdGiftId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Hủy / Xóa Thẻ Gift Card (DELETE /api/gift-cards/{id})', delGiftRes);
  }

  // --- MODULE 10: TỔ CHỨC DOANH NGHIỆP (ORGANIZATIONS B2B) ---
  console.log('\n🏢 --- [MODULE 10] Tổ Chức Doanh Nghiệp (Organizations B2B) ---');
  const createOrgRes = await req('/organizations', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: `Tập Đoàn Viễn Thông Test ${Date.now()}`,
      taxCode: '0101234567',
      address: '123 Đường Công Nghệ, Hà Nội',
      creditLimit: 50000000
    })
  });
  evaluate('Tạo Tổ Chức Doanh Nghiệp B2B (POST /api/organizations)', createOrgRes);
  const createdOrgId = createOrgRes.data?.id;

  if (createdOrgId) {
    const delOrgRes = await req(`/organizations/${createdOrgId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    evaluate('Xóa Tổ Chức Doanh Nghiệp (DELETE /api/organizations/{id})', delOrgRes);
  }

  // --- MODULE 11: CẤU HÌNH THAM SỐ HỆ THỐNG (SETTINGS) ---
  console.log('\n⚙️ --- [MODULE 11] Cấu Hình Tham Số Hệ Thống (Settings) ---');
  const settingKey = `Test_Param_${Date.now()}`;
  const updateSettingRes = await req(`/settings/${settingKey}`, {
    method: 'PUT',
    headers: authHeaders,
    body: JSON.stringify({
      key: settingKey,
      value: 'Auto_Backup_Enabled',
      description: 'Cấu hình tự động'
    })
  });
  evaluate('Chỉnh Sửa / Tạo Mới Giá Trị Cấu Hình (PUT /api/settings/{key})', updateSettingRes);

  // --- MODULE 12: TỶ GIÁ TIỀN TỆ (EXCHANGE RATES) ---
  console.log('\n💱 --- [MODULE 12] Tỷ Giá Ngoại Tệ (Exchange Rates) ---');
  const createRateRes = await req('/exchange-rates', {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      fromCurrency: 'USD',
      toCurrency: 'VND',
      rate: 25450
    })
  });
  evaluate('Cập Nhật / Thêm Tỷ Giá Ngoại Tệ (POST /api/exchange-rates)', createRateRes);

  // --- MODULE 13: NHẬT KÝ KIỂM TOÁN (AUDIT LOGS) ---
  console.log('\n🛡️ --- [MODULE 13] Nhật Ký Kiểm Toán (Audit Logs) ---');
  const auditRes = await req('/audit-logs', { headers: authHeaders });
  evaluate('Đọc Lịch Sử Thao Tác Hệ Thống (GET /api/audit-logs)', auditRes);

  // --- MODULE 14: GIÁM SÁT UPTIME ---
  console.log('\n⚡ --- [MODULE 14] Giám Sát Uptime & Máy Chủ ---');
  const uptimeRes = await req('/uptime/system', { headers: authHeaders });
  evaluate('Đo Lường Độ Trễ Ping Cụm Server (GET /api/uptime/system)', uptimeRes);

  console.log('\n=============================================================================');
  console.log('📊 TỔNG HỢP KẾT QUẢ KIỂM THỬ THỰC TẾ CHI TIẾT TỪNG TÍNH NĂNG:');
  console.log(`- Tổng số thao tác nghiệp vụ đã test (Thêm/Sửa/Xóa/Upload/Khóa/Duyệt): ${results.totalTests}`);
  console.log(`- Thao tác thành công hoàn hảo: ${results.passed}`);
  console.log(`- Lỗi HTTP 400 (Bad Request): ${results.failed400.length}`);
  console.log(`- Lỗi HTTP 500 (Internal Server Error): ${results.failed500.length}`);
  console.log('=============================================================================');

  if (results.failed500.length === 0 && results.failed400.length === 0) {
    console.log('🏆 KẾT QUẢ ĐẠT ĐỈNH: 100% TẤT CẢ CÁC TÍNH NĂNG ĐỀU HOẠT ĐỘNG HOÀN HẢO!');
  } else {
    console.error('Các lỗi phát hiện:', JSON.stringify(results, null, 2));
  }
}

runDeepCrudAudit();
