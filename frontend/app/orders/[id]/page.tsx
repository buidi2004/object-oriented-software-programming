'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, FileText, Download, ShieldCheck, Server, 
  Globe, Clock, CheckCircle2, AlertCircle, RefreshCw, Package
} from 'lucide-react';
import AutoRenewToggle from '@/src/components/AutoRenewToggle';
import ReviewForm from '@/src/components/ReviewForm';

interface OrderDetail {
  id: string;
  orderDate: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  invoice?: Invoice;
  backups?: Backup[];
  uptime?: UptimeData;
}

interface OrderItem {
  type: 'vps' | 'hosting' | 'domain';
  title: string;
  price: number;
  details?: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  url: string;
}

interface Backup {
  id: string;
  date: string;
  size: string;
  type: string;
}

interface UptimeData {
  percentage: number;
  period: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  pending: { label: 'Chờ thanh toán', color: 'bg-amber-100 text-amber-700', icon: Clock },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-[#1F1F1F]', icon: RefreshCw },
  completed: { label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-700', icon: AlertCircle },
};

function mapOrderStatus(status: string): OrderDetail['status'] {
  switch (status?.toLowerCase()) {
    case 'pending': return 'pending';
    case 'paid': return 'completed';
    case 'cancelled':
    case 'refunded': return 'cancelled';
    default: return 'processing';
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchOrder(token);
  }, [orderId, router]);

  const fetchOrder = async (token: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrder({
          id: data.id,
          orderDate: data.createdAt,
          status: mapOrderStatus(data.status),
          totalAmount: data.totalAmount,
          items: [{
            type: 'vps',
            title: data.servicePlanName || 'Dịch vụ',
            price: data.totalAmount,
          }],
        });
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'vps': return <Server className="w-4 h-4" />;
      case 'hosting': return <ShieldCheck className="w-4 h-4" />;
      case 'domain': return <Globe className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Không tìm thấy đơn hàng</h2>
          <Link href="/dashboard/orders" className="text-[#1F1F1F] hover:underline">
            ← Quay lại danh sách đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[order.status]?.icon || Clock;
  const StatusClass = statusConfig[order.status]?.color || 'bg-slate-100 text-slate-700';
  const StatusLabel = statusConfig[order.status]?.label || order.status;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/dashboard/orders" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#1F1F1F]">
            <ArrowLeft className="w-4 h-4" />
            Quay lại đơn hàng
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#1F1F1F]">
            Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Order Header */}
        <div className="bg-white rounded-md p-6 border border-slate-200 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-extrabold text-slate-900">Đơn #{orderId.slice(0, 8)}</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${StatusClass}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {StatusLabel}
                </span>
              </div>
              <p className="text-slate-600">
                Đặt ngày: {new Date(order.orderDate).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-600 mb-1">Tổng thanh toán</p>
              <p className="text-3xl font-black text-[#1F1F1F]">
                {order.totalAmount.toLocaleString('vi-VN')} đ
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-md border border-slate-200 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#1F1F1F]" />
                  Dịch vụ đã đặt
                </h2>
              </div>
              <div className="divide-y divide-slate-100">
                {order.items.map((item: any) => (
                  <div key={item.id} className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-slate-900">{item.servicePlanName}</h3>
                        <p className="text-sm text-slate-600 mt-1">Chu kỳ: {item.billingCycle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">{item.unitPrice.toLocaleString('vi-VN')} đ</p>
                        <p className="text-sm text-slate-600">Số lượng: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Thêm AutoRenewToggle cho Order */}
            <AutoRenewToggle orderId={orderId} initialState={false} />

            {/* Thêm ReviewForm cho Order đã hoàn thành */}
            {order.status === 'completed' && (
              <ReviewForm orderId={orderId} />
            )}
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-md p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Dịch vụ đã đặt</h2>
              <div className="space-y-4">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between py-4 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-sm bg-slate-100 text-slate-600">
                        {getStatusIcon(item.type)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        {item.details && (
                          <p className="text-sm text-slate-600 mt-1">{item.details}</p>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-slate-900">
                      {item.price.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invoice */}
            {order.invoice && (
              <div className="bg-white rounded-md p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Hóa đơn</h2>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded">
                  <div>
                    <p className="font-semibold text-slate-900">Invoice #{order.invoice.id}</p>
                    <p className="text-sm text-slate-600">{new Date(order.invoice.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                  <button
                    onClick={handleDownloadInvoice}
                    className="px-4 py-2 rounded bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Tải PDF
                  </button>
                </div>
              </div>
            )}

            {/* Backups */}
            {order.backups && order.backups.length > 0 && (
              <div className="bg-white rounded-md p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Backup</h2>
                <div className="space-y-3">
                  {order.backups.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                      <div>
                        <p className="font-medium text-slate-900">{backup.type}</p>
                        <p className="text-sm text-slate-600">{new Date(backup.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <span className="text-sm text-slate-600">{backup.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Uptime */}
            {order.uptime && (
              <div className="bg-white rounded-md p-6 border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Uptime</h2>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-black text-emerald-600">{order.uptime.percentage}%</p>
                    <p className="text-sm text-slate-600">Thời gian hoạt động</p>
                  </div>
                  <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${order.uptime.percentage}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-600 mt-2">Kỳ: {order.uptime.period}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-md p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Thao tác nhanh</h2>
              <div className="space-y-3">
                <button className="w-full py-3 rounded bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Khởi động lại
                </button>
                <button className="w-full py-3 rounded bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Tải lại OS
                </button>
                <button className="w-full py-3 rounded bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4" />
                  Xem thông tin
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-md p-6 text-slate-900">
              <h3 className="font-bold text-lg mb-2">Cần hỗ trợ?</h3>
              <p className="text-sm text-slate-700 mb-4">
                Đội ngũ kỹ thuật sẵn sàng hỗ trợ 24/7
              </p>
              <Link
                href="/tickets"
                className="block w-full py-3 rounded bg-white text-[#1F1F1F] font-bold text-sm text-center hover:bg-blue-50 transition-colors"
              >
                Tạo ticket hỗ trợ
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
