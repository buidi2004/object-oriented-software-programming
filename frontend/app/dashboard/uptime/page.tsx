'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, Clock, Activity, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { api } from '@/src/lib/api';

interface UptimeData {
  period: string;
  uptime: number;
  downtime: number;
  incidents: number;
}

interface Incident {
  id: string;
  date: string;
  duration: string;
  service: string;
  description: string;
  resolved: boolean;
}

export default function DashboardUptimePage() {
  const [uptimeData, setUptimeData] = useState<UptimeData[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const [statusRes, sysRes, ordersRes] = await Promise.all([
        api.get('/status').catch(() => ({ data: null })),
        api.get('/uptime/system').catch(() => ({ data: [] })),
        api.get('/orders/me?status=Active').catch(() => ({ data: [] }))
      ]);

      let allLogs: any[] = sysRes.data || [];
      const orders = ordersRes.data || [];
      
      // Fetch uptime for each order
      for (const order of orders) {
        try {
          const orderUptimeRes = await api.get(`/uptime/order/${order.id}`);
          if (orderUptimeRes.data && Array.isArray(orderUptimeRes.data)) {
            allLogs = [...allLogs, ...orderUptimeRes.data];
          }
        } catch (e) {
          // ignore individual order fetch errors
        }
      }

      if (allLogs.length > 0) {
        const total = allLogs.length;
        const upCount = allLogs.filter(l => l.isUp).length;
        const downCount = total - upCount;
        const uptimePercent = (upCount / total) * 100;
        
        setUptimeData([
          { period: 'Hôm nay', uptime: uptimePercent, downtime: downCount * 5, incidents: downCount > 0 ? 1 : 0 },
          { period: 'Tuần này', uptime: uptimePercent, downtime: downCount * 5, incidents: downCount > 0 ? 1 : 0 },
          { period: 'Tháng này', uptime: uptimePercent, downtime: downCount * 5, incidents: downCount > 0 ? 1 : 0 },
          { period: '30 ngày qua', uptime: uptimePercent, downtime: downCount * 5, incidents: downCount > 0 ? 1 : 0 },
        ]);

        const downLogs = allLogs.filter(l => !l.isUp);
        setIncidents(downLogs.map((l, i) => ({
          id: l.id || `inc-${i}`,
          date: new Date(l.checkedAt).toLocaleDateString('vi-VN'),
          duration: '5 phút',
          service: l.servicePlanId ? 'Hệ thống' : 'Dịch vụ của bạn',
          description: 'Phát hiện gián đoạn kết nối (Ping timeout)',
          resolved: true
        })));
      } else {
        // Fallback to 100% if no logs yet
        setUptimeData([
          { period: 'Hôm nay', uptime: 100, downtime: 0, incidents: 0 },
          { period: 'Tuần này', uptime: 100, downtime: 0, incidents: 0 },
          { period: 'Tháng này', uptime: 100, downtime: 0, incidents: 0 },
          { period: '30 ngày qua', uptime: 100, downtime: 0, incidents: 0 },
        ]);
        setIncidents([]);
      }
    } catch (err) {
      console.error('Failed to fetch uptime data:', err);
      setError('Không thể tải dữ liệu uptime.');
    } finally {
      setIsLoading(false);
    }
  };

  const getUptimeColor = (uptime: number): string => {
    if (uptime >= 99.9) return 'text-emerald-600';
    if (uptime >= 99) return 'text-amber-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tình trạng hệ thống</h1>
          <p className="text-slate-500 mt-1">Theo dõi uptime và các sự cố gần đây</p>
        </div>
        <button
          onClick={fetchData}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
          title="Làm mới"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchData} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {/* Uptime Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {uptimeData.map((data, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-500 mb-2">{data.period}</p>
            <p className={`text-3xl font-black ${getUptimeColor(data.uptime)}`}>
              {data.uptime.toFixed(1)}%
            </p>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
              <span>{data.downtime} phút off</span>
              <span>{data.incidents} sự cố</span>
            </div>
          </div>
        ))}
      </div>

      {/* Incidents */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">Lịch sử sự cố</h2>
        </div>

        <div className="divide-y divide-slate-100">
          {incidents.map((incident) => (
            <div key={incident.id} className="px-6 py-4">
              <button
                onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    incident.resolved ? 'bg-emerald-100' : 'bg-amber-100'
                  }`}>
                    <Clock className={`w-5 h-5 ${
                      incident.resolved ? 'text-emerald-600' : 'text-amber-600'
                    }`} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{incident.service}</p>
                    <p className="text-sm text-slate-500">{incident.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">{incident.duration}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    incident.resolved ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {incident.resolved ? 'Đã khắc phục' : 'Đang xử lý'}
                  </span>
                  {expandedId === incident.id ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </div>
              </button>

              {expandedId === incident.id && (
                <div className="mt-4 ml-14 p-4 bg-slate-50 rounded-lg text-sm text-slate-600">
                  {incident.description}
                </div>
              )}
            </div>
          ))}
        </div>

        {incidents.length === 0 && !error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">Không có sự cố nào được ghi nhận</p>
            <p className="text-sm text-slate-400 mt-1">Hệ thống hoạt động ổn định</p>
          </div>
        )}
      </div>
      </div>
  );
}
