'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Server, HardDrive, Cpu, Shield, ArrowLeft, 
  Search, Plus, Activity, Power, ExternalLink, CheckCircle2 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface DedicatedServerItem {
  id: string;
  serverName: string;
  datacenter: string;
  rackLocation: string;
  cpu: string;
  ram: string;
  storage: string;
  ipWan: string;
  ipmiIp: string;
  assignedUser: string;
  monthlyCost: number;
  status: 'Online' | 'Maintenance' | 'Offline';
}

export default function AdminDedicatedServersPage() {
  const [servers, setServers] = useState<DedicatedServerItem[]>([]);
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    serverName: '',
    datacenter: 'FPT Tân Thuận (TP.HCM)',
    rackLocation: 'Rack D-04',
    cpu: 'AMD EPYC 9654 (96C/192T)',
    ram: '256GB ECC DDR5',
    storage: '4x 3.84TB NVMe U.2 RAID 10',
    ipWan: '103.142.120.50',
    ipmiIp: '192.168.100.50',
    assignedUser: 'cto@enterprise.vn',
    monthlyCost: 6500000,
  });

  const mockServers: DedicatedServerItem[] = [
    {
      id: 'srv-1',
      serverName: 'HN-DED-EPYC-01',
      datacenter: 'Viettel IDC Hòa Lạc (Hà Nội)',
      rackLocation: 'Rack A-12 / U14',
      cpu: '2x AMD EPYC 9654 (192 Cores)',
      ram: '512GB ECC DDR5 4800MHz',
      storage: '8x 3.84TB NVMe Enterprise (Hardware RAID 10)',
      ipWan: '14.225.254.10',
      ipmiIp: '10.10.12.14',
      assignedUser: 'tech.lead@vng.corp',
      monthlyCost: 14500000,
      status: 'Online',
    },
    {
      id: 'srv-2',
      serverName: 'HCM-DED-XEON-04',
      datacenter: 'FPT Tân Thuận (TP.HCM)',
      rackLocation: 'Rack C-08 / U22',
      cpu: '2x Intel Xeon Gold 6430 (64 Cores)',
      ram: '256GB ECC DDR5',
      storage: '4x 1.92TB NVMe PCIe 4.0',
      ipWan: '103.142.120.25',
      ipmiIp: '10.10.8.22',
      assignedUser: 'cto@fintechnext.vn',
      monthlyCost: 8900000,
      status: 'Online',
    },
    {
      id: 'srv-3',
      serverName: 'HN-DED-GPU-AI-01',
      datacenter: 'VNPT IDC Nam Thăng Long (Hà Nội)',
      rackLocation: 'Rack GPU-02 / U30',
      cpu: 'AMD EPYC 9354 + 4x NVIDIA A100 80GB',
      ram: '512GB ECC DDR5',
      storage: '4x 7.68TB NVMe U.3',
      ipWan: '118.69.180.99',
      ipmiIp: '10.10.30.2',
      assignedUser: 'ai.lab@vietai.org',
      monthlyCost: 45000000,
      status: 'Maintenance',
    },
  ];

  useEffect(() => {
    setServers(mockServers);
  }, []);

  const handleCreateServer = (e: React.FormEvent) => {
    e.preventDefault();
    const newServer: DedicatedServerItem = {
      id: `srv-${Date.now()}`,
      ...formData,
      status: 'Online',
    };

    setServers([newServer, ...servers]);
    setIsCreating(false);
    setSuccess('Đã thêm máy chủ vật lý riêng vào hệ thống quản trị!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const filtered = servers.filter(s => 
    s.serverName.toLowerCase().includes(search.toLowerCase()) || 
    s.datacenter.toLowerCase().includes(search.toLowerCase()) ||
    s.ipWan.includes(search) ||
    s.assignedUser.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Server className="w-6 h-6 text-purple-600" /> Quản Lý Máy Chủ Vật Lý Riêng (Dedicated)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý phần cứng máy chủ riêng, Datacenter Rack, địa chỉ IPMI/iDRAC và gán cho doanh nghiệp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm máy chủ / IP / khách hàng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm"
              />
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm Máy Chủ
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {success}
          </div>
        )}

        {/* Create Modal */}
        {isCreating && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-slate-200 shadow-2xl">
              <h2 className="text-base font-black text-slate-900 mb-4">Khai Báo Máy Chủ Dedicated Mới</h2>
              <form onSubmit={handleCreateServer} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mã Máy Chủ</label>
                    <input
                      type="text"
                      required
                      value={formData.serverName}
                      onChange={e => setFormData({ ...formData, serverName: e.target.value })}
                      placeholder="HN-DED-05"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Vị Trí Rack</label>
                    <input
                      type="text"
                      required
                      value={formData.rackLocation}
                      onChange={e => setFormData({ ...formData, rackLocation: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">IP WAN Công Cộng</label>
                    <input
                      type="text"
                      required
                      value={formData.ipWan}
                      onChange={e => setFormData({ ...formData, ipWan: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">IP IPMI / iDRAC</label>
                    <input
                      type="text"
                      required
                      value={formData.ipmiIp}
                      onChange={e => setFormData({ ...formData, ipmiIp: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cấu Hình CPU &amp; RAM</label>
                  <input
                    type="text"
                    required
                    value={formData.cpu}
                    onChange={e => setFormData({ ...formData, cpu: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Khách Hàng Thuê (Email)</label>
                  <input
                    type="email"
                    required
                    value={formData.assignedUser}
                    onChange={e => setFormData({ ...formData, assignedUser: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-3">
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
                    Lưu Máy Chủ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Server Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {filtered.map((srv) => (
            <div key={srv.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 ${
                    srv.status === 'Online' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${srv.status === 'Online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    {srv.status}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">{srv.rackLocation}</span>
                </div>

                <h3 className="text-base font-black text-slate-900 mb-1">{srv.serverName}</h3>
                <p className="text-xs text-slate-500 mb-4">{srv.datacenter}</p>

                <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">{srv.cpu}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{srv.storage}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500">
                    <span>IP: <strong>{srv.ipWan}</strong></span>
                    <span>•</span>
                    <span>IPMI: <strong>{srv.ipmiIp}</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Khách hàng</div>
                  <div className="font-bold text-slate-800 truncate max-w-[150px]">{srv.assignedUser}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-semibold">Giá thuê/tháng</div>
                  <div className="font-black text-purple-600">{srv.monthlyCost.toLocaleString('vi-VN')} đ</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
