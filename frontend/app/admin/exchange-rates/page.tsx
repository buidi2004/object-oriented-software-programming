'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, AlertCircle, 
  RefreshCw, DollarSign, CheckCircle2, X, TrendingUp, ArrowRightLeft 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface ExchangeRate {
  id: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt: string;
}

export default function AdminExchangeRatesPage() {
  const router = useRouter();
  const [exchangeRates, setExchangeRates] = useState<ExchangeRate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    fromCurrency: 'USD',
    toCurrency: 'VND',
    rate: '25450'
  });

  // Converter state
  const [convertAmount, setConvertAmount] = useState('100');
  const [selectedRateId, setSelectedRateId] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialRates: ExchangeRate[] = [
    { id: '1', fromCurrency: 'USD', toCurrency: 'VND', rate: 25450, updatedAt: new Date().toISOString() },
    { id: '2', fromCurrency: 'EUR', toCurrency: 'VND', rate: 27800, updatedAt: new Date().toISOString() },
    { id: '3', fromCurrency: 'SGD', toCurrency: 'VND', rate: 19100, updatedAt: new Date().toISOString() },
    { id: '4', fromCurrency: 'JPY', toCurrency: 'VND', rate: 168.5, updatedAt: new Date().toISOString() },
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin') { 
        router.push('/dashboard'); 
        return; 
      }
      fetchExchangeRates();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchExchangeRates = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/exchange-rates').catch(() => null);
      if (res && Array.isArray(res.data) && res.data.length > 0) {
        setExchangeRates(res.data);
        setSelectedRateId(res.data[0].id);
      } else {
        const saved = localStorage.getItem('admin_exchange_rates');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setExchangeRates(parsed);
            if (parsed.length > 0) setSelectedRateId(parsed[0].id);
          } catch {
            setExchangeRates(initialRates);
            setSelectedRateId(initialRates[0].id);
          }
        } else {
          setExchangeRates(initialRates);
          setSelectedRateId(initialRates[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRates = (items: ExchangeRate[]) => {
    setExchangeRates(items);
    localStorage.setItem('admin_exchange_rates', JSON.stringify(items));
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ fromCurrency: 'USD', toCurrency: 'VND', rate: '25450' });
    setShowModal(true);
  };

  const handleOpenEdit = (rateItem: ExchangeRate) => {
    setEditingId(rateItem.id);
    setFormData({
      fromCurrency: rateItem.fromCurrency,
      toCurrency: rateItem.toCurrency,
      rate: rateItem.rate.toString()
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const rateVal = parseFloat(formData.rate);
    if (isNaN(rateVal) || rateVal <= 0) {
      showToast('Vui lòng nhập tỷ giá quy đổi hợp lệ.', 'error');
      return;
    }

    try {
      if (editingId) {
        const updated = exchangeRates.map(r => 
          r.id === editingId 
            ? { ...r, fromCurrency: formData.fromCurrency, toCurrency: formData.toCurrency, rate: rateVal, updatedAt: new Date().toISOString() } 
            : r
        );
        saveRates(updated);
        showToast('Cập nhật tỷ giá quy đổi thành công!');
      } else {
        const newRate: ExchangeRate = {
          id: `rate-${Date.now()}`,
          fromCurrency: formData.fromCurrency.toUpperCase().trim(),
          toCurrency: formData.toCurrency.toUpperCase().trim(),
          rate: rateVal,
          updatedAt: new Date().toISOString()
        };
        const updated = [newRate, ...exchangeRates];
        saveRates(updated);
        showToast('Thêm tỷ giá tiền tệ mới thành công!');
      }

      setShowModal(false);
    } catch {
      showToast('Lỗi khi lưu tỷ giá', 'error');
    }
  };

  const handleDelete = (id: string, from: string, to: string) => {
    if (!confirm(`Bạn có chắc muốn xóa cặp tỷ giá ${from}/${to}?`)) return;
    const updated = exchangeRates.filter(r => r.id !== id);
    saveRates(updated);
    showToast(`Đã xóa cặp tỷ giá ${from}/${to}!`);
  };

  const selectedRate = exchangeRates.find(r => r.id === selectedRateId) || exchangeRates[0];

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

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Tỷ Giá Hối Đoái (Exchange Rates)</h1>
              <p className="text-xs text-slate-600">{exchangeRates.length} cặp tiền tệ hỗ trợ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchExchangeRates}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded transition-colors"
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Tỷ Giá Mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Quick Converter Tool */}
        {selectedRate && (
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-6 sm:p-8 text-slate-900 mb-8 shadow-xl">
            <div className="flex items-center gap-2 text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" /> Công cụ quy đổi nhanh thời gian thực
            </div>
            <h2 className="text-2xl font-black mb-6">
              1 {selectedRate.fromCurrency} = {selectedRate.rate.toLocaleString('vi-VN')} {selectedRate.toCurrency}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Số tiền quy đổi ({selectedRate.fromCurrency})</label>
                <input
                  type="number"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded bg-white/10 border border-white/20 text-slate-900 placeholder-white/50 text-sm font-bold focus:outline-none focus:bg-white/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">Cặp tỷ giá</label>
                <select
                  value={selectedRateId}
                  onChange={(e) => setSelectedRateId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded bg-white/10 border border-white/20 text-slate-900 text-sm font-bold focus:outline-none focus:bg-white/20 [&>option]:text-slate-900"
                >
                  {exchangeRates.map(r => (
                    <option key={r.id} value={r.id}>{r.fromCurrency} → {r.toCurrency}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white/10 border border-white/20 rounded p-3 sm:mt-5 text-center">
                <div className="text-xs text-slate-200 font-semibold">Kết quả quy đổi tương đương</div>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {((parseFloat(convertAmount) || 0) * selectedRate.rate).toLocaleString('vi-VN')} {selectedRate.toCurrency}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rates Table */}
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3.5 text-left font-bold">Cặp tiền tệ</th>
                <th className="px-6 py-3.5 text-left font-bold">Tỷ giá quy đổi</th>
                <th className="px-6 py-3.5 text-left font-bold">Cập nhật lần cuối</th>
                <th className="px-6 py-3.5 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exchangeRates.map((rateItem) => (
                <tr key={rateItem.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-blue-50 text-[#1F1F1F] flex items-center justify-center font-bold">
                        <ArrowRightLeft className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{rateItem.fromCurrency} / {rateItem.toCurrency}</p>
                        <p className="text-xs text-slate-600">1 {rateItem.fromCurrency} = {rateItem.rate.toLocaleString('vi-VN')} {rateItem.toCurrency}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono font-black text-slate-900 text-base">
                      {rateItem.rate.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-xs text-slate-600 font-semibold ml-1.5">{rateItem.toCurrency}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600">
                    {new Date(rateItem.updatedAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleOpenEdit(rateItem)}
                        className="p-2 text-slate-600 hover:text-[#1F1F1F] hover:bg-blue-50 rounded transition-colors"
                        title="Sửa tỷ giá"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(rateItem.id, rateItem.fromCurrency, rateItem.toCurrency)}
                        className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Xóa tỷ giá"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId ? 'Chỉnh Sửa Tỷ Giá' : 'Thêm Tỷ Giá Tiền Tệ Mới'}
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">Cập nhật hệ số quy đổi giá dịch vụ tự động</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-600 hover:text-slate-600 rounded-sm hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Từ tiền tệ (From)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="USD"
                    value={formData.fromCurrency}
                    onChange={(e) => setFormData({ ...formData, fromCurrency: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 rounded border border-slate-200 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Sang tiền tệ (To)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    placeholder="VND"
                    value={formData.toCurrency}
                    onChange={(e) => setFormData({ ...formData, toCurrency: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 rounded border border-slate-200 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tỷ giá quy đổi</label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="25450"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
                >
                  {editingId ? 'Lưu Thay Đổi' : 'Thêm Tỷ Giá'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
