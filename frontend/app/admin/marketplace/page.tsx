'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Toast, useToast } from '@/components/Toast';
import { ShoppingBag, ArrowLeft, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function AdminMarketplacePage() {
  const { toast, showToast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/marketplace');
      setListings(response.data || []);
    } catch (err) {
      showToast('Lỗi khi tải danh sách Marketplace Listings', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await api.put(`/admin/marketplace/${id}/approve`);
      showToast('Đã duyệt thành công', 'success');
      fetchListings();
    } catch (err) {
      showToast('Lỗi khi duyệt', 'error');
    }
  };

  const handleSuspend = async (id: string) => {
    try {
      await api.put(`/admin/marketplace/${id}/suspend`, { reason: 'Vi phạm chính sách Admin' });
      showToast('Đã đình chỉ thành công', 'success');
      fetchListings();
    } catch (err) {
      showToast('Lỗi khi đình chỉ', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Pending Review</span>;
      case 2: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3"/> Active</span>;
      case 3: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700"><XCircle className="w-3 h-3"/> Suspended</span>;
      default: return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-200">Unknown</span>;
    }
  };

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', 'info')} />}
      <div className="min-h-screen bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/admin" className="text-sm text-slate-500 hover:text-[#1F1F1F] flex items-center gap-1 mb-2">
                <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
              </Link>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-fuchsia-600" />
                Quản Lý Marketplace Listings
              </h1>
              <p className="text-slate-500 mt-1">Duyệt và kiểm soát các sản phẩm trên chợ ứng dụng</p>
            </div>
            <button
              onClick={fetchListings}
              className="p-2 rounded bg-[#1E293B] bg-opacity-70 backdrop-blur-md border border-white/10 hover:text-fuchsia-600 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-lg border border-white/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="bg-[#0F172A]/80 border-b border-white/10 text-slate-500">
                  <tr>
                    <th className="p-4 font-semibold">Listing ID</th>
                    <th className="p-4 font-semibold">Tiêu Đề</th>
                    <th className="p-4 font-semibold">Seller ID</th>
                    <th className="p-4 font-semibold">Giá</th>
                    <th className="p-4 font-semibold">Trạng Thái</th>
                    <th className="p-4 font-semibold">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {listings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-500">Chưa có sản phẩm nào</td>
                    </tr>
                  ) : (
                    listings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-[#0F172A]/50">
                        <td className="p-4 text-xs font-mono font-bold text-white">{listing.id.substring(0, 8)}...</td>
                        <td className="p-4 font-bold">{listing.title}</td>
                        <td className="p-4 text-xs font-mono">{listing.sellerId}</td>
                        <td className="p-4 font-bold text-white flex items-center gap-1">
                          {listing.price.toLocaleString('vi-VN')}đ
                        </td>
                        <td className="p-4">{getStatusBadge(listing.status)}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {listing.status === 1 || listing.status === 3 ? (
                              <button onClick={() => handleApprove(listing.id)} className="text-emerald-600 hover:text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">Approve</button>
                            ) : null}
                            {listing.status === 2 || listing.status === 1 ? (
                              <button onClick={() => handleSuspend(listing.id)} className="text-rose-600 hover:text-rose-700 font-semibold bg-rose-50 px-2 py-1 rounded">Suspend</button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
