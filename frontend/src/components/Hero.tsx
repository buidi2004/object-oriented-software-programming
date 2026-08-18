'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Gauge, ShieldCheck, Headset, Sparkles, CheckCircle2, Cloud } from 'lucide-react';

interface HeroProps {
  onStartClick: () => void;
  onPriceClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartClick, onPriceClick }) => {
  const [heroImage, setHeroImage] = useState('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80');

  useEffect(() => {
    fetch('/api/banners')
      .then(res => res.ok ? res.json() : [])
      .then((data: any[]) => {
        if (Array.isArray(data) && data.length > 0 && data[0].imageUrl) {
          setHeroImage(data[0].imageUrl);
        }
      })
      .catch(() => {});
  }, []);
  return (
    <section id="hero-section" className="relative pt-8 pb-16 lg:pt-14 lg:pb-24 overflow-hidden select-none">
      
      {/* Background Soft Mesh Glow Orbs matching image */}
      <div className="absolute top-10 left-1/3 w-80 h-80 bg-blue-400/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse duration-1000" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1.2px,transparent_1.2px)] [background-size:20px_20px] opacity-40 pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Top Pill Tag matching prompt image */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/90 border border-slate-200/80 shadow-xs">
              <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase">
                PLUS JAKARTA SANS
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Hạ tầng vững chắc
              </h1>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-500 bg-clip-text text-transparent tracking-tight leading-[1.12]">
                Vươn tầm quy mô
              </h2>
            </div>

            {/* Paragraph Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
              Giải pháp Cloud toàn diện, bảo mật và hiệu suất cao. Xây dựng nền tảng số mạnh mẽ cho doanh nghiệp ngay hôm nay với công nghệ tiên tiến nhất.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              
              {/* Primary Button */}
              <button
                onClick={onStartClick}
                className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-500/25 hover:shadow-2xl hover:shadow-blue-500/35 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2 group cursor-pointer"
              >
                <span>Bắt đầu ngay</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Secondary Glass Button matching exact style in image */}
              <button
                onClick={onPriceClick}
                className="px-7 py-3.5 rounded-2xl bg-cyan-50/60 hover:bg-cyan-100/70 border border-cyan-300/60 text-cyan-900 font-bold text-base transition-all duration-300 shadow-xs cursor-pointer"
              >
                Xem báo giá
              </button>
            </div>

            {/* Stats Footer Row matching exact image layout */}
            <div className="pt-8 border-t border-slate-200/60 flex items-center gap-12 sm:gap-16">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  99.9%
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  UPTIME
                </div>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  24/7
                </div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                  HỖ TRỢ
                </div>
              </div>
            </div>

          </div>

          {/* Hero Right Media Card */}
          <div className="lg:col-span-6 relative">
            
            {/* Main Rounded Datacenter Frame matching exact image */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/80 bg-slate-900 group">
              
              <img
                src={heroImage}
                alt="CloudHost VN Datacenter Server Room"
                className="w-full h-[380px] sm:h-[440px] object-cover group-hover:scale-105 transition-transform duration-700"
                referrerPolicy="no-referrer"
              />

              {/* Watermark Branding overlay top right corner */}
              <div className="absolute top-4 right-5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/40 backdrop-blur-md border border-white/20 text-white/90 text-xs font-semibold">
                <Cloud className="w-3.5 h-3.5 text-cyan-300" />
                <span>CloudHost VN</span>
              </div>

              {/* Glassmorphism Floating Pill Badge bottom right matching exact picture */}
              <div className="absolute bottom-5 right-5 bg-white/85 backdrop-blur-xl border border-white/70 p-3 px-5 rounded-2xl shadow-xl flex items-center gap-3.5 text-slate-900 transition-transform duration-300 hover:scale-105">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner">
                  <Gauge className="w-5 h-5 animate-spin-slow" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-extrabold text-slate-900">
                    Băng thông
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    Không giới hạn
                  </span>
                </div>
              </div>

            </div>

            {/* Decorative subtle background blurred glow circle behind image */}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-500/20 rounded-full blur-2xl -z-10 pointer-events-none" />

          </div>

        </div>
      </div>
    </section>
  );
};
