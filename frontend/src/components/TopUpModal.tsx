'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, Wallet, QrCode, CreditCard, ShieldCheck, ArrowRight, 
  Sparkles, CheckCircle2, AlertCircle 
} from 'lucide-react';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
  suggestedAmount?: number;
  onSuccess?: () => void;
}

const PRESET_AMOUNTS = [
  50000,
  100000,
  200000,
  500000,
  1000000,
  2000000,
  5000000,
];

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  currentBalance = 0,
  suggestedAmount,
  onSuccess,
}) => {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(suggestedAmount || 500000);
  const [customInput, setCustomInput] = useState<string>(suggestedAmount ? suggestedAmount.toString() : '500000');
  const [paymentMethod, setPaymentMethod] = useState<'vietqr' | 'momo' | 'zalo'>('vietqr');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomInput(val.toString());
    setError('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9]/g, '');
    setCustomInput(rawVal);
    const num = parseInt(rawVal, 10);
    if (!isNaN(num)) {
      setAmount(num);
      setError('');
    } else {
      setAmount(0);
    }
  };

  const handleProceed = () => {
    if (amount < 10000) {
      setError('Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }
    if (amount > 100000000) {
      setError('Số tiền nạp tối đa là 100.000.000 VNĐ cho mỗi giao dịch');
      return;
    }

    const topUpCode = `TOPUP${Date.now().toString().slice(-6)}`;
    onClose();

    if (paymentMethod === 'vietqr') {
      router.push(`/sandbox/vietqr?type=topup&amount=${amount}&orderId=${topUpCode}`);
    } else if (paymentMethod === 'momo') {
      router.push(`/sandbox/momo?type=topup&amount=${amount}&orderId=${topUpCode}`);
    } else if (paymentMethod === 'zalo') {
      router.push(`/sandbox/zalo?type=topup&amount=${amount}&orderId=${topUpCode}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1F1F1F] flex items-center justify-center text-white shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Nạp Tiền Vào Ví CloudHost</h3>
              <p className="text-xs text-slate-500">
                Số dư hiện tại: <span className="font-bold text-emerald-600">{currentBalance.toLocaleString('vi-VN')} đ</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Preset amounts */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              1. Chọn số tiền nạp nhanh
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((preset) => {
                const isSelected = amount === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`py-2 px-3 text-xs font-bold rounded border transition-all ${
                      isSelected
                        ? 'bg-[#1F1F1F] text-white border-[#1F1F1F] shadow-xs scale-102'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {preset.toLocaleString('vi-VN')} đ
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom amount input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Hoặc nhập số tiền tùy chỉnh (VNĐ)
            </label>
            <div className="relative">
              <input
                type="text"
                value={customInput ? parseInt(customInput, 10).toLocaleString('vi-VN') : ''}
                onChange={handleCustomChange}
                placeholder="VD: 500.000"
                className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-3 text-slate-900 font-bold text-base focus:bg-white focus:border-[#1F1F1F] focus:ring-1 focus:ring-[#1F1F1F] outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                VNĐ
              </span>
            </div>
            {error && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </p>
            )}
          </div>

          {/* Payment method selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              2. Chọn phương thức chuyển khoản
            </label>
            <div className="space-y-2.5">
              {/* VietQR */}
              <label
                onClick={() => setPaymentMethod('vietqr')}
                className={`flex items-center justify-between p-3.5 rounded-md border cursor-pointer transition-all ${
                  paymentMethod === 'vietqr'
                    ? 'border-[#1F1F1F] bg-slate-50/80 ring-1 ring-[#1F1F1F]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">Chuyển khoản VietQR 24/7 (MB Bank)</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Tự động 24/7
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">Quét mã QR qua tất cả App Ngân hàng VN, tiền vào ví sau 2s</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'vietqr' ? 'border-[#1F1F1F] bg-[#1F1F1F]' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'vietqr' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>

              {/* MoMo */}
              <label
                onClick={() => setPaymentMethod('momo')}
                className={`flex items-center justify-between p-3.5 rounded-md border cursor-pointer transition-all ${
                  paymentMethod === 'momo'
                    ? 'border-[#1F1F1F] bg-slate-50/80 ring-1 ring-[#1F1F1F]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 font-bold text-xs">
                    MoMo
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">Ví MoMo (Sandbox)</span>
                    <p className="text-xs text-slate-500 mt-0.5">Thanh toán qua ví điện tử MoMo</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'momo' ? 'border-[#1F1F1F] bg-[#1F1F1F]' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'momo' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>

              {/* ZaloPay */}
              <label
                onClick={() => setPaymentMethod('zalo')}
                className={`flex items-center justify-between p-3.5 rounded-md border cursor-pointer transition-all ${
                  paymentMethod === 'zalo'
                    ? 'border-[#1F1F1F] bg-slate-50/80 ring-1 ring-[#1F1F1F]'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                    Zalo
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900">Ví ZaloPay (Sandbox)</span>
                    <p className="text-xs text-slate-500 mt-0.5">Thanh toán qua ví điện tử ZaloPay</p>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                  paymentMethod === 'zalo' ? 'border-[#1F1F1F] bg-[#1F1F1F]' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'zalo' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
          <div>
            <span className="text-xs text-slate-500 block">Tổng tiền nạp</span>
            <span className="text-lg font-black text-slate-900">
              {amount > 0 ? amount.toLocaleString('vi-VN') : 0} đ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded text-xs font-bold text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleProceed}
              className="px-6 py-2.5 rounded bg-[#1F1F1F] hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
            >
              Tiến hành nạp tiền
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
