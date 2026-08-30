'use client';
import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight, CheckCircle2, Maximize, TrendingUp, Zap } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { Phase5Extensions } from '@/src/components/solutions/Phase5Extensions';
import { motion } from 'framer-motion';

export default function AiSolutionPage() {
  return (
    <div className="min-h-screen bg-purple-50/30 overflow-hidden">
      {/* HERO */}
      <section className="pt-24 pb-20 bg-white border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase mb-6">
              <Cpu className="w-4 h-4" /> Trí tuệ nhân tạo (AI)
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6">
              Hiệu suất tối đa.<br/>
              <span className="text-purple-600">
                <TypewriterText text="Kiến trúc Bento Grid Độc Bản." speed={50} delay={0.2} />
              </span>
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade">
          <h2 className="text-3xl font-black mb-12">Hệ sinh thái Trí tuệ nhân tạo (AI)</h2>
        </ScrollReveal>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          {/* Card 1 - Large */}
          <div className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden bg-slate-900 group">
            <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-700" alt="Bento 1" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-0 left-0 p-8">
              <h3 className="text-3xl font-black text-white mb-2">Trải Nghiệm Toàn Cảnh</h3>
              <p className="text-slate-300">Tích hợp mượt mà mọi dịch vụ vào một nền tảng duy nhất.</p>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="relative rounded-3xl overflow-hidden bg-purple-500 group flex items-center justify-center p-8 text-center text-white">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            <div className="relative z-10">
              <Zap className="w-16 h-16 mx-auto mb-4 opacity-80 group-hover:scale-125 transition-transform" />
              <h3 className="text-2xl font-bold">Siêu Tốc Độ</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 p-8 shadow-xl group">
             <div className="text-purple-600 font-bold mb-4">THỐNG KÊ</div>
             <div className="text-6xl font-black text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">99.99%</div>
             <p className="text-slate-500 font-medium">Uptime Guarantee</p>
          </div>

          {/* Card 4 - Wide */}
          <div className="md:col-span-2 relative rounded-3xl overflow-hidden bg-slate-100 group p-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Mở rộng linh hoạt</h3>
              <div className="text-purple-600 font-mono"><TypewriterText text="Auto-scaling: ACTIVE" speed={40} delay={1}/></div>
            </div>
            <TrendingUp className="w-20 h-20 text-slate-300 group-hover:text-purple-500 transition-colors" />
          </div>
        </div>
      </section>
      
      {/* DETAILS */}
      <section className="py-24 bg-white border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <StaggerContainer className="grid md:grid-cols-2 gap-12">
               <StaggerItem className="space-y-6">
                 <h2 className="text-3xl font-black">Tính năng chuyên sâu</h2>
                 {[1,2,3,4,5].map(i => (
                   <div key={i} className="flex items-start gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                     <CheckCircle2 className="w-6 h-6 text-purple-500 shrink-0" />
                     <div>
                       <div className="font-bold">Module {i} cao cấp</div>
                       <div className="text-sm text-slate-600">Được tinh chỉnh đặc biệt cho Trí tuệ nhân tạo (AI).</div>
                     </div>
                   </div>
                 ))}
               </StaggerItem>
               <StaggerItem className="bg-slate-900 rounded-3xl p-10 text-white flex flex-col justify-center">
                 <h2 className="text-3xl font-black mb-6">Sẵn sàng bắt đầu?</h2>
                 <p className="text-slate-400 mb-8">Hàng ngàn doanh nghiệp đã tin dùng kiến trúc Bento của chúng tôi.</p>
                 <Link href="/contact" className="py-4 bg-purple-500 text-white text-center font-bold rounded-xl hover:bg-purple-600 transition-colors">
                    Triển Khai Ngay
                 </Link>
               </StaggerItem>
            </StaggerContainer>
         </div>
      </section>
          <Phase5Extensions themeColor="purple" />

    </div>
  );
}