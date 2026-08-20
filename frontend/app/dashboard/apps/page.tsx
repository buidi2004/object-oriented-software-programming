'use client';

import React, { useState, useEffect } from 'react';
import { Toast, useToast } from '@/components/Toast';
import { Package, RefreshCw, LayoutTemplate, Plus, ShieldAlert } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function UserAppInstallationsPage() {
  const { toast, showToast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/app-installer/me');
      setApps(response.data || []);
    } catch (err) {
      showToast('Lỗi khi tải danh sách Cài đặt Ứng dụng', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInstallDummy = async () => {
    setIsInstalling(true);
    try {
      await api.post('/app-installer/install', {
        appName: 'WordPress',
        version: '6.4.2',
        hostingAccountId: '00000000-0000-0000-0000-000000000000'
      });
      showToast('Đã tạo yêu cầu cài đặt WordPress (Dummy)!', 'success');
      fetchApps();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Lỗi khi cài đặt', 'error');
    } finally {
      setIsInstalling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', 'info')} />}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-600" />
              App Installer
            </h1>
            <p className="text-slate-500 mt-1">Cài đặt mã nguồn tự động (WordPress, Laravel, Node.js...) lên Hosting của bạn.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchApps}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleInstallDummy}
              disabled={isInstalling}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold transition-colors disabled:opacity-50"
            >
              {isInstalling ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
              Cài mới (Test)
            </button>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
          <ShieldAlert className="w-6 h-6 text-amber-600 flex-shrink-0" />
          <div className="text-sm text-amber-800">
            <strong className="block mb-1 text-amber-900">Tính năng đang trong giai đoạn Beta!</strong>
            Hiện tại bạn chỉ có thể xem lịch sử cài đặt hoặc dùng nút "Cài mới (Test)" để giả lập gọi API cài đặt WordPress. Giao diện chọn Hosting thực tế sẽ sớm được cập nhật.
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="p-4 font-semibold">Tên Ứng Dụng</th>
                  <th className="p-4 font-semibold">Phiên Bản</th>
                  <th className="p-4 font-semibold">Tài Khoản Hosting ID</th>
                  <th className="p-4 font-semibold">Cài Đặt Lúc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apps.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Bạn chưa cài đặt ứng dụng nào.</td>
                  </tr>
                ) : (
                  apps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                        <LayoutTemplate className="w-4 h-4 text-slate-400" />
                        {app.appName}
                      </td>
                      <td className="p-4 font-mono">v{app.version}</td>
                      <td className="p-4 font-mono text-xs">{app.hostingAccountId}</td>
                      <td className="p-4">{new Date(app.installedAt).toLocaleString('vi-VN')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
