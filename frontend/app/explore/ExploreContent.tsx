'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { ArrowRight, Server, Shield, Globe, Cpu, Database, Zap, Lock, Terminal, Cloud, Activity } from 'lucide-react';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';

export default function ExploreContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // For Horizontal Scroll Section
  const horizontalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: horizontalProgress } = useScroll({
    target: horizontalRef,
    offset: ["start start", "end end"]
  });
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const xTransform = useTransform(horizontalProgress, [0, 1], ["0%", isMobile ? "0%" : "-75%"]);

  // Global smooth progress bar
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div ref={containerRef} className="min-h-[500vh] bg-black text-white font-sans selection:bg-white selection:text-black overflow-hidden relative">
      
      {/* Global Progress Bar */}
      <motion.div 
        className="fixed top-0 left-0 right-0 h-1 bg-white z-50 origin-left"
        style={{ scaleX }}
      />

      {/* 1. CINEMATIC HERO */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden px-6 lg:px-12">
        <motion.div 
          className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center"
          style={{ 
            opacity: useTransform(scrollYProgress, [0, 0.2], [0.4, 0]),
            scale: useTransform(scrollYProgress, [0, 0.2], [1, 1.2])
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-10" />
        
        <div className="relative z-20 max-w-6xl mx-auto text-center mt-20">
          <ScrollReveal animation="slide-up">
             <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-md mb-8">
               <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
               <span className="text-sm font-bold tracking-widest uppercase text-gray-300">Khám Phá Sức Mạnh </span>
             </div>
          </ScrollReveal>
          
          <h1 className="text-5xl md:text-7xl lg:text-9xl font-black tracking-tight mb-8 leading-[1.1]">
            <TypewriterText text="VƯỢT MỌI" speed={80} delay={0.5} /> <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-400 to-gray-700">
               <TypewriterText text="GIỚI HẠN." speed={80} delay={1.5} />
            </span>
          </h1>
          
          <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             transition={{ delay: 2.5, duration: 1 }}
             className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12 font-medium"
          >
             Cơ sở hạ tầng kiến tạo tương lai. Chúng tôi không chỉ cung cấp máy chủ, chúng tôi xây dựng đế chế số của bạn.
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
           initial={{ opacity: 0 }} 
           animate={{ opacity: 1 }} 
           transition={{ delay: 3 }}
           className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        >
           <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Cuộn để khám phá</span>
           <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent animate-pulse" />
        </motion.div>
      </section>

      {/* 2. DATA METRICS TYPEWRITER BLOCK */}
      <section className="py-32 px-6 lg:px-12 bg-zinc-950 border-y border-white/10 relative z-30">
         <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fade" className="text-center mb-20">
               <h2 className="text-4xl md:text-6xl font-black mb-6">Thông số ấn tượng</h2>
               <p className="text-xl text-gray-500 font-mono">Real-time system diagnostics</p>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-10">
               {/* Terminal Mockup */}
               <ScrollReveal animation="slide-right" className="bg-black border border-white/20 rounded-xl p-6 font-mono text-sm shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-full h-8 bg-zinc-900 flex items-center px-4 gap-2">
                     <div className="w-3 h-3 rounded-full bg-red-500"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                     <div className="w-3 h-3 rounded-full bg-green-500"></div>
                     <span className="ml-4 text-xs text-gray-500">root@cloudhost:~</span>
                  </div>
                  <div className="mt-8 space-y-4 text-green-400 h-[300px] overflow-hidden flex flex-col justify-center">
                     <div><span className="text-white">~</span> <TypewriterText text="./deploy-cluster.sh --scale=max" speed={20} delay={0.5} /></div>
                     <div><TypewriterText text="> Khởi tạo 1,000 node máy chủ..." speed={20} delay={1.5} /></div>
                     <div><TypewriterText text="> Kết nối VPC Network [OK]" speed={20} delay={2.5} /></div>
                     <div><TypewriterText text="> Băng thông 10 Tbps kích hoạt [OK]" speed={20} delay={3.5} /></div>
                     <div><TypewriterText text="> Thời gian hoàn thành: 30ms" speed={20} delay={4.5} /></div>
                     <div className="text-white font-bold animate-pulse">_</div>
                  </div>
               </ScrollReveal>

               {/* Metrics Grid */}
               <StaggerContainer className="grid grid-cols-2 gap-4">
                  {[
                     { value: "99.99%", label: "Uptime SLA", icon: Activity },
                     { value: "500+", label: "Gbps Anti-DDoS", icon: Shield },
                     { value: "< 1ms", label: "Network Latency", icon: Zap },
                     { value: "24/7", label: "L3 Support", icon: Terminal }
                  ].map((stat, i) => (
                     <StaggerItem key={i} className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center hover:bg-white hover:text-black transition-colors group cursor-default">
                        <stat.icon className="w-8 h-8 mb-4 text-gray-500 group-hover:text-black transition-colors" />
                        <div className="text-3xl lg:text-4xl font-black mb-2"><TypewriterText text={stat.value} speed={50} delay={2} /></div>
                        <div className="text-sm font-semibold uppercase tracking-wider text-gray-400 group-hover:text-gray-800">{stat.label}</div>
                     </StaggerItem>
                  ))}
               </StaggerContainer>
            </div>
         </div>
      </section>

      {/* 3. HORIZONTAL SCROLLING GALLERY */}
      <section ref={horizontalRef} className="md:h-[400vh] h-auto relative z-30">
         <div className="md:sticky md:top-0 md:h-screen h-auto flex flex-col justify-center overflow-hidden bg-black py-20">
            <div className="px-6 lg:px-12 mb-12">
               <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tight">Hạ tầng <br/><span className="text-gray-500">Quy mô lớn</span></h2>
            </div>
            
            <motion.div style={{ x: xTransform }} className="flex flex-col md:flex-row gap-8 px-6 lg:px-12 md:w-[400vw] w-full">
               {/* Card 1 */}
               <div className="w-full md:w-[45vw] lg:w-[35vw] shrink-0 h-[45vh] md:h-[60vh] relative rounded-3xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="Server 1"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-10 left-10 right-10">
                     <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center mb-6"><Server className="w-6 h-6"/></div>
                     <h3 className="text-3xl font-black mb-3">Bare-Metal Cấp Doanh Nghiệp</h3>
                     <p className="text-gray-300 text-lg">Máy chủ vật lý độc quyền với sức mạnh tính toán tuyệt đối, không chia sẻ tài nguyên.</p>
                  </div>
               </div>

               {/* Card 2 */}
               <div className="w-full md:w-[45vw] lg:w-[35vw] shrink-0 h-[45vh] md:h-[60vh] relative rounded-3xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="Server 2"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-10 left-10 right-10">
                     <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center mb-6"><Cpu className="w-6 h-6"/></div>
                     <h3 className="text-3xl font-black mb-3">Vi Xử Lý AMD EPYC™</h3>
                     <p className="text-gray-300 text-lg">Hệ thống chip xử lý đa luồng mạnh nhất thế giới, sẵn sàng cho các tác vụ AI & Big Data.</p>
                  </div>
               </div>

               {/* Card 3 */}
               <div className="w-full md:w-[45vw] lg:w-[35vw] shrink-0 h-[45vh] md:h-[60vh] relative rounded-3xl overflow-hidden group">
                  <img src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=2070&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="Server 3"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                  <div className="absolute bottom-10 left-10 right-10">
                     <div className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center mb-6"><Globe className="w-6 h-6"/></div>
                     <h3 className="text-3xl font-black mb-3">Mạng Lưới Toàn Cầu</h3>
                     <p className="text-gray-300 text-lg">Định tuyến BGP thông minh kết hợp hệ thống CDN tốc độ siêu cao tới mọi điểm chạm.</p>
                  </div>
               </div>

               {/* Card 4 */}
               <div className="w-full md:w-[45vw] lg:w-[35vw] shrink-0 h-[45vh] md:h-[60vh] relative rounded-3xl overflow-hidden group flex items-center justify-center bg-zinc-900">
                  <div className="text-center px-10">
                     <h3 className="text-4xl font-black mb-6">Trải nghiệm sức mạnh?</h3>
                     <Link href="/services" className="px-10 py-5 bg-white text-black rounded-full font-bold text-lg hover:scale-105 transition-transform inline-flex items-center gap-2">
                        Xem Bảng Giá <ArrowRight className="w-5 h-5"/>
                     </Link>
                  </div>
               </div>
            </motion.div>
         </div>
      </section>

      {/* 4. MEGA TIMELINE PARALLAX */}
      <section className="py-40 bg-zinc-950 relative z-30">
         <div className="max-w-6xl mx-auto px-6 lg:px-12 relative">
            <ScrollReveal animation="fade" className="text-center mb-32">
               <h2 className="text-5xl md:text-7xl font-black mb-6 uppercase">Kiến Trúc <br/> Bất Bại</h2>
               <p className="text-2xl text-gray-500 font-mono"><TypewriterText text="Zero-Downtime Deployment" speed={40} delay={0.5} /></p>
            </ScrollReveal>

            <div className="relative">
               {/* The Line */}
               <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 rounded-full overflow-hidden">
                  <motion.div 
                     className="absolute top-0 left-0 w-full bg-white origin-top"
                     style={{ 
                        height: useTransform(scrollYProgress, [0.4, 0.8], ["0%", "100%"]) 
                     }}
                  />
               </div>

               {/* Timeline Items */}
               {[
                  { title: "Bảo Mật Lớp 7 (WAF)", desc: "Phân tích và chặn đứng mọi request độc hại bằng AI ngay khi nó chạm vào biên mạng của chúng tôi. Bạn không bao giờ phải lo về SQL Injection hay XSS.", icon: Shield },
                  { title: "Lưu Trữ NVMe Phân Tán", desc: "Dữ liệu của bạn được nhân bản 3 lần theo thời gian thực trên các ổ cứng NVMe Gen4, mang lại tốc độ đọc ghi lên tới 7,000MB/s.", icon: Database },
                  { title: "Mạng LAN Private 100G", desc: "Giao tiếp nội bộ giữa các máy chủ diễn ra qua hệ thống mạng hoàn toàn độc lập với tốc độ 100 Gbps, không tính phí băng thông.", icon: Cloud },
                  { title: "Cách Ly Tài Nguyên Hoàn Toàn", desc: "Không dùng chung hạt nhân. Ảo hóa KVM đảm bảo CPU, RAM và Disk I/O của bạn được cô lập tuyệt đối khỏi các client khác.", icon: Lock }
               ].map((item, idx) => (
                  <ScrollReveal key={idx} animation={idx % 2 === 0 ? "slide-right" : "slide-left"} className="relative flex flex-col md:flex-row items-center justify-between mb-32 group">
                     <div className={`md:w-5/12 w-full pl-16 md:pl-0 ${idx % 2 === 0 ? 'md:text-right md:order-1' : 'md:text-left md:order-3'}`}>
                        <div className={`w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:bg-white group-hover:text-black transition-colors ${idx % 2 === 0 ? 'md:ml-auto' : ''}`}>
                           <item.icon className="w-8 h-8" />
                        </div>
                        <h3 className="text-3xl font-black mb-4 uppercase"><TypewriterText text={item.title} speed={30} delay={0.2} /></h3>
                        <p className="text-gray-400 text-lg leading-relaxed">{item.desc}</p>
                     </div>
                     <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-black border-4 border-white z-10 md:order-2 group-hover:scale-150 transition-transform duration-500 shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
                     <div className="md:w-5/12 hidden md:block md:order-1"></div>
                  </ScrollReveal>
               ))}
            </div>
         </div>
      </section>

      {/* 5. BENTO GRID */}
      <section className="py-32 px-6 lg:px-12 bg-black relative z-30 border-t border-white/10">
         <div className="max-w-7xl mx-auto">
            <ScrollReveal animation="fade" className="mb-20">
               <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight">Hệ sinh thái <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-700">Toàn diện.</span></h2>
            </ScrollReveal>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[300px]">
               {/* Large Card */}
               <StaggerItem className="md:col-span-2 md:row-span-2 relative rounded-3xl overflow-hidden bg-zinc-900 group border border-white/10 p-10 flex flex-col justify-end">
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "30px 30px" }}></div>
                  <h3 className="text-4xl font-black mb-4 relative z-10"><TypewriterText text="Quản trị tập trung" speed={40} delay={0.5} /></h3>
                  <p className="text-xl text-gray-400 relative z-10">Một trang Dashboard duy nhất để điều khiển hàng ngàn máy chủ, quản lý billing và ticket hỗ trợ.</p>
               </StaggerItem>

               {/* Tall Card */}
               <StaggerItem className="md:col-span-1 md:row-span-2 relative rounded-3xl overflow-hidden bg-white text-black p-10 flex flex-col">
                  <Activity className="w-12 h-12 mb-auto" />
                  <div>
                     <h3 className="text-2xl font-black mb-2 uppercase">Analytics</h3>
                     <p className="text-gray-600 font-medium">Giám sát tài nguyên CPU, RAM, Network thời gian thực tới từng giây.</p>
                  </div>
               </StaggerItem>

               {/* Small Card */}
               <StaggerItem className="md:col-span-1 relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 p-8 flex items-center justify-center text-center">
                  <div>
                     <div className="text-5xl font-black mb-2"><TypewriterText text="24/7" speed={50} delay={1} /></div>
                     <div className="text-gray-400 font-bold uppercase tracking-wider">Hỗ trợ kỹ thuật</div>
                  </div>
               </StaggerItem>

               {/* Wide Card */}
               <StaggerItem className="md:col-span-1 relative rounded-3xl overflow-hidden bg-blue-600 p-8 flex flex-col justify-between group cursor-pointer hover:bg-blue-700 transition-colors">
                  <Zap className="w-10 h-10 text-white" />
                  <div>
                     <h3 className="text-xl font-bold text-white mb-1">Scale up 60s</h3>
                     <div className="flex items-center gap-2 font-bold text-blue-200 group-hover:text-white transition-colors">Khám phá <ArrowRight className="w-4 h-4"/></div>
                  </div>
               </StaggerItem>
            </StaggerContainer>
         </div>
      </section>

      {/* 6. CTA */}
      <section className="py-40 px-6 lg:px-12 bg-white text-black text-center relative z-30">
        <ScrollReveal animation="zoom-in" className="max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] uppercase tracking-tighter">
             Kiến tạo <br/> Tương lai.
          </h2>
          <p className="text-2xl text-gray-600 mb-12 max-w-2xl mx-auto font-medium">
            Gia nhập cùng hàng ngàn kỹ sư và doanh nghiệp đang định hình lại kỷ nguyên số với CloudHost.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-4 px-12 py-6 bg-black text-white font-black text-xl hover:scale-110 transition-transform rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
          >
            Bắt đầu trải nghiệm ngay <ArrowRight className="w-8 h-8" />
          </Link>
        </ScrollReveal>
      </section>
      
    </div>
  );
}
