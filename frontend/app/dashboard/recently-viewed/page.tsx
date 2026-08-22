'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { Clock, Trash2, AlertCircle, Server, ShoppingCart, Globe, FileText, Shield } from 'lucide-react';
import { useRecentlyViewed } from '@/src/hooks/useRecentlyViewed';

interface RecentlyViewed {
  id: string;
  type: 'service' | 'order' | 'vps' | 'domain' | 'article';
  title: string;
  description: string;
  url: string;
  viewedAt: string;
}

const colorMap: Record<string, string> = {
  blue: 'text-[#1F1F1F] bg-blue-100',
  emerald: 'text-emerald-600 bg-emerald-100',
  purple: 'text-purple-600 bg-purple-100',
  amber: 'text-amber-600 bg-amber-100',
  slate: 'text-slate-600 bg-slate-100',
};

export default function RecentlyViewedPage() {
  const { toast, showToast } = useToast();
  const { items, isLoading, error, fetchHistory, clearHistory, deleteItem } = useRecentlyViewed();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vps': return <Server className="w-5 h-5" />;
      case 'order': return <ShoppingCart className="w-5 h-5" />;
      case 'domain': return <Globe className="w-5 h-5" />;
      case 'article': return <FileText className="w-5 h-5" />;
      case 'service': return <Shield className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  const handleClearAll = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa lịch sử xem gần đây?')) return;
    await clearHistory();
    showToast('Đã xóa lịch sử xem', 'success');
  };

  const handleDeleteItem = async (id: string) => {
    await deleteItem(id);
    showToast('Đã xóa mục', 'success');
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
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => showToast('', 'info')} />
      )}
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Lịch sử xem gần đây</h1>
          <p className="text-slate-500 mt-1">Các trang bạn đã truy cập gần đây</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Xóa tất cả
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchHistory} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-xl border border-slate-200 p-4 hover:border-blue-200 hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[item.type]}`}>
                {getTypeIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <Link href={item.url} className="font-semibold text-slate-900 hover:text-[#1F1F1F] transition-colors">
                  {item.title}
                </Link>
                <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Đã xem: {new Date(item.viewedAt).toLocaleString('vi-VN')}
                </p>
              </div>

              <button
                onClick={() => handleDeleteItem(item.id || "")}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
          <p className="font-medium text-slate-500">Chưa có lịch sử xem</p>
          <p className="text-sm text-slate-600 mt-1">Các trang bạn xem sẽ hiển thị ở đây</p>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Khám phá dịch vụ
          </Link>
        </div>
      )}
    </div>
    </>
  );
}
