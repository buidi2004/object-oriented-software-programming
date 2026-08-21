'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Search, Tag, Percent, Gift, AlertCircle } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  discountPercent?: number;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  maxUsage?: number;
  usedCount?: number;
  startDate?: string;
  endDate?: string;
  expiryDate?: string;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin' && userData.role !== 'Editor') { router.push('/dashboard'); return; }
        fetchCoupons(token);
      } else { router.push('/login'); }
    } catch (error) { router.push('/login'); }
  };

  const fetchCoupons = async (token: string) => {
    try {
      const res = await fetch('/api/coupons', { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoupon = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const expiry = newCoupon.endDate ? new Date(newCoupon.endDate).toISOString() : new Date(Date.now() + 30 * 86400000).toISOString();
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          code: newCoupon.code,
          discountPercent: Number(newCoupon.discountValue) || 10,
          maxUsage: Number(newCoupon.usageLimit) || 100,
          expiryDate: expiry
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewCoupon({
          code: '', description: '', discountType: 'percentage', discountValue: 10,
          minOrderValue: 0, maxDiscount: 0, usageLimit: 100,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
        });
        if (token) fetchCoupons(token);
      } else {
        alert('Thêm mã giảm giá thất bại');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    const token = localStorage.getItem('accessToken');
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.id !== id));
      } else {
        alert('Xóa mã giảm giá thất bại');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi xóa');
    }
  };

  const toggleStatus = async (id: string) => {
    const token = localStorage.getItem('accessToken');
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;
    try {
      const newStatus = !coupon.isActive;
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });
      if (res.ok) {
        setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: newStatus } : c));
      }
    } catch (err) {
      console.error(err);
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
              <h1 className="text-xl font-bold text-slate-900">Quản lý Mã giảm giá</h1>
              <p className="text-sm text-slate-500">{coupons.length} mã giảm giá</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm mã giảm giá
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const displayDiscount = coupon.discountPercent !== undefined
              ? `${coupon.discountPercent}%`
              : coupon.discountType === 'percentage'
                ? `${coupon.discountValue ?? 0}%`
                : `${(coupon.discountValue ?? 0).toLocaleString('vi-VN')} đ`;

            const minOrderText = coupon.minOrderValue !== undefined
              ? `${coupon.minOrderValue.toLocaleString('vi-VN')} đ`
              : '0 đ';

            const usageText = `${coupon.usedCount ?? 0} / ${coupon.maxUsage ?? coupon.usageLimit ?? 100}`;

            const dateText = coupon.expiryDate
              ? `Hết hạn: ${new Date(coupon.expiryDate).toLocaleDateString('vi-VN')}`
              : coupon.startDate && coupon.endDate
                ? `${new Date(coupon.startDate).toLocaleDateString('vi-VN')} - ${new Date(coupon.endDate).toLocaleDateString('vi-VN')}`
                : 'Không giới hạn';

            return (
              <div key={coupon.id} className={`bg-white rounded-xl p-5 border transition-colors ${coupon.isActive ? 'border-slate-200' : 'border-slate-200 opacity-75'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${coupon.isActive ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                      <Tag className={`w-5 h-5 ${coupon.isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 font-mono">{coupon.code}</h3>
                      <p className="text-xs text-slate-500">{coupon.description || 'Mã ưu đãi CloudHost'}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${coupon.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {coupon.isActive ? 'Hoạt động' : 'Đã khóa'}
                  </span>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Giảm giá</span>
                    <span className="font-bold text-blue-600">{displayDiscount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Đơn tối thiểu</span>
                    <span className="font-semibold">{minOrderText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Giới hạn sử dụng</span>
                    <span className="font-semibold">{usageText}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hiệu lực</span>
                    <span className="font-semibold">{dateText}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => toggleStatus(coupon.id)}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${coupon.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                  >
                    {coupon.isActive ? 'Khóa' : 'Kích hoạt'}
                  </button>
                  <button className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {coupons.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-medium">Chưa có mã giảm giá nào</p>
          </div>
        )}
      </main>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Thêm mã giảm giá mới</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mã giảm giá</label>
                <input
                  type="text"
                  value={newCoupon.code}
                  onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono"
                  placeholder="VD: WELCOME50"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả</label>
                <input
                  type="text"
                  value={newCoupon.description}
                  onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Mô tả ngắn gọn..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Loại giảm</label>
                  <select
                    value={newCoupon.discountType}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountType: e.target.value as any })}
                    className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Giá trị giảm</label>
                  <input
                    type="number"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: parseInt(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Đơn hàng tối thiểu (VNĐ)</label>
                <input
                  type="number"
                  value={newCoupon.minOrderValue}
                  onChange={(e) => setNewCoupon({ ...newCoupon, minOrderValue: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={newCoupon.startDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, startDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Ngày kết thúc</label>
                <input
                  type="date"
                  value={newCoupon.endDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, endDate: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Giới hạn sử dụng</label>
                <input
                  type="number"
                  value={newCoupon.usageLimit}
                  onChange={(e) => setNewCoupon({ ...newCoupon, usageLimit: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={handleAddCoupon} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">
                Lưu
              </button>
              <button onClick={() => setShowAddModal(false)} className="flex-1 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors">
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
