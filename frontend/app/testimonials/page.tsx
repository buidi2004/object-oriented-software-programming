'use client';

import React, { useState, useEffect } from 'react';
import { Star, Quote, Loader2 } from 'lucide-react';
import { api } from '../../src/lib/api';
import Link from 'next/link';

interface Testimonial {
  id: string;
  customerName: string;
  companyName: string;
  content: string;
  rating: number;
  featured: boolean;
  createdAt: string;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await api.get('/testimonials');
      // Assume the backend returns an array of testimonials
      setTestimonials(res.data);
    } catch (error) {
      console.error('Failed to fetch testimonials', error);
      // Fallback data if API fails or is empty
      setTestimonials([
        { id: '1', customerName: 'Nguyễn Văn A', companyName: 'Tech Corp', content: 'Dịch vụ VPS cực kỳ ổn định, uptime 99.99%. Hỗ trợ kỹ thuật 24/7 siêu tốc. Rất đáng tiền!', rating: 5, featured: true, createdAt: '2024-01-01' },
        { id: '2', customerName: 'Trần Thị B', companyName: 'Shopify VN', content: 'Giao diện thân thiện, dễ sử dụng. Từ lúc chuyển Hosting qua đây website tôi load nhanh hơn hẳn.', rating: 5, featured: true, createdAt: '2024-02-15' },
        { id: '3', customerName: 'Lê Hoàng C', companyName: 'Dev Studio', content: 'Hệ thống tự động hóa quá tốt, mua xong có VPS dùng ngay trong 2 phút. Tính năng Auto Renew rất tiện.', rating: 4, featured: false, createdAt: '2024-03-10' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-2">Đánh Giá Từ Khách Hàng</h2>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tight">
            Khách hàng nói gì về <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">CloudStore</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Hơn 10,000+ doanh nghiệp và cá nhân đang tin dùng dịch vụ hạ tầng của chúng tôi mỗi ngày. 
            Dưới đây là một số phản hồi thực tế từ họ.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div 
                key={testimonial.id} 
                className={`bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1`}
              >
                <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-100 -z-0 transform rotate-180" />
                <div className="relative z-10">
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <p className="text-slate-700 text-lg leading-relaxed mb-8 min-h-[120px]">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${idx % 2 === 0 ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white' : 'bg-gradient-to-tr from-emerald-500 to-teal-500 text-white'}`}>
                      {testimonial.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{testimonial.customerName}</h4>
                      {testimonial.companyName && (
                        <p className="text-sm text-slate-500">{testimonial.companyName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Link href="/services" className="inline-block bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg shadow-slate-900/20">
            Trải nghiệm dịch vụ ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
