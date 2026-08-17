'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Quote, ShieldCheck, ArrowRight, Building2, UserCheck } from 'lucide-react';
import { api } from '../lib/api';

export interface TestimonialItem {
  id: string;
  customerName: string;
  companyName: string;
  content: string;
  rating?: number;
  featured?: boolean;
}

const FALLBACK_TESTIMONIALS: TestimonialItem[] = [
  {
    id: 't-1',
    customerName: 'Hoàng Minh Tuấn',
    companyName: 'CTO - EcoTech Solutions',
    content: 'Chúng tôi chuyển đổi toàn bộ hạ tầng 40+ microservices từ AWS sang CloudHost VN. Chi phí giảm hơn 45% trong khi độ trễ mạng trong nước giảm còn dưới 10ms.',
    rating: 5,
    featured: true,
  },
  {
    id: 't-2',
    customerName: 'Đặng Thùy Dung',
    companyName: 'Head of Infra - Sendo Logistics',
    content: 'Hệ thống Anti-DDoS 500Gbps bảo vệ website thương mại điện tử của chúng tôi an toàn tuyệt đối trong các đợt Mega Sale 11.11 và 12.12.',
    rating: 5,
    featured: true,
  },
  {
    id: 't-3',
    customerName: 'Vũ Đức Long',
    companyName: 'Founder - DevZone Media',
    content: 'Tính năng triển khai VPS tự động trong 30 giây cùng giao diện quản lý hiện đại, trực quan giúp đội ngũ DevOps tiết kiệm hàng chục giờ cấu hình mỗi tuần.',
    rating: 5,
    featured: true,
  },
];

export const HomeTestimonials: React.FC = () => {
  const [items, setItems] = useState<TestimonialItem[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get<TestimonialItem[]>('/testimonials');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        setItems(res.data.slice(0, 3));
      }
    } catch {
      // Keep fallbacks
    }
  };

  return (
    <section className="py-20 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-3.5 h-3.5" />
              Khách Hàng &amp; Đối Tác Tin Dùng
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Được Tin Chọn Bởi Hơn <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">10,000+ Doanh Nghiệp</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 mt-2 max-w-2xl">
              Lắng nghe cảm nhận thực tế từ các chuyên gia công nghệ và nhà phát triển đã đồng hành cùng hạ tầng Cloud của chúng tôi.
            </p>
          </div>

          <Link
            href="/testimonials"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 group shrink-0"
          >
            <span>Xem tất cả 500+ đánh giá</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(item.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-slate-700 text-sm leading-relaxed italic mb-6">
                  &ldquo;{item.content}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-md">
                  {item.customerName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {item.customerName}
                    <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">{item.companyName}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
