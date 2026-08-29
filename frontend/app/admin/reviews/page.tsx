'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/src/lib/api';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Star, CheckCircle2, MessageSquare, AlertCircle, ArrowLeft, 
  Trash2, ShieldCheck, Filter, Sparkles, RefreshCw, Check, Clock, User
} from 'lucide-react';
import { isStaffRole } from '@/lib/admin-roles';

interface ReviewDto {
  id: string;
  servicePlanId: string;
  servicePlanName: string;
  userId: string;
  userEmail: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'approved' | 'featured'>('all');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const res = await api.get('/users/me');
      const role = res.data?.role?.name || res.data?.role || '';
      if (!isStaffRole(role)) {
        router.push('/dashboard');
        return;
      }
      fetchReviews();
    } catch {
      router.push('/login');
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get<ReviewDto[]>('/reviews');
      setReviews(res.data || []);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đánh giá:", err);
      showToast('Lỗi khi tải danh sách đánh giá', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await api.patch(`/reviews/${id}/approve`, {});
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved: true } : r));
      showToast('Đã phê duyệt đánh giá thành công! Đánh giá đã hiển thị trên trang sản phẩm.', 'success');
    } catch (err: any) {
      showToast(`Lỗi: ${err.response?.data?.message || 'Không thể duyệt đánh giá.'}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    setProcessingId(id);
    try {
      await api.patch(`/reviews/${id}/feature`, { isFeatured });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isFeatured } : r));
      showToast(isFeatured ? 'Đã ghim đánh giá nổi bật lên Trang Chủ!' : 'Đã bỏ ghim nổi bật.', 'success');
    } catch (err: any) {
      showToast(`Lỗi: ${err.response?.data?.message || 'Không thể thay đổi trạng thái Featured.'}`, 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vĩnh viễn đánh giá này?')) return;
    setProcessingId(id);
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
      showToast('Đã xóa đánh giá thành công!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Không thể xóa đánh giá.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  // Stats
  const totalCount = reviews.length;
  const pendingCount = reviews.filter(r => !r.isApproved).length;
  const approvedCount = reviews.filter(r => r.isApproved).length;
  const featuredCount = reviews.filter(r => r.isFeatured).length;

  const filteredReviews = reviews.filter(r => {
    if (selectedFilter === 'pending') return !r.isApproved;
    if (selectedFilter === 'approved') return r.isApproved;
    if (selectedFilter === 'featured') return r.isFeatured;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-xl text-white font-bold text-xs flex items-center gap-2.5 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md p-6 rounded-2xl border border-white/10/90 shadow-2xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link href="/admin" className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-1 mb-2">
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại Admin Panel
              </Link>
              <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2.5">
                <MessageSquare className="w-6 h-6 text-blue-400" />
                <span>Kiểm Duyệt Bình Luận &amp; Đánh Giá Khách Hàng</span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Phê duyệt đánh giá sao, bình luận dịch vụ và bài viết từ người dùng để hiển thị trên website.
              </p>
            </div>

            <button
              onClick={fetchReviews}
              disabled={loading}
              className="self-start md:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-white/10 shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Làm mới danh sách</span>
            </button>
          </div>

          {/* Module Switcher Tabs */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <Link
              href="/admin/reviews"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center gap-2 shadow-2xs"
            >
              <Star className="w-3.5 h-3.5 fill-white text-white" />
              <span>1. Đánh Giá Sản Phẩm &amp; Dịch Vụ ({totalCount})</span>
            </Link>
            <Link
              href="/admin/blog-comments"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors border border-white/10/80"
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>2. Bình Luận Bài Viết &amp; Tin Tức Blog</span>
            </Link>
          </div>
        </div>

        {/* 4 Summary Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-2xl p-5 border border-white/10/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-900/30 text-blue-400 flex items-center justify-center font-bold">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-white/10 px-2 py-0.5 rounded-full">Tổng Đánh Giá</span>
            </div>
            <p className="text-2xl font-black text-white">{totalCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Tất cả nhận xét của khách</p>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-2xl p-5 border border-white/10/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Cần Duyệt</span>
            </div>
            <p className="text-2xl font-black text-amber-600">{pendingCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Đang chờ ban quản trị duyệt</p>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-2xl p-5 border border-white/10/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">Đã Duyệt</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{approvedCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Đã hiển thị trên trang dịch vụ</p>
          </div>

          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-2xl p-5 border border-white/10/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Sparkles className="w-4.5 h-4.5" />
              </div>
              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">Trang Chủ</span>
            </div>
            <p className="text-2xl font-black text-purple-600">{featuredCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">Ghim nổi bật trên Homepage</p>
          </div>
        </div>

        {/* Reviews Table & Filters */}
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded-2xl border border-white/10/90 shadow-2xs overflow-hidden">
          
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0F172A]/50">
            <div className="flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedFilter === 'all' 
                    ? 'bg-slate-900 text-white' 
                    : 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-slate-500 hover:bg-white/10 border border-white/10'
                }`}
              >
                Tất Cả ({totalCount})
              </button>
              <button
                onClick={() => setSelectedFilter('pending')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedFilter === 'pending' 
                    ? 'bg-amber-500 text-white' 
                    : 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-slate-500 hover:bg-white/10 border border-white/10'
                }`}
              >
                ⏳ Chờ Duyệt ({pendingCount})
              </button>
              <button
                onClick={() => setSelectedFilter('approved')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedFilter === 'approved' 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-slate-500 hover:bg-white/10 border border-white/10'
                }`}
              >
                ✓ Đã Duyệt ({approvedCount})
              </button>
              <button
                onClick={() => setSelectedFilter('featured')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  selectedFilter === 'featured' 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-[#1E293B] bg-opacity-70 backdrop-blur-md text-slate-500 hover:bg-white/10 border border-white/10'
                }`}
              >
                ⭐ Nổi Bật ({featuredCount})
              </button>
            </div>

            <span className="text-xs text-slate-500 font-medium">
              Hiển thị {filteredReviews.length} / {totalCount} đánh giá
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#0F172A] text-slate-200 font-bold border-b border-white/10">
                <tr>
                  <th className="p-3.5 sm:p-4">Khách Hàng &amp; Ngày Gửi</th>
                  <th className="p-3.5 sm:p-4">Gói Dịch Vụ &amp; Số Sao</th>
                  <th className="p-3.5 sm:p-4 w-2/5">Nội Dung Nhận Xét</th>
                  <th className="p-3.5 sm:p-4">Trạng Thái</th>
                  <th className="p-3.5 sm:p-4 text-right">Thao Tác Duyệt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                      Đang tải danh sách đánh giá...
                    </td>
                  </tr>
                ) : filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                      Không có đánh giá nào phù hợp với bộ lọc đã chọn.
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((rev) => (
                    <tr key={rev.id} className="hover:bg-[#0F172A]/70 transition-colors">
                      
                      {/* Customer Info */}
                      <td className="p-3.5 sm:p-4">
                        <div className="font-bold text-white">{rev.userEmail || 'Khách hàng ẩn danh'}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {new Date(rev.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </td>

                      {/* Service Plan & Rating */}
                      <td className="p-3.5 sm:p-4">
                        <div className="font-bold text-blue-400">{rev.servicePlanName || 'Dịch Vụ Cloud'}</div>
                        <div className="flex items-center gap-0.5 mt-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80 w-fit">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} 
                            />
                          ))}
                          <span className="text-[10px] font-bold text-amber-800 ml-1">{rev.rating}/5</span>
                        </div>
                      </td>

                      {/* Comment Content */}
                      <td className="p-3.5 sm:p-4">
                        <p className="text-xs text-slate-100 italic leading-relaxed bg-[#0F172A] p-2.5 rounded-lg border border-white/10/60">
                          "{rev.comment}"
                        </p>
                      </td>

                      {/* Status Badges */}
                      <td className="p-3.5 sm:p-4">
                        <div className="flex flex-col gap-1.5">
                          {rev.isApproved ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                              <CheckCircle2 className="w-3 h-3" /> Đã Duyệt
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 w-fit">
                              <Clock className="w-3 h-3" /> Chờ Duyệt
                            </span>
                          )}

                          {rev.isFeatured && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 w-fit">
                              <Sparkles className="w-3 h-3" /> Nổi Bật Trang Chủ
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action Buttons */}
                      <td className="p-3.5 sm:p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!rev.isApproved && (
                            <button
                              disabled={processingId === rev.id}
                              onClick={() => handleApprove(rev.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 shadow-sm cursor-pointer"
                              title="Duyệt đánh giá này"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </button>
                          )}
                          
                          {rev.isApproved && (
                            <button
                              disabled={processingId === rev.id}
                              onClick={() => handleFeature(rev.id, !rev.isFeatured)}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-colors disabled:opacity-50 border flex items-center gap-1 cursor-pointer ${
                                rev.isFeatured 
                                  ? 'bg-white/10 hover:bg-white/20 text-slate-200 border-white/10' 
                                  : 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                              }`}
                              title={rev.isFeatured ? 'Bỏ ghim khỏi Trang Chủ' : 'Ghim nổi bật lên Trang Chủ'}
                            >
                              <Sparkles className="w-3 h-3" />
                              <span>{rev.isFeatured ? 'Gỡ' : 'Ghim'}</span>
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(rev.id)}
                            disabled={processingId === rev.id}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200 cursor-pointer"
                            title="Xóa đánh giá"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
  );
}
