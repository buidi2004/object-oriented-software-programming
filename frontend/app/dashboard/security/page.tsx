'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Key, EyeOff, Eye, CheckCircle2, AlertCircle, Loader2, Laptop, Smartphone, LogOut } from 'lucide-react';

interface SessionDto {
  id: string;
  deviceInfo: string;
  expiresAt: string;
  isRevoked: boolean;
}

interface LoginHistoryDto {
  id: string;
  ipAddress: string;
  userAgent: string;
  isSuccess: boolean;
  loginAt: string;
}
import { api } from '@/src/lib/api';
import { History } from 'lucide-react';

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);
  const [loginHistory, setLoginHistory] = useState<LoginHistoryDto[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
    fetchLoginHistory();
  }, []);

  const fetchSessions = async () => {
    setIsSessionsLoading(true);
    try {
      const res = await api.get('/security/sessions');
      setSessions(res.data);
    } catch (err) {
      console.error('Failed to load sessions', err);
    } finally {
      setIsSessionsLoading(false);
    }
  };

  const fetchLoginHistory = async () => {
    setIsHistoryLoading(true);
    try {
      const res = await api.get('/security/login-history');
      setLoginHistory(res.data || []);
    } catch (err) {
      console.error('Failed to load login history', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/security/sessions/${id}`);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, isRevoked: true } : s));
    } catch (err) {
      console.error('Failed to revoke session', err);
      alert('Không thể đăng xuất phiên này.');
    }
  };

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculatePasswordStrength = (pwd: string) => {
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.match(/[A-Z]/)) strength += 25;
    if (pwd.match(/[a-z]/) && pwd.match(/[0-9]/)) strength += 25;
    if (pwd.match(/[^a-zA-Z0-9]/)) strength += 25;
    return strength;
  };

  const strength = calculatePasswordStrength(formData.newPassword);
  
  const getStrengthColor = () => {
    if (strength === 0) return 'bg-slate-200 dark:bg-slate-700';
    if (strength <= 25) return 'bg-red-500';
    if (strength <= 50) return 'bg-amber-500';
    if (strength <= 75) return 'bg-blue-500';
    return 'bg-emerald-500';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }

    if (strength < 100) {
      setMessage({ text: 'Vui lòng chọn mật khẩu mạnh hơn.', type: 'error' });
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/security/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setMessage({ text: 'Đổi mật khẩu thành công!', type: 'success' });
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi đổi mật khẩu.';
      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bảo Mật Tài Khoản</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Quản lý mật khẩu, các phiên hoạt động và lịch sử đăng nhập thiết bị.
        </p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-start gap-3 ${
          message.type === 'success' ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' : 'bg-red-50 text-red-900 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
          )}
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Change Password Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Key className="w-5 h-5 text-amber-500" />
                Đổi Mật Khẩu
              </h2>
              
              <div className="space-y-5">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator */}
                  {formData.newPassword && (
                    <div className="mt-3 space-y-2">
                      <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        <div className={`h-full transition-all duration-300 ${getStrengthColor()}`} style={{ width: `${strength}%` }} />
                      </div>
                      <div className="flex gap-4 text-xs">
                        <span className={formData.newPassword.length >= 8 ? 'text-emerald-500' : 'text-slate-500'}>✓ 8+ ký tự</span>
                        <span className={/[A-Z]/.test(formData.newPassword) ? 'text-emerald-500' : 'text-slate-500'}>✓ Chữ hoa</span>
                        <span className={/[0-9]/.test(formData.newPassword) ? 'text-emerald-500' : 'text-slate-500'}>✓ Số</span>
                        <span className={/[^a-zA-Z0-9]/.test(formData.newPassword) ? 'text-emerald-500' : 'text-slate-500'}>✓ Ký tự đặc biệt</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
              <button
                type="submit"
                disabled={isLoading || (formData.newPassword.length > 0 && strength < 100)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Cập Nhật Mật Khẩu
              </button>
            </div>
          </form>

          {/* Login History Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-blue-500" />
                Lịch Sử Đăng Nhập Gần Đây
              </h2>
            </div>
            <div className="overflow-x-auto">
              {isHistoryLoading ? (
                <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : loginHistory.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Chưa có bản ghi lịch sử đăng nhập.</div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-medium text-xs">
                    <tr>
                      <th className="px-6 py-3">Địa chỉ IP</th>
                      <th className="px-6 py-3">Trình duyệt / Thiết bị</th>
                      <th className="px-6 py-3">Trạng thái</th>
                      <th className="px-6 py-3">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loginHistory.slice(0, 10).map((hist) => (
                      <tr key={hist.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="px-6 py-3.5 font-mono text-slate-900 dark:text-white text-xs">{hist.ipAddress || '127.0.0.1'}</td>
                        <td className="px-6 py-3.5 text-slate-600 dark:text-slate-300 max-w-xs truncate text-xs" title={hist.userAgent}>
                          {hist.userAgent?.slice(0, 40) || 'Web Browser'}...
                        </td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            hist.isSuccess ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {hist.isSuccess ? 'Thành công' : 'Thất bại'}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-slate-500 text-xs">
                          {new Date(hist.loginAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
            <Shield className="w-8 h-8 mb-4 text-blue-200" />
            <h3 className="text-lg font-bold mb-2">Bảo mật 2 Lớp (2FA)</h3>
            <p className="text-blue-100 text-sm mb-4">
              Bảo vệ tài khoản của bạn khỏi các truy cập trái phép bằng cách yêu cầu mã xác thực thứ hai khi đăng nhập.
            </p>
            <button disabled className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-sm font-medium transition-colors cursor-not-allowed">
              Tính năng đang bảo trì
            </button>
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-indigo-500" />
                Phiên Đăng Nhập
              </h3>
            </div>
            <div className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {isSessionsLoading ? (
                <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
              ) : sessions.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Không có dữ liệu.</div>
              ) : sessions.map(session => (
                <div key={session.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${session.isRevoked ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
                      {session.deviceInfo?.toLowerCase().includes('mobile') ? <Smartphone className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${session.isRevoked ? 'text-slate-500 line-through dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                        {session.deviceInfo || 'Unknown Device'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {session.isRevoked ? 'Đã đăng xuất' : `Hết hạn: ${new Date(session.expiresAt).toLocaleDateString('vi-VN')}`}
                      </p>
                    </div>
                  </div>
                  {!session.isRevoked && (
                    <button
                      onClick={() => handleRevoke(session.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Đăng xuất thiết bị này"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
