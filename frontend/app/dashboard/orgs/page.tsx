'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  CreditCard, 
  RefreshCw, 
  CheckCircle2, 
  Mail, 
  Lock 
} from 'lucide-react';

interface OrgMember {
  id: string;
  email: string;
  fullName: string;
  role: 'Owner' | 'Admin' | 'Member';
  joinedDate: string;
}

export default function CustomerOrganizationsPage() {
  const [orgName, setOrgName] = useState('Tổng Công Ty Công Nghệ Phần Mềm');
  const [taxCode, setTaxCode] = useState('0109988776');
  const [creditLimit, setCreditLimit] = useState(50000000);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member');

  const fetchOrgData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/organizations', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setOrgName(data[0].name || orgName);
          setTaxCode(data[0].taxCode || taxCode);
          setCreditLimit(data[0].creditLimit || creditLimit);
        }
      }
      setMembers([
        { id: 'm-1', email: 'director@company.vn', fullName: 'Nguyễn Văn Giám Đốc', role: 'Owner', joinedDate: '2025-10-01' },
        { id: 'm-2', email: 'devops.lead@company.vn', fullName: 'Trần DevOps Kỹ Thuật', role: 'Admin', joinedDate: '2025-11-15' },
        { id: 'm-3', email: 'developer1@company.vn', fullName: 'Lê Lập Trình Viên', role: 'Member', joinedDate: '2026-02-01' }
      ]);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    const newMember: OrgMember = {
      id: `m-${Date.now()}`,
      email: inviteEmail,
      fullName: inviteEmail.split('@')[0],
      role: inviteRole,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setMembers([...members, newMember]);
    setShowInviteModal(false);
    setInviteEmail('');
  };

  const handleRemoveMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#1F1F1F]" /> Quản Trị Tổ Chức Doanh Nghiệp & Nhóm (Team)
          </h1>
          <p className="text-sm text-slate-600">
            Quản lý các tài khoản con (Sub-accounts), phân quyền quản trị máy chủ VPS, hạ tầng mạng và chia sẻ hạn mức tín dụng thanh toán.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOrgData}
            className="p-2.5 rounded bg-white border border-slate-200 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" /> Mời Thành Viên Mới
          </button>
        </div>
      </div>

      {/* Org Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-md bg-white/60 border border-slate-200 shadow-xl space-y-2">
          <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-[#1F1F1F]" /> Tên Tổ Chức / Doanh Nghiệp
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">{orgName}</div>
          <div className="text-xs text-slate-600 font-mono">Mã số thuế: {taxCode}</div>
        </div>

        <div className="p-6 rounded-md bg-white/60 border border-slate-200 shadow-xl space-y-2">
          <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Hạn Mức Tín Dụng Doanh Nghiệp
          </div>
          <div className="text-lg font-bold text-emerald-400">
            {creditLimit.toLocaleString('vi-VN')} đ
          </div>
          <div className="text-xs text-slate-600">Thanh toán trả sau định kỳ hàng tháng</div>
        </div>

        <div className="p-6 rounded-md bg-white/60 border border-slate-200 shadow-xl space-y-2">
          <div className="text-xs text-slate-600 font-semibold uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-200" /> Tổng Số Thành Viên
          </div>
          <div className="text-lg font-bold text-slate-900">{members.length} Tài khoản</div>
          <div className="text-xs text-slate-600">1 Chủ sở hữu • {members.filter(m => m.role === 'Admin').length} Quản trị viên</div>
        </div>
      </div>

      {/* Members Table */}
      <div className="rounded-lg bg-white/60 border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-[#1F1F1F]" /> Danh Sách Thành Viên & Quyền Hạn
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/60 text-slate-600 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Thành Viên</th>
                <th className="px-6 py-4">Vai Trò (Role)</th>
                <th className="px-6 py-4">Ngày Tham Gia</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-700">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{m.fullName}</div>
                    <div className="text-xs text-slate-600 font-mono">{m.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${m.role === 'Owner' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : m.role === 'Admin' ? 'bg-cyan-500/10 text-[#1F1F1F] border border-cyan-500/20' : 'bg-white text-slate-300'}`}>
                      <ShieldCheck className="w-3 h-3" /> {m.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    {m.joinedDate}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {m.role !== 'Owner' && (
                      <button 
                        onClick={() => handleRemoveMember(m.id)}
                        className="p-1.5 rounded-sm bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors"
                        title="Xóa thành viên"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Mời Thành Viên */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-lg bg-white border border-slate-200 shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#1F1F1F]" /> Mời Thành Viên Vào Tổ Chức
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Email người nhận lời mời *</label>
                <input 
                  type="email" 
                  required
                  placeholder="nhanvien@company.vn"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Phân quyền vai trò</label>
                <select 
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Member')}
                  className="w-full px-4 py-2.5 rounded bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="Member">Member (Chỉ xem & quản lý dịch vụ được giao)</option>
                  <option value="Admin">Admin (Toàn quyền quản trị kỹ thuật & tạo VPS)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 rounded bg-white text-slate-700 text-sm font-semibold hover:bg-slate-200"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400"
                >
                  Gửi Lời Mời
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
