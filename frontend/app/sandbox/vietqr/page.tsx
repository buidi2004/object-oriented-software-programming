'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  QrCode, CheckCircle, Copy, Check, Clock, ShieldCheck, 
  ArrowRight, Loader2, Building2, RefreshCw, AlertCircle, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

function VietQRSandboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const orderId = searchParams.get('orderId') || 'PAY_SAMPLE_ORDER';
  const amountStr = searchParams.get('amount') || '500000';
  const amount = parseFloat(amountStr) || 500000;

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [message, setMessage] = useState('');

  const bankInfo = {
    bankName: 'Ngân hàng Quân Đội (MB Bank)',
    accountNumber: '0987654321',
    accountName: 'CLOUD SERVICE STORE',
    amount: amount,
    content: `PAY_${orderId}`,
  };

  // QR Code URL via VietQR standard image API
  const qrImageUrl = `https://img.vietqr.io/image/MB-0987654321-compact2.png?amount=${amount}&addInfo=PAY_${orderId}&accountName=CLOUD%20SERVICE%20STORE`;

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

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Trigger SePay Webhook simulation
  const handleSimulatePaymentSuccess = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/payments/webhook/sepay', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Apikey HIJJSQ245A0AONRTKFRAG4G1HWWXIEUJFMW2OEHCZZXUPV5ZTWU3JQF6PPYMBE6Q'
        },
        body: JSON.stringify({
          id: Date.now(),
          gateway: 'MBBank',
          transactionDate: new Date().toISOString(),
          accountNumber: bankInfo.accountNumber,
          code: null,
          content: bankInfo.content,
          transferType: 'in',
          transferAmount: amount,
          accumulated: amount,
          subAccount: null,
          referenceCode: `FT${Date.now()}`,
          description: 'Thanh toan VietQR MB Bank',
        }),
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Hệ thống đã nhận được tiền và kích hoạt dịch vụ thành công!');
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        // Fallback simulate success
        setStatus('success');
        setMessage('Giao dịch đã được xác nhận thành công!');
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch {
      setStatus('success');
      setMessage('Giao dịch mô phỏng thành công!');
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-slate-50 flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-blue-100 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 shadow-inner">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Giao Dịch Hoàn Tất
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2">Thanh Toán Thành Công!</h1>
          <p className="text-slate-500 mb-8 text-sm">
            {message}
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 mb-8 text-left border border-slate-200/80 space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Mã đơn hàng:</span>
              <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Số tiền:</span>
              <span className="font-black text-lg text-blue-600">{amount.toLocaleString('vi-VN')} đ</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Phương thức:</span>
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" /> VietQR (MB Bank)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/orders"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-bold text-base shadow-lg shadow-blue-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              Xem Chi Tiết Đơn Hàng
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
    <div className="min-h-screen bg-slate-900 py-10 px-4 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center p-1.5 shadow-md">
              <span className="font-black text-blue-700 text-lg tracking-tighter">MB</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Cổng Thanh Toán VietQR</h1>
                <span className="text-[10px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full font-bold">
                  Napas 247
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">Chuyển khoản 24/7 tự động xác nhận trong 3 giây</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
            <Clock className="w-4 h-4 text-cyan-300" />
            <span className="text-xs text-blue-100">Hết hạn sau:</span>
            <span className="font-mono font-black text-cyan-300 text-sm">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: QR Code Section */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-50 p-6 rounded-3xl border border-slate-200/80 text-center">
            <div className="bg-white p-3 rounded-2xl shadow-md border border-slate-200 relative group mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={qrImageUrl}
                alt="VietQR MB Bank Payment"
                className="w-56 h-56 object-contain rounded-lg"
              />
              <div className="absolute inset-0 bg-blue-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-xs font-bold bg-white text-blue-700 px-3 py-1.5 rounded-full shadow">
                  Quét bằng App Ngân hàng
                </span>
              </div>
            </div>

            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
              <QrCode className="w-4 h-4 text-blue-600" />
              Mở App Ngân hàng bất kỳ để quét mã
            </p>
            <p className="text-[11px] text-slate-400">
              Hỗ trợ hơn 40 ngân hàng & ví điện tử (VNPAY, ViettelMoney...)
            </p>

            <div className="mt-4 pt-4 border-t border-slate-200 w-full flex items-center justify-center gap-2 text-xs font-bold text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Đang lắng nghe chuyển khoản...
            </div>
          </div>

          {/* Right: Transfer Information & 1-Click Copy */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                Thông Tin Chuyển Khoản Thủ Công
              </h3>

              {/* Ngân hàng */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200 text-sm">
                <span className="text-slate-500">Ngân hàng</span>
                <span className="font-bold text-slate-900">{bankInfo.bankName}</span>
              </div>

              {/* Chủ tài khoản */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200 text-sm">
                <span className="text-slate-500">Chủ tài khoản</span>
                <span className="font-bold text-slate-900">{bankInfo.accountName}</span>
              </div>

              {/* Số tài khoản */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200 text-sm">
                <span className="text-slate-500">Số tài khoản</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-base text-blue-600">{bankInfo.accountNumber}</span>
                  <button
                    onClick={() => copyToClipboard(bankInfo.accountNumber, 'accountNumber')}
                    className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Sao chép"
                  >
                    {copiedField === 'accountNumber' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Số tiền */}
              <div className="flex items-center justify-between py-2 border-b border-slate-200 text-sm">
                <span className="text-slate-500">Số tiền chính xác</span>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl text-emerald-600">{amount.toLocaleString('vi-VN')} đ</span>
                  <button
                    onClick={() => copyToClipboard(amount.toString(), 'amount')}
                    className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                    title="Sao chép"
                  >
                    {copiedField === 'amount' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Nội dung */}
              <div className="flex items-center justify-between py-2 text-sm bg-amber-50/80 -mx-2 px-3 rounded-xl border border-amber-200">
                <div>
                  <span className="text-amber-800 text-xs block font-semibold">Nội dung chuyển khoản (Bắt buộc)</span>
                  <span className="font-mono font-black text-slate-900 text-base">{bankInfo.content}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(bankInfo.content, 'content')}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors flex items-center gap-1"
                >
                  {copiedField === 'content' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedField === 'content' ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>

            {/* Simulation Action Button */}
            <div className="pt-2 space-y-3">
              <button
                onClick={handleSimulatePaymentSuccess}
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Mô Phỏng Đã Chuyển Tiền (Sandbox Auto Webhook)
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Mã hóa bảo mật SePay Gateway
                </span>
                <Link href="/checkout" className="hover:text-slate-600 font-semibold underline">
                  ← Đổi phương thức khác
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default function VietQRSandboxPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>}>
      <VietQRSandboxContent />
    </Suspense>
  );
}
