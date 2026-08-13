'use client';

import React, { useState } from 'react';
import { Gift, Loader2, Search, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { api } from '../../src/lib/api';
import { useAuthStore } from '../../src/store/useAuthStore';
import Link from 'next/link';

export default function GiftCardsPage() {
  const [code, setCode] = useState('');
  const [balance, setBalance] = useState<number | null>(null);
  const [amountToRedeem, setAmountToRedeem] = useState<number | ''>('');
  const [isChecking, setIsChecking] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { user } = useAuthStore();

  const handleCheck = async () => {
    if (!code.trim()) return;
    setIsChecking(true);
    setError('');
    setSuccess('');
    setBalance(null);
    try {
      const res = await api.get(`/gift-cards/${encodeURIComponent(code)}/balance`);
      setBalance(res.data);
      setAmountToRedeem(res.data); // default to full amount
    } catch (err: any) {
      setError(err.response?.data?.message || 'Thẻ quà tặng không hợp lệ hoặc đã hết hạn.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleRedeem = async () => {
    if (!code || !amountToRedeem || amountToRedeem <= 0) return;
    setIsRedeeming(true);
    setError('');
    try {
      const res = await api.post('/gift-cards/redeem', {
        code,
        amountToRedeem: Number(amountToRedeem)
      });
      setSuccess(`Bạn đã nạp thành công ${Number(amountToRedeem).toLocaleString('vi-VN')} đ vào ví! Số dư thẻ còn lại: ${res.data.remainingAmount.toLocaleString('vi-VN')} đ`);
      setBalance(res.data.remainingAmount);
      setAmountToRedeem(res.data.remainingAmount > 0 ? res.data.remainingAmount : '');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi nạp thẻ.');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6">
          <Gift className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Thẻ Quà Tặng (Gift Cards)</h1>
        <p className="text-slate-500 mt-3 text-lg max-w-xl mx-auto">
          Nhập mã thẻ quà tặng của bạn để kiểm tra số dư và nạp tiền vào ví CloudHost VN.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
        
        <div className="p-8 sm:p-12">
          {!user ? (
            <div className="text-center py-10">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Vui lòng đăng nhập</h2>
              <p className="text-slate-500 mb-6">Bạn cần đăng nhập để có thể nạp thẻ quà tặng vào ví.</p>
              <Link href="/login?redirect=/gift-cards" className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition">
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Step 1: Enter Code */}
              <div>
                <label className="block text-sm font-bold text-slate-900 mb-2">Mã Thẻ Quà Tặng</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="VD: CLOUD-XXXX-YYYY"
                      className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3.5 pl-12 pr-4 text-slate-900 font-bold uppercase tracking-wider transition-all outline-none"
                    />
                  </div>
                  <button
                    onClick={handleCheck}
                    disabled={!code || isChecking}
                    className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
                  >
                    {isChecking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    <span className="hidden sm:inline">Kiểm tra</span>
                  </button>
                </div>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-rose-700">{error}</p>
                </div>
              )}
              {success && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-semibold text-emerald-700">{success}</p>
                </div>
              )}

              {/* Step 2: Redeem */}
              {balance !== null && balance >= 0 && (
                <div className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100 mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-emerald-800 font-medium text-sm">Số dư thẻ khả dụng</p>
                      <p className="text-3xl font-black text-emerald-600 mt-1">{balance.toLocaleString('vi-VN')} đ</p>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  </div>

                  {balance > 0 ? (
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">Số tiền muốn nạp vào ví</label>
                      <div className="flex gap-3">
                        <div className="relative flex-1">
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">VNĐ</span>
                          <input
                            type="number"
                            value={amountToRedeem}
                            onChange={(e) => setAmountToRedeem(Number(e.target.value))}
                            max={balance}
                            min={1000}
                            className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3.5 px-4 text-slate-900 font-bold transition-all outline-none"
                          />
                        </div>
                        <button
                          onClick={handleRedeem}
                          disabled={!amountToRedeem || isRedeeming || amountToRedeem <= 0 || amountToRedeem > balance}
                          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                          {isRedeeming ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>Nạp tiền</span>}
                          {!isRedeeming && <ArrowRight className="w-5 h-5" />}
                        </button>
                      </div>
                      {Number(amountToRedeem) > balance && (
                        <p className="text-xs text-rose-500 mt-2 font-medium">Số tiền nhập vượt quá số dư thẻ.</p>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-slate-50 rounded-xl">
                      <p className="text-slate-500 font-medium">Thẻ quà tặng này đã được sử dụng hết.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
