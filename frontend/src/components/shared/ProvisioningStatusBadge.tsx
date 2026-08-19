import React from 'react';
import { RefreshCw, CheckCircle, XCircle, PauseCircle, Trash2 } from 'lucide-react';
import { ResourceStatus } from '../../hooks/useResourceProvisioning';

interface ProvisioningStatusBadgeProps {
  status: ResourceStatus;
}

export function ProvisioningStatusBadge({ status }: ProvisioningStatusBadgeProps) {
  switch (status) {
    case 'Provisioning':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 border border-amber-200 text-amber-700 shadow-sm animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          Provisioning
        </span>
      );
    case 'Running':
    case 'Active':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm">
          <CheckCircle className="w-3.5 h-3.5" />
          Running
        </span>
      );
    case 'Failed':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 border border-rose-200 text-rose-700 shadow-sm">
          <XCircle className="w-3.5 h-3.5" />
          Failed
        </span>
      );
    case 'Suspended':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-50 border border-slate-200 text-slate-700 shadow-sm">
          <PauseCircle className="w-3.5 h-3.5" />
          Suspended
        </span>
      );
    case 'Terminated':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 border border-red-200 text-red-700 shadow-sm opacity-70">
          <Trash2 className="w-3.5 h-3.5" />
          Terminated
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 border border-slate-200 text-slate-700">
          {status || 'Unknown'}
        </span>
      );
  }
}
