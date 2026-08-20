import React from 'react';
import { RefreshCw, CheckCircle, XCircle, PauseCircle, Trash2, Clock } from 'lucide-react';
import { ResourceStatus } from '../../hooks/useResourceProvisioning';

interface ProvisioningStatusBadgeProps {
  status: ResourceStatus;
  elapsedSeconds?: number;
  isSlow?: boolean;
}

export function ProvisioningStatusBadge({ status, elapsedSeconds, isSlow }: ProvisioningStatusBadgeProps) {
  switch (status) {
    case 'Pending':
    case 'Provisioning':
    case 'Deploying':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm ${
          isSlow 
            ? 'bg-amber-100 border border-amber-300 text-amber-800 animate-pulse' 
            : 'bg-blue-50 border border-blue-200 text-blue-700'
        }`}>
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          {status === 'Deploying' ? 'Đang deploy' : 'Đang khởi tạo'}
          {elapsedSeconds !== undefined && elapsedSeconds > 0 && (
            <span className="opacity-75 font-mono">({elapsedSeconds}s)</span>
          )}
        </span>
      );
    case 'Running':
    case 'Active':
    case 'Ready':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          Hoạt động
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 border border-rose-200 text-rose-700 shadow-sm">
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Thất bại
        </span>
      );
    case 'Suspended':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-700 shadow-sm">
          <PauseCircle className="w-3.5 h-3.5 text-slate-500" />
          Tạm dừng
        </span>
      );
    case 'Terminated':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 border border-slate-200 text-slate-500 opacity-70">
          <Trash2 className="w-3.5 h-3.5" />
          Đã hủy
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 border border-slate-200 text-slate-700">
          <Clock className="w-3.5 h-3.5" />
          {status || 'Unknown'}
        </span>
      );
  }
}
