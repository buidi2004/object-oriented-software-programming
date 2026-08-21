'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, MessageSquare, ChevronDown, ChevronUp, Terminal, ShieldAlert } from 'lucide-react';

interface ResourceFailureAlertProps {
  isAdmin?: boolean;
  resourceName?: string;
  errorMessage?: string;
  technicalDetails?: string;
  onRetry?: () => Promise<void> | void;
  onMarkFailed?: () => Promise<void> | void;
  supportHref?: string;
}

export function ResourceFailureAlert({
  isAdmin = false,
  resourceName = 'Tài nguyên',
  errorMessage,
  technicalDetails,
  onRetry,
  onMarkFailed,
  supportHref = '/dashboard/tickets',
}: ResourceFailureAlertProps) {
  const [showTechnical, setShowTechnical] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetryClick = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  if (isAdmin) {
    // Admin Technical Error Display
    return (
      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-black text-rose-800 text-sm flex items-center gap-2">
                Cấp phát thất bại ({resourceName})
              </div>
              <p className="text-rose-700 font-medium mt-0.5">
                {errorMessage || 'Docker Daemon trả về lỗi hoặc timeout trong quá trình khởi tạo container/resource.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {onRetry && (
              <button
                onClick={handleRetryClick}
                disabled={retrying}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-slate-900 font-bold transition-colors flex items-center gap-1.5 text-[11px] shadow-sm disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
                Force Retry
              </button>
            )}
            {onMarkFailed && (
              <button
                onClick={onMarkFailed}
                className="px-3 py-1.5 rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-100 font-bold transition-colors text-[11px]"
              >
                Đánh dấu Failed
              </button>
            )}
          </div>
        </div>

        {technicalDetails && (
          <div className="mt-3 pt-3 border-t border-rose-200/80">
            <button
              onClick={() => setShowTechnical(!showTechnical)}
              className="font-bold text-[11px] text-rose-700 hover:text-rose-900 flex items-center gap-1 mb-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              {showTechnical ? 'Ẩn Technical Stack Trace / Logs' : 'Xem Technical Stack Trace / Logs'}
              {showTechnical ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showTechnical && (
              <pre className="p-3 bg-white text-rose-300 rounded-xl font-mono text-[10px] overflow-x-auto whitespace-pre-wrap max-h-48">
                {technicalDetails}
              </pre>
            )}
          </div>
        )}
      </div>
    );
  }

  // Customer Friendly Error Display (No technical leaks)
  return (
    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-amber-900 text-sm">
              Không thể hoàn tất khởi tạo {resourceName}
            </div>
            <p className="text-amber-800 mt-0.5">
              Hệ thống đã tự động ghi nhận sự cố hạ tầng. Bạn có thể thử khởi tạo lại hoặc liên hệ đội ngũ hỗ trợ 24/7 để được giải quyết nhanh nhất.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-7 sm:ml-0 flex-shrink-0">
          {onRetry && (
            <button
              onClick={handleRetryClick}
              disabled={retrying}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors flex items-center gap-1.5 text-xs shadow-sm disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} />
              Thử lại
            </button>
          )}
          <Link
            href={supportHref}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 font-bold transition-colors flex items-center gap-1.5 text-xs"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Liên hệ hỗ trợ
          </Link>
        </div>
      </div>
    </div>
  );
}
