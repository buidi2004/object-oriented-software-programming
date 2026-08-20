'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Settings as SettingsIcon, Save, Server, Database, Globe, 
  Shield, Bell, Palette, Key, AlertCircle, CheckCircle2, Plus, RefreshCw 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface SystemSetting {
  key: string;
  value: string;
  description?: string;
  updatedAt?: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({
    site_name: 'CloudHost VN',
    support_email: 'support@cloudhost.vn',
    hotline: '1900 6888',
    company_name: 'Công ty Cổ phần Công nghệ Hạ Tầng Số Việt Nam, trực thuộc Tập đoàn Công nghệ Việt Nam.',
    business_license: '0500589150 do Ban Quản lý các Khu công nghệ cao và Khu công nghiệp - UBND thành phố Hà Nội cấp lần đầu ngày 11/04/2008, sửa đổi lần thứ 13 ngày 10/06/2026.',
    content_responsible: 'Ông Lê Bá Tân.',
    maintenance_mode: 'false',
    default_currency: 'VND',
    max_upload_size: '64MB',
    two_factor_auth_required: 'true',
    smtp_host: 'smtp.sendgrid.net',
    smtp_port: '587'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await api.get('/users/me');
      if (response.data?.role !== 'Admin') { 
        router.push('/dashboard'); 
        return; 
      }
      fetchSettings();
    } catch { 
      router.push('/login'); 
    }
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/system-settings');
      if (Array.isArray(res.data)) {
        const dict: Record<string, string> = { ...settings };
        res.data.forEach((s: any) => {
          if (s.key) dict[s.key] = s.value ?? '';
        });
        setSettings(dict);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const promises = Object.entries(settings).map(([key, value]) =>
        api.put(`/system-settings/${key}`, { key, value: String(value) }).catch(() => null)
      );
      await Promise.all(promises);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Đã xảy ra lỗi khi lưu cấu hình.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCustomSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim()) return;
    try {
      const key = newKey.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
      await api.put(`/system-settings/${key}`, { key, value: newValue });
      setSettings(prev => ({ ...prev, [key]: newValue }));
      setNewKey('');
      setNewValue('');
      setShowAddCustom(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert('Không thể thêm cấu hình mới.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Cài đặt hệ thống</h1>
              <p className="text-sm text-slate-500">Quản lý cấu hình toàn hệ thống CloudServiceStore</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchSettings}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              title="Tải lại cài đặt"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button 
              onClick={handleSaveAll}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Đang lưu...' : saved ? 'Đã lưu thành công!' : 'Lưu toàn bộ thay đổi'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {saved && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Đã đồng bộ và cập nhật toàn bộ cấu hình hệ thống lên máy chủ!
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 space-y-1.5 shadow-sm">
              {[
                { id: 'general', label: 'Cài đặt Chung', icon: SettingsIcon },
                { id: 'payment', label: 'Cổng Thanh Toán', icon: Database },
                { id: 'server', label: 'Hạ Tầng & Máy Chủ', icon: Server },
                { id: 'security', label: 'Bảo Mật & 2FA', icon: Shield },
                { id: 'email', label: 'Email & SMTP', icon: Bell },
                { id: 'custom', label: 'Tùy Biến Thêm', icon: Key },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Contents */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'general' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Cài đặt thông tin thương hiệu & Website</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tên website / Thương hiệu</label>
                    <input 
                      type="text" 
                      value={settings.site_name || ''} 
                      onChange={(e) => handleValueChange('site_name', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Hotline Hỗ Trợ 24/7</label>
                      <input 
                        type="text" 
                        value={settings.hotline || ''} 
                        onChange={(e) => handleValueChange('hotline', e.target.value)}
                        placeholder="1900 6888"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold text-red-600" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Email CSKH / Support</label>
                      <input 
                        type="email" 
                        value={settings.support_email || ''} 
                        onChange={(e) => handleValueChange('support_email', e.target.value)}
                        placeholder="support@cloudhost.vn"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-semibold text-blue-600" 
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-4">
                    <h3 className="text-sm font-bold text-slate-800">Thông Tin Pháp Lý & Cơ Quan Chủ Quản (Chân Trang)</h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Cơ Quan Chủ Quản / Tên Công Ty</label>
                      <textarea 
                        rows={2}
                        value={settings.company_name || ''} 
                        onChange={(e) => handleValueChange('company_name', e.target.value)}
                        placeholder="Công ty Cổ phần Công nghệ Hạ Tầng Số Việt Nam, trực thuộc Tập đoàn Công nghệ Việt Nam."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Mã Số Doanh Nghiệp & Giấy Phép</label>
                      <textarea 
                        rows={3}
                        value={settings.business_license || ''} 
                        onChange={(e) => handleValueChange('business_license', e.target.value)}
                        placeholder="0500589150 do Ban Quản lý các Khu công nghệ cao và Khu công nghiệp - UBND thành phố Hà Nội cấp lần đầu..."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Chịu Trách Nhiệm Nội Dung</label>
                      <input 
                        type="text" 
                        value={settings.content_responsible || ''} 
                        onChange={(e) => handleValueChange('content_responsible', e.target.value)}
                        placeholder="Ông Lê Bá Tân."
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Đơn vị tiền tệ mặc định</label>
                    <select
                      value={settings.default_currency || 'VND'}
                      onChange={(e) => handleValueChange('default_currency', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="VND">VND (Việt Nam Đồng)</option>
                      <option value="USD">USD (Đô la Mỹ)</option>
                      <option value="EUR">EUR (Euro)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mt-6">
                    <div>
                      <p className="font-semibold text-slate-900">Chế độ Bảo trì Toàn hệ thống</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tạm dừng truy cập người dùng để nâng cấp máy chủ</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.maintenance_mode === 'true'}
                        onChange={(e) => handleValueChange('maintenance_mode', e.target.checked ? 'true' : 'false')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600" /> Cấu Hình Cổng Thanh Toán VietQR (SePay)
                </h2>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                  <p className="text-sm font-semibold text-blue-900">🔔 Kết nối với tài khoản SePay của bạn</p>
                  <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                    Đảm bảo bạn đã thêm tài khoản ngân hàng thật trên <strong>my.sepay.vn</strong>. 
                    Sau đó, điền đúng Số tài khoản và Mã ngân hàng đó vào đây để hệ thống tạo mã QR chính xác. 
                    Nếu điền sai, khi quét mã bằng điện thoại sẽ báo lỗi "Mã QR không hợp lệ".
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Ngân Hàng Nhận (Mã BIN/Tên viết tắt)</label>
                      <input 
                        type="text" 
                        value={settings.vietqr_bank_id || ''} 
                        onChange={(e) => handleValueChange('vietqr_bank_id', e.target.value.toUpperCase())}
                        placeholder="VD: MB hoặc 970422, VCB hoặc 970436"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Số Tài Khoản Nhận (Thật)</label>
                      <input 
                        type="text" 
                        value={settings.vietqr_account_no || ''} 
                        onChange={(e) => handleValueChange('vietqr_account_no', e.target.value.replace(/\s/g, ''))}
                        placeholder="VD: 0347894561"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Tên Chủ Tài Khoản (In Hoa Không Dấu)</label>
                    <input 
                      type="text" 
                      value={settings.vietqr_account_name || ''} 
                      onChange={(e) => handleValueChange('vietqr_account_name', e.target.value.toUpperCase())}
                      placeholder="VD: NGUYEN VAN A"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100 mt-6">
                    <div>
                      <p className="font-semibold text-slate-900">Mẫu QR (Template)</p>
                      <p className="text-xs text-slate-500 mt-0.5">compact, compact2, print, hoặc qr_only</p>
                    </div>
                    <select
                      value={settings.vietqr_template || 'compact2'}
                      onChange={(e) => handleValueChange('vietqr_template', e.target.value)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      <option value="compact2">Compact 2 (Đẹp nhất)</option>
                      <option value="compact">Compact 1</option>
                      <option value="qr_only">QR Only (Không viền)</option>
                      <option value="print">Print (In ấn)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'server' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Cấu hình Tải lên & Dung lượng</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Kích thước file tải lên tối đa</label>
                    <input 
                      type="text" 
                      value={settings.max_upload_size || '64MB'} 
                      onChange={(e) => handleValueChange('max_upload_size', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">Timeout phiên kết nối (phút)</label>
                    <input 
                      type="number" 
                      defaultValue="30"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Chính sách Bảo mật & Truy cập</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-900">Bắt buộc Xác thực 2 bước (2FA)</p>
                      <p className="text-xs text-slate-500 mt-0.5">Yêu cầu OTP Authenticator khi đăng nhập quyền Admin</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.two_factor_auth_required === 'true'}
                        onChange={(e) => handleValueChange('two_factor_auth_required', e.target.checked ? 'true' : 'false')}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'email' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Cấu hình Gửi Mail Hệ Thống (SMTP)</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">SMTP Host</label>
                      <input 
                        type="text" 
                        value={settings.smtp_host || ''} 
                        onChange={(e) => handleValueChange('smtp_host', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">SMTP Port</label>
                      <input 
                        type="text" 
                        value={settings.smtp_port || ''} 
                        onChange={(e) => handleValueChange('smtp_port', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'custom' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Danh sách Cấu hình Tùy biến</h2>
                  <button 
                    onClick={() => setShowAddCustom(!showAddCustom)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 font-semibold text-xs hover:bg-blue-100 flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm Key Tùy Biến
                  </button>
                </div>

                {showAddCustom && (
                  <form onSubmit={handleAddCustomSetting} className="p-4 mb-6 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Key Name</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="VD: telegram_alert_token" 
                          value={newKey} 
                          onChange={(e) => setNewKey(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Value</label>
                        <input 
                          type="text" 
                          required 
                          placeholder="Giá trị cấu hình" 
                          value={newValue} 
                          onChange={(e) => setNewValue(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs" 
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        type="button" 
                        onClick={() => setShowAddCustom(false)}
                        className="px-3 py-1.5 rounded-lg text-slate-500 text-xs"
                      >
                        Hủy
                      </button>
                      <button 
                        type="submit" 
                        className="px-4 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                      >
                        Lưu Key Mới
                      </button>
                    </div>
                  </form>
                )}

                <div className="divide-y divide-slate-100">
                  {Object.entries(settings).map(([k, v]) => (
                    <div key={k} className="py-3 flex items-center justify-between gap-4">
                      <span className="font-mono text-xs font-semibold text-slate-700">{k}</span>
                      <input 
                        type="text" 
                        value={v} 
                        onChange={(e) => handleValueChange(k, e.target.value)}
                        className="max-w-md w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
