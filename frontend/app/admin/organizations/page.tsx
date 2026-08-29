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
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    try {
      const res = await api.get('/organizations');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setOrgs(res.data);
      } else {
        setOrgs(mockOrgs);
      }
    } catch (err) {
      console.error('Failed to fetch orgs:', err);
      setOrgs(mockOrgs);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOwnerEmail) return;

    try {
      const res = await api.post('/organizations', {
        name: newOrgName,
        ownerEmail: newOwnerEmail,
        tier: 'Standard'
      });
      const created = res.data || {
        id: `org-${Date.now()}`,
        name: newOrgName,
        ownerEmail: newOwnerEmail,
        memberCount: 1,
        activeServices: 0,
        tier: 'Standard',
        createdAt: new Date().toISOString(),
      };
      setOrgs([created, ...orgs]);
      setIsCreating(false);
      setNewOrgName('');
      setNewOwnerEmail('');
    } catch (err) {
      console.error(err);
      alert('Không thể tạo tổ chức mới.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa tổ chức này?')) return;
    try {
      await api.delete(`/organizations/${id}`);
      setOrgs(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = orgs.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase()) || 
    o.ownerEmail.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-purple-600" /> Quản Lý Tổ Chức Doanh Nghiệp (B2B)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý các tài khoản tổ chức doanh nghiệp đa thành viên và phân quyền nhóm.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tổ chức / email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded bg-[#1E293B] bg-opacity-70 backdrop-blur-md border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm Tổ Chức
            </button>
          </div>
        </div>

        {/* Create Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-[#1E293B] bg-opacity-70 backdrop-blur-md/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg p-6 max-w-md w-full border border-white/10 shadow-2xl">
              <h2 className="text-base font-black text-white mb-4">Tạo Tổ Chức Doanh Nghiệp Mới</h2>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Tên Tổ Chức / Công Ty</label>
                  <input
                    type="text"
                    required
                    value={newOrgName}
                    onChange={e => setNewOrgName(e.target.value)}
                    placeholder="VD: Viettel Digital Services"
                    className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Email Người Sở Hữu (Owner)</label>
                  <input
                    type="email"
                    required
                    value={newOwnerEmail}
                    onChange={e => setNewOwnerEmail(e.target.value)}
                    placeholder="owner@domain.vn"
                    className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
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
            <div key={org.id} className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-md p-5 border border-white/10 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  org.tier === 'Enterprise' ? 'bg-purple-100 text-purple-700' : 'bg-blue-900/50 text-[#1F1F1F]'
                }`}>
                  {org.tier}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {new Date(org.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <h3 className="font-bold text-white text-sm mb-1">{org.name}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
                <Mail className="w-3 h-3 text-slate-500" /> {org.ownerEmail}
              </p>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-center">
                <div className="bg-[#0F172A] p-2 rounded">
                  <div className="text-base font-black text-white">{org.memberCount}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Thành viên</div>
                </div>
                <div className="bg-[#0F172A] p-2 rounded">
                  <div className="text-base font-black text-purple-600">{org.activeServices}</div>
                  <div className="text-[10px] text-slate-500 font-semibold">Dịch vụ Cloud</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
