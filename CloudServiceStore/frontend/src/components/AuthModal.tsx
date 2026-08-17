'use client';

import React, { useState } from 'react';
import { X, Lock, Mail, User, Cloud, Phone, Eye, EyeOff, ChevronDown, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useAuthStore } from '../store/useAuthStore';
import {
  COUNTRY_OPTIONS,
  VIETNAM_PROVINCES,
  getCountryName,
  getProvinceName,
} from '../lib/locationOptions';
import { getPasswordStrength } from '../lib/passwordStrength';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

const inputClass =
  'w-full pl-10 pr-10 py-3 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all';
const selectClass =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all appearance-none bg-white';
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
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
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

  const { setToken, setUser } = useAuthStore();
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
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

  const isRegister = mode === 'register';
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div
        className={`bg-white rounded-3xl w-full overflow-hidden shadow-2xl border border-slate-100 relative animate-in fade-in zoom-in duration-200 ${
          isRegister ? 'max-w-3xl lg:max-w-4xl' : 'max-w-md lg:max-w-lg'
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className={`${isRegister ? 'p-6 sm:p-8 lg:p-10' : 'p-6 sm:p-8'}`}>
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20">
              <Cloud className="w-7 h-7" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">
              {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Tạo Tài Khoản CloudHost'}
            </h3>
            <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
              {mode === 'login'
                ? 'Truy cập Bảng quản lý máy chủ & dịch vụ Cloud'
                : 'Trải nghiệm hạ tầng Cloud chuẩn Doanh nghiệp'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center border border-red-100">
                {errorMsg}
              </div>
            )}

            {isRegister && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Họ và Tên:</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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

            <div className={isRegister ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'}>
              <div className={isRegister ? 'sm:col-span-2' : undefined}>
                <label className={labelClass}>Địa chỉ Email:</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                <label className={labelClass}>Mật khẩu:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
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
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {passwordsMatch && (
                    <p className="mt-1.5 text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mật khẩu khớp
                    </p>
                  )}
                  {confirmPassword && !passwordsMatch && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">Mật khẩu chưa khớp</p>
                  )}
                </div>
              )}
            </div>

            {isRegister && (
              <div className="pt-5 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-800 mb-4">
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
                          setProvinceId('');
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
                    <label className={labelClass}>Tỉnh/Thành phố:</label>
                    <div className="relative">
                      {countryCode === 'VN' ? (
                        <>
                          <select
                            value={provinceId}
                            onChange={(e) => setProvinceId(e.target.value)}
                            className={`${selectClass} ${!provinceId ? 'text-slate-400' : ''}`}
                          >
                            <option value="">-- Chọn Tỉnh / Thành phố --</option>
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
                          placeholder="Nhập tỉnh / thành phố"
                          className={selectClass}
                        />
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-1">
                    <label className={labelClass}>Mã số thuế:</label>
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
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{mode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? (
              <p>
                Chưa có tài khoản?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
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
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Đăng nhập
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
