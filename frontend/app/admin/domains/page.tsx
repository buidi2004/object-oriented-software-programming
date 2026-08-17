'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, Lock, Unlock, Key, ArrowLeft, Search, 
  Calendar, CheckCircle2, AlertCircle, ExternalLink, RefreshCw 
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
  status: 'Active' | 'Pending Transfer' | 'Expired';
}

export default function AdminDomainsPage() {
  const [domains, setDomains] = useState<DomainAdminItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedEpp, setSelectedEpp] = useState<{ domain: string; code: string } | null>(null);
  const [success, setSuccess] = useState('');

  const mockDomains: DomainAdminItem[] = [
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
      status: 'Active',
    },
  ];

  useEffect(() => {
    setDomains(mockDomains);
  }, []);

  const handleToggleLock = (id: string) => {
    setDomains(domains.map(d => {
      if (d.id === id) {
        const nextState = !d.transferLock;
        setSuccess(`Đã ${nextState ? 'khóa' : 'mở khóa'} Transfer Lock cho tên miền ${d.domainName}!`);
        setTimeout(() => setSuccess(''), 3000);
        return { ...d, transferLock: nextState };
      }
      return d;
    }));
  };

  const filtered = domains.filter(d => 
    d.domainName.toLowerCase().includes(search.toLowerCase()) || 
    d.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
    d.registrar.toLowerCase().includes(search.toLowerCase())
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
              <Globe className="w-6 h-6 text-blue-600" /> Quản Lý Tên Miền &amp; Bản Ghi DNS (Domains)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý danh sách tên miền khách hàng, ngày hết hạn, mã EPP Auth Code và khóa chuyển nhượng.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên miền / email / registrar..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {success}
          </div>
        )}

        {/* EPP Code Modal */}
        {selectedEpp && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-slate-200 shadow-2xl text-center">
              <Key className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-900 mb-1">Mã EPP / Auth Code</h3>
              <p className="text-xs text-slate-500 mb-4">{selectedEpp.domain}</p>

              <div className="p-3 bg-slate-100 rounded-2xl font-mono text-sm font-black text-slate-900 select-all mb-4">
                {selectedEpp.code}
              </div>

              <button
                onClick={() => setSelectedEpp(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        )}

        {/* Domains Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tên Miền</th>
                  <th className="px-6 py-4">Chủ Sở Hữu</th>
                  <th className="px-6 py-4">Nhà Đăng Ký (Registrar)</th>
                  <th className="px-6 py-4">Ngày Hết Hạn</th>
                  <th className="px-6 py-4">Transfer Lock</th>
                  <th className="px-6 py-4 text-right">Mã EPP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                        {d.domainName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {d.ownerEmail}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {d.registrar}
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">
                      {new Date(d.expiryDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleLock(d.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 transition-colors ${
                          d.transferLock ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                        }`}
                      >
                        {d.transferLock ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {d.transferLock ? 'Đã Khóa' : 'Mở Khóa'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedEpp({ domain: d.domainName, code: d.eppCode })}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold text-xs transition-colors inline-flex items-center gap-1"
                      >
                        <Key className="w-3.5 h-3.5" /> Xem EPP
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
