'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Server, ShoppingCart, CreditCard, Globe, ShieldCheck,
  Activity, Clock, TrendingUp, AlertCircle, ArrowRight, FileText, Wallet as WalletIcon
} from 'lucide-react';
import RecentlyViewed from '../../src/components/RecentlyViewed';
import { api } from '@/src/lib/api';
import { DashboardLoyaltyWidgets } from '@/src/components/team-features/DashboardLoyaltyWidgets';

interface DashboardStats {
  walletBalance: number;
  totalOrders: number;
  activeServices: number;
  totalSpent: number;     // API: totalSpent
  loyaltyPoints: number; // from /loyalty/me
  openTickets: number;   // from /tickets/me count
  invoicesCount: number;
}

const colorClasses: Record<string, string> = {
  blue: 'text-[#1F1F1F]',
  emerald: 'text-[#1F1F1F]',
  amber: 'text-[#1F1F1F]',
  cyan: 'text-[#1F1F1F]',
  purple: 'text-[#1F1F1F]',
  rose: 'text-[#1F1F1F]',
  indigo: 'text-[#1F1F1F]',
  violet: 'text-[#1F1F1F]',
  teal: 'text-[#1F1F1F]',
  sky: 'text-[#1F1F1F]',
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
      const [dashboardRes, loyaltyRes, ticketsRes, walletRes] = await Promise.all([
        api.get('/dashboard/me').catch(() => null),
        api.get('/loyalty/me').catch(() => null),
        api.get('/tickets/me').catch(() => ({ data: [] })),
        api.get('/wallet/me').catch(() => null),
      ]);

      const dash = dashboardRes?.data || {};
      setStats({
        walletBalance: walletRes?.data?.balance ?? 0,
        totalOrders:   dash.totalOrders   ?? 0,
        activeServices: Array.isArray(dash.activeServices) ? dash.activeServices.length : (dash.activeServices ?? 0),
        totalSpent:    dash.totalSpent     ?? 0,
        loyaltyPoints: loyaltyRes?.data?.points ?? 0,
        openTickets:   Array.isArray(ticketsRes?.data)
          ? ticketsRes.data.filter((t: any) => t.status !== 'Closed' && t.status !== 'Resolved').length
          : 0,
        invoicesCount: 0,
      });

      if (dashboardRes?.data?.user) {
        setUser(dashboardRes.data.user);
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
        <div className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
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
        <p className="text-slate-600 mt-1">Quản lý tất cả dịch vụ Cloud và số dư ví của bạn tại đây</p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={checkAuth} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-sm text-xs font-semibold">
            Thử lại
          </button>
        </div>
      )}

      <DashboardLoyaltyWidgets />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Số dư ví', value: `${(stats?.walletBalance || 0).toLocaleString('vi-VN')} đ`, icon: WalletIcon, colorKey: 'emerald', href: '/dashboard/wallet' },
          { label: 'Đơn hàng', value: stats?.totalOrders || 0, icon: ShoppingCart, colorKey: 'blue', href: '/dashboard/orders' },
          { label: 'Dịch vụ chạy', value: stats?.activeServices || 0, icon: Server, colorKey: 'emerald', href: '/dashboard/vps-instances' },
          { label: 'Hóa đơn chờ', value: stats?.invoicesCount || 0, icon: FileText, colorKey: 'rose', href: '/dashboard/invoices' },
          { label: 'Điểm thưởng', value: stats?.loyaltyPoints || 0, icon: ShieldCheck, colorKey: 'purple', href: '/dashboard' },
          { label: 'Tổng chi tiêu', value: stats?.totalSpent ? `${(stats.totalSpent / 1000).toFixed(0)}K₫` : '0đ', icon: TrendingUp, colorKey: 'rose', href: '/dashboard/payments' },
        ].map((stat) => (
          <Link 
            key={`stat-${stat.label}`} 
            href={stat.href} 
            className="bg-white rounded-md p-4 border border-slate-200 hover:border-slate-400 hover:shadow-xs transition-all block group"
          >
            <stat.icon className={`w-6 h-6 ${colorClasses[stat.colorKey]} mb-2 group-hover:scale-110 transition-transform`} />
            <p className="text-xl font-black text-slate-900 truncate">{stat.value}</p>
            <p className="text-xs text-slate-600 font-medium mt-0.5">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Ví tiền & Nạp tiền', desc: 'Nạp VietQR 24/7 và kiểm soát số dư ví', href: '/dashboard/wallet', icon: WalletIcon, colorKey: 'emerald' },
          { title: 'Quản lý VPS', desc: 'Máy chủ đám mây của bạn', href: '/dashboard/vps-instances', icon: Server, colorKey: 'blue' },
          { title: 'Quản lý SSL', desc: 'Chứng chỉ bảo mật', href: '/dashboard/ssl-certificates', icon: ShieldCheck, colorKey: 'emerald' },
          { title: 'Hỗ trợ kỹ thuật', desc: 'Gửi yêu cầu hoặc theo dõi ticket', href: '/dashboard/tickets', icon: Activity, colorKey: 'blue' },
          { title: 'Tên miền', desc: 'Quản lý DNS', href: '/domains', icon: Globe, colorKey: 'cyan' },
          { title: 'Tự động gia hạn', desc: 'Quản lý gia hạn tự động', href: '/dashboard/auto-renew', icon: Clock, colorKey: 'violet' },
          { title: 'Backup VPS', desc: 'Sao lưu và khôi phục', href: '/dashboard/vps-backups', icon: Clock, colorKey: 'teal' },
          { title: 'Hóa đơn', desc: 'Tải xuống hóa đơn', href: '/dashboard/invoices', icon: FileText, colorKey: 'sky' },
        ].map((action) => (
          <Link
            key={`action-${action.href}`}
            href={action.href}
            className="bg-white rounded-md p-6 border border-slate-200 hover:border-slate-400 hover:shadow-lg transition-all group"
          >
            <action.icon className={`w-8 h-8 ${colorClasses[action.colorKey]} mb-3 group-hover:scale-110 transition-transform`} />
            <h3 className="font-bold text-slate-900 mb-1">{action.title}</h3>
            <p className="text-sm text-slate-600 mb-3">{action.desc}</p>
            <span className="text-sm font-semibold text-[#1F1F1F] flex items-center gap-1 group-hover:gap-2 transition-all">
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
