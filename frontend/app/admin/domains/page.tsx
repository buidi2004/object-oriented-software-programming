'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, Lock, Unlock, Key, ArrowLeft, Search, 
  Calendar, CheckCircle2, AlertCircle, ExternalLink, RefreshCw,
  Plus, Edit2, Trash2, Copy, Check, X, Shield, Server
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface DomainAdminItem {
  id: string;
  domainName: string;
  ownerEmail: string;
  registrar: string;
  registeredDate: string;
  expiryDate: string;
  autoRenew: boolean;
  transferLock: boolean;
  eppCode: string;
  nameservers?: string[];
  status: 'Active' | 'Pending Transfer' | 'Expired';
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<DomainAdminItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEpp, setSelectedEpp] = useState<{ domain: string; code: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'Active' | 'Pending Transfer' | 'Expired'>('all');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState<DomainAdminItem | null>(null);

  const [formData, setFormData] = useState({
    domainName: '',
    ownerEmail: '',
    registrar: 'VNNIC / PA Vietnam',
    years: '1',
    autoRenew: true,
    transferLock: true,
    nameservers: 'ns1.cloudhost.vn, ns2.cloudhost.vn'
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialDomains: DomainAdminItem[] = [
    {
      id: 'dom-1',
      domainName: 'cloudhost.vn',
      ownerEmail: 'admin@cloudhost.vn',
      registrar: 'VNNIC / PA Vietnam',
      registeredDate: '2022-03-15T00:00:00Z',
      expiryDate: '2028-03-15T00:00:00Z',
      autoRenew: true,
      transferLock: true,
      eppCode: 'VN-EPP-98827-SECURE',
      nameservers: ['ns1.cloudhost.vn', 'ns2.cloudhost.vn'],
      status: 'Active',
    },
    {
      id: 'dom-2',
      domainName: 'fintechnextgen.com',
      ownerEmail: 'cto@fintechnext.vn',
      registrar: 'Namecheap / ICANN',
      registeredDate: '2024-05-10T00:00:00Z',
      expiryDate: '2027-05-10T00:00:00Z',
      autoRenew: true,
      transferLock: true,
      eppCode: 'NC-EPP-11029-COM',
      nameservers: ['dns1.registrar-servers.com', 'dns2.registrar-servers.com'],
      status: 'Active',
    },
    {
      id: 'dom-3',
      domainName: 'vng-solutions.org',
      ownerEmail: 'tech.lead@vng.corp',
      registrar: 'GoDaddy / ICANN',
      registeredDate: '2025-01-20T00:00:00Z',
      expiryDate: '2026-09-20T00:00:00Z',
      autoRenew: false,
      transferLock: false,
      eppCode: 'GD-AUTH-33921-ORG',
      nameservers: ['ns01.domaincontrol.com', 'ns02.domaincontrol.com'],
      status: 'Active',
    },
  ];

  useEffect(() => {
    const saved = localStorage.getItem('admin_domains_list');
    if (saved) {
      try {
        setDomains(JSON.parse(saved));
      } catch {
        setDomains(initialDomains);
      }
    } else {
      setDomains(initialDomains);
    }
  }, []);

  const saveDomains = (items: DomainAdminItem[]) => {
    setDomains(items);
    localStorage.setItem('admin_domains_list', JSON.stringify(items));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.domainName.trim() || !formData.ownerEmail.trim()) {
      showToast('Vui lòng nhập tên miền và email chủ sở hữu.', 'error');
      return;
    }

    const yearsNum = parseInt(formData.years) || 1;
    const now = new Date();
    const expiry = new Date(now.setFullYear(now.getFullYear() + yearsNum)).toISOString();

    const newDomain: DomainAdminItem = {
      id: `dom-${Date.now()}`,
      domainName: formData.domainName.trim().toLowerCase(),
      ownerEmail: formData.ownerEmail.trim().toLowerCase(),
      registrar: formData.registrar,
      registeredDate: new Date().toISOString(),
      expiryDate: expiry,
      autoRenew: formData.autoRenew,
      transferLock: formData.transferLock,
      eppCode: `AUTH-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      nameservers: formData.nameservers.split(',').map(s => s.trim()),
      status: 'Active'
    };

    const updated = [newDomain, ...domains];
    saveDomains(updated);
    setShowAddModal(false);
    showToast(`Đã thêm tên miền ${newDomain.domainName} thành công!`);
  };

  const handleOpenEdit = (dom: DomainAdminItem) => {
    setEditingDomain(dom);
    setFormData({
      domainName: dom.domainName,
      ownerEmail: dom.ownerEmail,
      registrar: dom.registrar,
      years: '1',
      autoRenew: dom.autoRenew,
      transferLock: dom.transferLock,
      nameservers: dom.nameservers ? dom.nameservers.join(', ') : 'ns1.cloudhost.vn, ns2.cloudhost.vn'
    });
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDomain) return;

    const updated = domains.map(d => {
      if (d.id === editingDomain.id) {
        return {
          ...d,
          ownerEmail: formData.ownerEmail,
          registrar: formData.registrar,
          autoRenew: formData.autoRenew,
          transferLock: formData.transferLock,
          nameservers: formData.nameservers.split(',').map(s => s.trim())
        };
      }
      return d;
    });

    saveDomains(updated);
    setEditingDomain(null);
    showToast(`Đã cập nhật cấu hình tên miền ${editingDomain.domainName}!`);
  };

  const handleToggleLock = (id: string) => {
    const updated = domains.map(d => {
      if (d.id === id) {
        const nextState = !d.transferLock;
        showToast(`Đã ${nextState ? 'khóa' : 'mở khóa'} Transfer Lock cho ${d.domainName}!`);
        return { ...d, transferLock: nextState };
      }
      return d;
    });
    saveDomains(updated);
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa tên miền ${name}?`)) return;
    const updated = domains.filter(d => d.id !== id);
    saveDomains(updated);
    showToast(`Đã xóa tên miền ${name}!`);
  };

  const copyEpp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    showToast('Đã sao chép mã EPP Auth Code!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filtered = domains.filter(d => {
    const matchesSearch = d.domainName.toLowerCase().includes(search.toLowerCase()) || 
      d.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
      d.registrar.toLowerCase().includes(search.toLowerCase());
    if (filter === 'all') return matchesSearch;
    return matchesSearch && d.status === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
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
            <Link href="/admin" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Globe className="w-6 h-6 text-[#1F1F1F]" /> Quản Lý Tên Miền &amp; Bản Ghi DNS (Domains)
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Quản lý danh sách tên miền khách hàng, ngày hết hạn, mã EPP Auth Code và khóa chuyển nhượng.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên miền / email / registrar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm w-64"
              />
            </div>
            <button
              onClick={() => {
                setFormData({
                  domainName: '',
                  ownerEmail: '',
                  registrar: 'VNNIC / PA Vietnam',
                  years: '1',
                  autoRenew: true,
                  transferLock: true,
                  nameservers: 'ns1.cloudhost.vn, ns2.cloudhost.vn'
                });
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm Tên Miền
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'Active', label: 'Đang hoạt động' },
            { id: 'Pending Transfer', label: 'Chờ chuyển nhượng' },
            { id: 'Expired', label: 'Đã hết hạn' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded text-xs font-semibold transition-colors ${
                filter === tab.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Domains Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Tên Miền</th>
                  <th className="py-4 px-6">Chủ Sở Hữu</th>
                  <th className="py-4 px-6">Nhà Đăng Ký</th>
                  <th className="py-4 px-6">Ngày Hết Hạn</th>
                  <th className="py-4 px-6 text-center">Transfer Lock</th>
                  <th className="py-4 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((dom) => (
                  <tr key={dom.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-[#1F1F1F]" />
                        <span>{dom.domainName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono">{dom.ownerEmail}</td>
                    <td className="py-4 px-6 text-slate-600">{dom.registrar}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {new Date(dom.expiryDate).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleToggleLock(dom.id)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold text-[11px] cursor-pointer transition-all ${
                          dom.transferLock
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        }`}
                        title="Bấm để bật/tắt khóa chuyển nhượng"
                      >
                        {dom.transferLock ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {dom.transferLock ? 'Đã Khóa' : 'Mở Khóa'}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedEpp({ domain: dom.domainName, code: dom.eppCode })}
                          className="px-2.5 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1 transition-colors"
                        >
                          <Key className="w-3 h-3 text-slate-600" /> Mã EPP
                        </button>
                        <button
                          onClick={() => handleOpenEdit(dom)}
                          className="p-1.5 text-slate-600 hover:text-[#1F1F1F] hover:bg-blue-50 rounded-sm transition-colors"
                          title="Sửa cấu hình"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(dom.id, dom.domainName)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                          title="Xóa tên miền"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* EPP Modal */}
        {selectedEpp && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-slate-900">Mã EPP Auth Code</h2>
                <button onClick={() => setSelectedEpp(null)} className="p-1.5 text-slate-600 hover:text-slate-600 rounded-sm hover:bg-slate-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 mb-3">Tên miền: <strong>{selectedEpp.domain}</strong></p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md flex items-center justify-between font-mono text-xs font-bold text-slate-900 mb-4">
                <span>{selectedEpp.code}</span>
                <button
                  onClick={() => copyEpp(selectedEpp.code)}
                  className="p-1 text-slate-600 hover:text-[#1F1F1F] rounded-sm hover:bg-white transition-colors"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <button
                onClick={() => setSelectedEpp(null)}
                className="w-full py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Add / Edit Modal */}
        {(showAddModal || editingDomain) && (
          <div className="fixed inset-0 bg-white/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-slate-900">
                  {editingDomain ? 'Cấu Hình Tên Miền' : 'Đăng Ký / Thêm Tên Miền Mới'}
                </h2>
                <button onClick={() => { setShowAddModal(false); setEditingDomain(null); }} className="p-1.5 text-slate-600 hover:text-slate-600 rounded-sm hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingDomain ? handleUpdate : handleCreate} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Miền</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingDomain}
                    value={formData.domainName}
                    onChange={e => setFormData({ ...formData, domainName: e.target.value })}
                    placeholder="example.vn"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Chủ Sở Hữu</label>
                  <input
                    type="email"
                    required
                    value={formData.ownerEmail}
                    onChange={e => setFormData({ ...formData, ownerEmail: e.target.value })}
                    placeholder="customer@domain.com"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nhà Đăng Ký (Registrar)</label>
                    <select
                      value={formData.registrar}
                      onChange={e => setFormData({ ...formData, registrar: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value="VNNIC / PA Vietnam">VNNIC / PA Vietnam</option>
                      <option value="VNNIC / Mat Bao">VNNIC / Mắt Bão</option>
                      <option value="Namecheap / ICANN">Namecheap / ICANN</option>
                      <option value="GoDaddy / ICANN">GoDaddy / ICANN</option>
                      <option value="Cloudflare Registrar">Cloudflare Registrar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Thời Hạn (Năm)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={10}
                      disabled={!!editingDomain}
                      value={formData.years}
                      onChange={e => setFormData({ ...formData, years: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nameservers (DNS)</label>
                  <input
                    type="text"
                    value={formData.nameservers}
                    onChange={e => setFormData({ ...formData, nameservers: e.target.value })}
                    placeholder="ns1.cloudhost.vn, ns2.cloudhost.vn"
                    className="w-full px-3 py-2 text-xs rounded border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoRenew}
                      onChange={e => setFormData({ ...formData, autoRenew: e.target.checked })}
                      className="rounded text-[#1F1F1F] focus:ring-blue-500"
                    />
                    Tự động gia hạn (Auto-Renew)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.transferLock}
                      onChange={e => setFormData({ ...formData, transferLock: e.target.checked })}
                      className="rounded text-[#1F1F1F] focus:ring-blue-500"
                    />
                    Khóa chuyển nhượng (Transfer Lock)
                  </label>
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingDomain(null); }}
                    className="px-4 py-2.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                  >
                    {editingDomain ? 'Lưu Thay Đổi' : 'Đăng Ký Tên Miền'}
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
