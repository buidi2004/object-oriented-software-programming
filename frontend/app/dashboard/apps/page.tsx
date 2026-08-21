'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Package, RefreshCw, LayoutTemplate, Plus, ShieldAlert, 
  ExternalLink, CheckCircle2, AlertCircle, ArrowLeft, AlertTriangle 
} from 'lucide-react';
import { api } from '@/src/lib/api';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useResourceProvisioningDetails } from '@/src/hooks/useResourceProvisioning';
import { ProvisioningStatusBadge } from '@/src/components/shared/ProvisioningStatusBadge';
import { ResourceFailureAlert } from '@/src/components/shared/ResourceFailureAlert';

interface AppInstallationItem {
  id: string;
  templateId?: string;
  appName?: string;
  templateName?: string;
  url?: string;
  customDomain?: string;
  port?: number;
  status: string;
  installedAt?: string;
  createdAt: string;
}

export default function UserAppInstallationsPage() {
  const { user } = useAuthStore();
  const [apps, setApps] = useState<AppInstallationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Form states
  const [templateId, setTemplateId] = useState('00000000-0000-0000-0000-000000000001'); // Adminer
  const [customDomain, setCustomDomain] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/app-installer/me');
      setApps(response.data || []);
    } catch (err) {
      console.warn('Lỗi khi tải danh sách Cài đặt Ứng dụng', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleInstall = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsInstalling(true);

    try {
      const res = await api.post('/app-installer/install', {
        templateId,
        customDomain,
      });

      const newId = res.data?.installationId || `app-${Date.now()}`;
      const templateLabel = templateId.endsWith('1') ? 'Adminer DB Manager' : 'Nginx Web Server';

      const newApp: AppInstallationItem = {
        id: newId,
        templateId,
        appName: templateLabel,
        templateName: templateLabel,
        customDomain,
        status: 'Provisioning',
        createdAt: new Date().toISOString(),
      };

      setApps((prev) => [newApp, ...prev]);
      setSuccess(`Đang khởi tạo ứng dụng "${templateLabel}" trên container Docker chuyên biệt...`);
      setIsCreateOpen(false);
      setCustomDomain('');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Lỗi khi cài đặt ứng dụng');
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/dashboard" className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
              <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-100 text-indigo-600">
                <Package className="w-7 h-7" />
              </div>
              Quản Lý 1-Click App Installer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Cài đặt các ứng dụng web và công cụ quản trị (Adminer, Nginx, WordPress...) tự động qua Docker Compose.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchApps}
              className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 transition-all shadow-sm"
              title="Làm mới"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Cài Đặt Ứng Dụng Mới
            </button>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> {success}
          </div>
        )}

        {/* Apps List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Danh Sách Ứng Dụng Đã Cài Đặt</h2>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-600">
              Tổng số: {apps.length} ứng dụng
            </span>
          </div>

          {isLoading && apps.length === 0 ? (
            <div className="p-12 text-center text-slate-600 text-sm flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              Đang tải danh sách ứng dụng...
            </div>
          ) : apps.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">Chưa Cài Đặt Ứng Dụng Nào</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Chọn mẫu ứng dụng phổ biến và cài đặt tức thì chỉ trong 1 phút.
              </p>
              <button
                onClick={() => setIsCreateOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-indigo-600 text-white font-bold text-xs shadow-md"
              >
                + Cài Đặt Ứng Dụng Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {apps.map((app) => (
                <AppRowItem key={app.id} app={app} onRefresh={fetchApps} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Create App */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-2 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" /> Cài Đặt Ứng Dụng Tự Động (1-Click)
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Chọn ứng dụng mẫu được đóng gói an toàn và tối ưu tài nguyên.
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleInstall} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ứng Dụng Mẫu (Template)</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-bold"
                >
                  <option value="00000000-0000-0000-0000-000000000001">Adminer (Quản lý Database Web UI)</option>
                  <option value="00000000-0000-0000-0000-000000000002">Nginx Web Server</option>
                  <option value="00000000-0000-0000-0000-000000000003">WordPress CMS (Standalone)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tên Miền Riêng (Tùy chọn)</label>
                <input
                  type="text"
                  placeholder="app.tenmien.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={isInstalling}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
                >
                  {isInstalling && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  Bắt Đầu Cài Đặt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AppRowItem({ app, onRefresh }: { app: AppInstallationItem; onRefresh: () => void }) {
  const { status, isProvisioning, isSlow, elapsedSeconds, slowWarningText } = useResourceProvisioningDetails(
    'AppInstallation',
    app.id,
    app.status
  );

  const displayName = app.appName || app.templateName || 'Web Application';
  const liveUrl = app.customDomain 
    ? `http://${app.customDomain}` 
    : (app.url || (app.port ? `http://localhost:${app.port}` : '#'));

  return (
    <div className="p-6 hover:bg-slate-50/60 transition-colors space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <LayoutTemplate className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm">{displayName}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                Docker Container
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              URL:{' '}
              {liveUrl !== '#' ? (
                <a href={liveUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                  {liveUrl}
                </a>
              ) : (
                'Đang chuẩn bị...'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ProvisioningStatusBadge status={status} elapsedSeconds={elapsedSeconds} isSlow={isSlow} />
          {(status === 'Running' || status === 'Active' || status === 'Installed') && liveUrl !== '#' ? (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 font-bold text-xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Mở App
            </a>
          ) : null}
        </div>
      </div>

      {/* Slow Warning Banner */}
      {isSlow && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>{slowWarningText}</span>
        </div>
      )}

      {/* Failed State Alert */}
      {status === 'Failed' && (
        <ResourceFailureAlert
          resourceName={`Ứng dụng ${displayName}`}
          onRetry={() => {
            onRefresh();
          }}
          supportHref="/dashboard/tickets"
        />
      )}
    </div>
  );
}
