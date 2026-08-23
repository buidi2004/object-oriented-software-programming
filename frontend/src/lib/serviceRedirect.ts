/**
 * getServiceDashboardUrl & getPaymentSuccessMessage
 * ────────────────────────────────────────────────────────────
 * Map categorySlug hoặc servicePlanName sang đúng trang dashboard và thông điệp
 * tương ứng với 12+ dịch vụ Cloud của SEN CloudHost.
 * ────────────────────────────────────────────────────────────
 */

export interface ServiceDashboardInfo {
  href: string;
  label: string;
  description: string;
}

/** Map chính xác theo category slug trong cơ sở dữ liệu và type từ frontend */
const SLUG_MAP: Record<string, ServiceDashboardInfo> = {
  // 1. Cloud VPS
  'cloud-vps': { href: '/dashboard/vps-instances', label: 'Quản Lý Máy Chủ VPS', description: 'Truy cập và quản lý máy chủ VPS của bạn' },
  'vps': { href: '/dashboard/vps-instances', label: 'Quản Lý Máy Chủ VPS', description: 'Truy cập và quản lý máy chủ VPS của bạn' },

  // 2. Web Hosting
  'web-hosting': { href: '/dashboard/hosting', label: 'Quản Lý Web Hosting', description: 'Quản lý hosting và website của bạn' },
  'hosting': { href: '/dashboard/hosting', label: 'Quản Lý Web Hosting', description: 'Quản lý hosting và website của bạn' },
  'cloud-hosting': { href: '/dashboard/hosting', label: 'Quản Lý Web Hosting', description: 'Quản lý hosting và website của bạn' },

  // 3. Tên Miền
  'ten-mien': { href: '/dashboard/domains', label: 'Quản Lý Tên Miền', description: 'Quản lý DNS và cấu hình tên miền của bạn' },
  'domain': { href: '/dashboard/domains', label: 'Quản Lý Tên Miền', description: 'Quản lý DNS và cấu hình tên miền của bạn' },
  'domains': { href: '/dashboard/domains', label: 'Quản Lý Tên Miền', description: 'Quản lý DNS và cấu hình tên miền của bạn' },

  // 4. Dedicated Server
  'dedicated-server': { href: '/dashboard/dedicated-servers', label: 'Quản Lý Dedicated Server', description: 'Quản lý máy chủ vật lý riêng' },
  'dedicated-servers': { href: '/dashboard/dedicated-servers', label: 'Quản Lý Dedicated Server', description: 'Quản lý máy chủ vật lý riêng' },
  'dedicated': { href: '/dashboard/dedicated-servers', label: 'Quản Lý Dedicated Server', description: 'Quản lý máy chủ vật lý riêng' },

  // 5. Email Doanh Nghiệp
  'email-server': { href: '/dashboard/email-hosting', label: 'Quản Lý Email Doanh Nghiệp', description: 'Cấu hình hộp thư và tài khoản email' },
  'email-hosting': { href: '/dashboard/email-hosting', label: 'Quản Lý Email Doanh Nghiệp', description: 'Cấu hình hộp thư và tài khoản email' },
  'email': { href: '/dashboard/email-hosting', label: 'Quản Lý Email Doanh Nghiệp', description: 'Cấu hình hộp thư và tài khoản email' },

  // 6. Chứng Chỉ SSL
  'ssl-certificate': { href: '/dashboard/ssl-certificates', label: 'Quản Lý Chứng Chỉ SSL', description: 'Xem và cài đặt chứng chỉ SSL' },
  'ssl-certificates': { href: '/dashboard/ssl-certificates', label: 'Quản Lý Chứng Chỉ SSL', description: 'Xem và cài đặt chứng chỉ SSL' },
  'ssl': { href: '/dashboard/ssl-certificates', label: 'Quản Lý Chứng Chỉ SSL', description: 'Xem và cài đặt chứng chỉ SSL' },

  // 7. Managed Databases
  'managed-database': { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý PostgreSQL, MySQL, Redis' },
  'managed-databases': { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý PostgreSQL, MySQL, Redis' },
  'databases': { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý cơ sở dữ liệu' },
  'database': { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý cơ sở dữ liệu' },

  // 8. Game Servers
  'game-server': { href: '/dashboard/game-servers', label: 'Quản Lý Game Server', description: 'Khởi động và quản lý Minecraft, CS2, Rust' },
  'game-servers': { href: '/dashboard/game-servers', label: 'Quản Lý Game Server', description: 'Khởi động và quản lý Game Server' },
  'game': { href: '/dashboard/game-servers', label: 'Quản Lý Game Server', description: 'Khởi động và quản lý Game Server' },

  // 9. 1-Click Apps
  '1click-apps': { href: '/dashboard/apps', label: 'Quản Lý Ứng Dụng Cloud', description: 'Quản lý WordPress, Nextcloud, Ghost' },
  'app-installer': { href: '/dashboard/apps', label: 'Quản Lý Ứng Dụng Cloud', description: 'Quản lý các ứng dụng đã cài đặt' },
  'apps': { href: '/dashboard/apps', label: 'Quản Lý Ứng Dụng Cloud', description: 'Quản lý các ứng dụng đã cài đặt' },
  'app': { href: '/dashboard/apps', label: 'Quản Lý Ứng Dụng Cloud', description: 'Quản lý các ứng dụng đã cài đặt' },

  // 10. Static Sites
  'static-sites': { href: '/dashboard/static-sites', label: 'Quản Lý Static Sites', description: 'Quản lý trang web tĩnh và CDN' },
  'static': { href: '/dashboard/static-sites', label: 'Quản Lý Static Sites', description: 'Quản lý trang web tĩnh và CDN' },

  // 11. Object Storage S3
  'object-storage': { href: '/dashboard/storage', label: 'Quản Lý Object Storage S3', description: 'Quản lý bucket và dữ liệu lưu trữ S3' },
  'storage': { href: '/dashboard/storage', label: 'Quản Lý Object Storage S3', description: 'Quản lý bucket và dữ liệu lưu trữ' },

  // 12. Bảo Mật & WAF
  'security-waf': { href: '/dashboard/security', label: 'Quản Lý Bảo Mật & WAF', description: 'Cấu hình tường lửa và chống DDoS L7' },
  'security': { href: '/dashboard/security', label: 'Quản Lý Bảo Mật & WAF', description: 'Cấu hình bảo mật hệ thống' },

  // 13. Chuyển Đổi Dữ Liệu (Migration)
  'cloud-migration': { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời website & dữ liệu' },
  'migrations': { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời dữ liệu' },
  'migration': { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời dữ liệu' },

  // 14. Cloud CDN
  'cloud-cdn': { href: '/dashboard/cdn', label: 'Quản Lý Cloud CDN', description: 'Cấu hình phân phối nội dung tốc độ cao' },
  'cdn': { href: '/dashboard/cdn', label: 'Quản Lý Cloud CDN', description: 'Cấu hình phân phối CDN' },

  // 15. Website Builder
  'website-builder': { href: '/dashboard/website-builder', label: 'Quản Lý Website Builder', description: 'Trình tạo website kéo thả' },
};

/** Keyword fallback tìm theo tên gói dịch vụ */
const KEYWORD_MAP: Array<[string, ServiceDashboardInfo]> = [
  ['database', { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý database' }],
  ['postgres', { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý PostgreSQL' }],
  ['mysql', { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý MySQL' }],
  ['redis', { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý Redis' }],
  ['db ', { href: '/dashboard/databases', label: 'Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý database' }],
  ['storage', { href: '/dashboard/storage', label: 'Quản Lý Object Storage S3', description: 'Quản lý bucket lưu trữ S3' }],
  ['s3', { href: '/dashboard/storage', label: 'Quản Lý Object Storage S3', description: 'Quản lý bucket lưu trữ' }],
  ['minio', { href: '/dashboard/storage', label: 'Quản Lý Object Storage S3', description: 'Quản lý bucket lưu trữ S3' }],
  ['waf', { href: '/dashboard/security', label: 'Quản Lý Bảo Mật & WAF', description: 'Cấu hình bảo mật và chống DDoS' }],
  ['bảo mật', { href: '/dashboard/security', label: 'Quản Lý Bảo Mật & WAF', description: 'Cấu hình bảo mật hệ thống' }],
  ['tường lửa', { href: '/dashboard/security', label: 'Quản Lý Bảo Mật & WAF', description: 'Cấu hình tường lửa chống tấn công' }],
  ['security', { href: '/dashboard/security', label: 'Quản Lý Bảo Mật & WAF', description: 'Cấu hình bảo mật hệ thống' }],
  ['scanner', { href: '/dashboard/security', label: 'Quản Lý Bảo Mật', description: 'Cấu hình quét mã độc' }],
  ['chuyển đổi', { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời' }],
  ['di dời', { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời' }],
  ['migration', { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời' }],
  ['dedicated', { href: '/dashboard/dedicated-servers', label: 'Quản Lý Dedicated Server', description: 'Quản lý máy chủ riêng' }],
  ['dell r', { href: '/dashboard/dedicated-servers', label: 'Quản Lý Dedicated Server', description: 'Quản lý máy chủ riêng' }],
  ['xeon', { href: '/dashboard/dedicated-servers', label: 'Quản Lý Dedicated Server', description: 'Quản lý máy chủ riêng' }],
  ['epyc', { href: '/dashboard/dedicated-servers', label: 'Quản Lý Dedicated Server', description: 'Quản lý máy chủ riêng' }],
  ['hosting', { href: '/dashboard/hosting', label: 'Quản Lý Web Hosting', description: 'Quản lý hosting của bạn' }],
  ['email', { href: '/dashboard/email-hosting', label: 'Quản Lý Email Doanh Nghiệp', description: 'Quản lý email của bạn' }],
  ['tên miền', { href: '/dashboard/domains', label: 'Quản Lý Tên Miền', description: 'Quản lý tên miền của bạn' }],
  ['domain', { href: '/dashboard/domains', label: 'Quản Lý Tên Miền', description: 'Quản lý tên miền của bạn' }],
  ['ssl', { href: '/dashboard/ssl-certificates', label: 'Quản Lý Chứng Chỉ SSL', description: 'Xem và quản lý chứng chỉ SSL' }],
  ['game', { href: '/dashboard/game-servers', label: 'Quản Lý Game Server', description: 'Khởi động và quản lý game server' }],
  ['minecraft', { href: '/dashboard/game-servers', label: 'Quản Lý Game Server', description: 'Quản lý game server' }],
  ['cs2', { href: '/dashboard/game-servers', label: 'Quản Lý Game Server', description: 'Quản lý game server' }],
  ['wordpress', { href: '/dashboard/apps', label: 'Quản Lý Ứng Dụng Cloud', description: 'Quản lý WordPress Cloud' }],
  ['ghost', { href: '/dashboard/apps', label: 'Quản Lý Ứng Dụng Cloud', description: 'Quản lý Ghost Blog Cloud' }],
  ['nextcloud', { href: '/dashboard/apps', label: 'Quản Lý Ứng Dụng Cloud', description: 'Quản lý Nextcloud' }],
  ['static', { href: '/dashboard/static-sites', label: 'Quản Lý Static Sites', description: 'Quản lý website tĩnh' }],
  ['cdn', { href: '/dashboard/cdn', label: 'Quản Lý Cloud CDN', description: 'Quản lý phân phối CDN' }],
  ['vps', { href: '/dashboard/vps-instances', label: 'Quản Lý Máy Chủ VPS', description: 'Truy cập và quản lý VPS của bạn' }],
];

/**
 * Trả về thông tin chuyển hướng (URL, Label, Description) tương ứng dịch vụ đã mua
 */
export function getServiceDashboardUrl(
  categorySlug?: string | null,
  servicePlanName?: string | null,
): ServiceDashboardInfo {
  const cat = (categorySlug || '').trim().toLowerCase();
  const name = (servicePlanName || '').trim().toLowerCase();

  // 1. Nếu tên gói chứa từ khóa đặc thù phi-VPS (Dedicated, Database, Storage, Security, Game, SSL, Hosting, Email, Migration, Static, CDN, Apps), ưu tiên nhận diện ngay!
  if (name) {
    for (const [kw, info] of KEYWORD_MAP) {
      if (kw !== 'vps' && name.includes(kw)) {
        return info;
      }
    }
  }

  // 2. Slug match cho các dịch vụ phi-VPS
  if (cat && cat !== 'vps' && cat !== 'cloud-vps' && SLUG_MAP[cat]) {
    return SLUG_MAP[cat];
  }

  // 3. Nếu tên gói hoặc category thực sự là Cloud VPS
  if (name.includes('vps') || cat === 'vps' || cat === 'cloud-vps') {
    return SLUG_MAP['cloud-vps'];
  }

  // 4. Fallback mặc định an toàn
  return {
    href: '/dashboard/orders',
    label: 'Xem Đơn Hàng Của Bạn',
    description: 'Theo dõi trạng thái và quản lý dịch vụ đã đăng ký',
  };
}

/**
 * Tạo thông báo chi tiết khi thanh toán thành công theo đúng loại dịch vụ
 */
export function getPaymentSuccessMessage(
  categorySlug?: string | null,
  servicePlanName?: string | null,
): string {
  const combined = `${categorySlug || ''} ${servicePlanName || ''}`.toLowerCase();

  if (combined.includes('database') || combined.includes('managed-database') || combined.includes('db ') || combined.includes('postgres') || combined.includes('mysql') || combined.includes('redis')) {
    return 'Cơ sở dữ liệu Managed Database đã được khởi tạo! Chuỗi kết nối bảo mật (Connection String) đã sẵn sàng.';
  }
  if (combined.includes('storage') || combined.includes('object-storage') || combined.includes('s3') || combined.includes('minio')) {
    return 'Kho lưu trữ Object Storage S3 đã sẵn sàng! Access Key và Secret Key đã được tạo tự động.';
  }
  if (combined.includes('security') || combined.includes('waf') || combined.includes('scanner') || combined.includes('bảo mật') || combined.includes('tường lửa')) {
    return 'Tường lửa Cloud WAF & Bộ lọc bảo mật đã được kích hoạt bảo vệ toàn diện cho hệ thống của bạn!';
  }
  if (combined.includes('migration') || combined.includes('cloud-migration') || combined.includes('chuyển đổi') || combined.includes('di dời')) {
    return 'Yêu cầu di dời dữ liệu 24/7 đã được tiếp nhận! Kỹ thuật viên sẽ hỗ trợ chuyển dữ liệu không gián đoạn.';
  }
  if (combined.includes('game') || combined.includes('game-server') || combined.includes('minecraft') || combined.includes('cs2') || combined.includes('rust')) {
    return 'Game Server chống DDoS chuyên dụng đã được kích hoạt! Bạn có thể kết nối ngay vào máy chủ.';
  }
  if (combined.includes('hosting') || combined.includes('web-hosting') || combined.includes('cpanel')) {
    return 'Dịch vụ Web Hosting NVMe đã được khởi tạo tự động! Thông tin đăng nhập cPanel đã được gửi về Gmail của bạn.';
  }
  if (combined.includes('ten-mien') || combined.includes('domain') || combined.includes('tên miền')) {
    return 'Tên miền đã được đăng ký thành công! Hệ thống DNS đã kích hoạt và sẵn sàng trỏ IP.';
  }
  if (combined.includes('ssl') || combined.includes('ssl-certificate')) {
    return 'Yêu cầu phát hành Chứng chỉ SSL đã được tiếp nhận và xử lý tự động! Chứng chỉ sẵn sàng trong trang quản lý.';
  }
  if (combined.includes('dedicated')) {
    return 'Hệ thống đã ghi nhận thanh toán máy chủ riêng Dedicated Server! Kỹ sư hạ tầng đang tiến hành cấu hình phần cứng.';
  }
  if (combined.includes('email') || combined.includes('email-server') || combined.includes('email-hosting')) {
    return 'Hệ thống Email Doanh Nghiệp đã sẵn sàng! Bạn có thể bắt đầu tạo tài khoản hộp thư trong trang quản lý.';
  }
  if (combined.includes('1click-apps') || combined.includes('apps') || combined.includes('wordpress') || combined.includes('nextcloud') || combined.includes('ghost')) {
    return 'Ứng dụng Cloud đã được tự động cài đặt hoàn tất! Bạn có thể truy cập trang quản trị ứng dụng ngay.';
  }
  if (combined.includes('static') || combined.includes('static-sites')) {
    return 'Trang web tĩnh Static Site đã được triển khai lên mạng lưới phân phối CDN toàn cầu thành công!';
  }
  if (combined.includes('cdn') || combined.includes('cloud-cdn')) {
    return 'Mạng phân phối nội dung Cloud CDN đã được kích hoạt và sẵn sàng tăng tốc website!';
  }
  if (combined.includes('vps') || combined.includes('cloud-vps')) {
    return 'Hệ thống đã nhận được tiền, đang khởi tạo máy chủ Cloud VPS và gửi thông số bàn giao tới Gmail của bạn!';
  }

  return 'Giao dịch thanh toán thành công! Dịch vụ đã được ghi nhận và tự động kích hoạt vào tài khoản của bạn.';
}

/**
 * Trả về huy hiệu tên dịch vụ ngắn gọn cho giao diện Giỏ hàng và Checkout
 */
export function getServiceTypeBadge(type?: string, name?: string): string {
  const t = (type || '').toLowerCase();
  const n = (name || '').toLowerCase();

  if (t === 'database' || n.includes('database') || n.includes('postgres') || n.includes('mysql') || n.includes('redis') || n.includes('db ')) return 'Managed Database';
  if (t === 'storage' || n.includes('storage') || n.includes('s3') || n.includes('minio')) return 'Object Storage S3';
  if (t === 'security' || n.includes('security') || n.includes('waf') || n.includes('bảo mật') || n.includes('tường lửa')) return 'Bảo Mật & WAF';
  if (t === 'migration' || n.includes('migration') || n.includes('chuyển đổi') || n.includes('di dời')) return 'Chuyển Đổi Dữ Liệu';
  if (t === 'game' || n.includes('game') || n.includes('minecraft') || n.includes('cs2') || n.includes('rust')) return 'Game Server';
  if (t === 'dedicated' || n.includes('dedicated') || n.includes('máy chủ riêng') || n.includes('máy chủ vật lý')) return 'Dedicated Server';
  if (t === 'ssl' || n.includes('ssl') || n.includes('chứng chỉ')) return 'Chứng Chỉ SSL';
  if (t === 'email' || n.includes('email') || n.includes('mail') || n.includes('hộp thư')) return 'Email Server';
  if (t === 'static' || n.includes('static') || n.includes('web tĩnh')) return 'Static Sites';
  if (t === 'cdn' || n.includes('cdn')) return 'Cloud CDN';
  if (t === 'app' || n.includes('wordpress') || n.includes('ghost') || n.includes('nextcloud') || n.includes('app')) return '1-Click App';
  if (t === 'hosting' || n.includes('hosting') || n.includes('cpanel')) return 'Web Hosting';
  if (t === 'domain' || n.includes('domain') || n.includes('tên miền')) return 'Tên Miền';

  return 'Cloud VPS';
}
