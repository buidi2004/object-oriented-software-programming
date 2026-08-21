'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Globe, Server, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Terminal, Clock, ShoppingCart, Activity,
  GitBranch, RefreshCw, Layers, ShieldCheck, ChevronDown,
  ChevronUp, Sparkles, Play, Code, FileCode, Sliders, Check, Copy
} from 'lucide-react';
import { SiNginx, SiReact, SiVuedotjs, SiNextdotjs, SiHtml5, SiGithub } from 'react-icons/si';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function StaticSitesServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Nginx Config Engine simulator
  const [spaFramework, setSpaFramework] = useState<'react' | 'nextjs' | 'html'>('react');
  const [brotliEnabled, setBrotliEnabled] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/static-sites/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load static site plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: 'c4f880e1-52b6-4313-a0b7-aa0fe24ed8ba',
      name: 'Static Starter',
      tier: 'Personal & Student Portfolio',
      workload: 'Trang cá nhân, Portfolio sinh viên, Landing Page sự kiện & HTML tĩnh',
      monthlyPrice: 0,
      yearlyPrice: 0,
      sites: '1 Website Tĩnh (HTML/CSS/JS/Vite Build)',
      bandwidth: '50 GB Băng Thông / tháng',
      storage: '1 GB NVMe Storage',
      customDomain: 'Subdomain *.senpages.vn Miễn phí',
      ttfb: '< 15 ms',
      features: [
        'Môi trường Container Nginx cô lập siêu nhẹ',
        'Tự động cấp chứng chỉ SSL HTTPS Let\'s Encrypt',
        'Upload mã nguồn trực tiếp qua Web Dashboard',
        'Tích hợp tính năng nén Brotli / Gzip tự động',
        'Hỗ trợ Single Page Application (SPA Routing Rewrite)'
      ],
      popular: false,
    },
    {
      id: '19d5647d-9d41-4436-a3e7-5e7f34c73d0e',
      name: 'Static Pro (Custom Domain)',
      tier: 'Agency, Business & SaaS Frontend',
      workload: 'Website Doanh nghiệp, Web App React/Vue/Next.js & Landing Page bán hàng',
      monthlyPrice: 49000,
      yearlyPrice: 49000 * 12 * 0.8,
      sites: '5 Websites Tĩnh Độc Lập',
      bandwidth: '500 GB Băng Thông Tốc Độ Cao',
      storage: '5 GB NVMe Gen4 Enterprise',
      customDomain: 'Gắn Tên Miền Riêng (Custom Domain) Không Giới Hạn',
      ttfb: '< 10 ms',
      features: [
        'Môi trường Container Nginx 128MB RAM chuyên dụng',
        'Gắn Custom Domain riêng biệt kèm Auto SSL HTTPS 100%',
        'Hỗ trợ Git Webhook tự động Re-deploy khi push code',
        'Bảo vệ chống tấn công DDoS L7 chuyên sâu',
        'Tốc độ tải trang đạt điểm 100/100 Google PageSpeed',
        'Hỗ trợ kỹ thuật 24/7 qua LiveChat & Ticket'
      ],
      popular: true,
    },
  ];

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      monthlyPrice: matchingDb?.monthlyPrice ?? dp.monthlyPrice,
      yearlyPrice: matchingDb?.yearlyPrice ?? dp.yearlyPrice,
    };
  });

  const handleOrder = async (plan: typeof plans[0]) => {
    const cycleMonths = billingCycle === 'yearly' ? 12 : 1;
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    await addItem(plan.id, cycleMonths, false, {
      name: `${plan.name} - ${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'}`,
      price: price,
      billingCycle: cycleMonths,
      type: 'vps',
      details: `${plan.sites} • ${plan.bandwidth}`
    });
    router.push('/cart');
  };

  const nginxSnippet = `# SEN CloudHost High-Performance Nginx Config
server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/static_sites/app_dist;
    index index.html;

    # Brotli Compression Level 11
    brotli ${brotliEnabled ? 'on' : 'off'};
    brotli_comp_level 11;
    brotli_types text/plain text/css application/javascript application/json image/svg+xml;

    # SPA Routing Fallback (Prevents 404 on Refresh)
    location / {
        ${spaFramework === 'html' ? 'try_files $uri $uri/ =404;' : 'try_files $uri $uri/ /index.html;'}
    }

    # Immutable Asset Cache Headers (1 Year)
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`;

  const faqs = [
    {
      q: 'Static Site Hosting hỗ trợ các loại mã nguồn và framework nào?',
      a: 'Hệ thống hỗ trợ toàn bộ các trang web tĩnh thuần (HTML/CSS/JavaScript), cũng như bản build sản phẩm (Static Export) của React, Vue.js, Angular, Next.js (Static Export), Nuxt.js, Astro, Svelte, Vite và Gatsby.'
    },
    {
      q: 'Làm thế nào để tải mã nguồn trang web lên máy chủ?',
      a: 'Bạn có 3 cách tải mã nguồn: 1) Kéo thả file .ZIP hoặc thư mục trực tiếp trên Web Dashboard; 2) Sử dụng Git Webhook để tự động cập nhật khi bạn push code lên GitHub/GitLab; 3) Kết nối qua SFTP / SSH để upload tệp siêu tốc.'
    },
    {
      q: 'Trang web React/Vue Single Page Application (SPA) có bị lỗi 404 khi F5 tải lại trang không?',
      a: 'Hoàn toàn không! Bảng điều khiển Nginx của SEN CloudHost tích hợp sẵn tính năng "SPA Fallback Rewrite (try_files $uri $uri/ /index.html)" giúp tất cả các đường dẫn Router của React/Vue hoạt động hoàn hảo mà không bị lỗi 404.'
    },
    {
      q: 'Tốc độ tải trang web tĩnh Nginx so với Web Hosting thông thường như thế nào?',
      a: 'Nginx Container chỉ phục vụ tệp tĩnh mà không cần chạy PHP/MySQL thông dịch nặng nề, kết hợp bộ nhớ đệm Cache-Control và nén Brotli giúp thời gian phản hồi (TTFB) chỉ dưới 15ms, tốc độ tải trang gần như tức thì.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-cyan-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: NGINX CONTAINER TELEMETRY */}
      <section className="relative pt-16 pb-20 border-b border-slate-800/80 overflow-hidden">
        {/* Technical Grid Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #06b6d4 1px, transparent 1px), linear-gradient(to bottom, #06b6d4 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-cyan-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Engineering Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                WEB ENGINE: ISOLATED NGINX CONTAINER
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline">
                TTFB LATENCY: <strong className="text-emerald-400 font-mono">&lt; 15ms</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>COMPRESSION: <strong className="text-cyan-400 font-mono">Brotli 11</strong></span>
              <span>CI/CD: <strong className="text-emerald-400 font-mono">Git Webhook Ready</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-mono">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                ULTRA LOW-LATENCY STATIC &amp; SPA HOSTING
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Lưu Trữ Web Tĩnh Trên{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 font-mono">
                  Container Nginx
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Thời gian phản hồi TTFB dưới 15ms, đạt điểm 100/100 Google PageSpeed. 
                Tự động hóa toàn bộ quy trình cấu hình Nginx SPA Rewrite, cấp phát SSL HTTPS và đồng bộ Git Webhook.
              </p>

              {/* Supported Tech Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiNginx className="w-4 h-4 text-emerald-500" />
                  <span>Nginx Engine v1.26</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiReact className="w-4 h-4 text-sky-400" />
                  <span>React / Vite SPA</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiNextdotjs className="w-4 h-4 text-white" />
                  <span>Next.js Export</span>
                </div>
              </div>

              {/* Quick Spec Details */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Routing Engine: <strong className="text-white">SPA try_files Fallback (No 404)</strong></span>
                  <span>SSL: <strong className="text-emerald-400">Auto Let&apos;s Encrypt</strong></span>
                </div>
                <div className="text-slate-400">
                  Compression: <span className="text-slate-300">Brotli 11 + Gzip (Giảm 80% dung lượng JS/CSS)</span>
                </div>
              </div>

            </div>

            {/* Right Nginx Config Engine Simulator */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0b1320] border border-slate-800 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">/etc/nginx/conf.d/site.conf</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    TEST PASSED
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 font-mono text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Preset:</span>
                    <button
                      onClick={() => setSpaFramework('react')}
                      className={`px-2.5 py-1 rounded-lg border ${spaFramework === 'react' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      React/Vite
                    </button>
                    <button
                      onClick={() => setSpaFramework('html')}
                      className={`px-2.5 py-1 rounded-lg border ${spaFramework === 'html' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      HTML Static
                    </button>
                  </div>

                  <button
                    onClick={() => setBrotliEnabled(!brotliEnabled)}
                    className="text-[11px] text-slate-400 hover:text-cyan-400 underline"
                  >
                    {brotliEnabled ? 'Brotli ON' : 'Brotli OFF'}
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-[#060a12] border border-slate-800/90 text-cyan-300 font-mono text-[11px] max-h-48 overflow-y-auto leading-relaxed whitespace-pre">
                  {nginxSnippet}
                </div>

                <div className="pt-2">
                  <a
                    href="#spec-matrix"
                    className="w-full py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
                  >
                    <span>XEM BẢNG CẤU HÌNH VÀ BÁO GIÁ</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. THREE CORE NGINX ARCHITECTURE SCHEMATICS */}
      <section className="py-24 bg-[#070b12] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950 text-cyan-400 text-xs font-mono mb-3 border border-cyan-800">
              <Zap className="w-3.5 h-3.5" />
              HIGH PERFORMANCE ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              3 Ưu Thế Của Container Nginx Cô Lập
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Được tinh chỉnh đặc thù cho website tĩnh và Single Page Applications (SPA).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Schematic 1: TTFB < 15ms */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>TIME TO FIRST BYTE (TTFB)</span>
                    <span className="text-emerald-400">&lt; 15MS</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>DNS Lookup</span>
                      <span className="text-sky-400">1.2 ms</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>TLS 1.3 Handshake</span>
                      <span className="text-emerald-400">3.8 ms</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Nginx Direct File Serve</span>
                      <span className="text-cyan-400 font-bold">4.5 ms</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Tốc Độ Tải Trang Tức Thì (TTFB &lt; 15ms)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Loại bỏ hoàn toàn tầng thông dịch PHP/Python/Database nặng nề. 
                  Nginx phục vụ tệp tĩnh trực tiếp từ bộ nhớ đệm RAM Cache và ổ cứng NVMe Gen4 với độ trễ cực thấp.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Google PageSpeed:</span>
                <strong className="text-emerald-400">100 / 100 Điểm Tối Đa</strong>
              </div>
            </div>

            {/* Schematic 2: SPA Rewrite Fallback */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>SPA TRY_FILES FALLBACK</span>
                    <span className="text-sky-400">NO 404 ERRORS</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>User F5 Reload /dashboard</span>
                      <span className="text-slate-400">Request URI</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Nginx try_files $uri</span>
                      <span className="text-emerald-400 font-bold">Rewrite /index.html</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>React Router Handles</span>
                      <span className="text-cyan-400 font-bold">Client Route Render</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Tương Thích Tuyệt Đối React &amp; Vue SPA</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tự động thiết lập luật định tuyến fallback Nginx chuẩn xác. 
                  Người dùng có thể thoải mái chia sẻ link con hoặc tải lại trang F5 mà không bao giờ gặp lỗi 404 Not Found.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Routing Support:</span>
                <strong className="text-sky-400">React, Vue, Angular, Svelte</strong>
              </div>
            </div>

            {/* Schematic 3: Git Webhook CI/CD */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ATOMIC GIT WEBHOOK CI/CD</span>
                    <span className="text-purple-400">ZERO DOWNTIME</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>git push origin main</span>
                      <span className="text-sky-400">GitHub / GitLab</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Webhook Dispatch</span>
                      <span className="text-emerald-400 font-bold">Re-sync Files</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Symlink Swap</span>
                      <span className="text-purple-400 font-bold">Instant &lt; 1s</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Tự Động Triển Khai Qua Git Webhook</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Kết nối trực tiếp repository GitHub/GitLab. Mỗi khi bạn đẩy commit mới, 
                  hệ thống sẽ tự động cập nhật bản build mới nhất lên website trong vòng vài giây mà không làm gián đoạn người dùng.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Deploy Speed:</span>
                <strong className="text-emerald-400">Tự động kích hoạt 0s</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. TECHNICAL SPECIFICATION MATRIX & PRICING */}
      <section id="spec-matrix" className="py-24 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950 text-cyan-400 text-xs font-mono mb-3 border border-cyan-800">
                <Sliders className="w-3.5 h-3.5" />
                STATIC SITE SPEC SHEET
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Bảng So Sánh Gói Nginx Static Sites
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-normal">
                Không giới hạn lượt truy cập, không nghẽn băng thông.
              </p>
            </div>

            {/* Billing Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#0c1322] border border-slate-800 font-mono text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Thanh toán Tháng
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Thanh toán Năm</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080d17] text-slate-400">
                    <th className="p-5 font-bold uppercase text-[11px] w-1/4">Thông Số Kỹ Thuật</th>
                    {plans.map((p) => {
                      const displayPrice = billingCycle === 'yearly' ? Math.round(p.yearlyPrice / 12) : p.monthlyPrice;
                      return (
                        <th key={p.id} className="p-5 text-white border-l border-slate-800/80 w-1/3">
                          <div className="text-sm font-extrabold text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-sans font-normal">{p.tier}</div>
                          <div className="text-lg font-black text-cyan-400 mt-2">
                            {displayPrice === 0 ? 'Miễn Phí' : `${displayPrice.toLocaleString('vi-VN')} đ/tháng`}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Số Lượng Website Độc Lập</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-white font-bold">{p.sites}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Băng Thông Hàng Tháng</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-cyan-400 font-bold">{p.bandwidth}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Dung Lượng NVMe Storage</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">{p.storage}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Tên Miền Riêng (Custom Domain)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-slate-200">{p.customDomain}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Thời Gian Phản Hồi (TTFB)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">{p.ttfb}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Nén Brotli 11 &amp; HTTP/3</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-slate-200">Tích hợp sẵn 100%</td>
                    ))}
                  </tr>
                  <tr className="bg-[#080d17]">
                    <td className="p-5 font-bold text-slate-400">Hành Động Khởi Tạo</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-5 border-l border-slate-800/60">
                        <button
                          onClick={() => handleOrder(p)}
                          className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            p.popular
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <span>Khởi Tạo Website Ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Câu Hỏi Thường Gặp Về Web Tĩnh Nginx</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST STATIC SITES FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0c1322] rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0d182e] via-[#091122] to-[#0d182e] p-8 sm:p-12 border border-cyan-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-cyan-950 border border-cyan-800 text-cyan-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              DEPLOY IN 60 SECONDS
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Khởi Tạo Website Tĩnh Nginx Tốc Độ Cao Ngay Hôm Nay
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Miễn phí trọn đời cho gói Starter hoặc nâng cấp gói Pro chỉ 49.000đ/tháng với tên miền riêng không giới hạn.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('spec-matrix');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs font-mono shadow-xl shadow-cyan-600/25 transition-all hover:scale-105"
              >
                Khởi Tạo Website Ngay
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono border border-slate-700 transition-all"
              >
                Tư Vấn Miễn Phí
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
