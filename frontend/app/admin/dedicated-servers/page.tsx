'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Server, HardDrive, Cpu, Shield, ArrowLeft, 
  Search, Plus, Activity, Power, ExternalLink, CheckCircle2,
  Trash2, Edit2, AlertCircle, RefreshCw, X
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
  const [editingServer, setEditingServer] = useState<DedicatedServerItem | null>(null);

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
    status: 'Online' as 'Online' | 'Maintenance' | 'Offline'
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialServers: DedicatedServerItem[] = [
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
    fetchServers();
  }, []);

  const fetchServers = async () => {
    try {
      const res = await api.get('/dedicated-servers');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setServers(res.data.map((s: any) => ({
          id: s.id,
          serverName: s.serverName,
          datacenter: s.location || 'Viettel IDC Song Day (Ha Noi)',
          rackLocation: 'Rack A-12 / U14',
          cpu: s.cpuSpec || '2x Intel Xeon Gold 6248R',
          ram: s.ramSpec || '128 GB DDR4 ECC Reg',
          storage: s.diskSpec || '2x 1.92TB NVMe Enterprise RAID 1',
          ipWan: s.ipAddress || '103.142.120.50',
          ipmiIp: '10.10.12.14',
          assignedUser: 'admin@cloudhost.vn',
          monthlyCost: 6500000,
          status: (s.status === 'Running' || s.status === 'Online') ? 'Online' : (s.status === 'Maintenance' ? 'Maintenance' : 'Offline')
        })));
      } else {
        setServers(initialServers);
      }
    } catch {
      setServers(initialServers);
    }
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/dedicated-servers', {
        serverName: formData.serverName,
        cpuModel: formData.cpu,
        ramGb: parseInt(formData.ram) || 128,
        osImage: 'Ubuntu 24.04 LTS'
      });
      showToast('Đã thêm máy chủ vật lý riêng vào hệ thống!');
      setIsCreating(false);
      fetchServers();
    } catch {
      showToast('Lỗi khi thêm máy chủ', 'error');
    }
  };

  const handleOpenEdit = (srv: DedicatedServerItem) => {
    setEditingServer(srv);
    setFormData({
      serverName: srv.serverName,
      datacenter: srv.datacenter,
      rackLocation: srv.rackLocation,
      cpu: srv.cpu,
      ram: srv.ram,
      storage: srv.storage,
      ipWan: srv.ipWan,
      ipmiIp: srv.ipmiIp,
      assignedUser: srv.assignedUser,
      monthlyCost: srv.monthlyCost,
      status: srv.status
    });
  };

  const handleUpdateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingServer) return;

    try {
      await api.put(`/dedicated-servers/${editingServer.id}`, {
        serverName: formData.serverName,
        cpuModel: formData.cpu,
        status: formData.status
      });
      setEditingServer(null);
      showToast('Đã cập nhật thông tin máy chủ thành công!');
      fetchServers();
    } catch {
      showToast('Lỗi khi cập nhật máy chủ', 'error');
    }
  };

  const handleToggleStatus = async (id: string) => {
    const statusCycle: Array<DedicatedServerItem['status']> = ['Online', 'Maintenance', 'Offline'];
    const srv = servers.find(s => s.id === id);
    if (!srv) return;
    const nextIdx = (statusCycle.indexOf(srv.status) + 1) % statusCycle.length;
    const nextStatus = statusCycle[nextIdx];
    try {
      await api.put(`/dedicated-servers/${id}`, { status: nextStatus });
      showToast(`Đã chuyển trạng thái máy chủ thành ${nextStatus}`);
      fetchServers();
    } catch {
      showToast('Lỗi khi đổi trạng thái', 'error');
    }
  };

  const handleDeleteServer = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa máy chủ ${name}?`)) return;
    try {
      await api.delete(`/dedicated-servers/${id}`);
      showToast(`Đã xóa máy chủ ${name}!`);
      fetchServers();
    } catch {
      showToast('Lỗi khi xóa máy chủ', 'error');
    }
  };

  const filtered = servers.filter(s => 
    s.serverName.toLowerCase().includes(search.toLowerCase()) || 
    s.datacenter.toLowerCase().includes(search.toLowerCase()) ||
    s.ipWan.includes(search) ||
    s.assignedUser.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
            </Link>
            <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
              <Server className="w-6 h-6 text-purple-600" /> Quản Lý Máy Chủ Vật Lý Riêng (Dedicated)
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Quản lý phần cứng máy chủ riêng, Datacenter Rack, địa chỉ IPMI/iDRAC và gán cho doanh nghiệp.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm máy chủ / IP / khách hàng..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 pr-4 py-2.5 rounded bg-[#1E293B] bg-opacity-70 backdrop-blur-md border border-white/10 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-sm w-64"
              />
            </div>
            <button
              onClick={() => {
                setFormData({
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
                  status: 'Online'
                });
                setIsCreating(true);
              }}
              className="px-4 py-2.5 rounded bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm Máy Chủ
            </button>
          </div>
        </div>

        {/* Create / Edit Modal */}
        {(isCreating || editingServer) && (
          <div className="fixed inset-0 bg-[#1E293B] bg-opacity-70 backdrop-blur-md/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg p-6 sm:p-8 max-w-lg w-full border border-white/10 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black text-white">
                  {editingServer ? 'Chỉnh Sửa Máy Chủ Dedicated' : 'Khai Báo Máy Chủ Dedicated Mới'}
                </h2>
                <button 
                  onClick={() => { setIsCreating(false); setEditingServer(null); }}
                  className="p-1.5 text-slate-500 hover:text-slate-500 rounded-sm hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingServer ? handleUpdateServer : handleCreateServer} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Mã Máy Chủ</label>
                    <input
                      type="text"
                      required
                      value={formData.serverName}
                      onChange={e => setFormData({ ...formData, serverName: e.target.value })}
                      placeholder="HN-DED-05"
                      className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Vị Trí Rack</label>
                    <input
                      type="text"
                      required
                      value={formData.rackLocation}
                      onChange={e => setFormData({ ...formData, rackLocation: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">IP WAN Công Cộng</label>
                    <input
                      type="text"
                      required
                      value={formData.ipWan}
                      onChange={e => setFormData({ ...formData, ipWan: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">IP IPMI / iDRAC</label>
                    <input
                      type="text"
                      required
                      value={formData.ipmiIp}
                      onChange={e => setFormData({ ...formData, ipmiIp: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Trung Tâm Dữ Liệu</label>
                  <input
                    type="text"
                    required
                    value={formData.datacenter}
                    onChange={e => setFormData({ ...formData, datacenter: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Cấu Hình CPU</label>
                    <input
                      type="text"
                      required
                      value={formData.cpu}
                      onChange={e => setFormData({ ...formData, cpu: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Dung Lượng RAM</label>
                    <input
                      type="text"
                      required
                      value={formData.ram}
                      onChange={e => setFormData({ ...formData, ram: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">Ổ Cứng Lưu Trữ</label>
                  <input
                    type="text"
                    required
                    value={formData.storage}
                    onChange={e => setFormData({ ...formData, storage: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Khách Hàng Thuê</label>
                    <input
                      type="email"
                      required
                      value={formData.assignedUser}
                      onChange={e => setFormData({ ...formData, assignedUser: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1">Giá Thuê / Tháng (VNĐ)</label>
                    <input
                      type="number"
                      required
                      value={formData.monthlyCost}
                      onChange={e => setFormData({ ...formData, monthlyCost: Number(e.target.value) })}
                      className="w-full px-3 py-2 text-xs rounded border border-white/10 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => { setIsCreating(false); setEditingServer(null); }}
                    className="px-4 py-2.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md"
                  >
                    {editingServer ? 'Lưu Thay Đổi' : 'Lưu Máy Chủ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Server Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {filtered.map((srv) => (
            <div key={srv.id} className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg p-6 border border-white/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => handleToggleStatus(srv.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity ${
                      srv.status === 'Online' ? 'bg-emerald-50 text-emerald-700' :
                      srv.status === 'Maintenance' ? 'bg-amber-50 text-amber-700' :
                      'bg-rose-50 text-rose-700'
                    }`}
                    title="Click để đổi trạng thái"
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      srv.status === 'Online' ? 'bg-emerald-500 animate-pulse' :
                      srv.status === 'Maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                    }`} />
                    {srv.status}
                  </button>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(srv)}
                      className="p-1.5 text-slate-500 hover:text-[#1F1F1F] hover:bg-blue-900/30 rounded-sm transition-colors"
                      title="Chỉnh sửa máy chủ"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteServer(srv.id, srv.serverName)}
                      className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-sm transition-colors"
                      title="Xóa máy chủ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-black text-white mb-1">{srv.serverName}</h3>
                <p className="text-xs text-slate-500 mb-4">{srv.datacenter} • <span className="font-mono">{srv.rackLocation}</span></p>

                <div className="space-y-2 text-xs text-slate-500 bg-[#0F172A] p-3.5 rounded-md mb-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span className="truncate">{srv.cpu}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-3.5 h-3.5 text-[#1F1F1F] shrink-0" />
                    <span className="truncate">{srv.storage} ({srv.ram})</span>
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
                  <div className="text-[10px] text-slate-500 font-semibold">Khách hàng</div>
                  <div className="font-bold text-slate-100 truncate max-w-[140px]">{srv.assignedUser}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-semibold">Giá thuê/tháng</div>
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
