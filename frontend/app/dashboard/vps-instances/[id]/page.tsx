'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as signalR from '@microsoft/signalr';
import { 
  Server, Terminal, Play, Square, RefreshCw, ArrowLeft, 
  Cpu, MemoryStick, HardDrive, Shield, CheckCircle2, AlertCircle, X, Loader2,
  Copy, Check, Key, RotateCcw, Camera, Globe, ArrowDown, ArrowUp, Activity, Lock, Wifi,
  Eye, EyeOff, Moon, Layers, BarChart3, Settings, Sliders, FileText, ChevronDown, ChevronLeft
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
  const [settingsSubTab, setSettingsSubTab] = useState<'password' | 'hostname' | 'config' | 'ssh' | 'vnc'>('password');
  const [installSubTab, setInstallSubTab] = useState<'reinstall' | 'control-panel' | 'recipes' | 'apps'>('reinstall');
  const [graphsSubTab, setGraphsSubTab] = useState<'bandwidth' | 'system'>('bandwidth');
  const [logsSubTab, setLogsSubTab] = useState<'tasks' | 'logs' | 'status'>('logs');

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

  // Chart data
  const [cpuHistory, setCpuHistory] = useState<number[]>([1.2, 2.1, 1.8, 3.4, 2.0, 4.8]);

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

  // Set up real-time Resource Status Hub for Start/Stop/Restart events
  useEffect(() => {
    let statusConnection: signalR.HubConnection | null = null;
    const token = localStorage.getItem('accessToken');
    
    if (resolvedParams.id) {
      statusConnection = new signalR.HubConnectionBuilder()
        .withUrl(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/hubs/resource-status` : '/hubs/resource-status', {
          accessTokenFactory: () => token || ''
        })
        .withAutomaticReconnect()
        .build();

      statusConnection.on('StatusChanged', (resId: string, newStatus: string) => {
        if (resId.toLowerCase() !== resolvedParams.id.toLowerCase()) return;
        
        switch (newStatus) {
          case 'Starting':
            showToast('success', 'VPS đang được khởi động...');
            break;
          case 'Running':
            showToast('success', 'VPS đã khởi động thành công và đang hoạt động.');
            fetchVpsDetail();
            fetchStats();
            break;
          case 'Stopping':
            showToast('success', 'VPS đang được tắt...');
            break;
          case 'Stopped':
            showToast('success', 'VPS đã được tắt hoàn toàn.');
            fetchVpsDetail();
            fetchStats();
            break;
          case 'Restarting':
            showToast('success', 'VPS đang khởi động lại...');
            break;
          case 'FailedToStart':
            showToast('error', 'Lỗi: Không thể khởi động VPS.');
            break;
          case 'FailedToRestart':
            showToast('error', 'Lỗi: Không thể khởi động lại VPS.');
            break;
        }
      });

      statusConnection.start()
        .then(() => {
          statusConnection?.invoke('SubscribeToResource', 'VPS', resolvedParams.id);
        })
        .catch(err => console.error('Failed to connect to ResourceStatusHub', err));
    }

    return () => {
      if (statusConnection) {
        statusConnection.stop();
      }
    };
  }, [resolvedParams.id]);

  const fetchVpsDetail = async () => {
    try {
      const res = await api.get(`/vpsinstances/${resolvedParams.id}?_t=${Date.now()}`);
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
      const res = await api.get(`/vpsinstances/${resolvedParams.id}/stats?_t=${Date.now()}`);
      setStats(res.data);
      if (res.data.cpuUsagePercent) {
        setCpuHistory(prev => [...prev.slice(1), res.data.cpuUsagePercent]);
      }
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
      </div>
    );
  }

  if (!vps) return null;

  const hostname = vps.containerName || 'azvps-1786899581';
  const ipAddress = stats?.ipAddress || '203.145.46.200';
  const isRunning = vps.status === 'Running' || vps.status === 2;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Toast Notification */}
      {actionToast && (
        <div className={`fixed top-4 right-4 z-50 max-w-md px-4 py-3 rounded shadow-2xl border flex items-start gap-3 animate-in slide-in-from-top-2 transition-all ${
          actionToast.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800' 
            : 'bg-red-50 border-red-300 text-red-800'
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

      <div className="max-w-5xl mx-auto mb-2">
        <Link href="/dashboard/vps-instances" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1.5 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách máy chủ
        </Link>
      </div>

      {/* TOP HEADER SECTION */}
      <div className="max-w-5xl mx-auto bg-[#101828] text-[#ffffff] rounded-md border border-slate-700 overflow-hidden shadow-lg">
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-3">
            <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-300 flex items-center justify-center text-slate-900 shadow-inner">
              <Server className="w-8 h-8 text-[#1F1F1F]" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#ffffff]">{vps.planName || 'Cheap 4'}</h2>
              <p className="text-xs text-[#94a3b8]">VPS Giá Rẻ</p>
            </div>
            <div className="w-full space-y-2 max-w-xs">
              <div className={`w-full py-1.5 px-3 rounded-sm font-bold text-xs uppercase tracking-wider text-center text-[#ffffff] transition-colors ${
                isRunning ? 'bg-[#16a34a]' : 'bg-slate-500'
              }`}>
                {isRunning ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ DỪNG'}
              </div>
              <button className="w-full py-1.5 px-3 bg-[#16a34a] hover:bg-[#15803d] text-[#ffffff] font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <span>⬆</span> Nâng cấp
              </button>
              <button className="w-full py-1.5 px-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-[#ffffff] font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <span>🔁</span> Gia hạn dịch vụ
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#0b1120] p-4 rounded border border-slate-700">
              <div>
                <p className="text-[#94a3b8]">Chu kỳ thanh toán</p>
                <p className="font-bold text-[#ffffff] mt-0.5 text-sm">1 tháng</p>
              </div>
              <div>
                <p className="text-[#94a3b8]">Ngày hết hạn</p>
                <p className="font-bold text-[#ffffff] mt-0.5 text-sm">
                  {vps.expiresAt ? new Date(vps.expiresAt).toLocaleDateString('vi-VN') : '16/09/2026'}
                </p>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-700">
                <p className="text-[#94a3b8]">Phương thức thanh toán</p>
                <p className="font-medium text-[#cbd5e1] mt-0.5">MBBANK Doanh Nghiệp (Dành cho K/H DN lấy hóa đơn GTGT)</p>
              </div>
            </div>

            <div className="bg-[#0b1120] p-4 rounded border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-700">
                <span className="text-[#94a3b8]">Hostname</span>
                <span className="font-mono font-bold text-[#ffffff]">{hostname}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-700">
                <span className="text-[#94a3b8]">IP chính</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#ffffff]">{ipAddress}</span>
                  <button onClick={() => handleCopy(ipAddress, 'ip')} className="text-[#94a3b8] hover:text-white" title="Copy IP">
                    {copiedField === 'ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-700">
                <span className="text-[#94a3b8]">Username</span>
                <span className="font-mono font-bold text-[#ffffff]">Administrator</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#94a3b8]">Mật khẩu</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-[#ffffff]">{showPassword ? rootPasswordVal : '••••••••'}</span>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-[#94a3b8] hover:text-[#ffffff]">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleCopy(rootPasswordVal, 'pass')} className="text-[#94a3b8] hover:text-[#ffffff]">
                    {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONSOLE MANAGEMENT BOX */}
      <div className="max-w-5xl mx-auto bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#e95420] to-[#e95420]/80 flex items-center justify-center text-slate-900 shadow-sm font-bold text-xl">
                <div className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">{hostname}</h3>
                  <span className="text-lg" title="Việt Nam">🇻🇳</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-sm text-xs font-bold border ${isRunning ? 'bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#16a34a]' : 'bg-slate-400'}`} />
                {isRunning ? 'Online' : 'Offline'}
              </span>

              <button className="p-2 text-slate-600 hover:text-slate-600 rounded-sm hover:bg-slate-100 transition-colors">
                <Moon className="w-4 h-4" />
              </button>

              <button onClick={() => fetchStats()} className="p-2 text-slate-600 hover:text-slate-600 rounded-sm hover:bg-slate-100 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            {isRunning ? (
              <button 
                onClick={() => handleAction('stop')}
                disabled={actionLoading !== null}
                className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${actionLoading === 'stop' ? 'border-red-300 bg-red-50 text-red-500' : 'border-red-300 hover:bg-red-50 text-red-500'}`}
                title="Stop VPS"
              >
                {actionLoading === 'stop' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
              </button>
            ) : (
              <button 
                onClick={() => handleAction('start')}
                disabled={actionLoading !== null}
                className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${actionLoading === 'start' ? 'border-emerald-300 bg-emerald-50 text-emerald-500' : 'border-emerald-300 hover:bg-emerald-50 text-emerald-500'}`}
                title="Start VPS"
              >
                {actionLoading === 'start' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </button>
            )}
            <button 
              onClick={() => handleAction('restart')}
              disabled={actionLoading !== null}
              className="w-8 h-8 rounded border border-blue-300 hover:bg-blue-50 flex items-center justify-center text-[#1F1F1F] transition-colors"
              title="Restart VPS"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading === 'restart' ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsTerminalOpen(true)}
              className="w-8 h-8 rounded border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-sm"
              title="Open Terminal"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3">
            <span className="inline-block px-3 py-1 bg-slate-50 border border-slate-200 rounded text-xs font-mono text-slate-700 font-bold">
              {ipAddress}
            </span>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex items-center justify-between px-6 border-b border-slate-100 overflow-x-auto bg-white">
          <div className="flex items-center gap-1.5 py-2">
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
                  className={`flex items-center gap-2 py-2 px-3.5 rounded-sm text-xs font-bold transition-all whitespace-nowrap ${
                    isActive 
                      ? 'bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <button className="text-slate-600 hover:text-slate-600 p-1">
            <ChevronDown className="w-4 h-4 text-[#1F1F1F]" />
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Disk Usage */}
              <div className="bg-white p-5 rounded border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Disk Usage</span>
                  <span className="font-mono text-slate-600 font-bold">{stats?.diskUsedGb ?? 14.81} / {vps.diskGb || 30} GB</span>
                </div>
                <div className="w-full bg-slate-100 rounded-sm h-5 overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="bg-[#f59e0b] h-full rounded text-[10px] text-slate-900 font-bold flex items-center justify-center transition-all duration-500"
                    style={{ width: `${Math.min(stats?.diskUsagePercent ?? 49.36, 100)}%` }}
                  >
                    {stats?.diskUsagePercent ?? 49.36} %
                  </div>
                </div>
              </div>

              {/* Card 2: CPU Line Chart */}
              <div className="bg-white p-5 rounded border border-slate-200/80 shadow-sm relative">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-800">CPU</span>
                  <span className="font-mono font-bold text-slate-700">{stats?.cpuUsagePercent ?? 4.8} %</span>
                </div>
                
                <div className="h-28 w-full flex items-end pt-2">
                  <div className="w-12 text-[9px] text-slate-600 font-mono flex flex-col justify-between h-full pr-1 text-right">
                    <span>5.00 %</span>
                    <span>4.00 %</span>
                    <span>3.00 %</span>
                    <span>2.00 %</span>
                    <span>1.00 %</span>
                    <span>0.00 %</span>
                  </div>
                  <div className="flex-1 h-full border-l border-b border-slate-200 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <polygon 
                        points={`0,100 0,${100 - (cpuHistory[0] || 0) * 18} 20,${100 - (cpuHistory[1] || 0) * 18} 40,${100 - (cpuHistory[2] || 0) * 18} 60,${100 - (cpuHistory[3] || 0) * 18} 80,${100 - (cpuHistory[4] || 0) * 18} 100,${100 - (cpuHistory[5] || 4.8) * 18} 100,100`} 
                        fill="rgba(59, 130, 246, 0.15)" 
                      />
                      <polyline 
                        points={`0,${100 - (cpuHistory[0] || 0) * 18} 20,${100 - (cpuHistory[1] || 0) * 18} 40,${100 - (cpuHistory[2] || 0) * 18} 60,${100 - (cpuHistory[3] || 0) * 18} 80,${100 - (cpuHistory[4] || 0) * 18} 100,${100 - (cpuHistory[5] || 4.8) * 18}`} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="2" 
                      />
                    </svg>
                  </div>
                </div>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-700">
                  <ChevronLeft className="w-4 h-4" />
                </div>
              </div>

              {/* Card 3: Bandwidth */}
              <div className="bg-white p-5 rounded border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Bandwidth</span>
                  <span className="font-mono text-slate-600 font-bold">2.83 / ∞ GB</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] text-slate-600 font-bold px-1">
                    <span>IN</span>
                    <span>OUT</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-sm h-6 flex overflow-hidden border border-slate-200 text-[10px] font-bold text-center leading-6">
                    <div className="bg-[#93c5fd] text-slate-800" style={{ width: '94.90%' }}>94.90%</div>
                    <div className="bg-[#fecdd3] text-slate-800" style={{ width: '5.10%' }}>5.10%</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Network Speed (MB/s) */}
              <div className="bg-white p-5 rounded border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Network Speed (MB/s)</span>
                  <span className="font-mono font-bold text-slate-700">0.00 MB/s</span>
                </div>

                <div className="h-24 w-full flex items-end pt-1">
                  <div className="w-14 text-[9px] text-slate-600 font-mono flex flex-col justify-between h-full pr-1 text-right">
                    <span>2.0 KB/s</span>
                    <span>1.5 KB/s</span>
                    <span>1000 B/S</span>
                    <span>500 B/S</span>
                    <span>0 B/S</span>
                  </div>
                  <div className="flex-1 h-full border-l border-b border-slate-200 relative flex items-end">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <polygon 
                        points="0,100 0,98 20,95 40,90 60,92 80,95 95,20 100,100" 
                        fill="rgba(13, 148, 136, 0.15)" 
                      />
                      <polyline 
                        points="0,98 20,95 40,90 60,92 80,95 95,20 100,98" 
                        fill="none" 
                        stroke="#0d9488" 
                        strokeWidth="2" 
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 text-[10px] text-slate-600 pt-1">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-600" /> Total speed</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Download</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Upload</span>
                </div>
              </div>

              {/* Card 5: Account (Bottom Right) */}
              <div className="bg-white p-5 rounded border border-slate-200/80 shadow-sm space-y-4 md:col-start-2">
                <div className="text-xs font-bold text-slate-800">Account</div>
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600">
                  <p className="font-semibold text-slate-700">Last Login</p>
                  <p className="font-mono text-slate-600 mt-1">{new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>

            {/* RESTORED EMBEDDED WEB TERMINAL CONSOLE */}
            <div className="bg-white rounded border border-slate-200 overflow-hidden shadow-inner mt-6">
              <div className="flex items-center justify-between px-4 py-2.5 bg-white border-b border-slate-300 text-xs">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                  <span className="text-slate-700 font-mono font-bold ml-2">root@{hostname}:~#</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-[10px] font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Terminal
                  </span>
                  <button onClick={() => setIsTerminalOpen(true)} className="text-slate-600 hover:text-slate-900 text-xs font-mono ml-2">
                    [Phóng to]
                  </button>
                </div>
              </div>

              <div ref={consoleRef} className="p-4 font-mono text-xs text-emerald-400 bg-slate-50 h-44 overflow-y-auto space-y-1">
                {consoleOutput.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{line}</div>
                ))}
              </div>

              <div className="p-2.5 bg-white/90 border-t border-slate-300 flex items-center gap-2">
                <span className="text-emerald-400 font-mono text-xs font-bold">$</span>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleExecCommand(); } }}
                  placeholder={vps?.status === 'Running' ? "Nhập lệnh Linux (ví dụ: free -m, top, df -h)..." : (vps?.status === 'Provisioning' ? "VPS đang khởi tạo, vui lòng chờ..." : "VPS đang tắt. Vui lòng khởi động lại để dùng Terminal.")}
                  disabled={vps?.status !== 'Running'}
                  className="flex-1 bg-white text-slate-900 text-xs font-mono px-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-600"
                />
                <button
                  onClick={handleExecCommand}
                  disabled={!isTerminalConnected || isExecRunning || !command.trim() || vps?.status !== 'Running'}
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  Chạy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: GRAPHS */}
        {activeTab === 'graphs' && (
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <button 
                onClick={() => setGraphsSubTab('bandwidth')}
                className={`px-4 py-2 rounded-sm text-xs font-bold transition-all ${
                  graphsSubTab === 'bandwidth' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                Bandwidth Statistics
              </button>
              <button 
                onClick={() => setGraphsSubTab('system')}
                className={`px-4 py-2 rounded-sm text-xs font-bold transition-all ${
                  graphsSubTab === 'system' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                System Statistics
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-700">08/17 - 08/22</span>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-600">Limit: <strong>∞ GB</strong></span>
                    <span className="text-slate-600">Utilized: <strong>2.83 GB</strong></span>
                    <span className="text-slate-600">Utilization: <strong>0%</strong></span>
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
                        <span className="text-[10px] text-slate-600 font-mono">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white p-5 rounded border border-slate-200 shadow-sm space-y-4">
                <div className="text-xs font-bold text-slate-700 border-b border-slate-100 pb-3">Monthly Chart</div>
                <div className="h-48 flex items-end justify-between gap-1 pt-6 px-2">
                  {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                    <div key={m} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-t overflow-hidden flex flex-col justify-end" style={{ height: '140px' }}>
                        {m === 'Aug' && <div className="bg-blue-600 w-full" style={{ height: '80%' }} />}
                      </div>
                      <span className="text-[9px] text-slate-600">{m}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-6">
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
                    className={`w-full text-left px-4 py-2.5 rounded-sm text-xs font-bold transition-all ${
                      settingsSubTab === item.id 
                        ? 'bg-blue-50 text-[#1F1F1F] border border-blue-200 shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-3 bg-white p-6 rounded border border-slate-200 shadow-sm">
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
                          className="flex-1 text-xs p-2.5 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setSettingsNewPass('Pass@' + Math.random().toString(36).slice(-8) + '!')}
                          className="px-3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-sm border hover:bg-slate-200"
                        >
                          Generate
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isUpdatingSettings || !settingsNewPass}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Change Password
                    </button>
                  </form>
                )}

                {settingsSubTab === 'hostname' && (
                  <div className="max-w-md space-y-4">
                    <h4 className="text-sm font-bold text-slate-900 border-b pb-2">Change Hostname</h4>
                    <p className="text-xs text-slate-600">Current Hostname: <strong className="text-slate-800 font-mono">{hostname}</strong></p>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">New Host Name</label>
                      <input
                        type="text"
                        value={newHostname}
                        onChange={(e) => setNewHostname(e.target.value)}
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <button
                      onClick={() => showToast('success', `Đã đổi hostname sang ${newHostname} thành công!`)}
                      className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-sm hover:bg-blue-700 transition-colors shadow-sm"
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
          <div className="p-6">
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
                    className={`w-full text-left px-4 py-2.5 rounded-sm text-xs font-bold transition-all ${
                      installSubTab === item.id 
                        ? 'bg-blue-50 text-[#1F1F1F] border border-blue-200 shadow-sm' 
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="md:col-span-3 bg-white p-6 rounded border border-slate-200 shadow-sm">
                <form onSubmit={handleReinstallSubmit} className="max-w-md space-y-4">
                  <div className="border-b pb-3">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Select OS:</label>
                    <select
                      value={reinstallOs}
                      onChange={(e) => setReinstallOs(e.target.value)}
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS (64-bit)</option>
                      <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS (64-bit)</option>
                      <option value="Debian 12 Bookworm">Debian 12 Bookworm (64-bit)</option>
                      <option value="Alpine Linux 3.20">Alpine Linux 3.20 (Minimal)</option>
                      <option value="Rocky Linux 9">Rocky Linux 9 (RHEL Compatible)</option>
                    </select>
                  </div>

                  <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-800">Password for OS after reinstallation</p>
                    <div>
                      <div className="flex gap-1.5">
                        <input
                          type="password"
                          value={reinstallPass}
                          onChange={(e) => setReinstallPass(e.target.value)}
                          placeholder="New Password"
                          required
                          className="flex-1 text-xs p-2.5 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={generateRandomPassword}
                          className="p-2.5 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
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
                        className="w-full text-xs p-2.5 border border-slate-200 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className="text-xs text-slate-600">Remove old SSH Keys</span>
                      <input 
                        type="checkbox" 
                        checked={removeOldSsh} 
                        onChange={(e) => setRemoveOldSsh(e.target.checked)}
                        className="w-4 h-4 text-[#1F1F1F] rounded"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isReinstalling}
                    className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-sm hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
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
          <div className="p-6">
            <BackupManager orderId={vps.orderId || resolvedParams.id} />
          </div>
        )}

        {/* TAB 6: NETWORKING */}
        {activeTab === 'networking' && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border border-slate-200">
                <span className="text-xs text-slate-600">IPv4 Address</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1">{ipAddress}</p>
              </div>
              <div className="bg-white p-4 rounded border border-slate-200">
                <span className="text-xs text-slate-600">Gateway</span>
                <p className="font-mono font-bold text-slate-900 text-sm mt-1">203.145.46.1</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: TASKS & LOGS */}
        {activeTab === 'tasks' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-center gap-1 border border-slate-200 rounded-sm p-1 bg-white max-w-xs mx-auto">
              <button 
                onClick={() => setLogsSubTab('tasks')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all ${
                  logsSubTab === 'tasks' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tasks
              </button>
              <button 
                onClick={() => setLogsSubTab('logs')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all ${
                  logsSubTab === 'logs' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Logs
              </button>
              <button 
                onClick={() => setLogsSubTab('status')}
                className={`flex-1 py-1.5 px-3 rounded text-xs font-bold transition-all ${
                  logsSubTab === 'status' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Status logs
              </button>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 min-h-[220px] font-mono text-xs text-slate-700 space-y-2">
              <div className="flex justify-between text-slate-600 text-[11px] border-b pb-2">
                <span>Timestamp</span>
                <span>Action</span>
                <span>Status</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span>{new Date().toLocaleString('vi-VN')}</span>
                <span className="font-bold">Check Health & Status</span>
                <span className="text-emerald-600 font-bold">SUCCESS</span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-[10px] text-slate-600 font-mono">
          All times are GMT Asia/Ho_Chi_Minh. The time now is {new Date().toLocaleDateString('vi-VN')} {new Date().toLocaleTimeString('vi-VN')}
          <div className="font-bold mt-0.5 text-slate-600">AZVPS</div>
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
