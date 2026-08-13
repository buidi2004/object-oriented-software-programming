'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, Tag, Calendar, Percent } from 'lucide-react';

interface Promotion {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string;
  startDate: string;
  endDate: string;
  minOrderValue: number;
  usageLimit: number;
  timesUsed: number;
  isActive: boolean;
}

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [value, setValue] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('');
  const [usageLimit, setUsageLimit] = useState('');

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
        fetchPromotions();
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchPromotions = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/promotions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPromotions(data);
      }
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOrUpdate = async () => {
    const token = localStorage.getItem('accessToken');
    const url = editingId 
      ? `/api/promotions/${editingId}`
      : '/api/promotions';
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          code,
          type,
          value: parseFloat(value),
          description,
          startDate: startDate || new Date().toISOString(),
          endDate,
          minOrderValue: parseFloat(minOrderValue) || 0,
          usageLimit: parseInt(usageLimit) || 0
        })
      });

      if (response.ok) {
        setShowAddModal(false);
        resetForm();
        fetchPromotions();
      }
    } catch (error) {
      console.error('Failed to save promotion:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này?')) return;
    
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/promotions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Failed to delete promotion:', error);
    }
  };

  const openEdit = (promo: Promotion) => {
    setEditingId(promo.id);
    setCode(promo.code);
    setType(promo.type);
    setValue(promo.value.toString());
    setDescription(promo.description);
    setStartDate(promo.startDate);
    setEndDate(promo.endDate);
    setMinOrderValue(promo.minOrderValue.toString());
    setUsageLimit(promo.usageLimit.toString());
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setCode('');
    setType('percentage');
    setValue('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setMinOrderValue('');
    setUsageLimit('');
  };

  const getStatusColor = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    
    if (now < start) return { text: 'Sắp diễn ra', class: 'bg-blue-100 text-blue-700' };
    if (now > end) return { text: 'Đã hết hạn', class: 'bg-slate-100 text-slate-500' };
    if (!promo.isActive) return { text: 'Tạm ngưng', class: 'bg-slate-100 text-slate-500' };
    return { text: 'Đang hoạt động', class: 'bg-emerald-100 text-emerald-700' };
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
              <h1 className="text-xl font-bold text-slate-900">Quản lý Khuyến mãi</h1>
              <p className="text-sm text-slate-500">{promotions.length} mã khuyến mãi</p>
            </div>
          </div>
          <button 
            onClick={() => { resetForm(); setShowAddModal(true); }}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm mã KM
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mã</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Thời gian</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {promotions.map((promo) => {
                const status = getStatusColor(promo);
                return (
                  <tr key={promo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-100 text-purple-700 font-mono font-bold">
                        <Tag className="w-4 h-4" />
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`font-bold ${type === 'percentage' ? 'text-orange-600' : 'text-emerald-600'}`}>
                        {type === 'percentage' ? `${promo.value}%` : `${promo.value.toLocaleString()}₫`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">
                      {promo.description}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(promo.startDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-slate-400">→</div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : 'Khác định'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${status.class}`}>
                        {status.text}
                      </span>
                      <div className="text-xs text-slate-400 mt-1">
                        Đã dùng: {promo.timesUsed}/{promo.usageLimit || '∞'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => openEdit(promo)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors mr-2"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(promo.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {promotions.length === 0 && (
            <div className="text-center py-12">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium text-slate-500">Chưa có mã khuyến mãi nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">
              {editingId ? 'Chỉnh sửa mã khuyến mãi' : 'Thêm mã khuyến mãi mới'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mã KM</label>
                <input 
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="VD: SUMMER2024"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Loại</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value as 'percentage' | 'fixed')}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (₫)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giá trị</label>
                  <input 
                    type="number"
                    step="0.01"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'percentage' ? '20' : '50000'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Giảm 20% cho đơn từ 500k..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Từ ngày</label>
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đến ngày</label>
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Đơn tối thiểu</label>
                  <input 
                    type="number"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Giới hạn sử dụng</label>
                  <input 
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="Không giới hạn"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
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
