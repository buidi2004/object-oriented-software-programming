'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Users, Plus, Shield, CheckCircle2, 
  ArrowLeft, Search, Mail, ExternalLink 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface OrgItem {
  id: string;
  name: string;
  ownerEmail: string;
  memberCount: number;
  activeServices: number;
  tier: 'Enterprise' | 'Team' | 'Standard';
  createdAt: string;
}

export default function AdminOrganizationsPage() {
  const [orgs, setOrgs] = useState<OrgItem[]>([]);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');

  const mockOrgs: OrgItem[] = [
    {
      id: 'org-1',
      name: 'VNG Digital Solutions Corp',
      ownerEmail: 'tech.lead@vng.corp',
      memberCount: 24,
      activeServices: 18,
      tier: 'Enterprise',
      createdAt: '2026-01-15T00:00:00Z',
    },
    {
      id: 'org-2',
      name: 'Fintech NextGen JSC',
      ownerEmail: 'cto@fintechnext.vn',
      memberCount: 8,
      activeServices: 6,
      tier: 'Team',
      createdAt: '2026-04-10T00:00:00Z',
    },
    {
      id: 'org-3',
      name: 'E-Commerce Global Ltd',
      ownerEmail: 'admin@ecglobal.com',
      memberCount: 15,
      activeServices: 12,
      tier: 'Enterprise',
      createdAt: '2026-06-20T00:00:00Z',
    },
  ];

  useEffect(() => {
    setOrgs(mockOrgs);
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOwnerEmail) return;

    const newOrg: OrgItem = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      ownerEmail: newOwnerEmail,
      memberCount: 1,
      activeServices: 0,
      tier: 'Standard',
      createdAt: new Date().toISOString(),
    };

    setOrgs([newOrg, ...orgs]);
    setIsCreating(false);
    setNewOrgName('');
    setNewOwnerEmail('');
  };

  const filtered = orgs.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-purple-600" /> Quản Lý Tổ Chức Doanh Nghiệp (B2B)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý các tài khoản tổ chức doanh nghiệp đa thành viên và phân quyền nhóm.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tổ chức / email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm Tổ Chức
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl">
              <h2 className="text-base font-black text-slate-900 mb-4">Tạo Tổ Chức Doanh Nghiệp Mới</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Tổ Chức / Công Ty</label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={e => setNewOrgName(e.target.value)}
                    placeholder="VD: Viettel Digital Services"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Người Sở Hữu (Owner)</label>
                  <input
                    type="email"
                    required
                    value={newOwnerEmail}
                    onChange={e => setNewOwnerEmail(e.target.value)}
                    placeholder="owner@domain.vn"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
                  >
                    Tạo Ngay
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Orgs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((org) => (
            <div key={org.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  org.tier === 'Enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {org.tier}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(org.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">{org.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                <Mail className="w-3 h-3 text-slate-400" /> {org.ownerEmail}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-base font-black text-slate-900">{org.memberCount}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Thành viên</div>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl">
                  <div className="text-base font-black text-purple-600">{org.activeServices}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">Dịch vụ Cloud</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
