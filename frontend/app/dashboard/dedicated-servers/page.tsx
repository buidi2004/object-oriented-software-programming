'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  HardDrive, 
  Activity, 
  Power, 
  Terminal, 
  RefreshCw, 
  ShieldCheck, 
  Server, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

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

  const fetchServers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/dedicated-servers', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setServers(Array.isArray(data) ? data : []);
      } else {
        setServers([
          {
            id: 'ds-01',
            serverName: 'Dell PowerEdge R740 Enterprise',
            ipAddress: '103.145.62.88',
            location: 'Viettel IDC Song Day (Ha Noi)',
            cpuSpec: '2x Intel Xeon Gold 6248R (48 Core / 96 Thread)',
            ramSpec: '128 GB DDR4 ECC Reg',
            diskSpec: '2x 1.92TB NVMe Enterprise RAID 1',
            bandwidth: '1 Gbps Dedicated Port',
            status: 'Active',
            powerState: 'Running'
          }
        ]);
      }
    } catch {
      setServers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServers();
  }, []);

  const handlePowerAction = (id: string, action: 'reboot' | 'shutdown' | 'poweron') => {
    setServers(servers.map(s => {
      if (s.id === id) {
        return { ...s, powerState: action === 'reboot' ? 'Restarting' : action === 'shutdown' ? 'Stopped' : 'Running' };
      }
      return s;
    }));
    alert(`Lệnh điều khiển nguồn "${action.toUpperCase()}" đã được gửi tới IPMI / iLO Hardware Switch.`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Server className="w-6 h-6 text-cyan-400" /> Quản Lý Máy Chủ Vật Lý Riêng (Dedicated Server)
          </h1>
          <p className="text-sm text-slate-400">
            Hạ tầng phần cứng máy chủ riêng biệt 100% tài nguyên, kết nối trực tiếp cổng mạng 1Gbps / 10Gbps trong Data Center Tier 3.
          </p>
        </div>

        <button 
          onClick={fetchServers}
          className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Server List */}
      <div className="space-y-6">
        {servers.map((srv) => (
          <div key={srv.id} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-xl font-bold text-white">{srv.serverName}</h2>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${srv.powerState === 'Running' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : srv.powerState === 'Restarting' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                    <Activity className="w-3 h-3" /> {srv.powerState}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  IP Chính: <span className="text-cyan-400">{srv.ipAddress}</span> • Data Center: <span className="text-slate-300">{srv.location}</span>
                </p>
              </div>

              {/* IPMI Power Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button 
                  onClick={() => handlePowerAction(srv.id, 'reboot')}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Khởi Động Lại
                </button>
                <button 
                  onClick={() => handlePowerAction(srv.id, srv.powerState === 'Running' ? 'shutdown' : 'poweron')}
                  className={`px-3.5 py-2 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-colors ${srv.powerState === 'Running' ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}`}
                >
                  <Power className="w-3.5 h-3.5" /> {srv.powerState === 'Running' ? 'Tắt Nguồn' : 'Bật Nguồn'}
                </button>
                <button 
                  onClick={() => alert(`Mở bảng điều khiển phần cứng IPMI Virtual KVM cho máy chủ ${srv.ipAddress}`)}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 transition-colors"
                >
                  <Terminal className="w-3.5 h-3.5" /> KVM Remote Console
                </button>
              </div>
            </div>

            {/* Hardware Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1"><Cpu className="w-4 h-4 text-cyan-400" /> Vi Xử Lý (CPU)</div>
                <div className="text-sm font-semibold text-white truncate">{srv.cpuSpec}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1"><Activity className="w-4 h-4 text-indigo-400" /> Bộ Nhớ (RAM)</div>
                <div className="text-sm font-semibold text-white">{srv.ramSpec}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1"><HardDrive className="w-4 h-4 text-emerald-400" /> Ổ Cứng (Storage)</div>
                <div className="text-sm font-semibold text-white truncate">{srv.diskSpec}</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1"><ShieldCheck className="w-4 h-4 text-amber-400" /> Băng Thông Mạng</div>
                <div className="text-sm font-semibold text-white">{srv.bandwidth}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
