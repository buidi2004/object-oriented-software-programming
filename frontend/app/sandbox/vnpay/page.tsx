'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, CreditCard, Shield, XCircle } from 'lucide-react';

function VNPaySandboxContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get('key');
  const amount = searchParams.get('amount');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePay = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sandbox/vnpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idempotencyKey: key }),
      });

      if (res.ok) {
        setStatus('success');
        setTimeout(() => {
          router.push('/orders');
        }, 3000);
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/checkout');
  };

  if (!key || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500">Thiếu thông tin thanh toán.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-slate-100">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg">
            <CreditCard className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">VNPAY Sandbox</h1>
          <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
            <Shield className="w-4 h-4" /> Môi trường thử nghiệm
          </p>
        </div>

        {status === 'idle' && (
          <>
            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-600 text-sm">Mã giao dịch</span>
                <span className="font-mono text-sm font-semibold text-slate-900 truncate max-w-[150px]">{key}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-600 text-sm">Số tiền</span>
                <span className="text-xl font-black text-blue-600">
                  {Number(amount).toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePay}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Thanh Toán Thành Công'}
              </button>
              
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-base transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                Hủy Giao Dịch
              </button>
            </div>
          </>
        )}

        {status === 'success' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Thanh Toán Thành Công</h2>
            <p className="text-slate-500 text-sm">Đang chuyển hướng về trang đơn hàng...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Giao Dịch Thất Bại</h2>
            <p className="text-slate-500 text-sm mb-6">Đã xảy ra lỗi khi giả lập webhook.</p>
            <button
              onClick={() => setStatus('idle')}
              className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
            >
              Thử Lại
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VNPaySandbox() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <VNPaySandboxContent />
    </Suspense>
  );
}
