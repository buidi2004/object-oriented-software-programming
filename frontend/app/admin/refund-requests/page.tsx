'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, FileText, Clock, User, DollarSign, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RefundRequest {
  id: string;
  orderId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  reviewedAt?: string;
  reviewer?: string;
}

export default function AdminRefundRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        fetchRefunds(token);
      } else { router.push('/login'); }
    } catch (error) { router.push('/login'); }
  };

  const fetchRefunds = async (token: string) => {
    try {
      const response = await fetch('/api/refund-requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRequests(data.map((r: any) => ({
          id: r.id,
          orderId: r.orderId,
          customerName: r.customerName || 'Khách hàng',
          customerEmail: r.customerEmail || '',
          amount: r.amount,
          reason: r.reason,
          status: r.status?.toLowerCase() || 'pending',
          createdAt: r.createdAt,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch refunds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/refund-requests/${id}/${action}`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRefunds(token!);
    } catch (error) {
      console.error('Failed to update refund:', error);
    }
    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter(r => filterStatus === 'all' || r.status === filterStatus);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Yêu cầu hoàn tiền</h1>
              <p className="text-sm text-slate-500">{requests.length} yêu cầu</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-semibold">
              {requests.filter(r => r.status === 'pending').length} Chờ xử lý
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex gap-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-xl p-6 border border-slate-200 hover:border-blue-200 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">Yêu cầu #{request.id.slice(0, 8)}</h3>
                    <p className="text-sm text-slate-500 mt-1">Đơn hàng: <span className="font-mono font-semibold">{request.orderId}</span></p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-600">
                      <span className="flex items-center gap-1"><User className="w-4 h-4" />{request.customerName}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(request.createdAt).toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1.5 rounded-full text-sm font-bold shrink-0 ${
                  request.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  request.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {request.status === 'pending' ? 'Chờ xử lý' :
                   request.status === 'approved' ? 'Đã duyệt' : 'Đã từ chối'}
                </span>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-4">
                <p className="text-sm text-slate-600"><span className="font-semibold">Lý do:</span> {request.reason}</p>
                <p className="text-sm text-slate-600 mt-2"><span className="font-semibold">Số tiền hoàn:</span> <span className="text-rose-600 font-bold text-lg">{request.amount.toLocaleString('vi-VN')} đ</span></p>
              </div>

              {request.status === 'pending' && (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleAction(request.id, 'approve')}
                    className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Duyệt hoàn tiền
                  </button>
                  <button
                    onClick={() => handleAction(request.id, 'reject')}
                    className="px-4 py-2.5 rounded-lg bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    Từ chối
                  </button>
                  <Link
                    href={`/admin/refund-requests/${request.id}`}
                    className="px-4 py-2.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition-colors ml-auto"
                  >
                    Chi tiết
                  </Link>
                </div>
              )}

              {request.status !== 'pending' && request.reviewer && (
                <p className="text-xs text-slate-500 mt-2">
                  Đã xử lý bởi <span className="font-semibold">{request.reviewer}</span> vào {new Date(request.reviewedAt!).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          ))}
        </div>

        {filteredRequests.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Không có yêu cầu hoàn tiền nào</p>
          </div>
        )}
      </main>
    </div>
  );
}
