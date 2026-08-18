'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { ShoppingBag, ArrowLeft, RefreshCw, DollarSign, CheckCircle } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function AdminMarketplacePurchasesPage() {
  const { toast, showToast } = useToast();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/marketplace/purchases/admin');
      setPurchases(response.data || []);
    } catch (err) {
      showToast('Lỗi khi tải danh sách Giao dịch Marketplace', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending</span>;
      case 2: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3"/> Completed</span>;
      case 3: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700">Refunded</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Unknown</span>;
    }
  };

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
                <ShoppingBag className="w-6 h-6 text-fuchsia-600" />
                Quản Lý Chợ Ứng Dụng (Marketplace)
              </h1>
              <p className="text-slate-500 mt-1">Theo dõi các giao dịch mua bán Plugin, Theme, Code của khách hàng</p>
            </div>
            <button
              onClick={fetchPurchases}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:text-fuchsia-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-4 font-semibold">Mã Giao Dịch</th>
                    <th className="p-4 font-semibold">User ID</th>
                    <th className="p-4 font-semibold">Sản Phẩm (Listing ID)</th>
                    <th className="p-4 font-semibold">Số Tiền</th>
                    <th className="p-4 font-semibold">Trạng Thái</th>
                    <th className="p-4 font-semibold">Thời Gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {purchases.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">Chưa có giao dịch nào</td>
                    </tr>
                  ) : (
                    purchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-slate-50/50">
                        <td className="p-4 text-xs font-mono font-bold text-slate-900">{purchase.id.substring(0, 8)}...</td>
                        <td className="p-4 text-xs font-mono">{purchase.userId}</td>
                        <td className="p-4 text-xs font-mono">{purchase.listingId}</td>
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-1">
                          {purchase.amountPaid.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="p-4">{getStatusBadge(purchase.status)}</td>
                        <td className="p-4">{new Date(purchase.purchasedAt).toLocaleDateString('vi-VN')}</td>
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
