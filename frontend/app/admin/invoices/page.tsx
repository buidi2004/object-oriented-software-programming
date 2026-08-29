'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  FileText, Download, ArrowLeft, RefreshCw, CheckCircle2, 
  Search, Filter, Clock, XCircle, Wallet, ShoppingCart, 
  Printer, User, ExternalLink, ShieldCheck, Eye, Trash2, Plus
} from 'lucide-react';
import { TransactionReceiptModal, ReceiptData } from '@/src/components/TransactionReceiptModal';

interface AdminInvoice {
  id: string;
  orderRequestId: string;
  invoiceNumber: string;
  issuedAt: string;
  dueDate?: string;
  pdfUrl?: string;
  amount: number;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: string;
  planName?: string;
  containerName?: string;
  paymentMethod?: string;
  transactionCode?: string;
  status?: string;
  type?: string;
}

export default function AdminInvoicesPage() {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Order' | 'TopUp'>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    amount: 500000,
    customerName: 'Nguyễn Văn A'
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch('/api/orders/invoices/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInvoices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: Number(createForm.amount),
          customerName: createForm.customerName
        })
      });
      if (res.ok) {
        setIsCreating(false);
        alert('Tạo hóa đơn thành công!');
        fetchInvoices();
      } else {
        alert('Lỗi tạo hóa đơn');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleDeleteInvoice = async (id: string, num: string) => {
    if (!confirm(`Bạn có chắc muốn xóa hóa đơn ${num}?`)) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Đã xóa hóa đơn thành công!');
        fetchInvoices();
      } else {
        alert('Lỗi khi xóa hóa đơn');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    let totalRevenue = 0;
    let paidCount = 0;
    let pendingCount = 0;
    let topUpCount = 0;
    let orderCount = 0;

    invoices.forEach(inv => {
      const isPaid = inv.status?.toLowerCase() === 'paid' || inv.status === 'ĐÃ THANH TOÁN';
      if (isPaid) {
        totalRevenue += inv.amount || 0;
        paidCount++;
      } else if (inv.status?.toLowerCase() === 'pending') {
        pendingCount++;
      }

      if (inv.type === 'TopUp') {
        topUpCount++;
      } else {
        orderCount++;
      }
    });

    return { totalRevenue, paidCount, pendingCount, topUpCount, orderCount, total: invoices.length };
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // Status filter
      const isPaid = inv.status?.toLowerCase() === 'paid' || inv.status === 'ĐÃ THANH TOÁN';
      if (statusFilter === 'paid' && !isPaid) return false;
      if (statusFilter === 'pending' && (isPaid || inv.status?.toLowerCase() === 'cancelled')) return false;
      if (statusFilter === 'cancelled' && inv.status?.toLowerCase() !== 'cancelled') return false;

      // Type filter
      if (typeFilter === 'Order' && inv.type === 'TopUp') return false;
      if (typeFilter === 'TopUp' && inv.type !== 'TopUp') return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNumber = inv.invoiceNumber?.toLowerCase().includes(q);
        const matchName = inv.customerName?.toLowerCase().includes(q);
        const matchEmail = inv.customerEmail?.toLowerCase().includes(q);
        const matchTx = inv.transactionCode?.toLowerCase().includes(q);
        const matchOrderId = inv.orderRequestId?.toLowerCase().includes(q);
        return matchNumber || matchName || matchEmail || matchTx || matchOrderId;
      }

      return true;
    });
  }, [invoices, statusFilter, typeFilter, searchQuery]);

  const handleOpenReceipt = (inv: AdminInvoice) => {
    setSelectedReceipt({
      id: inv.transactionCode || inv.orderRequestId || inv.id,
      type: inv.type === 'TopUp' ? 'credit' : 'debit',
      rawType: inv.type || 'Order',
      amount: inv.amount,
      description: inv.type === 'TopUp' 
        ? 'Hóa đơn nạp tiền vào ví CloudHost VN' 
        : `Hóa đơn thanh toán đơn hàng #${inv.orderRequestId.slice(0, 8)}`,
      date: inv.issuedAt,
      userFullName: inv.customerName || 'Khách hàng',
      userEmail: inv.customerEmail || '',
      userAddress: inv.customerAddress || 'Việt Nam'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-4 h-4" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-[#1F1F1F]" />
              Quản Lý Hóa Đơn Toàn Hệ Thống
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Kiểm soát tất cả hóa đơn thanh toán dịch vụ và hóa đơn nạp tiền ví của khách hàng
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsCreating(true)}
              className="p-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Hóa Đơn Mới</span>
            </button>
            <button
              onClick={fetchInvoices}
              className="p-2.5 rounded bg-[#1E293B] bg-opacity-70 backdrop-blur-md border border-white/10 hover:bg-[#0F172A] text-slate-500 transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-bold"
              title="Làm mới danh sách"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Làm mới</span>
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-4.5 rounded-lg border border-white/10 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tổng Doanh Thu</span>
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                ₫
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats.totalRevenue.toLocaleString('vi-VN')} đ
            </p>
            <p className="text-[11px] text-emerald-600 font-bold mt-1">
              ✓ {stats.paidCount} hóa đơn đã thanh toán
            </p>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-4.5 rounded-lg border border-white/10 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hóa Đơn Dịch Vụ</span>
              <div className="w-8 h-8 rounded-full bg-blue-900/30 text-blue-400 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats.orderCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Thuê Cloud VPS, Hosting, Domain
            </p>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-4.5 rounded-lg border border-white/10 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hóa Đơn Nạp Ví</span>
              <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats.topUpCount}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Nạp tiền VietQR / MoMo / ZaloPay
            </p>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-4.5 rounded-lg border border-white/10 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chờ Thanh Toán</span>
              <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-xl sm:text-2xl font-black text-white">
              {stats.pendingCount}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              Đơn hàng chưa hoàn tất chuyển khoản
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg border border-white/10 p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Type filters */}
            <div className="flex items-center bg-white/10 p-1 rounded-md text-xs font-bold">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1.5 rounded transition-colors ${typeFilter === 'all' ? 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-white shadow-2xs' : 'text-slate-500 hover:text-white'}`}
              >
                Tất cả loại ({invoices.length})
              </button>
              <button
                onClick={() => setTypeFilter('Order')}
                className={`px-3 py-1.5 rounded transition-colors ${typeFilter === 'Order' ? 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-blue-300 shadow-2xs' : 'text-slate-500 hover:text-white'}`}
              >
                Mua dịch vụ ({stats.orderCount})
              </button>
              <button
                onClick={() => setTypeFilter('TopUp')}
                className={`px-3 py-1.5 rounded transition-colors ${typeFilter === 'TopUp' ? 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-purple-700 shadow-2xs' : 'text-slate-500 hover:text-white'}`}
              >
                Nạp tiền ví ({stats.topUpCount})
              </button>
            </div>

            {/* Status filters */}
            <div className="flex items-center bg-white/10 p-1 rounded-md text-xs font-bold">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded transition-colors ${statusFilter === 'all' ? 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-white shadow-2xs' : 'text-slate-500 hover:text-white'}`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusFilter('paid')}
                className={`px-3 py-1.5 rounded transition-colors ${statusFilter === 'paid' ? 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-emerald-700 shadow-2xs' : 'text-slate-500 hover:text-white'}`}
              >
                Đã thanh toán
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-3 py-1.5 rounded transition-colors ${statusFilter === 'pending' ? 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-amber-700 shadow-2xs' : 'text-slate-500 hover:text-white'}`}
              >
                Chờ thanh toán
              </button>
            </div>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã HĐ, tên khách, email..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-[#0F172A] border border-white/10 rounded-md focus:bg-[#1E293B] bg-opacity-70 backdrop-blur-md focus:border-[#1F1F1F] outline-none"
            />
          </div>
        </div>

        {/* Invoices Master Table */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg border border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-500">
              <thead className="bg-[#f8fafc] border-b border-white/10 text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="p-4">Mã Hóa Đơn</th>
                  <th className="p-4">Loại</th>
                  <th className="p-4">Khách Hàng</th>
                  <th className="p-4">Ngày Tạo</th>
                  <th className="p-4">Tổng Tiền</th>
                  <th className="p-4">Phương Thức</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center text-slate-500">
                      <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-3 text-slate-500">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-200">Không tìm thấy hóa đơn nào</p>
                      <p className="text-xs text-slate-500 mt-0.5">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isPaid = inv.status?.toLowerCase() === 'paid' || inv.status === 'ĐÃ THANH TOÁN';
                    const isTopUp = inv.type === 'TopUp';

                    return (
                      <tr key={inv.id} className="hover:bg-[#0F172A]/70 transition-colors">
                        <td className="p-4 font-mono font-bold text-white">
                          {inv.invoiceNumber}
                        </td>

                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isTopUp 
                              ? 'bg-purple-50 text-purple-700 border border-purple-200/60' 
                              : 'bg-blue-900/30 text-blue-300 border border-blue-200/60'
                          }`}>
                            {isTopUp ? <Wallet className="w-3 h-3" /> : <ShoppingCart className="w-3 h-3" />}
                            {isTopUp ? 'Nạp tiền ví' : 'Mua dịch vụ'}
                          </span>
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-white">{inv.customerName}</p>
                          <p className="text-[11px] text-slate-500">{inv.customerEmail}</p>
                        </td>

                        <td className="p-4 text-slate-500">
                          {new Date(inv.issuedAt).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>

                        <td className="p-4 font-black text-white text-sm">
                          {inv.amount?.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="p-4 text-[11px] text-slate-500 max-w-[180px] truncate">
                          {inv.paymentMethod}
                        </td>

                        <td className="p-4">
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán
                            </span>
                          ) : inv.status?.toLowerCase() === 'cancelled' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-500">
                              <XCircle className="w-3.5 h-3.5" /> Đã hủy
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3.5 h-3.5" /> Chờ thanh toán
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenReceipt(inv)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-[#1F1F1F] hover:text-white font-bold text-slate-200 transition-all shadow-2xs text-[11px]"
                            title="Xem hóa đơn chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem hóa đơn</span>
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors text-[11px]"
                            title="Xóa hóa đơn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Xóa</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Tạo Hóa Đơn Mới */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Lập Hóa Đơn Mới
            </h3>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Tên Khách Hàng</label>
                <input
                  type="text"
                  required
                  placeholder="Công ty TNHH Giải Pháp Số"
                  value={createForm.customerName}
                  onChange={(e) => setCreateForm({ ...createForm, customerName: e.target.value })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">Số Tiền Hóa Đơn (VNĐ)</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm({ ...createForm, amount: Number(e.target.value) })}
                  className="w-full text-sm border border-white/20 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white/10 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Lập Hóa Đơn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Transaction Receipt & Invoice Modal */}
      <TransactionReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        transaction={selectedReceipt}
      />
    </div>
  );
}
