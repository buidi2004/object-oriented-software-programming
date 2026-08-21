import React, { useState } from 'react';
import { MoreVertical, Pause, Play, Trash2 } from 'lucide-react';
import { ResourceStatus } from '../../hooks/useResourceProvisioning';

interface ResourceActionMenuProps {
  status: ResourceStatus;
  onSuspend?: () => void;
  onResume?: () => void;
  onTerminate?: () => void;
}

export function ResourceActionMenu({ status, onSuspend, onResume, onTerminate }: ResourceActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Chỉ hiện menu khi Resource đang Running hoặc Suspended
  // Provisioning hoặc Failed hoặc Terminated thì ko thao tác.
  const canAct = status === 'Running' || status === 'Active' || status === 'Suspended';
  if (!canAct) return <div className="w-8" />; // Placeholder để layout ko xô lệch

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
      >
        <MoreVertical className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 z-20 py-1 overflow-hidden">
            {(status === 'Running' || status === 'Active') && onSuspend && (
              <button 
                className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                onClick={() => { setIsOpen(false); onSuspend(); }}
              >
                <Pause className="w-4 h-4 text-slate-600" />
                Suspend Resource
              </button>
            )}

            {status === 'Suspended' && onResume && (
              <button 
                className="w-full px-4 py-2 text-left text-sm text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"
                onClick={() => { setIsOpen(false); onResume(); }}
              >
                <Play className="w-4 h-4 text-emerald-500" />
                Resume Resource
              </button>
            )}

            {onTerminate && (
              <>
                <div className="h-px bg-slate-100 my-1" />
                <button 
                  className="w-full px-4 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  onClick={() => {
                    setIsOpen(false);
                    if (confirm('Bạn có chắc chắn muốn hủy tài nguyên này? Hành động này sẽ xóa dữ liệu vĩnh viễn.')) {
                      onTerminate();
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4 text-rose-500" />
                  Terminate
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
