'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Server, Plus, Loader2, Cpu, MemoryStick, HardDrive, ArrowRight, ShieldCheck, Play, Square, Settings, Terminal, Activity } from 'lucide-react';
import { api } from '@/src/lib/api';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';

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

export default function VpsInstancesListPage() {
  const [instances, setInstances] = useState<VpsInstance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      const res = await api.get('/vpsinstances');
      setInstances(res.data || []);
    } catch (err) {
      console.error('Failed to load VPS instances', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-[#1F1F1F]" />
            Máy chủ ảo VPS
          </h1>
          <p className="text-sm text-slate-500 mt-1">Quản lý và giám sát các máy chủ Cloud VPS của bạn</p>
        </div>
        <Link 
          href="/services/cloud-vps"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Mua thêm VPS
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
        </div>
      ) : instances.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Server className="w-10 h-10 text-[#1F1F1F]" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Bạn chưa có máy chủ VPS nào</h3>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Bắt đầu triển khai ứng dụng của bạn với Cloud VPS tốc độ cao, khởi tạo chỉ trong vài giây.
          </p>
          <Link 
            href="/services/cloud-vps"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-600/20"
          >
            <Plus className="w-5 h-5" />
            Khởi tạo VPS ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {instances.map((vps) => {
            const isRunning = vps.status === 'Running' || vps.status === '2';
            
            return (
              <div key={vps.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition-all group flex flex-col">
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 shadow-inner">
                      <Server className="w-6 h-6 text-[#1F1F1F]" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg truncate max-w-[180px]" title={vps.containerName}>
                        {vps.containerName || 'azvps-unknown'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{vps.planName || 'Custom Plan'}</p>
                    </div>
                  </div>
                  <div>
                    <ProvisioningStatusBadge status={vps.status} />
                  </div>
                </div>

                <div className="p-5 space-y-4 flex-1">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                      <Cpu className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-slate-700">{vps.cpuCores} vCPU</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                      <MemoryStick className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-slate-700">{(vps.ramMb / 1024).toFixed(1)} GB</div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-3 text-center border border-slate-100">
                      <HardDrive className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                      <div className="text-sm font-bold text-slate-700">{vps.diskGb} GB</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-50">
                    <span>Hết hạn: <strong className="text-slate-700">{vps.expiresAt ? new Date(vps.expiresAt).toLocaleDateString('vi-VN') : 'N/A'}</strong></span>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center group-hover:bg-blue-50/50 transition-colors">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm" title="Terminal">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm" title="Settings">
                      <Settings className="w-4 h-4" />
                    </div>
                  </div>
                  <Link 
                    href={`/dashboard/vps-instances/${vps.id}`}
                    className="flex items-center gap-1.5 text-sm font-bold text-[#1F1F1F] hover:text-[#1F1F1F] transition-colors"
                  >
                    Quản lý <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
