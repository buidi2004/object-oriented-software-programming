'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, Share2, ArrowLeft, Search, DollarSign, 
  CheckCircle2, AlertCircle, TrendingUp, Check, Copy 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface ReferralItem {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  code: string;
  totalReferred: number;
  totalRevenue: number;
  commissionEarned: number;
  pendingPayout: number;
  status: 'Active' | 'Pending Payout' | 'Suspended';
}

export default function AdminReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState('');

  const mockReferrals: ReferralItem[] = [
    {
      id: 'ref-1',
      userId: 'u-101',
      userName: 'Vũ Quốc Huy',
      userEmail: 'huy.vq@affiliatevn.com',
      code: 'HUYCLOUD20',
      totalReferred: 38,
      totalRevenue: 45000000,
      commissionEarned: 6750000,
      pendingPayout: 2250000,
      status: 'Pending Payout',
    },
    {
      id: 'ref-2',
      userId: 'u-102',
      userName: 'Trần Bảo Ngọc',
      userEmail: 'ngoc.tb@techreview.io',
      code: 'NGOCDEV10',
      totalReferred: 19,
      totalRevenue: 22000000,
      commissionEarned: 3300000,
      pendingPayout: 0,
      status: 'Active',
    },
    {
      id: 'ref-3',
      userId: 'u-103',
      userName: 'Ngô Đức Thắng',
      userEmail: 'thang.ngo@sysadmin.pro',
      code: 'THANGVPS',
      totalReferred: 5,
      totalRevenue: 8500000,
      commissionEarned: 1275000,
      pendingPayout: 1275000,
      status: 'Pending Payout',
    },
  ];

  useEffect(() => {
    setReferrals(mockReferrals);
  }, []);

  const handleApprovePayout = (refId: string) => {
    setReferrals(referrals.map(r => r.id === refId ? { ...r, pendingPayout: 0, status: 'Active' } : r));
    setSuccess('Đã duyệt và thanh toán hoa hồng thành công vào ví khách hàng!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const filtered = referrals.filter(r => 
    r.userName.toLowerCase().includes(search.toLowerCase()) || 
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.userEmail.toLowerCase().includes(search.toLowerCase())
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
              <Share2 className="w-6 h-6 text-emerald-600" /> Quản Lý Giới Thiệu &amp; Hoa Hồng (Referral)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý mã giới thiệu thành viên, hoa hồng phát sinh và duyệt trả thưởng.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm mã / người dùng / email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
            />
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {success}
          </div>
        )}

        {/* Referrals Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Mã Giới Thiệu</th>
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
                    <td className="px-6 py-4 font-mono font-bold text-emerald-600 bg-emerald-50/50 w-fit rounded px-2 py-1">
                      {r.code}
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
                      {r.pendingPayout > 0 ? (
                        <button
                          onClick={() => handleApprovePayout(r.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Duyệt Trả Thưởng
                        </button>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">Đã thanh toán</span>
                      )}
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
