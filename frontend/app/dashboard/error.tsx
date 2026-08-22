'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-16 px-4">
      <div className="max-w-md w-full bg-white rounded-md border border-slate-200 p-8 text-center shadow-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-slate-900 mb-2">Đã xảy ra lỗi</h1>
        <p className="text-sm text-slate-600 mb-6">Không thể tải trang dashboard. Vui lòng thử lại.</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm"
          >
            <RefreshCw className="w-4 h-4" /> Thử lại
          </button>
          <Link href="/dashboard" className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold text-sm">
            Về tổng quan
          </Link>
        </div>
      </div>
    </div>
  );
}
