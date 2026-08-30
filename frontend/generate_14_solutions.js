const fs = require('fs');
const path = require('path');

const newSolutions = [
  // Let's use Bento for healthcare
  { slug: 'healthcare', name: 'Y tế & Chăm sóc sức khỏe', color: 'red', icon: 'HeartPulse', layout: 'bento' },
  // Let's use Cards for education
  { slug: 'education', name: 'Trường học & E-Learning', color: 'emerald', icon: 'GraduationCap', layout: 'cards' }
];

const bentoTemplate = (t) => `'use client';
import React from 'react';
import Link from 'next/link';
import { ${t.icon}, ArrowRight, CheckCircle2, Maximize, TrendingUp, Zap } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { Phase5Extensions } from '@/src/components/solutions/Phase5Extensions';
import { motion } from 'framer-motion';

export default function ${t.slug.charAt(0).toUpperCase() + t.slug.slice(1)}SolutionPage() {
  return (
    <div className="min-h-screen bg-${t.color}-50/30 overflow-hidden">
      {/* HERO */}
      <section className="pt-24 pb-20 bg-white border-b border-${t.color}-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-${t.color}-100 text-${t.color}-700 text-xs font-bold uppercase mb-6">
              <${t.icon} className="w-4 h-4" /> ${t.name}
            </span>
            <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6">
              Hiệu suất tối đa.<br/>
              <span className="text-${t.color}-600">
                <TypewriterText text="Kiến trúc Bento Grid Độc Bản." speed={50} delay={0.2} />
              </span>
            </h1>
          </ScrollReveal>
        </div>
      </section>

      {/* BENTO GRID */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal animation="fade">
          <h2 className="text-3xl font-black mb-12">Hệ sinh thái ${t.name}</h2>
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
          <div className="relative rounded-3xl overflow-hidden bg-${t.color}-500 group flex items-center justify-center p-8 text-center text-white">
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            <div className="relative z-10">
              <Zap className="w-16 h-16 mx-auto mb-4 opacity-80 group-hover:scale-125 transition-transform" />
              <h3 className="text-2xl font-bold">Siêu Tốc Độ</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative rounded-3xl overflow-hidden bg-white border border-slate-200 p-8 shadow-xl group">
             <div className="text-${t.color}-600 font-bold mb-4">THỐNG KÊ</div>
             <div className="text-6xl font-black text-slate-900 mb-2 group-hover:text-${t.color}-600 transition-colors">99.99%</div>
             <p className="text-slate-500 font-medium">Uptime Guarantee</p>
          </div>

          {/* Card 4 - Wide */}
          <div className="md:col-span-2 relative rounded-3xl overflow-hidden bg-slate-100 group p-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Mở rộng linh hoạt</h3>
              <div className="text-${t.color}-600 font-mono"><TypewriterText text="Auto-scaling: ACTIVE" speed={40} delay={1}/></div>
            </div>
            <TrendingUp className="w-20 h-20 text-slate-300 group-hover:text-${t.color}-500 transition-colors" />
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
                   <div key={i} className="flex items-start gap-4 bg-${t.color}-50 p-4 rounded-xl border border-${t.color}-100">
                     <CheckCircle2 className="w-6 h-6 text-${t.color}-500 shrink-0" />
                     <div>
                       <div className="font-bold">Module {i} cao cấp</div>
                       <div className="text-sm text-slate-600">Được tinh chỉnh đặc biệt cho ${t.name}.</div>
                     </div>
                   </div>
                 ))}
               </StaggerItem>
               <StaggerItem className="bg-slate-900 rounded-3xl p-10 text-white flex flex-col justify-center">
                 <h2 className="text-3xl font-black mb-6">Sẵn sàng bắt đầu?</h2>
                 <p className="text-slate-400 mb-8">Hàng ngàn doanh nghiệp đã tin dùng kiến trúc Bento của chúng tôi.</p>
                 <Link href="/contact" className="py-4 bg-${t.color}-500 text-white text-center font-bold rounded-xl hover:bg-${t.color}-600 transition-colors">
                    Triển Khai Ngay
                 </Link>
               </StaggerItem>
            </StaggerContainer>
         </div>
      </section>

      <Phase5Extensions themeColor="${t.color}" />
    </div>
  );
}`;

const cardsTemplate = (t) => `'use client';
import React from 'react';
import Link from 'next/link';
import { ${t.icon}, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { Phase5Extensions } from '@/src/components/solutions/Phase5Extensions';
import { motion } from 'framer-motion';

export default function ${t.slug.charAt(0).toUpperCase() + t.slug.slice(1)}SolutionPage() {
  return (
    <div className="min-h-screen bg-slate-100 overflow-hidden">
      {/* HERO */}
      <section className="pt-32 pb-24 text-center max-w-5xl mx-auto px-4">
        <ScrollReveal animation="slide-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-wider mb-8 shadow-sm">
             <${t.icon} className="w-5 h-5 text-${t.color}-500" /> Giải pháp tối ưu
          </div>
          <h1 className="text-5xl sm:text-7xl font-black text-slate-900 mb-6 tracking-tight">
            ${t.name} <br/>
            <span className="text-${t.color}-600">
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
                   <div className="absolute top-0 right-0 w-32 h-32 bg-${t.color}-500/10 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700"></div>
                   
                   <div>
                     <div className="w-16 h-16 rounded-2xl bg-${t.color}-50 flex items-center justify-center mb-8 border border-${t.color}-100">
                       <span className="text-2xl font-black text-${t.color}-600">0{i}</span>
                     </div>
                     <h3 className="text-3xl font-black text-slate-900 mb-4 group-hover:text-${t.color}-600 transition-colors">Giai Đoạn {i}</h3>
                     <p className="text-slate-600 text-lg leading-relaxed">
                        Thiết kế dạng thẻ cuộn ngang (Horizontal/Cards) cho phép nhồi nhét cực nhiều thông tin nhưng không làm trang quá dài. Người dùng cuộn dọc nhưng mắt nhìn theo chiều ngang.
                     </p>
                   </div>
                   
                   <div className="flex items-center gap-2 text-${t.color}-600 font-bold group-hover:translate-x-2 transition-transform cursor-pointer">
                      Khám phá thêm <ArrowRightCircle className="w-6 h-6" />
                   </div>
                </StaggerItem>
              ))}

           </StaggerContainer>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="py-24 bg-${t.color}-600 text-white text-center">
         <ScrollReveal animation="fade">
            <h2 className="text-4xl font-black mb-8">Triển khai ${t.name} ngay</h2>
            <Link href="/contact" className="px-10 py-4 bg-white text-${t.color}-600 font-bold rounded-xl shadow-lg hover:bg-slate-50 transition-colors">
               Liên hệ tư vấn
            </Link>
         </ScrollReveal>
      </section>

      <Phase5Extensions themeColor="${t.color}" />
    </div>
  );
}`;

newSolutions.forEach(s => {
  const dir = path.join(__dirname, 'app/solutions', s.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  let content = '';
  if (s.layout === 'bento') content = bentoTemplate(s);
  else if (s.layout === 'cards') content = cardsTemplate(s);
  
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log(`Generated Layout ${s.layout.toUpperCase()} for ${s.slug}`);
});
