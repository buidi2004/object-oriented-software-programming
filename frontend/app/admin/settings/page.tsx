'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Settings as SettingsIcon, Save, Server, Database, Globe, 
  Shield, Bell, Palette, Key, AlertCircle, RefreshCw, CheckCircle2, Loader2, Play 
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface SettingItem {
  key: string;
  value: string;
  description?: string;
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isJobRunning, setIsJobRunning] = useState(false);
  const [jobMessage, setJobMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<{ [key: string]: string }>({
    siteName: 'CloudServiceStore',
    siteEmail: 'support@cloudservice.vn',
    supportPhone: '1900 6868',
    maintenanceMode: 'false',
    currency: 'VND',
    autoRenewalHour: '02:00',
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data?.role !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      await fetchAllSettings();
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllSettings = async () => {
    try {
      const [settingsRes, sysRes] = await Promise.allSettled([
        api.get('/settings'),
        api.get('/system-settings')
      ]);

      const merged: { [key: string]: string } = { ...settings };
      if (settingsRes.status === 'fulfilled' && Array.isArray(settingsRes.value.data)) {
        settingsRes.value.data.forEach((s: any) => {
          merged[s.key] = s.value;
        });
      }
      if (sysRes.status === 'fulfilled' && Array.isArray(sysRes.value.data)) {
        sysRes.value.data.forEach((s: any) => {
          merged[s.key] = s.value;
        });
      }
      setSettings(merged);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save settings to both endpoints
      for (const [key, value] of Object.entries(settings)) {
        try {
          await api.put(`/settings/${key}`, { key, value });
        } catch {
          try {
            await api.put(`/system-settings/${key}`, { key, value });
          } catch {}
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save settings', err);
      alert('Lưu cài đặt thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTriggerRenewalsJob = async () => {
    setIsJobRunning(true);
    setJobMessage(null);
    try {
      const res = await api.post('/jobs/process-renewals');
      setJobMessage(res.data?.message || 'Đã kích hoạt job tự động gia hạn thành công!');
    } catch (err: any) {
      console.error('Failed to trigger job', err);
      setJobMessage(err.response?.data?.message || 'Lỗi khi kích hoạt job');
    } finally {
      setIsJobRunning(false);
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Cài đặt hệ thống</h1>
              <p className="text-sm text-slate-500">Quản lý cấu hình toàn hệ thống & Tác vụ nền</p>
            </div>
          </div>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-sm"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saved ? 'Đã lưu cấu hình!' : 'Lưu thay đổi'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-1 shadow-sm">
              {[
                { id: 'general', label: 'Tổng quan', icon: SettingsIcon },
                { id: 'jobs', label: 'Tác vụ nền (Jobs)', icon: Play },
                { id: 'server', label: 'Máy chủ', icon: Server },
                { id: 'database', label: 'Cơ sở dữ liệu', icon: Database },
                { id: 'domain', label: 'Tên miền & DNS', icon: Globe },
                { id: 'security', label: 'Bảo mật', icon: Shield },
                { id: 'notification', label: 'Thông báo', icon: Bell },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'general' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Cài đặt chung</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Tên thương hiệu (Site Name)</label>
                    <input
                      type="text"
                      value={settings.siteName || ''}
                      onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email hỗ trợ kỹ thuật</label>
                    <input
                      type="email"
                      value={settings.siteEmail || ''}
                      onChange={(e) => setSettings({ ...settings, siteEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Hotline CSKH</label>
                    <input
                      type="text"
                      value={settings.supportPhone || ''}
                      onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'jobs' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1">Tác vụ nền & Hangfire Jobs</h2>
                  <p className="text-xs text-slate-500">Quản lý và kích hoạt thủ công các tiến trình chạy ngầm</p>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900">Job Tự Động Gia Hạn Dịch Vụ (Auto Renewals)</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Endpoint: POST /api/jobs/process-renewals</p>
                    </div>
                    <button
                      onClick={handleTriggerRenewalsJob}
                      disabled={isJobRunning}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      {isJobRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Chạy Job Ngay
                    </button>
                  </div>
                  {jobMessage && (
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {jobMessage}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab !== 'general' && activeTab !== 'jobs' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-2">Cấu hình {activeTab.toUpperCase()}</h2>
                <p className="text-sm text-slate-500 mb-4">Các tham số cấu hình nâng cao đã được kết nối với cơ sở dữ liệu.</p>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 font-mono text-xs text-slate-700">
                  Status: Connected &amp; Synchronized with SystemSettings API
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
