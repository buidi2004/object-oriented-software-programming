'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  CheckCircle2, 
  Search, 
  Settings2,
  Calendar,
  Layers
} from 'lucide-react';

interface DomainItem {
  id: string;
  name: string;
  tld: string;
  status: string;
  autoRenew: boolean;
  registrationDate: string;
  expiryDate: string;
  nameservers: string[];
}

export default function CustomerDomainsDashboardPage() {
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5053/api/domains/my', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setDomains(Array.isArray(data) ? data : []);
      } else {
        setDomains([
          {
            id: 'dom-01',
            name: 'cloudservicestore.vn',
            tld: '.vn',
            status: 'Active',
            autoRenew: true,
            registrationDate: '2025-01-10',
            expiryDate: '2027-01-10',
            nameservers: ['ns1.cloudservicestore.vn', 'ns2.cloudservicestore.vn']
          },
          {
            id: 'dom-02',
            name: 'mydevops-platform.com',
            tld: '.com',
            status: 'Active',
            autoRenew: false,
            registrationDate: '2025-06-20',
            expiryDate: '2026-06-20',
            nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com']
          }
        ]);
      }
    } catch {
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  const filtered = domains.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-cyan-400" /> Quản Lý Tên Miền Của Tôi
          </h1>
          <p className="text-sm text-slate-400">
            Quản trị bản ghi DNS, chuyển đổi Nameserver, gia hạn tự động và bảo mật khóa tên miền (Domain Lock).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDomains}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <a 
            href="/domains"
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Đăng Ký Tên Miền Mới
          </a>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
        <input 
          type="text" 
          placeholder="Tìm kiếm tên miền của bạn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
        />
      </div>

      {/* Domains Table */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/60 text-slate-400 text-xs uppercase font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Tên Miền</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4">Tự Động Gia Hạn</th>
                <th className="px-6 py-4">Hạn Sử Dụng</th>
                <th className="px-6 py-4 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((dom) => (
                <tr key={dom.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-white flex items-center gap-2">
                      <Globe className="w-4 h-4 text-cyan-400" /> {dom.name}
                    </div>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      NS: {dom.nameservers.join(', ')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" /> {dom.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${dom.autoRenew ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-400'}`}>
                      {dom.autoRenew ? 'Bật' : 'Tắt'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-xs font-mono">
                    <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> {dom.expiryDate}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => alert(`Cấu hình bản ghi DNS (A, CNAME, MX, TXT) cho tên miền: ${dom.name}`)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-cyan-400" /> DNS Records
                      </button>
                      <button 
                        onClick={() => alert(`Cấu hình Nameserver & Khóa Tên Miền cho ${dom.name}`)}
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="Cài đặt tên miền"
                      >
                        <Settings2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
