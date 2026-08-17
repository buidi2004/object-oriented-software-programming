'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, Users, ShoppingCart, Server, MessageSquare, 
  DollarSign, TrendingUp, AlertCircle, Package, Settings, 
  FileText, Tag, Image, HelpCircle, CreditCard, Shield, ArrowUp, ArrowDown, ShieldAlert, Clock, Bell, Globe
} from 'lucide-react';

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
    try {
      const [usersRes, ordersRes, revenueRes, ticketsRes] = await Promise.all([
        fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dashboard/revenue-stats?startDate=2024-01-01&endDate=2024-12-31', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/tickets/queue', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setStats({
          totalUsers: usersData.length || 0,
          totalOrders: 0,
          totalRevenue: 0,
          activeVpsInstances: 0,
          openTickets: 0,
          pendingRefunds: 0,
          monthlyGrowth: 12.5,
          todayOrders: 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { href: '/admin/users', label: 'Quản lý User', icon: Users, count: stats?.totalUsers, color: 'blue' },
    { href: '/admin/orders', label: 'Đơn hàng', icon: ShoppingCart, count: stats?.totalOrders, color: 'emerald' },
    { href: '/admin/live-chat', label: 'Live Chat', icon: MessageSquare, color: 'emerald' },
    { href: '/admin/vps-instances', label: 'VPS Instances', icon: Server, count: stats?.activeVpsInstances, color: 'purple' },
    { href: '/admin/tickets', label: 'Ticket Queue', icon: MessageSquare, count: stats?.openTickets, color: 'amber' },
    { href: '/admin/revenue', label: 'Thống kê', icon: TrendingUp, color: 'cyan' },
    { href: '/admin/categories', label: 'Danh mục', icon: Package, color: 'indigo' },
    { href: '/admin/coupons', label: 'Mã giảm giá', icon: Tag, color: 'rose' },
    { href: '/admin/banners', label: 'Banner', icon: Image, color: 'orange' },
    { href: '/admin/knowledge-base', label: 'Knowledge Base', icon: FileText, color: 'teal' },
    { href: '/admin/news', label: 'Tin tức', icon: FileText, color: 'sky' },
    { href: '/admin/faqs', label: 'FAQ', icon: HelpCircle, color: 'violet' },
    { href: '/admin/refund-requests', label: 'Hoàn tiền', icon: CreditCard, count: stats?.pendingRefunds, color: 'red' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldAlert, color: 'fuchsia' },
    { href: '/admin/roles', label: 'Phân quyền', icon: Shield, color: 'blue' },
    { href: '/admin/settings', label: 'Cài đặt', icon: Settings, color: 'slate' },
    // New modules added
    { href: '/admin/exchange-rates', label: 'Tỷ giá', icon: DollarSign, color: 'emerald' },
    { href: '/admin/promotions', label: 'Khuyến mãi', icon: Tag, color: 'pink' },
    { href: '/admin/testimonials', label: 'Testimonials', icon: FileText, color: 'violet' },
    { href: '/admin/uptime', label: 'Uptime', icon: Server, color: 'cyan' },
    { href: '/admin/gift-cards', label: 'Gift Cards', icon: CreditCard, color: 'amber' },
    { href: '/admin/newsletters', label: 'Newsletter', icon: MessageSquare, color: 'sky' },
    { href: '/admin/permissions', label: 'Permissions', icon: Shield, color: 'purple' },
    { href: '/admin/abandoned-carts', label: 'Abandoned Carts', icon: ShoppingCart, color: 'rose' },
    { href: '/admin/service-seo', label: 'SEO Dịch vụ', icon: Globe, color: 'teal' },
  ];

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
              <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
              <p className="text-xs text-slate-500">CloudServiceStore Management</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-slate-600 hover:text-blue-600">
              ← Về trang chủ
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm font-medium text-slate-700">{user?.fullName}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng người dùng', value: stats?.totalUsers || 0, icon: Users, color: 'blue', change: '+12%' },
            { label: 'Tổng đơn hàng', value: stats?.totalOrders || 0, icon: ShoppingCart, color: 'emerald', change: '+8%' },
            { label: 'Doanh thu', value: stats?.totalRevenue ? `${(stats.totalRevenue / 1000000).toFixed(1)}M` : '0M', icon: DollarSign, color: 'purple', change: '+15%' },
            { label: 'Ticket mở', value: stats?.openTickets || 0, icon: MessageSquare, color: 'amber', change: '-5%' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-200 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                <span className={`text-xs font-semibold flex items-center gap-0.5 ${
                  stat.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {stat.change.startsWith('+') ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
          {menuItems.slice(0, 7).map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="bg-white rounded-xl p-4 border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all text-center group"
            >
              <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className={`w-6 h-6 text-${item.color}-600`} />
              </div>
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              {item.count !== undefined && (
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600 mt-1">
                  {item.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Recent Activity & Quick Links */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Đơn hàng gần đây</h2>
              <Link href="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
                Xem tất cả →
              </Link>
            </div>
            <div className="p-4">
              <div className="text-center py-8 text-slate-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">Chưa có đơn hàng nào</p>
                <p className="text-sm mt-1">Đơn hàng sẽ hiển thị ở đây</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h2 className="font-bold text-slate-900 mb-4">Liên kết nhanh</h2>
            <div className="space-y-2">
              {menuItems.map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`w-5 h-5 text-${item.color}-600`} />
                    <span className="text-sm font-medium text-slate-700">{item.label}</span>
                  </div>
                  {item.count !== undefined && (
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {item.count}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold mb-2">Trạng thái hệ thống</h2>
              <div className="flex items-center gap-4 text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  API Online
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Database Connected
                </span>
                <span>API Version: v1.0.0</span>
              </div>
            </div>
            <Link
              href="/admin/settings"
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-semibold"
            >
              Cài đặt hệ thống
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
