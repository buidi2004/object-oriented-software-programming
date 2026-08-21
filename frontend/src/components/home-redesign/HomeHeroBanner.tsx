'use client';

import React, { useState, useEffect } from 'react';
import { Network, ShieldCheck, Zap, Server, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/src/lib/api';

export const HomeHeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [slides, setSlides] = useState([
    { id: 1, image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", link: '/partners' },
    { id: 2, image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop", link: '#' },
    { id: 3, image: "https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop", link: '#' },
    { id: 4, image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", link: '#' },
    { id: 5, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop", link: '#' }
  ]);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Lọc các banner đang active và sắp xếp theo displayOrder
          const activeBanners = res.data
            .filter((b: any) => b.isActive !== false)
            .sort((a: any, b: any) => (a.displayOrder || 1) - (b.displayOrder || 1));
            
          if (activeBanners.length > 0) {
            setSlides(activeBanners.map((b: any, idx: number) => ({
              id: b.id || idx,
              image: b.imageUrl,
              link: b.linkUrl || '#'
            })));
          }
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu banner:", err);
      }
    };
    fetchBanners();
  }, []);

  // Auto-play 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 3000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="relative w-full group">
      {/* Background Banner */}
      <div className="relative w-full h-[460px] sm:h-[500px] md:h-[600px] bg-white overflow-hidden">
        
        {/* Render Slides */}
        {slides.map((slide, idx) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center cursor-pointer"
              style={{ backgroundImage: `url('${slide.image}')` }}
              onClick={() => { if (slide.link && slide.link !== '#') window.location.href = slide.link; }}
            />
            <div className="absolute inset-0 bg-blue-900/60 mix-blend-multiply pointer-events-none" />
          </div>
        ))}
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center pointer-events-none">
          <div className="grid md:grid-cols-2 gap-6 md:gap-10 items-center">
            {/* Text Content */}
            <div className="text-slate-900 space-y-4 md:space-y-6 pointer-events-auto">
              <h3 className="text-sm sm:text-base md:text-xl font-bold tracking-wider text-blue-300">CLOUDHOST VN TỰ HÀO</h3>
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                Chương trình phát triển đối tác <br className="hidden sm:inline" />
                Cloud khu vực Đông Nam Á
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-slate-700 max-w-xl line-clamp-3 sm:line-clamp-none">
                Mở rộng hệ sinh thái, hợp tác vươn xa cùng nền tảng điện toán đám mây số 1 Việt Nam.
              </p>
              <div className="pt-2 md:pt-4">
                <Link href="/partners" className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-slate-100 transition-colors shadow-lg text-sm sm:text-base">
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>

            {/* Right Card/Image (Simulating the BROADCOM partner badge in the screenshot) */}
            <div className="hidden md:flex justify-end pointer-events-auto">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl w-80 text-center text-slate-900 shadow-2xl">
                <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center mx-auto mb-6">
                  <Server className="w-10 h-10 text-blue-600" />
                </div>
                <h4 className="text-2xl font-black mb-2">PARTNER</h4>
                <p className="text-slate-700 text-sm">Welcome to the Partner Network</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/50 text-slate-900 flex items-center justify-center backdrop-blur-sm transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 z-20"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/30 hover:bg-black/50 text-slate-900 flex items-center justify-center backdrop-blur-sm transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 z-20"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 sm:bottom-8 md:bottom-24 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80 w-2'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Feature Strip (Normal Flow - No Overlap) */}
      <div className="bg-slate-50 w-full py-8 md:py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-5 sm:p-6 lg:p-8 border border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 lg:gap-10">
              <FeatureBox icon={Network} title="Hệ sinh thái mở" desc="Đa dạng giải pháp và ứng dụng" />
              <FeatureBox icon={Zap} title="Linh hoạt" desc="Tùy biến tài nguyên theo nhu cầu" />
              <FeatureBox icon={ShieldCheck} title="An toàn bảo mật" desc="Hệ thống bảo vệ nhiều lớp" />
              <FeatureBox icon={Server} title="Chủ động" desc="Quản trị toàn diện hệ thống" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeatureBox = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex items-center gap-4 group">
    <div className="shrink-0">
      <div className="w-12 h-12 rounded-full bg-[#fdf8f4] flex items-center justify-center text-[#6e4e37] shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)] border border-[#f5ebe4] group-hover:bg-[#f5ebe4] group-hover:scale-105 transition-all duration-300">
        <Icon className="w-5 h-5" strokeWidth={2} />
      </div>
    </div>
    <div className="flex flex-col justify-center">
      <h4 className="text-[15px] font-bold text-slate-800 mb-0.5 group-hover:text-[#6e4e37] transition-colors">{title}</h4>
      <p className="text-[13px] text-slate-500 font-medium">{desc}</p>
    </div>
  </div>
);
