'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Share2, ArrowLeft, Search, DollarSign, 
  CheckCircle2, AlertCircle, TrendingUp, Check, Copy,
  Plus, Edit2, Trash2, X, RefreshCw, Ban, Sparkles, ExternalLink
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface ReferralItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  code: string;
  commissionRate: number; // e.g. 15%
  totalReferred: number;
  totalRevenue: number;
  commissionEarned: number;
  pendingPayout: number;
  status: 'Active' | 'Pending Payout' | 'Suspended';
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'Pending Payout' | 'Active' | 'Suspended'>('all');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ReferralItem | null>(null);

  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    code: '',
    commissionRate: 15
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialReferrals: ReferralItem[] = [
    {
      id: 'ref-1',
      userId: 'u-101',
      userName: 'Vũ Quốc Huy',
      userEmail: 'huy.vq@affiliatevn.com',
      code: 'HUYCLOUD20',
      commissionRate: 20,
      totalReferred: 38,
      totalRevenue: 45000000,
      commissionEarned: 9000000,
      pendingPayout: 2250000,
      status: 'Pending Payout',
    },
    {
      id: 'ref-2',
      userId: 'u-102',
      userName: 'Trần Bảo Ngọc',
      userEmail: 'ngoc.tb@techreview.io',
      code: 'NGOCDEV10',
      commissionRate: 10,
      totalReferred: 19,
      totalRevenue: 22000000,
      commissionEarned: 2200000,
      pendingPayout: 0,
      status: 'Active',
    },
    {
      id: 'ref-3',
      userId: 'u-103',
      userName: 'Ngô Đức Thắng',
      userEmail: 'thang.ngo@sysadmin.pro',
      code: 'THANGVPS',
      commissionRate: 15,
      totalReferred: 5,
      totalRevenue: 8500000,
      commissionEarned: 1275000,
      pendingPayout: 1275000,
      status: 'Pending Payout',
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('admin_referrals_list');
    if (saved) {
      try {
        setReferrals(JSON.parse(saved));
      } catch {
        setReferrals(initialReferrals);
      }
    } else {
      setReferrals(initialReferrals);
    }
  }, []);

  const saveReferrals = (items: ReferralItem[]) => {
    setReferrals(items);
    localStorage.setItem('admin_referrals_list', JSON.stringify(items));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName.trim() || !formData.userEmail.trim() || !formData.code.trim()) {
      showToast('Vui lòng nhập đầy đủ thông tin đối tác và mã giới thiệu.', 'error');
      return;
    }

    const newItem: ReferralItem = {
      id: `ref-${Date.now()}`,
      userId: `u-${Date.now()}`,
      userName: formData.userName.trim(),
      userEmail: formData.userEmail.trim(),
      code: formData.code.trim().toUpperCase(),
      commissionRate: formData.commissionRate,
      totalReferred: 0,
      totalRevenue: 0,
      commissionEarned: 0,
      pendingPayout: 0,
      status: 'Active'
    };

    const updated = [newItem, ...referrals];
    saveReferrals(updated);
    setShowAddModal(false);
    showToast(`Đã tạo mã giới thiệu ${newItem.code} thành công!`);
  };

  const handleOpenEdit = (item: ReferralItem) => {
    setEditingItem(item);
    setFormData({
      userName: item.userName,
      userEmail: item.userEmail,
      code: item.code,
      commissionRate: item.commissionRate
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const updated = referrals.map(r => r.id === editingItem.id ? {
      ...r,
      userName: formData.userName,
      userEmail: formData.userEmail,
      code: formData.code.toUpperCase(),
      commissionRate: formData.commissionRate
    } : r);

    saveReferrals(updated);
    setEditingItem(null);
    showToast('Cập nhật thông tin mã giới thiệu thành công!');
  };

  const handleApprovePayout = (refId: string, name: string, amount: number) => {
    const updated = referrals.map(r => r.id === refId ? { ...r, pendingPayout: 0, status: 'Active' as const } : r);
    saveReferrals(updated);
    showToast(`Đã duyệt chi trả ${amount.toLocaleString('vi-VN')} đ hoa hồng vào ví của ${name}!`);
  };

  const handleRejectPayout = (refId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy yêu cầu chi trả hoa hồng này?')) return;
    const updated = referrals.map(r => r.id === refId ? { ...r, pendingPayout: 0 } : r);
    saveReferrals(updated);
    showToast('Đã hủy khoản hoa hồng chờ duyệt!');
  };

  const handleToggleSuspend = (refId: string) => {
    const updated = referrals.map(r => {
      if (r.id === refId) {
        const nextStatus = r.status === 'Suspended' ? 'Active' : 'Suspended';
        showToast(`Đã ${nextStatus === 'Suspended' ? 'tạm khóa' : 'kích hoạt lại'} mã ${r.code}`);
        return { ...r, status: nextStatus as any };
      }
      return r;
    });
    saveReferrals(updated);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Đã sao chép mã: ${code}`);
  };

  const filtered = referrals.filter(r => {
    const matchesSearch = r.userName.toLowerCase().includes(search.toLowerCase()) || 
      r.code.toLowerCase().includes(search.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && r.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Share2 className="w-6 h-6 text-emerald-600" /> Quản Lý Giới Thiệu &amp; Hoa Hồng (Referral)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý mã giới thiệu thành viên, tỷ lệ hoa hồng phát sinh và duyệt trả thưởng tự động.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm mã / đối tác / email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm w-60"
              />
            </div>
            <button
              onClick={() => {
                setFormData({ userName: '', userEmail: '', code: '', commissionRate: 15 });
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tạo Mã Mới
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Pending Payout', label: 'Chờ duyệt chi trả' },
            { id: 'Active', label: 'Đang hoạt động' },
            { id: 'Suspended', label: 'Tạm khóa' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Referrals Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Đối Tác Giới Thiệu</th>
                  <th className="px-6 py-4">Mã Code &amp; % Hoa Hồng</th>
                  <th className="px-6 py-4">Lượt Mời</th>
                  <th className="px-6 py-4">Doanh Thu Mang Lại</th>
                  <th className="px-6 py-4">Hoa Hồng Chờ Duyệt</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{r.userName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{r.userEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span 
                          onClick={() => copyCode(r.code)}
                          className="font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 cursor-pointer hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          title="Click để sao chép"
                        >
                          {r.code} <Copy className="w-3 h-3 opacity-60" />
                        </span>
                        <span className="font-bold text-slate-500">({r.commissionRate}%)</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {r.totalReferred} khách
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {r.totalRevenue.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 font-black text-rose-600">
                      {r.pendingPayout > 0 ? `${r.pendingPayout.toLocaleString('vi-VN')} đ` : '0 đ'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.pendingPayout > 0 ? (
                          <>
                            <button
                              onClick={() => handleApprovePayout(r.id, r.userName, r.pendingPayout)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" /> Duyệt
                            </button>
                            <button
                              onClick={() => handleRejectPayout(r.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hủy yêu cầu"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 mr-2">Đã thanh toán</span>
                        )}

                        <button
                          onClick={() => handleOpenEdit(r)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Sửa mã giới thiệu"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleSuspend(r.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            r.status === 'Suspended' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                          title={r.status === 'Suspended' ? 'Mở khóa mã' : 'Khóa mã'}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Modal */}
        {(showAddModal || editingItem) && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">
                  {editingItem ? 'Chỉnh Sửa Mã Giới Thiệu' : 'Tạo Mã Đối Tác Mới'}
                </h3>
                <button onClick={() => { setShowAddModal(false); setEditingItem(null); }} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingItem ? handleUpdate : handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Đối Tác</label>
                  <input
                    type="text"
                    required
                    value={formData.userName}
                    onChange={e => setFormData({ ...formData, userName: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Đối Tác</label>
                  <input
                    type="email"
                    required
                    value={formData.userEmail}
                    onChange={e => setFormData({ ...formData, userEmail: e.target.value })}
                    placeholder="partner@domain.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mã Giới Thiệu</label>
                    <input
                      type="text"
                      required
                      value={formData.code}
                      onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="AFF2026"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">% Hoa Hồng</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={50}
                      value={formData.commissionRate}
                      onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingItem(null); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md"
                  >
                    {editingItem ? 'Lưu Thay Đổi' : 'Tạo Mã Đối Tác'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
