'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Globe, Zap, Shield, Cloud, Clock, Server
} from 'lucide-react';
import CategoryPricingGrid from '@/components/CategoryPricingGrid';
import { Header } from '@/src/components/Header';
import ServicePageSections from '@/src/components/service-landing/ServicePageSections';
import { SERVICE_PAGE_CONTENT } from '@/src/data/servicePages';

export default function HostingPage() {
  const [isYearly, setIsYearly] = useState(true);
  const pageContent = SERVICE_PAGE_CONTENT.hosting;

  return (
    <div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-slate-900 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav className="flex items-center gap-2 text-sm text-slate-200 mb-8">
            <Link href="/" className="hover:text-slate-900">Trang chủ</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-slate-900">Dịch vụ</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Web Hosting</span>
          </nav>
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Globe className="w-3.5 h-3.5" />
              NVMe Web Hosting
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              NVMe Web Hosting
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent"> Tốc Độ Cao</span>
            </h1>
            <p className="text-lg text-slate-200 max-w-2xl mb-8">
              Tối ưu 100% cho WordPress, WooCommerce & Laravel. LiteSpeed Web Server + LSCache tăng tốc gấp 10 lần so với hosting truyền thống.
            </p>
            <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-slate-900 font-bold shadow-xl hover:shadow-2xl transition-all">
              <Zap className="w-5 h-5" />
              Xem Bảng Giá
            </a>
          </div>
        </div>
      </section>

      {/* Features Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Tính Năng Nổi Bật</h2>
            <p className="text-slate-600">Mọi thứ bạn cần để chạy website chuyên nghiệp</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Zap, title: 'LiteSpeed + LSCache', desc: 'Tăng tốc x10 so với Apache/Nginx', color: 'bg-amber-100 text-amber-600' },
              { icon: Shield, title: 'Imunify360 AI', desc: 'Chống hacker & mã độc tự động', color: 'bg-rose-100 text-rose-600' },
              { icon: Globe, title: 'cPanel Pro', desc: 'Quản trị website dễ dàng', color: 'bg-blue-100 text-[#1F1F1F]' },
              { icon: Clock, title: 'Backup Tự Động', desc: 'Sao lưu hàng ngày, khôi phục 1 click', color: 'bg-emerald-100 text-emerald-600' },
            ].map((f, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center hover:shadow-md transition-all">
                <div className={`w-14 h-14 rounded-2xl ${f.color} flex items-center justify-center mx-auto mb-4`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicePageSections content={pageContent} group="pre" />

      {/* Pricing Cards */}
      <section id="pricing" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Chọn Gói Hosting Phù Hợp</h2>
            <div className="inline-flex bg-white rounded-full p-1 border border-slate-200 shadow-sm mt-4">
              <button onClick={() => setIsYearly(false)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!isYearly ? 'bg-white text-slate-900' : 'text-slate-500'}`}>
                Hàng Tháng
              </button>
              <button onClick={() => setIsYearly(true)} className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${isYearly ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                <span>Hàng Năm</span>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">Giảm 25%</span>
              </button>
            </div>
          </div>

          <CategoryPricingGrid
            categorySlug="web-hosting"
            isYearly={isYearly}
            popularIndex={1}
            accentClass="border-indigo-500 shadow-xl shadow-indigo-500/10"
          />
        </div>
      </section>

      <ServicePageSections content={pageContent} group="post" />

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-slate-900 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Bắt Đầu Xây Dựng Website Ngay Hôm Nay</h2>
          <p className="text-slate-200 mb-8">Đăng ký hosting chỉ mất 2 phút. Hỗ trợ chuyển dữ liệu miễn phí.</p>
          <Link href="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-[#1F1F1F] font-bold shadow-xl hover:shadow-2xl transition-all">
            <Zap className="w-5 h-5" />
            Đăng Ký Hosting
          </Link>
        </div>
      </section>

      <footer className="bg-white text-slate-600 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2024 CloudHost VN. Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
