'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, Eye, Download, Calendar, User, DollarSign, Clock, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
}

interface OrderItem {
  type: string;
  title: string;
  price: number;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
        const isAllowed = ['Admin', 'Accountant', 'Support', 'Staff'].some(
          r => r.toLowerCase() === (userData.role || '').toLowerCase()
        );
        if (!isAllowed) {
          router.push('/dashboard');
          return;
        }
        fetchOrders(token);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchOrders = async (token: string) => {
    try {
      const response = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        alert('Cập nhật trạng thái đơn hàng thành công!');
        fetchOrders(token);
      } else {
        alert('Lỗi cập nhật trạng thái đơn hàng');
      }
    } catch {
      alert('Lỗi kết nối đến máy chủ');
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đơn hàng #${id.slice(0, 8)}?`)) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Đã xóa đơn hàng thành công!');
        fetchOrders(token);
      } else {
        alert('Lỗi khi xóa đơn hàng');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const handleExportExcel = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;
    try {
      const res = await fetch('/api/orders/export', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Orders_Export_${new Date().getTime()}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      } else {
        alert('Lỗi xuất Excel');
      }
    } catch {
      alert('Lỗi kết nối máy chủ');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'processing': return 'bg-blue-900/50 text-[#1F1F1F]';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-white/10 text-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ thanh toán';
      case 'processing': return 'Đang xử lý';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Quản lý Đơn hàng</h1>
              <p className="text-sm text-slate-500">{orders.length} đơn hàng tổng cộng</p>
            </div>
          </div>
          <button 
            onClick={handleExportExcel}
            className="px-4 py-2 rounded-sm bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Xuất Excel
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded p-4 border border-white/10 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-sm border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="processing">Đang xử lý</option>
            <option value="completed">Hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0F172A] border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Mã đơn</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Khách hàng</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Dịch vụ</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Tổng tiền</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Ngày đặt</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-200">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#0F172A] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-500">#{order.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-white">{order.customerName}</p>
                        <p className="text-xs text-slate-500">{order.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 rounded bg-white/10 text-xs font-medium text-slate-200">
                            {item.title}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {order.totalAmount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs font-bold border border-transparent hover:border-white/20 focus:outline-none cursor-pointer ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">Chờ thanh toán</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      <Link href={`/orders/${order.id}`} className="inline-flex p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-900/30 rounded transition-colors" title="Xem chi tiết">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="inline-flex p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Xóa đơn hàng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">Không tìm thấy đơn hàng nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
