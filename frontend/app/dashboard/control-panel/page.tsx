'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { FileText, Download, AlertCircle, Monitor, Lock, Eye, Edit2 } from 'lucide-react';

export default function ControlPanelPage() {
  const { toast, showToast } = useToast();
  const [credentials, setCredentials] = useState<{ username: string; password: string; url: string; isActive: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ username: '' });
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
      // Get orderId from localStorage or use default
      const storedOrderId = localStorage.getItem('currentOrderId');
      const orderId = storedOrderId || '00000000-0000-0000-0000-000000000001';
      
      const response = await fetch(`/api/orders/${orderId}/control-panel`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setCredentials({
          username: data.username || 'user_cpanel',
          password: '••••••••', // Always mask password
          url: data.url || 'https://vps001.cloudstore.vn:2083',
          isActive: data.isActive ?? true
        });
        setFormData({ username: data.username || 'user_cpanel' });
      } else {
        // Fallback to mock data
        setCredentials({
          username: 'user_cpanel',
          password: '••••••••',
          url: 'https://vps001.cloudstore.vn:2083',
          isActive: true
        });
        setFormData({ username: 'user_cpanel' });
      }
      setIsLoading(false);
    } catch (err) {
      setError('Không thể tải thông tin control panel.');
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsUpdating(true);
    setError(null);
    try {
      setCredentials(prev => prev ? {
        ...prev,
        username: formData.username || prev.username,
      } : null);
      setEditMode(false);
    } catch (err) {
      setError('Không thể lưu thay đổi.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast('Đã sao chép!', 'success');
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Control Panel</h1>
          <p className="text-slate-500 mt-1">Quản lý thông tin truy cập Cpanel</p>
        </div>
        <button onClick={fetchData} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors" title="Làm mới">
          <FileText className="w-4 h-4" />
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-900">Thông tin quan trọng</p>
          <p className="text-sm text-amber-700 mt-1">
            Vui lòng lưu lại thông tin đăng nhập này. CloudServiceStore không lưu trữ mật khẩu gốc của bạn.
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

      {/* Credentials Card */}
      {credentials && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Thông tin truy cập</h2>
                <p className="text-sm text-slate-500">VPS ID: vps-001</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              credentials.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
            }`}>
              {credentials.isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
            </span>
          </div>

          <div className="p-6 space-y-4">
            {/* URL */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">URL truy cập Cpanel</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={credentials.url}
                  readOnly
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-sm font-mono"
                />
                <button
                  onClick={() => handleCopy(credentials.url)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 transition-colors"
                  title="Sao chép URL"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              {editMode ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    className="flex-1 px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isUpdating ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-mono">
                    {credentials.username}
                  </span>
                  <button
                    onClick={() => setEditMode(true)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <div className="flex items-center gap-2">
                <span className="flex-1 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-900 font-mono">
                  {showPassword ? '••••••••' : '••••••••'}
                </span>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Last Updated */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">Cập nhật lần cuối: {new Date().toLocaleString('vi-VN')}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <a
              href={credentials.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Monitor className="w-4 h-4" />
              Mở Cpanel
            </a>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => showToast('', 'info')}
        />
      )}
    </div>
  );
}
