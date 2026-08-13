'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Download } from 'lucide-react';

// Dynamic import for recharts to avoid SSR issues
const ResponsiveContainer = React.lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
const AreaChart = React.lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
const Area = React.lazy(() => import('recharts').then(m => ({ default: m.Area })));
const XAxis = React.lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const YAxis = React.lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const CartesianGrid = React.lazy(() => import('recharts').then(m => ({ default: m.CartesianGrid })));
const Tooltip = React.lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));

interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
  users: number;
}

export default function AdminRevenuePage() {
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    monthlyGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

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
        if (userData.role !== 'Admin') {
          router.push('/dashboard');
          return;
        }
        // Mock data for demo
        const mockData: RevenueData[] = Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          revenue: Math.random() * 50000000 + 10000000,
          orders: Math.floor(Math.random() * 50) + 10,
          users: Math.floor(Math.random() * 20) + 5,
        }));
        setRevenueData(mockData);
        
        const totalRevenue = mockData.reduce((sum, item) => sum + item.revenue, 0);
        const totalOrders = mockData.reduce((sum, item) => sum + item.orders, 0);
        
        setStats({
          totalRevenue,
          totalOrders,
          totalUsers: 150,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          monthlyGrowth: 15.5,
        });
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Failed to check admin access:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Thống kê Doanh thu</h1>
              <p className="text-sm text-slate-500">Xem báo cáo và thống kê kinh doanh</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">90 ngày qua</option>
            </select>
            <button className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Tổng doanh thu', value: `${(stats.totalRevenue / 1000000).toFixed(1)}M đ`, icon: DollarSign, color: 'emerald' },
            { label: 'Tổng đơn hàng', value: stats.totalOrders.toLocaleString(), icon: ShoppingCart, color: 'blue' },
            { label: 'Tổng người dùng', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'purple' },
            { label: 'Giá trị TB đơn', value: `${Math.round(stats.averageOrderValue).toLocaleString('vi-VN')} đ`, icon: TrendingUp, color: 'amber' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-xl p-5 border border-slate-200">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-100 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                </div>
                {idx === 0 && (
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    +{stats.monthlyGrowth}%
                  </span>
                )}
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Biểu đồ doanh thu</h2>
          <div className="h-80">
            <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }}
                    labelFormatter={(label) => `Ngày ${label}`}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </React.Suspense>
          </div>
        </div>

        {/* Recent Orders Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Đơn hàng theo ngày</h2>
            <div className="h-64">
              <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="orders" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </React.Suspense>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Người dùng mới</h2>
            <div className="h-64">
              <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="users" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </React.Suspense>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
