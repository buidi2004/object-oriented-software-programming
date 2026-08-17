'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, RefreshCw, AlertTriangle, ArrowLeft, Search, 
  CheckCircle2, AlertCircle, Lock, Calendar, ExternalLink 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface SslAdminItem {
  id: string;
  domainName: string;
  ownerEmail: string;
  issuer: 'Let\'s Encrypt' | 'Sectigo PositiveSSL' | 'DigiCert Wildcard';
  issuedDate: string;
  expiryDate: string;
  autoRenew: boolean;
  daysRemaining: number;
  status: 'Active' | 'Expiring Soon' | 'Expired';
}

export default function AdminSslCertificatesPage() {
  const [certs, setCerts] = useState<SslAdminItem[]>([]);
  const [search, setSearch] = useState('');
  const [renewingId, setRenewingId] = useState<string | null>(null);
  const [success, setSuccess] = useState('');

  const mockCerts: SslAdminItem[] = [
    {
      id: 'ssl-1',
      domainName: '*.cloudhost.vn',
      ownerEmail: 'admin@cloudhost.vn',
      issuer: 'Let\'s Encrypt',
      issuedDate: '2026-06-01T00:00:00Z',
      expiryDate: '2026-09-01T00:00:00Z',
      autoRenew: true,
      daysRemaining: 14,
      status: 'Expiring Soon',
    },
    {
      id: 'ssl-2',
      domainName: 'app.fintechnextgen.com',
      ownerEmail: 'cto@fintechnext.vn',
      issuer: 'Sectigo PositiveSSL',
      issuedDate: '2026-01-10T00:00:00Z',
      expiryDate: '2027-01-10T00:00:00Z',
      autoRenew: true,
      daysRemaining: 145,
      status: 'Active',
    },
    {
      id: 'ssl-3',
      domainName: 'portal.vng-solutions.org',
      ownerEmail: 'tech.lead@vng.corp',
      issuer: 'DigiCert Wildcard',
      issuedDate: '2025-11-20T00:00:00Z',
      expiryDate: '2026-11-20T00:00:00Z',
      autoRenew: false,
      daysRemaining: 94,
      status: 'Active',
    },
  ];

  useEffect(() => {
    setCerts(mockCerts);
  }, []);

  const handleRenewCert = (id: string) => {
    setRenewingId(id);
    setTimeout(() => {
      setCerts(certs.map(c => c.id === id ? {
        ...c,
        daysRemaining: 90,
        status: 'Active',
        expiryDate: new Date(Date.now() + 90 * 86400000).toISOString()
      } : c));
      setRenewingId(null);
      setSuccess('Đã gia hạn chứng chỉ SSL thành công!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1200);
  };

  const filtered = certs.filter(c => 
    c.domainName.toLowerCase().includes(search.toLowerCase()) || 
    c.ownerEmail.toLowerCase().includes(search.toLowerCase()) ||
    c.issuer.toLowerCase().includes(search.toLowerCase())
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
              <ShieldCheck className="w-6 h-6 text-emerald-600" /> Quản Lý Chứng Chỉ SSL (Certificates)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Theo dõi thời hạn chứng chỉ bảo mật HTTPS, nhà phát hành và kích hoạt gia hạn tức thì.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm tên miền / email / CA..."
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

        {/* Certificates Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tên Miền (Common Name)</th>
                  <th className="px-6 py-4">Chủ Sở Hữu</th>
                  <th className="px-6 py-4">Tổ Chức Cấp (CA)</th>
                  <th className="px-6 py-4">Thời Hạn Còn Lại</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 font-black text-slate-900 text-sm">
                      <div className="flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {c.domainName}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {c.ownerEmail}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-700">
                      {c.issuer}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      <span className={c.daysRemaining <= 15 ? 'text-amber-600 font-black' : ''}>
                        {c.daysRemaining} ngày
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 w-fit ${
                        c.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        c.status === 'Expiring Soon' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {c.status === 'Expiring Soon' ? <AlertTriangle className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRenewCert(c.id)}
                        disabled={renewingId === c.id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${renewingId === c.id ? 'animate-spin' : ''}`} />
                        Gia Hạn
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
