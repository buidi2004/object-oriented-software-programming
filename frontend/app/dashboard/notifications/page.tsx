'use client';

import React, { useState, useEffect } from 'react';
import { Bell, ShieldCheck, ShoppingBag, Gift, Loader2, Save, AlertCircle } from 'lucide-react';
import { api } from '@/src/lib/api';

interface NotificationSettings {
  emailOnOrder: boolean;
  emailOnSecurity: boolean;
  emailOnPromotion: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  emailOnOrder: true,
  emailOnSecurity: true,
  emailOnPromotion: false,
};

function normalizeSettings(data: unknown): NotificationSettings {
  if (!data || typeof data !== 'object') return DEFAULT_SETTINGS;
  const raw = data as Record<string, unknown>;
  return {
    emailOnOrder: Boolean(raw.emailOnOrder ?? raw.EmailOnOrder ?? true),
    emailOnSecurity: Boolean(raw.emailOnSecurity ?? raw.EmailOnSecurity ?? true),
    emailOnPromotion: Boolean(raw.emailOnPromotion ?? raw.EmailOnPromotion ?? false),
  };
}

export default function NotificationsPage() {
  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoadError('');
    try {
      const res = await api.get('/notification-settings/me');
      setSettings(normalizeSettings(res.data));
    } catch (error) {
      console.error('Failed to fetch notification settings', error);
      setLoadError('Không thể tải cài đặt thông báo. Vui lòng thử lại sau.');
      setSettings(DEFAULT_SETTINGS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationSettings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage('');
    try {
      await api.put('/notification-settings/me', settings);
      setMessage('Cập nhật cài đặt thông báo thành công!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update settings', error);
      setMessage('Lỗi: Không thể lưu cài đặt. Vui lòng thử lại sau.');
    } finally {
      setIsSaving(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Trung tâm Thông báo</h1>
          <p className="text-slate-500 mt-1">Quản lý cách chúng tôi liên hệ và gửi thông báo cho bạn</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Lưu cài đặt</span>
        </button>
      </div>

      {loadError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">{loadError}</p>
            <button
              type="button"
              onClick={() => {
                setIsLoading(true);
                fetchSettings();
              }}
              className="mt-2 text-sm font-bold text-amber-800 underline"
            >
              Thử tải lại
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-xl text-sm font-semibold ${message.includes('Lỗi') ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Email Notifications</h2>
            <p className="text-sm text-slate-500">Cấu hình nhận thông báo qua email của bạn</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          <div className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <ShoppingBag className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cập nhật đơn hàng</h3>
                <p className="text-xs text-slate-500 mt-1">Nhận email khi có hóa đơn mới, dịch vụ được kích hoạt hoặc gia hạn thành công.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={settings.emailOnOrder} onChange={() => handleToggle('emailOnOrder')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <ShieldCheck className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Cảnh báo bảo mật</h3>
                <p className="text-xs text-slate-500 mt-1">Thông báo khi có đăng nhập từ thiết bị lạ, thay đổi mật khẩu hoặc xác thực 2 bước.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={settings.emailOnSecurity} onChange={() => handleToggle('emailOnSecurity')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="mt-0.5">
                <Gift className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Chương trình khuyến mãi</h3>
                <p className="text-xs text-slate-500 mt-1">Nhận các voucher giảm giá, tin tức và ưu đãi đặc biệt từ chúng tôi.</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" className="sr-only peer" checked={settings.emailOnPromotion} onChange={() => handleToggle('emailOnPromotion')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
