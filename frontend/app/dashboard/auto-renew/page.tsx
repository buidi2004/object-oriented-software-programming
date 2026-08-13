'use client';

import React, { useState, useEffect } from 'react';
import { Power, Clock, AlertCircle, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { api } from '@/src/lib/api';

interface AutoRenewSetting {
  orderId: string;
  isAutoRenewEnabled: boolean;
  nextBillingDate?: string;
  serviceType: string;
  serviceName: string;
}

export default function AutoRenewPage() {
  const [autoRenewSettings, setAutoRenewSettings] = useState<AutoRenewSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await api.get('/orders/me?status=Active');
      
      if (res.data && Array.isArray(res.data)) {
        const settings: AutoRenewSetting[] = res.data.map((order: any) => ({
          orderId: order.id,
          isAutoRenewEnabled: order.autoRenew || false,
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Should be from order but mocking date for now if not available
          serviceType: 'Dịch vụ',
          serviceName: order.servicePlanName || 'Dịch vụ',
        }));
        setAutoRenewSettings(settings);
      } else {
        setAutoRenewSettings([]);
      }
    } catch (err) {
      console.error('Failed to fetch auto-renew settings:', err);
      setError('Không thể tải dữ liệu tự động gia hạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAutoRenew = async (orderId: string) => {
    setUpdatingId(orderId);
    setError(null);
    try {
      await api.patch(`/orders/${orderId}/auto-renew`);
      setAutoRenewSettings(prev => prev.map(s =>
        s.orderId === orderId ? { ...s, isAutoRenewEnabled: !s.isAutoRenewEnabled } : s
      ));
    } catch (err) {
      console.error('Failed to toggle auto-renew:', err);
      setError('Không thể cập nhật cài đặt. Vui lòng thử lại.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Tự động gia hạn</h1>
        <p className="text-slate-500 mt-1">Quản lý tự động gia hạn cho các dịch vụ của bạn</p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-blue-900">Tự động gia hạn là gì?</p>
          <p className="text-sm text-blue-700 mt-1">
            Khi kích hoạt, dịch vụ của bạn sẽ tự động được gia hạn trước khi hết hạn.
            Thanh toán sẽ được thực hiện từ ví của bạn hoặc phương thức thanh toán đã lưu.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchData} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-semibold">
            Thử lại
          </button>
        </div>
      )}

      {/* Auto Renew List */}
      <div className="space-y-4">
        {autoRenewSettings.map((setting) => (
          <div key={setting.orderId} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  setting.isAutoRenewEnabled ? 'bg-emerald-100' : 'bg-slate-100'
                }`}>
                  <Power className={`w-6 h-6 ${
                    setting.isAutoRenewEnabled ? 'text-emerald-600' : 'text-slate-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{setting.serviceName}</h3>
                  <p className="text-sm text-slate-500">{setting.serviceType}</p>
                  {setting.nextBillingDate && (
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Gia hạn vào: {new Date(setting.nextBillingDate).toLocaleDateString('vi-VN')}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleAutoRenew(setting.orderId)}
                disabled={updatingId === setting.orderId}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  setting.isAutoRenewEnabled ? 'bg-emerald-500' : 'bg-slate-300'
                } ${updatingId === setting.orderId ? 'opacity-70 cursor-not-allowed' : ''}`}
                aria-pressed={setting.isAutoRenewEnabled}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    setting.isAutoRenewEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {setting.isAutoRenewEnabled && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-emerald-600">
                <CheckCircle className="w-4 h-4" />
                <span>Tự động gia hạn đang hoạt động</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {autoRenewSettings.length === 0 && !error && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="font-medium text-slate-500">Bạn chưa có dịch vụ nào cần tự động gia hạn</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>
      </div>
  );
}
