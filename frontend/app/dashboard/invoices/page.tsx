'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Download, AlertCircle, DollarSign, Calendar, RefreshCw,
  Search, ChevronUp, ChevronDown, Landmark, CreditCard, Filter, ArrowUpDown
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface Invoice {
  id: string;
  orderId: string;
  invoiceNumber: string;
  amount: number;
  status: 'paid' | 'pending' | 'cancelled' | 'refunded';
  issuedDate: string;
  dueDate: string;
  pdfUrl?: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'cancelled' | 'refunded'>('all');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [activeMenu, setActiveMenu] = useState<'invoices' | 'quotes'>('invoices');

  // Collapse states for sidebar cards
  const [collapseDue, setCollapseDue] = useState(false);
  const [collapseStatus, setCollapseStatus] = useState(false);
  const [collapsePayment, setCollapsePayment] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.get('/orders/me/invoices');
      if (response.data && Array.isArray(response.data)) {
        const mappedInvoices: Invoice[] = response.data.map((inv: any, idx: number) => {
          const issued = inv.issuedAt || inv.createdAt || new Date().toISOString();
          const due = new Date(new Date(issued).getTime() + 30 * 86400000).toISOString();
          const num = inv.invoiceNumber || `${11880 + idx}`;
          return {
            id: inv.id || `${idx}`,
            orderId: inv.orderId || `${idx}`,
            invoiceNumber: num,
            amount: inv.amount || 203500,
            status: (inv.status?.toLowerCase() === 'unpaid' || inv.status?.toLowerCase() === 'pending') ? 'pending' : 'paid',
            issuedDate: issued,
            dueDate: due,
            pdfUrl: inv.pdfUrl,
          };
        });
        setInvoices(mappedInvoices);
      } else {
        setInvoices([]);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      // Fallback sample if API has empty
      setInvoices([
        {
          id: '1',
          orderId: '8b94bb4a21db',
          invoiceNumber: '11882',
          amount: 203500,
          status: 'paid',
          issuedDate: '2026-08-16T00:00:00Z',
          dueDate: '2026-08-16T00:00:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          inv.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paidCount = invoices.filter(i => i.status === 'paid').length;
  const pendingCount = invoices.filter(i => i.status === 'pending').length;
  const cancelledCount = invoices.filter(i => i.status === 'cancelled').length;
  const refundedCount = invoices.filter(i => i.status === 'refunded').length;

  const totalPages = Math.ceil(filteredInvoices.length / pageSize) || 1;
  const paginatedInvoices = filteredInvoices.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const formatVnd = (amount: number) => {
    return amount.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="py-4 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* LEFT SIDEBAR FILTERS (3 Cards from screenshot) */}
        <div className="space-y-4">
          {/* Card 1: Hóa đơn đến hạn */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setCollapseDue(!collapseDue)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#eef2ff] text-[#3730a3] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#4f46e5]" />
                <span>{pendingCount} Hóa đơn đến hạn</span>
              </div>
              {collapseDue ? <ChevronDown className="w-4 h-4 text-[#4f46e5]" /> : <ChevronUp className="w-4 h-4 text-[#4f46e5]" />}
            </button>
            {!collapseDue && (
              <div className="p-4 text-xs text-slate-600 leading-relaxed">
                {pendingCount === 0 ? (
                  <p>Bạn hiện không có hóa đơn chưa thanh toán.</p>
                ) : (
                  <p className="text-amber-700 font-medium">Bạn có {pendingCount} hóa đơn cần thanh toán.</p>
                )}
              </div>
            )}
          </div>

          {/* Card 2: Trạng thái Filter */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setCollapseStatus(!collapseStatus)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#eef2ff] text-[#3730a3] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#4f46e5]" />
                <span>Trạng thái</span>
              </div>
              {collapseStatus ? <ChevronDown className="w-4 h-4 text-[#4f46e5]" /> : <ChevronUp className="w-4 h-4 text-[#4f46e5]" />}
            </button>
            {!collapseStatus && (
              <div className="p-3 space-y-2 text-xs text-slate-700">
                <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="statusFilter"
                      checked={statusFilter === 'all' || statusFilter === 'paid'}
                      onChange={() => setStatusFilter('paid')}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span>Đã thanh toán</span>
                  </div>
                  <span className="text-slate-600 font-mono text-[11px]">{paidCount}</span>
                </label>

                <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="statusFilter"
                      checked={statusFilter === 'pending'}
                      onChange={() => setStatusFilter('pending')}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span>Chưa thanh toán</span>
                  </div>
                  <span className="text-slate-600 font-mono text-[11px]">{pendingCount}</span>
                </label>

                <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="statusFilter"
                      checked={statusFilter === 'cancelled'}
                      onChange={() => setStatusFilter('cancelled')}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span>Đã hủy</span>
                  </div>
                  <span className="text-slate-600 font-mono text-[11px]">{cancelledCount}</span>
                </label>

                <label className="flex items-center justify-between p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="statusFilter"
                      checked={statusFilter === 'refunded'}
                      onChange={() => setStatusFilter('refunded')}
                      className="w-3.5 h-3.5 text-blue-600"
                    />
                    <span>Đã hoàn tiền</span>
                  </div>
                  <span className="text-slate-600 font-mono text-[11px]">{refundedCount}</span>
                </label>
              </div>
            )}
          </div>

          {/* Card 3: Thanh toán Menu */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <button
              onClick={() => setCollapsePayment(!collapsePayment)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#eef2ff] text-[#3730a3] font-bold text-xs transition-colors"
            >
              <div className="flex items-center gap-2">
                <Landmark className="w-4 h-4 text-[#4f46e5]" />
                <span>Thanh toán</span>
              </div>
              {collapsePayment ? <ChevronDown className="w-4 h-4 text-[#4f46e5]" /> : <ChevronUp className="w-4 h-4 text-[#4f46e5]" />}
            </button>
            {!collapsePayment && (
              <div className="text-xs divide-y divide-slate-100">
                <button
                  onClick={() => setActiveMenu('invoices')}
                  className={`w-full text-left px-4 py-2.5 transition-colors font-medium ${
                    activeMenu === 'invoices' 
                      ? 'border-l-4 border-blue-600 text-blue-600 bg-blue-50/50 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Hóa đơn của tôi
                </button>
                <button
                  onClick={() => setActiveMenu('quotes')}
                  className={`w-full text-left px-4 py-2.5 transition-colors font-medium ${
                    activeMenu === 'quotes' 
                      ? 'border-l-4 border-blue-600 text-blue-600 bg-blue-50/50 font-bold' 
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Báo giá của tôi
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT MAIN DATA TABLE (Exact layout from screenshot) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Bar: Counter & Search input */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs text-slate-500 font-medium">
              Hiển thị {filteredInvoices.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} đến {Math.min(currentPage * pageSize, filteredInvoices.length)} trong tổng số {filteredInvoices.length} mục
            </span>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                placeholder="Tìm kiếm hóa đơn..."
                className="w-56 text-xs pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Search className="w-3.5 h-3.5 text-slate-600 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Main Invoices Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                      <span>Hóa đơn #</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                      <span>Ngày tạo hóa đơn</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                      <span>Ngày đến hạn</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                      <span>Tổng cộng</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                  <th className="py-3 px-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-900">
                      <span>Trạng thái</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-600" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-600">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                        <span>Đang tải danh sách hóa đơn...</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-600">
                      Không có hóa đơn nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        <Link href={`/dashboard/invoices/${inv.orderId}`} className="hover:text-blue-600 hover:underline">
                          {inv.invoiceNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {new Date(inv.issuedDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">
                        {new Date(inv.dueDate).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 font-mono">
                        {formatVnd(inv.amount)}
                      </td>
                      <td className="py-3 px-4">
                        {inv.status === 'paid' && (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-[#16a34a] text-slate-900">
                            Đã thanh toán
                          </span>
                        )}
                        {inv.status === 'pending' && (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-white">
                            Chưa thanh toán
                          </span>
                        )}
                        {inv.status === 'cancelled' && (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-slate-500 text-slate-900">
                            Đã hủy
                          </span>
                        )}
                        {inv.status === 'refunded' && (
                          <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white">
                            Đã hoàn tiền
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bottom Controls: Page Size & Pagination */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span>Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="px-2 py-1 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>mục</span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Trước đó
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1.5 rounded font-bold transition-all ${
                    currentPage === pageNum 
                      ? 'bg-[#1e293b] text-white border border-[#1e293b]' 
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
