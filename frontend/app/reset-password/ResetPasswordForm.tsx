'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || data.title || 'Không thể đặt lại mật khẩu.');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-red-600">Liên kết không hợp lệ.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
        </Link>
        <div className="bg-white rounded-md shadow-xl border border-slate-100 p-8">
          <h1 className="text-2xl font-extrabold text-slate-900 mb-6">Đặt lại mật khẩu</h1>
          {done ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-sm text-emerald-800">Mật khẩu đã được cập nhật.</p>
              <button onClick={() => router.push('/login')} className="mt-4 text-[#1F1F1F] font-semibold text-sm">
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-sm flex items-center gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                  <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Xác nhận mật khẩu</label>
                <input type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-200 rounded" />
              </div>
              <button type="submit" disabled={isLoading} className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-70">
                {isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
