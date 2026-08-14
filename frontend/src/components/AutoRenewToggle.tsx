'use client';

import React, { useState } from 'react';
import { RefreshCcw, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface AutoRenewToggleProps {
  orderId: string;
  initialState?: boolean;
}

export default function AutoRenewToggle({ orderId, initialState = false }: AutoRenewToggleProps) {
  const [isAutoRenew, setIsAutoRenew] = useState(initialState);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      await api.put('/auto-renew/toggle', { orderId });
      setIsAutoRenew(!isAutoRenew);
    } catch (error) {
      console.error('Failed to toggle auto renew', error);
      alert('Không thể thay đổi trạng thái gia hạn tự động.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isAutoRenew ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
          <RefreshCcw className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Tự động gia hạn</h3>
          <p className="text-xs text-slate-500 mt-0.5">Hệ thống sẽ tự động trừ tiền từ Wallet khi đến hạn.</p>
        </div>
      </div>
      <button 
        onClick={handleToggle}
        disabled={isLoading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
          isAutoRenew ? 'bg-blue-600' : 'bg-slate-200'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="sr-only">Toggle Auto Renew</span>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isAutoRenew ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}
