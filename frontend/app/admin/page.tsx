'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, ShoppingCart, Server, MessageSquare, Send, CreditCard, Award, 
  Share2, Building2, Globe, ArrowUp, ArrowDown, Database, Cpu, LayoutTemplate, 
  DownloadCloud, ShoppingBag, Package, Tag, DollarSign, FileText, Star, 
  HelpCircle, Image, TrendingUp, Key, Download, ShieldCheck, Activity, 
  Clock, Settings, ShieldAlert, Shield, Search, ChevronRight, Lock, AlertCircle,
  Wallet, Wrench, Headphones, X, CheckCircle2, Info, Phone, Briefcase
} from 'lucide-react';

interface AdminModuleItem {
  href: string;
  label: string;
  desc: string;
  icon: any;
  count?: number | string;
  color?: string;
}

interface AdminStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeVpsInstances: number;
  openTickets: number;
  pendingRefunds: number;
  monthlyGrowth: number;
  todayOrders: number;
}

// Role badge helper for Header
const getRoleHeaderBadge = (role?: string) => {
  const r = (role || '').toLowerCase();
  if (r === 'admin') {
    return {
      title: 'Quản Trị Viên (Admin)',
      bg: 'bg-red-50 text-red-700 border-red-200',
      avatarBg: 'from-red-600 to-rose-600 text-white'
    };
  }
  if (r === 'accountant' || r.includes('kế toán') || r.includes('ketoan')) {
    return {
      title: 'Kế Toán Viên (Accountant)',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      avatarBg: 'from-emerald-600 to-teal-600 text-white'
    };
  }
  if (r === 'technician' || r.includes('kỹ thuật') || r.includes('kythuat')) {
    return {
      title: 'Kỹ Thuật Viên (Technician)',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      avatarBg: 'from-blue-600 to-indigo-600 text-white'
    };
  }
  if (r === 'support' || r.includes('chăm sóc') || r.includes('cskh')) {
    return {
      title: 'Chăm Sóc Khách Hàng (Support)',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      avatarBg: 'from-amber-600 to-orange-600 text-white'
    };
  }
  if (r === 'editor' || r.includes('biên tập') || r.includes('bientap')) {
    return {
      title: 'Biên Tập Viên (Editor)',
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      avatarBg: 'from-purple-600 to-violet-600 text-white'
    };
  }
  return {
    title: role || 'Nhân Viên (Staff)',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    avatarBg: 'from-slate-700 to-slate-900 text-white'
  };
};

