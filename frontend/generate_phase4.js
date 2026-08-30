const fs = require('fs');
const path = require('path');

const solutions = [
  // Bento
  { slug: 'ecommerce', name: 'Thương mại điện tử', color: 'pink', icon: 'ShoppingCart', layout: 'bento' },
  { slug: 'saas', name: 'SaaS Providers', color: 'emerald', icon: 'Layers', layout: 'bento' },
  { slug: 'ai', name: 'Trí tuệ nhân tạo (AI)', color: 'purple', icon: 'Cpu', layout: 'bento' },
  
  // ZigZag
  { slug: 'enterprise', name: 'Giải pháp Enterprise', color: 'slate', icon: 'Server', layout: 'zigzag' },
  { slug: 'fintech', name: 'Fintech & Ngân hàng', color: 'blue', icon: 'Shield', layout: 'zigzag' },
  { slug: 'sme', name: 'Doanh nghiệp SME', color: 'blue', icon: 'Building2', layout: 'zigzag' },

  // Masonry
  { slug: 'gaming', name: 'Game Studio', color: 'purple', icon: 'Gamepad2', layout: 'masonry' },
  { slug: 'media', name: 'Media & Streaming', color: 'pink', icon: 'Globe', layout: 'masonry' },
  { slug: 'agency', name: 'Agency & Developer', color: 'emerald', icon: 'Code2', layout: 'masonry' },

  // Cards/Horizontal
  { slug: 'security', name: 'Bảo mật (Security)', color: 'red', icon: 'ShieldCheck', layout: 'cards' },
  { slug: 'migration', name: 'Cloud Migration', color: 'orange', icon: 'ArrowLeftRight', layout: 'cards' },
  { slug: 'student', name: 'Giải pháp Sinh viên', color: 'amber', icon: 'BookOpen', layout: 'cards' }
];

const bentoTemplate = (t) => `'use client';
import React from 'react';
import Link from 'next/link';
import { ${t.icon}, ArrowRight, CheckCircle2, Maximize, TrendingUp, Zap } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
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
    </div>
  );
}`;

const zigzagTemplate = (t) => `'use client';
import React from 'react';
import Link from 'next/link';
import { ${t.icon}, Target, LayoutDashboard, Fingerprint } from 'lucide-react';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { motion } from 'framer-motion';

export default function ${t.slug.charAt(0).toUpperCase() + t.slug.slice(1)}SolutionPage() {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden">
      {/* HERO */}
      <section className="pt-24 pb-32 text-center max-w-4xl mx-auto px-4">
        <ScrollReveal animation="fade">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-xl flex items-center justify-center mb-8 border border-slate-100">
            <${t.icon} className="w-10 h-10 text-${t.color}-500" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 mb-6">
            Giải pháp chuyên sâu <br/>
            <span className="text-${t.color}-600">
              <TypewriterText text="${t.name}" speed={50} delay={0.2} />
            </span>
          </h1>
          <p className="text-xl text-slate-600 mb-10">Thiết kế kể chuyện (Storytelling Zig-Zag Layout) giúp bạn dễ dàng theo dõi từng tính năng siêu việt của hệ thống.</p>
        </ScrollReveal>
      </section>

      {/* ZIG ZAG 1 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal animation="slide-right">
              <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] relative group">
                <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="zigzag1"/>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="slide-left">
              <div className="w-12 h-12 bg-${t.color}-100 rounded-full flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-${t.color}-600" />
              </div>
              <h2 className="text-3xl font-black mb-4">Độ Chính Xác Tuyệt Đối</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Mỗi thao tác xử lý trong <span className="font-bold">${t.name}</span> đều được ghi nhận với độ trễ bằng 0. Hoàn hảo cho các tác vụ mang tính chất thời gian thực.
              </p>
              <div className="font-mono text-${t.color}-600 bg-${t.color}-50 p-4 rounded-lg border border-${t.color}-100">
                <TypewriterText text="> Processing data stream... OK!" speed={30} delay={1} />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ZIG ZAG 2 */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal animation="slide-right" className="order-2 md:order-1">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6">
                <Fingerprint className="w-6 h-6 text-${t.color}-400" />
              </div>
              <h2 className="text-3xl font-black mb-4">Bảo Mật Kép (Dual-layer)</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                Được bảo vệ bởi 2 lớp mã hóa vật lý và phần mềm. Dữ liệu của hệ thống <span className="font-bold">${t.name}</span> được an toàn trước mọi rủi ro xâm nhập.
              </p>
              <ul className="space-y-4 font-mono text-sm text-slate-300">
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> Encryption at Rest</li>
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> TLS 1.3 Transport</li>
                <li className="flex items-center gap-3"><span className="text-green-500">✔</span> WAF L7 Protection</li>
              </ul>
            </ScrollReveal>
            <ScrollReveal animation="slide-left" className="order-1 md:order-2">
              <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] relative group border border-slate-700">
                <img src="https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" alt="zigzag2"/>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ZIG ZAG 3 */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <ScrollReveal animation="slide-up">
              <div className="rounded-3xl overflow-hidden shadow-2xl h-[400px] relative group">
                <img src="https://images.unsplash.com/photo-1551434678-e076c223a692?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="zigzag3"/>
              </div>
            </ScrollReveal>
            <ScrollReveal animation="slide-up" delay={0.2}>
              <div className="w-12 h-12 bg-${t.color}-100 rounded-full flex items-center justify-center mb-6">
                <LayoutDashboard className="w-6 h-6 text-${t.color}-600" />
              </div>
              <h2 className="text-3xl font-black mb-4">Giao Diện Quản Trị Trực Quan</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Tất cả thông số được thống kê realtime trên một Dashboard duy nhất.
              </p>
              <Link href="/contact" className="inline-flex items-center gap-2 px-8 py-4 bg-${t.color}-600 text-white font-bold rounded-xl shadow-lg hover:bg-${t.color}-700 transition-all">
                Đăng ký trải nghiệm <ArrowRight className="w-5 h-5"/>
              </Link>
            </ScrollReveal>
          </div>
        </div>
      </section>
    </div>
  );
}`;

