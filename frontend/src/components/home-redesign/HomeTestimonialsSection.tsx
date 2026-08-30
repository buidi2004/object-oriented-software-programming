'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

export const HomeTestimonialsSection = () => {
  const testimonials = [
    {
      content: "CloudHost đã giải quyết bài toán tải trọng server cho mùa Sale của chúng tôi. Hệ thống chạy cực kỳ mượt mà, chưa từng gặp downtime.",
      author: "Nguyễn Văn A",
      role: "CTO, E-commerce Store",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop"
    },
    {
      content: "Đội ngũ support của CloudHost thực sự xuất sắc. Tôi gửi ticket lúc 2h sáng và được phản hồi, xử lý dứt điểm chỉ trong 10 phút.",
      author: "Trần Thị B",
      role: "CEO, Tech Startup",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"
    },
    {
      content: "Chuyển từ hosting cũ sang NVMe VPS của CloudHost, tốc độ website của tôi tăng lên gấp 3 lần. Điểm Core Web Vitals xanh toàn bộ.",
      author: "Lê Hoàng C",
      role: "Digital Marketing Manager",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop"
    }
  ];

  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-wider text-[#d09e2b] uppercase mb-3">
            Đánh Giá Từ Khách Hàng
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            Hàng Ngàn Doanh Nghiệp Tin Tưởng
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testi, idx) => (
            <div key={idx} className="bg-slate-50 rounded-2xl p-8 relative border border-slate-100 hover:shadow-lg transition-shadow">
              <Quote className="w-10 h-10 text-slate-200 absolute top-6 right-6" />
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-slate-700 leading-relaxed mb-8 relative z-10 text-[15px]">
                "{testi.content}"
              </p>
              <div className="flex items-center gap-4">
                <img src={testi.avatar} alt={testi.author} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <h4 className="font-bold text-slate-900">{testi.author}</h4>
                  <p className="text-sm text-slate-500">{testi.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
