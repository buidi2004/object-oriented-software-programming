'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Receipt, CheckCircle2, Clock, XCircle, FileText, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/src/lib/api';

interface RefundRequest {
  id: string;
  orderId: string;
  refundAmount: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export default function RefundRequestsDashboard() {
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newRequest, setNewRequest] = useState({ orderId: '', amount: '', reason: '' });
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchRequests = () => {
    setLoading(true);
    api.get('/refund-requests/me')
      .then(res => setRequests(res.data))
      .catch(err => console.error("Error fetching refund requests:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!newRequest.orderId || !newRequest.amount || !newRequest.reason) return;

    try {
      await api.post(`/orders/${newRequest.orderId}/refund-requests`, {
        reason: newRequest.reason,
        refundAmount: parseFloat(newRequest.amount)
      });
      setShowModal(false);
      setNewRequest({ orderId: '', amount: '', reason: '' });
      fetchRequests();
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Lỗi khi gửi yêu cầu. Vui lòng kiểm tra lại Mã Đơn Hàng.');
    }
  };

  const getStatusBadge = (status: RefundRequest['status']) => {
    switch (status) {
      case 'Approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold"><CheckCircle2 className="w-3.5 h-3.5" /> Đã hoàn tiền</span>;
      case 'Rejected':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold"><XCircle className="w-3.5 h-3.5" /> Từ chối</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold"><Clock className="w-3.5 h-3.5" /> Chờ xử lý</span>;
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#1F1F1F] mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-[#1F1F1F]" />
            Yêu cầu hoàn tiền
          </h1>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tạo yêu cầu mới
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Mã YC</th>
                  <th className="px-6 py-4 font-semibold">Mã Đơn hàng</th>
                  <th className="px-6 py-4 font-semibold">Số tiền</th>
                  <th className="px-6 py-4 font-semibold">Lý do</th>
                  <th className="px-6 py-4 font-semibold">Ngày tạo</th>
                  <th className="px-6 py-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                      Bạn chưa có yêu cầu hoàn tiền nào.
                    </td>
                  </tr>
                ) : (
                  requests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 line-clamp-1 w-32" title={req.id}>{req.id}</td>
                      <td className="px-6 py-4 font-mono text-slate-600">{req.orderId}</td>
                      <td className="px-6 py-4 font-bold text-rose-600">{(req.refundAmount || 0).toLocaleString('vi-VN')} ₫</td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                      <td className="px-6 py-4 text-slate-500">{new Date(req.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td className="px-6 py-4">{getStatusBadge(req.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Tạo yêu cầu hoàn tiền</h2>
            </div>
            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Mã đơn hàng</label>
                <input 
                  type="text" 
                  required
                  value={newRequest.orderId}
                  onChange={e => setNewRequest({...newRequest, orderId: e.target.value})}
                  placeholder="VD: ORD-1234"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Số tiền yêu cầu hoàn (VNĐ)</label>
                <input 
                  type="number" 
                  required
                  min={1000}
                  value={newRequest.amount}
                  onChange={e => setNewRequest({...newRequest, amount: e.target.value})}
                  placeholder="VD: 500000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Lý do hoàn tiền</label>
                <textarea 
                  required
                  rows={3}
                  value={newRequest.reason}
                  onChange={e => setNewRequest({...newRequest, reason: e.target.value})}
                  placeholder="Vui lòng cung cấp lý do chi tiết..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
              
              {submitError && (
                <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                  {submitError}
                </div>
              )}

              <div className="pt-4 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  Gửi yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
