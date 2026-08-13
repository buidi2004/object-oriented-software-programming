'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Settings as SettingsIcon, Save, Server, Database, Globe, Shield, Bell, Palette, Key, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        setIsLoading(false);
      } else { router.push('/login'); }
    } catch (error) { router.push('/login'); }
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
              <p className="text-sm text-slate-500">Quản lý cấu hình toàn hệ thống</p>
            </div>
          </div>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saved ? 'Đã lưu!' : 'Lưu thay đổi'}
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2">
              {[
                { id: 'general', label: 'Tổng quan', icon: SettingsIcon },
                { id: 'server', label: 'Máy chủ', icon: Server },
                { id: 'database', label: 'Cơ sở dữ liệu', icon: Database },
                { id: 'domain', label: 'Tên miền', icon: Globe },
                { id: 'security', label: 'Bảo mật', icon: Shield },
                { id: 'notification', label: 'Thông báo', icon: Bell },
                { id: 'appearance', label: 'Giao diện', icon: Palette },
                { id: 'api', label: 'API Keys', icon: Key },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
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
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Cài đặt chung</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Tên website</label>
                    <input type="text" defaultValue="CloudServiceStore" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email hệ thống</label>
                    <input type="email" defaultValue="admin@cloudhost.vn" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Mô tả website</label>
                    <textarea rows={3} className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none" placeholder="Mô tả ngắn về dịch vụ..." />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Chế độ bảo trì</p>
                      <p className="text-sm text-slate-500">Tắt website khi bảo trì</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'server' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Cấu hình máy chủ</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">PHP Version</label>
                      <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option>8.2</option>
                        <option>8.1</option>
                        <option>8.0</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Web Server</label>
                      <input type="text" defaultValue="Nginx" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Upload Max Size</label>
                    <input type="text" defaultValue="64M" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-6">Cài đặt bảo mật</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">2FA Authentication</p>
                      <p className="text-sm text-slate-500">Bắt buộc xác thực 2 lớp cho admin</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">Login Attempt Limit</p>
                      <p className="text-sm text-slate-500">Khóa tài khoản sau 5 lần thất bại</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab !== 'general' && activeTab !== 'server' && activeTab !== 'security' && (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Tính năng đang phát triển</h3>
                <p className="text-sm text-slate-500">Trang cài đặt này sẽ được cập nhật thêm trong tương lai gần.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
