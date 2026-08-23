'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Users, 
  Calendar, Download, CheckCircle2, AlertCircle, PieChart, 
  FileSpreadsheet, FileText, Sparkles, Filter, RefreshCw,
  Wallet, ArrowDownLeft, ArrowUpRight, ArrowDownRight, ShieldCheck, CreditCard, ChevronRight,
  Flame, AlertTriangle, Package, Check, HelpCircle, UserPlus, UserCheck, UserX, Activity, Target
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '@/src/lib/api';

// Dynamic import for recharts
const ResponsiveContainer = React.lazy(() => import('recharts').then(m => ({ default: m.ResponsiveContainer })));
const AreaChart = React.lazy(() => import('recharts').then(m => ({ default: m.AreaChart })));
const Area = React.lazy(() => import('recharts').then(m => ({ default: m.Area })));
const BarChart = React.lazy(() => import('recharts').then(m => ({ default: m.BarChart })));
const Bar = React.lazy(() => import('recharts').then(m => ({ default: m.Bar })));
const XAxis = React.lazy(() => import('recharts').then(m => ({ default: m.XAxis })));
const YAxis = React.lazy(() => import('recharts').then(m => ({ default: m.YAxis })));
const CartesianGrid = React.lazy(() => import('recharts').then(m => ({ default: m.CartesianGrid })));
const Tooltip = React.lazy(() => import('recharts').then(m => ({ default: m.Tooltip })));

interface RevenueTrendItem {
  date: string;
  revenue: number;
  walletTopUp: number;
  refunds: number;
  orders: number;
  users: number;
}

interface UserTrendItem {
  date: string;
  newUsers: number;
  activeUsers: number;
  dormantUsers: number;
}

interface TopSellingService {
  planId: string;
  planName: string;
  categoryName: string;
  totalUnitsSold: number;
  totalRevenue: number;
  revenueSharePercentage: string;
}

interface TopRefundedService {
  serviceName: string;
  reason: string;
  refundCount: number;
  totalRefundedAmount: number;
  status: string;
}

