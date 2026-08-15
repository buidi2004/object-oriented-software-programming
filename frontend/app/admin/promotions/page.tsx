'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, AlertCircle, Calendar, Percent, Tag, X, Loader2 } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Promotion {
  id: string;
  servicePlanId: string | null;
  discountPercent: number;
  startDate: string;
  endDate: string;
}

interface ServicePlan {
  id: string;
  name: string;
  price: number;
}

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [servicePlanId, setServicePlanId] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
      await Promise.all([fetchPromotions(), fetchServicePlans()]);
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPromotions = async () => {
    try {
      const res = await api.get('/promotions');
      setPromotions(res.data || []);
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    }
  };

  const fetchServicePlans = async () => {
    try {
      const res = await api.get('/service-plans');
      setServicePlans(res.data || []);
    } catch (error) {
      console.error('Failed to fetch service plans:', error);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setServicePlanId('');
    setDiscountPercent('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (promo: Promotion) => {
    setEditingId(promo.id);
    setServicePlanId(promo.servicePlanId || '');
    setDiscountPercent(promo.discountPercent.toString());
    setStartDate(promo.startDate ? promo.startDate.split('T')[0] : '');
    setEndDate(promo.endDate ? promo.endDate.split('T')[0] : '');
    setShowAddModal(true);
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const discount = parseFloat(discountPercent);
    if (isNaN(discount) || discount <= 0 || discount > 100) {
      alert('Vui lòng nhập phần trăm giảm giá hợp lệ (1 - 100%)');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/promotions/${editingId}`, {
          servicePlanId: servicePlanId || null,
          discountPercent: discount,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString()
        });
      } else {
        await api.post('/promotions', {
          servicePlanId: servicePlanId || null,
          discountPercent: discount,
          startDate: startDate ? new Date(startDate).toISOString() : new Date().toISOString(),
          endDate: endDate ? new Date(endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString()
        });
      }

      setShowAddModal(false);
      resetForm();
      await fetchPromotions();
    } catch (error: any) {
      console.error('Failed to save promotion:', error);
      alert(error.response?.data?.message || 'Lỗi khi lưu chương trình khuyến mãi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa chương trình khuyến mãi này?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (error: any) {
      console.error('Failed to delete promotion:', error);
      alert(error.response?.data?.message || 'Không thể xóa khuyến mãi');
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
              <h1 className="text-xl font-bold text-slate-900">Quản lý Khuyến Mãi</h1>
              <p className="text-sm text-slate-500">{promotions.length} chương trình</p>
            </div>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Tạo khuyến mãi
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {promotions.map((promo) => {
            const plan = servicePlans.find(p => p.id === promo.servicePlanId);
            return (
              <div key={promo.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-red-50 text-red-600">
                      <Percent className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">-{promo.discountPercent}%</h3>
                      <p className="text-xs text-slate-500 font-medium">Giảm giá trực tiếp</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleOpenEditModal(promo)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(promo.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Áp dụng cho:</span>
                    <span className="font-semibold text-slate-800">{plan ? plan.name : 'Tất cả dịch vụ'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Bắt đầu:</span>
                    <span>{new Date(promo.startDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Kết thúc:</span>
                    <span>{new Date(promo.endDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {promotions.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200 mt-4">
            <Percent className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Chưa có chương trình khuyến mãi nào</p>
          </div>
        )}
      </main>

      {/* Modal Add/Edit Promotion */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingId ? 'Chỉnh Sửa Khuyến Mãi' : 'Tạo Chương Trình Khuyến Mãi'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dịch vụ áp dụng</label>
                <select
                  value={servicePlanId}
                  onChange={(e) => setServicePlanId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Tất cả dịch vụ (Áp dụng toàn bộ)</option>
                  {servicePlans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức giảm giá (%) *</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  placeholder="Ví dụ: 20"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày bắt đầu *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày kết thúc *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
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
                  {editingId ? 'Lưu cập nhật' : 'Tạo khuyến mãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
