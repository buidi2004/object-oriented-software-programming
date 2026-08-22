'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CreditCard, Plus, Trash2, CheckCircle } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchPaymentMethods(token);
  }, [router]);

  const fetchPaymentMethods = async (token: string) => {
    try {
      const response = await fetch('/api/payment-methods/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setMethods(data);
      }
    } catch (error) {
      console.error('Failed to fetch payment methods:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteMethod = async (methodId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/payment-methods/${methodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMethods(prev => prev.filter(m => m.id !== methodId));
    } catch (error) {
      console.error('Failed to delete payment method:', error);
    }
  };

  const setDefault = async (methodId: string) => {
    // TODO: Implement set default logic
    console.log('Setting default:', methodId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-slate-900">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900">
              CloudHost<span className="text-[#1F1F1F]"> VN</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#1F1F1F]">
            ← Quay lại Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Phương Thức Thanh Toán</h1>
            <p className="text-slate-500 mt-1">Quản lý thẻ và tài khoản thanh toán</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm phương thức
          </button>
        </div>

        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Thêm thẻ thanh toán mới</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Số thẻ</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Tháng hết hạn</label>
                  <input
                    type="text"
                    placeholder="MM"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Năm hết hạn</label>
                  <input
                    type="text"
                    placeholder="YY"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Tên trên thẻ</label>
                <input
                  type="text"
                  placeholder="NGUYEN VAN A"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="setDefault" className="w-4 h-4 rounded border-slate-300 text-[#1F1F1F] focus:ring-blue-500" />
                <label htmlFor="setDefault" className="text-sm text-slate-700">Đặt làm phương thức mặc định</label>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors">
                  Lưu phương thức
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {methods.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
            <CreditCard className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Chưa có phương thức thanh toán</h2>
            <p className="text-slate-500 mb-6">Thêm thẻ hoặc tài khoản ngân hàng để thanh toán nhanh hơn</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Thêm phương thức mới
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {methods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-slate-900 font-bold text-sm">
                    VISA
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      **** **** **** {method.last4}
                    </p>
                    <p className="text-sm text-slate-500">
                      Hết hạn: {method.expiryMonth}/{method.expiryYear}
                    </p>
                  </div>
                  {method.isDefault && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <button
                      onClick={() => setDefault(method.id)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => deleteMethod(method.id)}
                    className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Xóa phương thức"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