// Check if a specific module is allowed for the current role
const isModuleAllowed = (role?: string, href?: string): boolean => {
  const r = (role || '').toLowerCase();
  const path = (href || '').toLowerCase();

  // Admin has access to ALL modules
  if (r === 'admin') return true;

  // Accountant (Kế Toán): Only Billing, Invoices, Revenue, Refunds, Exchange Rates, Gift Cards, Exports, Audit Logs
  if (r === 'accountant' || r.includes('kế toán') || r.includes('ketoan')) {
    const allowed = [
      '/admin/invoices',
      '/admin/revenue',
      '/admin/orders',
      '/admin/refund-requests',
      '/admin/exchange-rates',
      '/admin/gift-cards',
      '/admin/exports',
      '/admin/audit-logs'
    ];
    return allowed.some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));
  }

  // Technician (Kỹ Thuật): Cloud VPS, Dedicated Servers, DB, Game Servers, Apps, Storage, Static Sites, Security, SSL, Uptime, Backups, Migrations, Tickets, Jobs, Service Plans, Knowledge Base, Audit Logs
  if (r === 'technician' || r.includes('kỹ thuật') || r.includes('kythuat') || r.includes('devops')) {
    const allowed = [
      '/admin/vps-instances',
      '/admin/dedicated-servers',
      '/admin/databases',
      '/admin/game-servers',
      '/admin/apps',
      '/admin/storage',
      '/admin/static-sites',
      '/admin/security',
      '/admin/ssl-certificates',
      '/admin/uptime',
      '/admin/backups',
      '/admin/migrations',
      '/admin/tickets',
      '/admin/jobs',
      '/admin/service-plans',
      '/admin/knowledge-base',
      '/admin/audit-logs'
    ];
    return allowed.some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));
  }

  // Support (CSKH): Tickets, LiveChat, Orders, Reviews, FAQs, Knowledge Base, Refund Requests, Testimonials
  if (r === 'support' || r.includes('chăm sóc') || r.includes('cskh')) {
    const allowed = [
      '/admin/tickets',
      '/admin/live-chat',
      '/admin/orders',
      '/admin/reviews',
      '/admin/faqs',
      '/admin/knowledge-base',
      '/admin/refund-requests',
      '/admin/testimonials'
    ];
    return allowed.some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));
  }

  // Editor (Biên Tập): News, Comments, Banners, Landing Content, Coupons, Promotions, SEO, Newsletters, FAQs, Testimonials, Resources, Categories, Marketplace
  if (r === 'editor' || r.includes('biên tập') || r.includes('bientap')) {
    const allowed = [
      '/admin/news',
      '/admin/blog-comments',
      '/admin/banners',
      '/admin/landing-content',
      '/admin/coupons',
      '/admin/promotions',
      '/admin/service-seo',
      '/admin/newsletters',
      '/admin/faqs',
      '/admin/testimonials',
      '/admin/resources',
      '/admin/categories',
      '/admin/marketplace'
    ];
    return allowed.some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));
  }

  // Generic Staff
  if (r === 'staff') {
    const allowed = ['/admin/orders', '/admin/tickets', '/admin/live-chat', '/admin/knowledge-base', '/admin/faqs'];
    return allowed.some(p => path === p || path.startsWith(p + '?') || path.startsWith(p + '/'));
  }

  return false;
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'allowed' | 'locked'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'warning' | 'info' | 'success' } | null>(null);

  const showToast = (message: string, type: 'warning' | 'info' | 'success' = 'warning') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        
        const isStaff = ['Admin', 'Accountant', 'Technician', 'Support', 'Editor', 'Staff'].some(
          r => r.toLowerCase() === (userData.role || '').toLowerCase()
        );
        
        if (!isStaff) {
          router.push('/dashboard');
          return;
        }

        fetchStats(token);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to check admin access:', error);
      router.push('/login');
    }
  };

  const fetchStats = async (token: string) => {
    const headers = { Authorization: `Bearer ${token}` };
    const today = new Date().toISOString().slice(0, 10);
    const yearStart = `${new Date().getFullYear()}-01-01`;

    try {
      const [revenueRes, ticketsRes, vpsRes, refundsRes] = await Promise.all([
        fetch(`/api/dashboard/revenue-stats?startDate=${yearStart}&endDate=${today}`, { headers }).catch(() => null),
        fetch('/api/tickets/queue', { headers }).catch(() => null),
        fetch('/api/VpsInstances/admin', { headers }).catch(() => null),
        fetch('/api/refund-requests', { headers }).catch(() => null),
      ]);

      let totalRevenue = 0, totalOrders = 0, totalUsers = 0;
      if (revenueRes && revenueRes.ok) {
        const rev = await revenueRes.json();
        totalRevenue = rev?.totalRevenue ?? 0;
        totalOrders  = rev?.totalOrders  ?? 0;
        totalUsers   = rev?.totalUsers   ?? 0;
      }

      const getArrayLen = async (res: Response | null): Promise<number> => {
        if (!res || !res.ok) return 0;
        try {
          const data = await res.json();
          if (Array.isArray(data)) return data.length;
          if (typeof data?.totalCount === 'number') return data.totalCount;
          if (Array.isArray(data?.items)) return data.items.length;
        } catch {}
        return 0;
      };

      const [openTickets, activeVpsInstances, pendingRefunds] = await Promise.all([
        getArrayLen(ticketsRes),
        getArrayLen(vpsRes),
        getArrayLen(refundsRes),
      ]);

      setStats({
        totalUsers,
        totalOrders,
        totalRevenue,
        activeVpsInstances,
        openTickets,
        pendingRefunds,
        monthlyGrowth: 12.5,
        todayOrders: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const moduleCategories: { category: string; items: AdminModuleItem[] }[] = [
    {
      category: '1. Vận Hành & Khách Hàng',
      items: [
        { href: '/admin/users', label: 'Quản lý User', desc: 'Quản lý tài khoản, số dư & trạng thái', icon: Users, count: stats?.totalUsers, color: 'blue' },
        { href: '/admin/orders', label: 'Đơn hàng', desc: 'Danh sách và trạng thái hóa đơn mua dịch vụ', icon: ShoppingCart, count: stats?.totalOrders, color: 'emerald' },
        { href: '/admin/vps-instances', label: 'VPS Instances', desc: 'Quản lý máy chủ ảo, IP & cấu hình', icon: Server, count: stats?.activeVpsInstances, color: 'purple' },
        { href: '/admin/contacts', label: 'Yêu Cầu Tư Vấn & Liên Hệ', desc: 'Tiếp nhận và gọi điện/email khách từ /contact', icon: Phone, color: 'blue' },
        { href: '/admin/careers', label: 'Tuyển Dụng Nhân Sự', desc: 'Tiếp nhận CV, thẩm định 4 bước & gửi kết quả', icon: Briefcase, color: 'indigo' },
        { href: '/admin/tickets', label: 'Ticket Queue', desc: 'Xử lý yêu cầu hỗ trợ kỹ thuật khách hàng', icon: MessageSquare, count: stats?.openTickets, color: 'amber' },
        { href: '/admin/live-chat', label: 'Live Chat Support', desc: 'Nhắn tin trực tiếp với khách qua WebSocket', icon: Send, color: 'emerald' },
        { href: '/admin/refund-requests', label: 'Yêu Cầu Hoàn Tiền', desc: 'Xét duyệt hoàn tiền ví / ngân hàng', icon: CreditCard, count: stats?.pendingRefunds, color: 'rose' },
        { href: '/admin/loyalty', label: 'Điểm Thưởng (Loyalty)', desc: 'Tích điểm thành viên & điều chỉnh điểm', icon: Award, color: 'amber' },
        { href: '/admin/referrals', label: 'Giới Thiệu (Referrals)', desc: 'Quản lý mã mời & hoa hồng chi trả', icon: Share2, color: 'emerald' },
        { href: '/admin/organizations', label: 'Tổ Chức B2B', desc: 'Quản lý tài khoản doanh nghiệp đa thành viên', icon: Building2, color: 'purple' },
        { href: '/admin/affiliate-applications', label: 'Duyệt Đối Tác Affiliate', desc: 'Xét duyệt hồ sơ cộng tác viên tiếp thị', icon: Users, color: 'indigo' },
        { href: '/admin/abandoned-carts', label: 'Giỏ Hàng Bỏ Quên', desc: 'Remarketing và nhắc nhở thanh toán', icon: ShoppingCart, color: 'pink' },
      ]
    },
    {
      category: '2. Sản Phẩm, Bảng Giá & Khuyến Mãi',
      items: [
        { href: '/admin/domains', label: 'Tên Miền (Domains)', desc: 'Đăng ký và cấu hình DNS tên miền', icon: Globe, color: 'blue' },
        { href: '/admin/dedicated-servers', label: 'Máy Chủ Vật Lý', desc: 'Kiểm soát Dedicated Server', icon: Server, color: 'slate' },
        { href: '/admin/migrations', label: 'Yêu Cầu Chuyển Đổi', desc: 'Hỗ trợ chuyển dữ liệu lên Cloud', icon: ArrowUp, color: 'fuchsia' },
        { href: '/admin/databases', label: 'Managed Databases', desc: 'Quản lý PostgreSQL, MySQL, Redis instances', icon: Database, color: 'teal' },
        { href: '/admin/game-servers', label: 'Game Servers', desc: 'Kiểm soát container Minecraft, CS2, Rust', icon: Cpu, color: 'orange' },
        { href: '/admin/apps', label: 'App Installer', desc: 'Lịch sử cài đặt WordPress, Ghost, n8n', icon: LayoutTemplate, color: 'indigo' },
        { href: '/admin/storage', label: 'Object Storage (S3)', desc: 'Quản lý MinIO S3 Buckets & Dung lượng', icon: DownloadCloud, color: 'cyan' },
        { href: '/admin/static-sites', label: 'Static Sites (Nginx)', desc: 'Giám sát web tĩnh & container Nginx', icon: Globe, color: 'emerald' },
        { href: '/admin/marketplace', label: 'Chợ Ứng Dụng', desc: 'Giao dịch mua bán Plugin & Theme', icon: ShoppingBag, color: 'fuchsia' },
        { href: '/admin/service-plans', label: 'Gói Dịch Vụ', desc: 'Cấu hình giá VPS, Hosting, Dedicated', icon: Package, color: 'indigo' },
        { href: '/admin/categories', label: 'Danh Mục Sản Phẩm', desc: 'Quản lý danh mục & phân loại dịch vụ', icon: Package, color: 'blue' },
        { href: '/admin/coupons', label: 'Mã Giảm Giá (Coupons)', desc: 'Tạo mã voucher % hoặc số tiền cố định', icon: Tag, color: 'rose' },
        { href: '/admin/promotions', label: 'Chương Trình Sale', desc: 'Thiết lập flash sale & đợt khuyến mãi', icon: Tag, color: 'pink' },
        { href: '/admin/gift-cards', label: 'Gift Cards', desc: 'Phát hành thẻ nạp tiền quà tặng', icon: CreditCard, color: 'amber' },
        { href: '/admin/exchange-rates', label: 'Tỷ Giá Ngoại Tệ', desc: 'Cập nhật tỷ giá USD, EUR sang VNĐ', icon: DollarSign, color: 'emerald' },
      ]
    },
    {
      category: '3. Nội Dung, Tiếp Thị & Truyền Thông',
      items: [
        { href: '/admin/news', label: 'Tin Tức & Blog', desc: 'Đăng tải bài viết chia sẻ kiến thức', icon: FileText, color: 'sky' },
        { href: '/admin/reviews', label: 'Kiểm Duyệt Bình Luận & Đánh Giá', desc: 'Kiểm duyệt đánh giá sao, bình luận dịch vụ & bài viết', icon: MessageSquare, color: 'sky' },
        { href: '/admin/knowledge-base', label: 'Knowledge Base', desc: 'Tài liệu hướng dẫn kỹ thuật chi tiết', icon: FileText, color: 'teal' },
        { href: '/admin/resources', label: 'Tài Nguyên', desc: 'Quản lý file tải xuống, phần mềm', icon: DownloadCloud, color: 'emerald' },
        { href: '/admin/faqs', label: 'Câu Hỏi FAQ', desc: 'Quản lý các câu hỏi thường gặp', icon: HelpCircle, color: 'violet' },
        { href: '/admin/banners', label: 'Banners Quảng Cáo', desc: 'Quản lý 5 banner trang chủ & landing page', icon: Image, color: 'orange' },
        { href: '/admin/landing-content', label: 'Nội Dung Trang Chủ', desc: 'Tùy biến Về Chúng Tôi, Số Liệu & Giải Pháp Ngành Nghề', icon: LayoutTemplate, color: 'blue' },
        { href: '/admin/testimonials', label: 'Testimonials Đối Tác', desc: 'Cảm nhận của các doanh nghiệp lớn', icon: FileText, color: 'violet' },
        { href: '/admin/newsletters', label: 'Email Newsletter', desc: 'Danh sách khách hàng đăng ký nhận tin', icon: MessageSquare, color: 'sky' },
        { href: '/admin/service-seo', label: 'SEO Dịch Vụ', desc: 'Tối ưu thẻ Meta Title/Desc cho từng trang', icon: Globe, color: 'teal' },
      ]
    },
    {
      category: '4. Báo Cáo, Kỹ Thuật & Hệ Thống',
      items: [
        { href: '/admin/revenue', label: 'Báo Cáo Doanh Thu', desc: 'Biểu đồ tăng trưởng và cơ cấu doanh thu', icon: TrendingUp, color: 'cyan' },
        { href: '/admin/invoices', label: 'Quản Lý Hóa Đơn', desc: 'Kiểm soát hóa đơn điện tử toàn hệ thống', icon: FileText, color: 'blue' },
        { href: '/admin/api-keys', label: 'Quản Lý API Keys', desc: 'Giám sát và thu hồi mã kết nối hệ thống', icon: Key, color: 'purple' },
        { href: '/admin/exports', label: 'Trung Tâm Xuất Dữ Liệu', desc: 'Xuất file CSV/JSON đơn hàng và khách hàng', icon: Download, color: 'emerald' },
        { href: '/admin/backups', label: 'Sao Lưu Toàn Hệ Thống', desc: 'Quản lý Snapshot & Storage Backup S3', icon: Database, color: 'teal' },
        { href: '/admin/ssl-certificates', label: 'Chứng Chỉ Bảo Mật SSL', desc: 'Theo dõi thời hạn và gia hạn HTTPS', icon: ShieldCheck, color: 'emerald' },
        { href: '/admin/uptime', label: 'Giám Sát Uptime Server', desc: 'Tình trạng hoạt động của các cụm máy chủ', icon: Activity, color: 'cyan' },
        { href: '/admin/jobs', label: 'Tác Vụ Nền (Cron Jobs)', desc: 'Kích hoạt gia hạn tự động & dọn dẹp cache', icon: Clock, color: 'indigo' },
        { href: '/admin/roles', label: 'Phân Quyền & Quyền Hạn', desc: 'Quản lý vai trò Admin, Kế toán, Kỹ thuật & phân bổ quyền API', icon: ShieldCheck, color: 'blue' },
        { href: '/admin/audit-logs', label: 'Nhật Ký Thao Tác (Audit Logs)', desc: 'Theo dõi và kiểm toán toàn bộ hành động bảo mật & hệ thống', icon: ShieldAlert, color: 'rose' },
        { href: '/admin/settings', label: 'Cài Đặt Hệ Thống', desc: 'Cấu hình SMTP, Cổng thanh toán & Brand', icon: Settings, color: 'slate' },
      ]
    }
  ];

  const allItems = moduleCategories.flatMap(c => c.items);
  
  // Compute allowed count
  const allowedCount = allItems.filter(item => isModuleAllowed(user?.role, item.href)).length;
  const lockedCount = allItems.length - allowedCount;

  // Filtered categories
  const filteredCategories = moduleCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => {
      // Search filter
      const matchSearch = item.label.toLowerCase().includes(search.toLowerCase()) || 
                          item.desc.toLowerCase().includes(search.toLowerCase());
      if (!matchSearch) return false;

      // Status filter
      const isAllowed = isModuleAllowed(user?.role, item.href);
      if (filterType === 'allowed' && !isAllowed) return false;
      if (filterType === 'locked' && isAllowed) return false;

      return true;
    })
  })).filter(cat => cat.items.length > 0);

  const handleDeniedClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    showToast(`⚠️ Bạn không có quyền truy cập "${label}". Tính năng này bị khóa đối với vai trò ${user?.role || 'hiện tại'}.`, 'warning');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const roleMeta = getRoleHeaderBadge(user?.role);
  const isPricingAllowed = isModuleAllowed(user?.role, '/admin/service-plans');

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-xl text-white font-semibold text-xs flex items-center gap-2.5 bg-slate-900 border border-slate-700 animate-in slide-in-from-bottom-5">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-2xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin Control Center</h1>
              <p className="text-xs text-slate-500">CloudServiceStore Enterprise Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F]">
              ← Về trang chủ
            </Link>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleMeta.avatarBg} flex items-center justify-center text-xs font-bold shadow-2xs`}>
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">{user?.fullName}</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border inline-block mt-0.5 ${roleMeta.bg}`}>
                  {roleMeta.title}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Role Permissions Notification Banner */}
        {user?.role !== 'Admin' && (
          <div className="mb-6 p-4 rounded-lg bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Bạn đang truy cập với vai trò: <span className="text-blue-600 font-black">{roleMeta.title}</span>
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Hệ thống chỉ mở các tính năng được cấp phép. Các phân hệ không thuộc thẩm quyền sẽ được hiển thị màu <strong className="text-rose-600">Đỏ &amp; Khóa 🔒</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {allowedCount} Cho phép
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                <Lock className="w-3.5 h-3.5 text-rose-600" /> {lockedCount} Bị khóa
              </span>
            </div>
          </div>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng người dùng', value: stats?.totalUsers || 0, icon: Users, color: 'blue', change: '+12%' },
            { label: 'Tổng đơn hàng', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'emerald', change: '+8%' },
            { label: 'Doanh thu', value: stats?.totalRevenue ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` : '0M', icon: DollarSign, color: 'purple', change: '+15%' },
            { label: 'Ticket mở', value: stats?.openTickets || 0, icon: MessageSquare, color: 'amber', change: '-5%' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-md p-5 border border-slate-200 shadow-2xs hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded bg-slate-50 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-slate-700`} />
                </div>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${
                  stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.change.startsWith('+') ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* QUICK ACCESS: PRICING & HARDWARE SPECS MANAGER FOR 11 SERVICES */}
        <div className={`rounded-lg p-6 shadow-xl mb-8 relative overflow-hidden transition-all ${
          isPricingAllowed 
            ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-blue-950 text-white' 
            : 'bg-gradient-to-r from-slate-900 via-rose-950/80 to-slate-950 text-slate-300 border border-rose-900/50'
        }`}>
          <div className="relative z-10 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs font-bold mb-2">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Trung Tâm Bảng Giá &amp; Gói Cước 11 Dịch Vụ</span>
                  {!isPricingAllowed && (
                    <span className="ml-1.5 px-2 py-0.2 rounded text-[10px] font-bold bg-rose-500 text-white">
                      🔒 Chỉ Admin / Kỹ thuật
                    </span>
                  )}
                </div>
                <h2 className="text-lg md:text-xl font-black text-white">
                  Tùy Chỉnh Giá Bán &amp; Cấu Hình Máy Chủ Toàn Diện
                </h2>
                <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                  {isPricingAllowed 
                    ? 'Sửa trực tiếp giá bán hàng tháng / hàng năm, thông số CPU / RAM / NVMe và chu kỳ cho từng dịch vụ:' 
                    : 'Phân hệ cấu hình giá máy chủ chỉ dành cho Quản trị viên và Kỹ thuật viên hạ tầng.'}
                </p>
              </div>

              {isPricingAllowed ? (
                <Link
                  href="/admin/service-plans"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded transition-all shadow-lg hover:shadow-emerald-500/20 flex-shrink-0"
                >
                  <span>Xem Tất Cả Gói Dịch Vụ</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={(e) => handleDeniedClick(e, 'Gói Dịch Vụ & Bảng Giá')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-900/60 text-rose-300 border border-rose-800 text-xs font-black rounded transition-all cursor-not-allowed flex-shrink-0"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Không Có Quyền Sửa Giá</span>
                </button>
              )}
            </div>

            {/* Quick 11 Services Links Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2">
              {[
                { label: 'Cloud VPS', slug: 'cloud-vps', icon: Server },
                { label: 'Dedicated Server', slug: 'dedicated-server', icon: Server },
                { label: 'Managed DB', slug: 'managed-database', icon: Database },
                { label: 'Game Servers', slug: 'game-server', icon: Cpu },
                { label: '1-Click Apps', slug: '1click-apps', icon: LayoutTemplate },
                { label: 'Static Sites', slug: 'static-sites', icon: Globe },
                { label: 'Object Storage', slug: 'object-storage', icon: DownloadCloud },
                { label: 'Chứng Chỉ SSL', slug: 'ssl-certificate', icon: ShieldCheck },
                { label: 'Tên Miền (DNS)', slug: 'ten-mien', icon: Globe },
                { label: 'Bảo Mật & WAF', slug: 'security-waf', icon: ShieldAlert },
                { label: 'Chuyển Đổi Dữ Liệu', slug: 'cloud-migration', icon: ArrowUp },
                { label: 'Web Hosting', slug: 'web-hosting', icon: Package },
              ].map((svc, idx) => {
                if (isPricingAllowed) {
                  return (
                    <Link
                      key={idx}
                      href={`/admin/service-plans?category=${svc.slug}`}
                      className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded transition-all flex items-center gap-2 text-xs font-bold text-white group"
                    >
                      <svc.icon className="w-4 h-4 text-slate-300 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
                      <span className="truncate">{svc.label}</span>
                    </Link>
                  );
                }
                return (
                  <div
                    key={idx}
                    onClick={(e) => handleDeniedClick(e, svc.label)}
                    className="p-2.5 bg-rose-950/30 border border-rose-900/30 rounded flex items-center gap-2 text-xs font-medium text-rose-300/60 cursor-not-allowed"
                  >
                    <Lock className="w-3.5 h-3.5 text-rose-400/60 shrink-0" />
                    <span className="truncate">{svc.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Search & Permissions Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <span>Toàn Bộ 39 Phân Hệ Quản Trị Enterprise</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân quyền thông minh: Các tính năng không được cấp quyền sẽ hiển thị <strong className="text-rose-600">Đỏ &amp; Khóa 🔒</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-md text-xs font-bold shrink-0">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả (39)
              </button>
              <button
                onClick={() => setFilterType('allowed')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  filterType === 'allowed' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Được phép ({allowedCount})
              </button>
              <button
                onClick={() => setFilterType('locked')}
                className={`px-3 py-1.5 rounded transition-colors ${
                  filterType === 'locked' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bị khóa ({lockedCount})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm phân hệ..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:border-[#1F1F1F] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Categorized Modules List */}
        <div className="space-y-8">
          {filteredCategories.map((group, groupIdx) => {
            const accessibleInGroup = group.items.filter(i => isModuleAllowed(user?.role, i.href)).length;
            const isAllAccessible = accessibleInGroup === group.items.length;

            return (
              <div key={groupIdx}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <span>{group.category}</span>
                    <span className="text-[11px] font-bold text-slate-400 font-normal">
                      ({group.items.length} phân hệ)
                    </span>
                  </h3>

                  {user?.role !== 'Admin' && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isAllAccessible 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {accessibleInGroup}/{group.items.length} quyền khả dụng
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {group.items.map((item, idx) => {
                    const isAllowed = isModuleAllowed(user?.role, item.href);

                    // ALLOWED CARD (Clean, Modern, No redundant badges)
                    if (isAllowed) {
                      return (
                        <Link
                          key={idx}
                          href={item.href}
                          className="bg-white rounded-lg p-4 border border-slate-200/90 hover:border-slate-800 hover:shadow-md transition-all group flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-slate-900 flex items-center justify-center transition-colors shadow-2xs">
                                <item.icon className="w-4.5 h-4.5 text-slate-700 group-hover:text-white transition-colors" />
                              </div>

                              {item.count !== undefined && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200/60">
                                  {item.count}
                                </span>
                              )}
                            </div>

                            <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-3">
                              {item.label}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2">
                              {item.desc}
                            </p>
                          </div>

                          <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                            <span>Truy cập</span>
                            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      );
                    }

                    // DISALLOWED CARD (Locked in Red for Non-Admin)
                    return (
                      <div
                        key={idx}
                        onClick={(e) => handleDeniedClick(e, item.label)}
                        className="bg-rose-50/30 rounded-lg p-4 border border-rose-200/80 hover:bg-rose-50/50 transition-all flex flex-col justify-between cursor-not-allowed opacity-75 group shadow-2xs relative"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shadow-2xs border border-rose-200">
                              <Lock className="w-4 h-4" />
                            </div>

                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" /> Khóa
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-bold text-slate-600 mt-3 line-through decoration-rose-400">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                            {item.desc}
                          </p>
                        </div>

                        <div className="mt-3.5 pt-2.5 border-t border-rose-100 flex items-center justify-between text-[11px] font-bold text-rose-500">
                          <span className="flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Chưa cấp quyền
                          </span>
                          <span className="text-[10px] text-rose-400">Bị khóa</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

      </main>
    </div>
  );
}