const masonryTemplate = (t) => `'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ${t.icon}, Compass, Zap } from 'lucide-react';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ${t.slug.charAt(0).toUpperCase() + t.slug.slice(1)}SolutionPage() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 2000], [0, -300]);
  const y2 = useTransform(scrollY, [0, 2000], [0, 300]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-slate-300 overflow-hidden selection:bg-${t.color}-500 selection:text-white">
      {/* HERO */}
      <section className="relative h-[80vh] flex items-center justify-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-${t.color}-900/30 to-[#0a0a0a]"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <ScrollReveal animation="zoom-in">
            <${t.icon} className="w-20 h-20 mx-auto text-${t.color}-500 mb-6 drop-shadow-[0_0_20px_rgba(var(--color-${t.color}-500),0.8)]" />
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 uppercase tracking-widest">
              ${t.name}
            </h1>
            <div className="text-xl text-${t.color}-400 font-mono">
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
              <div className="rounded-3xl overflow-hidden bg-${t.color}-900/20 border border-${t.color}-900/50 p-8">
                 <div className="text-6xl font-black text-${t.color}-500 mb-4">01</div>
                 <h3 className="text-2xl font-bold text-white mb-3">Tốc Độ Tối Đa</h3>
                 <p className="text-slate-400">Hiệu ứng scroll khác tốc độ tạo chiều sâu 3D (Parallax) cho trang web.</p>
              </div>
              <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8">
                 <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop" className="w-full rounded-2xl mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
              </div>
           </motion.div>

           {/* Column 2 - Moves Down (or slower) */}
           <motion.div style={{ y: y2 }} className="space-y-8 pb-20 -mt-64">
              <div className="rounded-3xl overflow-hidden bg-${t.color}-500 p-10 text-white shadow-[0_0_40px_rgba(var(--color-${t.color}-500),0.3)]">
                 <Compass className="w-12 h-12 mb-6 opacity-80" />
                 <h3 className="text-3xl font-black mb-4">Khám Phá Mới</h3>
                 <p className="text-${t.color}-100 text-lg">Giao diện này rất thích hợp cho những nội dung mang tính sáng tạo, gaming, hoặc showcase sản phẩm.</p>
              </div>
              <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8">
                 <img src="https://images.unsplash.com/photo-1614064641913-662f2eb71f28?q=80&w=800&auto=format&fit=crop" className="w-full rounded-2xl mb-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
                 <h3 className="text-2xl font-bold text-white mb-3">Mở Rộng Không Giới Hạn</h3>
                 <p className="text-slate-400">Masonry layout tự động sắp xếp các khối tin vừa khít nhau.</p>
              </div>
              <div className="rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-8">
                 <div className="text-6xl font-black text-white mb-4">02</div>
                 <h3 className="text-2xl font-bold text-${t.color}-500 mb-3">Hiệu Suất Cao</h3>
                 <p className="text-slate-400">Dù nhiều hình ảnh, React và Framer Motion vẫn đảm bảo 60FPS.</p>
              </div>
           </motion.div>
           
        </div>
      </section>
      
      {/* CTA */}
      <section className="py-32 bg-${t.color}-950 text-center relative z-20">
         <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-4xl font-black text-white mb-8">Bắt Đầu Trải Nghiệm ${t.name}</h2>
            <Link href="/contact" className="inline-block px-12 py-5 bg-${t.color}-500 text-white font-bold rounded-full hover:bg-${t.color}-400 transition-colors shadow-[0_0_20px_rgba(var(--color-${t.color}-500),0.5)]">
               Khởi Tạo Ngay
            </Link>
         </div>
      </section>
    </div>
  );
}`;

const cardsTemplate = (t) => `'use client';
import React from 'react';
import Link from 'next/link';
import { ${t.icon}, ArrowRight, ArrowRightCircle } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
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
    </div>
  );
}`;

solutions.forEach(s => {
  const dir = path.join(__dirname, 'app/solutions', s.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  let content = '';
  if (s.layout === 'bento') content = bentoTemplate(s);
  else if (s.layout === 'zigzag') content = zigzagTemplate(s);
  else if (s.layout === 'masonry') content = masonryTemplate(s);
  else if (s.layout === 'cards') content = cardsTemplate(s);
  
  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log(`Generated Layout ${s.layout.toUpperCase()} for ${s.slug}`);
});
