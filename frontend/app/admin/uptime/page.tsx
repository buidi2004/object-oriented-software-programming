'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, CheckCircle, Clock, Server, Activity, RefreshCw } from 'lucide-react';

interface SystemStatus {
  uptime: number;
  totalRequests: number;
  avgResponseTime: number;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
}

interface ServiceStatus {
  name: string;
  status: 'up' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  lastIncident?: string;
}

export default function AdminUptimePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        fetchData();
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchData = async () => {
    const token = localStorage.getItem('accessToken');
    try {
      const [statusRes, servicesRes] = await Promise.all([
        fetch('/api/uptime/system', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/vps-instances', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (statusRes.ok) {
        const data = await statusRes.json();
        setSystemStatus(data);
        setLastRefresh(new Date().toLocaleString('vi-VN'));
      }

      // Mock service statuses
      setServices([
        { name: 'API Server', status: 'up', uptime: 99.9, responseTime: 120 },
        { name: 'Database', status: 'up', uptime: 99.95, responseTime: 45 },
        { name: 'Redis Cache', status: 'up', uptime: 99.8, responseTime: 12 },
        { name: 'File Storage', status: 'degraded', uptime: 98.5, responseTime: 340, lastIncident: '2 giờ trước' },
        { name: 'Email Service', status: 'up', uptime: 99.99, responseTime: 200 },
        { name: 'WebSocket', status: 'up', uptime: 99.7, responseTime: 85 },
      ]);
    } catch (error) {
      console.error('Failed to fetch uptime data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': return 'text-emerald-600 bg-emerald-100';
      case 'degraded': return 'text-amber-600 bg-amber-100';
      case 'down': return 'text-red-600 bg-red-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up': return <CheckCircle className="w-5 h-5 text-emerald-600" />;
      case 'degraded': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'down': return <Activity className="w-5 h-5 text-red-600" />;
      default: return <Activity className="w-5 h-5 text-slate-400" />;
    }
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return 'text-emerald-600';
    if (uptime >= 99) return 'text-amber-600';
    return 'text-red-600';
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
              <h1 className="text-xl font-bold text-slate-900">Giám sát Uptime</h1>
              <p className="text-sm text-slate-500">Cập nhật lần cuối: {lastRefresh}</p>
            </div>
          </div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* System Status Card */}
        {systemStatus && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                  systemStatus.status === 'healthy' ? 'bg-emerald-100' :
                  systemStatus.status === 'degraded' ? 'bg-amber-100' : 'bg-red-100'
                }`}>
                  {getStatusIcon(systemStatus.status)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {systemStatus.status === 'healthy' ? 'Hoạt động tốt' :
                     systemStatus.status === 'degraded' ? 'Hoạt động chậm' : 'Sự cố'}
                  </h2>
                  <p className="text-slate-500 mt-1">
                    Uptime: <span className={`font-bold ${getUptimeColor(systemStatus.uptime)}`}>{systemStatus.uptime.toFixed(2)}%</span>
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-3xl font-bold text-slate-900">{systemStatus.totalRequests.toLocaleString()}</p>
                  <p className="text-sm text-slate-500">Tổng requests</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{systemStatus.avgResponseTime}ms</p>
                  <p className="text-sm text-slate-500">TB phản hồi</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-slate-900">{new Date(systemStatus.lastChecked).toLocaleTimeString('vi-VN')}</p>
                  <p className="text-sm text-slate-500">Kiểm tra cuối</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Status */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-blue-600" />
              Tình trạng dịch vụ
            </h3>
          </div>
          
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Dịch vụ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Uptime</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Phản hồi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Sự cố gần nhất</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {services.map((service) => (
                <tr key={service.name} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{service.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(service.status)}`}>
                      {getStatusIcon(service.status)}
                      {service.status === 'up' ? 'Hoạt động' :
                       service.status === 'degraded' ? 'Chậm' : 'Sự cố'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold ${getUptimeColor(service.uptime)}`}>
                      {service.uptime.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {service.responseTime}ms
                  </td>
                  <td className="px-6 py-4">
                    {service.lastIncident ? (
                      <span className="text-sm text-amber-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {service.lastIncident}
                      </span>
                    ) : (
                      <span className="text-sm text-slate-400">Không có</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-2xl font-bold text-emerald-700">
                  {services.filter(s => s.status === 'up').length}
                </p>
                <p className="text-sm text-emerald-600">Dịch vụ hoạt động</p>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold text-amber-700">
                  {services.filter(s => s.status === 'degraded').length}
                </p>
                <p className="text-sm text-amber-600">Dịch vụ chậm</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-3">
              <Activity className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-700">
                  {services.filter(s => s.status === 'down').length}
                </p>
                <p className="text-sm text-red-600">Dịch vụ gặp sự cố</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
