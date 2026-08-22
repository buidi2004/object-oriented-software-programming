'use client';

import { useState, useEffect } from 'react';
import { api } from '@/src/lib/api';
import Link from 'next/link';
import { Star, CheckCircle2, MessageSquare, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';

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
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.get<ReviewDto[]>('/reviews');
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách đánh giá:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await api.patch(`/reviews/${id}/approve`, {});
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isApproved: true } : r));
    } catch (err: any) {
      alert(`Lỗi: ${err.response?.data?.message || 'Không thể duyệt đánh giá.'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleFeature = async (id: string, isFeatured: boolean) => {
    setProcessingId(id);
    try {
      await api.patch(`/reviews/${id}/feature`, { isFeatured });
      setReviews(prev => prev.map(r => r.id === id ? { ...r, isFeatured } : r));
    } catch (err: any) {
      alert(`Lỗi: ${err.response?.data?.message || 'Không thể thay đổi trạng thái Featured.'}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) return;
    try {
      await api.delete(`/reviews/${id}`);
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert('Không thể xóa đánh giá.');
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 rounded-sm hover:bg-slate-100 transition-colors border border-slate-200">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-[#1F1F1F]" />
              Đánh Giá Khách Hàng (Reviews)
            </h1>
            <p className="text-gray-500 mt-2">Duyệt và chọn các đánh giá nổi bật để đưa lên trang chủ.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-sm">
            <tr>
              <th className="px-6 py-4">Khách hàng</th>
              <th className="px-6 py-4">Gói dịch vụ / Rating</th>
              <th className="px-6 py-4 w-2/5">Nội dung</th>
              <th className="px-6 py-4">Trạng thái</th>
              <th className="px-6 py-4">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Chưa có đánh giá nào.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{review.userEmail}</div>
                    <div className="text-xs text-gray-600 mt-1">{new Date(review.createdAt).toLocaleString('vi-VN')}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#1F1F1F]">{review.servicePlanName}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {review.isApproved ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                      {review.isFeatured && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium bg-blue-50 text-[#1F1F1F] border border-blue-200">
                          <Star className="w-3.5 h-3.5 fill-blue-700" /> Featured
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      {!review.isApproved && (
                        <button
                          disabled={processingId === review.id}
                          onClick={() => handleApprove(review.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-sm transition-colors disabled:opacity-50"
                        >
                          Duyệt Review
                        </button>
                      )}
                      
                      {review.isApproved && (
                        <button
                          disabled={processingId === review.id}
                          onClick={() => handleFeature(review.id, !review.isFeatured)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-sm transition-colors disabled:opacity-50 border ${
                            review.isFeatured 
                              ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200' 
                              : 'bg-indigo-50 hover:bg-indigo-100 text-[#1F1F1F] border-indigo-200'
                          }`}
                        >
                          {review.isFeatured ? 'Gỡ khỏi Trang chủ' : 'Đưa lên Trang chủ'}
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(review.id)}
                        className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors flex items-center justify-center"
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
  );
}
