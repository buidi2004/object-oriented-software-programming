import { DomainResult, HostingPackage, CloudInstance } from '../types';
import type { OsTemplateKey, DatacenterRegionKey } from '../types';

export const DOMAIN_EXTENSIONS: DomainResult[] = [
  { extension: '.com', pricePerYear: 290000, originalPrice: 350000, isPopular: true, available: true, featuredText: 'Phổ biến nhất' },
  { extension: '.vn', pricePerYear: 750000, originalPrice: 850000, isPopular: true, available: true, featuredText: 'Uy tín Thương hiệu Việt' },
  { extension: '.net', pricePerYear: 320000, originalPrice: 380000, available: true },
  { extension: '.com.vn', pricePerYear: 650000, originalPrice: 720000, available: true },
  { extension: '.org', pricePerYear: 310000, originalPrice: 360000, available: true },
  { extension: '.info', pricePerYear: 190000, originalPrice: 280000, available: true },
  { extension: '.ai', pricePerYear: 1850000, available: true, featuredText: 'Công nghệ AI' },
  { extension: '.xyz', pricePerYear: 99000, originalPrice: 250000, available: true }
];

export const HOSTING_PACKAGES: HostingPackage[] = [
  {
    id: 'nvme-lite',
    name: 'NVMe Hosting Starter',
    tagline: 'Phù hợp cho cá nhân, Blog & Landing Page nhỏ',
    monthlyPrice: 49000,
    yearlyPriceMonthly: 39000,
    specs: {
      storage: '5 GB Enterprise NVMe SSD',
      bandwidth: 'Không giới hạn',
      domains: '1 Website',
      ram: '1 GB Physical RAM',
      cpu: '1 vCPU Core',
      ssl: 'Miễn phí Let\'s Encrypt SSL',
      backup: 'Tự động hàng tuần'
    },
    features: [
      'LiteSpeed Web Server + LSCache',
      'cPanel Quản trị chuẩn quốc tế',
      'Quét Mã Độc Imunify360',
      'Anti-DDoS cơ bản 10Gbps',
      'Hỗ trợ kỹ thuật 24/7/365'
    ]
  },
  {
    id: 'nvme-pro',
    name: 'NVMe Business Pro',
    tagline: 'Lựa chọn số 1 cho Doanh nghiệp & Web Bán hàng',
    monthlyPrice: 129000,
    yearlyPriceMonthly: 99000,
    isPopular: true,
    specs: {
      storage: '20 GB Enterprise NVMe SSD',
      bandwidth: 'Không giới hạn',
      domains: '5 Websites',
      ram: '2 GB Physical RAM',
      cpu: '2 vCPU Cores',
      ssl: 'Miễn phí SSL Wildcard',
      backup: 'Tự động hàng ngày (Daily)'
    },
    features: [
      'LiteSpeed Web Server + LSCache Pro',
      'Tối ưu tốc độ gấp 10 lần WordPress',
      'Imunify360 AI Shield Chống Hacker',
      'Anti-DDoS Pro Chống nghẽn',
      'Miễn phí 01 Tên miền .com (Hạn năm)',
      'Hỗ trợ chuyển dữ liệu Miễn phí'
    ]
  },
  {
    id: 'nvme-ultra',
    name: 'Cloud Enterprise Turbo',
    tagline: 'Dành cho Ecommerce, App & Hệ thống chịu tải lớn',
    monthlyPrice: 299000,
    yearlyPriceMonthly: 239000,
    specs: {
      storage: '60 GB Enterprise NVMe SSD',
      bandwidth: 'Không giới hạn băng thông',
      domains: 'Không giới hạn Website',
      ram: '6 GB Physical RAM',
      cpu: '4 vCPU Cores',
      ssl: 'Miễn phí Premium SSL',
      backup: 'Tự động hàng ngày (Lưu 14 bản)'
    },
    features: [
      'Hạ tầng chuyên dụng AMD EPYC',
      'IP Riêng (Dedicated IP) đi kèm',
      'Dedicated Redis / Memcached',
      'Anti-DDoS Enterprise 500Gbps',
      'Cam kết Uptime 99.99% SLA',
      'Chuyên viên tư vấn kỹ thuật riêng'
    ]
  }
];

export const INITIAL_INSTANCES: CloudInstance[] = [
  {
    id: 'vps-hnn-01',
    name: 'Core-API-Prod-Hanoi',
    ip: '103.149.28.112',
    os: 'Ubuntu 24.04 LTS',
    cpu: 4,
    ram: 8,
    disk: 80,
    status: 'running',
    datacenter: 'Hà Nội (DC Tier III Viettel)',
    uptimeDays: 142,
    cpuUsage: 24,
    ramUsage: 48,
    bandwidthMbps: 185
  },
  {
    id: 'vps-sg-02',
    name: 'DB-Postgres-Master-HCM',
    ip: '103.200.15.89',
    os: 'Debian 12 Stable',
    cpu: 8,
    ram: 16,
    disk: 160,
    status: 'running',
    datacenter: 'TP. Hồ Chí Minh (DC Tier III FPT)',
    uptimeDays: 89,
    cpuUsage: 42,
    ramUsage: 65,
    bandwidthMbps: 310
  }
];

