export type ServicePageVariant = 'vps' | 'hosting' | 'domain';

export interface ServiceStat {
  value: string;
  label: string;
  detail: string;
}

export interface ServicePromotion {
  badge: string;
  title: string;
  description: string;
  discount: string;
  code?: string;
  validUntil?: string;
}

export interface ServiceFeatureBlock {
  title: string;
  description: string;
  bullets: string[];
}

export interface ServiceUseCase {
  title: string;
  description: string;
  tags: string[];
}

export interface ServiceSpecRow {
  label: string;
  values: string[];
  highlightIndex?: number;
}

export interface ServiceAddon {
  name: string;
  price: string;
  description: string;
}

export interface ServiceTestimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  rating: number;
}

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServicePageContent {
  variant: ServicePageVariant;
  stats: ServiceStat[];
  promotions: ServicePromotion[];
  deepFeatures: ServiceFeatureBlock[];
  useCases: ServiceUseCase[];
  specTable?: {
    title: string;
    columns: string[];
    rows: ServiceSpecRow[];
  };
  infrastructure: {
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  sla: {
    title: string;
    items: { metric: string; commitment: string; compensation: string }[];
  };
  addons: ServiceAddon[];
  testimonials: ServiceTestimonial[];
  integrations: string[];
  migration: {
    title: string;
    description: string;
    steps: string[];
  };
  extendedFaqs: ServiceFaq[];
  relatedServices: { label: string; href: string; description: string }[];
}

const VPS_CONTENT: ServicePageContent = {
  variant: 'vps',
  stats: [
    { value: '99.99%', label: 'SLA Uptime', detail: 'Cam kết hoạt động liên tục, bồi thường nếu vi phạm' },
    { value: '30 giây', label: 'Triển khai', detail: 'VPS sẵn sàng ngay sau thanh toán thành công' },
    { value: '500 Gbps', label: 'Anti-DDoS', detail: 'Lọc tấn công tự động 24/7 tại tầng network' },
    { value: '24/7/365', label: 'Hỗ trợ kỹ thuật', detail: 'Đội ngũ Việt Nam, phản hồi trung bình < 15 phút' },
  ],
  promotions: [
    {
      badge: 'Ưu đãi mới',
      title: 'Giảm 20% khi thanh toán năm',
      description: 'Áp dụng cho tất cả gói Cloud VPS khi chọn chu kỳ thanh toán 12 tháng.',
      discount: '-20%',
      code: 'VPSYEAR20',
      validUntil: '31/12/2026',
    },
    {
      badge: 'Tặng thêm',
      title: 'Miễn phí Snapshot 30 ngày',
      description: 'Tặng gói snapshot tự động hàng ngày trong 30 ngày đầu cho khách hàng mới.',
      discount: 'FREE',
      validUntil: 'Hết khi đủ suất',
    },
    {
      badge: 'Doanh nghiệp',
      title: 'Giảm thêm 10% từ gói thứ 3',
      description: 'Mua từ 3 VPS trở lên trong cùng tài khoản doanh nghiệp được giảm thêm 10%.',
      discount: '-10%',
      code: 'BULKVPS10',
    },
  ],
  deepFeatures: [
    {
      title: 'Hạ tầng AMD EPYC Gen4',
      description: 'Máy chủ vật lý sử dụng CPU AMD EPYC 9004 Series với kiến trúc Zen 4, tối ưu cho workload đa luồng.',
      bullets: [
        'Turbo Boost lên đến 4.4 GHz cho tác vụ nặng',
        'NUMA-aware scheduling giảm latency',
        'Không overselling CPU — tài nguyên cam kết cứng',
        'Benchmark Geekbench vượt 40% so với thế hệ cũ',
      ],
    },
    {
      title: 'NVMe SSD Enterprise',
      description: 'Ổ cứng Samsung PM9A3 / Micron 7450 với DRAM cache, đảm bảo IOPS ổn định khi tải cao.',
      bullets: [
        'Random Read: 500.000+ IOPS',
        'Sequential Read/Write: 7.000 MB/s',
        'Latency trung bình < 0.2ms',
        'RAID 10 + replication giữa 2 node',
      ],
    },
    {
      title: 'Mạng 10Gbps Redundant',
      description: 'Kết nối multi-homed tới VNIX, FPT Telecom, Viettel IDC với BGP anycast.',
      bullets: [
        'Băng thông trong nước không giới hạn',
        'Quốc tế 10TB/tháng, mua thêm linh hoạt',
        'IPv4 + IPv6 native dual-stack',
        'Private VLAN giữa các VPS cùng tài khoản',
      ],
    },
    {
      title: 'Bảo mật đa lớp',
      description: 'Firewall tích hợp, snapshot mã hóa, và giám sát anomaly detection 24/7.',
      bullets: [
        'Cloud Firewall rules miễn phí không giới hạn',
        'Snapshot mã hóa AES-256 at-rest',
        '2FA bắt buộc cho thao tác nhạy cảm',
        'Audit log 90 ngày trên Bảng điều khiển',
      ],
    },
    {
      title: 'Quản trị linh hoạt',
      description: 'Console VNC, reinstall OS 1-click, API Terraform và webhook tích hợp CI/CD.',
      bullets: [
        'Reinstall OS trong 60 giây',
        'Rescue mode khôi phục khi lỗi boot',
        'API RESTful + Terraform provider',
        'Webhook thông báo trạng thái VPS',
      ],
    },
    {
      title: 'Backup & Disaster Recovery',
      description: 'Snapshot thủ công/automatic, restore point-in-time và cross-region backup tùy chọn.',
      bullets: [
        'Snapshot thủ công: miễn phí, không giới hạn số lần',
        'Auto-backup hàng ngày (add-on giá ưu đãi)',
        'Restore 1-click không downtime',
        'Cross-region backup sang HCM ↔ HN',
      ],
    },
  ],
  useCases: [
    { title: 'E-Commerce & Marketplace', description: 'Magento, WooCommerce, Shopify headless cần IOPS cao và uptime 99.99%.', tags: ['WooCommerce', 'Magento', 'Redis'] },
    { title: 'DevOps & CI/CD', description: 'Chạy GitLab Runner, Jenkins, Docker registry trên VPS riêng biệt.', tags: ['Docker', 'GitLab', 'Kubernetes'] },
    { title: 'Game Server', description: 'Minecraft, CS2, Valheim với network latency thấp và Anti-DDoS gaming.', tags: ['Minecraft', 'Steam', 'UDP'] },
    { title: 'ERP & CRM', description: 'Odoo, SAP Business One, Microsoft Dynamics cần RAM lớn và backup định kỳ.', tags: ['Odoo', 'SQL Server', 'PostgreSQL'] },
    { title: 'AI / Machine Learning', description: 'Training model nhẹ, inference API với GPU add-on (RTX A4000).', tags: ['Python', 'TensorFlow', 'CUDA'] },
    { title: 'Agency & Reseller', description: 'White-label VPS cho khách hàng với quản lý multi-tenant trên 1 tài khoản.', tags: ['WHMCS', 'Reseller', 'Agency'] },
  ],
  specTable: {
    title: 'So sánh cấu hình các gói Cloud VPS',
    columns: ['Tính năng', 'VPS Starter', 'VPS Pro ⭐', 'VPS Enterprise'],
    rows: [
      { label: 'vCPU', values: ['2 Core', '4 Core', '8 Core'], highlightIndex: 1 },
      { label: 'RAM', values: ['4 GB', '8 GB', '16 GB'], highlightIndex: 1 },
      { label: 'NVMe SSD', values: ['60 GB', '120 GB', '240 GB'], highlightIndex: 1 },
      { label: 'Băng thông', values: ['Không giới hạn', 'Không giới hạn', 'Không giới hạn'] },
      { label: 'IPv4', values: ['1', '1', '2'] },
      { label: 'Snapshot', values: ['Thủ công', 'Auto daily', 'Auto daily + cross-region'] },
      { label: 'Anti-DDoS', values: ['100 Gbps', '300 Gbps', '500 Gbps'] },
      { label: 'Backup retention', values: ['7 ngày', '14 ngày', '30 ngày'] },
      { label: 'SLA', values: ['99.9%', '99.99%', '99.99%'] },
      { label: 'Hỗ trợ', values: ['Ticket', 'Ticket + Chat', 'Priority 24/7'] },
    ],
  },
  infrastructure: {
    title: 'Hạ Tầng Data Center Tier III+',
    subtitle: '2 trung tâm dữ liệu tại Hà Nội và TP.HCM với kiến trúc active-active',
    items: [
      { title: 'VNPT IDC Hà Nội', description: 'Tier III, nguồn điện dự phòng N+1, làm mát InRow precision cooling, PUE 1.4.' },
      { title: 'FPT Telecom HCM', description: 'Tier III+, kết nối trực tiếp VNIX và IX peering quốc tế, latency < 5ms nội thành.' },
      { title: 'Virtualization Stack', description: 'KVM/QEMU trên Proxmox VE 8.x, Ceph distributed storage, live migration zero downtime.' },
      { title: 'Monitoring', description: 'Prometheus + Grafana, cảnh báo SMS/Email/Zalo khi CPU/RAM/Disk vượt ngưỡng.' },
    ],
  },
  sla: {
    title: 'Cam Kết SLA Cloud VPS',
    items: [
      { metric: 'Network Uptime', commitment: '99.99%', compensation: 'Credit 10% phí tháng / 0.01% vi phạm' },
      { metric: 'Hardware Replacement', commitment: '< 4 giờ', compensation: 'Credit 5% nếu vượt 4 giờ' },
      { metric: 'Support Response', commitment: '< 15 phút (Priority)', compensation: 'Credit 3% nếu vượt 30 phút' },
      { metric: 'Scheduled Maintenance', commitment: 'Thông báo trước 72h', compensation: 'Không tính vào downtime' },
    ],
  },
  addons: [
    { name: 'Auto Backup Daily', price: 'Giá ưu đãi', description: 'Snapshot tự động hàng ngày, giữ 14 bản gần nhất' },
    { name: 'Dedicated IPv4', price: 'Giá ưu đãi', description: 'IP tĩnh riêng, không chia sẻ NAT' },
    { name: 'GPU RTX A4000', price: 'Giá ưu đãi', description: '16GB VRAM cho AI inference / rendering' },
    { name: 'Managed Service', price: 'Giá ưu đãi', description: 'Admin cài đặt, patch bảo mật, monitoring 24/7' },
    { name: 'Windows Server License', price: '3Giá ưu đãi', description: 'Windows Server 2022 Standard genuine license' },
    { name: 'Extra 100GB NVMe', price: 'Giá ưu đãi', description: 'Mở rộng dung lượng SSD không cần migrate' },
  ],
  testimonials: [
    { name: 'Nguyễn Minh Tuấn', role: 'CTO', company: 'ShopVN E-commerce', quote: 'Chuyển từ AWS sang CloudHost VPS tiết kiệm 40% chi phí mà tốc độ load trang nhanh hơn hẳn. Support phản hồi cực nhanh.', rating: 5 },
    { name: 'Trần Hoài Nam', role: 'DevOps Lead', company: 'FinTech Startup', quote: 'API Terraform hoạt động mượt, spin up 20 VPS cho staging chỉ mất vài phút. Anti-DDoS cứu chúng tôi khỏi 2 đợt tấn công lớn.', rating: 5 },
    { name: 'Lê Phương Anh', role: 'Founder', company: 'Game Studio VN', quote: 'Game server Minecraft 200 slot chạy ổn định, ping trung bình 15ms cho player miền Bắc. Rất hài lòng.', rating: 5 },
  ],
  integrations: ['Docker', 'Kubernetes', 'Terraform', 'Ansible', 'GitLab CI', 'GitHub Actions', 'Prometheus', 'Cloudflare', 'WHMCS', 'DirectAdmin'],
  migration: {
    title: 'Chuyển VPS Miễn Phí — Không Gián Đoạn',
    description: 'Đội ngũ kỹ thuật hỗ trợ migrate toàn bộ dữ liệu, cấu hình và DNS từ nhà cung cấp cũ sang CloudHost VN hoàn toàn miễn phí.',
    steps: [
      'Đăng ký VPS mới và cung cấp thông tin server nguồn',
      'Kỹ thuật viên lên kế hoạch migrate và backup đầy đủ',
      'Sync dữ liệu qua rsync/ZFS replication ngoài giờ cao điểm',
      'Cutover DNS với TTL thấp, downtime < 5 phút',
      'Kiểm tra 72h sau migrate, hỗ trợ fine-tuning miễn phí',
    ],
  },
  extendedFaqs: [
    { q: 'Cloud VPS khác gì với Shared Hosting?', a: 'Cloud VPS cung cấp tài nguyên riêng biệt (CPU, RAM, Disk) không chia sẻ. Bạn có Root Access, cài bất kỳ OS/phần mềm nào.' },
    { q: 'Tôi có thể nâng cấp cấu hình sau không?', a: 'Có! Nâng cấp CPU/RAM/SSD ngay trên Bảng điều khiển, thường chỉ cần reboot ngắn (< 2 phút).' },
    { q: 'Hệ điều hành nào được hỗ trợ?', a: 'Ubuntu 22.04/24.04, Debian 12, AlmaLinux 9, CentOS Stream 9, Rocky Linux 9, Windows Server 2022.' },
    { q: 'Uptime cam kết là bao nhiêu?', a: 'SLA 99.99% cho gói Pro trở lên. Vi phạm được bồi thường credit theo chính sách SLA công bố.' },
    { q: 'Có hỗ trợ chuyển dữ liệu từ nhà cung cấp cũ không?', a: 'Có, miễn phí 100%. Team kỹ thuật hỗ trợ end-to-end, cam kết downtime tối thiểu.' },
    { q: 'VPS có bị giới hạn băng thông quốc tế không?', a: 'Băng thong trong nước không giới hạn. Quốc tế 10TB/tháng, mua thêm với giá rẻ.' },
    { q: 'Tôi có thể cài Docker/Kubernetes không?', a: 'Hoàn toàn được. VPS hỗ trợ nested virtualization, phù hợp chạy Docker, K3s, MicroK8s.' },
    { q: 'Chính sách hoàn tiền?', a: 'Hoàn 100% trong 7 ngày đầu nếu không hài lòng. Sau 7 ngày hoàn pro-rata theo tháng chưa sử dụng.' },
    { q: 'Có hỗ trợ IPv6 không?', a: 'Có, mỗi VPS được cấp /64 IPv6 native miễn phí, cấu hình trên Bảng điều khiển.' },
    { q: 'Thanh toán qua những hình thức nào?', a: 'VNPay, MoMo, chuyển khoản ngân hàng, thẻ quốc tế Visa/Mastercard, ví CloudHost.' },
  ],
  relatedServices: [
    { label: 'NVMe Web Hosting', href: '/services/hosting', description: 'Hosting tối ưu WordPress, WooCommerce với LiteSpeed' },
    { label: 'Đăng Ký Tên Miền', href: '/services/domain', description: 'Tên miền .com, .vn giá tốt, DNS miễn phí' },
    { label: 'SSL Certificates', href: '/services/ssl-certificates', description: 'Chứng chỉ SSL DV, OV, EV bảo mật website' },
  ],
};

const HOSTING_CONTENT: ServicePageContent = {
  variant: 'hosting',
  stats: [
    { value: '10x', label: 'Tốc độ LiteSpeed', detail: 'Nhanh hơn Apache/Nginx trên cùng phần cứng' },
    { value: '99.99%', label: 'SLA Uptime', detail: 'Cam kết cho gói Business Pro trở lên' },
    { value: 'Miễn phí', label: 'Chuyển hosting', detail: 'Migrate website + email + database' },
    { value: '24/7', label: 'Hỗ trợ', detail: 'Chat, ticket, hotline kỹ thuật Việt Nam' },
  ],
  promotions: [
    {
      badge: 'Flash Sale',
      title: 'Hosting năm đầu giảm 25%',
      description: 'Gói Business Pro hiện đang được giảm giá cực sốc.',
      discount: '-25%',
      code: 'HOST25',
      validUntil: '30/09/2026',
    },
    {
      badge: 'Tặng kèm',
      title: 'Miễn phí tên miền .com 1 năm',
      description: 'Khi mua gói Business Pro hoặc Enterprise Turbo thanh toán năm.',
      discount: 'FREE .com',
    },
    {
      badge: 'Agency',
      title: 'Giảm 15% cho 5+ hosting',
      description: 'Agency quản lý nhiều website được giảm thêm 15% trên tổng hóa đơn.',
      discount: '-15%',
      code: 'AGENCY15',
    },
  ],
  deepFeatures: [
    {
      title: 'LiteSpeed Web Server + LSCache',
      description: 'Web server thế hệ mới thay thế Apache, tích hợp cache server-side cho WordPress, Laravel, Magento.',
      bullets: [
        'Tăng tốc WordPress gấp 10 lần so với hosting thường',
        'LSCache plugin miễn phí, cấu hình 1-click',
        'HTTP/3 QUIC support cho mobile',
        'Brotli compression giảm 30% dung lượng transfer',
      ],
    },
    {
      title: 'Imunify360 AI Security',
      description: 'Hệ thống bảo mật AI phát hiện malware, brute-force và vulnerability real-time.',
      bullets: [
        'Malware scanner tự động hàng ngày',
        'Proactive defense chặn 0-day exploit',
        'Patch management PHP/MySQL tự động',
        'WAF rules cập nhật hàng tuần',
      ],
    },
    {
      title: 'cPanel/WHM Quản Trị Pro',
      description: 'Giao diện quản trị hosting chuẩn quốc tế, thân thiện cho người không chuyên.',
      bullets: [
        'Softaculous 1-click install 400+ app',
        'File Manager, phpMyAdmin, Cron jobs',
        'Email accounts không giới hạn (Business+)',
        'Staging environment 1-click clone',
      ],
    },
    {
      title: 'Email Hosting Chuyên Nghiệp',
      description: 'Email theo tên miền với anti-spam, DKIM/SPF/DMARC tự động cấu hình.',
      bullets: [
        'Webmail Roundcube + mobile sync IMAP/POP3',
        'Anti-spam SpamAssassin + greylisting',
        'DKIM/SPF/DMARC auto-setup',
        'Email forwarding & alias không giới hạn',
      ],
    },
    {
      title: 'Backup & Staging',
      description: 'Sao lưu tự động hàng ngày, restore 1-click và môi trường staging an toàn.',
      bullets: [
        'JetBackup daily với 14 restore points',
        'Restore file/database/email riêng lẻ',
        'Staging clone website test trước khi deploy',
        'Download backup về local miễn phí',
      ],
    },
    {
      title: 'Tối Ưu CMS Phổ Biến',
      description: 'Pre-configured stack cho WordPress, WooCommerce, Laravel, Joomla, Drupal.',
      bullets: [
        'PHP 8.2/8.3 selector per directory',
        'Redis object cache miễn phí (Business+)',
        'MySQL 8.0 / MariaDB 10.11',
        'Composer, Node.js, Git deployment',
      ],
    },
  ],
  useCases: [
    { title: 'WordPress Blog & Magazine', description: 'Blog cá nhân, tạp chí online với LSCache và CDN tích hợp.', tags: ['WordPress', 'LSCache', 'CDN'] },
    { title: 'WooCommerce Store', description: 'Shop online với Redis cache, SSL và payment gateway tối ưu.', tags: ['WooCommerce', 'Redis', 'SSL'] },
    { title: 'Laravel / PHP App', description: 'Ứng dụng PHP custom với Composer, queue worker và cron.', tags: ['Laravel', 'PHP 8.3', 'MySQL'] },
    { title: 'Agency Multi-site', description: 'Quản lý nhiều website khách hàng trên 1 tài khoản reseller.', tags: ['cPanel', 'WHM', 'Reseller'] },
    { title: 'Landing Page Marketing', description: 'Trang đích quảng cáo cần tốc độ load < 1 giây.', tags: ['LiteSpeed', 'Brotli', 'HTTP/3'] },
    { title: 'Email Doanh Nghiệp', description: 'Email @tenmien.com.vn chuyên nghiệp kèm hosting.', tags: ['Email', 'DKIM', 'Webmail'] },
  ],
  specTable: {
    title: 'So sánh chi tiết các gói Hosting',
    columns: ['Tính năng', 'Starter', 'Business Pro ⭐', 'Enterprise Turbo'],
    rows: [
      { label: 'NVMe SSD', values: ['5 GB', '20 GB', '60 GB'], highlightIndex: 1 },
      { label: 'Băng thông', values: ['Không giới hạn', 'Không giới hạn', 'Không giới hạn'] },
      { label: 'Số Website', values: ['1', '5', 'Không giới hạn'], highlightIndex: 1 },
      { label: 'RAM', values: ['1 GB', '2 GB', '6 GB'] },
      { label: 'vCPU', values: ['1 Core', '2 Cores', '4 Cores'] },
      { label: 'SSL', values: ["Let's Encrypt", 'Wildcard', 'Premium EV'] },
      { label: 'Backup', values: ['Hàng tuần', 'Hàng ngày', 'Hàng ngày (14 bản)'] },
      { label: 'LiteSpeed', values: ['✓', '✓ Pro', '✓ Enterprise'] },
      { label: 'Anti-DDoS', values: ['10 Gbps', '100 Gbps', '500 Gbps'] },
      { label: 'Tên miền free', values: ['—', '1x .com', '1x .com'] },
      { label: 'Dedicated IP', values: ['—', '—', '✓'] },
      { label: 'SLA', values: ['99.9%', '99.9%', '99.99%'] },
    ],
  },
  infrastructure: {
    title: 'Hạ Tầng Hosting Enterprise',
    subtitle: 'CloudLinux + LiteSpeed trên cluster NVMe RAID-10',
    items: [
      { title: 'CloudLinux OS', description: 'Cô lập tài nguyên từng account, LVE limits đảm bảo neighbor không ảnh hưởng bạn.' },
      { title: 'NVMe RAID-10 Storage', description: 'Dual controller, hot-swap drives, IOPS ổn định ngay cả peak hours.' },
      { title: 'Multi-CDN Edge', description: 'Tích hợp Cloudflare CDN miễn phí, cache static assets tại 200+ PoP toàn cầu.' },
      { title: 'Daily Security Scan', description: 'Imunify360 + Monarx quét malware, tự động cách ly file nhiễm.' },
    ],
  },
  sla: {
    title: 'Cam Kết SLA Web Hosting',
    items: [
      { metric: 'Website Uptime', commitment: '99.9% (Starter) / 99.99% (Enterprise)', compensation: 'Credit 5-10% phí tháng' },
      { metric: 'Email Delivery', commitment: '99.5% inbox rate', compensation: 'Investigate + credit nếu lỗi hệ thống' },
      { metric: 'Support Response', commitment: '< 30 phút', compensation: 'Priority escalation nếu vượt 1 giờ' },
      { metric: 'Backup Integrity', commitment: '100% daily backup success', compensation: 'Manual backup bồi thường nếu lỗi' },
    ],
  },
  addons: [
    { name: 'Dedicated IP', price: '1Giá ưu đãi', description: 'IP riêng cho SSL EV hoặc email reputation' },
    { name: 'Wildcard SSL', price: 'Giá ưu đãi', description: 'Bảo mật tất cả subdomain (*.domain.com)' },
    { name: 'SiteLock Premium', price: 'Giá ưu đãi', description: 'Quét malware + blacklist monitoring' },
    { name: 'Priority Support', price: 'Giá ưu đãi', description: 'Hotline ưu tiên, response < 10 phút' },
    { name: 'Extra 10GB NVMe', price: 'Giá ưu đãi', description: 'Mở rộng dung lượng hosting' },
    { name: 'Reseller WHM', price: 'Giá ưu đãi', description: 'Tạo hosting con cho khách hàng của bạn' },
  ],
  testimonials: [
    { name: 'Phạm Thị Hương', role: 'Marketing Director', company: 'Beauty Brand VN', quote: 'Website WooCommerce load từ 4 giây xuống còn 0.8 giây sau khi chuyển sang hosting LiteSpeed. Doanh số tăng 25%.', rating: 5 },
    { name: 'Đặng Văn Hùng', role: 'Web Developer', company: 'Freelancer', quote: 'cPanel quen thuộc, staging environment giúp tôi test plugin trước khi deploy. Backup restore 1-click cứu tôi nhiều lần.', rating: 5 },
    { name: 'Ngô Bích Ngọc', role: 'CEO', company: 'Digital Agency', quote: 'Quản lý 30 website khách trên gói Enterprise, uptime 99.99% thực sự. Team support migrate 15 site miễn phí trong 1 tuần.', rating: 5 },
  ],
  integrations: ['WordPress', 'WooCommerce', 'Laravel', 'Joomla', 'Drupal', 'Magento', 'PrestaShop', 'Cloudflare', 'Softaculous', 'JetBackup'],
  migration: {
    title: 'Chuyển Hosting Miễn Phí — Zero Downtime',
    description: 'Chúng tôi migrate website, database, email và DNS từ hosting cũ sang CloudHost VN hoàn toàn miễn phí.',
    steps: [
      'Cung cấp thông tin cPanel/hosting cũ',
      'Kỹ thuật viên backup full và lên lịch migrate',
      'Sync file + database qua rsync/MySQL dump',
      'Test website trên URL preview trước cutover',
      'Chuyển DNS, theo dõi 48h sau migrate',
    ],
  },
  extendedFaqs: [
    { q: 'Web Hosting khác gì với VPS?', a: 'Hosting được quản lý sẵn với cPanel, phù hợp người không chuyên. VPS cần kiến thức quản trị server nhưng linh hoạt hơn.' },
    { q: 'Hosting có hỗ trợ WordPress không?', a: 'Có! Tất cả gói tối ưu WordPress với LiteSpeed + LSCache, cài 1-click qua Softaculous.' },
    { q: 'Chuyển hosting từ nhà cung cấp cũ?', a: 'Miễn phí 100%. Team kỹ thuật migrate website, email, database không gián đoạn.' },
    { q: 'Website tăng traffic đột biến?', a: 'Nâng cấp gói ngay trên Bảng điều khiển. Enterprise Turbo chịu 100.000+ visitor/ngày.' },
    { q: 'Email hosting có giới hạn không?', a: 'Starter: 10 accounts. Business+: không giới hạn accounts, 500MB/account (nâng thêm được).' },
    { q: 'Có hỗ trợ PHP 8.3 không?', a: 'Có, chọn phiên bản PHP 7.4 → 8.3 per directory trên cPanel.' },
    { q: 'Backup có thể download không?', a: 'Có, download full backup qua cPanel hoặc yêu cầu team support.' },
    { q: 'Chính sách hoàn tiền?', a: 'Hoàn 100% trong 30 ngày đầu cho gói Starter và Business Pro.' },
  ],
  relatedServices: [
    { label: 'Cloud VPS Enterprise', href: '/services/cloud-vps', description: 'Máy chủ ảo NVMe hiệu năng cao, Root Access' },
    { label: 'Đăng Ký Tên Miền', href: '/services/domain', description: 'Tên miền .com miễn phí kèm gói Business Pro' },
    { label: 'SSL Certificates', href: '/services/ssl-certificates', description: 'Nâng cấp lên SSL EV cho doanh nghiệp' },
  ],
};

const DOMAIN_CONTENT: ServicePageContent = {
  variant: 'domain',
  stats: [
    { value: '500+', label: 'Đuôi tên miền', detail: 'Hỗ trợ .com, .vn, .net, .ai và hàng trăm TLD khác' },
    { value: 'Miễn phí', label: 'DNS & WHOIS Privacy', detail: 'Quản lý DNS và bảo vệ thông tin cá nhân' },
    { value: '< 5 phút', label: 'Kích hoạt', detail: 'Tên miền active ngay sau thanh toán thành công' },
    { value: '24/7', label: 'Hỗ trợ transfer', detail: 'Chuyển tên miền từ registrar khác miễn phí' },
  ],
  promotions: [
    {
      badge: 'Hot Deal',
      title: '.com giá cực sốc năm đầu',
      description: 'Giảm giá sâu, áp dụng cho đăng ký mới và transfer.',
      discount: '-17%',
      validUntil: '31/12/2026',
    },
    {
      badge: 'Bundle',
      title: 'Mua 5 tên miền giảm 10%',
      description: 'Đăng ký từ 5 tên miền trở lên trong 1 đơn được giảm 10% tổng hóa đơn.',
      discount: '-10%',
      code: 'DOMAIN5',
    },
    {
      badge: 'Premium',
      title: '.ai đang được giảm giá khủng',
      description: 'Tên miền .ai cho startup công nghệ — ưu đãi có hạn.',
      discount: '-500K',
      validUntil: '30/06/2026',
    },
  ],
  deepFeatures: [
    {
      title: 'DNS Management Pro',
      description: 'Quản lý DNS trực quan với hỗ trợ A, AAAA, CNAME, MX, TXT, SRV, CAA records.',
      bullets: [
        'DNS propagation check real-time',
        'Import/export zone file BIND',
        'DNSSEC support cho .vn và .com',
        'GeoDNS routing (add-on)',
      ],
    },
    {
      title: 'WHOIS Privacy Protection',
      description: 'Che giấu thông tin cá nhân trên cơ sở dữ liệu WHOIS công khai.',
      bullets: [
        'Miễn phí cho .com, .net, .org',
        'Bảo vệ email, phone, address',
        'Tuân thủ GDPR và luật VN',
        'Bật/tắt 1-click trên Bảng điều khiển',
      ],
    },
    {
      title: 'Domain Lock & Security',
      description: 'Registrar Lock chống chuyển trái phép, 2FA bảo vệ tài khoản.',
      bullets: [
        'Transfer Lock mặc định bật',
        'Auth-code cấp khi unlock có xác minh',
        'Cảnh báo email mọi thay đổi DNS',
        'Domain monitoring anti-hijack',
      ],
    },
    {
      title: 'Auto-Renew Thông Minh',
      description: 'Tự động gia hạn trước 30 ngày hết hạn, tránh mất tên miền.',
      bullets: [
        'Auto-renew từ ví hoặc thẻ liên kết',
        'Email nhắc nhở 60/30/7 ngày trước hết hạn',
        'Grace period 30 ngày sau hết hạn',
        'Redemption period recovery (phí ICANN)',
      ],
    },
    {
      title: 'Email Forwarding',
      description: 'Chuyển tiếp email @tenmien.com về Gmail, Outlook miễn phí.',
      bullets: [
        'Unlimited forwarding rules',
        'Catch-all forwarding',
        'SPF/DKIM pass-through',
        'Webhook notification khi nhận email',
      ],
    },
    {
      title: 'Bulk & Portfolio Management',
      description: 'Quản lý hàng trăm tên miền trên 1 dashboard, bulk DNS update.',
      bullets: [
        'Import CSV bulk register/renew',
        'Portfolio valuation estimate',
        'Bulk nameserver update',
        'API cho reseller/agency',
      ],
    },
  ],
  useCases: [
    { title: 'Thương hiệu Doanh nghiệp', description: 'Bảo vệ tên thương hiệu với .vn, .com.vn và các biến thể.', tags: ['.vn', '.com.vn', 'Brand'] },
    { title: 'Startup Công nghệ', description: 'Tên miền .io, .ai, .dev cho startup và SaaS product.', tags: ['.io', '.ai', '.dev'] },
    { title: 'E-Commerce', description: 'Tên miền .store, .shop cho cửa hàng trực tuyến.', tags: ['.store', '.shop', '.online'] },
    { title: 'Portfolio Investor', description: 'Mua giữ tên miền premium, quản lý portfolio trên dashboard.', tags: ['Premium', 'Portfolio', 'Resell'] },
    { title: 'Agency Multi-client', description: 'Quản lý tên miền khách hàng với white-label DNS.', tags: ['Agency', 'Reseller', 'API'] },
    { title: 'Personal Brand', description: 'Blog cá nhân, portfolio với .me, .name, .blog.', tags: ['.me', '.blog', '.name'] },
  ],
  specTable: {
    title: 'So sánh các loại tên miền phổ biến',
    columns: ['Tiêu chí', '.com', '.vn', '.com.vn'],
    rows: [
      { label: 'Giá năm đầu', values: ['290.000 đ', '750.000 đ', '650.000 đ'], highlightIndex: 0 },
      { label: 'Gia hạn/năm', values: ['350.000 đ', '850.000 đ', '720.000 đ'] },
      { label: 'Đối tượng', values: ['Quốc tế', 'Việt Nam', 'DN Việt Nam'] },
      { label: 'WHOIS Privacy', values: ['Miễn phí', 'Theo quy định VNNIC', 'Theo quy định VNNIC'] },
      { label: 'DNS Management', values: ['Miễn phí', 'Miễn phí', 'Miễn phí'] },
      { label: 'Transfer', values: ['Miễn phí + 1 năm gia hạn', 'Miễn phí', 'Miễn phí'] },
      { label: 'Thời gian kích hoạt', values: ['< 5 phút', '< 24 giờ (duyệt VNNIC)', '< 24 giờ'] },
      { label: 'DNSSEC', values: ['✓', '✓', '✓'] },
    ],
  },
  infrastructure: {
    title: 'Registrar Uy Tín — ICANN Accredited',
    subtitle: 'Đối tác chính thức VNNIC, Verisign, Identity Digital',
    items: [
      { title: 'ICANN Accredited Registrar', description: 'Đủ tiêu chuẩn quốc tế, bảo vệ quyền lợi registrant theo chính sách ICANN.' },
      { title: 'VNNIC Agent .vn', description: 'Đại lý chính thức đăng ký tên miền .vn, .com.vn, .net.vn nhanh chóng.' },
      { title: 'Anycast DNS Network', description: '4 node DNS tại HN, HCM, Singapore, Tokyo — latency < 20ms toàn APAC.' },
      { title: 'Domain Monitoring', description: 'Theo dõi expiry, DNS change, WHOIS update — alert real-time qua email/Zalo.' },
    ],
  },
  sla: {
    title: 'Cam Kết Dịch Vụ Tên Miền',
    items: [
      { metric: 'DNS Uptime', commitment: '100%', compensation: 'Credit nếu DNS down > 1 giờ/tháng' },
      { metric: 'Registration Time', commitment: '< 5 phút (.com)', compensation: 'Hoàn phí nếu vượt 24 giờ (lỗi hệ thống)' },
      { metric: 'Transfer Support', commitment: 'Hoàn thành < 7 ngày', compensation: 'Hỗ trợ escalate ICANN/VNNIC' },
      { metric: 'WHOIS Accuracy', commitment: 'Cập nhật < 24 giờ', compensation: 'Manual update bởi support' },
    ],
  },
  addons: [
    { name: 'Premium DNS', price: 'Giá ưu đãi', description: 'GeoDNS, failover, TTL thấp 60s' },
    { name: 'Domain Monitoring', price: 'Giá ưu đãi', description: 'Theo dõi expiry, DNS hijack, blacklist' },
    { name: 'Trademark Protection', price: 'Liên hệ', description: 'Bảo vệ thương hiệu, block đăng ký tương tự' },
    { name: 'SSL DV kèm domain', price: 'Miễn phí', description: "Let's Encrypt SSL khi trỏ domain về hosting CloudHost" },
    { name: 'Email @domain', price: 'Từ Giá ưu đãi', description: 'Email hosting 5GB/account' },
    { name: 'Privacy Plus (.vn)', price: 'Giá ưu đãi', description: 'WHOIS privacy cho tên miền .vn' },
  ],
  testimonials: [
    { name: 'Vũ Quang Minh', role: 'Founder', company: 'Tech Startup', quote: 'Đăng ký .io và .ai nhanh, DNS trỏ về Vercel chỉ mất 5 phút propagate. Giá rẻ hơn GoDaddy nhiều.', rating: 5 },
    { name: 'Hoàng Thị Lan', role: 'Legal Manager', company: 'Corp VN', quote: 'Transfer 20 tên miền .vn từ registrar cũ, team CloudHost hỗ trợ end-to-end, không mất tên miền nào.', rating: 5 },
    { name: 'Bùi Đức Anh', role: 'Domain Investor', quote: 'Quản lý 150+ domain trên dashboard, bulk renew tiết kiệm thời gian. API ổn định cho automation.', company: 'Domain Portfolio', rating: 5 },
  ],
  integrations: ['Cloudflare', 'Vercel', 'Netlify', 'AWS Route53', 'Google Cloud DNS', 'cPanel', 'WordPress', 'WHMCS', 'Shopify', 'GitHub Pages'],
  migration: {
    title: 'Chuyển Tên Miền Miễn Phí + Gia Hạn 1 Năm',
    description: 'Transfer tên miền từ GoDaddy, Namecheap, P.A Vietnam về CloudHost VN — miễn phí transfer và được gia hạn thêm 1 năm.',
    steps: [
      'Unlock domain tại registrar cũ, lấy Auth/EPP code',
      'Khởi tạo transfer trên CloudHost VN dashboard',
      'Xác nhận email transfer approval từ registrar cũ',
      'Transfer hoàn tất 5-7 ngày (.com) hoặc 1-3 ngày (.vn)',
      'Nhận thêm 1 năm gia hạn sau transfer thành công',
    ],
  },
  extendedFaqs: [
    { q: 'Tên miền là gì?', a: 'Địa chỉ website trên Internet (vd: cloudhost.vn). Giúp người dùng truy cập site qua trình duyệt thay vì nhớ IP.' },
    { q: 'Nên chọn đuôi nào?', a: 'Doanh nghiệp VN: .vn hoặc .com.vn. Thị trường quốc tế: .com. Startup tech: .io, .ai, .dev.' },
    { q: 'Chuyển tên miền từ registrar khác?', a: 'Có, miễn phí transfer. Bạn được gia hạn thêm 1 năm sau khi transfer thành công.' },
    { q: 'WHOIS Privacy là gì?', a: 'Che giấu thông tin cá nhân trên WHOIS. Miễn phí cho .com, .net, .org.' },
    { q: 'Auto-renew hoạt động thế nào?', a: 'Tự gia hạn 30 ngày trước hết hạn từ ví/thẻ. Email nhắc 60/30/7 ngày trước.' },
    { q: 'Tên miền hết hạn thì sao?', a: 'Grace period 30 ngày (gia hạn bình thường). Sau đó redemption period với phí cao hơn.' },
    { q: 'Có hỗ trợ DNSSEC không?', a: 'Có, bật DNSSEC trên dashboard cho .com, .vn, .net.' },
    { q: 'Đăng ký bulk nhiều tên miền?', a: 'Có, upload CSV hoặc dùng API. Giảm 10% từ 5 domain trở lên.' },
    { q: 'Tên miền premium là gì?', a: 'Tên miền ngắn, đẹp có giá cao hơn. Liên hệ sales@cloudhost.vn để báo giá.' },
    { q: 'Thanh toán qua hình thức nào?', a: 'VNPay, MoMo, chuyển khoản, thẻ quốc tế, ví CloudHost.' },
  ],
  relatedServices: [
    { label: 'Cloud VPS Enterprise', href: '/services/cloud-vps', description: 'Trỏ domain về VPS với DNS miễn phí' },
    { label: 'NVMe Web Hosting', href: '/services/hosting', description: 'Hosting kèm tên miền .com miễn phí năm đầu' },
    { label: 'SSL Certificates', href: '/services/ssl-certificates', description: 'Bảo mật HTTPS cho website' },
  ],
};

export const SERVICE_PAGE_CONTENT: Record<ServicePageVariant, ServicePageContent> = {
  vps: VPS_CONTENT,
  hosting: HOSTING_CONTENT,
  domain: DOMAIN_CONTENT,
};
