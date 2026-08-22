'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Key, EyeOff, Eye, CheckCircle2, AlertCircle, Loader2, Laptop, Smartphone, LogOut } from 'lucide-react';

interface SessionDto {
  id: string;
  deviceInfo: string;
  expiresAt: string;
  isRevoked: boolean;
}
import { api } from '@/src/lib/api';
import { QRCodeSVG } from 'qrcode.react';

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sessions, setSessions] = useState<SessionDto[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(true);

  // 2FA states
  const [is2faLoading, setIs2faLoading] = useState(false);
  const [setupData, setSetupData] = useState<{ secretKey: string; otpAuthUri: string } | null>(null);
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    fetchSessions();
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

  const handleRevoke = async (id: string) => {
    try {
      await api.delete(`/security/sessions/${id}`);
      setSessions(prev => prev.map(s => s.id === id ? { ...s, isRevoked: true } : s));
    } catch (err) {
      console.error('Failed to revoke session', err);
      alert('Không thể đăng xuất phiên này.');
    }
  };


  const handleSetup2FA = async () => {
    setIs2faLoading(true);
    try {
      const res = await api.post('/auth/2fa/setup');
      setSetupData(res.data);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể thiết lập 2FA.');
    } finally {
      setIs2faLoading(false);
    }
  };

  const handleEnable2FA = async () => {
    if (!otpCode || otpCode.length !== 6) return alert('Mã không hợp lệ');
    setIs2faLoading(true);
    try {
      await api.post('/auth/2fa/enable', {
        secretKey: setupData?.secretKey,
        code: otpCode
      });
      alert('Kích hoạt 2FA thành công!');
      setSetupData(null);
      setOtpCode('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Mã không đúng.');
    } finally {
      setIs2faLoading(false);
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
          Quản lý mật khẩu và các thiết lập bảo mật 2 lớp.
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
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600">
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
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600">
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
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-600">
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
        </div>

        {/* Info Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-slate-900 shadow-lg">
            <Shield className="w-8 h-8 mb-4 text-slate-200" />
            <h3 className="text-lg font-bold mb-2">Bảo mật 2 Lớp (2FA)</h3>
            <p className="text-slate-200 text-sm mb-4">
              Bảo vệ tài khoản của bạn bằng mã xác thực 6 số trên ứng dụng Google Authenticator.
            </p>
            
            {!setupData ? (
              <button 
                onClick={handleSetup2FA}
                disabled={is2faLoading}
                className="w-full py-2.5 bg-white text-[#1F1F1F] hover:bg-blue-50 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {is2faLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Bật Xác Thực 2FA
              </button>
            ) : (
              <div className="bg-white p-4 rounded-xl text-slate-900 mt-4 space-y-4 shadow-inner">
                <p className="text-sm font-semibold text-center mb-2">1. Quét mã QR bằng ứng dụng</p>
                <div className="flex justify-center bg-white p-2 rounded-lg">
                  <QRCodeSVG value={setupData.otpAuthUri} size={160} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-center mt-4 mb-2">2. Nhập mã xác nhận</p>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="VD: 123456"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    className="w-full text-center tracking-[0.2em] font-mono text-lg px-4 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                  />
                  <button 
                    onClick={handleEnable2FA}
                    disabled={is2faLoading || otpCode.length !== 6}
                    className="w-full mt-3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                    {is2faLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Xác nhận Kích hoạt
                  </button>
                  <button 
                    onClick={() => setSetupData(null)}
                    className="w-full mt-2 py-2 text-slate-500 hover:text-slate-700 text-sm font-medium"
                  >
                    Hủy bỏ
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Laptop className="w-5 h-5 text-[#1F1F1F]" />
                Phiên Đăng Nhập
              </h3>
            </div>
            <div className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
              {isSessionsLoading ? (
                <div className="p-6 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-600" /></div>
              ) : sessions.length === 0 ? (
                <div className="p-6 text-center text-sm text-slate-500">Không có dữ liệu.</div>
              ) : sessions.map(session => (
                <div key={session.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${session.isRevoked ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-500' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'}`}>
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
                      className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
