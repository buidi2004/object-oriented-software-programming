'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Server, Play, Power, RefreshCw, Camera, Terminal, Shield, Activity, HardDrive, Wifi, Plus, X, Check } from 'lucide-react';
import { CloudInstance } from '../types';
import { api } from '../lib/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface CloudDashboardProps {
  onClose: () => void;
}

export const CloudDashboard: React.FC<CloudDashboardProps> = ({ onClose }) => {
  const [instances, setInstances] = useState<CloudInstance[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'Connected to CloudHost VN Edge Gateway v3.12',
    'Authenticating root credentials via SSH Key...',
    'Welcome to Ubuntu 24.04 LTS (GNU/Linux 6.8.0-generic x86_64)',
    'System load: 0.24 | Memory usage: 48% | Swap: 0%'
  ]);
  const [commandInput, setCommandInput] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate real-time telemetry chart data
  const [chartData, setChartData] = useState(() => {
    const data = [];
    for (let i = 10; i >= 0; i--) {
      data.push({
        time: `${i * 2}m`,
        cpu: Math.floor(Math.random() * 30) + 20,
        ram: Math.floor(Math.random() * 20) + 40,
        bandwidth: Math.floor(Math.random() * 100) + 150
      });
    }
    return data;
  });

  // Telemetry stream update effect
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/me');
        if (res.data.activeServices) {
          const formattedInstances: CloudInstance[] = res.data.activeServices.map((s: any) => ({
            id: s.id,
            name: s.name,
            ip: s.ip,
            os: s.os,
            cpu: parseInt(s.cpu) || 1,
            ram: parseInt(s.ram) || 1,
            disk: 50,
            status: s.status,
            datacenter: 'VN Edge',
            uptimeDays: s.uptimeDays,
            cpuUsage: 0,
            ramUsage: 0,
            bandwidthMbps: 0
          }));
          setInstances(formattedInstances);
          if (formattedInstances.length > 0) setSelectedId(formattedInstances[0].id);
        }
      } catch (e) {
        console.error('Failed to load dashboard', e);
      }
    };
    fetchDashboard();

    const interval = setInterval(() => {
      setChartData(prev => {
        const nextTime = `${prev.length * 2}m`;
        const updated = [...prev.slice(1), {
          time: nextTime,
          cpu: Math.floor(Math.random() * 35) + 18,
          ram: Math.floor(Math.random() * 15) + 45,
          bandwidth: Math.floor(Math.random() * 120) + 180
        }];
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const activeInstance = instances.find(i => i.id === selectedId);

  const handleTogglePower = (id: string) => {
    setInstances(prev => prev.map(inst => {
      if (inst.id === id) {
        const nextStatus = inst.status === 'running' ? 'stopped' : 'running';
        setActionMessage(`Đã gửi lệnh ${nextStatus === 'running' ? 'Khởi động' : 'Tắt máy'} cho server ${inst.name}`);
        return { ...inst, status: nextStatus };
      }
      return inst;
    }));
    setTimeout(() => setActionMessage(null), 3500);
  };

  const handleReboot = (id: string) => {
    if (!activeInstance) return;
    setInstances(prev => prev.map(inst => {
      if (inst.id === id) {
        return { ...inst, status: 'rebooting' };
      }
      return inst;
    }));
    setActionMessage(`Đang khởi động lại ${activeInstance.name}...`);

    setTimeout(() => {
      setInstances(prev => prev.map(inst => {
        if (inst.id === id) {
          return { ...inst, status: 'running' };
        }
        return inst;
      }));
      setActionMessage(`Server ${activeInstance.name} đã khởi động xong!`);
      setTimeout(() => setActionMessage(null), 3000);
    }, 2500);
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || !activeInstance) return;

    const cmd = commandInput.trim();
    setTerminalLogs(prev => [
      ...prev,
      `root@${activeInstance.name}:~# ${cmd}`,
      cmd === 'htop' ? 'CPU: [|||||||          ] 28% | Mem: [||||||||||||      ] 4.2G/8.0G' :
      cmd === 'docker ps' ? 'CONTAINER ID   IMAGE          COMMAND                  STATUS\n8f9a2b1c3d4e   nginx:alpine   "/docker-entrypoint…"   Up 12 days' :
      `Executed command: ${cmd} (Exit status: 0)`
    ]);
    setCommandInput('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl w-full max-w-6xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                Bảng Điều Khiển Quản Lý Cloud Server
              </h3>
              <p className="text-xs text-slate-400">
                Theo dõi hiệu năng vCPU, RAM, Băng thông & VNC Console
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Action Message Toast */}
        {actionMessage && (
          <div className="bg-cyan-500 text-slate-950 text-xs font-bold px-4 py-2 text-center animate-in fade-in">
            {actionMessage}
          </div>
        )}

        {/* Modal Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Left Sidebar: Instance Selector */}
          <div className="lg:col-span-4 border-r border-slate-800 p-4 space-y-3 bg-slate-900/50">
            <div className="text-xs font-extrabold text-slate-400 uppercase tracking-wider px-2">
              Danh Sách Máy Chủ ({instances.length})
            </div>

            {instances.map((inst) => (
              <div
                key={inst.id}
                onClick={() => setSelectedId(inst.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedId === inst.id
                    ? 'bg-blue-900/30 border-blue-500/80 text-white shadow-lg'
                    : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-white truncate max-w-[180px]">{inst.name}</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    inst.status === 'running' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                    inst.status === 'rebooting' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                    'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${inst.status === 'running' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    {inst.status === 'running' ? 'Đang chạy' : inst.status === 'rebooting' ? 'Đang Reboot' : 'Đã Tắt'}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>IP: {inst.ip}</span>
                  <span>{inst.cpu} vCPU / {inst.ram}GB</span>
                </div>

                <div className="text-[11px] text-slate-500 mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2">
                  <span>{inst.os}</span>
                  <span>Uptime: {inst.uptimeDays} ngày</span>
                </div>
              </div>
            ))}
            {instances.length === 0 && (
              <div className="text-sm text-slate-400 p-4 text-center">Chưa có dịch vụ nào đang chạy.</div>
            )}
          </div>

          {/* Right Main Area: Selected Instance Metrics & Controls */}
          <div className="lg:col-span-8 p-6 space-y-6">
            
            {activeInstance ? (
              <>
                {/* Instance Quick Specs & Power Controls Header */}
            <div className="bg-slate-800/60 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-extrabold text-white">{activeInstance.name}</h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-700 text-cyan-300">
                    {activeInstance.ip}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {activeInstance.os} &bull; {activeInstance.datacenter}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleTogglePower(activeInstance.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeInstance.status === 'running'
                      ? 'bg-rose-600/80 hover:bg-rose-600 text-white'
                      : 'bg-emerald-600/80 hover:bg-emerald-600 text-white'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {activeInstance.status === 'running' ? 'Tắt Máy' : 'Bật Máy'}
                </button>

                <button
                  onClick={() => handleReboot(activeInstance.id)}
                  disabled={activeInstance.status !== 'running'}
                  className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reboot
                </button>

                <button
                  onClick={() => setTerminalOpen(!terminalOpen)}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Terminal className="w-3.5 h-3.5" />
                  Console SSH
                </button>
              </div>
            </div>

            {/* Live Chart: vCPU & RAM Usage */}
            <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Hiệu Năng Real-time (vCPU & Memory)
                </div>
                <div className="flex items-center gap-4 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-cyan-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> CPU (%)
                  </span>
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" /> RAM (%)
                  </span>
                </div>
              </div>

              <div className="h-48 w-full min-w-0">
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Area type="monotone" dataKey="cpu" stroke="#22d3ee" fillOpacity={1} fill="url(#colorCpu)" />
                      <Area type="monotone" dataKey="ram" stroke="#818cf8" fillOpacity={1} fill="url(#colorRam)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-xs">Đang tải biểu đồ...</div>
                )}
              </div>
            </div>

            {/* Interactive Terminal Box */}
            {terminalOpen && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-emerald-400 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400 text-[11px]">
                  <span>VNC Console - root@{activeInstance?.ip}</span>
                  <button onClick={() => setTerminalOpen(false)} className="hover:text-white">Đóng</button>
                </div>

                <div className="h-32 overflow-y-auto space-y-1 scrollbar-thin">
                  {terminalLogs.map((log, lIdx) => (
                    <div key={lIdx} className="whitespace-pre-wrap">{log}</div>
                  ))}
                </div>

                <form onSubmit={handleTerminalSubmit} className="mt-3 flex items-center gap-2 pt-2 border-t border-slate-800">
                  <span className="text-cyan-400">root@cloudhost:~#</span>
                  <input
                    type="text"
                    value={commandInput}
                    onChange={(e) => setCommandInput(e.target.value)}
                    placeholder="Gõ lệnh (VD: htop, docker ps, uptime)..."
                    className="flex-1 bg-transparent border-none text-white focus:outline-none"
                  />
                </form>
              </div>
            )}
            </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
                <Server className="w-16 h-16 opacity-20" />
                <p>Vui lòng chọn một máy chủ để xem chi tiết.</p>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
