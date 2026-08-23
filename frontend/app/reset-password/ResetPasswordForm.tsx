'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, AlertCircle, CheckCircle2, KeyRound, Eye, EyeOff } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (password.length < 8) {
      setError('Mật khẩu mới phải có tối thiểu 8 ký tự.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Không thể đặt lại mật khẩu. Liên kết có thể đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 font-sans text-zinc-900">
        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-zinc-800 mx-auto" />
          <h2 className="text-xl font-black text-black">Liên Kết Không Hợp Lệ</h2>
          <p className="text-xs text-zinc-500">
            Liên kết đặt lại mật khẩu bị thiếu token bảo mật hoặc đã hết thời gian sử dụng (1 giờ).
          </p>
          <Link
            href="/forgot-password"
            className="inline-block px-6 py-2.5 rounded-full bg-black text-white font-bold text-xs"
          >
            Yêu cầu liên kết mới
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4 font-sans text-zinc-900 selection:bg-black selection:text-white">
      <div className="max-w-md w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-black mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại trang chủ
        </Link>
        
        <div className="bg-white rounded-3xl shadow-xl border border-zinc-200 p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="flex justify-center mx-auto mb-2">
              <img src="/images/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-black text-black">Tạo Mật Khẩu Mới</h1>
            <p className="text-xs text-zinc-500">
              Nhập mật khẩu mới an toàn cho tài khoản SEN CloudHost của bạn.
            </p>
          </div>

          {done ? (
            <div className="p-5 bg-zinc-900 text-white rounded-2xl border border-zinc-800 space-y-3 animate-in zoom-in-95 text-center">
              <CheckCircle2 className="w-8 h-8 text-white mx-auto" />
              <p className="text-sm font-black">Đặt Lại Mật Khẩu Thành Công!</p>
              <p className="text-xs text-zinc-300 leading-relaxed font-normal">
                Mật khẩu tài khoản của bạn đã được cập nhật an toàn trên hệ thống.
              </p>
              <Link
                href="/?auth=login"
                className="w-full mt-3 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                <span>Đăng Nhập Ngay Với Mật Khẩu Mới</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Mật khẩu mới (tối thiểu 8 ký tự):</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-zinc-200 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-zinc-50"
                    placeholder="••••••••"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">Xác nhận mật khẩu mới:</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-zinc-200 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-zinc-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black p-0.5 cursor-pointer"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>Cập Nhật Mật Khẩu Mới</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
