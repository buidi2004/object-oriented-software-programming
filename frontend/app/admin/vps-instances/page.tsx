'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Server, Play, Power, RefreshCw, Terminal, AlertCircle, CheckCircle2, Cpu, Database, HardDrive } from 'lucide-react';

interface VpsInstance {
  id: string;
  name: string;
  ip: string;
  status: 'running' | 'stopped' | 'rebooting';
  cpu: number;
  ram: number;
  disk: number;
  os: string;
  datacenter: string;
  orderId: string;
  customerName: string;
  createdAt: string;
  uptimeDays: number;
}

export default function AdminVpsInstancesPage() {
  const router = useRouter();
  const [instances, setInstances] = useState<VpsInstance[]>([]);
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
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchInstances = async (token: string) => {
    try {
      const response = await fetch('/api/vps-instances', {
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

  const handleTogglePower = async (instanceId: string, isOn: boolean) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/vps-instances/${instanceId}/power`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ power: isOn ? 'on' : 'off' }),
      });
      if (response.ok) {
        fetchInstances(token!);
      }
    } catch (error) {
      console.error('Failed to toggle power:', error);
    }
  };

  const handleReboot = async (instanceId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/vps-instances/${instanceId}/reboot`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchInstances(token!);
      }
    } catch (error) {
      console.error('Failed to reboot:', error);
    }
  };

  const filteredInstances = instances.filter(instance => {
    const matchesSearch = instance.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         instance.ip.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || instance.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-emerald-100 text-emerald-700';
      case 'stopped': return 'bg-red-100 text-red-700';
      case 'rebooting': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

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
              {instances.filter(i => i.status === 'running').length} Running
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-sm font-semibold">
              {instances.filter(i => i.status === 'stopped').length} Stopped
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
              placeholder="Tìm kiếm theo tên hoặc IP..."
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
            <option value="running">Running</option>
            <option value="stopped">Stopped</option>
            <option value="rebooting">Rebooting</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInstances.map((instance) => (
            <div key={instance.id} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Server className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{instance.name}</h3>
                    <p className="text-xs font-mono text-slate-500">{instance.ip}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(instance.status)}`}>
                  {instance.status === 'running' ? 'Running' : 
                   instance.status === 'stopped' ? 'Stopped' : 'Rebooting'}
                </span>
              </div>

              <div className="space-y-2 mb-4 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />CPU</span>
                  <span className="font-semibold">{instance.cpu} vCPU</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><Database className="w-3.5 h-3.5" />RAM</span>
                  <span className="font-semibold">{instance.ram} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5" />Disk</span>
                  <span className="font-semibold">{instance.disk} GB NVMe</span>
                </div>
                <div className="flex justify-between">
                  <span>OS</span>
                  <span className="font-semibold">{instance.os}</span>
                </div>
                <div className="flex justify-between">
                  <span>Datacenter</span>
                  <span className="font-semibold">{instance.datacenter}</span>
                </div>
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="font-semibold">{instance.customerName}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleTogglePower(instance.id, instance.status === 'stopped')}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                    instance.status === 'stopped'
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-red-100 text-red-700 hover:bg-red-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {instance.status === 'stopped' ? 'Bật' : 'Tắt'}
                </button>
                <button
                  onClick={() => handleReboot(instance.id)}
                  disabled={instance.status === 'rebooting'}
                  className="px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 text-xs font-semibold hover:bg-blue-200 transition-colors">
                  <Terminal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
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
