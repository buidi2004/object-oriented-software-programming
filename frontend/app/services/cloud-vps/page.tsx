'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Server, Shield, Zap, Cloud, Cpu, HardDrive, Clock, Database
} from 'lucide-react';
import CategoryPricingGrid from '@/components/CategoryPricingGrid';
import { Header } from '@/src/components/Header';
import ServicePageSections from '@/src/components/service-landing/ServicePageSections';
import { SERVICE_PAGE_CONTENT } from '@/src/data/servicePages';

const FEATURES = [
  { icon: Cpu, title: 'CPU AMD EPYC', desc: 'Bộ xử lý AMD EPYC thế hệ mới nhất, hiệu năng vượt trội cho mọi workload.' },
  { icon: HardDrive, title: 'NVMe SSD Enterprise', desc: 'Ổ cứng NVMe SSD với IOPS lên đến 500.000, tốc độ đọc/ghi 7GB/s.' },
  { icon: Shield, title: 'Anti-DDoS Tích Hợp', desc: 'Hệ thống chống DDoS tự động lên đến 500Gbps, bảo vệ máy chủ 24/7.' },
  { icon: Clock, title: 'Triển Khai 30 Giây', desc: 'Hệ thống tự động hóa 100%, VPS sẵn sàng sử dụng chỉ sau 30 giây.' },
  { icon: Database, title: 'Snapshot & Backup', desc: 'Tạo snapshot nhanh, khôi phục dữ liệu tức thì khi cần thiết.' },
];

export default function CloudVpsPage() {
  const [isYearly, setIsYearly] = useState(true);
  const pageContent = SERVICE_PAGE_CONTENT.vps;

  return (
    <div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white py-20 sm:py-28">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0di00aDJ2NGgtMnptMC0zMFYwaDJ2NGgtMnptMTIgMTJ2LTRoMnY0aC0yem0wLTMwVjBoMnY0aC0yem0xMiAxMnYtNGgydjRoLTJ6bTAtMzBWMGgydjRoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav className="flex items-center gap-2 text-sm text-blue-300 mb-8">
            <Link href="/" className="hover:text-white">Trang chủ</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white">Dịch vụ</Link>
            <span>/</span>
            <span className="text-white font-medium">Cloud VPS</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Server className="w-3.5 h-3.5" />
              Cloud VPS Enterprise
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              Máy Chủ Ảo Cloud VPS
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent"> Hiệu Năng Cao</span>
            </h1>
            <p className="text-lg text-blue-200 max-w-2xl mb-8">
              Hạ tầng AMD EPYC + NVMe SSD Enterprise. Toàn quyền Root Access, Anti-DDoS tích hợp, triển khai tức thì trong 30 giây.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#pricing" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-2xl transition-all flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Xem Bảng Giá
              </a>
              <Link href="/" className="px-8 py-4 rounded-2xl border-2 border-white/20 text-white font-bold text-base hover:bg-white/10 transition-all">
                Dùng thử miễn phí
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Tại Sao Chọn Cloud VPS Của Chúng Tôi?</h2>
            <p className="text-slate-600">Hạ tầng chất lượng doanh nghiệp, giá cả hợp lý cho mọi quy mô.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feat, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                  <feat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-600">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicePageSections content={pageContent} group="pre" />

      {/* Pricing Plans */}
      <section id="pricing" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Bảng Giá Cloud VPS</h2>
            <p className="text-slate-600 mb-6">Chọn cấu hình phù hợp với nhu cầu của bạn. Nâng cấp bất kỳ lúc nào.</p>
            
            {/* Billing Toggle */}
            <div className="inline-flex bg-white rounded-full p-1 border border-slate-200 shadow-sm">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  !isYearly ? 'bg-slate-900 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Hàng Tháng
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isYearly ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <span>Hàng Năm</span>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">Giảm 20%</span>
              </button>
            </div>
          </div>

          <CategoryPricingGrid categorySlug="cloud-vps" isYearly={isYearly} popularIndex={1} />
        </div>
      </section>

      <ServicePageSections content={pageContent} group="post" />

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Sẵn Sàng Triển Khai Cloud VPS?</h2>
          <p className="text-blue-200 mb-8">Chỉ cần 30 giây để có máy chủ VPS hiệu năng cao sẵn sàng phục vụ.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-blue-600 font-bold shadow-xl hover:shadow-2xl transition-all">
            <Zap className="w-5 h-5" />
            Bắt Đầu Ngay
          </Link>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2024 CloudHost VN. Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
