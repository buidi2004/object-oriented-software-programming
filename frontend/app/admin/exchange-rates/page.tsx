'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('VND');
  const [rate, setRate] = useState('');

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
        fetchExchangeRates();
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchExchangeRates = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/exchange-rates', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExchangeRates(data);
      }
    } catch (error) {
      console.error('Failed to fetch exchange rates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    const token = localStorage.getItem('accessToken');
    const url = editingId 
      ? `/api/exchange-rates/${editingId}`
      : '/api/exchange-rates';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          fromCurrency, 
          toCurrency, 
          rate: parseFloat(rate) 
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchExchangeRates();
      }
    } catch (error) {
      console.error('Failed to save exchange rate:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tỷ giá này?')) return;
    
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/exchange-rates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setExchangeRates(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete exchange rate:', error);
    }
  };

  const openEdit = (rate: ExchangeRate) => {
    setEditingId(rate.id);
    setFromCurrency(rate.fromCurrency);
    setToCurrency(rate.toCurrency);
    setRate(rate.rate.toString());
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setFromCurrency('USD');
    setToCurrency('VND');
    setRate('');
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
              <h1 className="text-xl font-bold text-slate-900">Quản lý Tỷ giá</h1>
              <p className="text-sm text-slate-500">{exchangeRates.length} tỷ giá</p>
            </div>
          </div>
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm tỷ giá
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Từ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Đến</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Tỷ giá</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Cập nhật</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {exchangeRates.map((er) => (
                <tr key={er.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{er.fromCurrency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{er.toCurrency}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-600 font-bold">{er.rate.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(er.updatedAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => openEdit(er)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(er.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {exchangeRates.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">Chưa có tỷ giá nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Chỉnh sửa tỷ giá' : 'Thêm tỷ giá mới'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Từ</label>
                <select 
                  value={fromCurrency}
                  onChange={(e) => setFromCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="USD">USD - Mỹ Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="KRW">KRW - Korean Won</option>
                  <option value="VND">VND - Việt Nam Đồng</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Đến</label>
                <select 
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="VND">VND - Việt Nam Đồng</option>
                  <option value="USD">USD - Mỹ Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="KRW">KRW - Korean Won</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tỷ giá</label>
                <input 
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="Nhập tỷ giá"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleAddOrUpdate}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                {editingId ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
