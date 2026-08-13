'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, MessageSquare, Edit2, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/src/lib/api';

interface Review {
  id: string;
  servicePlanId: string;
  servicePlanName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
}

export default function ReviewsDashboard() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/me')
      .then(res => setReviews(res.data))
      .catch(err => console.error("Error fetching reviews:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      setReviews(reviews.filter(r => r.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    alert(`Chức năng sửa đánh giá ${id} (Mock)`);
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header */}
      <div>
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 mb-2 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          Đánh giá của tôi
        </h1>
        <p className="text-slate-500 mt-2">Quản lý các đánh giá bạn đã viết cho các dịch vụ tại CloudHost VN.</p>
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-sm">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="font-medium">Bạn chưa viết đánh giá nào.</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
              {!review.isApproved && (
                <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  Chờ duyệt
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1 pr-12">{review.servicePlanName}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Backend currently doesn't support edit/delete for customers, so buttons are disabled */}
                  <button disabled title="Chức năng sửa tạm thời chưa khả dụng" className="p-2 text-slate-300 rounded-lg cursor-not-allowed">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button disabled title="Chức năng xóa tạm thời chưa khả dụng" className="p-2 text-slate-300 rounded-lg cursor-not-allowed">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-slate-600 text-sm flex-1">{review.comment}</p>
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium">
                Đã viết vào: {new Date(review.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          ))
        )}
      </div>
      )}

    </div>
  );
}
