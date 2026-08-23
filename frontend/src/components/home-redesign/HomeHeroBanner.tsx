'use client';

import React, { useState, useEffect } from 'react';
import { Network, ShieldCheck, Zap, Server, ChevronLeft, ChevronRight } from 'lucide-react';
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
            <div className="absolute inset-0 bg-black/60 mix-blend-multiply pointer-events-none" />
          </div>
        ))}

        {/* Navigation Arrows */}
        <button 
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 z-20"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all opacity-80 md:opacity-0 md:group-hover:opacity-100 z-20"
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


    </div>
  );
};