export default function AdminRevenuePage() {
  const router = useRouter();
  const [revenueData, setRevenueData] = useState<RevenueTrendItem[]>([]);
  const [userTrendData, setUserTrendData] = useState<UserTrendItem[]>([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState<any[]>([]);
  const [topSellingServices, setTopSellingServices] = useState<TopSellingService[]>([]);
  const [topRefundedServices, setTopRefundedServices] = useState<TopRefundedService[]>([]);
  
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    averageOrderValue: 0,
    totalWalletTopUp: 0,
    totalRefunds: 0,
    totalWalletBalance: 0,
    netCashFlow: 0,
    previousPeriodRevenue: 0,
    growthPercentage: 0,
    isGrowthPositive: true,
    newUsersInPeriod: 0,
    activeUsersInPeriod: 0,
    dormantUsersCount: 0,
    userConversionRate: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '365d'>('30d');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
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
      const isAllowed = ['Admin', 'Accountant', 'Staff'].some(
        r => r.toLowerCase() === (response.data?.role || '').toLowerCase()
      );
      if (!isAllowed) {
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
        setUserTrendData(data.userTrend || []);
        setCategoryBreakdown(data.categoryBreakdown || []);
        setTopSellingServices(data.topSellingServices || []);
        setTopRefundedServices(data.topRefundedServices || []);
        
        setStats({
          totalRevenue: data.totalRevenue || 0,
          totalOrders: data.totalOrders || 0,
          totalUsers: data.totalUsers || 0,
          averageOrderValue: data.averageOrderValue || 0,
          totalWalletTopUp: data.totalWalletTopUp || 0,
          totalRefunds: data.totalRefunds || 0,
          totalWalletBalance: data.totalWalletBalance || 0,
          netCashFlow: data.netCashFlow || 0,
          previousPeriodRevenue: data.previousPeriodRevenue || 0,
          growthPercentage: data.growthPercentage || 0,
          isGrowthPositive: data.isGrowthPositive !== false,
          newUsersInPeriod: data.newUsersInPeriod || 0,
          activeUsersInPeriod: data.activeUsersInPeriod || 0,
          dormantUsersCount: data.dormantUsersCount || 0,
          userConversionRate: data.userConversionRate || 0,
        });
      }
    } catch (err) {
      console.error('Failed to load revenue data:', err);
      showToast('Lỗi khi tải dữ liệu tài chính & người dùng', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Export native Excel (.XLSX) multi-sheet
  const handleExportXLSX = () => {
    setIsExporting(true);
    try {
      // Sheet 1: Summary
      const summaryData = [
        { 'Chỉ Số': 'Doanh Thu Bán Hàng (Kỳ Này)', 'Giá Trị': stats.totalRevenue, 'Đơn Vị': 'VNĐ', 'Ghi Chú': `Tổng tiền khách mua dịch vụ ${dateRange}` },
        { 'Chỉ Số': 'Doanh Thu Bán Hàng (Kỳ Trước)', 'Giá Trị': stats.previousPeriodRevenue, 'Đơn Vị': 'VNĐ', 'Ghi Chú': 'Doanh số kỳ trước đó để so sánh tăng trưởng' },
        { 'Chỉ Số': 'Tỷ Lệ Tăng Trưởng (%)', 'Giá Trị': `${stats.isGrowthPositive ? '+' : '-'}${stats.growthPercentage}%`, 'Đơn Vị': '%', 'Ghi Chú': stats.isGrowthPositive ? 'Tăng trưởng dương' : 'Suy giảm' },
        { 'Chỉ Số': 'Tiền Khách Nạp Ví', 'Giá Trị': stats.totalWalletTopUp, 'Đơn Vị': 'VNĐ', 'Ghi Chú': 'Nạp qua VNPay, MoMo, Ngân hàng' },
        { 'Chỉ Số': 'Tiền Khách Rút / Hoàn Ví', 'Giá Trị': stats.totalRefunds, 'Đơn Vị': 'VNĐ', 'Ghi Chú': 'Đã duyệt hoàn tiền về ngân hàng' },
        { 'Chỉ Số': 'Tổng Số Dư Ví Đang Lưu Hành', 'Giá Trị': stats.totalWalletBalance, 'Đơn Vị': 'VNĐ', 'Ghi Chú': 'Số dư khách đang giữ trong ví tài khoản' },
        { 'Chỉ Số': 'Dòng Tiền Ròng Thực Thu', 'Giá Trị': stats.netCashFlow, 'Đơn Vị': 'VNĐ', 'Ghi Chú': 'Mua hàng + Nạp ví - Hoàn tiền' },
        { 'Chỉ Số': 'Tổng Khách Hàng Hệ Thống', 'Giá Trị': stats.totalUsers, 'Đơn Vị': 'Người', 'Ghi Chú': 'Tổng tài khoản đã đăng ký' },
        { 'Chỉ Số': 'Khách Hàng Mới Đăng Ký', 'Giá Trị': stats.newUsersInPeriod, 'Đơn Vị': 'Người', 'Ghi Chú': `Thành viên mới trong ${dateRange}` },
        { 'Chỉ Số': 'Khách Hàng Đang Hoạt Động', 'Giá Trị': stats.activeUsersInPeriod, 'Đơn Vị': 'Người', 'Ghi Chú': 'Có đăng nhập hoặc mua hàng gần đây' },
        { 'Chỉ Số': 'Khách Hàng Không Truy Cập Lâu', 'Giá Trị': stats.dormantUsersCount, 'Đơn Vị': 'Người', 'Ghi Chú': '> 30 ngày chưa đăng nhập' },
        { 'Chỉ Số': 'Tỷ Lệ Mua Hàng (Conversion)', 'Giá Trị': `${stats.userConversionRate}%`, 'Đơn Vị': '%', 'Ghi Chú': 'Khách hàng có phát sinh đơn thanh toán' },
      ];

      // Sheet 2: User Activity Trends
      const userExportData = userTrendData.map(u => ({
        'Ngày': u.date,
        'Khách Hàng Mới': u.newUsers,
        'Đang Hoạt Động': u.activeUsers,
        'Không Truy Cập Lâu': u.dormantUsers
      }));

      // Sheet 3: Top Selling & Refunds
      const topSellingData = topSellingServices.map((s, idx) => ({
        'Hạng': `#${idx + 1}`,
        'Tên Gói Dịch Vụ': s.planName,
        'Danh Mục': s.categoryName,
        'Số Lượng Đã Bán': s.totalUnitsSold,
        'Tổng Doanh Thu (VNĐ)': s.totalRevenue,
        'Tỷ Trọng (%)': s.revenueSharePercentage
      }));

      const topRefundData = topRefundedServices.map((r, idx) => ({
        'STT': idx + 1,
        'Dịch Vụ Bị Hoàn': r.serviceName,
        'Lý Do Hoàn Tiền': r.reason,
        'Số Lượt Hoàn': r.refundCount,
        'Tổng Tiền Hoàn (VNĐ)': r.totalRefundedAmount,
        'Trạng Thái': r.status
      }));

      // Sheet 4: Daily trend
      const dailyData = revenueData.map(r => ({
        'Ngày Đối Soát': r.date,
        'Tiền Mua Hàng (VNĐ)': r.revenue,
        'Tiền Nạp Ví (VNĐ)': r.walletTopUp || 0,
        'Tiền Rút/Hoàn Ví (VNĐ)': r.refunds || 0,
        'Dòng Tiền Ngày (VNĐ)': (r.revenue + (r.walletTopUp || 0)) - (r.refunds || 0),
        'Số Đơn Hàng': r.orders,
        'Khách Hàng Mới': r.users
      }));

      const wb = XLSX.utils.book_new();
      
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary['!cols'] = [{ wch: 38 }, { wch: 22 }, { wch: 12 }, { wch: 48 }];
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng Quan Tài Chính & Users');

      const wsUsers = XLSX.utils.json_to_sheet(userExportData);
      wsUsers['!cols'] = [{ wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 24 }];
      XLSX.utils.book_append_sheet(wb, wsUsers, 'Theo Dõi Người Dùng');

      const wsTop = XLSX.utils.json_to_sheet(topSellingData);
      wsTop['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 20 }, { wch: 18 }, { wch: 24 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, wsTop, 'Top Dịch Vụ Bán Chạy');

      const wsRefunds = XLSX.utils.json_to_sheet(topRefundData);
      wsRefunds['!cols'] = [{ wch: 8 }, { wch: 30 }, { wch: 40 }, { wch: 16 }, { wch: 22 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, wsRefunds, 'Dịch Vụ Bị Hoàn Tiền');

      const wsDaily = XLSX.utils.json_to_sheet(dailyData);
      wsDaily['!cols'] = [{ wch: 16 }, { wch: 22 }, { wch: 20 }, { wch: 22 }, { wch: 22 }, { wch: 14 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, wsDaily, 'Dòng Tiền Chi Tiết');

      const timestamp = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Bao_Cao_Tai_Chinh_Users_${dateRange}_${timestamp}.xlsx`);

      showToast('Đã xuất báo cáo tài chính & người dùng (.XLSX) thành công!', 'success');
    } catch (err) {
      console.error('Export error:', err);
      showToast('Lỗi khi xuất tệp báo cáo Excel', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + ' đ';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const rangeLabel = dateRange === '7d' ? '7 ngày trước' : dateRange === '30d' ? 'tháng trước' : dateRange === '90d' ? 'quý trước' : 'năm trước';

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-bold text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <TrendingUp className="w-6 h-6 text-emerald-600" />
              <span>Báo Cáo Doanh Thu, Tăng Trưởng &amp; Người Dùng</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Theo dõi đối soát dòng tiền 3 chiều kết hợp biểu đồ người dùng mới, người dùng hoạt động và tỷ lệ chuyển đổi.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-bold">
              {(['7d', '30d', '90d', '365d'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    dateRange === r
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {r === '7d' ? '7 Ngày' : r === '30d' ? '30 Ngày' : r === '90d' ? '3 Tháng' : '1 Năm'}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportXLSX}
              disabled={isExporting}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isExporting ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <FileSpreadsheet className="w-4 h-4" />
              )}
              <span>Xuất Excel (.XLSX)</span>
            </button>
          </div>
        </div>

        {/* 6 Core Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Card 1: Tiền Khách Mua Hàng + Growth % Badge */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <ShoppingCart className="w-5 h-5" />
              </div>
              
              <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1 border ${
                stats.isGrowthPositive 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {stats.isGrowthPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{stats.isGrowthPositive ? '+' : '-'}{stats.growthPercentage}%</span>
              </span>
            </div>

            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(stats.totalRevenue)}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              🛒 Tiền Khách Mua Hàng (Doanh Thu Dịch Vụ)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              {stats.isGrowthPositive ? 'Tăng' : 'Giảm'} so với {rangeLabel} ({formatCurrency(stats.previousPeriodRevenue)})
            </p>
          </div>

          {/* Card 2: Tiền Khách Nạp Ví */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Top-Up Deposits
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">
              {formatCurrency(stats.totalWalletTopUp)}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              💳 Tiền Khách Nạp Vào Ví Tài Khoản
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Dòng tiền nạp qua VNPay, MoMo, Chuyển khoản ngân hàng.
            </p>
          </div>

          {/* Card 3: Tiền Khách Rút / Hoàn Ví */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                Refunds Approved
              </span>
            </div>
            <p className="text-2xl font-black text-rose-600 tracking-tight">
              {formatCurrency(stats.totalRefunds)}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              💸 Tiền Khách Rút Ví / Hoàn Trả Ngân Hàng
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Các khoản hoàn tiền dịch vụ đã được kế toán xét duyệt thành công.
            </p>
          </div>

          {/* Card 4: Số Dư Ví Đang Lưu Hành */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                Ví Lưu Hành
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(stats.totalWalletBalance)}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              💰 Tổng Số Dư Khách Đang Giữ Trong Ví
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Khoản tiền khả dụng trong ví của {stats.totalUsers} khách hàng.
            </p>
          </div>

          {/* Card 5: Dòng Tiền Ròng Thực Tế */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                Net Cash Flow
              </span>
            </div>
            <p className="text-2xl font-black text-indigo-700 tracking-tight">
              {formatCurrency(stats.netCashFlow)}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              📈 Dòng Tiền Ròng Thực Thu (Net Cash Flow)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              = (Tiền Mua Hàng + Nạp Ví) - Tiền Rút/Hoàn Ví.
            </p>
          </div>

          {/* Card 6: Giá Trị Đơn Trung Bình */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                {stats.totalOrders} đơn hàng
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(stats.averageOrderValue)}
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">
              📊 Giá Trị Trung Bình Mỗi Đơn Hàng (AOV)
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Tổng số {stats.totalOrders} đơn hàng đã hoàn tất thanh toán.
            </p>
          </div>

        </div>

        {/* Multi-Series Chart 1: Revenue Streams */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900">Biểu Đồ Đối Soát Dòng Tiền Theo Thời Gian</h2>
              <p className="text-xs text-slate-500">So sánh trực quan: Tiền Mua Hàng (Xanh dương), Tiền Nạp Ví (Xanh lá) và Tiền Hoàn Trả (Đỏ).</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Mua Hàng
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Nạp Ví
              </span>
              <span className="flex items-center gap-1.5 text-rose-600">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" /> Rút / Hoàn Ví
              </span>
            </div>
          </div>

          <div className="h-[280px] w-full pt-2">
            <React.Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-slate-400">Đang tải biểu đồ...</div>}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTopUp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorRefund" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)}M` : `${val / 1000}k`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any, name: any) => [
                      formatCurrency(Number(value) || 0), 
                      name === 'revenue' ? 'Tiền Mua Hàng' : name === 'walletTopUp' ? 'Tiền Nạp Ví' : 'Tiền Rút/Hoàn Ví'
                    ]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                  <Area type="monotone" dataKey="walletTopUp" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTopUp)" />
                  <Area type="monotone" dataKey="refunds" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRefund)" />
                </AreaChart>
              </ResponsiveContainer>
            </React.Suspense>
          </div>
        </div>

        {/* 4 USER ENGAGEMENT & RETENTION KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* User Card 1: Tổng Người Dùng */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Users className="w-4.5 h-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                Toàn Hệ Thống
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              {stats.totalUsers} <span className="text-xs font-normal text-slate-500">khách hàng</span>
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">👥 Tổng Tài Khoản Người Dùng</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tất cả khách hàng đã kích hoạt tài khoản</p>
          </div>

          {/* User Card 2: Người Dùng Mới Đăng Ký */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <UserPlus className="w-4.5 h-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                {dateRange}
              </span>
            </div>
            <p className="text-2xl font-black text-blue-600 tracking-tight">
              +{stats.newUsersInPeriod} <span className="text-xs font-normal text-slate-500">đăng ký mới</span>
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">🚀 Khách Hàng Đăng Ký Mới</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Số lượng tài khoản mới mở trong kỳ</p>
          </div>

          {/* User Card 3: Người Dùng Đang Hoạt Động */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <UserCheck className="w-4.5 h-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Active Users
              </span>
            </div>
            <p className="text-2xl font-black text-emerald-600 tracking-tight">
              {stats.activeUsersInPeriod} <span className="text-xs font-normal text-slate-500">tài khoản</span>
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">⚡ Đang Hoạt Động Tích Cực</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Có đăng nhập hoặc phát sinh đơn hàng gần đây</p>
          </div>

          {/* User Card 4: Người Dùng Không Truy Cập Lâu */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <UserX className="w-4.5 h-4.5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200">
                Dormant &gt;30d
              </span>
            </div>
            <p className="text-2xl font-black text-amber-600 tracking-tight">
              {stats.dormantUsersCount} <span className="text-xs font-normal text-slate-500">tài khoản</span>
            </p>
            <p className="text-xs font-bold text-slate-600 mt-1">💤 Chưa Truy Cập Lâu (&gt;30 ngày)</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tỷ lệ mua hàng: <strong>{stats.userConversionRate}%</strong></p>
          </div>

        </div>

        {/* CHART 2: USER REGISTRATION & ENGAGEMENT TREND */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-600" />
                <span>Biểu Đồ Theo Dõi Hoạt Động &amp; Tăng Trưởng Khách Hàng</span>
              </h2>
              <p className="text-xs text-slate-500">Phân tích tương quan: Đăng ký mới (Tím), Đang hoạt động (Xanh lá) và Không truy cập lâu (Cam).</p>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-purple-600">
                <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /> Đăng Ký Mới
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Đang Hoạt Động
              </span>
              <span className="flex items-center gap-1.5 text-amber-600">
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Chưa Truy Cập Lâu
              </span>
            </div>
          </div>

          <div className="h-[260px] w-full pt-2">
            <React.Suspense fallback={<div className="h-full flex items-center justify-center text-xs text-slate-400">Đang tải biểu đồ khách hàng...</div>}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorNewUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorActiveUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDormantUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }} 
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fontSize: 11, fill: '#64748b' }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    formatter={(value: any, name: any) => [
                      `${Number(value) || 0} người dùng`, 
                      name === 'newUsers' ? 'Khách Đăng Ký Mới' : name === 'activeUsers' ? 'Đang Hoạt Động' : 'Chưa Truy Cập Lâu'
                    ]}
                  />
                  <Area type="monotone" dataKey="newUsers" stroke="#8b5cf6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorNewUsers)" />
                  <Area type="monotone" dataKey="activeUsers" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorActiveUsers)" />
                  <Area type="monotone" dataKey="dormantUsers" stroke="#f59e0b" strokeWidth={2.5} fillOpacity={1} fill="url(#colorDormantUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            </React.Suspense>
          </div>
        </div>

        {/* 2 SECTION CARDS: TOP SELLING SERVICES & TOP REFUNDED SERVICES */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* TOP 5 DỊCH VỤ ĐƯỢC MUA NHIỀU NHẤT */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Top Gói Dịch Vụ Được Mua Nhiều Nhất</span>
              </h3>
              <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                Top Bán Chạy
              </span>
            </div>

            {topSellingServices.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs">Chưa có dữ liệu đơn hàng trong kỳ này.</div>
            ) : (
              <div className="space-y-3.5">
                {topSellingServices.map((svc, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-3 hover:bg-slate-100/70 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black shrink-0 ${
                        idx === 0 ? 'bg-amber-500 text-white' : idx === 1 ? 'bg-slate-400 text-white' : idx === 2 ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">{svc.planName}</p>
                        <p className="text-[11px] text-slate-500">{svc.categoryName} • <strong className="text-slate-700 font-bold">{svc.totalUnitsSold} lượt mua</strong></p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-blue-600">{formatCurrency(svc.totalRevenue)}</p>
                      <span className="text-[10px] font-bold text-slate-500 font-mono">Chiếm {svc.revenueSharePercentage}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TOP DỊCH VỤ BỊ YÊU CẦU HOÀN TIỀN & LÝ DO */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Dịch Vụ Bị Yêu Cầu Hoàn Tiền &amp; Lý Do</span>
              </h3>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Đối Soát Rủi Ro
              </span>
            </div>

            {topRefundedServices.length === 0 ? (
              <div className="text-center py-10 text-emerald-600 font-bold text-xs bg-emerald-50/50 rounded-xl border border-emerald-100">
                ✓ Tuyệt vời! Không có yêu cầu hoàn tiền nào trong kỳ này.
              </div>
            ) : (
              <div className="space-y-3.5">
                {topRefundedServices.map((ref, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-50/40 border border-rose-200/70 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{ref.serviceName}</p>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                          {ref.refundCount} yêu cầu
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 italic leading-tight line-clamp-1">
                        " {ref.reason} "
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-rose-600">{formatCurrency(ref.totalRefundedAmount)}</p>
                      <span className="text-[10px] font-bold text-slate-500">{ref.status === 'Approved' ? 'Đã duyệt hoàn' : ref.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Bottom Split: Category Breakdown & Daily Detailed Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Category Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-slate-700" />
              <span>Cơ Cấu Doanh Thu Theo Danh Mục</span>
            </h3>

            {categoryBreakdown.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Chưa có dữ liệu cơ cấu doanh thu.</p>
            ) : (
              <div className="space-y-3.5">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-slate-800">{cat.name}</span>
                      <span className="text-slate-500 font-mono">{cat.sharePercentage} ({formatCurrency(cat.revenue)})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${cat.color || 'bg-blue-600'}`}
                        style={{ width: `${parseFloat(cat.sharePercentage) || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Table Log */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-700" />
                <span>Bảng Kê Đối Soát Thu - Chi Chi Tiết ({revenueData.length} ngày)</span>
              </h3>
              <button
                onClick={handleExportXLSX}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Tải Bảng Kê Excel</span>
              </button>
            </div>

            <div className="overflow-x-auto max-h-[300px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">Ngày</th>
                    <th className="p-2.5">Tiền Mua Hàng</th>
                    <th className="p-2.5">Tiền Nạp Ví</th>
                    <th className="p-2.5">Tiền Rút/Hoàn Ví</th>
                    <th className="p-2.5">Dòng Tiền Ngày</th>
                    <th className="p-2.5">Số Đơn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                  {revenueData.slice(-15).reverse().map((row, idx) => {
                    const netDay = (row.revenue + (row.walletTopUp || 0)) - (row.refunds || 0);
                    return (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{row.date}</td>
                        <td className="p-2.5 text-blue-600 font-bold">{formatCurrency(row.revenue)}</td>
                        <td className="p-2.5 text-emerald-600 font-bold">{formatCurrency(row.walletTopUp || 0)}</td>
                        <td className="p-2.5 text-rose-600 font-bold">{formatCurrency(row.refunds || 0)}</td>
                        <td className={`p-2.5 font-bold ${netDay >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
                          {formatCurrency(netDay)}
                        </td>
                        <td className="p-2.5 text-slate-500">{row.orders} đơn</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
