'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const HomeFAQSection = () => {
  const faqs = [
    {
      question: "Dữ liệu của tôi có được sao lưu (backup) thường xuyên không?",
      answer: "Có. Tất cả các dịch vụ Hosting và Cloud VPS tại CloudHost đều được hệ thống tự động sao lưu định kỳ mỗi ngày/tuần. Bạn có thể dễ dàng khôi phục dữ liệu chỉ với 1 click chuột trên bảng điều khiển quản trị."
    },
    {
      question: "Sau khi thanh toán, tôi phải mất bao lâu để sử dụng dịch vụ?",
      answer: "Hệ thống của chúng tôi hoàn toàn tự động. Ngay sau khi bạn thanh toán thành công, hệ thống sẽ tự động khởi tạo và cấp phát dịch vụ trong vòng 60 giây. Thông tin tài khoản quản trị sẽ được gửi qua email của bạn ngay lập tức."
    },
    {
      question: "Tôi muốn nâng cấp lên gói cao hơn có bị gián đoạn dịch vụ không?",
      answer: "Việc nâng cấp dịch vụ tại CloudHost cực kỳ dễ dàng. Bạn chỉ cần chọn gói cấu hình muốn nâng cấp trên trang quản trị và thanh toán phần chênh lệch. Dữ liệu của bạn được giữ nguyên 100% và thời gian gián đoạn chỉ chưa tới 2 phút để khởi động lại dịch vụ với cấu hình mới."
    },
    {
      question: "Hệ thống Anti-DDoS của CloudHost hoạt động như thế nào?",
      answer: "Chúng tôi trang bị hệ thống phần cứng Tường lửa (Firewall) và WAF chuyên dụng giúp lọc sạch các lưu lượng bẩn (Layer 4 & Layer 7) trước khi đi vào máy chủ của bạn. Hệ thống phát hiện tự động và ngăn chặn các đợt tấn công cường độ cao mà không làm chậm tốc độ website."
    }
  ];

  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="py-24 bg-slate-50 relative overflow-hidden border-t border-slate-200">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-wider text-[#d09e2b] uppercase mb-3">
            Câu Hỏi Thường Gặp
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            Giải Đáp Thắc Mắc
          </h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`bg-white rounded-2xl border transition-all ${
                openIndex === idx ? 'border-[#d09e2b] shadow-md' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <button 
                className="w-full px-6 py-5 flex items-center justify-between font-bold text-left text-slate-900"
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              >
                <span className="pr-4">{faq.question}</span>
                {openIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-[#d09e2b] shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                )}
              </button>
              
              {openIndex === idx && (
                <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
