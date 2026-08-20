'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { Package, ArrowLeft, RefreshCw, LayoutTemplate } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function AdminAppInstallationsPage() {
  const { toast, showToast } = useToast();
  const [apps, setApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/app-installer/admin');
      setApps(response.data || []);
    } catch (err) {
      showToast('Lỗi khi tải danh sách Cài đặt Ứng dụng', 'error');
    } finally {
      setIsLoading(false);
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
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-slate-500 hover:text-blue-600 flex items-center gap-1 mb-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
              </Link>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-indigo-600" />
                Quản Lý Ứng Dụng (App Installer)
              </h1>
              <p className="text-slate-500 mt-1">Lịch sử cài đặt các ứng dụng Web (WordPress, Laravel...) của khách hàng</p>
            </div>
            <button
              onClick={fetchApps}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:text-indigo-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-4 font-semibold">User ID</th>
                    <th className="p-4 font-semibold">Tên Ứng Dụng</th>
                    <th className="p-4 font-semibold">Phiên Bản</th>
                    <th className="p-4 font-semibold">Tài Khoản Hosting</th>
                    <th className="p-4 font-semibold">Cài Đặt Lúc</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {apps.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Chưa có ứng dụng nào được cài đặt</td>
                    </tr>
                  ) : (
                    apps.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50">
                        <td className="p-4 text-xs font-mono">{app.userId}</td>
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-2">
                          <LayoutTemplate className="w-4 h-4 text-slate-400" />
                          {app.appName}
                        </td>
                        <td className="p-4">v{app.version}</td>
                        <td className="p-4 font-mono text-xs">{app.hostingAccountId}</td>
                        <td className="p-4">{new Date(app.installedAt).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
