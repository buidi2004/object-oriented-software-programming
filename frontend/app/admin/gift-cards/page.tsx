'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, CheckCircle, XCircle, Gift } from 'lucide-react';

interface GiftCard {
  id: string;
  code: string;
  value: number;
  status: 'active' | 'used' | 'expired';
  usedBy?: string;
  createdAt: string;
  expiresAt?: string;
}

export default function AdminGiftCardsPage() {
  const router = useRouter();
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'used'>('all');
  
  // Form state
  const [value, setValue] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDays, setExpiryDays] = useState('');

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
        fetchGiftCards();
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchGiftCards = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      // Note: Current API only has GetBalance and Redeem endpoints
      // This is a mock for demonstration
      setTimeout(() => {
        setGiftCards([
          {
            id: '1',
            code: 'GIFT-2024-001',
            value: 100000,
            status: 'active',
            createdAt: '2024-01-15T10:00:00Z',
            expiresAt: '2024-12-31T23:59:59Z'
          },
          {
            id: '2',
            code: 'SUMMER-2024',
            value: 50000,
            status: 'used',
            usedBy: 'user@example.com',
            createdAt: '2024-06-01T10:00:00Z'
          }
        ]);
        setIsLoading(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    const token = localStorage.getItem('accessToken');
    // Mock generation since no batch generation API exists
    const newCards: GiftCard[] = Array.from({ length: parseInt(quantity) || 1 }, (_, i) => ({
      id: Date.now().toString() + i,
      code: `GC-${Date.now()}-${i}`,
      value: parseFloat(value) || 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      expiresAt: expiryDays ? new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString() : undefined
    }));
    
    setGiftCards(prev => [...newCards, ...prev]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setValue('');
    setQuantity('');
    setExpiryDays('');
  };

  const filteredGiftCards = giftCards.filter(gc => {
    if (filter === 'active') return gc.status === 'active';
    if (filter === 'used') return gc.status === 'used';
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
              <h1 className="text-xl font-bold text-slate-900">Quản lý Gift Card</h1>
              <p className="text-sm text-slate-500">{giftCards.length} gift cards</p>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo gift card
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{giftCards.filter(g => g.status === 'active').length}</p>
                <p className="text-xs text-slate-500">Đang hoạt động</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{giftCards.filter(g => g.status === 'used').length}</p>
                <p className="text-xs text-slate-500">Đã sử dụng</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Gift className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {giftCards.reduce((sum, g) => sum + (g.status === 'used' ? g.value : 0), 0).toLocaleString()}₫
                </p>
                <p className="text-xs text-slate-500">Tổng giá trị đã dùng</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'Tất cả' },
            { key: 'active', label: 'Đang hoạt động' },
            { key: 'used', label: 'Đã sử dụng' },
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

        {/* Gift Cards List */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Hạn sử dụng</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredGiftCards.map((gc) => (
                <tr key={gc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono font-semibold text-slate-900">{gc.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-emerald-600">{gc.value.toLocaleString()}₫</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${
                      gc.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {gc.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {gc.status === 'active' ? 'Hoạt động' : 'Đã dùng'}
                    </span>
                    {gc.usedBy && (
                      <p className="text-xs text-slate-400 mt-1">by: {gc.usedBy}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(gc.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {gc.expiresAt ? new Date(gc.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredGiftCards.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">Không có gift card nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Tạo gift card mới</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị (₫)</label>
                <input 
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="VD: 100000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Số lượng</label>
                <input 
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="VD: 10"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hạn sử dụng (ngày, để trống = không hết hạn)
                </label>
                <input 
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  placeholder="VD: 365"
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
                onClick={handleGenerate}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                Tạo gift card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
