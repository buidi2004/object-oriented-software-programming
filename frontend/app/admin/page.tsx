'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, ShoppingCart, Server, MessageSquare, 
  DollarSign, TrendingUp, AlertCircle, Package, Settings, 
  FileText, Tag, Image, HelpCircle, CreditCard, Shield, ArrowUp, ArrowDown, 
  ShieldAlert, Clock, Bell, Globe, Building2, Download, Star, RefreshCw, Send,
  Cpu, FileSpreadsheet, Search, Activity, Award, Share2, ShieldCheck, Database, DownloadCloud, Key, LayoutTemplate, ShoppingBag
} from 'lucide-react';

interface AdminModuleItem {
  href: string;
  label: string;
  desc: string;
  icon: any;
  color: string;
  count?: number;
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

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [search, setSearch] = useState('');

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
        
        if (userData.role !== 'Admin' && userData.role !== 'Editor') {
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
      // revenue-stats trả về totalRevenue + totalOrders + totalUsers trong 1 request
      const [revenueRes, ticketsRes, vpsRes, refundsRes] = await Promise.all([
        fetch(`/api/dashboard/revenue-stats?startDate=${yearStart}&endDate=${today}`, { headers }),
        fetch('/api/tickets/queue', { headers }),
        fetch('/api/VpsInstances/admin', { headers }),
        fetch('/api/refund-requests', { headers }),
      ]);

      // Parse revenue-stats (object với totalRevenue, totalOrders, totalUsers)
      let totalRevenue = 0, totalOrders = 0, totalUsers = 0;
      if (revenueRes.ok) {
        const rev = await revenueRes.json();
        totalRevenue = rev?.totalRevenue ?? 0;
        totalOrders  = rev?.totalOrders  ?? 0;
        totalUsers   = rev?.totalUsers   ?? 0;
      }

      // Tickets, VPS, Refunds đều trả về array
      const getArrayLen = async (res: Response): Promise<number> => {
        if (!res.ok) return 0;
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
        { href: '/admin/security', label: 'Security Add-ons', desc: 'Giám sát dịch vụ bảo mật (WAF, Scan)', icon: ShieldCheck, color: 'emerald' },
        { href: '/admin/apps', label: 'App Installer', desc: 'Lịch sử cài đặt ứng dụng Web', icon: LayoutTemplate, color: 'indigo' },
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
        { href: '/admin/blog-comments', label: 'Kiểm Duyệt Bình Luận', desc: 'Kiểm duyệt và xóa comment spam', icon: MessageSquare, color: 'sky' },
        { href: '/admin/reviews', label: 'Đánh Giá Khách Hàng', desc: 'Duyệt đánh giá sao và phản hồi dịch vụ', icon: Star, color: 'amber' },
        { href: '/admin/knowledge-base', label: 'Knowledge Base', desc: 'Tài liệu hướng dẫn kỹ thuật chi tiết', icon: FileText, color: 'teal' },
        { href: '/admin/resources', label: 'Tài Nguyên', desc: 'Quản lý file tải xuống, phần mềm', icon: DownloadCloud, color: 'emerald' },
        { href: '/admin/faqs', label: 'Câu Hỏi FAQ', desc: 'Quản lý các câu hỏi thường gặp', icon: HelpCircle, color: 'violet' },
        { href: '/admin/banners', label: 'Banners Quảng Cáo', desc: 'Quản lý banner trang chủ & landing page', icon: Image, color: 'orange' },
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
        { href: '/admin/audit-logs', label: 'Audit Logs', desc: 'Nhật ký truy vết hành động của Admin/Staff', icon: ShieldAlert, color: 'fuchsia' },
        { href: '/admin/roles', label: 'Phân Quyền Vai Trò', desc: 'Cấu hình quyền Admin, Staff, Editor', icon: Shield, color: 'blue' },
        { href: '/admin/permissions', label: 'Danh Sách Quyền Hạn', desc: 'Kiểm soát chi tiết từng quyền hạn API', icon: Shield, color: 'purple' },
        { href: '/admin/settings', label: 'Cài Đặt Hệ Thống', desc: 'Cấu hình SMTP, Cổng thanh toán & Brand', icon: Settings, color: 'slate' },
      ]
    }
  ];

  const allItems = moduleCategories.flatMap(c => c.items);
  const filteredCategories = moduleCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item => 
      item.label.toLowerCase().includes(search.toLowerCase()) || 
      item.desc.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Admin Control Center</h1>
              <p className="text-xs text-slate-500">CloudServiceStore Enterprise Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold text-slate-600 hover:text-blue-600">
              ← Về trang chủ
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs font-bold text-slate-700">{user?.fullName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Tổng người dùng', value: stats?.totalUsers || 0, icon: Users, color: 'blue', change: '+12%' },
            { label: 'Tổng đơn hàng', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'emerald', change: '+8%' },
            { label: 'Doanh thu', value: stats?.totalRevenue ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` : '0M', icon: DollarSign, color: 'purple', change: '+15%' },
            { label: 'Ticket mở', value: stats?.openTickets || 0, icon: MessageSquare, color: 'amber', change: '-5%' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-blue-600`} />
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

        {/* Search Modules Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h2 className="text-base font-black text-slate-900">Toàn Bộ 39 Phân Hệ Quản Trị Enterprise</h2>
            <p className="text-xs text-slate-500">Truy cập nhanh mọi tính năng và cấu hình của hệ thống Cloud.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm phân hệ quản trị..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Categorized Modules List */}
        <div className="space-y-8">
          {filteredCategories.map((group, groupIdx) => (
            <div key={groupIdx}>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-1">
                {group.category} ({group.items.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {group.items.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-blue-50 flex items-center justify-center transition-colors">
                          <item.icon className="w-5 h-5 text-slate-600 group-hover:text-blue-600 transition-colors" />
                        </div>
                        {item.count !== undefined && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                            {item.count}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      Truy cập →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* System Status Footer */}
        <div className="mt-10 bg-slate-900 rounded-3xl p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm mb-1">Trạng Thái Toàn Bộ Cụm Hạ Tầng</h3>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> API WebApi .NET 10 Online
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> SQL Server 2022
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Redis Cluster Ready
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/jobs"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-colors"
            >
              Background Jobs
            </Link>
            <Link
              href="/admin/settings"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold transition-colors shadow-lg"
            >
              Cài Đặt Hệ Thống
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
