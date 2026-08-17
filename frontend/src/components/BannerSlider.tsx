'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api';

export interface BannerItem {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder?: number;
  isActive?: boolean;
}

const DEFAULT_BANNERS: BannerItem[] = [
  {
    id: 'default-1',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1400&q=80',
    linkUrl: '/promotions',
  },
  {
    id: 'default-2',
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1400&q=80',
    linkUrl: '/services/cloud-vps',
  },
];

export const BannerSlider: React.FC = () => {
  const [banners, setBanners] = useState<BannerItem[]>(DEFAULT_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await api.get<BannerItem[]>('/banners');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const activeOnly = res.data.filter(b => b.isActive !== false);
        if (activeOnly.length > 0) {
          setBanners(activeOnly);
        }
      }
    } catch {
      // Keep default banners
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
      <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 aspect-[21/9] sm:aspect-[24/8] group">
        {/* Banner Image with Smooth Fade */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 transform scale-105 group-hover:scale-100"
          style={{ backgroundImage: `url(${currentBanner.imageUrl})` }}
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent" />

        {/* Banner Content */}
        <div className="absolute inset-0 p-6 sm:p-10 lg:p-12 flex flex-col justify-center max-w-xl z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-cyan-300 text-xs font-extrabold uppercase tracking-wider mb-3 w-fit backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            Khuyến Mãi Đặc Biệt Cloud 2026
          </div>
          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight mb-2 tracking-tight">
            Nâng Tầm Hạ Tầng <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Giảm Đến 50% Năm Đầu
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-4 font-medium">
            Trải nghiệm Cloud VPS NVMe AMD EPYC &amp; Hosting tốc độ cao với băng thông không giới hạn và Anti-DDoS 500Gbps.
          </p>

          <div className="flex items-center gap-3">
            <Link
              href={currentBanner.linkUrl || '/promotions'}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all"
            >
              <span>Xem Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/services"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-colors"
            >
              Tất Cả Dịch Vụ
            </Link>
          </div>
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-950/40 hover:bg-slate-950/80 text-white backdrop-blur-md flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20"
              aria-label="Next banner"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Dots Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === idx ? 'w-8 bg-cyan-400 shadow-md shadow-cyan-400/50' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
