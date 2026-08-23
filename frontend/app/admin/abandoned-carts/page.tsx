'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, ShoppingCart, Clock, AlertCircle, Package, 
  DollarSign, Mail, Send, Trash2, Search, CheckCircle2, RefreshCw, Sparkles 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface AbandonedCart {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  createdAt: string;
  recoveredAt?: string;
  status: 'abandoned' | 'recovered' | 'reminded';
}

export default function AdminAbandonedCartsPage() {
  const router = useRouter();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'abandoned' | 'recovered' | 'reminded'>('all');
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialCarts: AbandonedCart[] = [
    {
      id: 'cart-1',
      customerId: 'user-001',
      customerName: 'Nguyễn Văn An',
      customerEmail: 'an.nguyen@enterprise.vn',
      items: [
        { name: 'Cloud VPS Pro - 4 vCPU / 8GB RAM', quantity: 1, price: 450000 },
        { name: 'Tên miền .com.vn', quantity: 1, price: 290000 }
      ],
      totalAmount: 740000,
      createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      status: 'abandoned'
    },
    {
      id: 'cart-2',
      customerId: 'user-002',
      customerName: 'Trần Thị Bích',
      customerEmail: 'bich.tran@startup.io',
      items: [
        { name: 'Business Hosting NVMe Platinum', quantity: 1, price: 680000 }
      ],
      totalAmount: 680000,
      createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      recoveredAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      status: 'recovered'
    },
    {
      id: 'cart-3',
      customerId: 'user-003',
      customerName: 'Lê Hoàng Nam',
      customerEmail: 'nam.le@agency.vn',
      items: [
        { name: 'Dedicated Server EPYC 9654', quantity: 1, price: 14500000 },
        { name: 'SSL Wildcard SAN', quantity: 1, price: 1200000 }
      ],
      totalAmount: 15700000,
      createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
      status: 'abandoned'
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
      const isAllowed = ['Admin', 'Editor', 'Staff'].some(
        r => r.toLowerCase() === (response.data?.role || '').toLowerCase()
      );
      if (!isAllowed) { 
        router.push('/dashboard'); 
        return; 
      }
      fetchCarts();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchCarts = () => {
    const saved = localStorage.getItem('admin_abandoned_carts');
    if (saved) {
      try {
        setCarts(JSON.parse(saved));
      } catch {
        setCarts(initialCarts);
      }
    } else {
      setCarts(initialCarts);
    }
    setIsLoading(false);
  };

  const saveCarts = (items: AbandonedCart[]) => {
    setCarts(items);
    localStorage.setItem('admin_abandoned_carts', JSON.stringify(items));
  };

  const sendReminder = async (cartId: string, email: string) => {
    setSendingReminder(cartId);
    try {
      // Simulate sending automated discount recovery email
      await new Promise(r => setTimeout(r, 1000));
      const updated = carts.map(c => c.id === cartId ? { ...c, status: 'reminded' as const } : c);
      saveCarts(updated);
      showToast(`Đã gửi email nhắc nhở kèm mã giảm giá 15% tới ${email}!`);
    } catch {
      showToast('Lỗi khi gửi email nhắc nhở', 'error');
    } finally {
      setSendingReminder(null);
    }
  };

  const handleDeleteCart = (cartId: string) => {
    if (!confirm('Bạn có chắc muốn xóa giỏ hàng này?')) return;
    const updated = carts.filter(c => c.id !== cartId);
    saveCarts(updated);
    showToast('Đã xóa giỏ hàng bỏ quên thành công!');
  };

  const filteredCarts = carts.filter(cart => {
    const matchesSearch = cart.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cart.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'abandoned') return matchesSearch && cart.status === 'abandoned';
    if (filter === 'recovered') return matchesSearch && cart.status === 'recovered';
    if (filter === 'reminded') return matchesSearch && cart.status === 'reminded';
    return matchesSearch;
  });

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
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Giỏ Hàng Bỏ Quên & Khôi Phục (Recovery)</h1>
              <p className="text-xs text-slate-600">{carts.length} giỏ hàng đang theo dõi</p>
            </div>
          </div>
          <button
            onClick={fetchCarts}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
            title="Tải lại danh sách"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-md p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {carts.filter(c => c.status === 'abandoned').length}
              </p>
              <p className="text-xs text-slate-600 font-semibold">Chưa hoàn tất thanh toán</p>
            </div>
          </div>
          
          <div className="bg-white rounded-md p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-emerald-600">
                {formatCurrency(carts.filter(c => c.status === 'recovered').reduce((sum, c) => sum + c.totalAmount, 0))}
              </p>
              <p className="text-xs text-slate-600 font-semibold">Doanh thu đã khôi phục</p>
            </div>
          </div>

          <div className="bg-white rounded-md p-5 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-blue-50 text-[#1F1F1F] flex items-center justify-center font-bold">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">
                {formatCurrency(carts.reduce((sum, c) => sum + c.totalAmount, 0))}
              </p>
              <p className="text-xs text-slate-600 font-semibold">Tổng giá trị đơn hàng</p>
            </div>
          </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên khách hàng hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white rounded border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {[
              { key: 'all', label: 'Tất cả' },
              { key: 'abandoned', label: 'Bỏ quên' },
              { key: 'reminded', label: 'Đã gửi Email' },
              { key: 'recovered', label: 'Đã khôi phục' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cart List */}
        <div className="space-y-4">
          {filteredCarts.map((cart) => (
            <div key={cart.id} className="bg-white rounded-md border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="font-black text-slate-900 text-base">{cart.customerName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      cart.status === 'abandoned' ? 'bg-amber-100 text-amber-700' :
                      cart.status === 'recovered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-[#1F1F1F]'
                    }`}>
                      {cart.status === 'abandoned' ? 'Bỏ quên' :
                       cart.status === 'recovered' ? 'Đã thanh toán' : 'Đã gửi mã ưu đãi'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-600" /> {cart.customerEmail}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Tạo lúc: {new Date(cart.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                
                <div className="text-left sm:text-right">
                  <p className="text-xl font-black text-slate-900">
                    {formatCurrency(cart.totalAmount)}
                  </p>
                  {cart.recoveredAt && (
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                      Thanh toán: {new Date(cart.recoveredAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/60 rounded p-3">
                <p className="text-xs font-bold text-slate-700 uppercase mb-2">Chi tiết sản phẩm:</p>
                <div className="space-y-1.5">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs text-slate-600">
                      <span>{item.name} <strong className="text-slate-900">x{item.quantity}</strong></span>
                      <span className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleDeleteCart(cart.id)}
                  className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Xóa giỏ hàng"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {cart.status !== 'recovered' && (
                  <button
                    onClick={() => sendReminder(cart.id, cart.customerEmail)}
                    disabled={sendingReminder === cart.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded font-bold text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingReminder === cart.id ? 'Đang gửi...' : 'Gửi Email Kèm Mã Giảm Giá 15%'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredCarts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-md border border-slate-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-bold text-slate-700">Không có giỏ hàng bỏ quên nào</p>
            <p className="text-xs text-slate-600 mt-1">Hệ thống đang hoạt động tối ưu</p>
          </div>
        )}
      </main>
    </div>
  );
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN') + ' đ';
}
