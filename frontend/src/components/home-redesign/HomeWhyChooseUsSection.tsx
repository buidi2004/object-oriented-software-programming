'use client';

import React from 'react';
import { Cpu, ShieldAlert, Clock, RefreshCw, HardDrive, Headset } from 'lucide-react';

export const HomeWhyChooseUsSection = () => {
  const features = [
    {
      name: 'Phần Cứng Mạnh Mẽ',
      description: 'Máy chủ vật lý thế hệ mới với CPU Intel Xeon / AMD EPYC và 100% ổ cứng NVMe Enterprise cho tốc độ vượt trội.',
      icon: <Cpu className="w-6 h-6 text-[#d09e2b]" />,
    },
    {
      name: 'Anti-DDoS Tự Động',
      description: 'Hệ thống tường lửa WAF và Anti-DDoS Layer 7 lọc sạch lưu lượng bẩn, bảo vệ website 24/7 khỏi mọi cuộc tấn công.',
      icon: <ShieldAlert className="w-6 h-6 text-[#d09e2b]" />,
    },
    {
      name: 'Uptime 99.99%',
      description: 'Hạ tầng High Availability đa khu vực (Multi-AZ) đảm bảo dịch vụ của bạn luôn online dù có sự cố phần cứng.',
      icon: <Clock className="w-6 h-6 text-[#d09e2b]" />,
    },
    {
      name: 'Triển Khai Tức Thì',
      description: 'Hệ thống tự động cấp phát tài nguyên ngay khi thanh toán thành công. Cloud VPS, Hosting sẵn sàng sau 60 giây.',
      icon: <RefreshCw className="w-6 h-6 text-[#d09e2b]" />,
    },
    {
      name: 'Backup Tự Động',
      description: 'Dữ liệu được sao lưu định kỳ mỗi ngày/tuần. Hỗ trợ khôi phục nhanh chóng qua vài click trên Control Panel.',
      icon: <HardDrive className="w-6 h-6 text-[#d09e2b]" />,
    },
    {
      name: 'Hỗ Trợ 24/7/365',
      description: 'Đội ngũ chuyên gia hệ thống luôn túc trực để xử lý các sự cố kỹ thuật qua Ticket, Livechat bất kể Lễ/Tết.',
      icon: <Headset className="w-6 h-6 text-[#d09e2b]" />,
    },
  ];

  return (
    <div className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-wider text-[#d09e2b] uppercase mb-3">
            Lợi Thế Cạnh Tranh
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            Tại Sao Chọn CloudHost?
          </h3>
          <p className="text-lg text-slate-600">
            Chúng tôi không chỉ cung cấp máy chủ, chúng tôi mang đến nền tảng hạ tầng hoàn hảo để doanh nghiệp của bạn cất cánh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-100 p-8 rounded-2xl hover:shadow-xl transition-all hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">{feature.name}</h4>
              <p className="text-[15px] text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
