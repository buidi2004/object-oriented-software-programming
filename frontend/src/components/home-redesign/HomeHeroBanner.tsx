'use client';

import React, { useState, useEffect } from 'react';
import { Play, Sparkles, ChevronLeft, ChevronRight, Server, Shield, Globe, Cpu } from 'lucide-react';
import { api } from '@/src/lib/api';
import Link from 'next/link';

export const HomeHeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const fallbackSlides = [
    { 
      id: 1, 
      mainTitle: "CloudHost AI Copilot",
      title: "Transform how you run on CloudHost",
      description: "Harness the collective intelligence of CloudHost agents with an AI companion. Optimize your infrastructure, deploy faster, and scale effortlessly.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", 
      link: '/partners',
      icon: <Sparkles className="w-6 h-6 text-[#d09e2b]" />
    },
    { 
      id: 2, 
      mainTitle: "High Performance Cloud",
      title: "NVMe Cloud VPS Enterprise",
      description: "Trải nghiệm sức mạnh vượt trội với máy chủ ảo lưu trữ 100% NVMe Enterprise, mang lại tốc độ đọc/ghi siêu tốc và uptime 99.99%.",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop", 
      link: '/services/cloud-vps',
      icon: <Server className="w-6 h-6 text-[#d09e2b]" />
    },
    { 
      id: 3, 
      mainTitle: "Bare Metal Power",
      title: "Dedicated Physical Servers",
      description: "Toàn quyền kiểm soát tài nguyên phần cứng. Phù hợp cho các hệ thống lớn, website traffic khủng và các ứng dụng đòi hỏi hiệu năng tối đa.",
      image: "https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop", 
      link: '/services/dedicated-servers',
      icon: <Cpu className="w-6 h-6 text-[#d09e2b]" />
    },
    { 
      id: 4, 
      mainTitle: "Global Identity",
      title: "Đăng ký Tên miền Quốc tế",
      description: "Bảo vệ thương hiệu doanh nghiệp với hàng trăm đuôi mở rộng phổ biến nhất (.com, .vn, .net, .ai). Quản lý DNS chuyên nghiệp hoàn toàn miễn phí.",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", 
      link: '/domains',
      icon: <Globe className="w-6 h-6 text-[#d09e2b]" />
    },
    { 
      id: 5, 
      mainTitle: "Enterprise Security",
      title: "Hệ thống Bảo mật WAF & Anti-DDoS",
      description: "Phát hiện và ngăn chặn tự động các cuộc tấn công DDoS Layer 7, OWASP Top 10, bảo vệ an toàn dữ liệu khách hàng 24/7/365.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop", 
      link: '/services/security',
      icon: <Shield className="w-6 h-6 text-[#d09e2b]" />
    }
  ];

  const [slides, setSlides] = useState(fallbackSlides);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await api.get('/banners');
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          const activeBanners = res.data
            .filter((b: any) => b.isActive !== false)
            .sort((a: any, b: any) => (a.displayOrder || 1) - (b.displayOrder || 1));
            
          if (activeBanners.length > 0) {
            setSlides(activeBanners.map((b: any, idx: number) => ({
              id: b.id || idx,
              mainTitle: fallbackSlides[idx % fallbackSlides.length].mainTitle,
              title: b.title || fallbackSlides[idx % fallbackSlides.length].title,
              description: b.description || fallbackSlides[idx % fallbackSlides.length].description,
              image: b.imageUrl || fallbackSlides[idx % fallbackSlides.length].image,
              link: b.linkUrl || fallbackSlides[idx % fallbackSlides.length].link,
              icon: fallbackSlides[idx % fallbackSlides.length].icon
            })));
          }
        }
      } catch (err) {
        console.error("Lỗi lấy dữ liệu banner:", err);
      }
    };
    fetchBanners();
  }, []);

  // Auto-play 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));

  return (
    <div className="relative w-full overflow-hidden min-h-[500px] md:min-h-[600px] flex items-center justify-center pt-16 pb-20 group">
      {/* Sharp Diagonal Background (White to Black/Earthy Yellow Multi-color Gradient) */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: `
            linear-gradient(108deg, #ffffff 0%, #ffffff 45%, transparent 45.1%),
            linear-gradient(135deg, #000000 0%, #1e293b 35%, #d09e2b 85%, #fcd34d 100%)
          `
        }}
      >
        {/* Additional glowing mesh blobs on the dark side to make it "nhiều màu" (multi-color) */}
        <div className="absolute top-0 right-0 w-[50%] h-[100%] bg-gradient-to-bl from-orange-400/40 via-yellow-500/20 to-transparent blur-[80px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[60%] bg-[#d09e2b]/50 blur-[100px] pointer-events-none"></div>
        {/* The sharp diagonal accent line (like Azure's pink line) */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: `linear-gradient(108deg, transparent 0%, transparent 45%, #d09e2b 45.1%, #d09e2b 45.3%, transparent 45.4%)`
          }}
        ></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 min-h-[450px]">
        
        {slides.map((slide, idx) => (
          <div 
            key={slide.id}
            className={`absolute inset-0 w-full transition-all duration-700 ease-in-out px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center ${
              idx === currentSlide 
                ? 'opacity-100 translate-x-0 pointer-events-auto z-10' 
                : 'opacity-0 translate-x-12 pointer-events-none z-0'
            }`}
          >
            {/* LEFT COLUMN - Fixed width, exactly like Azure layout */}
            <div className="w-full lg:w-[460px] flex flex-col justify-center mt-8 lg:mt-0 shrink-0">
              {/* Main Title */}
              <h1 className="text-4xl md:text-[46px] font-medium text-slate-900 mb-6 tracking-tight drop-shadow-sm">
                {slide.mainTitle}
              </h1>

              {/* Left Card - Solid translucent background */}
              <div className="bg-[#e6f4f9] backdrop-blur-md border border-white/60 rounded-2xl p-8 sm:p-10 shadow-lg w-full relative overflow-hidden">
                <div className="flex items-start gap-4 mb-6">
                  {/* Icon Box */}
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                    {slide.icon}
                  </div>
                  {/* Text Content */}
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2 leading-snug">{slide.title}</h2>
                    <p className="text-[14px] text-slate-700 leading-relaxed max-w-sm">
                      {slide.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8">
                  <Link 
                    href={slide.link !== '#' ? slide.link : '/register'}
                    className="inline-block bg-[#d09e2b] hover:bg-[#b0841f] text-white font-semibold px-6 py-2.5 rounded-md transition-all text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5"
                  >
                    Bắt đầu sử dụng Cloud
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Video/Image Card (Larger) */}
            <div className="flex-1 w-full flex justify-end items-center mb-8 lg:mb-0 ml-0 lg:ml-8">
              {/* Thick Glass Border around the image */}
              <div className="p-4 bg-white/20 backdrop-blur-2xl border border-white/30 rounded-[28px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-[800px] relative group/card cursor-pointer"
                   onClick={() => { if (slide.link && slide.link !== '#') window.location.href = slide.link; }}
              >
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden aspect-[16/9] w-full bg-slate-900">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover/card:scale-105 opacity-90 group-hover/card:opacity-100"
                    style={{ backgroundImage: `url('${slide.image}')` }}
                  ></div>
                  
                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-12 bg-[#d09e2b] rounded-lg flex items-center justify-center shadow-xl transition-transform duration-300 group-hover/card:scale-110 group-hover/card:bg-[#b0841f]">
                      <Play className="w-6 h-6 ml-1 fill-white text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-0 lg:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:bg-white text-slate-700 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 border border-slate-200"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-0 lg:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-md shadow-md hover:bg-white text-slate-700 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 border border-slate-200"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-2 z-20">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all ${
                idx === currentSlide ? 'bg-[#d09e2b] w-8' : 'bg-[#d09e2b]/30 hover:bg-[#d09e2b]/60 w-2'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
