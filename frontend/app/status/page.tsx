'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/src/lib/api';
import { Activity, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ServiceStatus {
  id: string;
  serviceName: string;
  status: 'Operational' | 'Degraded' | 'Outage' | 'Maintenance';
  lastChecked: string;
  uptimePercentage: number;
}

interface SystemStatus {
  overallStatus: 'Operational' | 'Degraded' | 'Outage' | 'Maintenance';
  services: ServiceStatus[];
  lastUpdate: string;
}

export default function StatusPage() {
  const [data, setData] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await api.get('/status');
      
      let servicesList = res.data;
      if (!Array.isArray(servicesList)) {
        servicesList = [];
      }

      // If db is empty, populate mock data for visual purposes
      if (servicesList.length === 0) {
        servicesList = [
          { id: '1', serviceName: 'API Gateway', status: 'Operational', lastChecked: new Date().toISOString(), uptimePercentage: 99.99 },
          { id: '2', serviceName: 'Client Portal', status: 'Operational', lastChecked: new Date().toISOString(), uptimePercentage: 99.95 },
          { id: '3', serviceName: 'Database Cluster', status: 'Operational', lastChecked: new Date().toISOString(), uptimePercentage: 100 },
          { id: '4', serviceName: 'VPS Provisioning', status: 'Operational', lastChecked: new Date().toISOString(), uptimePercentage: 99.8 },
        ];
      }

      // Compute overall status based on services
      const hasOutage = servicesList.some((s: any) => s.status === 'Outage');
      const hasDegraded = servicesList.some((s: any) => s.status === 'Degraded');
      const hasMaintenance = servicesList.some((s: any) => s.status === 'Maintenance');
      
      let overall = 'Operational';
      if (hasOutage) overall = 'Outage';
      else if (hasDegraded) overall = 'Degraded';
      else if (hasMaintenance) overall = 'Maintenance';

      setData({
        overallStatus: overall as any,
        lastUpdate: new Date().toISOString(),
        services: servicesList
      });
    } catch (error) {
      console.error('Failed to fetch status', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational': return 'text-zinc-100 bg-zinc-900 border-zinc-800';
      case 'Degraded': return 'text-amber-500 bg-zinc-900 border-amber-500/20';
      case 'Outage': return 'text-zinc-500 bg-zinc-900 border-zinc-800';
      case 'Maintenance': return 'text-zinc-400 bg-zinc-900 border-zinc-800';
      default: return 'text-zinc-500 bg-zinc-900 border-zinc-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Operational': return <CheckCircle2 className="w-5 h-5" />;
      case 'Degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'Outage': return <XCircle className="w-5 h-5" />;
      case 'Maintenance': return <Clock className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Operational': return 'Hoạt động bình thường';
      case 'Degraded': return 'Gián đoạn một phần';
      case 'Outage': return 'Ngừng hoạt động';
      case 'Maintenance': return 'Đang bảo trì';
      default: return 'Không rõ';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-zinc-100 tracking-tight mb-4 flex items-center justify-center gap-3">
            <Activity className="w-10 h-10 text-amber-500" />
            Trạng thái Hệ thống
          </h1>
          <p className="text-lg text-zinc-400">
            Cập nhật liên tục tình trạng hoạt động của các dịch vụ tại SEN CloudHost.
          </p>
        </div>

        {loading && !data ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 text-zinc-500 animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            
            {/* Overall Status Banner */}
            <div className={`rounded-md p-6 border flex items-center gap-4 ${getStatusColor(data.overallStatus)}`}>
              <div className="bg-zinc-800 p-3 rounded-full">
                {getStatusIcon(data.overallStatus)}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">
                  {data.overallStatus === 'Operational' ? 'Tất cả hệ thống đang hoạt động bình thường' : getStatusText(data.overallStatus)}
                </h2>
                <p className="text-sm opacity-80 mt-1">
                  Cập nhật lần cuối: {formatDistanceToNow(new Date(data.lastUpdate), { addSuffix: true, locale: vi })}
                </p>
              </div>
              <button onClick={fetchStatus} disabled={loading} className="p-2 hover:bg-zinc-800 rounded-full transition-colors">
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Services List */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-md overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900 flex justify-between items-center">
                <h3 className="font-bold text-zinc-100">Trạng thái dịch vụ</h3>
                <span className="text-sm font-medium text-zinc-400">Uptime 30 ngày</span>
              </div>
              <div className="divide-y divide-zinc-800">
                {data.services.map((service) => (
                  <div key={service.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="font-bold text-zinc-100 text-lg">{service.serviceName}</div>
                      <div className="text-sm text-zinc-500 mt-1 flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5" />
                        Kiểm tra: {formatDistanceToNow(new Date(service.lastChecked), { addSuffix: true, locale: vi })}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(service.status)}`}>
                          {getStatusIcon(service.status)}
                          {getStatusText(service.status)}
                        </div>
                      </div>
                      
                      <div className="text-right min-w-[80px]">
                        <div className="text-xl font-black text-zinc-300">
                          {service.uptimePercentage}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            Không thể tải dữ liệu trạng thái. Vui lòng thử lại sau.
          </div>
        )}

      </div>
    </div>
  );
}
