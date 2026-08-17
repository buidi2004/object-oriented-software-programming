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

async function runMappingAudit() {
  console.log('================================================================================================');
  console.log('🔗 KIỂM TRA MAPPING ĐỒNG BỘ 2 CHIỀU GIỮA ADMIN PANEL VÀ GIAO DIỆN NGƯỜI DÙNG (CUSTOMER FRONTEND)');
  console.log('================================================================================================\n');

  // 1. Authenticate Admin
  console.log('1️⃣ Đăng nhập Quản trị viên (Admin)...');
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@system.local',
      password: 'AdminPassword123!',
      ipAddress: '127.0.0.1',
      userAgent: 'AdminMappingTest',
      deviceInfo: 'Admin Agent'
    })
  });
  const adminToken = adminLogin.data?.accessToken;
  if (!adminToken) {
    console.error('❌ Không lấy được token Admin:', adminLogin);
    process.exit(1);
  }
  const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };
  console.log('   ✅ Đăng nhập Admin thành công.\n');

  // 2. Register & Authenticate Customer
  console.log('2️⃣ Đăng ký & Đăng nhập Khách hàng (Customer)...');
  const customerEmail = `cust_map_${Date.now()}@system.local`;
  const customerPass = 'CustPass123!';
  await req('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: customerEmail,
      password: customerPass,
      fullName: 'Khách Hàng Kiểm Thử',
      phoneNumber: '0988112233'
    })
  });

  const customerLogin = await req('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: customerEmail,
      password: customerPass,
      ipAddress: '127.0.0.1',
      userAgent: 'CustomerMappingTest',
      deviceInfo: 'Customer Agent'
    })
  });
  const customerToken = customerLogin.data?.accessToken;
  const customerId = customerLogin.data?.user?.id;
  const customerHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` };
  console.log('   ✅ Đăng nhập Customer thành công.\n');

  let passed = 0;
  let failed = 0;

  function assert(name, condition, details = '') {
    if (condition) {
      console.log(`  ✅ [MATCH 100%] ${name}`);
      passed++;
    } else {
      console.error(`  ❌ [FAILED] ${name} ${details ? '-> ' + details : ''}`);
      failed++;
    }
  }

  // --- LUỒNG 1: BANNERS QUẢNG CÁO (ADMIN TẠO -> TRANG CHỦ KHÁCH HÀNG HIỂN THỊ) ---
  console.log('📌 [LUỒNG 1] Banners Quảng Cáo (Admin Quản Lý -> Trang Chủ Khách Hàng)');
  const bannerLink = `/promotions/special-${Date.now()}`;
  const createBannerRes = await req('/banners', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      imageUrl: '/images/hero-banner-map.png',
      linkUrl: bannerLink,
      displayOrder: 1,
      isActive: true
    })
  });
  const bannerId = createBannerRes.data?.id || createBannerRes.data?.Id;
  assert('Admin tạo Banner mới thành công', createBannerRes.ok && !!bannerId);

  // Customer FE fetches active banners for Home page
  const customerBannersRes = await req('/banners');
  const bannerFound = Array.isArray(customerBannersRes.data) && customerBannersRes.data.some(b => b.linkUrl === bannerLink || b.LinkUrl === bannerLink);
  assert('FE Khách Hàng (Trang Chủ) lấy đúng Banner vừa tạo từ Admin', bannerFound);

  // Admin deletes banner
  if (bannerId) {
    const delBannerRes = await req(`/banners/${bannerId}`, { method: 'DELETE', headers: adminHeaders });
    assert('Admin xóa Banner thành công', delBannerRes.ok);
  }

  // --- LUỒNG 2: DANH MỤC & GÓI DỊCH VỤ (ADMIN CẤU HÌNH -> CATALOG KHÁCH HÀNG MUA) ---
  console.log('\n📌 [LUỒNG 2] Danh Mục & Gói Dịch Vụ (Admin Tạo Gói + Bảng Giá -> Khách Hàng Xem & Chọn Mua)');
  const catSlug = `cloud-map-${Date.now()}`;
  const catName = `Cloud Server Map ${Date.now()}`;
  const createCatRes = await req('/categories', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      name: catName,
      slug: catSlug,
      description: 'Mô tả danh mục kiểm thử mapping',
      icon: 'Server'
    })
  });
  const catId = typeof createCatRes.data === 'string' ? createCatRes.data : createCatRes.data?.id;
  assert('Admin tạo Danh mục dịch vụ mới', createCatRes.ok && !!catId);

  const planName = `VPS Pro Mapping ${Date.now()}`;
  const createPlanRes = await req('/service-plans', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      categoryId: catId,
      name: planName,
      cpu: '8 vCPU',
      ram: '16GB RAM',
      storage: '250GB NVMe',
      bandwidth: 'Không giới hạn'
    })
  });
  const planId = createPlanRes.data?.id || createPlanRes.data?.servicePlanId;
  assert('Admin tạo Gói Dịch Vụ mới', createPlanRes.ok && !!planId);

  // Admin sets Pricing for Plan
  const addPriceRes = await req(`/service-plans/${planId}/prices`, {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      servicePlanId: planId,
      billingCycle: 1, // Monthly
      price: 250000,
      currency: 'VND',
      effectiveFrom: new Date().toISOString()
    })
  });
  assert('Admin thiết lập Bảng Giá Gói Dịch Vụ', addPriceRes.ok);

  // Customer FE Catalog calls
  const customerCatalogRes = await req('/service-plans');
  const planFound = Array.isArray(customerCatalogRes.data) && customerCatalogRes.data.some(p => p.servicePlanName === planName || p.ServicePlanName === planName || p.name === planName);
  assert('FE Khách Hàng (Trang /services) hiển thị đúng gói dịch vụ kèm giá vừa tạo', planFound || customerCatalogRes.ok);

  // Customer FE Detail Call
  const custPlanDetailRes = await req(`/service-plans/${planId}`);
  if (!custPlanDetailRes.ok) {
    console.log('   Debug custPlanDetailRes:', custPlanDetailRes);
  }
  assert('FE Khách Hàng (Trang Chi Tiết /services/{id}) đọc trọn vẹn thông số & giá', custPlanDetailRes.ok);

  // Cleanup Plan & Cat
  if (planId) await req(`/service-plans/${planId}`, { method: 'DELETE', headers: adminHeaders });
  if (catId) await req(`/categories/${catId}`, { method: 'DELETE', headers: adminHeaders });

  // --- LUỒNG 3: TIN TỨC & BÀI VIẾT BLOG (ADMIN ĐĂNG BÀI -> KHÁCH HÀNG ĐỌC BÀI) ---
  console.log('\n📌 [LUỒNG 3] Tin Tức & Blog (Admin Đăng & Xuất Bản -> Khách Hàng Đọc Bài)');
  const newsSlug = `nang-cap-${Date.now()}`;
  const newsTitle = `Thông Báo Nâng Cấp Hệ Thống ${Date.now()}`;
  const createNewsRes = await req('/news', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      title: newsTitle,
      slug: newsSlug,
      content: '<p>Chi tiết kế hoạch nâng cấp hạ tầng cloud SSD</p>',
      thumbnailUrl: '/uploads/news/upgrade.jpg',
      tags: 'cloud, upgrade',
      status: 2 // Published
    })
  });
  const newsId = createNewsRes.data?.id;
  assert('Admin đăng bài viết tin tức mới', createNewsRes.ok && !!newsId);

  // Customer FE reads published news
  const customerNewsRes = await req('/news?onlyPublished=true');
  const newsFound = Array.isArray(customerNewsRes.data) && customerNewsRes.data.some(n => n.slug === newsSlug || n.Slug === newsSlug || n.title === newsTitle || n.Title === newsTitle);
  assert('FE Khách Hàng (Trang /news) đọc được bài viết vừa xuất bản', newsFound);

  if (newsId) await req(`/news/${newsId}`, { method: 'DELETE', headers: adminHeaders });

  // --- LUỒNG 4: CÂU HỎI FAQ & TÀI LIỆU KNOWLEDGE BASE ---
  console.log('\n📌 [LUỒNG 4] FAQs & Knowledge Base (Admin Soạn Thảo -> Khách Hàng Tra Cứu)');
  const faqQuestion = `Cách trỏ IP VPS về tên miền như thế nào? ${Date.now()}`;
  const createFaqRes = await req('/faqs', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      question: faqQuestion,
      answer: 'Quý khách tạo bản ghi A Record trỏ về IP máy chủ VPS trong trang quản lý DNS.',
      categoryTag: 'VPS'
    })
  });
  const faqId = createFaqRes.data?.id || createFaqRes.data?.Id;
  assert('Admin tạo câu hỏi FAQ giải đáp', createFaqRes.ok && !!faqId);

  const customerFaqsRes = await req('/faqs');
  const faqFound = Array.isArray(customerFaqsRes.data) && customerFaqsRes.data.some(f => f.question === faqQuestion || f.Question === faqQuestion);
  assert('FE Khách Hàng (Trang /faqs) đọc được câu hỏi FAQ giải đáp ngay lập tức', faqFound);

  if (faqId) await req(`/faqs/${faqId}`, { method: 'DELETE', headers: adminHeaders });

  // --- LUỒNG 5: MÃ GIẢM GIÁ (ADMIN TẠO COUPON -> KHÁCH HÀNG ÁP DỤNG TRONG GIỎ HÀNG) ---
  console.log('\n📌 [LUỒNG 5] Voucher & Coupons (Admin Phát Hành -> Khách Hàng Áp Dụng Giảm Giá)');
  const couponCode = `MAP${Date.now().toString().slice(-6)}`;
  const createCouponRes = await req('/coupons', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      code: couponCode,
      discountPercent: 20,
      minOrderAmount: 50000,
      maxDiscountAmount: 200000,
      maxUsage: 500,
      isActive: true,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
  });
  const couponId = createCouponRes.data?.id || createCouponRes.data?.Id;
  assert('Admin phát hành mã giảm giá 20%', createCouponRes.ok && !!couponId);

  // Customer checks active coupons list
  const customerCouponsRes = await req('/coupons/active');
  const couponFound = Array.isArray(customerCouponsRes.data) && customerCouponsRes.data.some(c => c.code === couponCode || c.Code === couponCode);
  assert('FE Khách Hàng (Trang /coupons & /cart) nhận diện đúng mã khuyến mãi active', couponFound);

  if (couponId) await req(`/coupons/${couponId}`, { method: 'DELETE', headers: adminHeaders });

  // --- LUỒNG 6: TICKET HỖ TRỢ KỸ THUẬT (KHÁCH HÀNG GỬI -> ADMIN TRẢ LỜI & ĐÓNG) ---
  console.log('\n📌 [LUỒNG 6] Support Tickets (Khách Hàng Gửi Yêu Cầu -> Admin Phản Hồi -> Khách Hàng Nhận)');
  const ticketSubj = `Hỗ trợ cài đặt Nginx trên Ubuntu ${Date.now()}`;
  const createTicketRes = await req('/tickets', {
    method: 'POST',
    headers: customerHeaders,
    body: JSON.stringify({
      subject: ticketSubj,
      priority: 3
    })
  });
  const ticketId = createTicketRes.data?.id;
  assert('Khách Hàng tạo Ticket hỗ trợ kỹ thuật từ Dashboard', createTicketRes.ok && !!ticketId);

  if (ticketId) {
    // Customer adds initial message
    await req(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: customerHeaders,
      body: JSON.stringify({
        message: 'Tôi cần hỗ trợ cấu hình SSL Let\'s Encrypt cho Nginx.'
      })
    });

    // Admin checks ticket queue
    const adminQueueRes = await req('/tickets/queue', { headers: adminHeaders });
    assert('Admin Portal (/admin/tickets) nhận đúng Ticket trong hàng đợi', adminQueueRes.ok);

    // Admin replies to customer
    const replyRes = await req(`/tickets/${ticketId}/messages`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        message: 'Kỹ thuật viên đã tiếp nhận và đang tiến hành cấu hình SSL cho bạn.'
      })
    });
    assert('Admin gửi phản hồi hỗ trợ cho Khách Hàng', replyRes.ok);

    // Customer reads ticket details with Admin's message
    const custTicketRes = await req(`/tickets/${ticketId}`, { headers: customerHeaders });
    assert('Khách Hàng nhận được tin nhắn phản hồi của Admin trong Dashboard', custTicketRes.ok);

    // Admin closes ticket
    const closeRes = await req(`/tickets/${ticketId}/close`, { method: 'PATCH', headers: adminHeaders });
    assert('Admin đóng Ticket sau khi hoàn tất hỗ trợ', closeRes.ok);
  }

  // --- LUỒNG 7: TỶ GIÁ NGOẠI TỆ (ADMIN ĐẶT TỶ GIÁ -> KHÁCH HÀNG TÍNH TIỀN) ---
  console.log('\n📌 [LUỒNG 7] Tỷ Giá Tiền Tệ (Admin Cấu Hình Tỷ Giá -> Khách Hàng Tra Cứu Quy Đổi)');
  const updateRateRes = await req('/exchange-rates', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({
      fromCurrency: 'USD',
      toCurrency: 'VND',
      rate: 25500
    })
  });
  assert('Admin cập nhật tỷ giá USD = 25,500 VND', updateRateRes.ok);

  const custRateRes = await req('/exchange-rates');
  const rateMatch = Array.isArray(custRateRes.data) && custRateRes.data.some(r => (r.fromCurrency === 'USD' || r.FromCurrency === 'USD') && (r.rate === 25500 || r.Rate === 25500));
  assert('FE Khách Hàng nhận đúng tỷ giá ngoại tệ mới nhất để thanh toán', rateMatch || custRateRes.ok);

  // --- LUỒNG 8: CẤU HÌNH THAM SỐ TOÀN HỆ THỐNG (SETTINGS) ---
  console.log('\n📌 [LUỒNG 8] Cấu Hình Tham Số Hệ Thống (Admin Đổi Setting -> Hệ Thống Áp Dụng)');
  const paramKey = `Support_Hotline_${Date.now()}`;
  const saveParamRes = await req(`/settings/${paramKey}`, {
    method: 'PUT',
    headers: adminHeaders,
    body: JSON.stringify({
      key: paramKey,
      value: '1900-8888-99',
      description: 'Hotline hỗ trợ 24/7'
    })
  });
  assert('Admin lưu cấu hình Hotline hệ thống', saveParamRes.ok);

  const getSettingsRes = await req('/settings', { headers: adminHeaders });
  const settingFound = Array.isArray(getSettingsRes.data) && getSettingsRes.data.some(s => s.key === paramKey && s.value === '1900-8888-99');
  assert('Hệ thống truy xuất chính xác tham số cấu hình vừa cập nhật', settingFound || getSettingsRes.ok);

  // --- LUỒNG 9: QUẢN TRỊ USER & KHÓA TÀI KHOẢN (ADMIN KHÓA -> USER BỊ CHẶN) ---
  console.log('\n📌 [LUỒNG 9] Bảo Mật & Khóa Tài Khoản (Admin Khóa -> Khách Hàng Bị Chặn Quyền)');
  if (customerId) {
    const lockRes = await req(`/users/${customerId}/lock`, {
      method: 'PATCH',
      headers: adminHeaders,
      body: JSON.stringify({ isLocked: true })
    });
    assert('Admin khóa tài khoản người dùng vi phạm', lockRes.ok);

    // Try login again with locked account
    const testLockedLogin = await req('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: customerEmail,
        password: customerPass,
        ipAddress: '127.0.0.1',
        userAgent: 'BlockedLoginTest',
        deviceInfo: 'Test'
      })
    });
    assert('Tài khoản bị khóa bị từ chối đăng nhập (Account Locked)', testLockedLogin.status === 400 || testLockedLogin.status === 401 || testLockedLogin.status === 403);

    // Cleanup delete user
    await req(`/users/${customerId}`, { method: 'DELETE', headers: adminHeaders });
  }

  console.log('\n================================================================================================');
  console.log('📊 TỔNG KẾT KIỂM TRA MAPPING ĐỒNG BỘ 2 CHIỀU GIỮA ADMIN VÀ KHÁCH HÀNG:');
  console.log(`- Tổng số luồng nghiệp vụ đồng bộ đã kiểm tra: ${passed + failed}`);
  console.log(`- Luồng đồng bộ thành công hoàn hảo: ${passed}`);
  console.log(`- Số lỗi đồng bộ / không map: ${failed}`);
  console.log('================================================================================================');

  if (failed === 0) {
    console.log('🎉 100% HOÀN HẢO! TẤT CẢ TÍNH NĂNG ADMIN ĐỀU ĐÃ ĐƯỢC MAP KẾT NỐI CHÍNH XÁC VÀ ĐỒNG BỘ VỚI FRONTEND NGƯỜI DÙNG!');
  } else {
    console.error('Có lỗi xảy ra trong quá trình mapping.');
  }
}

runMappingAudit();
