'use client';

import React from 'react';
import { ShieldCheck, Cpu, HardDrive, Lock, RefreshCw, Headset, Star, Building2 } from 'lucide-react';
import { REVIEWS } from '../data/mockData';

type FeatureItem = {
  icon: React.ReactNode;
  title: React.ReactNode;
  description: string;
};

export const InfrastructureFeatures: React.FC = () => {
  const features: FeatureItem[] = [
    {
      icon: <Building2 className="w-6 h-6 text-blue-600" />,
      title: 'Datacenter Tier III Tại Việt Nam',
      description: 'Hạ tầng máy chủ đặt tại Viettel IDC & FPT Datacenter tiêu chuẩn quốc tế Tier III với hệ thống nguồn điện Redundant 2N và làm mát chính xác.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-indigo-600" />,
      title: (
        <>
          Vi Xử Lý AMD EPYC{' '}
          <span className="whitespace-nowrap">&amp; Intel Xeon</span>
        </>
      ),
      description: 'Trang bị 100% chip xử lý thế hệ mới nhất cho tốc độ xử lý đa luồng ấn tượng, khả năng tối ưu hóa tính toán ứng dụng cao cấp.'
    },
    {
      icon: <HardDrive className="w-6 h-6 text-cyan-600" />,
      title: (
        <>
          100% Enterprise NVMe SSD{' '}
          <span className="whitespace-nowrap">Raid 10</span>
        </>
      ),
      description: 'Sử dụng ổ cứng SSD NVMe chuẩn doanh nghiệp cho tốc độ đọc/ghi dữ liệu lên đến 3500MB/s, nhanh gấp 10 lần SSD SATA thông thường.'
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-600" />,
      title: 'Anti-DDoS Pro Bảo Vệ 24/7',
      description: 'Tích hợp bộ lọc tấn công DDoS thông minh tự động lọc và loại bỏ các cuộc tấn công băng thông SYN Flood, UDP Flood tới 500Gbps.'
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-amber-600" />,
      title: 'Auto Snapshot & Daily Backup',
      description: 'Tự động sao lưu dữ liệu máy chủ hàng ngày tới hệ thống Storage Offsite độc lập, đảm bảo an toàn tuyệt đối trước sự cố.'
    },
    {
      icon: <Headset className="w-6 h-6 text-rose-600" />,
      title: 'Hỗ Trợ Kỹ Thuật Chuyên Nghiệp',
      description: 'Đội ngũ kỹ sư máy chủ kinh nghiệm hỗ trợ trực tiếp 24/7/365 qua Live Chat, Hotline và hệ thống Ticket với thời gian phản hồi < 5 phút.'
    }
  ];

  return (
    <section id="infrastructure-section" className="py-20 bg-white text-slate-900 relative overflow-hidden">
      
      {/* Soft Background Orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/20 text-xs font-bold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            Hạ Tầng Doanh Nghiệp
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Công Nghệ Dẫn Đầu Cho Sự Tăng Trưởng
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed">
            Chúng tôi đầu tư đồng bộ phần cứng doanh nghiệp cao cấp cùng giải pháp bảo mật toàn diện giúp hệ thống của bạn luôn vận hành liên tục.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
          {features.map((feat, i) => (
            <div
              key={i}
              className="flex h-full p-7 rounded-3xl bg-white/60 border border-slate-700/60 hover:border-blue-500/50 hover:bg-slate-100 transition-all duration-300 group"
            >
              <div className="flex flex-col h-full w-full min-h-0">
                <div className="w-12 h-12 shrink-0 rounded-2xl bg-white border border-slate-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  {feat.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 min-h-[3.5rem] leading-snug">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Customer Reviews Sub-section */}
        <div className="mt-24 pt-16 border-t border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Được Hơn 15,000+ Khách Hàng Tin Dùng
            </h3>
            <p className="text-slate-600 text-sm mt-1">
              Đánh giá từ các Doanh nghiệp, Cửa hàng E-commerce & Developer tại Việt Nam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((rev, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-white/40 border border-slate-700/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-4">
                    {[...Array(rev.stars)].map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm italic leading-relaxed mb-6">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-700/40">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="w-10 h-10 rounded-full object-cover border border-cyan-400/30"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="text-sm font-bold text-slate-900">{rev.name}</div>
                    <div className="text-xs text-slate-600">{rev.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
