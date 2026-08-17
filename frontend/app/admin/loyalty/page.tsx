'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Award, Plus, Minus, ArrowLeft, Search, User, 
  Gift, CheckCircle2, AlertCircle, History, Sparkles 
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

export default function AdminLoyaltyPage() {
  const [users, setUsers] = useState<LoyaltyUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [adjustingUser, setAdjustingUser] = useState<LoyaltyUserItem | null>(null);
  const [pointsChange, setPointsChange] = useState<number>(100);
  const [reason, setReason] = useState('Thưởng tích điểm tri ân khách hàng');
  const [success, setSuccess] = useState('');

  const mockLoyaltyUsers: LoyaltyUserItem[] = [
    {
      id: 'l-1',
      userId: 'u-1',
      userName: 'Nguyễn Thanh Tùng',
      userEmail: 'tung.nguyen@vng.corp',
      points: 2450,
      tier: 'Diamond',
      totalEarned: 5200,
      totalRedeemed: 2750,
      lastActivity: '2026-08-17T12:00:00Z',
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
      lastActivity: '2026-08-16T15:30:00Z',
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
      lastActivity: '2026-08-15T09:45:00Z',
    },
  ];

  useEffect(() => {
    setUsers(mockLoyaltyUsers);
  }, []);

  const handleAdjustPoints = (type: 'add' | 'deduct') => {
    if (!adjustingUser) return;
    const delta = type === 'add' ? pointsChange : -pointsChange;
    const newPoints = Math.max(0, adjustingUser.points + delta);

    setUsers(users.map(u => u.id === adjustingUser.id ? { ...u, points: newPoints } : u));
    setSuccess(`Đã ${type === 'add' ? 'cộng' : 'trừ'} ${pointsChange} điểm cho ${adjustingUser.userName}!`);
    setAdjustingUser(null);
    setTimeout(() => setSuccess(''), 3000);
  };

  const filtered = users.filter(u => 
    u.userName.toLowerCase().includes(search.toLowerCase()) || 
    u.userEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Award className="w-6 h-6 text-amber-500" /> Quản Lý Điểm Thưởng Khách Hàng (Loyalty)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi điểm tích lũy, cấp bậc thành viên và điều chỉnh điểm thưởng khách hàng.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm khách hàng / email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
            />
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {success}
          </div>
        )}

        {/* Modal Adjust Points */}
        {adjustingUser && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
              <h3 className="text-base font-black text-slate-900 mb-1">Điều Chỉnh Điểm Thưởng</h3>
              <p className="text-xs text-slate-500 mb-4">
                Khách hàng: <strong>{adjustingUser.userName}</strong> ({adjustingUser.userEmail})
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số Điểm Cần Thay Đổi</label>
                  <input
                    type="number"
                    min={1}
                    value={pointsChange}
                    onChange={e => setPointsChange(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lý Do Điều Chỉnh</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setAdjustingUser(null)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => handleAdjustPoints('deduct')}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Minus className="w-3.5 h-3.5" /> Trừ Điểm
                  </button>
                  <button
                    onClick={() => handleAdjustPoints('add')}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-md"
                  >
                    <Plus className="w-3.5 h-3.5" /> Cộng Điểm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Hạng Thành Viên</th>
                  <th className="px-6 py-4">Điểm Khả Dụng</th>
                  <th className="px-6 py-4">Tổng Tích Lũy</th>
                  <th className="px-6 py-4">Đã Đổi Quà</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900">
                      <div>{u.userName}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{u.userEmail}</div>
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
