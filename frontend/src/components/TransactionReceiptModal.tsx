'use client';

import React from 'react';
import { 
  X, Printer, Download, CheckCircle2, Building2, ShieldCheck, 
  ArrowLeft, FileText, ArrowDownLeft, ArrowUpRight 
} from 'lucide-react';

export interface ReceiptData {
  id: string;
  type: 'credit' | 'debit';
  rawType: string;
  amount: number;
  description: string;
  date: string;
  userFullName?: string;
  userEmail?: string;
  userAddress?: string;
}

interface TransactionReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: ReceiptData | null;
}

export const TransactionReceiptModal: React.FC<TransactionReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!isOpen || !transaction) return null;

  const isCredit = transaction.type === 'credit';
  const cleanId = transaction.id.replace(/-/g, '').slice(0, 10).toUpperCase();
  const invoiceNumber = `INV-${new Date(transaction.date).getFullYear()}${String(new Date(transaction.date).getMonth() + 1).padStart(2, '0')}-${cleanId}`;
  
  const txDate = new Date(transaction.date);
  const formattedDate = txDate.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const formattedDateTime = txDate.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const subTotal = transaction.amount;
  const vat = 0;
  const total = transaction.amount;

  const paymentMethodName = isCredit 
    ? 'Chuyển khoản VietQR (MB Bank 24/7 - Napas 247)' 
    : 'Số dư ví CloudHost VN';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[96vh] print:m-0 print:max-w-full print:shadow-none print:border-none print:max-h-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Controls Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-200 bg-[#f8fafc] print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-700" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Hóa Đơn Điện Tử #{invoiceNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-bold shadow-2xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>In hóa đơn</span>
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1F1F] hover:bg-black text-white rounded text-xs font-bold shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Tải về PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-full transition-colors ml-2"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official A4 Invoice Canvas */}
        <div className="p-6 sm:p-10 lg:p-12 overflow-y-auto space-y-6 text-slate-800 bg-white">
          
          {/* 1. Header: Logo & Status Badge */}
          <div className="flex items-start justify-between border-b border-transparent pb-4">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/logo.png" 
                alt="CloudHost Logo" 
                className="h-14 sm:h-16 w-auto object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  if (target.src.indexOf('azvps-invoice-logo.png') === -1) {
                    target.src = '/images/azvps-invoice-logo.png';
                  }
                }}
              />
            </div>
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-black tracking-wider text-[#65a30d]">
                ĐÃ THANH TOÁN
              </span>
            </div>
          </div>

          {/* 2. Invoice Title */}
          <div className="mt-2 mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Mã hóa đơn #{invoiceNumber}
            </h1>
          </div>

          {/* 3. Two-Column Metadata Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-slate-700 leading-relaxed border-t border-slate-100 pt-6">
            {/* Left Column: Xuất hóa đơn cho */}
            <div className="space-y-4">
              <div>
                <p className="font-bold text-slate-900 text-sm">Xuất hóa đơn cho</p>
                <p className="mt-1 font-bold text-slate-900 text-xs">{transaction.userFullName || 'Khách hàng CloudHost'}</p>
                <p className="text-slate-600 mt-0.5">Email: {transaction.userEmail || 'Chưa cập nhật'}</p>
                <p className="text-slate-600 whitespace-pre-line">
                  {transaction.userAddress || 'Việt Nam'}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-900">Ngày tạo hóa đơn</p>
                <p className="text-slate-600 mt-0.5 font-medium">{formattedDate}</p>
              </div>

              <div>
                <p className="font-bold text-slate-900">Ngày đến hạn</p>
                <p className="text-slate-600 mt-0.5 font-medium">{formattedDate}</p>
              </div>
            </div>

            {/* Right Column: Thanh toán cho */}
            <div className="space-y-4 sm:text-right">
              <div>
                <p className="font-bold text-slate-900 text-sm">Thanh toán cho</p>
                <p className="mt-1 font-bold text-slate-900">CÔNG TY TNHH CLOUDHOST VN</p>
                <p className="text-slate-600">Hotline: 0329478786</p>
                <p className="text-slate-600">Email: contact@cloudhost.vn</p>
                <p className="text-slate-600">Mã số thuế: 0318291024</p>
              </div>

              <div>
                <p className="font-bold text-slate-900">Phương thức thanh toán</p>
                <p className="text-slate-600 mt-0.5">
                  {paymentMethodName}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Invoice Line Items Table */}
          <div className="mt-8 rounded-sm border border-slate-200 overflow-hidden">
            {/* Table Header Bar */}
            <div className="bg-[#f8fafc] px-4 py-2.5 border-b border-slate-200">
              <h2 className="font-bold text-slate-900 text-xs sm:text-sm">Chi tiết hóa đơn</h2>
            </div>

            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 font-bold text-slate-900 bg-white">
                  <th className="py-2.5 px-4">Mô tả</th>
                  <th className="py-2.5 px-4 text-right">Số tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-900">
                      {transaction.description}
                    </p>
                    <ul className="text-slate-600 space-y-0.5 mt-1 text-[11px]">
                      <li>• Mã giao dịch tham chiếu: <span className="font-mono text-slate-800 font-bold">{transaction.id}</span></li>
                      <li>• Thời gian giao dịch: {formattedDateTime}</li>
                      <li>• Kênh xử lý: Cổng thanh toán trực tuyến tự động 24/7</li>
                      <li>• Trạng thái: Giao dịch hoàn tất thành công (Completed)</li>
                    </ul>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 align-top">
                    {subTotal.toLocaleString('vi-VN')} đ
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Subtotals & Totals Box */}
            <div className="border-t border-slate-200 bg-white text-xs divide-y divide-slate-100 font-medium">
              <div className="flex justify-between py-2 px-4">
                <span className="font-bold text-slate-700 ml-auto mr-12">Tạm tính</span>
                <span className="font-mono text-slate-900">{subTotal.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between py-2 px-4">
                <span className="font-bold text-slate-700 ml-auto mr-12">0.00% VAT (Nạp tiền ví)</span>
                <span className="font-mono text-slate-900">{vat.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between py-2 px-4">
                <span className="font-bold text-slate-700 ml-auto mr-12">Số dư tín dụng</span>
                <span className="font-mono text-slate-900">0 đ</span>
              </div>
              <div className="flex justify-between py-2.5 px-4 bg-slate-50">
                <span className="font-bold text-slate-900 text-sm ml-auto mr-12">Tổng cộng</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{total.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
          </div>

          {/* Tax Note */}
          <p className="text-[11px] text-slate-500 italic">
            * Hóa đơn điện tử được khởi tạo và xác thực tự động trên hệ thống CloudHost VN.
          </p>

          {/* 5. Transaction History Table */}
          <div className="mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 border-t border-slate-200">
                <thead>
                  <tr className="border-b border-slate-200 font-bold text-slate-900">
                    <th className="py-2.5 px-2">Ngày giao dịch</th>
                    <th className="py-2.5 px-2 text-center">Cổng thanh toán</th>
                    <th className="py-2.5 px-2 text-center">Mã giao dịch</th>
                    <th className="py-2.5 px-2 text-right">Số tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-2 text-slate-600 font-mono">{formattedDate}</td>
                    <td className="py-2.5 px-2 text-center text-slate-600">
                      {paymentMethodName}
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-600 font-mono">
                      {cleanId}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900">
                      {total.toLocaleString('vi-VN')} đ
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-3 text-xs font-bold text-slate-900 gap-4">
              <span>Số dư</span>
              <span className="font-mono">0 đ</span>
            </div>
          </div>

          {/* 6. Print & Download Buttons at bottom right (Matches standard invoices) */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between print:hidden">
            <span className="text-xs text-slate-400">
              Lưu giữ hóa đơn điện tử để đối soát và hưởng các quyền lợi bảo hành dịch vụ
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-bold transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-600" /> In
              </button>
              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-300 text-xs font-bold transition-colors"
              >
                <Download className="w-4 h-4 text-slate-600" /> Tải về
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#1F1F1F] hover:bg-black text-white rounded text-xs font-bold transition-colors ml-2"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
