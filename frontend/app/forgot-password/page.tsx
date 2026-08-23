'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, KeyRound, AlertTriangle, UserPlus, Headphones, Phone, MessageSquare } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailNotFound, setEmailNotFound] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Vui lòng nhập địa chỉ email đã đăng ký tài khoản.');
      return;
    }

    setIsLoading(true);
    setError('');
    setEmailNotFound(false);

    try {
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSent(true);
      setEmailNotFound(false);
    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || err?.response?.data?.detail || 'Không tìm thấy địa chỉ email này trong hệ thống dữ liệu SEN CloudHost.';
      setEmailNotFound(true);
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-2xl font-black text-black">Khôi Phục Mật Khẩu</h1>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Nhập địa chỉ email đăng ký để kiểm tra và nhận mật khẩu mới tự động.
            </p>
          </div>

          {sent ? (
            /* ----- CASE 1: EMAIL FOUND & NEW PASSWORD SENT ----- */
            <div className="p-5 bg-black text-white rounded-2xl border border-zinc-800 space-y-3.5 animate-in zoom-in-95 shadow-xl">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-black text-sm block">Đã Tìm Thấy Tài Khoản!</span>
                  <span className="text-[11px] text-zinc-400">Mật khẩu mới đã được gửi về email</span>
                </div>
              </div>
              <div className="p-3.5 bg-zinc-900/90 rounded-xl border border-zinc-800 text-xs text-zinc-200 leading-relaxed font-normal">
                Hệ thống SEN CloudHost đã tự động tạo mật khẩu mới an toàn và gửi về hòm thư:
                <div className="mt-1.5 font-bold font-mono text-white text-xs bg-black px-2.5 py-1.5 rounded-lg border border-zinc-700 block">
                  📧 {email}
                </div>
              </div>
              <div className="text-[11px] text-zinc-400 flex items-start gap-1.5">
                <span>💡</span>
                <span>Vui lòng kiểm tra hộp thư đến (Inbox) hoặc mục Thư rác/Spam. Dùng mật khẩu mới nhận được để đăng nhập ngay.</span>
              </div>
              <Link
                href="/?auth=login"
                className="w-full mt-2 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <span>🚀 Đăng Nhập Với Mật Khẩu Mới</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {/* ----- CASE 2: EMAIL NOT FOUND IN DATABASE ----- */}
              {emailNotFound && error && (
                <div className="p-4 bg-zinc-900 text-white rounded-2xl border border-red-500/50 space-y-3 animate-in fade-in shadow-lg">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-white">Không Tìm Thấy Tài Khoản</h4>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">
                        Địa chỉ email <strong className="text-red-300 underline font-mono">{email}</strong> không tồn tại trong hệ thống SEN CloudHost. Vui lòng kiểm tra lại chính tả hoặc tạo tài khoản mới.
                      </p>
                    </div>
                  </div>

                  {/* Quick Register Action */}
                  <Link
                    href={`/?auth=register&email=${encodeURIComponent(email)}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Tạo Tài Khoản Mới Với Email Này</span>
                  </Link>
                </div>
              )}

              {!emailNotFound && error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs text-center border border-red-100 font-bold">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-bold text-zinc-700 mb-1.5">
                    Địa chỉ Email đã đăng ký:
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailNotFound) setEmailNotFound(false);
                        if (error) setError('');
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-zinc-200 rounded-xl text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black transition-all bg-zinc-50"
                      placeholder="account@company.vn"
                      autoFocus
                    />
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
                  <span>Kiểm Tra & Cấp Lại Mật Khẩu</span>
                </button>
              </form>

              {/* ================= ACCOUNT SUPPORT SECTION ================= */}
              <div className="pt-3 border-t border-zinc-200 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-zinc-500 font-bold px-0.5">
                  <span className="flex items-center gap-1.5">
                    <Headphones className="w-3.5 h-3.5 text-zinc-700" />
                    Trung Tâm Hỗ Trợ Tài Khoản:
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 transition-colors">
                    <span className="block text-[10px] text-zinc-500 font-bold uppercase">Hotline 24/7</span>
                    <a href="tel:19006868" className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-zinc-700" /> 1900 6868
                    </a>
                  </div>
                  <Link
                    href="/contact"
                    className="p-2.5 bg-zinc-50 hover:bg-zinc-100 rounded-xl border border-zinc-200 transition-colors block text-left"
                  >
                    <span className="block text-[10px] text-zinc-500 font-bold uppercase">Kỹ thuật & CSKH</span>
                    <span className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 mt-0.5">
                      <MessageSquare className="w-3 h-3 text-zinc-700" /> Gửi Yêu Cầu
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              href="/?auth=login"
              className="text-xs font-bold text-zinc-600 hover:text-black transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang Đăng nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
