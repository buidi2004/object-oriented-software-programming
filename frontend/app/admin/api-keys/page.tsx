'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { Key, ShieldAlert, Trash2, ArrowLeft, RefreshCw, EyeOff, Eye } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function AdminApiKeysPage() {
  const { toast, showToast } = useToast();
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api-keys/admin');
      setApiKeys(response.data || []);
    } catch (err) {
      showToast('Lỗi khi tải danh sách API Keys', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn thu hồi API Key này? Người dùng sẽ không thể sử dụng key này nữa.')) return;
    try {
      await api.delete(`/api-keys/${id}`);
      showToast('Thu hồi API Key thành công', 'success');
      fetchApiKeys();
    } catch (err) {
      showToast('Lỗi khi thu hồi API Key', 'error');
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
      <div className="min-h-screen bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-slate-500 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
              </Link>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <Key className="w-6 h-6 text-purple-600" />
                Quản Lý API Keys
              </h1>
              <p className="text-slate-500 mt-1">Giám sát và thu hồi mã API Key của người dùng</p>
            </div>
            <button
              onClick={fetchApiKeys}
              className="p-2 rounded bg-[#1E293B] bg-opacity-70 backdrop-blur-md border border-white/10 hover:text-purple-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg border border-white/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="bg-[#0F172A]/80 border-b border-white/10 text-slate-500">
                  <tr>
                    <th className="p-4 font-semibold">Tên / Mô Tả</th>
                    <th className="p-4 font-semibold">Mã API Key (Hash)</th>
                    <th className="p-4 font-semibold">User ID</th>
                    <th className="p-4 font-semibold">Ngày Tạo</th>
                    <th className="p-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {apiKeys.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-500">Không có API Key nào</td>
                    </tr>
                  ) : (
                    apiKeys.map((key) => (
                      <tr key={key.id} className="hover:bg-[#0F172A]/50">
                        <td className="p-4 font-bold text-white">{key.name || 'API Key Khách'}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 font-mono text-xs bg-white/10 px-3 py-1.5 rounded-sm w-max">
                            sk_...{key.keyHash?.substring(0, 8)}
                          </div>
                        </td>
                        <td className="p-4 text-xs font-mono">{key.userId}</td>
                        <td className="p-4">{new Date(key.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleRevoke(key.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-rose-50 hover:bg-rose-100 font-medium text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" /> Thu Hồi
                          </button>
                        </td>
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
