'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { ShieldCheck, ArrowLeft, RefreshCw, AlertTriangle, Shield, CheckCircle } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function AdminSecurityAddonsPage() {
  const { toast, showToast } = useToast();
  const [addons, setAddons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAddons();
  }, []);

  const fetchAddons = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/security');
      setAddons(response.data || []);
    } catch (err) {
      showToast('Lỗi khi tải danh sách Security Addons', 'error');
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

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#1F1F1F]"><RefreshCw className="w-3 h-3 animate-spin"/> Scanning</span>;
      case 2: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3"/> Clean</span>;
      case 3: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700"><AlertTriangle className="w-3 h-3"/> Threats Found</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Unknown</span>;
    }
  };

  const getTypeBadge = (type: number) => {
    switch (type) {
      case 1: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-indigo-100 text-[#1F1F1F]"><Shield className="w-3 h-3"/> WAF</span>;
      case 2: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700"><AlertTriangle className="w-3 h-3"/> Malware Scan</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">Unknown</span>;
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', 'info')} />}
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-slate-600 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
              </Link>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                Quản Lý Security Add-ons
              </h1>
              <p className="text-slate-600 mt-1">Giám sát các gói bảo mật (WAF, Scan) của người dùng</p>
            </div>
            <button
              onClick={fetchAddons}
              className="p-2 rounded bg-white border border-slate-200 hover:text-emerald-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="p-4 font-semibold">User ID</th>
                    <th className="p-4 font-semibold">Tài Nguyên Đích</th>
                    <th className="p-4 font-semibold">Loại Bảo Mật</th>
                    <th className="p-4 font-semibold">Trạng Thái Scan</th>
                    <th className="p-4 font-semibold">Đăng Ký Lúc</th>
                    <th className="p-4 font-semibold">Hết Hạn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {addons.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-600">Không có Addon nào đang hoạt động</td>
                    </tr>
                  ) : (
                    addons.map((addon) => (
                      <tr key={addon.id} className="hover:bg-slate-50/50">
                        <td className="p-4 text-xs font-mono">{addon.userId}</td>
                        <td className="p-4 font-bold text-slate-900">{addon.targetResourceId}</td>
                        <td className="p-4">{getTypeBadge(addon.addonType)}</td>
                        <td className="p-4">{getStatusBadge(addon.scanStatus)}</td>
                        <td className="p-4">{new Date(addon.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4">{addon.expiresAt ? new Date(addon.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}</td>
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
