'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, Plus, Minus, ArrowLeft, Search, User, 
  Gift, CheckCircle2, AlertCircle, History, Sparkles,
  Settings2, X, RefreshCw, Star, ArrowUpRight
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface LoyaltyUserItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  points: number;
  tier: 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  totalEarned: number;
  totalRedeemed: number;
  lastActivity: string;
}

interface PointAdjustmentHistory {
  id: string;
  userName: string;
  type: 'add' | 'deduct';
  amount: number;
  reason: string;
  timestamp: string;
}

export default function AdminLoyaltyPage() {
  const [users, setUsers] = useState<LoyaltyUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [adjustingUser, setAdjustingUser] = useState<LoyaltyUserItem | null>(null);
  const [pointsChange, setPointsChange] = useState<number>(100);
  const [reason, setReason] = useState('Thưởng tích điểm tri ân khách hàng');
  const [history, setHistory] = useState<PointAdjustmentHistory[]>([]);
  
  // Rule Config Modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [rateConfig, setRateConfig] = useState({
    spendAmountPerPoint: 10000,
    pointValueInVnd: 100,
    goldThreshold: 1000,
    platinumThreshold: 2500,
    diamondThreshold: 5000
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialLoyaltyUsers: LoyaltyUserItem[] = [
    {
      id: 'l-1',
      userId: 'u-1',
      userName: 'Nguyễn Thanh Tùng',
      userEmail: 'tung.nguyen@vng.corp',
      points: 2450,
      tier: 'Diamond',
      totalEarned: 5200,
      totalRedeemed: 2750,
      lastActivity: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'l-2',
      userId: 'u-2',
      userName: 'Lê Hoàng Long',
      userEmail: 'long.le@fintech.vn',
      points: 850,
      tier: 'Gold',
      totalEarned: 1500,
      totalRedeemed: 650,
      lastActivity: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'l-3',
      userId: 'u-3',
      userName: 'Phạm Minh Đức',
      userEmail: 'duc.pm@devzone.io',
      points: 320,
      tier: 'Silver',
      totalEarned: 320,
      totalRedeemed: 0,
      lastActivity: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('admin_loyalty_users');
    if (saved) {
      try {
        setUsers(JSON.parse(saved));
      } catch {
        setUsers(initialLoyaltyUsers);
      }
    } else {
      setUsers(initialLoyaltyUsers);
    }
  }, []);

  const saveUsers = (items: LoyaltyUserItem[]) => {
    setUsers(items);
    localStorage.setItem('admin_loyalty_users', JSON.stringify(items));
  };

  const handleAdjustPoints = (type: 'add' | 'deduct') => {
    if (!adjustingUser) return;
    const delta = type === 'add' ? pointsChange : -pointsChange;
    const newPoints = Math.max(0, adjustingUser.points + delta);

    // Auto tier calculation
    let newTier = adjustingUser.tier;
    if (newPoints >= rateConfig.diamondThreshold) newTier = 'Diamond';
    else if (newPoints >= rateConfig.platinumThreshold) newTier = 'Platinum';
    else if (newPoints >= rateConfig.goldThreshold) newTier = 'Gold';
    else newTier = 'Silver';

    const updated = users.map(u => u.id === adjustingUser.id ? { 
      ...u, 
      points: newPoints, 
      tier: newTier as any,
      totalEarned: type === 'add' ? u.totalEarned + pointsChange : u.totalEarned,
      totalRedeemed: type === 'deduct' ? u.totalRedeemed + pointsChange : u.totalRedeemed,
      lastActivity: new Date().toISOString()
    } : u);

    saveUsers(updated);

    // Add to history
    const logItem: PointAdjustmentHistory = {
      id: `log-${Date.now()}`,
      userName: adjustingUser.userName,
      type,
      amount: pointsChange,
      reason,
      timestamp: new Date().toISOString()
    };
    setHistory([logItem, ...history]);

    showToast(`Đã ${type === 'add' ? 'cộng' : 'trừ'} ${pointsChange} điểm cho ${adjustingUser.userName}!`);
    setAdjustingUser(null);
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfigModal(false);
    showToast('Đã lưu cấu hình tỷ lệ đổi điểm và cấp bậc thành viên!');
  };

  const filtered = users.filter(u => 
    u.userName.toLowerCase().includes(search.toLowerCase()) || 
    u.userEmail.toLowerCase().includes(search.toLowerCase())
  );

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
              <Award className="w-6 h-6 text-amber-500" /> Quản Lý Điểm Thưởng Khách Hàng (Loyalty &amp; Tiers)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi điểm tích lũy, cấp bậc thành viên và điều chỉnh điểm thưởng khách hàng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm khách hàng / email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm w-60"
              />
            </div>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Settings2 className="w-4 h-4" /> Cấu Hình Điểm
            </button>
          </div>
        </div>

        {/* Modal Adjust Points */}
        {adjustingUser && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">Điều Chỉnh Điểm Thưởng</h3>
                <button onClick={() => setAdjustingUser(null)} className="p-1.5 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4">
                Khách hàng: <strong>{adjustingUser.userName}</strong> ({adjustingUser.userEmail})<br />
                Số dư hiện tại: <strong className="text-amber-600">{adjustingUser.points} điểm</strong>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Điểm Cần Thay Đổi</label>
                  <input
                    type="number"
                    min={1}
                    value={pointsChange}
                    onChange={e => setPointsChange(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lý Do Điều Chỉnh</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setAdjustingUser(null)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleAdjustPoints('deduct')}
                    className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-slate-900 text-xs font-bold flex items-center gap-1"
                  >
                    <Minus className="w-3.5 h-3.5" /> Trừ Điểm
                  </button>
                  <button
                    onClick={() => handleAdjustPoints('add')}
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Cộng Điểm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Rule Config */}
        {showConfigModal && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">Cấu Hình Quy Đổi Điểm &amp; Cấp Bậc</h3>
                <button onClick={() => setShowConfigModal(false)} className="p-1.5 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mức chi tiêu nhận 1 điểm</label>
                    <input
                      type="number"
                      required
                      value={rateConfig.spendAmountPerPoint}
                      onChange={e => setRateConfig({ ...rateConfig, spendAmountPerPoint: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-bold"
                    />
                    <span className="text-[10px] text-slate-600">VNĐ / 1 điểm thưởng</span>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Giá trị quy đổi 1 điểm</label>
                    <input
                      type="number"
                      required
                      value={rateConfig.pointValueInVnd}
                      onChange={e => setRateConfig({ ...rateConfig, pointValueInVnd: Number(e.target.value) })}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 font-bold"
                    />
                    <span className="text-[10px] text-slate-600">VNĐ trừ vào đơn hàng</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-2">Ngưỡng Điểm Nâng Hạng</h4>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-bold text-amber-600 mb-1">Hạng Vàng (Gold)</label>
                      <input
                        type="number"
                        value={rateConfig.goldThreshold}
                        onChange={e => setRateConfig({ ...rateConfig, goldThreshold: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-purple-600 mb-1">Bạch Kim (Platinum)</label>
                      <input
                        type="number"
                        value={rateConfig.platinumThreshold}
                        onChange={e => setRateConfig({ ...rateConfig, platinumThreshold: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-cyan-600 mb-1">Kim Cương (Diamond)</label>
                      <input
                        type="number"
                        value={rateConfig.diamondThreshold}
                        onChange={e => setRateConfig({ ...rateConfig, diamondThreshold: Number(e.target.value) })}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md"
                  >
                    Lưu Cấu Hình
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Hạng Thành Viên</th>
                  <th className="px-6 py-4">Điểm Khả Dụng</th>
                  <th className="px-6 py-4">Tổng Tích Lũy</th>
                  <th className="px-6 py-4">Đã Đổi Thưởng</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{u.userName}</div>
                      <div className="text-[11px] text-slate-600 font-normal">{u.userEmail}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] uppercase tracking-wider ${
                        u.tier === 'Diamond' ? 'bg-cyan-100 text-cyan-800' :
                        u.tier === 'Platinum' ? 'bg-purple-100 text-purple-800' :
                        u.tier === 'Gold' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-amber-600 text-sm">
                      {u.points.toLocaleString('vi-VN')} pts
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {u.totalEarned.toLocaleString('vi-VN')} pts
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-500">
                      {u.totalRedeemed.toLocaleString('vi-VN')} pts
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setAdjustingUser(u)}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Điều Chỉnh
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
