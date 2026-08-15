'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, AlertCircle, RefreshCw, DollarSign, X, Loader2 } from 'lucide-react';
import { api } from '@/src/lib/api';

interface ExchangeRate {
  id?: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt?: string;
}

export default function AdminExchangeRatesPage() {
  const router = useRouter();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [rate, setRate] = useState('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data?.role !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      await fetchExchangeRates();
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchExchangeRates = async () => {
    try {
      const res = await api.get('/exchange-rates');
      setExchangeRates(res.data || []);
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    }
  };

  const resetForm = () => {
    setFromCurrency('USD');
    setToCurrency('VND');
    setRate('');
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (item: ExchangeRate) => {
    setFromCurrency(item.fromCurrency);
    setToCurrency(item.toCurrency);
    setRate(item.rate.toString());
    setShowAddModal(true);
  };

  const handleUpsert = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateVal = parseFloat(rate);
    if (isNaN(rateVal) || rateVal <= 0) {
      alert('Vui lòng nhập tỷ giá quy đổi hợp lệ (> 0)');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/exchange-rates', {
        fromCurrency,
        toCurrency,
        rate: rateVal
      });

      setShowAddModal(false);
      resetForm();
      await fetchExchangeRates();
    } catch (error: any) {
      console.error('Failed to save exchange rate:', error);
      alert(error.response?.data?.message || 'Lỗi khi cập nhật tỷ giá');
    } finally {
      setIsSubmitting(false);
    }
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Tỷ Giá Tiền Tệ</h1>
              <p className="text-sm text-slate-500">{exchangeRates.length} cặp tỷ giá</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchExchangeRates}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Làm mới tỷ giá"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button 
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Cập nhật tỷ giá
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {exchangeRates.map((rateItem, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                    {rateItem.fromCurrency}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">1 {rateItem.fromCurrency}</h3>
                    <p className="text-xs text-slate-500">Quy đổi sang {rateItem.toCurrency}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleOpenEditModal(rateItem)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  title="Chỉnh sửa tỷ giá"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">Tỷ giá hiện tại:</span>
                <span className="text-2xl font-black text-blue-600 font-mono">
                  {rateItem.rate.toLocaleString('vi-VN')} {rateItem.toCurrency}
                </span>
              </div>
            </div>
          ))}
        </div>

        {exchangeRates.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 mt-4">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Chưa có dữ liệu tỷ giá tiền tệ nào</p>
          </div>
        )}
      </main>

      {/* Modal Add/Edit Exchange Rate */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Cập Nhật Tỷ Giá Hối Đoái
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpsert} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Từ tiền tệ *</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="VND">VND (đ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sang tiền tệ *</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="VND">VND (đ)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tỷ giá quy đổi (1 {fromCurrency} = ? {toCurrency}) *
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="Ví dụ: 25450"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Lưu tỷ giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
