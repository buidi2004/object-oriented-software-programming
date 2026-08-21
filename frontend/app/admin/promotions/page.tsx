'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, AlertCircle, 
  Calendar, Percent, Tag, Search, RefreshCw, CheckCircle2, X, Sparkles
} from 'lucide-react';
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
  servicePlanId?: string;
  servicePlanName?: string;
}

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    servicePlanId: '',
    discountPercent: '20',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

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
      fetchData();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [promoRes, planRes] = await Promise.all([
        api.get('/promotions'),
        api.get('/service-plans/admin').catch(() => api.get('/service-plans?includeInactive=true')).catch(() => ({ data: [] }))
      ]);

      if (Array.isArray(promoRes.data)) {
        setPromotions(promoRes.data);
      }
      if (Array.isArray(planRes.data)) {
        // Deduplicate and normalize
        const seen = new Set<string>();
        const uniquePlans: any[] = [];
        for (const item of planRes.data) {
          const id = item.id || item.servicePlanId;
          if (id && !seen.has(id)) {
            seen.add(id);
            uniquePlans.push({
              id,
              name: item.name || item.servicePlanName || id
            });
          }
        }
        setPlans(uniquePlans);
      }
    } catch (error) {
      console.error('Failed to fetch promotions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      servicePlanId: '',
      discountPercent: '20',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (promo: Promotion) => {
    setEditingId(promo.id);
    setFormData({
      servicePlanId: promo.servicePlanId || '',
      discountPercent: promo.discountPercent.toString(),
      startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
      endDate: promo.endDate ? promo.endDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const percent = parseFloat(formData.discountPercent);
    if (isNaN(percent) || percent <= 0 || percent > 100) {
      showToast('Phần trăm giảm giá phải từ 1 đến 100%.', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        servicePlanId: formData.servicePlanId.trim() ? formData.servicePlanId : null,
        discountPercent: percent,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      if (editingId) {
        await api.put(`/promotions/${editingId}`, payload);
        showToast('Cập nhật chương trình khuyến mãi thành công!');
      } else {
        await api.post('/promotions', payload);
        showToast('Tạo chiến dịch khuyến mãi mới thành công!');
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || 'Không thể lưu chương trình khuyến mãi.';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) return;
    try {
      await api.delete(`/promotions/${id}`);
      setPromotions(prev => prev.filter(p => p.id !== id));
      showToast('Đã xóa chương trình khuyến mãi!');
    } catch (error) {
      console.error('Failed to delete promotion:', error);
      showToast('Lỗi khi xóa khuyến mãi', 'error');
    }
  };

  const getStatusColor = (promo: Promotion) => {
    const now = new Date();
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    
    if (now < start) return { text: 'Sắp diễn ra', class: 'bg-blue-100 text-blue-700' };
    if (now > end) return { text: 'Đã kết thúc', class: 'bg-slate-100 text-slate-500' };
    return { text: 'Đang diễn ra', class: 'bg-emerald-100 text-emerald-700' };
  };

  const getPlanName = (planId: string | null) => {
    if (!planId) return 'Toàn bộ trang web & Dịch vụ';
    const found = plans.find(p => p.id === planId);
    return found ? found.name : `Gói dịch vụ (#${planId.slice(0, 8)})`;
  };

  const filteredPromotions = promotions.filter(promo => {
    const planName = getPlanName(promo.servicePlanId).toLowerCase();
    return planName.includes(searchTerm.toLowerCase()) || 
      promo.discountPercent.toString().includes(searchTerm);
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
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
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
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Khuyến Mãi & Flash Sale</h1>
              <p className="text-xs text-slate-500">{promotions.length} chiến dịch khuyến mãi</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tạo Khuyến Mãi Mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 mb-6 flex items-center justify-between shadow-sm">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên gói dịch vụ hoặc mức giảm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {/* Promotions Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-3.5 text-left font-bold">Phạm vi áp dụng</th>
                <th className="px-6 py-3.5 text-left font-bold">Mức giảm giá</th>
                <th className="px-6 py-3.5 text-left font-bold">Thời gian diễn ra</th>
                <th className="px-6 py-3.5 text-left font-bold">Trạng thái</th>
                <th className="px-6 py-3.5 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPromotions.map((promo) => {
                const status = getStatusColor(promo);
                return (
                  <tr key={promo.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{getPlanName(promo.servicePlanId)}</p>
                          <p className="text-xs text-slate-600 font-mono">
                            {promo.servicePlanId ? `ID: ${promo.servicePlanId}` : 'Flash Sale toàn sàn'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-orange-100 text-orange-800 font-black text-sm">
                        <Sparkles className="w-3.5 h-3.5" />
                        -{promo.discountPercent}%
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-500 space-y-0.5">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-600" />
                          <span>Từ: {new Date(promo.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span>Đến: {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : 'Vô thời hạn'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.class}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button 
                          onClick={() => handleOpenEdit(promo)}
                          className="p-2 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
                          title="Sửa khuyến mãi"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(promo.id)}
                          className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Xóa khuyến mãi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredPromotions.length === 0 && (
            <div className="text-center py-16 text-slate-500">
              <Percent className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-bold text-slate-700">Không có chương trình khuyến mãi nào</p>
              <p className="text-xs text-slate-600 mt-1">Bấm "Tạo Khuyến Mãi Mới" để bắt đầu</p>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  {editingId ? 'Chỉnh Sửa Khuyến Mãi' : 'Tạo Chiến Dịch Khuyến Mãi Mới'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Thiết lập giảm giá dịch vụ theo % thời gian thực</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Phạm vi áp dụng</label>
                <select
                  value={formData.servicePlanId}
                  onChange={(e) => setFormData({ ...formData, servicePlanId: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/20 bg-white"
                >
                  <option value="">Toàn bộ trang web (Tất cả dịch vụ)</option>
                  {plans.map((p, idx) => {
                    const id = p.id || p.servicePlanId || `plan-${idx}`;
                    return <option key={id} value={id}>{p.name || p.servicePlanName || id}</option>;
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mức giảm giá (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    placeholder="20"
                    value={formData.discountPercent}
                    onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                    className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-600">%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Ngày bắt đầu</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Ngày kết thúc</label>
                  <input
                    type="date"
                    required
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang lưu...' : editingId ? 'Lưu Thay Đổi' : 'Tạo Khuyến Mãi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
