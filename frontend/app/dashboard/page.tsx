'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Server, ShoppingCart, CreditCard, Globe, ShieldCheck,
  Activity, Clock, TrendingUp, AlertCircle, ArrowRight, FileText
} from 'lucide-react';
import RecentlyViewed from '../../src/components/RecentlyViewed';
import { api } from '@/src/lib/api';
import { DashboardLoyaltyWidgets } from '@/src/components/team-features/DashboardLoyaltyWidgets';

interface DashboardStats {
  totalOrders: number;
  activeServices: number;
  walletBalance: number;
  loyaltyPoints: number;
  openTickets: number;
  monthlySpend: number;
}

const colorClasses: Record<string, string> = {
  blue: 'text-blue-600',
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  cyan: 'text-cyan-600',
  purple: 'text-purple-600',
  rose: 'text-rose-600',
  indigo: 'text-indigo-600',
  violet: 'text-violet-600',
  teal: 'text-teal-600',
  sky: 'text-sky-600',
};

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await api.get('/users/me');
      if (!response.data) throw new Error("No data");
      setUser(response.data);
      fetchDashboardData();
    } catch (err) {
      console.error('Auth check failed:', err);
      setError('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, userRes] = await Promise.all([
        api.get('/dashboard/me').catch(() => null),
        api.get('/users/me').catch(() => null),
      ]);

      if (dashboardRes && dashboardRes.data) {
        setStats(dashboardRes.data);
      } else {
        setStats({
          totalOrders: 0,
          activeServices: 0,
          walletBalance: 0,
          loyaltyPoints: 0,
          openTickets: 0,
          monthlySpend: 0,
        });
      }

      if (userRes && userRes.data) {
        setUser(userRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard:', err);
      setError('Không thể tải dữ liệu bảng điều khiển.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          Xin chào, {user?.fullName || 'Khách hàng'}! 👋
        </h1>
        <p className="text-slate-500 mt-1">Quản lý tất cả dịch vụ Cloud của bạn tại đây</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={checkAuth} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-semibold">
            Thử lại
          </button>
        </div>
      )}

      <DashboardLoyaltyWidgets />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Đơn hàng', value: stats?.totalOrders || 0, icon: ShoppingCart, colorKey: 'blue' },
          { label: 'Dịch vụ đang chạy', value: stats?.activeServices || 0, icon: Server, colorKey: 'emerald' },
          { label: 'Số dư ví', value: stats?.walletBalance ? `${(stats.walletBalance / 1000).toFixed(0)}K` : '0đ', icon: CreditCard, colorKey: 'amber' },
          { label: 'Tên miền', value: stats?.openTickets || 0, icon: Globe, colorKey: 'cyan' },
          { label: 'Điểm thưởng', value: stats?.loyaltyPoints || 0, icon: ShieldCheck, colorKey: 'purple' },
          { label: 'Hóa đơn tháng', value: stats?.monthlySpend ? `${(stats.monthlySpend / 1000).toFixed(0)}K` : '0đ', icon: TrendingUp, colorKey: 'rose' },
        ].map((stat) => (
          <div key={`stat-${stat.label}`} className="bg-white rounded-2xl p-4 border border-slate-200 hover:border-blue-200 transition-colors">
            <stat.icon className={`w-6 h-6 ${colorClasses[stat.colorKey]} mb-2`} />
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs text-slate-500 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Quản lý VPS', desc: 'Máy chủ đám mây của bạn', href: '/dashboard/vps-instances', icon: Server, colorKey: 'blue' },
          { title: 'Quản lý SSL', desc: 'Chứng chỉ bảo mật', href: '/dashboard/ssl-certificates', icon: ShieldCheck, colorKey: 'emerald' },
          { title: 'Quản lý đơn hàng', desc: 'Xem lịch sử và trạng thái', href: '/orders', icon: ShoppingCart, colorKey: 'amber' },
          { title: 'Ví tiền', desc: 'Nạp tiền và xem giao dịch', href: '/wallet', icon: CreditCard, colorKey: 'rose' },
          { title: 'Hỗ trợ', desc: 'Tạo ticket hoặc xem lịch sử', href: '/tickets', icon: Activity, colorKey: 'indigo' },
          { title: 'Tên miền', desc: 'Quản lý DNS', href: '/domains', icon: Globe, colorKey: 'cyan' },
          { title: 'Tự động gia hạn', desc: 'Quản lý gia hạn tự động', href: '/dashboard/auto-renew', icon: Clock, colorKey: 'violet' },
          { title: 'Backup VPS', desc: 'Sao lưu và khôi phục', href: '/dashboard/vps-backups', icon: Clock, colorKey: 'teal' },
          { title: 'Lịch sử thanh toán', desc: 'Xem giao dịch ví', href: '/dashboard/payments', icon: CreditCard, colorKey: 'emerald' },
          { title: 'Hóa đơn', desc: 'Tải xuống hóa đơn', href: '/dashboard/invoices', icon: FileText, colorKey: 'sky' },
          { title: 'Thông báo', desc: 'Cài đặt thông báo', href: '/dashboard/notifications', icon: Activity, colorKey: 'amber' },
        ].map((action) => (
          <Link
            key={`action-${action.href}`}
            href={action.href}
            className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all group"
          >
            <action.icon className={`w-8 h-8 ${colorClasses[action.colorKey]} mb-3 group-hover:scale-110 transition-transform`} />
            <h3 className="font-bold text-slate-900 mb-1">{action.title}</h3>
            <p className="text-sm text-slate-500 mb-3">{action.desc}</p>
            <span className="text-sm font-semibold text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
              Vào ngay <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        ))}
      </div>

      {/* Recently Viewed */}
      <RecentlyViewed />
    </div>
  );
}
