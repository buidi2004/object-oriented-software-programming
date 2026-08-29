'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Package, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { api } from '@/src/lib/api';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';

interface AdminAppDto {
  id: string;
  templateName?: string;
  appName?: string;
  ownerEmail?: string;
  url?: string;
  port?: number;
  containerId?: string;
  status: string;
  failureReason?: string;
  createdAt: string;
}

export default function AdminAppInstallationsPage() {
  const [apps, setApps] = useState<AdminAppDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [isCreating, setIsCreating] = useState(false);
  const [editingApp, setEditingApp] = useState<AdminAppDto | null>(null);
  const [createForm, setCreateForm] = useState({
    appName: 'WordPress'
  });
  const [editForm, setEditForm] = useState({
    installUrl: ''
  });

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/app-installer').catch(() => api.get('/app-installer/me'));
      setApps(res.data || []);
    } catch (error) {
      console.warn('Failed to fetch app installations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/app-installer', {
        appName: createForm.appName
      });
      setIsCreating(false);
      alert('Đã bắt đầu cài đặt ứng dụng!');
      fetchApps();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi cài đặt ứng dụng');
    }
  };

  const handleUpdateApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;
    try {
      await api.put(`/admin/app-installer/${editingApp.id}`, {
        installUrl: editForm.installUrl
      });
      setEditingApp(null);
      alert('Cập nhật ứng dụng thành công!');
      fetchApps();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi cập nhật ứng dụng');
    }
  };

  const handleDeleteApp = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn gỡ cài đặt ứng dụng ${name}?`)) return;
    try {
      await api.delete(`/admin/app-installer/${id}`);
      alert('Đã gỡ cài đặt ứng dụng thành công!');
      fetchApps();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Lỗi khi gỡ cài đặt');
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filteredApps = apps.filter((a) => {
    const name = a.appName || a.templateName || '';
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.ownerEmail ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-[#1F1F1F]" />
                Quản lý 1-Click App Installations (Admin)
              </h1>
              <p className="text-xs text-slate-600">{apps.length} ứng dụng đã triển khai</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreating(true)}
              className="px-3.5 py-1.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              + Cài Đặt Ứng Dụng
            </button>
            <button
              onClick={fetchApps}
              className="p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="bg-white rounded-md p-4 border border-slate-200 flex flex-wrap gap-4 items-center shadow-sm">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
            <input
              type="text"
              placeholder="Tìm theo tên ứng dụng, email, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded border border-slate-200 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="Running">Running / Installed</option>
            <option value="Provisioning">Provisioning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-900 border-b border-slate-200 font-extrabold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-6 py-4">Tên Ứng Dụng</th>
                  <th className="px-6 py-4">Khách Hàng</th>
                  <th className="px-6 py-4">Mẫu Template &amp; Port</th>
                  <th className="px-6 py-4">URL Ứng Dụng</th>
                  <th className="px-6 py-4">Trạng Thái</th>
                  <th className="px-6 py-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.map((a) => {
                  const displayName = a.appName || a.templateName || 'Adminer';
                  const liveUrl = a.url || (a.port ? `http://localhost:${a.port}` : '#');

                  return (
                    <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{displayName}</div>
                        <div className="text-[10px] font-mono text-slate-600 mt-0.5">ID: {a.id}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">{a.ownerEmail || 'customer@cloudhost.vn'}</td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#1F1F1F]">{displayName}</span>
                        <div className="font-mono text-[11px] text-slate-600 mt-0.5">Port: {a.port || '-'}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px]">
                        {liveUrl !== '#' ? (
                          <a href={liveUrl} target="_blank" rel="noreferrer" className="text-[#1F1F1F] hover:underline flex items-center gap-1">
                            {liveUrl} <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <AdminAppStatusCell app={a} />
                      </td>
                      <td className="px-6 py-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEditingApp(a);
                            setEditForm({
                              installUrl: a.url || ''
                            });
                          }}
                          className="px-2.5 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold transition-colors text-[11px]"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDeleteApp(a.id, displayName)}
                          className="px-2.5 py-1.5 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold transition-colors text-[11px]"
                        >
                          Gỡ bỏ
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-medium">Không tìm thấy ứng dụng nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Modal Cài Đặt App */}
      {isCreating && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Cài Đặt Ứng Dụng Mới (1-Click)
            </h3>
            <form onSubmit={handleCreateApp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Chọn Mẫu Ứng Dụng</label>
                <select
                  value={createForm.appName}
                  onChange={(e) => setCreateForm({ appName: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="WordPress">WordPress 6.4 + MySQL</option>
                  <option value="Node-RED">Node-RED IoT Hub</option>
                  <option value="Nextcloud">Nextcloud Enterprise Storage</option>
                  <option value="Adminer">Adminer Database Manager</option>
                  <option value="Ghost">Ghost Publishing Platform</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                >
                  Bắt Đầu Cài Đặt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Sửa Cấu Hình App */}
      {editingApp && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Sửa URL Ứng Dụng</h3>
            <form onSubmit={handleUpdateApp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đường Dẫn URL Ứng Dụng</label>
                <input
                  type="text"
                  required
                  value={editForm.installUrl}
                  onChange={(e) => setEditForm({ installUrl: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Lưu Thay Đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminAppStatusCell({ app }: { app: AdminAppDto }) {
  const { status, isProvisioning, isSlow, elapsedSeconds } = useResourceProvisioningDetails(
    'AppInstallation',
    app.id,
    app.status
  );

  return (
    <div className="space-y-1">
      <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
      {app.failureReason && (
        <div className="text-[10px] text-rose-600 font-mono bg-rose-50 p-1.5 rounded-sm max-w-[220px] truncate" title={app.failureReason}>
          {app.failureReason}
        </div>
      )}
    </div>
  );
}
