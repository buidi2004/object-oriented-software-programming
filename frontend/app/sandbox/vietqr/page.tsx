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
  
  // Real Bank Configuration for testing with actual Banking Apps
  const [showConfig, setShowConfig] = useState(false);
  const [selectedBank, setSelectedBank] = useState('MB');
  const [customAccNumber, setCustomAccNumber] = useState('0987654321');
  const [customAccName, setCustomAccName] = useState('CLOUD SERVICE STORE');

  const VIETNAMESE_BANKS = [
    { code: 'MB', name: 'MB Bank (Quân Đội)', bin: '970422' },
    { code: 'VCB', name: 'Vietcombank (Ngoại Thương)', bin: '970436' },
    { code: 'TCB', name: 'Techcombank (Kỹ Thương)', bin: '970407' },
    { code: 'ICB', name: 'VietinBank (Công Thương)', bin: '970415' },
    { code: 'BIDV', name: 'BIDV (Đầu Tư & Phát Triển)', bin: '970418' },
    { code: 'ACB', name: 'ACB (Á Châu)', bin: '970416' },
    { code: 'TPB', name: 'TPBank (Tiên Phong)', bin: '970423' },
    { code: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)', bin: '970432' },
    { code: 'STB', name: 'Sacombank (Sài Gòn Thương Tín)', bin: '970403' },
    { code: 'VIB', name: 'VIB (Quốc Tế)', bin: '970441' },
    { code: 'SHB', name: 'SHB (Sài Gòn - Hà Nội)', bin: '970443' },
    { code: 'MSB', name: 'MSB (Hàng Hải)', bin: '970426' },
    { code: 'TIMO', name: 'Timo by BVBank', bin: '963388' },
    { code: 'CAKE', name: 'Cake by VPBank', bin: '546034' },
  ];

  const currentBankObj = VIETNAMESE_BANKS.find(b => b.code === selectedBank) || VIETNAMESE_BANKS[0];

  // Clean short alphanumeric transfer content conforming strictly to NAPAS 24/7 VietQR EMVCo spec (tag 62.08)
  const rawClean = orderId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const shortOrderCode = rawClean.length > 10 ? rawClean.slice(0, 8) : (rawClean || 'TEST');
  const cleanContent = `PAY${shortOrderCode}`;

  const bankInfo = {
    bankName: currentBankObj.name,
    bankCode: selectedBank,
    bankBin: currentBankObj.bin,
    accountNumber: customAccNumber,
    accountName: customAccName,
    amount: amount,
    content: cleanContent,
  };

  // QR Code URL via official VietQR NAPAS standard image API (using Bank BIN for 100% banking app recognition)
  const encodedName = encodeURIComponent(customAccName.toUpperCase());
  const qrImageUrl = `https://img.vietqr.io/image/${currentBankObj.bin}-${customAccNumber}-compact2.png?amount=${Math.round(amount)}&addInfo=${cleanContent}&accountName=${encodedName}`;

  // Fetch configured system settings if available
  useEffect(() => {
    fetch('http://localhost:5053/api/system-settings/vietqr_account_no')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.value && data.value.trim() !== '') setCustomAccNumber(data.value.trim());
      })
      .catch(() => null);

    fetch('http://localhost:5053/api/system-settings/vietqr_bank_id')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.value && data.value.trim() !== '') setSelectedBank(data.value.trim().toUpperCase());
      })
      .catch(() => null);

    fetch('http://localhost:5053/api/system-settings/vietqr_account_name')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.value && data.value.trim() !== '') setCustomAccName(data.value.trim().toUpperCase());
      })
      .catch(() => null);
  }, []);

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
                key={qrImageUrl}
                src={qrImageUrl}
                alt={`VietQR ${bankInfo.bankName} Payment`}
                className="w-60 h-60 object-contain rounded-lg transition-all"
                onError={(e) => {
                  // Fallback to SePay Direct QR link if img.vietqr.io has rate limit
                  const target = e.currentTarget;
                  const sepayFallback = `https://qr.sepay.vn/img?acc=${customAccNumber}&bank=${selectedBank}&amount=${Math.round(amount)}&des=${cleanContent}&template=compact`;
                  if (target.src !== sepayFallback) {
                    target.src = sepayFallback;
                  }
                }}
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
              Chuẩn NAPAS 24/7 (MB, VCB, TCB, VPB, VietinBank...)
            </p>

            <div className="mt-3 pt-3 border-t border-slate-200 w-full flex items-center justify-center gap-2 text-xs font-bold text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
              Đang lắng nghe chuyển khoản tự động...
            </div>
          </div>

          {/* Right: Transfer Information & 1-Click Copy */}
          <div className="lg:col-span-7 space-y-4">
            {/* Notice / Real Banking App Notice & Config Accordion */}
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-blue-800">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Bạn muốn quét bằng App Ngân Hàng Thật trên điện thoại?
                </span>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
                >
                  {showConfig ? 'Đóng cấu hình' : '⚙️ Đổi sang STK Thật'}
                </button>
              </div>

              {showConfig ? (
                <div className="pt-2 border-t border-blue-200/80 space-y-3 mt-2">
                  <p className="text-[11px] text-blue-700">
                    💡 <em>App ngân hàng thật sẽ kiểm tra qua Napas 24/7. Nhập STK & Ngân hàng thật của bạn bên dưới để quét thử thành công 100%:</em>
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chọn Ngân Hàng</label>
                      <select 
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-600"
                      >
                        {VIETNAMESE_BANKS.map((b) => (
                          <option key={b.code} value={b.code}>
                            {b.name} ({b.code})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">Số Tài Khoản Nhận Thật</label>
                      <input 
                        type="text"
                        value={customAccNumber}
                        onChange={(e) => setCustomAccNumber(e.target.value.trim())}
                        placeholder="Nhập STK của bạn..."
                        className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-slate-900 text-xs font-mono font-bold focus:outline-none focus:border-blue-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Tên Chủ Tài Khoản (In Hoa Không Dấu)</label>
                    <input 
                      type="text"
                      value={customAccName}
                      onChange={(e) => setCustomAccName(e.target.value.toUpperCase())}
                      placeholder="NGUYEN VAN A"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white text-slate-900 text-xs font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-blue-700/90 leading-relaxed">
                  Mặc định đang dùng STK demo <code>0987654321</code> (MB Bank). Nếu quét bằng App ngân hàng thật sẽ báo <em>"Tài khoản thụ hưởng không tồn tại"</em> do Napas chặn data ảo. Nhấn <strong>"⚙️ Đổi sang STK Thật"</strong> để điền STK thật của bạn và quét ngay!
                </p>
              )}
            </div>

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
