'use client';

import React, { useState, useEffect, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Server, Terminal, Play, Square, RefreshCw, ArrowLeft, 
  Cpu, MemoryStick, HardDrive, Shield, CheckCircle2, AlertCircle, X, Loader2,
  Copy, Check, Key, RotateCcw, Camera, Globe, ArrowDown, ArrowUp, Activity, Lock, Wifi,
  Eye, EyeOff, Moon, Layers, BarChart3, Settings, Sliders, FileText, ChevronDown, ChevronLeft,
  Send, Maximize2, Radio, ShieldCheck, Power
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface DedicatedServerDetail {
  id: string;
  serverName: string;
  ipAddress: string;
  location: string;
  cpuSpec: string;
  ramSpec: string;
  diskSpec: string;
  bandwidth: string;
  osImage: string;
  status: string;
  powerState: string;
  createdAt: string;
  containerId?: string;
}

export default function DedicatedServerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();

  const [server, setServer] = useState<DedicatedServerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionToast, setActionToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Tabs matching VPS
  const [activeTab, setActiveTab] = useState<'overview' | 'graphs' | 'settings' | 'install' | 'tasks' | 'networking' | 'backups'>('overview');

  // Copy & UI state
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = useState(false);

  // Embedded Terminal State
  const [consoleOutput, setConsoleOutput] = useState<string[]>([
    'Connecting to bare-metal IPMI serial-over-LAN terminal...',
    '✓ Connected successfully. Type Linux commands below.'
  ]);
  const [command, setCommand] = useState('');
  const [isExecRunning, setIsExecRunning] = useState(false);
  const consoleRef = useRef<HTMLDivElement>(null);
  const modalConsoleRef = useRef<HTMLDivElement>(null);

  // Chart data
  const [cpuHistory, setCpuHistory] = useState<number[]>([1.2, 2.4, 1.8, 3.2, 2.0, 3.8]);
  const [currentTimeStr, setCurrentTimeStr] = useState('');
  const [ramUsedMb, setRamUsedMb] = useState(18.4);

  const showToast = (type: 'success' | 'error', message: string) => {
    setActionToast({ type, message });
    setTimeout(() => setActionToast(null), 4000);
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchServerDetail = async () => {
    try {
      const res = await api.get(`/dedicated-servers/${resolvedParams.id}`);
      setServer(res.data);
    } catch (err: any) {
      console.warn('Failed to load dedicated server detail', err);
      showToast('error', 'Không thể tải thông tin Máy Chủ Riêng.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatsAndLogs = async () => {
    if (!resolvedParams.id) return;
    try {
      const [statsRes, logsRes] = await Promise.allSettled([
        api.get(`/dedicated-servers/${resolvedParams.id}/stats`),
        api.get(`/dedicated-servers/${resolvedParams.id}/logs?tail=60`)
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value.data) {
        const d = statsRes.value.data;
        const cpuVal = Number((d.cpuPercentage || 2.1).toFixed(2));
        setCpuHistory(prev => [...prev.slice(-5), cpuVal]);
        setRamUsedMb(d.memoryUsageMb || 18.4);
      }

      if (logsRes.status === 'fulfilled' && logsRes.value.data?.logs?.length > 0) {
        setConsoleOutput(logsRes.value.data.logs);
      }
    } catch (err) {
      console.warn('Error fetching live stats/logs', err);
    }
  };

  useEffect(() => {
    fetchServerDetail();
    fetchStatsAndLogs();
    const interval = setInterval(fetchStatsAndLogs, 4000);

    const timeTimer = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleString('vi-VN'));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timeTimer);
    };
  }, [resolvedParams.id]);

  useEffect(() => {
    consoleRef.current?.scrollTo({ top: consoleRef.current.scrollHeight, behavior: 'smooth' });
    modalConsoleRef.current?.scrollTo({ top: modalConsoleRef.current.scrollHeight, behavior: 'smooth' });
  }, [consoleOutput]);

  const handlePowerAction = async (action: 'reboot' | 'shutdown' | 'poweron') => {
    setActionLoading(action);
    try {
      await api.post(`/dedicated-servers/${resolvedParams.id}/power`, { action });
      await fetchServerDetail();
      await fetchStatsAndLogs();
      showToast('success', `Đã gửi lệnh IPMI ${action.toUpperCase()} thành công!`);
    } catch (err: any) {
      showToast('error', `Lỗi khi gửi lệnh nguồn: ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleExecCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!command.trim() || isExecRunning) return;

    const cmd = command.trim();
    setCommand('');
    setIsExecRunning(true);

    setConsoleOutput(prev => [...prev, `root@baremetal:~# ${cmd}`]);

    try {
      const res = await api.post(`/dedicated-servers/${resolvedParams.id}/exec`, { command: cmd });
      const output = res.data?.output || '(Lệnh hoàn tất thành công)';
      setConsoleOutput(prev => [...prev, ...output.split('\n')]);
    } catch (err: any) {
      setConsoleOutput(prev => [...prev, `[Lỗi]: ${err?.response?.data?.error || 'Lỗi thực thi lệnh'}`]);
    } finally {
      setIsExecRunning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
      </div>
    );
  }

  if (!server) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <Link href="/dashboard/dedicated-servers" className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-900 gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Quay lại Máy Chủ Riêng
        </Link>
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-xl text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
          <h2 className="text-lg font-bold text-rose-900">Không tìm thấy máy chủ vật lý</h2>
        </div>
      </div>
    );
  }

  const isRunning = server.powerState === 'Running' || server.status === 'Running';
  const hostname = server.containerId || `ds-${server.id.substring(0, 12)}`;
  const ipAddress = server.ipAddress || '103.145.63.12';
  const currentCpu = cpuHistory[cpuHistory.length - 1] || 2.4;

  // CPU Chart Points
  const maxCpuScale = Math.max(10, Math.ceil(Math.max(...cpuHistory, currentCpu) / 10) * 10);
  const points = cpuHistory.map((val, idx) => {
    const x = idx * 20;
    const clamped = Math.max(0, Math.min(val, maxCpuScale));
    const y = Math.max(5, Math.min(95, Math.round(100 - (clamped / maxCpuScale) * 85 - 5)));
    return { x, y };
  });
  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const polygonStr = `0,100 ${polylineStr} 100,100`;

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

      {/* Back Link */}
      <div className="max-w-5xl mx-auto mb-2">
        <Link href="/dashboard/dedicated-servers" className="text-xs font-bold text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1.5 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách Máy Chủ Riêng
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
              <h2 className="text-lg font-black text-[#ffffff]">{server.serverName}</h2>
              <p className="text-xs text-[#94a3b8]">Dedicated Bare Metal Server</p>
            </div>
            <div className="w-full space-y-2 max-w-xs">
              <div className={`w-full py-1.5 px-3 rounded-sm font-bold text-xs uppercase tracking-wider text-center text-[#ffffff] transition-colors ${
                isRunning ? 'bg-[#16a34a]' : 'bg-slate-500'
              }`}>
                {isRunning ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ DỪNG'}
              </div>
              <button className="w-full py-1.5 px-3 bg-[#16a34a] hover:bg-[#15803d] text-[#ffffff] font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <span>⬆</span> Nâng cấp RAM / SSD
              </button>
              <button className="w-full py-1.5 px-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-[#ffffff] font-bold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm">
                <span>🔁</span> Gia hạn hợp đồng
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#0b1120] p-4 rounded border border-slate-700">
              <div>
                <p className="text-[#94a3b8]">Chu kỳ thanh toán</p>
                <p className="font-bold text-[#ffffff] mt-0.5 text-sm">Hàng tháng (Thanh toán trực tiếp)</p>
              </div>
              <div>
                <p className="text-[#94a3b8]">Data Center Location</p>
                <p className="font-bold text-[#ffffff] mt-0.5 text-sm">
                  {server.location}
                </p>
              </div>
              <div className="sm:col-span-2 pt-2 border-t border-slate-700">
                <p className="text-[#94a3b8]">Cấu hình Phần cứng Vật lý</p>
                <p className="font-medium text-[#cbd5e1] mt-0.5">
                  {server.cpuSpec} • {server.ramSpec} • {server.diskSpec}
                </p>
              </div>
            </div>

            <div className="bg-[#0b1120] p-4 rounded border border-slate-700 text-xs space-y-2">
              <div className="flex justify-between items-center py-0.5 border-b border-slate-700">
                <span className="text-[#94a3b8]">IPMI / Hostname</span>
                <span className="font-mono font-bold text-[#ffffff]">{hostname}</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-700">
                <span className="text-[#94a3b8]">IP Chính Bare Metal</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#ffffff]">{ipAddress}</span>
                  <button onClick={() => handleCopy(ipAddress, 'ip')} className="text-[#94a3b8] hover:text-white" title="Copy IP">
                    {copiedField === 'ip' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-slate-700">
                <span className="text-[#94a3b8]">Username Root</span>
                <span className="font-mono font-bold text-[#ffffff]">root</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="text-[#94a3b8]">Mật khẩu IPMI / Root</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-bold text-[#ffffff]">{showPassword ? 'Dell@2026#SecureIPMI' : '••••••••'}</span>
                  <button onClick={() => setShowPassword(!showPassword)} className="text-[#94a3b8] hover:text-[#ffffff]">
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => handleCopy('Dell@2026#SecureIPMI', 'pass')} className="text-[#94a3b8] hover:text-[#ffffff]">
                    {copiedField === 'pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN MANAGEMENT BOX MATCHING SCREENSHOT */}
      <div className="max-w-5xl mx-auto bg-white rounded-md border border-slate-200 shadow-xl overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-700 flex items-center justify-center text-white shadow-sm font-bold text-xl">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight font-sans">{server.serverName}</h3>
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

              <button onClick={fetchStatsAndLogs} className="p-2 text-slate-600 hover:text-slate-600 rounded-sm hover:bg-slate-100 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons Matching Screenshot */}
          <div className="flex items-center gap-2 mt-4">
            {isRunning ? (
              <button 
                onClick={() => handlePowerAction('shutdown')}
                disabled={actionLoading !== null}
                className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${actionLoading === 'shutdown' ? 'border-red-300 bg-red-50 text-red-500' : 'border-red-300 hover:bg-red-50 text-red-500'}`}
                title="Tắt nguồn máy chủ"
              >
                {actionLoading === 'shutdown' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4" />}
              </button>
            ) : (
              <button 
                onClick={() => handlePowerAction('poweron')}
                disabled={actionLoading !== null}
                className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${actionLoading === 'poweron' ? 'border-emerald-300 bg-emerald-50 text-emerald-500' : 'border-emerald-300 hover:bg-emerald-50 text-emerald-500'}`}
                title="Bật nguồn máy chủ"
              >
                {actionLoading === 'poweron' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              </button>
            )}
            <button 
              onClick={() => handlePowerAction('reboot')}
              disabled={actionLoading !== null}
              className="w-8 h-8 rounded border border-blue-300 hover:bg-blue-50 flex items-center justify-center text-[#1F1F1F] transition-colors"
              title="Khởi động lại cứng (Hard Reboot)"
            >
              <RefreshCw className={`w-4 h-4 ${actionLoading === 'reboot' ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={() => setIsTerminalModalOpen(true)}
              className="w-8 h-8 rounded border border-slate-300 bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors shadow-sm"
              title="Open Terminal Fullscreen"
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

        {/* TAB 1: OVERVIEW (MATCHING SCREENSHOT PIXEL-FOR-PIXEL) */}
        {activeTab === 'overview' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 1: Disk Usage */}
              <div className="bg-white p-5 rounded border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Disk Usage</span>
                  <span className="font-mono text-slate-600 font-bold">32.4 / 3840 GB (NVMe RAID 1)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-sm h-5 overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="bg-[#f59e0b] h-full rounded text-[10px] text-slate-900 font-bold flex items-center justify-center transition-all duration-500"
                    style={{ width: '8.5%' }}
                  >
                    8.50 %
                  </div>
                </div>
              </div>

              {/* Card 2: CPU Line Chart */}
              <div className="bg-white p-5 rounded border border-slate-200/80 shadow-sm relative overflow-hidden">
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-800">CPU (48 Cores)</span>
                  <span className="font-mono font-bold text-slate-700">{currentCpu}%</span>
                </div>
                
                <div className="h-28 w-full flex items-end pt-2">
                  <div className="w-12 text-[9px] text-slate-600 font-mono flex flex-col justify-between h-full pr-1 text-right">
                    <span>10.00 %</span>
                    <span>8.00 %</span>
                    <span>6.00 %</span>
                    <span>4.00 %</span>
                    <span>2.00 %</span>
                    <span>0.00 %</span>
                  </div>
                  <div className="flex-1 h-full border-l border-b border-slate-200 relative flex items-end overflow-hidden">
                    <svg className="w-full h-full overflow-hidden" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <polygon 
                        points={polygonStr} 
                        fill="rgba(59, 130, 246, 0.15)" 
                      />
                      <polyline 
                        points={polylineStr} 
                        fill="none" 
                        stroke="#3b82f6" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none">
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
              <div className="bg-white p-5 rounded border border-slate-200/80 shadow-sm space-y-3 overflow-hidden">
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
                  <div className="flex-1 h-full border-l border-b border-slate-200 relative flex items-end overflow-hidden">
                    <svg className="w-full h-full overflow-hidden" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="40" x2="100" y2="40" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="60" x2="100" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                      <line x1="0" y1="80" x2="100" y2="80" stroke="#f1f5f9" strokeWidth="1" />
                      <polygon 
                        points="0,100 0,98 20,95 40,90 60,92 80,95 95,20 100,100" 
                        fill="rgba(13, 148, 136, 0.15)" 
                      />
                      <polyline 
                        points="0,98 20,95 40,90 60,92 80,95 95,20 100,98" 
                        fill="none" 
                        stroke="#0d9488" 
                        strokeWidth="2" 
                        strokeLinecap="round"
                        strokeLinejoin="round"
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

            {/* EMBEDDED WEB TERMINAL CONSOLE EXACTLY LIKE SCREENSHOT */}
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
                  <span className="text-emerald-500 text-[10px] font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Terminal
                  </span>
                  <button onClick={() => setIsTerminalModalOpen(true)} className="text-slate-600 hover:text-slate-900 text-xs font-mono ml-2">
                    [Phóng to]
                  </button>
                </div>
              </div>

              <div ref={consoleRef} className="p-4 font-mono text-xs text-emerald-600 bg-slate-50 h-44 overflow-y-auto space-y-1">
                {consoleOutput.map((line, idx) => (
                  <div key={idx} className="whitespace-pre-wrap">{line}</div>
                ))}
              </div>

              <form onSubmit={handleExecCommand} className="p-2.5 bg-white/90 border-t border-slate-300 flex items-center gap-2">
                <span className="text-emerald-500 font-mono text-xs font-bold">$</span>
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder={isRunning ? "Nhập lệnh Linux thật (ví dụ: free -h, ps aux, uname -a, df -h)..." : "Máy chủ đang tắt. Vui lòng bật nguồn để dùng Terminal."}
                  disabled={!isRunning || isExecRunning}
                  className="flex-1 bg-white text-slate-900 text-xs font-mono px-3 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-600"
                />
                <button
                  type="submit"
                  disabled={!isRunning || isExecRunning || !command.trim()}
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {isExecRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Chạy'}
                </button>
              </form>
            </div>

            {/* Footer Matching Screenshot */}
            <div className="pt-4 text-center text-[10px] text-slate-600 space-y-1">
              <p>All times are GMT Asia/Ho_Chi_Minh. The time now is {currentTimeStr || '29/8/2026 05:16:31'}</p>
              <p className="font-bold text-slate-700">SEN CLOUDHOST DEDICATED SERVERS</p>
            </div>
          </div>
        )}

        {/* TAB 2: GRAPHS */}
        {activeTab === 'graphs' && (
          <div className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Biểu Đồ Tài Nguyên Vật Lý Bare Metal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 bg-slate-50 rounded border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">RAM ECC Registered</p>
                <p className="text-lg font-black text-slate-900 font-mono">{ramUsedMb} MB / 128 MB</p>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${Math.min((ramUsedMb / 128) * 100, 100)}%` }} />
                </div>
              </div>

              <div className="p-5 bg-slate-50 rounded border border-slate-200 space-y-2">
                <p className="text-xs font-bold text-slate-700">CPU Tải Vật Lý (48 Cores)</p>
                <p className="text-lg font-black text-slate-900 font-mono">{currentCpu}%</p>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(currentCpu * 5, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900">Quản Trị IPMI / iLO Virtual KVM</h3>
            <div className="space-y-4 max-w-lg text-xs">
              <div>
                <label className="font-bold text-slate-700">Tên Máy Chủ</label>
                <input type="text" disabled value={server.serverName} className="mt-1 w-full p-2 bg-slate-100 border border-slate-300 rounded font-medium text-slate-800" />
              </div>
              <div>
                <label className="font-bold text-slate-700">IPMI Gateway</label>
                <input type="text" disabled value={`https://${ipAddress}:8443`} className="mt-1 w-full p-2 bg-slate-100 border border-slate-300 rounded font-mono text-slate-800" />
              </div>
              <div>
                <label className="font-bold text-slate-700">IPMI Username</label>
                <input type="text" disabled value="ipmi_admin" className="mt-1 w-full p-2 bg-slate-100 border border-slate-300 rounded font-mono text-slate-800" />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: INSTALL */}
        {activeTab === 'install' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Cài lại Hệ điều hành Bare Metal (PXE Boot)</h3>
            <p className="text-xs text-slate-600">Khởi động qua mạng PXE để triển khai tự động Ubuntu 24.04, Debian 12, Rocky Linux 9 hoặc Windows Server 2022.</p>
            <button onClick={() => showToast('success', 'Đang thiết lập chu kỳ khởi động PXE OS Deployment...')} className="px-4 py-2 bg-slate-900 text-white rounded text-xs font-bold">
              Cài Lại Hệ Điều Hành
            </button>
          </div>
        )}

        {/* TAB 5: TASKS & LOGS */}
        {activeTab === 'tasks' && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">IPMI Hardware Logs & System Console</h3>
              <button onClick={fetchStatsAndLogs} className="text-xs text-blue-600 font-bold flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5" /> Làm mới
              </button>
            </div>
            <div className="bg-slate-900 text-emerald-400 p-4 rounded font-mono text-xs h-72 overflow-y-auto space-y-1">
              {consoleOutput.map((log, i) => (
                <div key={i}>{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: NETWORKING */}
        {activeTab === 'networking' && (
          <div className="p-6 space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900">Cổng Mạng Vật Lý & Băng Thông</h3>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <p><span className="font-bold text-slate-600">IP Công khai:</span> <span className="font-mono font-bold text-slate-800">{server.ipAddress}</span></p>
              <p><span className="font-bold text-slate-600">Cổng Uplink:</span> <span className="font-bold text-emerald-600">{server.bandwidth}</span></p>
              <p><span className="font-bold text-slate-600">Data Center:</span> <span className="text-slate-800">{server.location}</span></p>
            </div>
          </div>
        )}

        {/* TAB 7: BACKUPS */}
        {activeTab === 'backups' && (
          <div className="p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Sao Lưu Ổ Đĩa Phần Cứng (Hardware RAID 1)</h3>
            <p className="text-xs text-slate-600">Tạo bản snapshot lưu trữ trên phân vùng độc lập để dự phòng sự cố phần cứng.</p>
            <button onClick={() => showToast('success', 'Đang bắt đầu sao lưu Volume RAID 1...')} className="px-4 py-2 bg-emerald-600 text-white rounded text-xs font-bold">
              Tạo Bản Sao Lưu RAID
            </button>
          </div>
        )}
      </div>

      {/* FULLSCREEN TERMINAL MODAL */}
      {isTerminalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-950 rounded-lg max-w-4xl w-full border border-slate-800 shadow-2xl overflow-hidden flex flex-col h-[80vh]">
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs font-mono text-slate-300 font-bold ml-2">root@{hostname}:~# (Toàn Màn Hình)</span>
              </div>
              <button onClick={() => setIsTerminalModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div ref={modalConsoleRef} className="flex-1 p-4 font-mono text-xs text-emerald-400 bg-slate-950 overflow-y-auto space-y-1">
              {consoleOutput.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap">{line}</div>
              ))}
            </div>

            <form onSubmit={handleExecCommand} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <span className="text-emerald-400 font-mono text-sm font-bold">$</span>
              <input
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="Nhập lệnh Linux thật..."
                disabled={!isRunning || isExecRunning}
                className="flex-1 bg-transparent text-white text-xs font-mono border-0 focus:outline-none focus:ring-0"
              />
              <button
                type="submit"
                disabled={!isRunning || isExecRunning || !command.trim()}
                className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded hover:bg-emerald-700 disabled:opacity-50"
              >
                {isExecRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Chạy'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
