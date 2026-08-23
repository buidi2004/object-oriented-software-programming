'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Search, ShieldAlert, Activity, User, Globe, Clock, 
  ChevronLeft, ChevronRight, Download, Trash2, Filter, Eye, CheckCircle2, 
  AlertCircle, RefreshCw, X, ShieldCheck, Server, ShoppingCart, 
  CreditCard, Wallet, Tag, FileText, Lock, Copy, Check
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface AuditLog {
  id: string;
  userId: string | null;
  userEmail: string | null;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress: string;
  timestamp: string;
  details?: string;
}

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntity, setSelectedEntity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'AUTH' | 'FINANCE' | 'SERVICES' | 'SYSTEM'>('ALL');
  const [timeFilter, setTimeFilter] = useState<'ALL' | 'TODAY' | '7DAYS' | '30DAYS'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const logsPerPage = 15;

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialLogs: AuditLog[] = [
    {
      id: 'log-1',
      userId: 'usr-admin-01',
      userEmail: 'admin@cloudservicestore.com',
      action: 'UPDATE_SERVICE_PLAN',
      entityName: 'ServicePlan',
      entityId: 'plan-vps-pro-4c',
      ipAddress: '14.225.254.10',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      details: JSON.stringify({ field: 'Price', oldVal: 450000, newVal: 420000, note: 'Admin updated monthly pricing for Cloud VPS Pro' }, null, 2)
    },
    {
      id: 'log-2',
      userId: 'usr-admin-01',
      userEmail: 'admin@cloudservicestore.com',
      action: 'CREATE_PROMOTION',
      entityName: 'Promotion',
      entityId: 'promo-flashsale-sep',
      ipAddress: '14.225.254.10',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      details: JSON.stringify({ code: 'FLASHSALE25', discount: '25%', target: 'All VPS Plans', duration: '7 days' }, null, 2)
    },
    {
      id: 'log-3',
      userId: 'usr-cust-99',
      userEmail: 'buididongthap2004@gmail.com',
      action: 'WALLET_TOPUP_SUCCESS',
      entityName: 'Wallet',
      entityId: 'wal-topup-9988',
      ipAddress: '113.161.78.20',
      timestamp: new Date(Date.now() - 85 * 60 * 1000).toISOString(),
      details: JSON.stringify({ gateway: 'VietQR (MB Bank 24/7)', amount: 2000000, status: 'SUCCESS' }, null, 2)
    },
    {
      id: 'log-4',
      userId: 'usr-cust-99',
      userEmail: 'buididongthap2004@gmail.com',
      action: 'ORDER_PAYMENT_WALLET',
      entityName: 'Order',
      entityId: 'ord-8819',
      ipAddress: '113.161.78.20',
      timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      details: JSON.stringify({ method: 'Wallet Balance', amount: 890000, orderId: 'ord-8819', status: 'PAID' }, null, 2)
    },
    {
      id: 'log-5',
      userId: 'usr-admin-01',
      userEmail: 'admin@cloudservicestore.com',
      action: 'LOCK_USER_ACCOUNT',
      entityName: 'User',
      entityId: 'usr-spam-04',
      ipAddress: '14.225.254.10',
      timestamp: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      details: JSON.stringify({ reason: 'DDoS traffic origin detected by Cloudflare WAF filter' }, null, 2)
    },
    {
      id: 'log-6',
      userId: 'usr-editor-02',
      userEmail: 'editor@cloudhost.vn',
      action: 'PUBLISH_ARTICLE',
      entityName: 'NewsArticle',
      entityId: 'art-k8s-tutorial',
      ipAddress: '27.72.105.44',
      timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
      details: JSON.stringify({ title: 'Hướng Dẫn Cài Đặt Kubernetes & Docker Trên Cloud VPS Ubuntu 24.04' }, null, 2)
    }
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      const isAllowed = ['Admin', 'Accountant', 'Technician', 'Editor', 'Staff'].some(
        r => r.toLowerCase() === (response.data?.role || '').toLowerCase()
      );
      if (!isAllowed) { 
        router.push('/dashboard'); 
        return; 
      }
      fetchAuditLogs();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/audit-logs').catch(() => null);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setLogs(res.data);
      } else {
        const saved = localStorage.getItem('admin_audit_logs');
        if (saved) {
          try {
            setLogs(JSON.parse(saved));
          } catch {
            setLogs(initialLogs);
          }
        } else {
          setLogs(initialLogs);
        }
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Thoi_Gian,Nguoi_Thuc_Hien,Hanh_Dong,Doi_Tuong,Ma_Doi_Tuong,IP_Address\n"
      + filteredLogs.map(l => `"${l.id}","${l.timestamp}","${l.userEmail || 'System'}","${l.action}","${l.entityName}","${l.entityId}","${l.ipAddress}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Đã xuất toàn bộ nhật ký kiểm toán ra file CSV!');
  };

  const handleCopyPayload = () => {
    if (!selectedLog) return;
    navigator.clipboard.writeText(selectedLog.details || '{}');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Human-readable labels and metadata
  const getActionInfo = (action: string) => {
    const a = action.toUpperCase();
    if (a.includes('TOPUP') || a.includes('WALLET')) {
      return { 
        label: 'Giao Dịch Ví Tiền', 
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
        icon: Wallet,
        category: 'FINANCE'
      };
    }
    if (a.includes('ORDER') || a.includes('PAYMENT')) {
      return { 
        label: 'Thanh Toán Đơn Hàng', 
        badge: 'bg-blue-50 text-blue-700 border-blue-200', 
        icon: ShoppingCart,
        category: 'FINANCE'
      };
    }
    if (a.includes('LOCK') || a.includes('SUSPEND') || a.includes('FAIL')) {
      return { 
        label: 'Cảnh Báo / Khóa Tài Khoản', 
        badge: 'bg-rose-50 text-rose-700 border-rose-200', 
        icon: Lock,
        category: 'AUTH'
      };
    }
    if (a.includes('SERVICE') || a.includes('PLAN') || a.includes('VPS')) {
      return { 
        label: 'Cập Nhật Dịch Vụ / Máy Chủ', 
        badge: 'bg-purple-50 text-purple-700 border-purple-200', 
        icon: Server,
        category: 'SERVICES'
      };
    }
    if (a.includes('PROMO') || a.includes('COUPON') || a.includes('ARTICLE')) {
      return { 
        label: 'Khuyến Mãi & Bài Viết', 
        badge: 'bg-amber-50 text-amber-700 border-amber-200', 
        icon: Tag,
        category: 'SYSTEM'
      };
    }
    return { 
      label: 'Hệ Thống / Cấu Hình', 
      badge: 'bg-slate-100 text-slate-700 border-slate-200', 
      icon: Activity,
      category: 'SYSTEM'
    };
  };

  // Stats calculation
  const stats = useMemo(() => {
    let authCount = 0;
    let financeCount = 0;
    let servicesCount = 0;
    let systemCount = 0;

    logs.forEach(log => {
      const info = getActionInfo(log.action);
      if (info.category === 'AUTH') authCount++;
      else if (info.category === 'FINANCE') financeCount++;
      else if (info.category === 'SERVICES') servicesCount++;
      else systemCount++;
    });

    return { total: logs.length, authCount, financeCount, servicesCount, systemCount };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const now = Date.now();
    return logs.filter(log => {
      const info = getActionInfo(log.action);

      // Category filter
      if (selectedCategory !== 'ALL' && info.category !== selectedCategory) {
        return false;
      }

      // Entity filter
      if (selectedEntity !== 'ALL' && log.entityName !== selectedEntity) {
        return false;
      }

      // Time filter
      if (timeFilter !== 'ALL') {
        const logTime = new Date(log.timestamp).getTime();
        if (timeFilter === 'TODAY' && now - logTime > 24 * 3600 * 1000) return false;
        if (timeFilter === '7DAYS' && now - logTime > 7 * 24 * 3600 * 1000) return false;
        if (timeFilter === '30DAYS' && now - logTime > 30 * 24 * 3600 * 1000) return false;
      }

      // Search filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchEmail = log.userEmail?.toLowerCase().includes(term);
        const matchAction = log.action.toLowerCase().includes(term);
        const matchEntity = log.entityName.toLowerCase().includes(term);
        const matchEntityId = log.entityId.toLowerCase().includes(term);
        const matchIp = log.ipAddress.toLowerCase().includes(term);
        return matchEmail || matchAction || matchEntity || matchEntityId || matchIp;
      }

      return true;
    });
  }, [logs, selectedCategory, selectedEntity, timeFilter, searchTerm]);

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;
  const currentLogs = filteredLogs.slice((currentPage - 1) * logsPerPage, currentPage * logsPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-lg shadow-xl text-white font-semibold text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5">
              <ShieldAlert className="w-7 h-7 text-[#1F1F1F]" />
              Nhật Ký Thao Tác Hệ Thống (Audit Logs)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Theo dõi và kiểm toán toàn bộ hành động của Quản trị viên, Khách hàng và Hệ thống tự động
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Xuất CSV</span>
            </button>
            <button
              onClick={fetchAuditLogs}
              className="p-2 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-bold"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Nhật Ký</span>
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.total}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Toàn bộ lịch sử kiểm toán
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tài Chính & Ví</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.financeCount}
            </p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">
              Nạp tiền ví & Thanh toán đơn hàng
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dịch Vụ & Máy Chủ</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.servicesCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Cấu hình VPS, Plan, Gia hạn
            </p>
          </div>

          <div className="bg-white p-4.5 rounded-lg border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bảo Mật & Khóa Acc</span>
              <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-slate-900">
              {stats.authCount}
            </p>
            <p className="text-[11px] text-rose-600 font-medium mt-1">
              Cảnh báo WAF, Lock tài khoản
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-3.5">
          {/* Top Row: Categories & Time Filter */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Category tabs */}
            <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-md text-xs font-bold">
              <button
                onClick={() => { setSelectedCategory('ALL'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded transition-colors ${selectedCategory === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tất cả ({logs.length})
              </button>
              <button
                onClick={() => { setSelectedCategory('FINANCE'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded transition-colors ${selectedCategory === 'FINANCE' ? 'bg-white text-emerald-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Tài chính & Ví ({stats.financeCount})
              </button>
              <button
                onClick={() => { setSelectedCategory('SERVICES'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded transition-colors ${selectedCategory === 'SERVICES' ? 'bg-white text-purple-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Dịch vụ ({stats.servicesCount})
              </button>
              <button
                onClick={() => { setSelectedCategory('AUTH'); setCurrentPage(1); }}
                className={`px-3 py-1.5 rounded transition-colors ${selectedCategory === 'AUTH' ? 'bg-white text-rose-700 shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Bảo mật ({stats.authCount})
              </button>
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium">Thời gian:</span>
              <select
                value={timeFilter}
                onChange={(e) => { setTimeFilter(e.target.value as any); setCurrentPage(1); }}
                className="px-2.5 py-1.5 rounded bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="ALL">Toàn thời gian</option>
                <option value="TODAY">24 giờ qua</option>
                <option value="7DAYS">7 ngày qua</option>
                <option value="30DAYS">30 ngày qua</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Search Box & Entity Selector */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm theo email, hành động, IP hoặc mã thực thể..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:border-[#1F1F1F] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-400 whitespace-nowrap">Thực thể:</span>
              <select
                value={selectedEntity}
                onChange={(e) => { setSelectedEntity(e.target.value); setCurrentPage(1); }}
                className="w-full sm:w-auto px-3 py-2 rounded bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="ALL">Tất cả thực thể</option>
                <option value="ServicePlan">ServicePlan (Gói dịch vụ)</option>
                <option value="Order">Order (Đơn hàng)</option>
                <option value="Wallet">Wallet (Ví tiền)</option>
                <option value="User">User (Tài khoản)</option>
                <option value="Promotion">Promotion (Khuyến mãi)</option>
                <option value="NewsArticle">NewsArticle (Tin tức)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Audit Logs Master Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Người Thực Hiện</th>
                  <th className="p-4">Hành Động</th>
                  <th className="p-4">Thực Thể &amp; ID</th>
                  <th className="p-4">Địa Chỉ IP</th>
                  <th className="p-4">Thời Gian</th>
                  <th className="p-4 text-right">Chi Tiết Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <ShieldAlert className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700">Không tìm thấy bản ghi nhật ký nào</p>
                      <p className="text-xs text-slate-400 mt-0.5">Thử thay đổi từ khóa hoặc thiết lập lại bộ lọc</p>
                    </td>
                  </tr>
                ) : (
                  currentLogs.map((log) => {
                    const info = getActionInfo(log.action);
                    const ActionIcon = info.icon;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* User / Actor */}
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">
                                {log.userEmail || 'Hệ Thống Tự Động'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono">
                                ID: {log.userId || 'system'}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Action Badge */}
                        <td className="p-4">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${info.badge}`}>
                              <ActionIcon className="w-3 h-3" />
                              {log.action}
                            </span>
                            <p className="text-[11px] text-slate-500 font-medium">
                              {info.label}
                            </p>
                          </div>
                        </td>

                        {/* Entity and ID */}
                        <td className="p-4">
                          <div>
                            <span className="font-bold text-slate-900 text-xs">
                              {log.entityName}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                              {log.entityId}
                            </span>
                          </div>
                        </td>

                        {/* IP Address */}
                        <td className="p-4">
                          <span className="font-mono text-[11px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60">
                            {log.ipAddress}
                          </span>
                        </td>

                        {/* Timestamp */}
                        <td className="p-4 text-slate-600 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 text-xs">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {new Date(log.timestamp).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </span>
                          </div>
                        </td>

                        {/* Action Button */}
                        <td className="p-4 text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-[#1F1F1F] hover:text-white font-bold text-slate-700 transition-all shadow-2xs text-[11px]"
                            title="Xem chi tiết Payload"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem Payload</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 bg-[#f8fafc]">
              <div>
                Hiển thị trang <strong className="text-slate-900">{currentPage}</strong> / <strong>{totalPages}</strong> (Tổng cộng {filteredLogs.length} nhật ký)
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-2.5 py-1 text-xs font-bold text-slate-700 bg-white rounded border border-slate-200">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-colors shadow-2xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Payload Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-lg p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-[#1F1F1F]" />
                  <h3 className="text-base font-black text-slate-900">Chi Tiết Payload Nhật Ký</h3>
                </div>
                <button 
                  onClick={() => setSelectedLog(null)} 
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs overflow-y-auto">
                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded border border-slate-100">
                  <div>
                    <span className="text-slate-400 block font-medium">Hành động:</span>
                    <span className="font-bold text-slate-900 font-mono">{selectedLog.action}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Thực thể & ID:</span>
                    <span className="font-bold text-slate-900">{selectedLog.entityName} ({selectedLog.entityId})</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Người thực hiện:</span>
                    <span className="font-bold text-slate-900">{selectedLog.userEmail || 'Hệ thống'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Địa chỉ IP & Thời gian:</span>
                    <span className="font-bold text-slate-900">{selectedLog.ipAddress} • {new Date(selectedLog.timestamp).toLocaleTimeString('vi-VN')}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-700">Dữ Liệu JSON (Payload / Changes):</span>
                    <button
                      onClick={handleCopyPayload}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{isCopied ? 'Đã sao chép!' : 'Sao chép JSON'}</span>
                    </button>
                  </div>
                  <div className="bg-[#1E293B] text-emerald-400 p-4 rounded-md font-mono text-xs overflow-x-auto max-h-64 border border-slate-800 shadow-inner">
                    <pre>{selectedLog.details || '{\n  "status": "No extra payload parameters logged"\n}'}</pre>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-4 py-2 rounded bg-[#1F1F1F] hover:bg-black text-white font-bold text-xs transition-colors"
                >
                  Đóng cửa sổ
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