export const OS_OPTIONS: {
  id: string;
  name: string;
  osKey: OsTemplateKey;
  type: 'Linux' | 'Windows';
}[] = [
  { id: 'ubuntu-24', name: 'Ubuntu 24.04 LTS', osKey: 'ubuntu', type: 'Linux' },
  { id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS', osKey: 'ubuntu', type: 'Linux' },
  { id: 'debian-12', name: 'Debian 12 Bookworm', osKey: 'debian', type: 'Linux' },
  { id: 'almalinux-9', name: 'AlmaLinux 9.4', osKey: 'almalinux', type: 'Linux' },
  { id: 'windows-2022', name: 'Windows Server 2022 Standard', osKey: 'windows', type: 'Windows' },
];

export const DATACENTER_LOCATIONS: {
  id: string;
  name: string;
  detail: string;
  latency: string;
  region: DatacenterRegionKey;
  shortLabel: string;
}[] = [
  { id: 'hn', name: 'Hà Nội', detail: 'Datacenter Viettel Hòa Lạc (Tier III)', latency: '< 5ms', region: 'vn-hn', shortLabel: 'VN Hà Nội' },
  { id: 'hcm', name: 'TP. Hồ Chí Minh', detail: 'Datacenter FPT Tân Thuận (Tier III)', latency: '< 6ms', region: 'vn-hcm', shortLabel: 'VN TP. HCM' },
  { id: 'sg', name: 'Singapore', detail: 'Equinix SG1 International Hub', latency: '< 25ms', region: 'sg', shortLabel: 'SG Singapore' },
];

export const FAQS = [
  {
    q: 'Thời gian khởi tạo Cloud VPS và Hosting mất bao lâu?',
    a: 'Hệ thống của CloudHost VN áp dụng tự động hóa 100%. Sau khi thanh toán thành công, dịch vụ của bạn sẽ được khởi tạo tự động trong vòng 30 giây đến 2 phút và gửi thông tin quản trị qua Email.'
  },
  {
    q: 'CloudHost VN có hỗ trợ chuyển dữ liệu từ nhà cung cấp cũ về không?',
    a: 'Có! Đội ngũ kỹ thuật viên của chúng tôi hỗ trợ chuyển toàn bộ dữ liệu Web, Database, Cấu hình từ nhà cung cấp cũ về CloudHost VN hoàn toàn MIỄN PHÍ và KHÔNG gây gián đoạn dịch vụ.'
  },
  {
    q: 'Băng thông tại CloudHost VN có bị giới hạn không?',
    a: 'Tất cả các gói Cloud Server và NVMe Hosting tại Việt Nam đều cung cấp BĂNG THÔNG KHÔNG GIỚI HẠN với kết nối cổng mạng port 1Gbps - 10Gbps nội địa mượt mà.'
  },
  {
    q: 'Tôi có thể nâng cấp cấu hình máy chủ sau này không?',
    a: 'Hoàn toàn được! Bạn có thể nâng cấp CPU, RAM, SSD ngay lập tức trên Bảng điều khiển quản trị bất kỳ lúc nào mà không bị gián đoạn hay mất dữ liệu.'
  }
];

export const REVIEWS = [
  {
    name: 'Nguyễn Minh Tuấn',
    role: 'CTO @ TechVn Solutions',
    comment: 'Hạ tầng Cloud Server của CloudHost VN cực kỳ ổn định. Độ trễ thấp dưới 5ms tại Hà Nội, IOPS của ổ NVMe rất ấn tượng. Kỹ thuật hỗ trợ qua Ticket & Zalo chỉ mất vài phút.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    stars: 5
  },
  {
    name: 'Lê Hoàng Yến',
    role: 'Founder @ ShopThoiTrang.vn',
    comment: 'Website thương mại điện tử của mình chạy mượt hơn hẳn sau khi chuyển về gói NVMe Business Pro. Đợt Sale vừa rồi truy cập tăng gấp 5 lần vẫn chạy xé gió!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    stars: 5
  },
  {
    name: 'Trần Đức Anh',
    role: 'Fullstack Lead Developer',
    comment: 'Giao diện quản trị VPS cực kỳ hiện đại, tự động Reinstall OS, Reboot và mở VNC Console trực tiếp ngay trên trình duyệt vô cùng tiện lợi.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    stars: 5
  }
];
