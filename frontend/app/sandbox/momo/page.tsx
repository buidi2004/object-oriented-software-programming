'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  QrCode, CheckCircle, XCircle, Loader2, ArrowRight, ShieldCheck, 
  Smartphone, Clock, Sparkles, Building, Lock
} from 'lucide-react';
import confetti from 'canvas-confetti';

function MomoSandboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId') || 'PAY_SAMPLE_ORDER';
  const amountStr = searchParams.get('amount') || '500000';
  const amount = parseFloat(amountStr) || 500000;

  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [message, setMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handlePaySuccess = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payments/webhook/momo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerCode: 'MOMO',
          orderId: orderId,
          requestId: `REQ_${Date.now()}`,
          amount: amount,
          orderInfo: `Thanh toan don hang MoMo Sandbox ${orderId}`,
          resultCode: 0,
          message: 'Successful.',
          transId: `${Date.now()}`,
        }),
      });

      setStatus('success');
      setMessage('Giao dịch MoMo Sandbox thành công! Dịch vụ đã được kích hoạt.');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      setStatus('success');
      setMessage('Giao dịch MoMo Sandbox đã được mô phỏng thành công!');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayCancel = async () => {
    setIsLoading(true);
    try {
      await fetch('/api/payments/webhook/momo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerCode: 'MOMO',
          orderId: orderId,
          requestId: `REQ_${Date.now()}`,
          amount: amount,
          orderInfo: `Khach hang huy giao dich`,
          resultCode: 1006,
          message: 'Transaction cancelled by user.',
          transId: `${Date.now()}`,
        }),
      });
      router.push('/checkout');
    } catch {
      router.push('/checkout');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#a50064]/20 via-pink-50 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-pink-200 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-12 h-12 text-[#a50064]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-[#a50064] text-xs font-bold mb-3 border border-pink-100">
            <Sparkles className="w-3.5 h-3.5" /> Giao Dịch MoMo Thành Công
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Đã Thanh Toán!</h1>
          <p className="text-slate-500 mb-6 text-sm">
            {message}
          </p>

          <div className="bg-pink-50/50 rounded-2xl p-5 mb-6 text-left border border-pink-100 space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-pink-200">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Số tiền:</span>
              <span className="font-black text-xl text-[#a50064]">{amount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Người nhận:</span>
              <span className="font-bold text-slate-800">CLOUD SERVICE STORE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Cổng thanh toán:</span>
              <span className="font-bold text-[#a50064]">Ví MoMo Sandbox E2E</span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/orders"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#a50064] to-[#d82d8b] hover:opacity-95 text-white font-bold text-base shadow-lg shadow-pink-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Xem Đơn Hàng Đã Kích Hoạt
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/"
              className="w-full py-3.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-all flex items-center justify-center"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* MoMo Header */}
        <div className="bg-gradient-to-r from-[#a50064] via-[#c21875] to-[#d82d8b] p-6 text-white text-center relative">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg p-2">
            <span className="text-[#a50064] font-black text-2xl tracking-tighter">momo</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight">Cổng Thanh Toán Ví MoMo</h1>
          <div className="flex items-center justify-center gap-2 mt-1">
            <span className="text-[10px] uppercase font-bold bg-white/20 px-2 py-0.5 rounded-full text-pink-100">
              Sandbox Test Gateway
            </span>
            <span className="text-xs font-mono text-pink-200 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Đơn vị nhận</span>
              <span className="font-bold text-slate-900 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#a50064]" /> CLOUD SERVICE STORE
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mã đơn hàng</span>
              <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-xs">
                {orderId}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Tổng thanh toán</span>
              <span className="text-2xl font-black text-[#a50064]">
                {amount.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          {/* QR Simulator Box */}
          <div className="border-2 border-dashed border-pink-200 rounded-3xl p-6 flex flex-col items-center justify-center bg-pink-50/30 text-center">
            <div className="bg-white p-4 rounded-2xl shadow-md border border-pink-100 mb-3 relative">
              <QrCode className="w-40 h-40 text-[#a50064]" />
              <div className="absolute inset-0 border-2 border-[#a50064]/40 rounded-2xl animate-pulse pointer-events-none" />
            </div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-0.5">
              <Smartphone className="w-4 h-4 text-[#a50064]" />
              Mở App MoMo Quét Mã QR
            </p>
            <p className="text-[11px] text-slate-400">
              Hoặc bấm nút xác nhận thanh toán giả lập bên dưới
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePaySuccess}
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#a50064] to-[#d82d8b] hover:from-[#8f0056] hover:to-[#be1d75] text-white font-bold text-base shadow-lg shadow-pink-600/30 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Xác Nhận Thanh Toán MoMo Thành Công
                </>
              )}
            </button>

            <button
              onClick={handlePayCancel}
              disabled={isLoading}
              className="w-full py-3 rounded-2xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4 text-slate-400" />
              Huỷ Giao Dịch & Quay Lại
            </button>
          </div>

          <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            Chứng thực SSL 256-bit MoMo Partner Sandbox
          </div>
        </div>

      </div>
    </div>
  );
}

export default function MomoSandboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
      <MomoSandboxContent />
    </Suspense>
  );
}
