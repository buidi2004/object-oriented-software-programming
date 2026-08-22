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

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center text-sm text-slate-600 gap-2 pb-4 border-b border-slate-100">
          <Link href="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-slate-900">Tin khuyến mại</span>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
          </div>
        )}

        {!loading && (
          <div className="space-y-12">
            {promotions.length === 0 ? (
              <p className="text-center text-slate-600 py-12">Chưa có bài viết khuyến mại nào.</p>
            ) : (
              <>
                {/* Featured Promotion (First item) */}
                {promotions.length > 0 && (
                  <div className="group flex flex-col md:flex-row items-stretch bg-white border border-transparent hover:border-slate-100 hover:shadow-lg transition-all duration-300">
                    {/* Image Left */}
                    <div className="md:w-[55%] relative overflow-hidden bg-slate-100 block min-h-[300px]">
                      <div className="w-full h-full flex flex-col items-center justify-center text-red-600 bg-red-50 p-8 text-center group-hover:scale-105 transition-transform duration-700">
                        <Zap className="w-20 h-20 mb-4 opacity-80" />
                        <h2 className="text-4xl font-black uppercase tracking-widest">
                          GIẢM {promotions[0].discountPercent}%
                        </h2>
                      </div>
                    </div>
                    {/* Content Right */}
                    <div className="md:w-[45%] p-6 md:p-10 flex flex-col justify-center">
                      <span className="text-sm text-slate-600 mb-3 block">
                        {new Date(promotions[0].startDate).toLocaleDateString('vi-VN')} - {new Date(promotions[0].endDate).toLocaleDateString('vi-VN')}
                      </span>
                      <h2 className="text-2xl md:text-3xl lg:text-[28px] font-bold text-slate-800 uppercase leading-tight mb-4">
                        ƯU ĐÃI ĐẶC BIỆT: GIẢM {promotions[0].discountPercent}% CÁC GÓI DỊCH VỤ
                      </h2>
                      <p className="text-base text-slate-600 line-clamp-3 md:line-clamp-4 leading-relaxed mb-8">
                        Đăng ký ngay để nhận ưu đãi giảm {promotions[0].discountPercent}% cho tất cả các gói dịch vụ Cloud VPS, Hosting và Tên miền trong thời gian diễn ra chương trình. Đừng bỏ lỡ cơ hội nâng cấp hạ tầng với chi phí tối ưu nhất.
                      </p>
                      <Link 
                        href="/services"
                        className="mt-auto inline-flex items-center text-sm font-semibold text-red-600 uppercase tracking-wider hover:text-red-700"
                      >
                        ĐĂNG KÝ NGAY <ChevronRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                )}

                {/* Rest of the promotions Grid */}
                {promotions.length > 1 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {promotions.slice(1).map((promo) => (
                      <div key={promo.id} className="bg-white group flex flex-col">
                        {/* Thumbnail */}
                        <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden relative block mb-4">
                           <div className="w-full h-full flex flex-col items-center justify-center text-red-600 bg-red-50 p-4 text-center group-hover:scale-105 transition-transform duration-500">
                             <Zap className="w-10 h-10 mb-2 opacity-80" />
                             <h3 className="text-2xl font-black uppercase tracking-wider">
                               GIẢM {promo.discountPercent}%
                             </h3>
                           </div>
                        </div>

                        {/* Content */}
                        <div className="flex flex-col flex-1">
                          <span className="text-xs text-slate-600 mb-2 block">
                             {new Date(promo.startDate).toLocaleDateString('vi-VN')} - {new Date(promo.endDate).toLocaleDateString('vi-VN')}
                          </span>
                          <h2 className="text-lg font-bold text-slate-800 uppercase leading-snug line-clamp-3">
                            KHUYẾN MÃI LỚN: ƯU ĐÃI GIẢM {promo.discountPercent}%
                          </h2>
                          <Link 
                            href="/services"
                            className="mt-3 inline-flex items-center text-xs font-semibold text-red-600 uppercase tracking-wider hover:text-red-700"
                          >
                            ĐĂNG KÝ NGAY <ChevronRight className="w-4 h-4 ml-1" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
