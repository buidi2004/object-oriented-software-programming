'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as signalR from '@microsoft/signalr';
import {
  Server, Activity, Cpu, MemoryStick, HardDrive, Terminal,
  Play, Square, RefreshCw, ArrowLeft, Clock, Wifi, WifiOff,
  Shield, Zap, AlertCircle, CheckCircle2, XCircle, Loader2, X,
  Copy, Check, Key, RotateCcw, Camera, Globe, ArrowDown, ArrowUp, Lock
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

interface VpsStats {
  vpsId: string;
  status: string;
  cpuUsagePercent: number;
  cpuCores: number;
  ramUsedMb: number;
  ramLimitMb: number;
  ramUsagePercent: number;
  diskUsedGb: number;
  diskTotalGb: number;
  diskUsagePercent: number;
  networkRxKbps: number;
  networkTxKbps: number;
  ipAddress: string;
  sshPort: number;
  sshCommand: string;
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
  const [stats, setStats] = useState<VpsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dockerHealth, setDockerHealth] = useState<boolean | null>(null);
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [copiedSsh, setCopiedSsh] = useState(false);

  // Modals state
  const [showRebuildModal, setShowRebuildModal] = useState(false);
  const [selectedOs, setSelectedOs] = useState('Ubuntu 24.04 LTS');
  const [isRebuilding, setIsRebuilding] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newRootPassword, setNewRootPassword] = useState('');
  const [isResettingPass, setIsResettingPass] = useState(false);
  const [generatedPass, setGeneratedPass] = useState<string | null>(null);

  const [showSnapshotModal, setShowSnapshotModal] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

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
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleOutput]);

  useEffect(() => {
    if (selected?.id) {
      fetchStats(selected.id);
      const interval = setInterval(() => {
        if (selected?.id && selected.status === 'Running') {
          fetchStats(selected.id);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [selected?.id, selected?.status]);

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

  const fetchStats = async (id: string) => {
    try {
      const res = await api.get(`/vpsinstances/${id}/stats`);
      setStats(res.data);
    } catch {
      // Fallback
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
        setConsoleOutput(prev => [...prev, '✓ Connected successfully. Type Linux commands below.']);
      })
      .catch((err: any) => {
        if (err?.name === 'AbortError' || err?.message?.includes('stopped during negotiation')) {
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
      case 'Provisioning': return { label: 'Đang khởi tạo', color: 'bg-blue-500', textColor: 'text-blue-700', bgColor: 'bg-blue-50', icon: Loader2 };
      case 'Failed': return { label: 'Lỗi', color: 'bg-red-500', textColor: 'text-red-700', bgColor: 'bg-red-50', icon: XCircle };
      case 'Terminated': return { label: 'Đã hủy', color: 'bg-red-800', textColor: 'text-red-800', bgColor: 'bg-red-50', icon: XCircle };
      default: return { label: status, color: 'bg-amber-500', textColor: 'text-amber-700', bgColor: 'bg-amber-50', icon: AlertCircle };
    }
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setActionToast({ type, message });
    setTimeout(() => setActionToast(null), 5000);
  };

  const actionLabels: Record<string, string> = {
    start: 'khởi động',
    stop: 'dừng',
    restart: 'khởi động lại'
  };

  const [actionLoading, setActionLoading] = useState<'start' | 'stop' | 'restart' | null>(null);

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!selected || actionLoading) return;

    if (selected.status === 'Terminated') {
      showToast('error', 'VPS này đã bị hủy, không thể thực hiện thao tác.');
      return;
    }

    setActionLoading(action);
    setActionToast(null);

    const previousStatus = selected.status;
    setSelected(prev => prev ? { ...prev, status: 'Provisioning' } : null);
    setInstances(prev => prev.map(item => item.id === selected.id ? { ...item, status: 'Provisioning' } : item));

    try {
      await api.post(`/vpsinstances/${selected.id}/${action}`);
      const res = await api.get('/vpsinstances');
      setInstances(res.data);
      const updated = res.data.find((v: VpsInstance) => v.id === selected.id);
      if (updated) setSelected(updated);
      showToast('success', `Đã ${actionLabels[action]} VPS thành công!`);
    } catch (err: any) {
      setSelected(prev => prev ? { ...prev, status: previousStatus } : null);
      setInstances(prev => prev.map(item => item.id === selected.id ? { ...item, status: previousStatus } : item));
      const backendMsg = err?.response?.data?.detail || err?.response?.data?.message || err?.response?.data;
      showToast('error', typeof backendMsg === 'string' ? backendMsg : `Lỗi khi ${actionLabels[action]} VPS.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopySsh = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSsh(true);
    setTimeout(() => setCopiedSsh(false), 2000);
  };

  const handleRebuildOs = async () => {
    if (!selected) return;
    setIsRebuilding(true);
    try {
      const res = await api.post(`/vpsinstances/${selected.id}/rebuild`, { osName: selectedOs });
      showToast('success', res.data.message || 'Cài lại Hệ điều hành thành công!');
      setShowRebuildModal(false);
      fetchInstances();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Lỗi khi cài lại hệ điều hành');
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selected) return;
    setIsResettingPass(true);
    try {
      const res = await api.post(`/vpsinstances/${selected.id}/reset-password`, { newPassword: newRootPassword });
      setGeneratedPass(res.data.newPassword);
      showToast('success', 'Đổi mật khẩu Root thành công!');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsResettingPass(false);
    }
  };

  const handleCreateSnapshot = async () => {
    if (!selected) return;
    setIsCreatingSnapshot(true);
    try {
      await api.post(`/vpsinstances/${selected.id}/snapshots`, { name: snapshotName });
      showToast('success', 'Đã tạo Snapshot tức thì thành công!');
      setShowSnapshotModal(false);
      setSnapshotName('');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Lỗi khi tạo Snapshot');
    } finally {
      setIsCreatingSnapshot(false);
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
      {/* Toast Notification */}
      {actionToast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md px-4 py-3 rounded-xl shadow-lg border flex items-start gap-3 animate-in slide-in-from-top-2 transition-all ${
          actionToast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {actionToast.type === 'success' 
            ? <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          }
          <div className="flex-1">
            <p className="text-sm font-semibold">{actionToast.type === 'success' ? 'Thành công' : 'Lỗi'}</p>
            <p className="text-xs mt-0.5 opacity-90">{actionToast.message}</p>
          </div>
          <button onClick={() => setActionToast(null)} className="flex-shrink-0 opacity-60 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-600 flex items-center justify-center text-white">
              <Terminal className="w-5 h-5" />
            </div>
            Quản lý VPS
          </h1>
          <p className="text-slate-500 mt-1">Quản lý, theo dõi tài nguyên realtime và điều khiển Cloud Server của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${dockerHealth ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {dockerHealth ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            Docker {dockerHealth ? 'Online' : 'Offline'}
          </div>
          <button onClick={() => { fetchInstances(); checkDockerHealth(); if (selected) fetchStats(selected.id); }} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Làm mới">
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
                    <span>•</span>
                    <span>{vps.diskGb || 30} GB</span>
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
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
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

                {/* Connection Box (IP & SSH) */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Globe className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold">IPv4 Public:</span>
                    <span className="font-mono bg-white px-2 py-0.5 rounded border text-slate-900 font-bold">{stats?.ipAddress || '103.145.63.12'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-mono text-xs bg-slate-800 text-slate-200 px-3 py-1.5 rounded-lg select-all">
                      {stats?.sshCommand || `ssh root@103.145.63.12 -p 2222`}
                    </span>
                    <button
                      onClick={() => handleCopySsh(stats?.sshCommand || `ssh root@103.145.63.12 -p 2222`)}
                      className="p-1.5 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                      title="Copy SSH Command"
                    >
                      {copiedSsh ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* REAL-TIME LIVE METRICS GAUGES */}
                <div className="p-5 bg-white border-b border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-600" /> Giám sát tài nguyên thời gian thực (Real-time Metrics)
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live polling 4s
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* CPU Live Metric */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-blue-600" /> CPU Load
                        </span>
                        <span className="text-xs font-black text-slate-900 font-mono">{stats?.cpuUsagePercent ?? 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            (stats?.cpuUsagePercent ?? 0) > 80 ? 'bg-red-500' : (stats?.cpuUsagePercent ?? 0) > 50 ? 'bg-amber-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${Math.min(stats?.cpuUsagePercent ?? 0, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{selected.cpuCores} Cores phân bổ</p>
                    </div>

                    {/* RAM Live Metric */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <MemoryStick className="w-3.5 h-3.5 text-indigo-600" /> RAM Memory
                        </span>
                        <span className="text-xs font-black text-slate-900 font-mono">{stats?.ramUsagePercent ?? 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-500"
                          style={{ width: `${Math.min(stats?.ramUsagePercent ?? 0, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{stats?.ramUsedMb ?? 0} MB / {selected.ramMb} MB</p>
                    </div>

                    {/* SSD Live Metric */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <HardDrive className="w-3.5 h-3.5 text-emerald-600" /> NVMe Disk
                        </span>
                        <span className="text-xs font-black text-slate-900 font-mono">{stats?.diskUsagePercent ?? 0}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-600 transition-all duration-500"
                          style={{ width: `${Math.min(stats?.diskUsagePercent ?? 0, 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">{stats?.diskUsedGb ?? 0} GB / {selected.diskGb || 30} GB</p>
                    </div>

                    {/* Network Live Metric */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Wifi className="w-3.5 h-3.5 text-purple-600" /> Network I/O
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 font-mono">KB/s</span>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono font-bold mt-1">
                        <span className="text-blue-600 flex items-center gap-0.5"><ArrowDown className="w-3 h-3" /> {stats?.networkRxKbps ?? 0}</span>
                        <span className="text-emerald-600 flex items-center gap-0.5"><ArrowUp className="w-3 h-3" /> {stats?.networkTxKbps ?? 0}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">Uptime: {formatUptime(selected.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions (LifeCycle + Rebuild + Password + Snapshot) */}
                <div className="p-5 bg-white">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" /> Bảng điều khiển tác vụ
                  </h3>
                  
                  <div className="flex flex-wrap items-center gap-2.5">
                    {selected.status === 'Running' ? (
                      <button 
                        onClick={() => handleAction('stop')}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-2 px-3.5 py-2 bg-red-50 text-red-700 rounded-xl font-bold text-xs hover:bg-red-100 transition-colors"
                      >
                        {actionLoading === 'stop' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Square className="w-3.5 h-3.5" />}
                        <span>Dừng (Stop)</span>
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleAction('start')}
                        disabled={actionLoading !== null}
                        className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-xs hover:bg-emerald-100 transition-colors"
                      >
                        {actionLoading === 'start' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                        <span>Bật (Start)</span>
                      </button>
                    )}

                    <button 
                      onClick={() => handleAction('restart')}
                      disabled={selected.status !== 'Running' || actionLoading !== null}
                      className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 text-amber-700 rounded-xl font-bold text-xs hover:bg-amber-100 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === 'restart' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      <span>Khởi động lại</span>
                    </button>

                    <button
                      onClick={() => setShowRebuildModal(true)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
                      <span>Cài lại OS (Rebuild)</span>
                    </button>

                    <button
                      onClick={() => { setGeneratedPass(null); setNewRootPassword(''); setShowPasswordModal(true); }}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Key className="w-3.5 h-3.5 text-amber-600" />
                      <span>Đổi Mật khẩu Root</span>
                    </button>

                    <button
                      onClick={() => setShowSnapshotModal(true)}
                      className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors"
                    >
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tạo Snapshot</span>
                    </button>

                    <button
                      onClick={() => setIsFullTerminalOpen(true)}
                      disabled={selected.status !== 'Running'}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-xs hover:bg-blue-700 disabled:opacity-50 transition-colors ml-auto shadow-sm"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Full Terminal</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Console / Interactive Terminal */}
              <div className="bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-red-500" />
                      <span className="w-3 h-3 rounded-full bg-amber-500" />
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono ml-2">
                      root@{selected.containerName?.split('-').slice(0, 3).join('-') || 'cloud-vps'}
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

                <div ref={consoleRef} className="p-4 font-mono text-xs text-emerald-400 bg-slate-950 h-52 overflow-y-auto space-y-1">
                  {consoleOutput.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap leading-relaxed">{line}</div>
                  ))}
                  {isExecRunning && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Đang thực thi lệnh...</span>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-slate-800 border-t border-slate-700 flex items-center gap-2">
                  <span className="text-emerald-400 font-mono text-sm">$</span>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={!isTerminalConnected || isExecRunning}
                    placeholder="Nhập lệnh bash (ví dụ: uname -a, top, free -m, df -h)..."
                    className="flex-1 bg-slate-900 text-slate-100 text-xs font-mono px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    onClick={handleExecCommand}
                    disabled={!isTerminalConnected || isExecRunning || !command.trim()}
                    className="px-3 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                  >
                    Chạy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: REBUILD / REINSTALL OS */}
      {showRebuildModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-blue-600" /> Cài Lại Hệ Điều Hành (Rebuild OS)
              </h3>
              <button onClick={() => setShowRebuildModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Chọn phiên bản Linux để cài đặt lại sạch sẽ cho VPS. <strong className="text-red-600">Lưu ý: Mọi dữ liệu cũ trên ổ đĩa sẽ bị xóa!</strong>
            </p>

            <div className="space-y-2 mb-6">
              {[
                { name: 'Ubuntu 24.04 LTS', desc: 'Khuyên dùng cho Web Server & Docker' },
                { name: 'Ubuntu 22.04 LTS', desc: 'Ổn định, tương thích cao' },
                { name: 'Debian 12 Bookworm', desc: 'Cực kỳ nhẹ và ổn định' },
                { name: 'Alpine Linux 3.20', desc: 'Siêu tối giản (Minimal RAM)' },
                { name: 'Rocky Linux 9', desc: 'Chuẩn Enterprise RHEL' }
              ].map(os => (
                <label 
                  key={os.name} 
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedOs === os.name ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input 
                      type="radio" 
                      name="osChoice" 
                      value={os.name} 
                      checked={selectedOs === os.name} 
                      onChange={() => setSelectedOs(os.name)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-bold text-slate-900">{os.name}</p>
                      <p className="text-[11px] text-slate-500">{os.desc}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowRebuildModal(false)}
                className="px-4 py-2 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleRebuildOs}
                disabled={isRebuilding}
                className="px-5 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isRebuilding ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                <span>Xác nhận Rebuild</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESET ROOT PASSWORD */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-600" /> Đổi Mật Khẩu Root
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedPass ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-emerald-800">Mật khẩu Root mới của bạn:</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="font-mono text-sm font-bold bg-white px-3 py-1.5 rounded-lg border border-emerald-300 text-slate-900 select-all">
                    {generatedPass}
                  </span>
                  <button
                    onClick={() => handleCopySsh(generatedPass)}
                    className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    title="Copy mật khẩu"
                  >
                    {copiedSsh ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Hãy lưu lại mật khẩu này ngay lập tức.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-4">
                  Nhập mật khẩu mới hoặc để trống để hệ thống tự sinh ngẫu nhiên chuỗi bảo mật 16 ký tự.
                </p>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu mới (Tùy chọn)</label>
                  <input
                    type="password"
                    value={newRootPassword}
                    onChange={(e) => setNewRootPassword(e.target.value)}
                    placeholder="Để trống để tự tạo mật khẩu mạnh..."
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </>
            )}

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-xl"
              >
                {generatedPass ? 'Đóng' : 'Hủy bỏ'}
              </button>
              {!generatedPass && (
                <button 
                  onClick={handleResetPassword}
                  disabled={isResettingPass}
                  className="px-5 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isResettingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  <span>Đổi Mật Khẩu</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INSTANT SNAPSHOT */}
      {showSnapshotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-600" /> Tạo Snapshot Tức Thì
              </h3>
              <button onClick={() => setShowSnapshotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Chụp lại toàn bộ trạng thái đĩa cứng của VPS. Bạn có thể khôi phục lại điểm này bất kỳ lúc nào nếu xảy ra lỗi.
            </p>

            <div className="mb-6">
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên Snapshot</label>
              <input
                type="text"
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.target.value)}
                placeholder="Ví dụ: Truoc_Khi_Cai_Nginx_PHP"
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setShowSnapshotModal(false)}
                className="px-4 py-2 text-slate-600 text-xs font-bold hover:bg-slate-100 rounded-xl"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleCreateSnapshot}
                disabled={isCreatingSnapshot}
                className="px-5 py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isCreatingSnapshot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                <span>Tạo Snapshot</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULL TERMINAL MODAL */}
      <VpsTerminalModal 
        isOpen={isFullTerminalOpen} 
        onClose={() => setIsFullTerminalOpen(false)} 
        vpsInstanceId={selected?.containerId || ''}
      />
    </div>
  );
}
