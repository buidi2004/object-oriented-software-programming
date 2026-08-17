'use client';

import React, { useState, useEffect } from 'react';
import { 
  Server, 
  ExternalLink, 
  RefreshCw, 
  HardDrive, 
  Activity, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Globe, 
  Key,
  FolderLock
} from 'lucide-react';

interface HostingAccount {
  id: string;
  domain: string;
  planName: string;
  diskUsage: string;
  bandwidthUsage: string;
  status: string;
  ipAddress: string;
  createdAt: string;
}

export default function HostingManagementPage() {
  const [accounts, setAccounts] = useState<HostingAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('Pro NVMe Hosting');

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5053/api/hosting/me', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(Array.isArray(data) ? data : []);
      } else {
        // Fallback default sample hosting account
        setAccounts([
          {
            id: 'host-01',
            domain: 'mywebsite.vn',
            planName: 'Cloud NVMe Hosting Business',
            diskUsage: '3.4 GB / 20 GB',
            bandwidthUsage: '45 GB / Unlimited',
            status: 'Active',
            ipAddress: '103.145.62.10',
            createdAt: '2026-01-15'
          }
        ]);
      }
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain) return;

    const newAcc: HostingAccount = {
      id: `host-${Date.now()}`,
      domain: newDomain,
      planName: selectedPlan,
      diskUsage: '0.1 GB / 20 GB',
      bandwidthUsage: '0 GB / Unlimited',
      status: 'Active',
      ipAddress: '103.145.62.11',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAccounts([newAcc, ...accounts]);
    setShowModal(false);
    setNewDomain('');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" /> Quản Lý Shared Web Hosting (cPanel / DirectAdmin)
          </h1>
          <p className="text-sm text-slate-400">
            Quản lý các gói lưu trữ web tốc độ cao với ổ cứng NVMe Enterprise và chứng chỉ SSL miễn phí.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAccounts}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all text-sm"
          >
            <Plus className="w-4 h-4" /> Đăng Ký Hosting Mới
          </button>
        </div>
      </div>

      {/* Hosting Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((acc) => (
          <div key={acc.id} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-5 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                  <CheckCircle2 className="w-3 h-3" /> {acc.status}
                </span>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-cyan-400" /> {acc.domain}
                </h3>
                <p className="text-xs text-slate-400">{acc.planName}</p>
              </div>
            </div>

            <div className="space-y-3 py-3 border-y border-slate-800/80 text-sm">
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 text-xs"><HardDrive className="w-3.5 h-3.5" /> Dung lượng đĩa:</span>
                <span className="font-semibold text-white text-xs">{acc.diskUsage}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 text-xs"><Activity className="w-3.5 h-3.5" /> Băng thông tháng:</span>
                <span className="font-semibold text-white text-xs">{acc.bandwidthUsage}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1.5 text-slate-400 text-xs"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Địa chỉ IP Hosting:</span>
                <span className="font-mono text-cyan-400 text-xs">{acc.ipAddress}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <a 
                href={`https://${acc.domain}:2083`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Vào cPanel
              </a>
              <button 
                onClick={() => alert(`Thông tin FTP & Database cho tên miền: ${acc.domain}\nServer: ${acc.ipAddress}\nPort: 21`)}
                className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-cyan-500/20"
              >
                <Key className="w-3.5 h-3.5" /> Thông tin FTP
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Đăng Ký Hosting */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FolderLock className="w-5 h-5 text-cyan-400" /> Khởi Tạo Web Hosting Mới
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Tên miền chính (Primary Domain)</label>
                <input 
                  type="text" 
                  required
                  placeholder="domaincuaban.vn"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Gói dịch vụ lưu trữ</label>
                <select 
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-cyan-500 text-sm"
                >
                  <option value="Cloud NVMe Starter (5GB)">Cloud NVMe Starter (5GB SSD) - 49.000đ/th</option>
                  <option value="Cloud NVMe Business (20GB)">Cloud NVMe Business (20GB NVMe) - 149.000đ/th</option>
                  <option value="Cloud NVMe Ultimate (50GB)">Cloud NVMe Ultimate (50GB NVMe) - 299.000đ/th</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-sm font-semibold hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-sm hover:bg-cyan-400"
                >
                  Tạo Dịch Vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
