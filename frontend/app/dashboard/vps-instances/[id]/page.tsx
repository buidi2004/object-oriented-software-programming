'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Server, Terminal, Play, Square, RefreshCw, ArrowLeft, 
  Cpu, MemoryStick, HardDrive, Shield, CheckCircle2, AlertCircle, X, Loader2,
  Copy, Check, Key, RotateCcw, Camera, Globe, ArrowDown, ArrowUp, Activity, Lock, Wifi
} from 'lucide-react';
import VpsTerminalModal from '@/src/components/VpsTerminalModal';
import BackupManager from '@/src/components/BackupManager';
import { getVpsStatusMeta, formatRamMb } from '@/src/utils/vpsStatus';
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
  const [copiedSsh, setCopiedSsh] = useState(false);
  const router = useRouter();

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

  const fetchVpsDetail = async () => {
    try {
      const res = await api.get(`/vpsinstances/${resolvedParams.id}`);
      setVps(res.data);
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

  const [actionLoading, setActionLoading] = useState<'start' | 'stop' | 'restart' | null>(null);

  const actionLabels: Record<string, string> = {
    start: 'khởi động',
    stop: 'dừng',
    restart: 'khởi động lại'
  };

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!vps || actionLoading) return;

    if (vps.status === 'Terminated' || vps.status === 4) {
      showToast('error', 'VPS này đã bị hủy, không thể thao tác.');
      return;
    }

    setActionLoading(action);
    setActionToast(null);

    const prevStatus = vps.status;
    setVps((prev: any) => prev ? { ...prev, status: 'Provisioning' } : null);

    try {
      await api.post(`/vpsinstances/${resolvedParams.id}/${action}`);
      await fetchVpsDetail();
      await fetchStats();
      showToast('success', `Đã ${actionLabels[action]} VPS thành công!`);
    } catch (error: any) {
      console.error(`Error during ${action}:`, error);
      setVps((prev: any) => prev ? { ...prev, status: prevStatus } : null);
      showToast('error', error?.response?.data?.message || `Không thể ${actionLabels[action]} VPS. Vui lòng thử lại.`);
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
    setIsRebuilding(true);
    try {
      const res = await api.post(`/vpsinstances/${resolvedParams.id}/rebuild`, { osName: selectedOs });
      showToast('success', res.data.message || 'Cài lại Hệ điều hành thành công!');
      setShowRebuildModal(false);
      fetchVpsDetail();
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Lỗi khi cài lại hệ điều hành');
    } finally {
      setIsRebuilding(false);
    }
  };

  const handleResetPassword = async () => {
    setIsResettingPass(true);
    try {
      const res = await api.post(`/vpsinstances/${resolvedParams.id}/reset-password`, { newPassword: newRootPassword });
      setGeneratedPass(res.data.newPassword);
      showToast('success', 'Đổi mật khẩu Root thành công!');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Lỗi khi đổi mật khẩu');
    } finally {
      setIsResettingPass(false);
    }
  };

  const handleCreateSnapshot = async () => {
    setIsCreatingSnapshot(true);
    try {
      await api.post(`/vpsinstances/${resolvedParams.id}/snapshots`, { name: snapshotName });
      showToast('success', 'Đã tạo Snapshot tức thì thành công!');
      setShowSnapshotModal(false);
      setSnapshotName('');
    } catch (err: any) {
      showToast('error', err?.response?.data?.message || 'Lỗi khi tạo Snapshot');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleTerminate = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa (terminate) VPS này? Mọi dữ liệu sẽ bị xóa vĩnh viễn!')) return;
    
    try {
      await api.delete(`/vpsinstances/${resolvedParams.id}`);
      showToast('success', 'VPS đã được xóa thành công!');
      setTimeout(() => router.push('/dashboard/vps-instances'), 1000);
    } catch (error) {
      console.error('Error terminating VPS', error);
      showToast('error', 'Có lỗi xảy ra khi xóa VPS.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!vps) return null;

  const statusMeta = getVpsStatusMeta(vps.status);
  const isRunning = vps.status === 'Running' || vps.status === 2;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <Link href="/dashboard/vps-instances" className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách VPS
          </Link>
        </div>

        {/* Server Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Server className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black flex items-center gap-3">
                  {vps.planName || vps.containerName || 'Cloud VPS'}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </h1>
                <p className="text-sm text-slate-400 mt-1 font-mono">ID: {vps.containerId || 'Pending'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setIsTerminalOpen(true)}
                disabled={!isRunning}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-blue-600/30 flex items-center gap-2 text-sm"
              >
                <Terminal className="w-4 h-4" /> Web Terminal
              </button>

              {isRunning ? (
                <button 
                  onClick={() => handleAction('stop')}
                  disabled={actionLoading !== null}
                  className="bg-white/10 hover:bg-rose-600 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 border border-white/20" 
                  title="Dừng VPS"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button 
                  onClick={() => handleAction('start')}
                  disabled={actionLoading !== null}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-50" 
                  title="Khởi động VPS"
                >
                  <Play className="w-5 h-5 fill-current" />
                </button>
              )}

              <button 
                onClick={() => handleAction('restart')}
                disabled={!isRunning || actionLoading !== null}
                className="bg-white/10 hover:bg-amber-600 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 border border-white/20" 
                title="Khởi động lại VPS"
              >
                <RefreshCw className={`w-5 h-5 ${actionLoading === 'restart' ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Quick Connection Details Bar */}
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
                title="Copy lệnh SSH"
              >
                {copiedSsh ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* LIVE REAL-TIME RESOURCE MONITORING */}
          <div className="p-6 bg-white border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" /> Giám sát tài nguyên thời gian thực (Real-time Metrics)
              </h3>
              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live polling 4s
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* CPU */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Cpu className="w-4 h-4 text-blue-600" /> CPU Load
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">{stats?.cpuUsagePercent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      (stats?.cpuUsagePercent ?? 0) > 80 ? 'bg-red-500' : (stats?.cpuUsagePercent ?? 0) > 50 ? 'bg-amber-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(stats?.cpuUsagePercent ?? 0, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">{vps.cpuCores ?? 1} vCPU Cores</p>
              </div>

              {/* RAM */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <MemoryStick className="w-4 h-4 text-indigo-600" /> RAM Memory
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">{stats?.ramUsagePercent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 transition-all duration-500"
                    style={{ width: `${Math.min(stats?.ramUsagePercent ?? 0, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">{stats?.ramUsedMb ?? 0} MB / {formatRamMb(vps.ramMb ?? 2048)}</p>
              </div>

              {/* SSD */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <HardDrive className="w-4 h-4 text-emerald-600" /> NVMe Storage
                  </span>
                  <span className="text-sm font-black text-slate-900 font-mono">{stats?.diskUsagePercent ?? 0}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-600 transition-all duration-500"
                    style={{ width: `${Math.min(stats?.diskUsagePercent ?? 0, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2">{stats?.diskUsedGb ?? 0} GB / {vps.diskGb || 30} GB</p>
              </div>

              {/* Network */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Wifi className="w-4 h-4 text-purple-600" /> Network Traffic
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 font-mono">KB/s</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono font-bold mt-2">
                  <span className="text-blue-600 flex items-center gap-0.5"><ArrowDown className="w-3.5 h-3.5" /> {stats?.networkRxKbps ?? 0}</span>
                  <span className="text-emerald-600 flex items-center gap-0.5"><ArrowUp className="w-3.5 h-3.5" /> {stats?.networkTxKbps ?? 0}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Băng thông Unlimited</p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="p-6 bg-slate-50 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowRebuildModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <RotateCcw className="w-4 h-4 text-blue-600" />
              <span>Cài Lại OS (Rebuild)</span>
            </button>

            <button
              onClick={() => { setGeneratedPass(null); setNewRootPassword(''); setShowPasswordModal(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <Key className="w-4 h-4 text-amber-600" />
              <span>Đổi Mật Khẩu Root</span>
            </button>

            <button
              onClick={() => setShowSnapshotModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 rounded-xl font-bold text-xs shadow-sm transition-all"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Tạo Snapshot Tức Thì</span>
            </button>

            <button 
              onClick={handleTerminate}
              className="text-red-600 hover:text-red-700 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-red-50 transition-colors ml-auto"
            >
              Xóa (Terminate) VPS
            </button>
          </div>
        </div>

        {/* Backup & Snapshot Manager */}
        <BackupManager orderId={vps.orderId || resolvedParams.id} />
      </div>

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
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        vpsInstanceId={vps?.containerId || ''}
      />
    </div>
  );
}
