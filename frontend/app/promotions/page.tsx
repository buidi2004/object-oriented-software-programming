'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Tag, Calendar, ChevronRight, Zap, Loader2 } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Promotion {
  id: string;
  servicePlanId: string;
  discountPercent: number;
  startDate: string;
  endDate: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/promotions/active')
      .then(res => setPromotions(res.data))
      .catch(err => console.error("Error fetching promotions:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-[#1F1F1F] font-semibold text-sm mb-6">
            <Tag className="w-4 h-4" />
            Chương Trình Khuyến Mãi
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Ưu Đãi Đặc Biệt Từ <span className="text-[#1F1F1F]">CloudHost VN</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tổng hợp các chương trình giảm giá và ưu đãi mới nhất dành cho khách hàng đăng ký dịch vụ Cloud VPS, Hosting và Tên miền.
          </p>
        </div>

        {/* Promotions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {promotions.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500">
              Hiện chưa có chương trình khuyến mãi nào đang diễn ra.
            </div>
          ) : promotions.map((promo) => (
            <div key={promo.id} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="relative h-48 overflow-hidden bg-slate-100 flex items-center justify-center text-slate-600">
                <Zap className="w-12 h-12" />
                <div className="absolute top-4 right-4 bg-rose-500 text-slate-900 font-black px-4 py-2 rounded-xl shadow-lg transform rotate-3">
                  GIẢM {promo.discountPercent}%
                </div>
              </div>

              <div className="p-6 md:p-8">
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600 mb-4 bg-emerald-50 w-fit px-3 py-1 rounded-full">
                  <Calendar className="w-4 h-4" />
                  {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#1F1F1F] transition-colors line-clamp-2">
                  Ưu đãi gói dịch vụ
                </h3>
                
                <p className="text-slate-600 text-sm mb-8 line-clamp-3 leading-relaxed">
                  Đăng ký ngay để nhận ưu đãi giảm {promo.discountPercent}% cho gói dịch vụ này.
                </p>

                <Link 
                  href="/services" 
                  className="inline-flex items-center gap-2 font-bold text-[#1F1F1F] hover:text-[#1F1F1F] transition-colors"
                >
                  Đăng ký ngay <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
