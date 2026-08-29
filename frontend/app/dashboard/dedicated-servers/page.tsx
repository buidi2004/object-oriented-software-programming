'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Cpu, HardDrive, Activity, Power, Terminal, RefreshCw, 
  ShieldCheck, Server, CheckCircle2, AlertTriangle, Plus, 
  ArrowLeft, Settings, Trash2, ArrowRight, Layers, Shield
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface DedicatedServerItem {
  id: string;
  serverName: string;
  ipAddress: string;
  location: string;
  cpuSpec: string;
  ramSpec: string;
  diskSpec: string;
  bandwidth: string;
  status: string;
  powerState: 'Running' | 'Stopped' | 'Restarting';
}

export default function CustomerDedicatedServersPage() {
  const [servers, setServers] = useState<DedicatedServerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Form states
  const [serverName, setServerName] = useState('');
  const [cpuModel, setCpuModel] = useState('2x Intel Xeon Gold 6248R (48 Cores)');
  const [ramGb, setRamGb] = useState('128');
  const [osImage, setOsImage] = useState('Ubuntu 24.04 LTS');

  const fetchServers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dedicated-servers');
      setServers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.warn('Failed to load dedicated servers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handlePowerAction = async (id: string, action: 'reboot' | 'shutdown' | 'poweron') => {
    setActionLoading(`${id}-${action}`);
    try {
      await api.post(`/dedicated-servers/${id}/power`, { action });
      await fetchServers();
    } catch (err) {
      alert(`Lỗi khi gửi lệnh nguồn: ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateServer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/dedicated-servers', {
        serverName: serverName || 'Dell PowerEdge Enterprise',
        cpuModel,
        ramGb: parseInt(ramGb, 10) || 128,
        osImage
      });
      setIsCreateOpen(false);
      setServerName('');
      await fetchServers();
    } catch (err) {
      alert('Lỗi khi khởi tạo Máy Chủ Riêng.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 mb-2 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="p-2.5 rounded-xl bg-slate-900 text-cyan-400 shadow-md">
                <Server className="w-6 h-6" />
              </div>
              Quản Lý Máy Chủ Vật Lý Riêng (Dedicated Servers)
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Hạ tầng phần cứng máy chủ riêng biệt 100% tài nguyên vật lý, kết nối trực tiếp cổng mạng 1Gbps / 10Gbps trong Data Center Tier 3.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchServers}
              className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-cyan-600 transition-colors shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thuê Máy Chủ Riêng Mới
            </button>
          </div>
        </div>

        {/* Server List */}
        {loading && servers.length === 0 ? (
          <div className="p-12 text-center text-slate-600 text-sm flex items-center justify-center gap-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <RefreshCw className="w-5 h-5 animate-spin text-cyan-600" />
            Đang tải danh sách máy chủ vật lý...
          </div>
        ) : servers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mx-auto shadow-sm">
              <Server className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Chưa Có Máy Chủ Vật Lý Nào</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Bắt đầu triển khai máy chủ Bare Metal độc lập với vi xử lý Xeon / EPYC và ổ đĩa NVMe RAID 1 tốc độ cao.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-lg bg-cyan-600 text-white font-bold text-xs"
            >
              Cấp Phát Máy Chủ Ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {servers.map((srv) => (
              <div key={srv.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">{srv.serverName}</h2>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        srv.powerState === 'Running' || srv.status === 'Running'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : srv.powerState === 'Restarting' 
                          ? 'bg-amber-50 text-amber-700 border border-amber-200' 
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <Activity className="w-3 h-3" /> {srv.powerState || srv.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono">
                      IP Chính: <span className="font-bold text-slate-800">{srv.ipAddress}</span> • Data Center: <span className="text-slate-700">{srv.location}</span>
                    </p>
                  </div>

                  {/* Action Controls */}
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/dashboard/dedicated-servers/${srv.id}`}
                      className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-600/20 transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5" /> Quản Lý Máy Chủ <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>

                    <button 
                      onClick={() => handlePowerAction(srv.id, 'reboot')}
                      disabled={!!actionLoading}
                      className="px-3.5 py-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${actionLoading === `${srv.id}-reboot` ? 'animate-spin' : ''}`} /> Reboot
                    </button>

                    <button 
                      onClick={() => handlePowerAction(srv.id, srv.powerState === 'Running' || srv.status === 'Running' ? 'shutdown' : 'poweron')}
                      disabled={!!actionLoading}
                      className={`px-3.5 py-2 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50 ${
                        srv.powerState === 'Running' || srv.status === 'Running'
                          ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200' 
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      <Power className="w-3.5 h-3.5" /> {srv.powerState === 'Running' || srv.status === 'Running' ? 'Tắt Nguồn' : 'Bật Nguồn'}
                    </button>
                  </div>
                </div>

                {/* Hardware Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mb-1"><Cpu className="w-4 h-4 text-cyan-600" /> Vi Xử Lý (CPU)</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{srv.cpuSpec}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mb-1"><Activity className="w-4 h-4 text-indigo-600" /> Bộ Nhớ (RAM)</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">{srv.ramSpec}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mb-1"><HardDrive className="w-4 h-4 text-emerald-600" /> Ổ Cứng (Storage)</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{srv.diskSpec}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5 mb-1"><ShieldCheck className="w-4 h-4 text-amber-600" /> Băng Thông Mạng</div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900">{srv.bandwidth}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Create Dedicated Server */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-600" /> Thuê Máy Chủ Vật Lý Riêng
                </h3>
                <button onClick={() => setIsCreateOpen(false)} className="text-slate-400 hover:text-slate-700">
                  &times;
                </button>
              </div>

              <form onSubmit={handleCreateServer} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Tên Nhận Diện Máy Chủ</label>
                  <input
                    type="text"
                    required
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="VD: Dell PowerEdge R740 Data Center 01"
                    className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase">Cấu Hình Vi Xử Lý (CPU)</label>
                  <select
                    value={cpuModel}
                    onChange={(e) => setCpuModel(e.target.value)}
                    className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="2x Intel Xeon Gold 6248R (48 Cores / 96 Threads)">2x Intel Xeon Gold 6248R (48 Cores / 96 Threads)</option>
                    <option value="AMD EPYC 7763 (64 Cores / 128 Threads)">AMD EPYC 7763 (64 Cores / 128 Threads)</option>
                    <option value="Intel Xeon E-2388G (8 Cores / 16 Threads)">Intel Xeon E-2388G (8 Cores / 16 Threads)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">RAM ECC (GB)</label>
                    <select
                      value={ramGb}
                      onChange={(e) => setRamGb(e.target.value)}
                      className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="64">64 GB ECC</option>
                      <option value="128">128 GB ECC</option>
                      <option value="256">256 GB ECC</option>
                      <option value="512">512 GB ECC</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 uppercase">Hệ Điều Hành</label>
                    <select
                      value={osImage}
                      onChange={(e) => setOsImage(e.target.value)}
                      className="mt-1 w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                      <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS</option>
                      <option value="Debian 12 Bookworm">Debian 12 Bookworm</option>
                      <option value="Rocky Linux 9">Rocky Linux 9</option>
                      <option value="Windows Server 2022">Windows Server 2022</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-cyan-50 text-cyan-900 border border-cyan-200 text-xs">
                  ⚡ Máy chủ sẽ được tự động kích hoạt và cấp phát container mô phỏng Bare Metal tức thì.
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-colors disabled:opacity-50"
                  >
                    {creating && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    Xác Nhận Khởi Tạo
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
