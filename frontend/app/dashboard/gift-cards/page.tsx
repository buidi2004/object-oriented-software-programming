'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { Gift, CheckCircle, XCircle, Loader2, ArrowLeft, Wallet } from 'lucide-react';
import { api } from '@/src/lib/api';

interface GiftCardResult {
  code: string;
  balance: number;
  isRedeemed: boolean;
  message?: string;
}

export default function GiftCardsPage() {
  const { toast, showToast } = useToast();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GiftCardResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckBalance = async () => {
    if (!code.trim()) {
      showToast('Vui lòng nhập mã thẻ quà tặng', 'warning');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.get(`/gift-cards/${code.trim()}/balance`);
      setResult({
        code: code.trim(),
        balance: response.data.balance || 0,
        isRedeemed: response.data.isRedeemed || false
      });
    } catch (err: any) {
      console.error('Failed to check balance:', err);
      setError(err.response?.data?.message || 'Không tìm thấy thẻ quà tặng này');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedeem = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      showToast('Vui lòng đăng nhập để đổi thẻ', 'warning');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post('/gift-cards/redeem', {
        code: code.trim()
      });
      
      setResult({
        code: code.trim(),
        balance: 0,
        isRedeemed: true,
        message: 'Đã đổi thành công!'
      });
      showToast('Đổi thẻ quà tặng thành công!', 'success');
      setCode('');
    } catch (err: any) {
      console.error('Failed to redeem:', err);
      setError(err.response?.data?.message || 'Không thể đổi thẻ quà tặng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => showToast('', 'info')}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-[#1F1F1F] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại dashboard
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thẻ quà tặng</h1>
          <p className="text-slate-600 mt-1">Nhập mã thẻ quà tặng để kiểm tra số dư và đổi thưởng</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-700">Ví tiền điện tử</span>
        </div>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Mã thẻ quà tặng
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="NHAP-MATYPE-CUA-BAN"
              className="w-full px-4 py-3 rounded border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-mono text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleCheckBalance()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCheckBalance}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-100 text-slate-700 rounded font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              Kiểm tra
            </button>
            <button
              onClick={handleRedeem}
              disabled={isLoading || !code.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Gift className="w-4 h-4" />
              )}
              Đổi ngay
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded">
          <p className="text-sm text-[#1F1F1F]">
            💡 <strong>Mẹo:</strong> Mã thẻ quà tặng thường có dạng 12-16 ký tự, ví dụ: GIFT2024-VN-CLOU
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
          <span className="ml-3 text-slate-600">Đang xử lý...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <div>
            <p className="font-semibold text-red-900">Lỗi</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Success Result */}
      {result && !error && (
        <div className={`p-6 rounded-md border ${
          result.isRedeemed 
            ? 'bg-emerald-50 border-emerald-200' 
            : result.balance > 0
            ? 'bg-blue-50 border-blue-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded flex items-center justify-center ${
              result.isRedeemed 
                ? 'bg-emerald-100' 
                : result.balance > 0
                ? 'bg-blue-100'
                : 'bg-slate-100'
            }`}>
              {result.isRedeemed ? (
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              ) : result.balance > 0 ? (
                <Gift className="w-6 h-6 text-[#1F1F1F]" />
              ) : (
                <XCircle className="w-6 h-6 text-slate-600" />
              )}
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">
                {result.isRedeemed ? 'Đã đổi thành công!' : result.balance > 0 ? 'Thẻ có giá trị' : 'Thẻ không tồn tại'}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Mã thẻ: <span className="font-mono font-semibold">{result.code}</span>
              </p>
              
              {result.balance > 0 && (
                <p className="text-2xl font-black text-[#1F1F1F] mt-2">
                  {result.balance.toLocaleString('vi-VN')} đ
                </p>
              )}
              
              {result.message && (
                <p className="text-sm text-emerald-700 mt-2">{result.message}</p>
              )}
            </div>

            {!result.isRedeemed && result.balance > 0 && (
              <button
                onClick={handleRedeem}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-600 text-white rounded font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Đổi ngay
              </button>
            )}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-white rounded-md border border-slate-200 p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Câu hỏi thường gặp</h3>
        <div className="space-y-4">
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-700">
              Thẻ quà tặng là gì?
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600 pl-4">
              Thẻ quà tặng là mã kích hoạt có giá trị tiền mặt, được sử dụng để thanh toán các dịch vụ tại CloudServiceStore.
            </p>
          </details>
          
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-700">
              Làm thế nào để nhận thẻ quà tặng?
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600 pl-4">
              Bạn có thể nhận thẻ quà tặng từ các chương trình khuyến mãi, sự kiện, hoặc mua trực tiếp từ chúng tôi.
            </p>
          </details>
          
          <details className="group">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-slate-700">
              Thẻ có thời hạn sử dụng không?
              <span className="transform group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <p className="mt-2 text-sm text-slate-600 pl-4">
              Tùy thuộc vào chương trình khuyến mãi, thẻ quà tặng có thể có thời hạn từ 6-12 tháng. Vui lòng kiểm tra kỹ khi nhận thẻ.
            </p>
          </details>
        </div>
      </div>
    </div>
  );
}
