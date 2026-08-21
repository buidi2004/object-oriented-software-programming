'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, AlertCircle, RefreshCw, Download } from 'lucide-react';

interface OrderItem {
  id: string;
  serviceName?: string;
  planName?: string;
  quantity?: number;
  unitPrice?: number;
}

interface Order {
  id: string;
  // API không có servicePlanName trực tiếp — lấy từ items[]
  items: OrderItem[];
  status: string;
  subTotal?: number;
  discountAmount?: number;
  totalAmount: number;
  autoRenew?: boolean;
  createdAt: string;
}

const statusLabels: Record<string, string> = {
  Pending: 'Chờ thanh toán',
  Paid: 'Đã thanh toán',
  Cancelled: 'Đã hủy',
  Refunded: 'Hoàn tiền',
  pending: 'Chờ thanh toán',
  completed: 'Hoàn thành',
  processing: 'Đang xử lý',
  cancelled: 'Đã hủy',
};

const statusColors: Record<string, string> = {
  Pending: 'bg-amber-100 text-amber-700',
  Paid: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
  Refunded: 'bg-slate-100 text-slate-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-emerald-100 text-emerald-700',
  processing: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        setError('Không thể tải danh sách đơn hàng.');
      }
    } catch {
      setError('Không thể tải danh sách đơn hàng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/exports/orders?format=csv', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // Try to get filename from Content-Disposition header if possible
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'orders.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch.length === 2) {
          filename = filenameMatch[1];
        }
      }
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Không thể xuất dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsExporting(false);
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Đơn hàng của tôi</h1>
          <p className="text-slate-500 mt-1">Theo dõi trạng thái và chi tiết đơn hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            data-testid="export-csv-btn"
            disabled={isExporting || orders.length === 0}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden sm:inline">Xuất CSV</span>
          </button>
          <button
            onClick={fetchOrders}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-medium text-slate-500">Chưa có đơn hàng nào</p>
            <Link href="/services" className="inline-block mt-4 text-blue-600 font-semibold hover:text-blue-700">
              Khám phá dịch vụ
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div>
                  <p className="font-semibold text-slate-900">#{order.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {order.items?.[0]?.serviceName
                      || order.items?.[0]?.planName
                      || (order.items?.length ? `${order.items.length} dịch vụ` : 'Đơn hàng dịch vụ')}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-slate-100 text-slate-700'}`}>
                      {statusLabels[order.status] || order.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-bold text-slate-900">{order.totalAmount.toLocaleString('vi-VN')}₫</p>
                  <Link
                    href={`/orders/${order.id}`}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
