/**
 * getServiceDashboardUrl & getPaymentSuccessMessage
 * ────────────────────────────────────────────────────────────
 * Map categorySlug hoặc servicePlanName sang đúng trang dashboard và thông điệp
 * tương ứng với 13+ dịch vụ Cloud của SEN CloudHost.
 * ────────────────────────────────────────────────────────────
 */

export interface ServiceDashboardInfo {
  href: string;
  label: string;
  description: string;
}

/** Map chính xác theo category slug trong cơ sở dữ liệu và type từ frontend */
export const SLUG_MAP: Record<string, ServiceDashboardInfo> = {
  // 1. Game Servers (Ưu tiên cao nhất tránh nhầm với Dedicated Server)
  'game-server': { href: '/dashboard/game-servers', label: 'Vào Quản Lý Game Server', description: 'Khởi động, cấu hình và quản lý Game Server của bạn' },
  'game-servers': { href: '/dashboard/game-servers', label: 'Vào Quản Lý Game Server', description: 'Khởi động, cấu hình và quản lý Game Server của bạn' },
  'game': { href: '/dashboard/game-servers', label: 'Vào Quản Lý Game Server', description: 'Khởi động, cấu hình và quản lý Game Server của bạn' },

  // 2. Dedicated Server (Máy chủ riêng vật lý)
  'dedicated-server': { href: '/dashboard/dedicated-servers', label: 'Vào Quản Lý Máy Chủ Riêng', description: 'Quản trị máy chủ vật lý riêng biệt Bare Metal' },
  'dedicated-servers': { href: '/dashboard/dedicated-servers', label: 'Vào Quản Lý Máy Chủ Riêng', description: 'Quản trị máy chủ vật lý riêng biệt Bare Metal' },
  'dedicated': { href: '/dashboard/dedicated-servers', label: 'Vào Quản Lý Máy Chủ Riêng', description: 'Quản trị máy chủ vật lý riêng biệt Bare Metal' },

  // 3. Cloud VPS
  'cloud-vps': { href: '/dashboard/vps-instances', label: 'Vào Quản Lý Máy Chủ VPS', description: 'Truy cập và quản lý máy chủ ảo VPS của bạn' },
  'vps': { href: '/dashboard/vps-instances', label: 'Vào Quản Lý Máy Chủ VPS', description: 'Truy cập và quản lý máy chủ ảo VPS của bạn' },

  // 4. Web Hosting
  'web-hosting': { href: '/dashboard/hosting', label: 'Vào Quản Lý Web Hosting', description: 'Quản lý hosting cPanel và website của bạn' },
  'hosting': { href: '/dashboard/hosting', label: 'Vào Quản Lý Web Hosting', description: 'Quản lý hosting cPanel và website của bạn' },
  'cloud-hosting': { href: '/dashboard/hosting', label: 'Vào Quản Lý Web Hosting', description: 'Quản lý hosting cPanel và website của bạn' },

  // 5. Tên Miền
  'ten-mien': { href: '/dashboard/domains', label: 'Vào Quản Lý Tên Miền', description: 'Quản lý bản ghi DNS và cấu hình tên miền của bạn' },
  'domain': { href: '/dashboard/domains', label: 'Vào Quản Lý Tên Miền', description: 'Quản lý bản ghi DNS và cấu hình tên miền của bạn' },
  'domains': { href: '/dashboard/domains', label: 'Vào Quản Lý Tên Miền', description: 'Quản lý bản ghi DNS và cấu hình tên miền của bạn' },

  // 6. Managed Databases
  'managed-database': { href: '/dashboard/databases', label: 'Vào Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý PostgreSQL, MySQL, Redis' },
  'managed-databases': { href: '/dashboard/databases', label: 'Vào Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý PostgreSQL, MySQL, Redis' },
  'databases': { href: '/dashboard/databases', label: 'Vào Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý cơ sở dữ liệu' },
  'database': { href: '/dashboard/databases', label: 'Vào Quản Lý Cơ Sở Dữ Liệu', description: 'Kết nối và quản lý cơ sở dữ liệu' },

  // 7. Object Storage S3
  'object-storage': { href: '/dashboard/storage', label: 'Vào Quản Lý Object Storage S3', description: 'Quản lý bucket và dữ liệu lưu trữ S3' },
  'storage': { href: '/dashboard/storage', label: 'Vào Quản Lý Object Storage S3', description: 'Quản lý bucket và dữ liệu lưu trữ' },

  // 8. Bảo Mật & WAF
  'security-waf': { href: '/dashboard/security', label: 'Vào Quản Lý Bảo Mật & WAF', description: 'Cấu hình tường lửa và chống DDoS L7' },
  'security': { href: '/dashboard/security', label: 'Vào Quản Lý Bảo Mật & WAF', description: 'Cấu hình bảo mật hệ thống' },

  // 9. Chứng Chỉ SSL
  'ssl-certificate': { href: '/dashboard/ssl-certificates', label: 'Vào Quản Lý Chứng Chỉ SSL', description: 'Xem và cài đặt chứng chỉ SSL' },
  'ssl-certificates': { href: '/dashboard/ssl-certificates', label: 'Vào Quản Lý Chứng Chỉ SSL', description: 'Xem và cài đặt chứng chỉ SSL' },
  'ssl': { href: '/dashboard/ssl-certificates', label: 'Vào Quản Lý Chứng Chỉ SSL', description: 'Xem và cài đặt chứng chỉ SSL' },

  // 10. Email Doanh Nghiệp
  'email-server': { href: '/dashboard/email-hosting', label: 'Vào Quản Lý Email Doanh Nghiệp', description: 'Cấu hình hộp thư và tài khoản email' },
  'email-hosting': { href: '/dashboard/email-hosting', label: 'Vào Quản Lý Email Doanh Nghiệp', description: 'Cấu hình hộp thư và tài khoản email' },
  'email': { href: '/dashboard/email-hosting', label: 'Vào Quản Lý Email Doanh Nghiệp', description: 'Cấu hình hộp thư và tài khoản email' },

  // 11. Static Sites
  'static-sites': { href: '/dashboard/static-sites', label: 'Vào Quản Lý Static Sites', description: 'Quản lý trang web tĩnh và CDN' },
  'static': { href: '/dashboard/static-sites', label: 'Vào Quản Lý Static Sites', description: 'Quản lý trang web tĩnh và CDN' },

  // 12. 1-Click Apps
  '1click-apps': { href: '/dashboard/apps', label: 'Vào Quản Lý Ứng Dụng Cloud', description: 'Quản lý WordPress, Nextcloud, Ghost' },
  'app-installer': { href: '/dashboard/apps', label: 'Vào Quản Lý Ứng Dụng Cloud', description: 'Quản lý các ứng dụng đã cài đặt' },
  'apps': { href: '/dashboard/apps', label: 'Vào Quản Lý Ứng Dụng Cloud', description: 'Quản lý các ứng dụng đã cài đặt' },
  'app': { href: '/dashboard/apps', label: 'Vào Quản Lý Ứng Dụng Cloud', description: 'Quản lý các ứng dụng đã cài đặt' },

  // 13. Chuyển Đổi Dữ Liệu (Migration)
  'cloud-migration': { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời website & dữ liệu' },
  'migrations': { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời dữ liệu' },
  'migration': { href: '/dashboard/migrations', label: 'Theo Dõi Chuyển Đổi Dữ Liệu', description: 'Theo dõi tiến trình di dời dữ liệu' },

  // 14. Cloud CDN
  'cloud-cdn': { href: '/dashboard/cdn', label: 'Vào Quản Lý Cloud CDN', description: 'Cấu hình phân phối nội dung tốc độ cao' },
  'cdn': { href: '/dashboard/cdn', label: 'Vào Quản Lý Cloud CDN', description: 'Cấu hình phân phối CDN' },

  // 15. Website Builder
  'website-builder': { href: '/dashboard/website-builder', label: 'Vào Quản Lý Website Builder', description: 'Trình tạo website kéo thả' },
};

/**
 * Trả về thông tin chuyển hướng (URL, Label, Description) tương ứng dịch vụ đã mua
 */
export function getServiceDashboardUrl(
  categorySlug?: string | null,
  servicePlanName?: string | null,
): ServiceDashboardInfo {
  const cat = (categorySlug || '').trim().toLowerCase();
  const name = (servicePlanName || '').trim().toLowerCase();

  // 1. ƯU TIÊN SỐ 1: Phân loại theo categorySlug chuẩn từ DB
  if (cat && SLUG_MAP[cat]) {
    return SLUG_MAP[cat];
  }

  // 2. ƯU TIÊN SỐ 2: Nhận diện theo tên gói (ưu tiên Game Server trước Dedicated Server)
  if (name) {
    // 2.1 Game Server (Phải kiểm tra TRƯỚC dedicated vì các gói Minecraft/CS2 thường có từ 'Dedicated')
    if (
      name.includes('minecraft') ||
      name.includes('cs2') ||
      name.includes('rust') ||
      name.includes('valheim') ||
      name.includes('palworld') ||
      name.includes('game server') ||
      name.includes('game pro') ||
      name.includes('tickrate') ||
      (name.includes('game') && !name.includes('dedicated'))
    ) {
      return SLUG_MAP['game-server'];
    }

    // 2.2 Dedicated Server (Máy chủ riêng vật lý)
    if (
      name.includes('máy chủ riêng') ||
      name.includes('máy chủ vật lý') ||
      name.includes('bare metal') ||
      name.includes('dell poweredge') ||
      name.includes('dell r') ||
      name.includes('epyc') ||
      name.includes('xeon') ||
      (name.includes('dedicated') && !name.includes('game') && !name.includes('minecraft') && !name.includes('cs2'))
    ) {
      return SLUG_MAP['dedicated-server'];
    }

    // 2.3 Managed Database
    if (
      name.includes('database') ||
      name.includes('postgres') ||
      name.includes('mysql') ||
      name.includes('redis') ||
      name.includes('mariadb') ||
      name.includes('mongodb') ||
      name.includes('db ')
    ) {
      return SLUG_MAP['managed-database'];
    }

    // 2.4 Object Storage S3
    if (name.includes('storage') || name.includes('s3') || name.includes('minio') || name.includes('bucket')) {
      return SLUG_MAP['object-storage'];
    }

    // 2.5 Bảo Mật & WAF
    if (name.includes('waf') || name.includes('bảo mật') || name.includes('tường lửa') || name.includes('security') || name.includes('scanner') || name.includes('ddos')) {
      return SLUG_MAP['security-waf'];
    }

    // 2.6 Web Hosting
    if (name.includes('hosting') || name.includes('cpanel') || name.includes('web hosting')) {
      return SLUG_MAP['web-hosting'];
    }

    // 2.7 Tên Miền
    if (name.includes('tên miền') || name.includes('domain') || name.includes('.vn') || name.includes('.com') || name.includes('.net')) {
      return SLUG_MAP['ten-mien'];
    }

    // 2.8 Chứng Chỉ SSL
    if (name.includes('ssl') || name.includes('chứng chỉ') || name.includes('sectigo')) {
      return SLUG_MAP['ssl-certificate'];
    }

    // 2.9 Email Server
    if (name.includes('email') || name.includes('hộp thư') || name.includes('mail server')) {
      return SLUG_MAP['email-server'];
    }

    // 2.10 Static Sites
    if (name.includes('static') || name.includes('web tĩnh')) {
      return SLUG_MAP['static-sites'];
    }

    // 2.11 1-Click Apps
    if (name.includes('wordpress') || name.includes('ghost') || name.includes('nextcloud') || name.includes('app')) {
      return SLUG_MAP['1click-apps'];
    }

    // 2.12 Cloud CDN
    if (name.includes('cdn') || name.includes('phân phối nội dung')) {
      return SLUG_MAP['cloud-cdn'];
    }

    // 2.13 Chuyển Đổi Dữ Liệu
    if (name.includes('chuyển đổi') || name.includes('di dời') || name.includes('migration')) {
      return SLUG_MAP['cloud-migration'];
    }

    // 2.14 Cloud VPS
    if (name.includes('vps') || name.includes('cloud-vps')) {
      return SLUG_MAP['cloud-vps'];
    }
  }

  // 3. Fallback mặc định an toàn
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
  const cat = (categorySlug || '').toLowerCase();
  const name = (servicePlanName || '').toLowerCase();
  const combined = `${cat} ${name}`;

  // 1. Game Server
  if (
    cat.includes('game') ||
    combined.includes('minecraft') ||
    combined.includes('cs2') ||
    combined.includes('rust') ||
    combined.includes('valheim') ||
    combined.includes('game server')
  ) {
    return 'Game Server chống DDoS chuyên dụng đã được kích hoạt! Bạn có thể kết nối ngay vào máy chủ hoặc mở console quản lý.';
  }

  // 2. Dedicated Server (Máy chủ riêng vật lý)
  if (
    cat.includes('dedicated') ||
    (combined.includes('máy chủ riêng') || combined.includes('bare metal') || combined.includes('dell poweredge') || combined.includes('epyc') || combined.includes('xeon')) &&
    !combined.includes('minecraft') && !combined.includes('cs2') && !combined.includes('rust')
  ) {
    return 'Hệ thống đã ghi nhận thanh toán máy chủ riêng Dedicated Server! Kỹ sư hạ tầng đang tiến hành cấu hình phần cứng và bàn giao IPMI.';
  }

  // 3. Managed Database
  if (combined.includes('database') || combined.includes('managed-database') || combined.includes('db ') || combined.includes('postgres') || combined.includes('mysql') || combined.includes('redis')) {
    return 'Cơ sở dữ liệu Managed Database đã được khởi tạo! Chuỗi kết nối bảo mật (Connection String) đã sẵn sàng.';
  }

  // 4. Object Storage S3
  if (combined.includes('storage') || combined.includes('object-storage') || combined.includes('s3') || combined.includes('minio')) {
    return 'Kho lưu trữ Object Storage S3 đã sẵn sàng! Access Key và Secret Key đã được tạo tự động.';
  }

  // 5. Bảo Mật & WAF
  if (combined.includes('security') || combined.includes('waf') || combined.includes('scanner') || combined.includes('bảo mật') || combined.includes('tường lửa')) {
    return 'Tường lửa Cloud WAF & Bộ lọc bảo mật đã được kích hoạt bảo vệ toàn diện cho hệ thống của bạn!';
  }

  // 6. Chuyển Đổi Dữ Liệu
  if (combined.includes('migration') || combined.includes('cloud-migration') || combined.includes('chuyển đổi') || combined.includes('di dời')) {
    return 'Yêu cầu di dời dữ liệu 24/7 đã được tiếp nhận! Kỹ thuật viên sẽ hỗ trợ chuyển dữ liệu không gián đoạn.';
  }

  // 7. Web Hosting
  if (combined.includes('hosting') || combined.includes('web-hosting') || combined.includes('cpanel')) {
    return 'Dịch vụ Web Hosting NVMe đã được khởi tạo tự động! Thông tin đăng nhập cPanel đã được gửi về Gmail của bạn.';
  }

  // 8. Tên Miền
  if (combined.includes('ten-mien') || combined.includes('domain') || combined.includes('tên miền')) {
    return 'Tên miền đã được đăng ký thành công! Hệ thống DNS đã kích hoạt và sẵn sàng trỏ IP.';
  }

  // 9. Chứng Chỉ SSL
  if (combined.includes('ssl') || combined.includes('ssl-certificate')) {
    return 'Yêu cầu phát hành Chứng chỉ SSL đã được tiếp nhận và xử lý tự động! Chứng chỉ sẵn sàng trong trang quản lý.';
  }

  // 10. Email Server
  if (combined.includes('email') || combined.includes('email-server') || combined.includes('email-hosting')) {
    return 'Hệ thống Email Doanh Nghiệp đã sẵn sàng! Bạn có thể bắt đầu tạo tài khoản hộp thư trong trang quản lý.';
  }

  // 11. 1-Click Apps
  if (combined.includes('1click-apps') || combined.includes('apps') || combined.includes('wordpress') || combined.includes('nextcloud') || combined.includes('ghost')) {
    return 'Ứng dụng Cloud đã được tự động cài đặt hoàn tất! Bạn có thể truy cập trang quản trị ứng dụng ngay.';
  }

  // 12. Static Sites
  if (combined.includes('static') || combined.includes('static-sites')) {
    return 'Trang web tĩnh Static Site đã được triển khai lên mạng lưới phân phối CDN toàn cầu thành công!';
  }

  // 13. Cloud CDN
  if (combined.includes('cdn') || combined.includes('cloud-cdn')) {
    return 'Mạng phân phối nội dung Cloud CDN đã được kích hoạt và sẵn sàng tăng tốc website!';
  }

  // 14. Cloud VPS
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

  // 1. Game Server (Kiểm tra trước vì thường có từ 'Dedicated')
  if (
    t === 'game' || 
    t === 'game-server' || 
    n.includes('game') || 
    n.includes('minecraft') || 
    n.includes('cs2') || 
    n.includes('rust') || 
    n.includes('valheim')
  ) {
    return 'Game Server';
  }

  // 2. Dedicated Server
  if (
    t === 'dedicated' || 
    t === 'dedicated-server' || 
    n.includes('máy chủ riêng') || 
    n.includes('máy chủ vật lý') || 
    n.includes('bare metal') || 
    (n.includes('dedicated') && !n.includes('game') && !n.includes('minecraft') && !n.includes('cs2'))
  ) {
    return 'Dedicated Server';
  }

  // 3. Managed Database
  if (t === 'database' || t === 'managed-database' || n.includes('database') || n.includes('postgres') || n.includes('mysql') || n.includes('redis') || n.includes('db ')) {
    return 'Managed Database';
  }

  // 4. Object Storage S3
  if (t === 'storage' || t === 'object-storage' || n.includes('storage') || n.includes('s3') || n.includes('minio')) {
    return 'Object Storage S3';
  }

  // 5. Bảo Mật & WAF
  if (t === 'security' || t === 'security-waf' || n.includes('security') || n.includes('waf') || n.includes('bảo mật') || n.includes('tường lửa')) {
    return 'Bảo Mật & WAF';
  }

  // 6. Chuyển Đổi Dữ Liệu
  if (t === 'migration' || t === 'cloud-migration' || n.includes('migration') || n.includes('chuyển đổi') || n.includes('di dời')) {
    return 'Chuyển Đổi Dữ Liệu';
  }

  // 7. Chứng Chỉ SSL
  if (t === 'ssl' || t === 'ssl-certificate' || n.includes('ssl') || n.includes('chứng chỉ')) {
    return 'Chứng Chỉ SSL';
  }

  // 8. Email Server
  if (t === 'email' || t === 'email-server' || t === 'email-hosting' || n.includes('email') || n.includes('mail') || n.includes('hộp thư')) {
    return 'Email Server';
  }

  // 9. Static Sites
  if (t === 'static' || t === 'static-sites' || n.includes('static') || n.includes('web tĩnh')) {
    return 'Static Sites';
  }

  // 10. Cloud CDN
  if (t === 'cdn' || t === 'cloud-cdn' || n.includes('cdn')) {
    return 'Cloud CDN';
  }

  // 11. 1-Click Apps
  if (t === 'app' || t === '1click-apps' || n.includes('wordpress') || n.includes('ghost') || n.includes('nextcloud') || n.includes('app')) {
    return '1-Click App';
  }

  // 12. Web Hosting
  if (t === 'hosting' || t === 'web-hosting' || n.includes('hosting') || n.includes('cpanel')) {
    return 'Web Hosting';
  }

  // 13. Tên Miền
  if (t === 'domain' || t === 'ten-mien' || n.includes('domain') || n.includes('tên miền')) {
    return 'Tên Miền';
  }

  return 'Cloud VPS';
}
