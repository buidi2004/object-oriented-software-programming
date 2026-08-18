'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Server, Terminal, Play, Square, RefreshCw, ArrowLeft, Cpu, MemoryStick, HardDrive, Shield } from 'lucide-react';
import VpsTerminalModal from '@/src/components/VpsTerminalModal';
import BackupManager from '@/src/components/BackupManager';
import { getVpsStatusMeta, formatRamMb } from '@/src/utils/vpsStatus';

export default function VpsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [vps, setVps] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const router = useRouter();

  const resolvedParams = use(params);

  useEffect(() => {
    fetchVpsDetail();
  }, [resolvedParams.id]);

  const fetchVpsDetail = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch(`/api/vpsinstances/${resolvedParams.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setVps(data);
      } else {
        router.push('/dashboard/vps-instances');
      }
    } catch (error) {
      console.error('Error fetching VPS details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const [actionLoading, setActionLoading] = useState<'start' | 'stop' | 'restart' | null>(null);

  const handleAction = async (action: 'start' | 'stop' | 'restart') => {
    if (!vps || actionLoading) return;
    setActionLoading(action);

    const prevStatus = vps.status;
    const nextStatus = action === 'stop' ? 'Stopped' : 'Running';

    setVps((prev: any) => prev ? { ...prev, status: nextStatus } : null);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const res = await fetch(`/api/vpsinstances/${resolvedParams.id}/${action}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Failed to ${action}`);
      }
      fetchVpsDetail();
    } catch (error) {
      console.error(`Error during ${action}:`, error);
      setVps((prev: any) => prev ? { ...prev, status: prevStatus } : null);
      alert(`Không thể ${action === 'start' ? 'khởi động' : action === 'stop' ? 'dừng' : 'khởi động lại'} VPS.`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTerminate = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa (terminate) VPS này? Mọi dữ liệu sẽ bị xóa vĩnh viễn!')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch(`/api/vpsinstances/${resolvedParams.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('VPS đã được xóa thành công!');
        router.push('/dashboard/vps-instances');
      } else {
        alert('Có lỗi xảy ra khi xóa VPS.');
      }
    } catch (error) {
      console.error('Error terminating VPS', error);
      alert('Có lỗi xảy ra.');
    }
  };

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!vps) return null;

  const statusMeta = getVpsStatusMeta(vps.status);
  const isRunning = vps.status === 'Running' || vps.status === 2;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-6">
          <Link href="/dashboard/vps-instances" className="text-sm font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" /> Quay lại danh sách
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm mb-6">
          <div className="p-6 sm:p-8 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Server className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  {vps.containerName || 'VPS Instance'}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </h1>
                <p className="text-sm text-slate-500 mt-1 font-mono">ID: {vps.containerId || 'Pending'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <button 
                onClick={() => setIsTerminalOpen(true)}
                disabled={!isRunning}
                className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-slate-900/30 flex items-center gap-2"
              >
                <Terminal className="w-5 h-5" /> Web Terminal
              </button>

              {isRunning ? (
                <button 
                  onClick={() => handleAction('stop')}
                  disabled={actionLoading !== null}
                  className="bg-white border border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-slate-700 hover:text-rose-700 p-2.5 rounded-xl transition-all disabled:opacity-50" 
                  title="Dừng VPS"
                >
                  <Square className="w-5 h-5 fill-current text-rose-600" />
                </button>
              ) : (
                <button 
                  onClick={() => handleAction('start')}
                  disabled={actionLoading !== null}
                  className="bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 p-2.5 rounded-xl transition-all disabled:opacity-50" 
                  title="Khởi động VPS"
                >
                  <Play className="w-5 h-5 fill-current text-emerald-600" />
                </button>
              )}

              <button 
                onClick={() => handleAction('restart')}
                disabled={!isRunning || actionLoading !== null}
                className="bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-slate-700 hover:text-amber-700 p-2.5 rounded-xl transition-all disabled:opacity-50" 
                title="Khởi động lại VPS"
              >
                <RefreshCw className={`w-5 h-5 text-amber-600 ${actionLoading === 'restart' ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Cấu hình hệ thống</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">CPU</p>
                  <p className="font-bold text-slate-900">{vps.cpuCores ?? 1} Core</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MemoryStick className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">RAM</p>
                  <p className="font-bold text-slate-900">{formatRamMb(vps.ramMb ?? 512)}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <HardDrive className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Storage</p>
                  <p className="font-bold text-slate-900">{vps.diskGb ? `${vps.diskGb} GB SSD` : 'N/A'}</p>
                </div>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">OS</p>
                  <p className="font-bold text-slate-900">{vps.planName || 'Ubuntu 24.04'}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Thông tin bổ sung</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500">Trạng thái đăng ký</span>
                <span className="font-semibold text-slate-900">Active</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500">Chu kỳ thanh toán</span>
                <span className="font-semibold text-slate-900">Hàng tháng</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500">Ngày tạo</span>
                <span className="font-semibold text-slate-900">{new Date(vps.createdAt).toLocaleDateString('vi-VN')}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-slate-100">
                <span className="text-slate-500">Ngày hết hạn</span>
                <span className="font-semibold text-slate-900">{new Date(vps.expiresAt).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleTerminate}
                className="text-red-600 hover:text-red-700 font-semibold px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                Xóa (Terminate) VPS
              </button>
            </div>
          </div>
        </div>

        <BackupManager orderId={vps.orderId || resolvedParams.id} />
      </div>

      <VpsTerminalModal 
        isOpen={isTerminalOpen} 
        onClose={() => setIsTerminalOpen(false)} 
        vpsInstanceId={vps?.containerId}
      />
    </div>
  );
}
