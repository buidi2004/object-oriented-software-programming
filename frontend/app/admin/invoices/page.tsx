'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { FileText, Download, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function AdminInvoicesPage() {
  const { toast, showToast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        setInvoices(data);
      }
    } catch (err) {
      showToast('Lỗi khi tải danh sách hóa đơn', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (id: string) => {
    showToast(`Đang tải hóa đơn #${id}`, 'info');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', 'info')} />}
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
              </Link>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Quản Lý Hóa Đơn Toàn Hệ Thống
              </h1>
              <p className="text-slate-500 mt-1">Xem và tải xuống hóa đơn điện tử của khách hàng</p>
            </div>
            <button
              onClick={fetchInvoices}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:text-blue-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-4 font-semibold">Mã Hóa Đơn</th>
                    <th className="p-4 font-semibold">Ngày Xuất</th>
                    <th className="p-4 font-semibold">Mã Đơn Hàng</th>
                    <th className="p-4 font-semibold">Tổng Tiền</th>
                    <th className="p-4 font-semibold">Trạng Thái</th>
                    <th className="p-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">Không có hóa đơn nào</td>
                    </tr>
                  ) : (
                    invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50">
                        <td className="p-4 font-bold text-slate-900">{inv.invoiceNumber}</td>
                        <td className="p-4">{new Date(inv.issuedAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4 text-xs font-mono">{inv.orderId.substring(0, 8)}...</td>
                        <td className="p-4 font-bold text-slate-900">{inv.amount?.toLocaleString('vi-VN')}đ</td>
                        <td className="p-4">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                            <CheckCircle2 className="w-3 h-3" /> Đã thanh toán
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleDownload(inv.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 font-medium text-slate-700 transition-colors"
                          >
                            <Download className="w-4 h-4" /> Tải PDF
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
