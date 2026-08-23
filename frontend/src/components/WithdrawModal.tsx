'use client';

import React from 'react';
import Link from 'next/link';
import { 
  X, Banknote, ShieldCheck, Headphones, MessageSquare, 
  FileText, CheckCircle2, AlertTriangle, ArrowRight 
} from 'lucide-react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  currentBalance,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-lg shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Yêu Cầu Rút Tiền / Hoàn Tiền</h3>
              <p className="text-xs text-slate-500">
                Số dư khả dụng: <span className="font-bold text-emerald-600">{currentBalance.toLocaleString('vi-VN')} đ</span>
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Policy Note */}
          <div className="p-4 rounded-md bg-blue-50/60 border border-blue-100 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-900 mb-1">Chính sách rút tiền từ ví CloudHost VN:</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600">
                <li>Khách hàng có thể rút 100% số dư chưa sử dụng về tài khoản ngân hàng chính chủ.</li>
                <li>Thời gian xử lý & đối soát chuyển khoản từ <strong className="text-slate-800">15 – 30 phút</strong> trong giờ làm việc.</li>
                <li>Không thu bất kỳ khoản phí rút tiền nào.</li>
              </ul>
            </div>
          </div>

          {/* Contact Methods */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
              Cách thức gửi yêu cầu rút tiền
            </label>
            <div className="space-y-3">
              {/* Ticket Support */}
              <Link
                href="/dashboard/tickets"
                onClick={onClose}
                className="flex items-center justify-between p-4 rounded-md border border-slate-200 hover:border-[#1F1F1F] bg-white hover:bg-slate-50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-[#1F1F1F] group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Gửi Ticket Yêu Cầu Rút Tiền (Khuyên dùng)</span>
                    <span className="text-xs text-slate-500">Điền số tài khoản ngân hàng & số tiền muốn rút để Admin xử lý</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </Link>

              {/* Live Chat */}
              <div 
                onClick={onClose}
                className="flex items-center justify-between p-4 rounded-md border border-slate-200 hover:border-[#1F1F1F] bg-white hover:bg-slate-50 transition-all group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-[#1F1F1F] group-hover:text-white transition-colors">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">Chat Trực Tiếp Với Admin / CSKH</span>
                    <span className="text-xs text-slate-500">Nhắn tin qua LiveChat góc phải màn hình để được hỗ trợ tức thì</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
