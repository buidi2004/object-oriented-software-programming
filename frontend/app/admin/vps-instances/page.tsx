'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Server, AlertCircle, Cpu, Database, HardDrive } from 'lucide-react';
import { getVpsStatusMeta, formatRamMb } from '@/src/utils/vpsStatus';

interface VpsInstanceDto {
  id: string;
  containerName: string;
  containerId: string;
  status: string;
  cpuCores: number;
  ramMb: number;
  diskGb?: number;
  planName: string;
  customerEmail?: string;
  createdAt: string;
  expiresAt: string;
}

export default function AdminVpsInstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<VpsInstanceDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') {
          router.push('/dashboard');
          return;
        }
        fetchInstances(token);
      } else {
        router.push('/login');
      }
    } catch {
      router.push('/login');
    }
  };

  const fetchInstances = async (token: string) => {
    try {
      const response = await fetch('/api/VpsInstances/admin', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setInstances(data);
      }
    } catch (error) {
      console.error('Failed to fetch instances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProvisionVps = async (orderId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch('/api/vpsinstances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId })
      });
      fetchInstances(token!);
      alert('Đã gửi yêu cầu khởi tạo VPS!');
    } catch (err) {
      console.error('Failed to provision VPS', err);
    }
  };

  const filteredInstances = instances.filter((instance) => {
    const matchesSearch =
      instance.containerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (instance.customerEmail ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      instance.containerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || instance.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const runningCount = instances.filter((i) => i.status === 'Running').length;
  const stoppedCount = instances.filter((i) => i.status === 'Terminated' || i.status === 'Failed').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý VPS Instances</h1>
              <p className="text-sm text-slate-500">{instances.length} instances tổng cộng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {runningCount} Running
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-semibold">
              {stoppedCount} Stopped/Failed
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên, email, container ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Running">Running</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Terminated">Terminated</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstances.map((instance) => {
            const statusMeta = getVpsStatusMeta(instance.status);
            return (
              <div key={instance.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-200 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Server className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{instance.containerName}</h3>
                      <p className="text-xs font-mono text-slate-500">{instance.containerId.substring(0, 12)}...</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusMeta.color}`}>
                    {statusMeta.label}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />CPU</span>
                    <span className="font-semibold">{instance.cpuCores} vCPU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" />RAM</span>
                    <span className="font-semibold">{formatRamMb(instance.ramMb)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" />Disk</span>
                    <span className="font-semibold">{instance.diskGb ? `${instance.diskGb} GB` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Plan</span>
                    <span className="font-semibold">{instance.planName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Customer</span>
                    <span className="font-semibold">{instance.customerEmail ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Hết hạn</span>
                    <span className="font-semibold">{new Date(instance.expiresAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredInstances.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Không tìm thấy instance nào</p>
          </div>
        )}
      </main>
    </div>
  );
}
