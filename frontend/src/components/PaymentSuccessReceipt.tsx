'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight, 
  ShieldCheck, 
  Server, 
  Database, 
  HardDrive, 
  Lock, 
  Cpu, 
  Building2, 
  QrCode, 
  Wallet, 
  FileText, 
  Mail,
  Zap,
  Globe
} from 'lucide-react';
import { getServiceDashboardUrl, getPaymentSuccessMessage } from '@/src/lib/serviceRedirect';

interface PaymentSuccessReceiptProps {
  orderId: string;
  amount: number;
  paymentMethod: string;
  categorySlug?: string | null;
  servicePlanName?: string | null;
  serviceDetails?: string | null;
  billingCycle?: string | number | null;
  isTopUp?: boolean;
  customMessage?: string;
  orderData?: any;
}

export const PaymentSuccessReceipt: React.FC<PaymentSuccessReceiptProps> = ({
  orderId,
  amount,
  paymentMethod,
  categorySlug,
  servicePlanName,
  serviceDetails,
  billingCycle,
  isTopUp = false,
  customMessage,
  orderData,
}) => {
  const [copiedOrderId, setCopiedOrderId] = useState(false);

  // Extract from orderData if available
  const firstItem = orderData?.items?.[0];
  const rawCat = categorySlug || firstItem?.categorySlug || '';
  const rawName = (servicePlanName && !servicePlanName.startsWith('Dịch vụ '))
    ? servicePlanName
    : (firstItem?.servicePlanName || 'Dịch Vụ Cloud');
  const rawDetails = serviceDetails || firstItem?.details || firstItem?.servicePlanDetails || '';
  const rawCycle = billingCycle || firstItem?.billingCycle || '1 Tháng';

  const serviceInfo = getServiceDashboardUrl(rawCat, rawName);
  const successMessage = customMessage || getPaymentSuccessMessage(rawCat, rawName);

  const handleCopyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopiedOrderId(true);
    setTimeout(() => setCopiedOrderId(false), 2000);
  };

  const getServiceIcon = (name: string, cat: string) => {
    const combined = `${name} ${cat}`.toLowerCase();
    if (combined.includes('database') || combined.includes('db')) return <Database className="w-5 h-5 text-amber-500" />;
    if (combined.includes('storage') || combined.includes('s3')) return <HardDrive className="w-5 h-5 text-amber-500" />;
    if (combined.includes('security') || combined.includes('waf')) return <Lock className="w-5 h-5 text-amber-500" />;
    if (combined.includes('dedicated') || combined.includes('máy chủ riêng')) return <Server className="w-5 h-5 text-amber-500" />;
    if (combined.includes('hosting') || combined.includes('domain')) return <Globe className="w-5 h-5 text-amber-500" />;
    return <Cpu className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center text-zinc-100">
      <div className="max-w-4xl w-full bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Luxury Top Header Banner */}
        <div className="relative bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-zinc-800 px-6 sm:px-10 py-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-4 ring-amber-500/10">
                <CheckCircle2 className="w-9 h-9 text-zinc-950 stroke-[2.5]" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-zinc-950 border-2 border-zinc-800 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Zap className="w-3.5 h-3.5" /> Giao Dịch Thành Công
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {isTopUp ? 'Nạp Tiền Vào Ví Thành Công!' : 'Xác Nhận Thanh Toán Hoàn Tất!'}
              </h1>
              <p className="text-zinc-400 text-sm mt-1 max-w-xl">
                {successMessage}
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right shrink-0">
            <span className="text-xs text-zinc-400 uppercase tracking-widest font-semibold block">Tổng thanh toán</span>
            <span className="text-3xl sm:text-4xl font-black text-amber-400 tracking-tight">
              {amount.toLocaleString('vi-VN')} <span className="text-xl font-bold text-zinc-400">đ</span>
            </span>
          </div>
        </div>

        {/* 2-Column Detailed Receipt Section */}
        <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Service Information (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-zinc-950/60 border border-zinc-800/90 rounded-xl p-6 relative overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 mb-4">
                <div className="flex items-center gap-2.5">
                  {getServiceIcon(rawName, rawCat)}
                  <h2 className="font-black text-white text-base tracking-wide">
                    {isTopUp ? 'Thông Tin Nạp Tiền' : 'Gói Dịch Vụ Đã Đăng Ký'}
                  </h2>
                </div>
                <span className="px-2.5 py-1 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Tự Động Kích Hoạt
                </span>
              </div>

              {isTopUp ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                    <span className="text-zinc-400">Loại giao dịch:</span>
                    <span className="font-bold text-white">Nạp tiền vào số dư ví CloudHost</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                    <span className="text-zinc-400">Số tiền nạp:</span>
                    <span className="font-black text-amber-400">{amount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-400">Trạng thái:</span>
                    <span className="font-bold text-white flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                      Đã cộng vào số dư khả dụng
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5 text-sm">
                  <div>
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Tên dịch vụ</span>
                    <div className="text-base font-black text-white bg-zinc-900/80 p-3 rounded-lg border border-zinc-800">
                      {rawName}
                    </div>
                  </div>

                  {rawDetails && (
                    <div>
                      <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-1">Thông số cấu hình</span>
                      <p className="text-xs text-zinc-300 bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800/60 font-mono">
                        {rawDetails}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60">
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold block">Chu kỳ gia hạn</span>
                      <span className="text-sm font-bold text-zinc-200 mt-0.5 block">{rawCycle}</span>
                    </div>
                    <div className="bg-zinc-900/40 p-3 rounded-lg border border-zinc-800/60">
                      <span className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold block">Cam kết SLA</span>
                      <span className="text-sm font-bold text-zinc-200 mt-0.5 block">99.99% Uptime</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notification helper note */}
            <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-4 flex items-start gap-3 text-xs text-zinc-300">
              <Mail className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Hệ thống máy chủ đã tự động gửi biên lai hóa đơn và thông tin kết nối truy cập vào hòm thư tài khoản của bạn.
              </p>
            </div>
          </div>

          {/* Right Column: Transaction & Invoice Receipt (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-zinc-950/60 border border-zinc-800/90 rounded-xl p-6">
              <div className="flex items-center gap-2 border-b border-zinc-800/80 pb-3 mb-4">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                  Biên Lai Điện Tử
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-zinc-500 block mb-1">Mã đơn hàng:</span>
                  <div className="flex items-center justify-between bg-zinc-900 p-2.5 rounded-lg border border-zinc-800">
                    <span className="font-mono text-zinc-200 font-bold break-all text-[11px]">
                      {orderId}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderId}
                      className="ml-2 p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer shrink-0"
                      title="Sao chép mã đơn hàng"
                    >
                      {copiedOrderId ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <span className="text-zinc-400">Phương thức:</span>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    {paymentMethod.includes('MoMo') && <Building2 className="w-3.5 h-3.5 text-amber-400" />}
                    {paymentMethod.includes('VietQR') && <QrCode className="w-3.5 h-3.5 text-amber-400" />}
                    {paymentMethod.includes('Zalo') && <Zap className="w-3.5 h-3.5 text-amber-400" />}
                    {paymentMethod.includes('Ví') && <Wallet className="w-3.5 h-3.5 text-amber-400" />}
                    {paymentMethod}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <span className="text-zinc-400">Thời gian giao dịch:</span>
                  <span className="font-mono text-zinc-300">{new Date().toLocaleString('vi-VN')}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-zinc-800/40">
                  <span className="text-zinc-400">Thuế GTGT (VAT 8%):</span>
                  <span className="text-zinc-300">Đã bao gồm</span>
                </div>

                <div className="flex justify-between pt-2 text-sm">
                  <span className="font-bold text-zinc-300">Tổng thanh toán:</span>
                  <span className="font-black text-amber-400 text-base">{amount.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Button Footer - Massive, Wide, Premium */}
        <div className="bg-zinc-950 border-t border-zinc-800/90 px-6 sm:px-10 py-6 flex flex-col sm:flex-row items-center gap-4">
          {isTopUp ? (
            <>
              <Link
                href="/wallet"
                className="w-full sm:flex-1 py-4.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-zinc-950 font-black text-base shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Vào Xem Số Dư Ví Tiền</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
              <Link
                href="/services"
                className="w-full sm:w-auto py-4.5 px-8 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Tiếp tục Mua Dịch Vụ</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                href={serviceInfo.href}
                className="w-full sm:flex-1 py-4.5 px-8 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-zinc-950 font-black text-base shadow-xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>{serviceInfo.label}</span>
                <ArrowRight className="w-5 h-5 stroke-[2.5]" />
              </Link>
              <Link
                href="/dashboard/orders"
                className="w-full sm:w-auto py-4.5 px-8 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/80 hover:bg-zinc-900 text-zinc-300 hover:text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Xem Danh Sách Đơn Hàng</span>
              </Link>
            </>
          )}
        </div>

      </div>
    </div>
  );
};
