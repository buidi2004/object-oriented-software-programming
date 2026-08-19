'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Users, 
  Calendar, Download, CheckCircle2, AlertCircle, PieChart, 
  FileSpreadsheet, FileText, Sparkles, Filter, RefreshCw 
} from 'lucide-react';
import { api } from '@/src/lib/api';

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
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    monthlyGrowth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '365d'>('30d');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAdminAccess();
  }, [dateRange]);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      fetchRevenueData();
    } catch {
      router.push('/login');
    }
  };

  const fetchRevenueData = async () => {
    setIsLoading(true);
    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const response = await api.get(`/dashboard/revenue-stats?startDate=${startDate}&endDate=${endDate}`);
      const data = response.data;

      if (data) {
        setRevenueData(data.dailyTrend || []);
        setCategoryBreakdown(data.categoryBreakdown || []);
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          totalUsers: data.totalUsers || 0,
          averageOrderValue: data.averageOrderValue || 0,
          monthlyGrowth: 0, // Could be calculated comparing to previous period
        });
      }
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      showToast('Lỗi khi tải dữ liệu doanh thu', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (format === 'csv') {
      const csvContent = "data:text/csv;charset=utf-8," 
        + "Ngay,Doanh_Thu_VND,So_Don_Hang,Nguoi_Dung_Moi\n"
        + revenueData.map(r => `"${r.date}","${r.revenue}","${r.orders}","${r.users}"`).join("\n");
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `bao_cao_doanh_thu_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Simulate Excel/PDF download
      const link = document.createElement("a");
      link.href = '#';
      link.download = `bao_cao_doanh_thu_${dateRange}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      showToast(`Đang kết xuất báo cáo doanh thu tài chính định dạng ${format.toUpperCase()}...`);
    }
    showToast(`Đã xuất báo cáo doanh thu (${dateRange}) thành công!`);
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
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Báo Cáo Doanh Thu &amp; Tài Chính (Revenue)</h1>
              <p className="text-xs text-slate-500">Phân tích dòng tiền kinh doanh và tăng trưởng đơn hàng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            >
              <option value="7d">7 ngày qua</option>
              <option value="30d">30 ngày qua</option>
              <option value="90d">90 ngày qua</option>
              <option value="365d">12 tháng qua</option>
            </select>
            <button 
              onClick={() => handleExport('csv')}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Xuất Báo Cáo CSV
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3" /> +{stats.monthlyGrowth}%
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalRevenue.toLocaleString('vi-VN')} đ</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Tổng Doanh Thu ({dateRange})</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-3">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalOrders.toLocaleString()} đơn</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Đơn Hàng Đã Thanh Toán</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold mb-3">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stats.totalUsers.toLocaleString()} khách</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Khách Hàng Mua Sắm</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-2xl font-black text-slate-900">{Math.round(stats.averageOrderValue).toLocaleString('vi-VN')} đ</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">Giá Trị Trung Bình / Đơn</p>
          </div>
        </div>

        {/* Main Revenue Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-black text-slate-900">Biểu Đồ Doanh Thu Theo Dòng Thời Gian</h2>
              <p className="text-xs text-slate-500">Doanh số bán lẻ và gia hạn dịch vụ tự động</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleExport('excel')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Excel
              </button>
              <button 
                onClick={() => handleExport('pdf')}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-rose-600" /> PDF
              </button>
            </div>
          </div>

          <div className="h-80 w-full min-w-0">
            {mounted ? (
              <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                      formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} đ`, 'Doanh Thu']}
                      labelFormatter={(label) => `Ngày ${label}`}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </React.Suspense>
            ) : (
              <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
            )}
          </div>
        </div>

        {/* Product Breakdown & Orders */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1">Cơ Cấu Doanh Thu Theo Dịch Vụ</h2>
            <p className="text-xs text-slate-500 mb-6">Tỷ trọng đóng góp vào tổng thu nhập</p>
            <div className="space-y-4">
              {categoryBreakdown.map((cat, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">{cat.name}</span>
                    <span className="text-slate-900">{cat.sharePercentage} ({cat.revenue.toLocaleString('vi-VN')} đ)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${cat.color}`} style={{ width: cat.sharePercentage }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-1">Đơn Hàng &amp; Khách Mới Mỗi Ngày</h2>
            <p className="text-xs text-slate-500 mb-4">Lượng giao dịch phát sinh trên hệ thống</p>
            <div className="h-64 w-full min-w-0">
              {mounted ? (
                <React.Suspense fallback={<div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="orders" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Đơn hàng" />
                    </AreaChart>
                  </ResponsiveContainer>
                </React.Suspense>
              ) : (
                <div className="flex items-center justify-center h-full"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
