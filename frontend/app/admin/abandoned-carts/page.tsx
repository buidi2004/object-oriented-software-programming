'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ShoppingCart, Clock, AlertCircle, Package, DollarSign } from 'lucide-react';

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
  const [filter, setFilter] = useState<'all' | 'abandoned' | 'recovered'>('all');
  const [sendingReminder, setSendingReminder] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        fetchCarts(token);
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchCarts = async (token: string) => {
    try {
      // Mock abandoned carts data
      setTimeout(() => {
        setCarts([
          {
            id: '1',
            customerId: 'user-001',
            customerName: 'Nguyễn Văn A',
            customerEmail: 'nguyenvana@example.com',
            items: [
              { name: 'VPS Basic - 1 CPU', quantity: 1, price: 150000 },
              { name: 'Domain .vn', quantity: 1, price: 180000 }
            ],
            totalAmount: 330000,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'abandoned'
          },
          {
            id: '2',
            customerId: 'user-002',
            customerName: 'Trần Thị B',
            customerEmail: 'tranthib@example.com',
            items: [
              { name: 'Hosting Premium', quantity: 1, price: 500000 }
            ],
            totalAmount: 500000,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            recoveredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'recovered'
          }
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch abandoned carts:', error);
      setIsLoading(false);
    }
  };

  const sendReminder = async (cartId: string) => {
    setSendingReminder(cartId);
    const token = localStorage.getItem('accessToken');
    
    try {
      // Call API to send reminder
      await fetch('/api/abandoned-carts/send-reminders', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ cartId })
      });
      
      // Update local state
      setCarts(prev => prev.map(c => 
        c.id === cartId ? { ...c, status: 'reminded' } : c
      ));
    } catch (error) {
      console.error('Failed to send reminder:', error);
    } finally {
      setSendingReminder(null);
    }
  };

  const filteredCarts = carts.filter(cart => {
    if (filter === 'abandoned') return cart.status === 'abandoned';
    if (filter === 'recovered') return cart.status === 'recovered';
    return true;
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Giỏ hàng bỏ quên</h1>
              <p className="text-sm text-slate-500">{carts.length} giỏ hàng</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {carts.filter(c => c.status === 'abandoned').length}
                </p>
                <p className="text-xs text-slate-500">Bỏ quên</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(carts.filter(c => c.status === 'recovered').reduce((sum, c) => sum + c.totalAmount, 0))}
                </p>
                <p className="text-xs text-slate-500">Đã khôi phục</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(carts.reduce((sum, c) => sum + c.totalAmount, 0))}
                </p>
                <p className="text-xs text-slate-500">Tổng giá trị</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'abandoned', label: 'Bỏ quên' },
            { key: 'recovered', label: 'Đã khôi phục' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                filter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Cart List */}
        <div className="space-y-4">
          {filteredCarts.map((cart) => (
            <div key={cart.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-slate-900">{cart.customerName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      cart.status === 'abandoned' ? 'bg-amber-100 text-amber-700' :
                      cart.status === 'recovered' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {cart.status === 'abandoned' ? 'Bỏ quên' :
                       cart.status === 'recovered' ? 'Đã khôi phục' : 'Đã gửi remind'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{cart.customerEmail}</p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Tạo lúc: {new Date(cart.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">
                    {formatCurrency(cart.totalAmount)}
                  </p>
                  {cart.recoveredAt && (
                    <p className="text-xs text-emerald-600 mt-1">
                      Khôi phục: {new Date(cart.recoveredAt).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-sm font-medium text-slate-700 mb-2">Sản phẩm:</p>
                <div className="space-y-1">
                  {cart.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm text-slate-600">
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              {cart.status === 'abandoned' && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => sendReminder(cart.id)}
                    disabled={sendingReminder === cart.id}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {sendingReminder === cart.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      'Gửi email nhắc nhở'
                    )}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredCarts.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">Không có giỏ hàng bỏ quên nào</p>
          </div>
        )}
      </main>
    </div>
  );
}

function formatCurrency(amount: number) {
  return amount.toLocaleString('vi-VN') + '₫';
}
