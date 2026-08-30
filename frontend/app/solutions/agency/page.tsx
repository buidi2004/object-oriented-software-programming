'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Code2, Compass, Zap } from 'lucide-react';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { Phase5Extensions } from '@/src/components/solutions/Phase5Extensions';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function AgencySolutionPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, -300]);
  const y2 = useTransform(scrollY, [0, 2000], [0, 300]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* HERO */}
      <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/30 to-[#0a0a0a]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <ScrollReveal animation="zoom-in">
            <Code2 className="w-20 h-20 mx-auto text-emerald-500 mb-6 drop-shadow-[0_0_20px_rgba(var(--color-emerald-500),0.8)]" />
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 uppercase tracking-widest">
              Agency & Developer
            </h1>
            <div className="text-xl text-emerald-400 font-mono">
               <TypewriterText text="MASONRY PARALLAX LAYOUT ENABLED." speed={50} />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* MASONRY PARALLAX */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-[1200px] overflow-hidden relative">
           
           {/* Column 1 - Moves Up */}
           <motion.div style={{ y: y1 }} className="space-y-8 pt-20">
              <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8">
                 <img src="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=800&auto=format&fit=crop" className="w-full rounded-2xl mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
                 <h3 className="text-2xl font-bold text-white mb-3">Hình Ảnh 1</h3>
                 <p className="text-slate-400">Thiết kế so le đột phá giúp khối lượng nội dung khổng lồ không bị nhàm chán.</p>
              </div>
              <div className="rounded-3xl overflow-hidden bg-emerald-900/20 border border-emerald-900/50 p-8">
                 <div className="text-6xl font-black text-emerald-500 mb-4">01</div>
                 <h3 className="text-2xl font-bold text-white mb-3">Tốc Độ Tối Đa</h3>
                 <p className="text-slate-400">Hiệu ứng scroll khác tốc độ tạo chiều sâu 3D (Parallax) cho trang web.</p>
              </div>
              <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8">
                 <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" className="w-full rounded-2xl mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
              </div>
           </motion.div>

           {/* Column 2 - Moves Down (or slower) */}
           <motion.div style={{ y: y2 }} className="space-y-8 pb-20 -mt-64">
              <div className="rounded-3xl overflow-hidden bg-emerald-500 p-10 text-white shadow-[0_0_40px_rgba(var(--color-emerald-500),0.3)]">
                 <Compass className="w-12 h-12 mb-6 opacity-80" />
                 <h3 className="text-3xl font-black mb-4">Khám Phá Mới</h3>
                 <p className="text-emerald-100 text-lg">Giao diện này rất thích hợp cho những nội dung mang tính sáng tạo, gaming, hoặc showcase sản phẩm.</p>
              </div>
              <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8">
                 <img src="https://images.unsplash.com/photo-1614064641913-662f2eb71f28?q=80&w=800&auto=format&fit=crop" className="w-full rounded-2xl mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
                 <h3 className="text-2xl font-bold text-white mb-3">Mở Rộng Không Giới Hạn</h3>
                 <p className="text-slate-400">Masonry layout tự động sắp xếp các khối tin vừa khít nhau.</p>
              </div>
              <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8">
                 <div className="text-6xl font-black text-white mb-4">02</div>
                 <h3 className="text-2xl font-bold text-emerald-500 mb-3">Hiệu Suất Cao</h3>
                 <p className="text-slate-400">Dù nhiều hình ảnh, React và Framer Motion vẫn đảm bảo 60FPS.</p>
              </div>
           </motion.div>
           
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-32 bg-emerald-950 text-center relative z-20">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-black text-white mb-8">Bắt Đầu Trải Nghiệm Agency & Developer</h2>
            <Link href="/contact" className="inline-block px-12 py-5 bg-emerald-500 text-white font-bold rounded-full hover:bg-emerald-400 transition-colors shadow-[0_0_20px_rgba(var(--color-emerald-500),0.5)]">
               Khởi Tạo Ngay
            </Link>
         </div>
      </section>
          <Phase5Extensions themeColor="emerald" />

    </div>
  );
}