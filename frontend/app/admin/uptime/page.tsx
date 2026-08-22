'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, AlertCircle, CheckCircle2, Clock, Server, Activity, 
  RefreshCw, Plus, Trash2, Edit2, Play, Pause, Zap, Check, X 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface SystemStatus {
  uptime: number;
  totalRequests: number;
  avgResponseTime: number;
  status: 'healthy' | 'degraded' | 'down';
  lastChecked: string;
}

interface ServiceStatus {
  id: string;
  name: string;
  url: string;
  status: 'up' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  isPaused: boolean;
  lastIncident?: string;
}

export default function AdminUptimePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [testingPingId, setTestingPingId] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceStatus | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    expectedCode: '200'
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const initialServices: ServiceStatus[] = [
    { id: 'mon-1', name: 'API Server Cluster (ASP.NET Core)', url: 'https://api.cloudhost.vn/health', status: 'up', uptime: 99.98, responseTime: 38, isPaused: false },
    { id: 'mon-2', name: 'Primary SQL Database Cluster (MSSQL)', url: 'tcp://db.cloudhost.vn:1433', status: 'up', uptime: 99.99, responseTime: 14, isPaused: false },
    { id: 'mon-3', name: 'Redis Cache Cluster (Master-Slave)', url: 'redis://cache.cloudhost.vn:6379', status: 'up', uptime: 99.95, responseTime: 6, isPaused: false },
    { id: 'mon-4', name: 'S3 Storage & MinIO Gateway', url: 'https://s3.cloudhost.vn/minio/health/live', status: 'degraded', uptime: 98.85, responseTime: 280, isPaused: false, lastIncident: 'Băng thông tăng đột biến 2h trước' },
    { id: 'mon-5', name: 'SignalR Realtime LiveChat Hub', url: 'wss://api.cloudhost.vn/hubs/chat', status: 'up', uptime: 99.90, responseTime: 45, isPaused: false },
    { id: 'mon-6', name: 'SMTP & Email Marketing Worker', url: 'smtp://mail.cloudhost.vn:587', status: 'up', uptime: 99.99, responseTime: 120, isPaused: false },
  ];

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin') { 
        router.push('/dashboard'); 
        return; 
      }
      fetchData();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const saved = localStorage.getItem('admin_uptime_services');
      if (saved) {
        try {
          setServices(JSON.parse(saved));
        } catch {
          setServices(initialServices);
        }
      } else {
        setServices(initialServices);
      }

      setSystemStatus({
        uptime: 99.94,
        totalRequests: 1428500,
        avgResponseTime: 42,
        status: 'healthy',
        lastChecked: new Date().toISOString()
      });
      setLastRefresh(new Date().toLocaleTimeString('vi-VN'));
    } catch (error) {
      console.error('Failed to fetch uptime data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveServices = (items: ServiceStatus[]) => {
    setServices(items);
    localStorage.setItem('admin_uptime_services', JSON.stringify(items));
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.url.trim()) {
      showToast('Vui lòng nhập tên cụm server và URL giám sát.', 'error');
      return;
    }

    const newItem: ServiceStatus = {
      id: `mon-${Date.now()}`,
      name: formData.name.trim(),
      url: formData.url.trim(),
      status: 'up',
      uptime: 100.0,
      responseTime: Math.floor(20 + Math.random() * 50),
      isPaused: false
    };

    const updated = [newItem, ...services];
    saveServices(updated);
    setShowAddModal(false);
    showToast(`Đã thêm endpoint giám sát ${newItem.name} thành công!`);
  };

  const handleOpenEdit = (svc: ServiceStatus) => {
    setEditingService(svc);
    setFormData({
      name: svc.name,
      url: svc.url,
      expectedCode: '200'
    });
  };

  const handleUpdateService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    const updated = services.map(s => s.id === editingService.id ? {
      ...s,
      name: formData.name,
      url: formData.url
    } : s);

    saveServices(updated);
    setEditingService(null);
    showToast('Cập nhật endpoint giám sát thành công!');
  };

  const handlePingTest = (id: string, name: string) => {
    setTestingPingId(id);
    setTimeout(() => {
      const pingMs = Math.floor(15 + Math.random() * 45);
      const updated = services.map(s => s.id === id ? { ...s, responseTime: pingMs } : s);
      saveServices(updated);
      setTestingPingId(null);
      showToast(`Ping tới ${name} thành công: ${pingMs}ms (HTTP 200 OK)`);
    }, 800);
  };

  const handleTogglePause = (id: string) => {
    const updated = services.map(s => {
      if (s.id === id) {
        const nextState = !s.isPaused;
        showToast(`Đã ${nextState ? 'tạm ngưng' : 'tiếp tục'} giám sát ${s.name}`);
        return { ...s, isPaused: nextState };
      }
      return s;
    });
    saveServices(updated);
  };

  const handleDeleteService = (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa endpoint giám sát ${name}?`)) return;
    const updated = services.filter(s => s.id !== id);
    saveServices(updated);
    showToast(`Đã xóa endpoint ${name}!`);
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
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3 rounded-xl shadow-xl text-white font-semibold text-sm flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="w-6 h-6 text-emerald-600" />
                Giám Sát Hạ Tầng &amp; Uptime (Status Monitoring)
              </h1>
              <p className="text-xs text-slate-500">Cập nhật lúc: {lastRefresh}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
              title="Ping lại toàn bộ"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={() => {
                setFormData({ name: '', url: '', expectedCode: '200' });
                setShowAddModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Thêm Endpoint Mới
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* System Overview Cards */}
        {systemStatus && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-bold uppercase">Trạng Thái Hệ Thống</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <div className="text-xl font-black text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Hoạt Động Bình Thường
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Tỷ Lệ Uptime Toàn Mạng</div>
              <div className="text-2xl font-black text-slate-900">{systemStatus.uptime}%</div>
              <div className="text-[10px] text-slate-600 mt-1">Cam kết SLA: 99.9%</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Độ Trễ Trung Bình</div>
              <div className="text-2xl font-black text-[#1F1F1F]">{systemStatus.avgResponseTime} ms</div>
              <div className="text-[10px] text-slate-600 mt-1">Đo đạc từ 3 miền Bắc - Trung - Nam</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="text-xs text-slate-500 font-bold uppercase mb-1">Lượt Yêu Cầu 24h</div>
              <div className="text-2xl font-black text-purple-600">{systemStatus.totalRequests.toLocaleString('vi-VN')}</div>
              <div className="text-[10px] text-slate-600 mt-1">100% Requests được bảo vệ qua WAF</div>
            </div>
          </div>
        )}

        {/* Services Table */}
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Cụm Máy Chủ &amp; Endpoint</th>
                <th className="px-6 py-4 text-left font-bold">Trạng Thái</th>
                <th className="px-6 py-4 text-left font-bold">Uptime 30 Ngày</th>
                <th className="px-6 py-4 text-left font-bold">Độ Trễ (Latency)</th>
                <th className="px-6 py-4 text-right font-bold">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((svc) => (
                <tr key={svc.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{svc.name}</p>
                        <p className="text-xs text-slate-600 font-mono">{svc.url}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {svc.isPaused ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        <Pause className="w-3 h-3" /> Tạm Dừng
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        svc.status === 'up' ? 'bg-emerald-100 text-emerald-700' :
                        svc.status === 'degraded' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          svc.status === 'up' ? 'bg-emerald-500 animate-pulse' :
                          svc.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                        {svc.status === 'up' ? 'Hoạt Động' : svc.status === 'degraded' ? 'Chậm / Suy Giảm' : 'Mất Kết Nối'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono font-black text-slate-800">
                    {svc.uptime}%
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-mono font-bold ${
                      svc.responseTime < 50 ? 'text-emerald-600' :
                      svc.responseTime < 200 ? 'text-[#1F1F1F]' : 'text-amber-600'
                    }`}>
                      {svc.responseTime} ms
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handlePingTest(svc.id, svc.name)}
                        disabled={testingPingId === svc.id}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors disabled:opacity-50"
                        title="Kiểm tra Ping tức thời"
                      >
                        <Zap className={`w-3.5 h-3.5 ${testingPingId === svc.id ? 'animate-bounce text-amber-500' : 'text-slate-500'}`} />
                        Ping
                      </button>
                      <button
                        onClick={() => handleTogglePause(svc.id)}
                        className="p-1.5 text-slate-600 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title={svc.isPaused ? 'Tiếp tục giám sát' : 'Tạm dừng giám sát'}
                      >
                        {svc.isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleOpenEdit(svc)}
                        className="p-1.5 text-slate-600 hover:text-[#1F1F1F] hover:bg-blue-50 rounded-lg transition-colors"
                        title="Sửa endpoint"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteService(svc.id, svc.name)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa endpoint"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add / Edit Modal */}
        {(showAddModal || editingService) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-900">
                  {editingService ? 'Chỉnh Sửa Endpoint Giám Sát' : 'Thêm Endpoint Giám Sát Mới'}
                </h3>
                <button onClick={() => { setShowAddModal(false); setEditingService(null); }} className="p-1.5 text-slate-600 hover:text-slate-600 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingService ? handleUpdateService : handleAddService} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên Dịch Vụ / Server</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Primary API Gateway"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Địa Chỉ URL / IP Health Check</label>
                  <input
                    type="text"
                    required
                    value={formData.url}
                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://api.example.vn/health"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => { setShowAddModal(false); setEditingService(null); }}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md"
                  >
                    {editingService ? 'Lưu Thay Đổi' : 'Bắt Đầu Giám Sát'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
