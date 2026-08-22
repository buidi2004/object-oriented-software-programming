'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, User, Clock, CheckCircle2, AlertCircle, Loader } from 'lucide-react';

interface RefundDetail {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  status: string;
  amount: number;
  createdAt: string;
  processedAt?: string;
}

export default function AdminRefundDetailPage() {
  const params = useParams();
  const router = useRouter();
  const refundId = params.id as string;
  const [refund, setRefund] = useState<RefundDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRefund();
  }, [refundId]);

  const fetchRefund = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }

    try {
      const res = await fetch(`/api/refund-requests/${refundId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRefund(await res.json());
      } else {
        setError('Không tìm thấy yêu cầu hoàn tiền.');
      }
    } catch {
      setError('Không thể tải chi tiết.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (action: 'approve' | 'reject') => {
    const token = localStorage.getItem('accessToken');
    await fetch(`/api/refund-requests/${refundId}/${action}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchRefund();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader className="w-8 h-8 text-[#1F1F1F] animate-spin" />
      </div>
    );
  }

  if (error || !refund) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
        <AlertCircle className="w-12 h-12 text-red-400 mb-3" />
        <p className="text-slate-600">{error}</p>
        <Link href="/admin/refund-requests" className="mt-4 text-[#1F1F1F] font-semibold">Quay lại</Link>
      </div>
    );
  }

  const status = refund.status.toLowerCase();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/admin/refund-requests" className="p-2 rounded-lg hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Chi tiết hoàn tiền</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-rose-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">#{refund.id.slice(0, 8).toUpperCase()}</h2>
              <p className="text-sm text-slate-500">Đơn hàng: {refund.orderId}</p>
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <p><span className="font-semibold">Khách hàng:</span> {refund.customerName} ({refund.customerEmail})</p>
            <p><span className="font-semibold">Số tiền:</span> <span className="text-rose-600 font-bold">{refund.amount.toLocaleString('vi-VN')}₫</span></p>
            <p><span className="font-semibold">Lý do:</span> {refund.reason}</p>
            <p><span className="font-semibold">Trạng thái:</span> {status}</p>
            <p className="flex items-center gap-1 text-slate-500"><Clock className="w-4 h-4" /> {new Date(refund.createdAt).toLocaleString('vi-VN')}</p>
          </div>

          {status === 'pending' && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
              <button onClick={() => handleAction('approve')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm">
                <CheckCircle2 className="w-4 h-4" /> Duyệt
              </button>
              <button onClick={() => handleAction('reject')} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm">
                Từ chối
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
