'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as signalR from '@microsoft/signalr';
import { 
  Server, Terminal, Play, Square, RefreshCw, ArrowLeft, 
  Cpu, MemoryStick, HardDrive, Shield, CheckCircle2, AlertCircle, X, Loader2,
  Copy, Check, Key, RotateCcw, Camera, Globe, ArrowDown, ArrowUp, Activity, Lock, Wifi,
  Eye, EyeOff, Layers, BarChart3, Settings, Sliders, FileText
} from 'lucide-react';
import VpsTerminalModal from '@/src/components/VpsTerminalModal';
import BackupManager from '@/src/components/BackupManager';
import { api } from '@/src/lib/api';

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

export default function VpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [vps, setVps] = useState<any>(null);
  const [stats, setStats] = useState<VpsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const router = useRouter();

  // Tabs
  const [activeTab, setActiveTab] = useState<'overview' | 'graphs' | 'settings' | 'install' | 'tasks' | 'networking' | 'backups'>('overview');
  const [settingsSubTab, setSettingsSubTab] = useState<'hostname' | 'password' | 'config' | 'ssh' | 'vnc'>('password');
  const [installSubTab, setInstallSubTab] = useState<'reinstall' | 'control-panel' | 'recipes' | 'apps'>('reinstall');
  const [graphsSubTab, setGraphsSubTab] = useState<'bandwidth' | 'system'>('bandwidth');

  // Copy & UI state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rootPasswordVal, setRootPasswordVal] = useState('Admin@2026#Secure');

  // Forms
  const [reinstallOs, setReinstallOs] = useState('Ubuntu 24.04 LTS');
  const [reinstallPass, setReinstallPass] = useState('');
  const [reinstallPassConfirm, setReinstallPassConfirm] = useState('');
  const [removeOldSsh, setRemoveOldSsh] = useState(false);
  const [isReinstalling, setIsReinstalling] = useState(false);

  const [newHostname, setNewHostname] = useState('');
  const [settingsNewPass, setSettingsNewPass] = useState('');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Terminal state
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [isExecRunning, setIsExecRunning] = useState(false);
  const [hubConnection, setHubConnection] = useState<signalR.HubConnection | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const [isTerminalConnected, setIsTerminalConnected] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);

  const resolvedParams = use(params);

  const showToast = (type: 'success' | 'error', message: string) => {
    setActionToast({ type, message });
    setTimeout(() => setActionToast(null), 5000);
  };

  useEffect(() => {
    fetchVpsDetail();
    fetchStats();
    const interval = setInterval(() => {
      fetchStats();
    }, 4000);
    return () => clearInterval(interval);
  }, [resolvedParams.id]);

  useEffect(() => {
    if (vps?.containerId) {
      setupTerminal(vps.containerId);
    }
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
    };
  }, [vps?.containerId]);

  const fetchVpsDetail = async () => {
    try {
      const res = await api.get(`/vpsinstances/${resolvedParams.id}`);
      setVps(res.data);
      setNewHostname(res.data.containerName || 'azvps-1786899581');
    } catch (error) {
      console.error('Error fetching VPS details', error);
      router.push('/dashboard/vps-instances');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get(`/vpsinstances/${resolvedParams.id}/stats`);
      setStats(res.data);
    } catch {
      // Ignore
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
    if (!command.trim() || !vps?.containerId || !activeConn || !isTerminalConnected) return;
    setIsExecRunning(true);
    const cmd = command.trim();
    setConsoleOutput(prev => [...prev, `root@${vps.containerName || 'vps'}:~# ${cmd}`]);
    setCommand('');

    try {
      await activeConn.invoke('SendCommand', vps.containerId, cmd);
    } catch (err) {
      console.error('Failed to send command:', err);
      setConsoleOutput(prev => [...prev, `✗ Error: Failed to execute command`]);
      setIsExecRunning(false);
    }
  };

  const [actionLoading, setActionLoading] = useState<'start' | 'stop' | 'restart' | null>(null);

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!vps || actionLoading) return;
    setActionLoading(action);
    try {
      await api.post(`/vpsinstances/${resolvedParams.id}/${action}`);
      await fetchVpsDetail();
      await fetchStats();
      showToast('success', `Đã ${action.toUpperCase()} VPS thành công!`);
    } catch (error: any) {
      showToast('error', error?.response?.data?.message || `Lỗi khi thực hiện thao tác.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleReinstallSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vps) return;
    if (reinstallPass && reinstallPass !== reinstallPassConfirm) {
      showToast('error', 'Mật khẩu xác nhận không khớp!');
      return;
    }
    setIsReinstalling(true);
    try {
      const res = await api.post(`/vpsinstances/${resolvedParams.id}/rebuild`, {
        osName: reinstallOs,
        rootPassword: reinstallPass || undefined
      });
      showToast('success', res.data.message || 'Cài lại Hệ điều hành thành công!');
      if (reinstallPass) setRootPasswordVal(reinstallPass);
      setReinstallPass('');
      setReinstallPassConfirm('');
      fetchVpsDetail();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Lỗi khi cài lại OS');
    } finally {
      setIsReinstalling(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vps || !settingsNewPass) return;
    setIsUpdatingSettings(true);
    try {
      const res = await api.post(`/vpsinstances/${resolvedParams.id}/reset-password`, {
        newPassword: settingsNewPass
      });
      setRootPasswordVal(res.data.newPassword || settingsNewPass);
      setSettingsNewPass('');
      showToast('success', 'Đổi mật khẩu Root thành công!');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setReinstallPass(result);
    setReinstallPassConfirm(result);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1322] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!vps) return null;

  const hostname = vps.containerName || 'azvps-1786899581';
  const ipAddress = stats?.ipAddress || '203.145.46.200';
  const isRunning = vps.status === 'Running' || vps.status === 2;

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-slate-200 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Notification */}
      {actionToast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md px-4 py-3 rounded-xl shadow-2xl border flex items-start gap-3 animate-in slide-in-from-top-2 transition-all ${
          actionToast.type === 'success' 
            ? 'bg-emerald-950 border-emerald-700 text-emerald-200' 
            : 'bg-red-950 border-red-700 text-red-200'
        }`}>
          {actionToast.type === 'success' 
            ? <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
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

      <div className="max-w-6xl mx-auto mb-2">
        <Link href="/dashboard/vps-instances" className="text-xs font-bold text-slate-400 hover:text-blue-400 flex items-center gap-1.5 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách máy chủ
        </Link>
      </div>

      {/* TOP SUMMARY CARD */}
      <div className="max-w-6xl mx-auto bg-[#131b2e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Left Column */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <div className="w-20 h-20 rounded-full bg-slate-800/90 border-2 border-slate-700 flex items-center justify-center text-white shadow-inner">
              <Server className="w-10 h-10 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">{vps.planName || 'Cloud VPS Advanced'}</h2>
              <p className="text-xs text-slate-400 mt-0.5">VPS Giá Rẻ Cao Cấp</p>
            </div>
            <div className="w-full space-y-2 max-w-xs">
              <div className={`w-full py-2 px-4 rounded-lg font-bold text-xs uppercase tracking-wider text-center text-white ${
                isRunning ? 'bg-emerald-600 shadow-lg shadow-emerald-900/30' : 'bg-slate-700'
              }`}>
                {isRunning ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ TẠM DỪNG'}
              </div>
              <button className="w-full py-2 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md">
                <span>⬆</span> Nâng cấp
              </button>
              <button className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md">
                <span>🔁</span> Gia hạn dịch vụ
              </button>
            </div>
          </div>

          {/* Middle & Right Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#0e1526] p-4 rounded-xl border border-slate-800">
              <div>
                <p className="text-slate-400">Chu kỳ thanh toán</p>
                <p className="font-bold text-white mt-1 text-sm">1 tháng</p>
              </div>
              <div>
                <p className="text-slate-400">Ngày hết hạn</p>
                <p className="font-bold text-white mt-1 text-sm">
                  {vps.expiresAt ? new Date(vps.expiresAt).toLocaleDateString('vi-VN') : '16/09/2026'}
                </p>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                <p className="text-slate-400">Phương thức thanh toán</p>
                <p className="font-medium text-slate-200 mt-1">MBBANK Doanh Nghiệp (Dành cho K/H DN lấy hóa đơn GTGT)</p>
              </div>
            </div>

            <div className="bg-[#0e1526] p-4 rounded-xl border border-slate-800 text-xs space-y-2.5">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Hostname</span>
                <span className="font-mono font-bold text-white">{hostname}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">IP chính</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-white">{ipAddress}</span>
                  <button 
                    onClick={() => handleCopy(ipAddress, 'ip')} 
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedField === 'ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Username</span>
                <span className="font-mono font-bold text-white">root</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400">Mật khẩu</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-white">
                    {showPassword ? rootPasswordVal : '••••••••••••'}
                  </span>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-white">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleCopy(rootPasswordVal, 'pass')} className="text-slate-400 hover:text-white">
                    {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONSOLE MANAGEMENT BOX */}
      <div className="max-w-6xl mx-auto bg-white text-slate-800 rounded-2xl border border-slate-200 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-lg">
              🐧
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">{hostname}</h3>
                <span className="text-base" title="Việt Nam">🇻🇳</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-xs font-mono text-slate-700 font-bold">
                  {ipAddress}
                </span>
                <span className="text-xs text-slate-400 font-mono">Port: 2222</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Online
            </span>

            <button 
              onClick={() => handleAction('stop')}
              disabled={actionLoading !== null}
              className="p-2 border border-slate-200 hover:border-red-400 hover:bg-red-50 text-red-600 rounded-lg transition-all"
              title="Dừng máy chủ"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>

            <button 
              onClick={() => handleAction('restart')}
              disabled={actionLoading !== null}
              className="p-2 border border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
              title="Khởi động lại"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading === 'restart' ? 'animate-spin' : ''}`} />
            </button>

            <button 
              onClick={() => setIsTerminalOpen(true)}
              className="p-2 border border-slate-200 hover:border-slate-800 hover:bg-slate-900 hover:text-white text-slate-700 rounded-lg transition-all"
              title="Mở Web Terminal"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 overflow-x-auto bg-white">
          {[
            { id: 'overview', label: 'Overview', icon: Layers },
            { id: 'graphs', label: 'Graphs', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'install', label: 'Install', icon: Sliders },
            { id: 'tasks', label: 'Tasks And Logs', icon: FileText },
            { id: 'networking', label: 'Networking', icon: Globe },
            { id: 'backups', label: 'Backups & Snapshots', icon: Camera },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  isActive 
                    ? 'border-blue-600 text-blue-600 bg-blue-50/40' 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6 bg-slate-50/40">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Disk Usage</span>
                  <span className="font-mono text-slate-500 font-bold">{stats?.diskUsedGb ?? 14.81} / {vps.diskGb || 30} GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all duration-500 text-[10px] text-white font-bold flex items-center justify-center"
                    style={{ width: `${Math.min(stats?.diskUsagePercent ?? 49.38, 100)}%` }}
                  >
                    {stats?.diskUsagePercent ?? 49.38}%
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">CPU Usage ({vps.cpuCores || 6} vCPU)</span>
                  <span className="font-mono font-black text-blue-600">{stats?.cpuUsagePercent ?? 4.8}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 text-[10px] text-white font-bold flex items-center justify-center ${
                      (stats?.cpuUsagePercent ?? 4.8) > 80 ? 'bg-red-500' : (stats?.cpuUsagePercent ?? 4.8) > 50 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(stats?.cpuUsagePercent ?? 4.8, 100)}%` }}
                  >
                    {stats?.cpuUsagePercent ?? 4.8}%
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Bandwidth</span>
                  <span className="font-mono text-slate-500 font-bold">2.83 / ∞ GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-lg h-5 flex overflow-hidden border border-slate-200 text-[10px] font-bold text-center leading-5">
                  <div className="bg-blue-500 text-white" style={{ width: '94.91%' }}>94.91% IN</div>
                  <div className="bg-rose-400 text-white" style={{ width: '5.09%' }}>5.09%</div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-700">Network Speed</span>
                  <span className="font-mono text-emerald-600 font-bold">{(stats?.networkRxKbps ?? 128) / 1000} MB/s</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <span className="text-blue-600 flex items-center gap-1">↓ Download: {stats?.networkRxKbps ?? 45.2} KB/s</span>
                  <span className="text-amber-600 flex items-center gap-1">↑ Upload: {stats?.networkTxKbps ?? 20.1} KB/s</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 border-b border-slate-700 text-xs">
                <span className="text-slate-300 font-mono font-bold">root@{hostname}:~#</span>
                <span className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Terminal
                </span>
              </div>
              <div ref={consoleRef} className="p-4 font-mono text-xs text-emerald-400 bg-slate-950 h-44 overflow-y-auto space-y-1">
                {consoleOutput.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{line}</div>
                ))}
              </div>
              <div className="p-2.5 bg-slate-800/90 border-t border-slate-700 flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-xs font-bold">$</span>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleExecCommand(); } }}
                  placeholder="Nhập lệnh Linux (ví dụ: free -m, top, df -h, uname -a)..."
                  className="flex-1 bg-slate-900 text-slate-100 text-xs font-mono px-3 py-1.5 rounded border border-slate-700 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={handleExecCommand}
                  disabled={!isTerminalConnected || isExecRunning || !command.trim()}
                  className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors"
                >
                  Chạy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GRAPHS */}
        {activeTab === 'graphs' && (
          <div className="p-6 space-y-6 bg-slate-50/40">
            <div className="flex items-center justify-center gap-2 mb-4">
              <button 
                onClick={() => setGraphsSubTab('bandwidth')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  graphsSubTab === 'bandwidth' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Bandwidth Statistics
              </button>
              <button 
                onClick={() => setGraphsSubTab('system')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  graphsSubTab === 'system' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                System Statistics
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-700">08/17 - 08/22</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">Limit: <strong>∞ GB</strong></span>
                    <span className="text-slate-500">Utilized: <strong>2.83 GB</strong></span>
                    <span className="text-slate-500">Utilization: <strong>0%</strong></span>
                  </div>
                </div>
                <div className="h-48 flex items-end justify-between gap-2 pt-6 px-4">
                  {['17 Aug', '18 Aug', '19 Aug', '20 Aug', '21 Aug', '22 Aug'].map((day, idx) => {
                    const heights = [20, 25, 30, 85, 40, 35];
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-amber-100 rounded-t overflow-hidden flex flex-col justify-end" style={{ height: '140px' }}>
                          <div className="bg-gradient-to-t from-amber-500 to-amber-300 w-full" style={{ height: `${heights[idx]}%` }} />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
                <div className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">Monthly Chart</div>
                <div className="h-48 flex items-end justify-between gap-1 pt-6 px-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                    <div key={m} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-t overflow-hidden flex flex-col justify-end" style={{ height: '140px' }}>
                        {m === 'Aug' && <div className="bg-blue-600 w-full" style={{ height: '80%' }} />}
                      </div>
                      <span className="text-[9px] text-slate-400">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-6 bg-slate-50/40">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                {[
                  { id: 'password', label: 'Change Password' },
                  { id: 'hostname', label: 'Change Hostname' },
                  { id: 'config', label: 'VPS Configuration' },
                  { id: 'ssh', label: 'SSH Keys' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSettingsSubTab(item.id as any)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      settingsSubTab === item.id 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                {settingsSubTab === 'password' && (
                  <form onSubmit={handleChangePasswordSubmit} className="max-w-md space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Change Root Password</h4>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">New Root Password</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settingsNewPass}
                          onChange={(e) => setSettingsNewPass(e.target.value)}
                          placeholder="Nhập mật khẩu mới..."
                          required
                          className="flex-1 text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setSettingsNewPass('Pass@' + Math.random().toString(36).slice(-8) + '!')}
                          className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg border hover:bg-slate-200"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdatingSettings || !settingsNewPass}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Change Password
                    </button>
                  </form>
                )}

                {settingsSubTab === 'hostname' && (
                  <div className="max-w-md space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Change Hostname</h4>
                    <p className="text-xs text-slate-500">Current Hostname: <strong className="text-slate-800 font-mono">{hostname}</strong></p>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">New Host Name</label>
                      <input
                        type="text"
                        value={newHostname}
                        onChange={(e) => setNewHostname(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <button
                      onClick={() => showToast('success', `Đã đổi hostname sang ${newHostname} thành công!`)}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Change Hostname
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INSTALL */}
        {activeTab === 'install' && (
          <div className="p-6 bg-slate-50/40">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="space-y-1">
                {[
                  { id: 'reinstall', label: 'Reinstall OS' },
                  { id: 'control-panel', label: 'Control Panel' },
                  { id: 'recipes', label: 'Recipes' },
                  { id: 'apps', label: 'Applications' },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setInstallSubTab(item.id as any)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      installSubTab === item.id 
                        ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <form onSubmit={handleReinstallSubmit} className="max-w-md space-y-4">
                  <div className="border-b pb-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select OS:</label>
                    <select
                      value={reinstallOs}
                      onChange={(e) => setReinstallOs(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS (64-bit)</option>
                      <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS (64-bit)</option>
                      <option value="Debian 12 Bookworm">Debian 12 Bookworm (64-bit)</option>
                      <option value="Alpine Linux 3.20">Alpine Linux 3.20 (Minimal)</option>
                      <option value="Rocky Linux 9">Rocky Linux 9 (RHEL Compatible)</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-800">Password for OS after reinstallation</p>
                    <div>
                      <div className="flex gap-1.5">
                        <input
                          type="password"
                          value={reinstallPass}
                          onChange={(e) => setReinstallPass(e.target.value)}
                          placeholder="New Password"
                          required
                          className="flex-1 text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <input
                        type="password"
                        value={reinstallPassConfirm}
                        onChange={(e) => setReinstallPassConfirm(e.target.value)}
                        placeholder="Retype Password"
                        required
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-600">Remove old SSH Keys</span>
                      <input 
                        type="checkbox" 
                        checked={removeOldSsh} 
                        onChange={(e) => setRemoveOldSsh(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isReinstalling}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    {isReinstalling ? 'Đang Reinstall...' : 'Reinstall'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BACKUPS */}
        {activeTab === 'backups' && (
          <div className="p-6 bg-slate-50/40">
            <BackupManager orderId={vps.orderId || resolvedParams.id} />
          </div>
        )}

        {/* TAB 6: NETWORKING */}
        {activeTab === 'networking' && (
          <div className="p-6 bg-slate-50/40 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400">IPv4 Address</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1">{ipAddress}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-400">Gateway</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1">203.145.46.1</p>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-[10px] text-slate-500 font-mono">
          All times are GMT Asia/Ho_Chi_Minh. The time now is {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
        </div>
      </div>

      <VpsTerminalModal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        vpsInstanceId={vps?.containerId || ''}
      />
    </div>
  );
}
