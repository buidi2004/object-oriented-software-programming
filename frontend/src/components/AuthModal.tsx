'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Cloud, Phone, Eye, EyeOff, ChevronDown, CheckCircle2, ArrowLeft, KeyRound, AlertTriangle, UserPlus, Headphones, MessageSquare } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  COUNTRY_OPTIONS,
  VIETNAM_PROVINCES,
  getCountryName,
  getProvinceName,
} from '../lib/locationOptions';
import { getPasswordStrength } from '../lib/passwordStrength';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';

interface AuthModalProps {
  initialMode: 'login' | 'register' | 'forgot_password';
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  'w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white';
const selectClass =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all appearance-none bg-white';
const labelClass = 'block text-xs font-bold text-slate-700 mb-1.5';

function PasswordStrengthBar({ password }: { password: string }) {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-1">
        {[1, 2, 3].map((level) => (
          <div
            key={level}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              level <= strength.strength ? strength.barColor : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-semibold ${strength.textColor}`}>
        Độ mạnh: {strength.label}
      </p>
    </div>
  );
}

export const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'two_factor' | 'forgot_password'>(initialMode);
  const [otpCode, setOtpCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countryCode, setCountryCode] = useState('VN');
  const [provinceId, setProvinceId] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [taxCode, setTaxCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotEmailNotFound, setForgotEmailNotFound] = useState(false);

  const { setToken, setUser } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');

  React.useEffect(() => {
    setMode(initialMode);
    setErrorMsg('');
    setForgotSuccess(false);
    setForgotEmailNotFound(false);
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (mode === 'forgot_password') {
        if (!email.trim()) {
          setErrorMsg('Vui lòng nhập địa chỉ email đã đăng ký tài khoản.');
          setIsLoading(false);
          return;
        }

        try {
          await api.post('/auth/forgot-password', { email: email.trim() });
          setForgotSuccess(true);
          setForgotEmailNotFound(false);
          setErrorMsg('');
        } catch (err: any) {
          console.error(err);
          const msg = err.response?.data?.message || err.response?.data?.detail || 'Không tìm thấy địa chỉ email này trong hệ thống dữ liệu.';
          setForgotEmailNotFound(true);
          setErrorMsg(msg);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (mode === 'register') {
        if (password !== confirmPassword) {
          setErrorMsg('Mật khẩu xác nhận không khớp.');
          setIsLoading(false);
          return;
        }
        const payload: Record<string, string> = {
          email,
          password,
          fullName,
          phoneNumber: phoneNumber || '0000000000',
        };
        if (countryCode) payload.country = countryCode === 'VN' ? 'VN' : getCountryName(countryCode);
        if (provinceId) payload.city = getProvinceName(provinceId);
        if (addressLine) payload.addressLine = addressLine;
        if (companyName) payload.companyName = companyName;
        if (taxCode) payload.taxCode = taxCode;

        await api.post('/auth/register', payload);
        const loginPayload = {
          email,
          password,
          ipAddress: '0.0.0.0',
          userAgent: navigator.userAgent,
          deviceInfo: navigator.platform,
        };
        const loginRes = await api.post('/auth/login', loginPayload);
        if (loginRes.data.requiresTwoFactor) {
          setMode('two_factor');
          setIsLoading(false);
          return;
        }
        setToken(loginRes.data.accessToken ?? loginRes.data.token);
      } else {
        const loginPayload = {
          email,
          password,
          ipAddress: '0.0.0.0',
          userAgent: navigator.userAgent,
          deviceInfo: navigator.platform,
        };
        const res = await api.post('/auth/login', loginPayload);
        if (res.data.requiresTwoFactor) {
          setMode('two_factor');
          setIsLoading(false);
          return;
        }
        setToken(res.data.accessToken ?? res.data.token);
      }

      const userRes = await api.get('/users/me');
      setUser(userRes.data);

      onSuccess();
      onClose();
    } catch (error: unknown) {
      console.error(error);
      const err = error as { response?: { status?: number; data?: { detail?: string; message?: string; title?: string } } };
      if (err.response?.status === 429) {
        setErrorMsg('Quá nhiều lần thử. Vui lòng chờ vài phút rồi thử lại.');
      } else {
        setErrorMsg(
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.response?.data?.title ||
          'Có lỗi xảy ra. Vui lòng thử lại.'
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google.');
      }
      const res = await api.post('/auth/google-login', { credential: credentialResponse.credential });
      if (res.data.requiresTwoFactor) {
        setMode('two_factor');
        setEmail(res.data.email);
        setIsLoading(false);
        return;
      }
      setToken(res.data.accessToken ?? res.data.token);
      
      const userRes = await api.get('/users/me');
      setUser(userRes.data);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Đăng nhập Google thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await api.post('/auth/2fa/verify-login', { email, code: otpCode });
      setToken(res.data.accessToken ?? res.data.token);
      
      const userRes = await api.get('/users/me');
      setUser(userRes.data);

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.message || 'Mã xác thực không hợp lệ.');
    } finally {
      setIsLoading(false);
    }
  };

  const isRegister = mode === 'register';
  const isForgotPassword = mode === 'forgot_password';
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in">
      <div
        className={`bg-white rounded-3xl w-full overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200 ${
          isRegister ? 'max-w-3xl lg:max-w-4xl' : 'max-w-md lg:max-w-lg'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`${isRegister ? 'p-6 sm:p-8 lg:p-10' : 'p-6 sm:p-8'}`}>
          <div className="text-center mb-6 sm:mb-8">
            <div className="flex justify-center mx-auto mb-3">
              <img src="/images/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {mode === 'login' 
                ? 'Đăng Nhập Tài Khoản' 
                : mode === 'two_factor' 
                ? 'Xác Thực 2 Bước' 
                : mode === 'forgot_password'
                ? 'Khôi Phục Mật Khẩu'
                : 'Tạo Tài Khoản SEN CloudHost'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 max-w-md mx-auto">
              {mode === 'login'
                ? 'Truy cập Bảng quản lý máy chủ & dịch vụ Cloud'
                : mode === 'two_factor'
                ? 'Nhập mã gồm 6 chữ số từ ứng dụng Google Authenticator.'
                : mode === 'forgot_password'
                ? 'Nhập địa chỉ email đăng ký để nhận hướng dẫn tạo mật khẩu mới.'
                : 'Trải nghiệm hạ tầng Cloud chuẩn Doanh nghiệp'}
            </p>
          </div>

          {/* ================= FORGOT PASSWORD VIEW ================= */}
          {isForgotPassword ? (
            <div className="space-y-4">
              {forgotSuccess ? (
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
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setForgotSuccess(false); setErrorMsg(''); setForgotEmailNotFound(false); }}
                    className="w-full mt-2 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <span>🚀 Đăng Nhập Với Mật Khẩu Mới</span>
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* ----- CASE 2: EMAIL NOT FOUND IN DATABASE ----- */}
                  {forgotEmailNotFound && errorMsg && (
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
                      <button
                        type="button"
                        onClick={() => {
                          setMode('register');
                          setForgotEmailNotFound(false);
                          setErrorMsg('');
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-zinc-100 text-black font-black text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Tạo Tài Khoản Mới Với Email Này</span>
                      </button>
                    </div>
                  )}

                  {!forgotEmailNotFound && errorMsg && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs text-center border border-red-100 font-bold">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>Địa chỉ Email đã đăng ký:</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (forgotEmailNotFound) setForgotEmailNotFound(false);
                          if (errorMsg) setErrorMsg('');
                        }}
                        placeholder="account@company.vn"
                        className={inputClass}
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <KeyRound className="w-4 h-4" />
                    )}
                    <span>Kiểm Tra & Cấp Lại Mật Khẩu</span>
                  </button>

                  {/* ================= ACCOUNT SUPPORT SECTION ================= */}
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold px-0.5">
                      <span className="flex items-center gap-1.5">
                        <Headphones className="w-3.5 h-3.5 text-slate-700" />
                        Trung Tâm Hỗ Trợ Tài Khoản:
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors">
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Hotline 24/7</span>
                        <a href="tel:19006868" className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-700" /> 1900 6868
                        </a>
                      </div>
                      <a
                        href="/contact"
                        onClick={onClose}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors block text-left"
                      >
                        <span className="block text-[10px] text-slate-500 font-bold uppercase">Kỹ thuật & CSKH</span>
                        <span className="text-xs font-black text-black hover:underline inline-flex items-center gap-1 mt-0.5">
                          <MessageSquare className="w-3 h-3 text-slate-700" /> Gửi Yêu Cầu
                        </span>
                      </a>
                    </div>
                  </div>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => { setMode('login'); setErrorMsg(''); setForgotEmailNotFound(false); }}
                      className="text-xs font-bold text-slate-700 hover:text-black transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Quay lại trang Đăng nhập</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ================= LOGIN & REGISTER & 2FA VIEW ================= */
            <form onSubmit={mode === 'two_factor' ? handleVerify2FA : handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs text-center border border-red-100 font-bold">
                  {errorMsg}
                </div>
              )}

              {mode === 'two_factor' && (
                <div>
                  <label className={labelClass}>Mã xác thực 2FA:</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Ví dụ: 123456"
                    className="w-full text-center tracking-[0.2em] font-mono text-xl py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all bg-white"
                  />
                </div>
              )}

              {isRegister && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Họ và Tên:</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Nguyễn Văn A"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Số điện thoại:</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0987654321"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {mode !== 'two_factor' && (
                <div className={isRegister ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
                  <div className={isRegister ? 'sm:col-span-2' : undefined}>
                    <label className={labelClass}>Địa chỉ Email:</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="account@company.vn"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700">Mật khẩu:</label>
                      {mode === 'login' && (
                        <button
                          type="button"
                          onClick={() => { setMode('forgot_password'); setErrorMsg(''); setForgotSuccess(false); }}
                          className="text-xs font-bold text-[#1F1F1F] hover:underline cursor-pointer"
                        >
                          Quên mật khẩu?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className={inputClass}
                        minLength={isRegister ? 8 : undefined}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {isRegister && <PasswordStrengthBar password={password} />}
                  </div>

                  {isRegister && (
                    <div>
                      <label className={labelClass}>
                        Xác nhận mật khẩu: <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••"
                          className={inputClass}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-0.5 cursor-pointer"
                          aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {passwordsMatch && (
                        <p className="mt-1.5 text-xs text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Mật khẩu khớp
                        </p>
                      )}
                      {confirmPassword && !passwordsMatch && (
                        <p className="mt-1.5 text-xs text-red-500 font-bold">Mật khẩu chưa khớp</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {isRegister && (
                <div className="pt-5 border-t border-slate-100">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
                    Thông tin bổ sung (Không bắt buộc)
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className={labelClass}>Quốc gia:</label>
                      <div className="relative">
                        <select
                          value={countryCode}
                          onChange={(e) => {
                            setCountryCode(e.target.value);
                            if (e.target.value !== 'VN') setProvinceId('');
                          }}
                          className={selectClass}
                        >
                          {COUNTRY_OPTIONS.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Tỉnh / Thành phố:</label>
                      <div className="relative">
                        {countryCode === 'VN' ? (
                          <>
                            <select
                              value={provinceId}
                              onChange={(e) => setProvinceId(e.target.value)}
                              className={selectClass}
                            >
                              <option value="">Chọn tỉnh thành...</option>
                              {VIETNAM_PROVINCES.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </>
                        ) : (
                          <input
                            type="text"
                            value={provinceId}
                            onChange={(e) => setProvinceId(e.target.value)}
                            placeholder="Nhập bang / thành phố"
                            className={selectClass}
                          />
                        )}
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Mã số thuế (nếu có):</label>
                      <input
                        type="text"
                        value={taxCode}
                        onChange={(e) => setTaxCode(e.target.value)}
                        placeholder="0123456789"
                        className={selectClass}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className={labelClass}>Địa chỉ cụ thể:</label>
                      <input
                        type="text"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        placeholder="123 Đường ABC, Phường XYZ"
                        className={selectClass}
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className={labelClass}>Tên công ty:</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Công ty TNHH ABC"
                        className={selectClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-[#1F1F1F] hover:bg-black text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{mode === 'login' ? 'Đăng Nhập' : mode === 'two_factor' ? 'Xác Nhận 2FA' : 'Tạo Tài Khoản'}</span>
                )}
              </button>

              {mode !== 'two_factor' && (
                <>
                  <div className="relative flex items-center py-2">
                    <div className="flex-grow border-t border-slate-200"></div>
                    <span className="shrink-0 px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">HOẶC</span>
                    <div className="flex-grow border-t border-slate-200"></div>
                  </div>

                  <div className="flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setErrorMsg('Đăng nhập Google không thành công')}
                      theme="outline"
                      size="large"
                    />
                  </div>
                </>
              )}
            </form>
          )}

          {!isForgotPassword && (
            <div className="mt-6 text-center text-xs text-slate-600">
              {mode === 'login' ? (
                <p>
                  Chưa có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="font-bold text-[#1F1F1F] hover:underline cursor-pointer"
                  >
                    Đăng ký ngay
                  </button>
                </p>
              ) : (
                <p>
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-bold text-[#1F1F1F] hover:underline cursor-pointer"
                  >
                    Đăng nhập
                  </button>
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
