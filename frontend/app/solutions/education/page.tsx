'use client';
import React from 'react';
import Link from 'next/link';
import { GraduationCap, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { Phase5Extensions } from '@/src/components/solutions/Phase5Extensions';
import { motion } from 'framer-motion';

export default function EducationSolutionPage() {
  return (
    <div className="min-h-screen bg-slate-100 overflow-hidden">
      {/* HERO */}
      <section className="pt-32 pb-24 text-center max-w-5xl mx-auto px-4">
        <ScrollReveal animation="slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-wider mb-8 shadow-sm">
             <GraduationCap className="w-5 h-5 text-emerald-500" /> Giải pháp tối ưu
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 mb-6 tracking-tight">
            Trường học & E-Learning <br/>
            <span className="text-emerald-600">
              <TypewriterText text="Dạng thẻ trượt đa chiều" speed={40} delay={0.2} />
            </span>
          </h1>
        </ScrollReveal>
      </section>

      {/* HORIZONTAL CARDS SIMULATION (Wrapped Flex) */}
      <section className="py-12 pb-32">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
           <StaggerContainer className="flex flex-wrap lg:flex-nowrap gap-8 overflow-x-hidden justify-center lg:justify-start lg:overflow-x-auto pb-12 snap-x snap-mandatory">
              
              {[1, 2, 3, 4].map((i) => (
                <StaggerItem key={i} className="shrink-0 w-full md:w-[45vw] lg:w-[30vw] h-[500px] bg-white rounded-3xl p-8 shadow-xl border border-slate-200 snap-center relative group overflow-hidden flex flex-col justify-between">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
                   
                   <div>
                     <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-8 border border-emerald-100">
                       <span className="text-2xl font-black text-emerald-600">0{i}</span>
                     </div>
                     <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-emerald-600 transition-colors">Giai Đoạn {i}</h3>
                     <p className="text-slate-600 text-lg leading-relaxed">
                        Thiết kế dạng thẻ cuộn ngang (Horizontal/Cards) cho phép nhồi nhét cực nhiều thông tin nhưng không làm trang quá dài. Người dùng cuộn dọc nhưng mắt nhìn theo chiều ngang.
                     </p>
                   </div>
                   
                   <div className="flex items-center gap-2 text-emerald-600 font-bold group-hover:translate-x-2 transition-transform cursor-pointer">
                      Khám phá thêm <ArrowRightCircle className="w-6 h-6" />
                   </div>
                </StaggerItem>
              ))}

           </StaggerContainer>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-24 bg-emerald-600 text-white text-center">
         <ScrollReveal animation="fade">
            <h2 className="text-4xl font-black mb-8">Triển khai Trường học & E-Learning ngay</h2>
            <Link href="/contact" className="px-10 py-4 bg-white text-emerald-600 font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
               Liên hệ tư vấn
            </Link>
         </ScrollReveal>
      </section>

      <Phase5Extensions themeColor="emerald" />
    </div>
  );
}