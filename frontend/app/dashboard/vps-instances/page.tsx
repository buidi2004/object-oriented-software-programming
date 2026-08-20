'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as signalR from '@microsoft/signalr';
import {
  Server, Activity, Cpu, MemoryStick, HardDrive, Terminal,
  Play, Square, RefreshCw, ArrowLeft, Clock, Wifi, WifiOff,
  Shield, Zap, AlertCircle, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { api } from '@/src/lib/api';
import VpsTerminalModal from '@/src/components/VpsTerminalModal';
import { PinServiceButton } from '@/src/components/team-features/PinServiceButton';

interface VpsInstance {
  id: string;
  orderId: string;
  containerName: string;
  containerId: string;
  status: string;
  cpuCores: number;
  ramMb: number;
  diskGb: number;
  planName: string;
  customerEmail: string;
  createdAt: string;
  expiresAt: string;
}

const formatRam = (mb: number) => mb >= 1024 ? `${(mb / 1024).toFixed(0)} GB` : `${mb} MB`;
const formatUptime = (created: string) => {
  const diff = Date.now() - new Date(created).getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
};

export default function VpsInstancesPage() {
  const [instances, setInstances] = useState<VpsInstance[]>([]);
  const [selected, setSelected] = useState<VpsInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dockerHealth, setDockerHealth] = useState<boolean | null>(null);
  
  // Terminal state
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [isExecRunning, setIsExecRunning] = useState(false);
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isTerminalConnected, setIsTerminalConnected] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isFullTerminalOpen, setIsFullTerminalOpen] = useState(false);

  useEffect(() => {
    fetchInstances();
    checkDockerHealth();
  }, []);

  useEffect(() => {
    // Scroll to bottom when output changes
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  useEffect(() => {
    if (selected?.containerId) {
      setupTerminal(selected.containerId);
    }
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [selected?.containerId]);

  const fetchInstances = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/vpsinstances');
      setInstances(res.data);
      if (res.data.length > 0 && !selected) {
        setSelected(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch VPS instances', err);
    } finally {
      setIsLoading(false);
    }
  };

  const checkDockerHealth = async () => {
    try {
      const res = await fetch('/api/VpsInstances/health/docker');
      const data = await res.json();
      setDockerHealth(data.available);
    } catch {
      setDockerHealth(false);
    }
  };

  const setupTerminal = (containerId: string) => {
    if (connectionRef.current) {
      connectionRef.current.stop().catch(() => {});
      connectionRef.current = null;
    }

    setConsoleOutput([`Connecting to terminal for ${containerId.substring(0, 12)}...`]);
    setIsTerminalConnected(false);

    const token = localStorage.getItem('accessToken');
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/hubs/vps-terminal` : '/hubs/vps-terminal', {
        accessTokenFactory: () => token || ''
      })
      .configureLogging(signalR.LogLevel.None)
      .withAutomaticReconnect()
      .build();

    connection.on('ReceiveOutput', (output: string) => {
      setConsoleOutput(prev => [...prev, output]);
      setIsExecRunning(false);
    });

    connection.start()
      .then(() => {
        setIsTerminalConnected(true);
        setConsoleOutput(prev => [...prev, '✓ Connected successfully.']);
      })
      .catch((err: any) => {
        if (err?.name === 'AbortError' || err?.message?.includes('stopped during negotiation')) {
          // Clean unmount during negotiation, ignore
          return;
        }
        setConsoleOutput(prev => [...prev, '✗ Failed to connect to VPS terminal.']);
      });

    connectionRef.current = connection;
    setHubConnection(connection);
  };

  const handleExecCommand = async () => {
    const activeConn = connectionRef.current || hubConnection;
    if (!command.trim() || !selected?.containerId || !activeConn || !isTerminalConnected) return;
    setIsExecRunning(true);
    const cmd = command.trim();
    setConsoleOutput(prev => [...prev, `root@vps:~# ${cmd}`]);
    setCommand('');

    try {
      await activeConn.invoke('SendCommand', selected.containerId, cmd);
    } catch (err) {
      console.error('Failed to send command:', err);
      setConsoleOutput(prev => [...prev, `✗ Error: Failed to execute command`]);
      setIsExecRunning(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecCommand();
    }
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'Running': return { label: 'Đang chạy', color: 'bg-emerald-500', textColor: 'text-emerald-700', bgColor: 'bg-emerald-50', icon: CheckCircle2 };
      case 'Stopped': return { label: 'Đã dừng', color: 'bg-slate-500', textColor: 'text-slate-700', bgColor: 'bg-slate-50', icon: Square };
      case 'Provisioning': return { label: 'Đang tạo', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', icon: Loader2 };
      case 'Failed': return { label: 'Lỗi', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', icon: XCircle };
      default: return { label: status, color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50', icon: AlertCircle };
    }
  };

  const [actionLoading, setActionLoading] = useState<'start' | 'stop' | 'restart' | null>(null);

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!selected || actionLoading) return;
    setActionLoading(action);

    // Optimistic UI update: instantly update status in real-time without spinning or freezing the page
    const previousStatus = selected.status;
    const nextStatus = action === 'stop' ? 'Stopped' : 'Running';

    setSelected(prev => prev ? { ...prev, status: nextStatus } : null);
    setInstances(prev => prev.map(item => item.id === selected.id ? { ...item, status: nextStatus } : item));

    try {
      await api.post(`/vpsinstances/${selected.id}/${action}`);
      const res = await api.get('/vpsinstances');
      setInstances(res.data);
      const updated = res.data.find((v: VpsInstance) => v.id === selected.id);
      if (updated) setSelected(updated);
    } catch (err) {
      console.error(`Failed to ${action} VPS:`, err);
      // Revert optimistic update on failure
      setSelected(prev => prev ? { ...prev, status: previousStatus } : null);
      setInstances(prev => prev.map(item => item.id === selected.id ? { ...item, status: previousStatus } : item));
      alert(`Lỗi khi ${action} VPS.`);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white">
              <Terminal className="w-5 h-5" />
            </div>
            Quản lý VPS
          </h1>
          <p className="text-slate-500 mt-1">Quản lý và điều khiển máy chủ Cloud Server của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${dockerHealth ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {dockerHealth ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            Docker {dockerHealth ? 'Online' : 'Offline'}
          </div>
          <button onClick={() => { fetchInstances(); checkDockerHealth(); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {instances.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Server className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-900 mb-2">Chưa có VPS nào</h3>
          <p className="text-slate-500 mb-6">Hãy mua dịch vụ Cloud VPS để bắt đầu sử dụng bảng điều khiển.</p>
          <Link href="/services/cloud-vps" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
            <Server className="w-4 h-4" /> Mua VPS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: VPS List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">Danh sách máy chủ ({instances.length})</h3>
            {instances.map((vps) => {
              const meta = getStatusMeta(vps.status);
              const isActive = selected?.id === vps.id;
              return (
                <button
                  key={vps.id}
                  onClick={() => setSelected(vps)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-blue-50 border-blue-300 shadow-md shadow-blue-500/10' 
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-bold text-slate-900 text-sm truncate">{vps.planName || vps.containerName}</h4>
                    <span className={`w-2.5 h-2.5 rounded-full ${meta.color} shrink-0 mt-1`} />
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>{vps.cpuCores} vCPU</span>
                    <span>•</span>
                    <span>{formatRam(vps.ramMb)}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-mono truncate">{vps.containerId?.substring(0, 12)}</p>
                </button>
              );
            })}
          </div>

          {/* Right: Detail Panel */}
          {selected && (
            <div className="lg:col-span-2 space-y-6">
              {/* Server Info Header */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black">{selected.planName || selected.containerName}</h2>
                      <p className="text-sm text-slate-400 mt-1 font-mono">{selected.containerId?.substring(0, 12)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <PinServiceButton serviceType="VPS" serviceId={selected.id} displayName={selected.planName || selected.containerName} />
                      {(() => {
                        const meta = getStatusMeta(selected.status);
                        return (
                          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${meta.bgColor} ${meta.textColor}`}>
                            <span className={`w-2 h-2 rounded-full ${meta.color} ${selected.status === 'Running' ? 'animate-pulse' : ''}`} />
                            {meta.label}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Spec Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-slate-100">
                  <div className="p-4 text-center">
                    <Cpu className="w-5 h-5 text-blue-500 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">CPU</p>
                    <p className="text-lg font-black text-slate-900">{selected.cpuCores}</p>
                    <p className="text-[10px] text-slate-400">vCPU Cores</p>
                  </div>
                  <div className="p-4 text-center">
                    <MemoryStick className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">RAM</p>
                    <p className="text-lg font-black text-slate-900">{formatRam(selected.ramMb)}</p>
                    <p className="text-[10px] text-slate-400">Memory</p>
                  </div>
                  <div className="p-4 text-center">
                    <HardDrive className="w-5 h-5 text-emerald-500 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">SSD</p>
                    <p className="text-lg font-black text-slate-900">{selected.diskGb || 'N/A'}</p>
                    <p className="text-[10px] text-slate-400">GB NVMe</p>
                  </div>
                  <div className="p-4 text-center">
                    <Clock className="w-5 h-5 text-amber-500 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">Uptime</p>
                    <p className="text-lg font-black text-slate-900">{formatUptime(selected.createdAt)}</p>
                    <p className="text-[10px] text-slate-400">Active</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-2xl border border-slate-200 p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" /> Hành động nhanh
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selected.status === 'Running' ? (
                    <button 
                      onClick={() => handleAction('stop')}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 rounded-xl font-semibold text-sm hover:bg-red-100 disabled:opacity-60 transition-colors"
                    >
                      {actionLoading === 'stop' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          <span>Đang dừng...</span>
                        </>
                      ) : (
                        <>
                          <Square className="w-4 h-4" />
                          <span>Stop</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction('start')}
                      disabled={actionLoading !== null}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-semibold text-sm hover:bg-emerald-100 disabled:opacity-60 transition-colors"
                    >
                      {actionLoading === 'start' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Đang khởi động...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          <span>Start</span>
                        </>
                      )}
                    </button>
                  )}
                  <button 
                    onClick={() => handleAction('restart')}
                    disabled={selected.status !== 'Running' || actionLoading !== null}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl font-semibold text-sm hover:bg-amber-100 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading === 'restart' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                        <span>Đang khởi động lại...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Restart</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsFullTerminalOpen(true)}
                    disabled={selected.status !== 'Running'}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
                  >
                    <Terminal className="w-4 h-4" />
                    <span>Full Web Terminal</span>
                  </button>
                  <Link
                    href={`/dashboard/vps-instances/${selected.id}`}
                    className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all"
                  >
                    <Activity className="w-4 h-4" /> Quản lý nâng cao
                  </Link>
                </div>
              </div>

              {/* Console */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono ml-2">
                      root@{selected.containerName?.split('-').slice(0, 3).join('-') || 'vps'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTerminalConnected ? (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 text-[10px] font-bold uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" /> Disconnected
                      </span>
                    )}
                  </div>
                </div>
                <div ref={consoleRef} className="p-4 font-mono text-xs sm:text-sm text-green-400 max-h-[280px] overflow-y-auto min-h-[160px] space-y-0.5" id="console-output">
                  {consoleOutput.map((rawLine, i) => {
                    const cleanLine = rawLine.replace(/\x1b\[[0-9;]*m/g, '');
                    const isPrompt = cleanLine.startsWith('root@');
                    const isError = cleanLine.includes('Error:') || cleanLine.includes('Failed') || cleanLine.startsWith('✗');
                    const isSuccess = cleanLine.startsWith('✓') || cleanLine.includes('successfully');
                    return (
                      <pre
                        key={`console-line-${i}`}
                        className={`whitespace-pre-wrap font-mono ${
                          isPrompt
                            ? 'text-cyan-400 font-bold'
                            : isError
                            ? 'text-red-400 font-medium'
                            : isSuccess
                            ? 'text-emerald-400 font-semibold'
                            : 'text-green-300'
                        }`}
                      >
                        {cleanLine}
                      </pre>
                    );
                  })}
                </div>
                <div className="border-t border-slate-700 flex items-center px-4 py-2 gap-2">
                  <span className="text-cyan-400 text-sm font-mono shrink-0">$</span>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isTerminalConnected ? "Nhập lệnh (vd: uptime, free -h, df -h)..." : "Đang kết nối..."}
                    disabled={isExecRunning || !isTerminalConnected}
                    className="flex-1 bg-transparent border-none outline-none text-green-400 font-mono text-sm placeholder-slate-600 disabled:opacity-50"
                    autoFocus
                  />
                  {isExecRunning && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {selected && isFullTerminalOpen && (
        <VpsTerminalModal
          isOpen={isFullTerminalOpen}
          onClose={() => setIsFullTerminalOpen(false)}
          vpsInstanceId={selected.containerId}
        />
      )}
    </div>
  );
}
