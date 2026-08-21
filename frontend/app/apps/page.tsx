'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Boxes, Search, Zap, CheckCircle2, ArrowRight, 
  Globe, Server, Shield, Cpu, ExternalLink, Play,
  DownloadCloud, Layers, Activity, ChevronDown, ChevronUp,
  Sparkles, Terminal, HardDrive, Lock, Sliders, Check, Copy, Radio
} from 'lucide-react';
import {
  SiWordpress,
  SiGhost,
  SiNextcloud,
  SiN8N,
  SiDocker,
  SiOllama,
  SiStrapi,
  SiAdminer,
} from 'react-icons/si';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useUIStore } from '@/src/store/useUIStore';

export default function AppMarketplacePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setAuthModal } = useUIStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const apps = [
    {
      id: 'wordpress',
      name: 'WordPress CMS',
      category: 'cms',
      description: 'Nền tảng CMS hàng đầu thế giới tích hợp sẵn LiteSpeed Web Server, PHP 8.3 & MariaDB. Tối ưu 100/100 PageSpeed.',
      tag: 'CMS & Website',
      version: 'v6.5 Enterprise',
      Logo: SiWordpress,
      brandColor: '#21759B',
      port: '80 / 443',
      specs: '1 vCPU • 1GB RAM',
    },
    {
      id: 'ghost',
      name: 'Ghost CMS Pro',
      category: 'cms',
      description: 'Nền tảng xuất bản nội dung, newsletter & blog hiện đại viết bằng Node.js. Siêu tốc và tối ưu chuẩn SEO.',
      tag: 'Blogging & News',
      version: 'v5.82 Node.js',
      Logo: SiGhost,
      brandColor: '#FFFFFF',
      port: '2368',
      specs: '1 vCPU • 1GB RAM',
    },
    {
      id: 'nextcloud',
      name: 'Nextcloud Hub',
      category: 'tools',
      description: 'Đám mây lưu trữ dữ liệu riêng tư chuẩn Enterprise, đồng bộ ảnh, danh bạ, tài liệu văn phòng và bảo mật E2EE.',
      tag: 'Lưu trữ riêng tư',
      version: 'v28.0 Enterprise',
      Logo: SiNextcloud,
      brandColor: '#0082C9',
      port: '8080',
      specs: '2 vCPU • 2GB RAM',
    },
    {
      id: 'n8n',
      name: 'n8n Workflow Automation',
      category: 'tools',
      description: 'Công cụ tự động hóa quy trình làm việc kéo thả mã nguồn mở kết nối hơn 400+ ứng dụng & AI LLM Nodes.',
      tag: 'Tự động hóa & AI',
      version: 'v1.38 AI Node',
      Logo: SiN8N,
      brandColor: '#EA4B71',
      port: '5678',
      specs: '1 vCPU • 2GB RAM',
    },
    {
      id: 'docker',
      name: 'Docker CE & Portainer',
      category: 'dev',
      description: 'Môi trường Docker Container Engine cài sẵn Portainer GUI quản lý container, volumes và stacks trực quan.',
      tag: 'DevOps & Container',
      version: 'v26.0 / v2.20',
      Logo: SiDocker,
      brandColor: '#2496ED',
      port: '9000 / 9443',
      specs: '1 vCPU • 1GB RAM',
    },
    {
      id: 'ollama',
      name: 'Ollama AI Server (LLMs)',
      category: 'ai',
      description: 'Chạy các mô hình ngôn ngữ lớn Llama 3, Mistral, Gemma, Phi-3 cục bộ riêng tư với REST API tương thích OpenAI.',
      tag: 'AI & Machine Learning',
      version: 'v0.1.32 API',
      Logo: SiOllama,
      brandColor: '#FFFFFF',
      port: '11434',
      specs: '4 vCPU • 8GB RAM',
    },
    {
      id: 'strapi',
      name: 'Strapi Headless CMS',
      category: 'cms',
      description: 'Headless CMS mã nguồn mở số 1 cho React, Vue, Next.js và Mobile Apps với REST & GraphQL API tự động.',
      tag: 'Headless CMS',
      version: 'v4.24 GraphQL',
      Logo: SiStrapi,
      brandColor: '#4945FF',
      port: '1337',
      specs: '2 vCPU • 2GB RAM',
    },
    {
      id: 'adminer',
      name: 'Adminer DB Manager',
      category: 'dev',
      description: 'Trình quản trị cơ sở dữ liệu MySQL, PostgreSQL, SQLite siêu nhẹ chỉ 1 file PHP an toàn và tốc độ.',
      tag: 'Database GUI',
      version: 'v4.8.1 Secure',
      Logo: SiAdminer,
      brandColor: '#F46E26',
      port: '8080',
      specs: '0.5 vCPU • 512MB RAM',
    },
  ];

  const filteredApps = apps.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) || 
                          app.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleInstall = (appId: string) => {
    if (!user) {
      setAuthModal(true, 'login');
      return;
    }
    router.push(`/dashboard/vps-instances?install=${appId}`);
  };

  const faqs = [
    {
      q: 'Tính năng 1-Click App Installer hoạt động như thế nào?',
      a: 'Khi bạn chọn một ứng dụng và bấm Cài đặt, hệ thống CloudHost sẽ tự động cấp phát một máy chủ ảo cô lập, cài đặt hệ điều hành Linux (Ubuntu/Debian), tự động cấu hình Nginx Reverse Proxy, Database, cấp phát chứng chỉ SSL HTTPS và bàn giao thông tin đăng nhập quản trị trong vòng 60 giây.'
    },
    {
      q: 'Tôi có thể tùy biến cấu hình hoặc cài thêm gói phần mềm khác không?',
      a: 'Hoàn toàn được! Bạn nhận toàn quyền truy cập Root SSH vào máy chủ chứa ứng dụng, có thể tùy ý sửa file cấu hình, cài đặt thêm module hoặc kết nối cơ sở dữ liệu bên ngoài.'
    },
    {
      q: 'Các bản vá lỗi và cập nhật phiên bản mới được xử lý ra sao?',
      a: 'Mỗi ứng dụng được đóng gói chuẩn Container / Native Systemd Service cho phép bạn cập nhật lên phiên bản mới chỉ bằng 1 câu lệnh hoặc 1 nút bấm trên Web Dashboard mà không làm hỏng dữ liệu cũ.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: 1-CLICK MARKETPLACE TELEMETRY */}
      <section className="relative pt-16 pb-20 border-b border-slate-800/80 overflow-hidden">
        {/* Technical Grid Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #6366f1 1px, transparent 1px), linear-gradient(to bottom, #6366f1 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-indigo-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Boxes className="w-3.5 h-3.5 text-indigo-400" />
                APP MARKETPLACE: 1-CLICK DOCKER &amp; NATIVE ENGINE
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline">
                DEPLOY SPEED: <strong className="text-emerald-400 font-mono">&lt; 60 Giây Tự Động</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>SSL HTTPS: <strong className="text-emerald-400 font-mono">Auto Let&apos;s Encrypt</strong></span>
              <span>ACCESS: <strong className="text-white font-mono">Root SSH 100%</strong></span>
            </div>
          </div>

          <div className="text-center max-w-4xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-300 text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              1-CLICK AUTOMATED APP PROVISIONING
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
              Triển Khai Ứng Dụng Trong{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 font-mono">
                60 Giây Với 1-Click
              </span>
            </h1>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
              Không cần gõ dòng lệnh phức tạp. Tự động cấp phát container độc lập, thiết lập Nginx Reverse Proxy, 
              kích hoạt SSL HTTPS và cấu hình cơ sở dữ liệu hoàn chỉnh.
            </p>

            {/* Search Box */}
            <div className="max-w-xl mx-auto relative pt-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm ứng dụng (WordPress, Docker, Nextcloud, Ollama AI...)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-[#0c1322] border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-indigo-500 shadow-xl transition-all"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 font-mono text-xs">
              {[
                { id: 'all', label: 'Tất Cả Ứng Dụng' },
                { id: 'cms', label: 'CMS & Website' },
                { id: 'ai', label: 'AI & Machine Learning' },
                { id: 'tools', label: 'Lưu Trữ & Tự Động Hóa' },
                { id: 'dev', label: 'Công Cụ DevOps' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl border transition-all ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md shadow-indigo-600/20 font-bold'
                      : 'bg-[#0e1627] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 2. APPS GRID */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="p-6 rounded-2xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between hover:border-indigo-500/60 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#060a12] border border-slate-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <app.Logo className="w-7 h-7" style={{ color: app.brandColor }} />
                  </div>
                  <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-800/60 text-indigo-400 text-[10px] font-mono font-bold">
                    {app.version}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors font-mono">
                  {app.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-6 leading-relaxed font-normal">
                  {app.description}
                </p>
              </div>

              <div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-400 mb-4 pt-3 border-t border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Khuyến nghị:</span>
                    <span className="text-slate-300 font-bold">{app.specs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Port mặc định:</span>
                    <span className="text-indigo-400 font-bold">{app.port}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleInstall(app.id)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Cài Đặt 1-Click Ngay</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. THREE CORE APPLICATION PROVISIONING SCHEMATICS */}
      <section className="py-24 bg-[#070b12] border-t border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-950 text-indigo-400 text-xs font-mono mb-3 border border-indigo-800">
              <Zap className="w-3.5 h-3.5" />
              1-CLICK CONTAINER ENGINE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              3 Ưu Thế Của Hạ Tầng 1-Click Installer
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Được tự động hóa từ hạ tầng phần cứng tới tầng mạng và chứng chỉ bảo mật.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Schematic 1: 60s Provisioning Flow */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>60S AUTO-PROVISIONING FLOW</span>
                    <span className="text-emerald-400">READY TO USE</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>1. Cloud-Init OS Setup</span>
                      <span className="text-sky-400">Ubuntu 24.04 LTS</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>2. Container Compose Run</span>
                      <span className="text-indigo-400 font-bold">App Stack Injected</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>3. Credential Dispatch</span>
                      <span className="text-emerald-400 font-bold">Root &amp; Web Login</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Khởi Tạo Trọn Gói Trong 60 Giây</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tự động biên dịch cấu hình, khởi tạo database và phân quyền bảo mật chỉ trong 1 phút, 
                  bàn giao đầy đủ link đăng nhập admin và mật khẩu ngẫu nhiên an toàn.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Setup Duration:</span>
                <strong className="text-emerald-400">&lt; 60 Giây Hoàn Tất</strong>
              </div>
            </div>

            {/* Schematic 2: Reverse Proxy & Auto SSL */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>NGINX REVERSE PROXY &amp; SSL</span>
                    <span className="text-sky-400">AUTO-HTTPS</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Port Forwarding</span>
                      <span className="text-slate-300">Internal Port to 443</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>SSL Auto-Renewal</span>
                      <span className="text-emerald-400 font-bold">Let&apos;s Encrypt Certbot</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Custom Domain</span>
                      <span className="text-sky-400 font-bold">1-Click CNAME Bind</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Tự Động Cấu Hình Nginx &amp; SSL HTTPS</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Không cần cấu hình Nginx hay mở port thủ công. Hệ thống tự động thiết lập Reverse Proxy 
                  và cấp phát chứng chỉ SSL HTTPS Let&apos;s Encrypt miễn phí vĩnh viễn.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Domain Support:</span>
                <strong className="text-sky-400">Gắn Tên Miền Riêng Dễ Dàng</strong>
              </div>
            </div>

            {/* Schematic 3: Dedicated NVMe & Root Access */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>KERNEL ISOLATION &amp; SSH</span>
                    <span className="text-purple-400">ROOT PRIVILEGES</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Root SSH Access</span>
                      <span className="text-emerald-400 font-bold">Port 22 Full Root</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>NVMe Gen4 Storage</span>
                      <span className="text-purple-400 font-bold">Hardware RAID-10</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>RAM Allocation</span>
                      <span className="text-sky-400">100% Dedicated ECC</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Tài Nguyên Cô Lập &amp; Toàn Quyền Root</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mỗi ứng dụng chạy trong môi trường máy chủ ảo cô lập hoàn toàn. 
                  Bạn nhận toàn quyền Root SSH để tùy chỉnh file cấu hình, cài đặt thêm package hoặc tích hợp CI/CD.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Access Level:</span>
                <strong className="text-purple-400">Toàn Quyền Root / Sudo 100%</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Câu Hỏi Thường Gặp Về 1-Click Apps</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST APP INSTALLER FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0c1322] rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-indigo-400 shrink-0" />
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
        <div className="rounded-3xl bg-gradient-to-r from-[#14122e] via-[#0b0a1a] to-[#14122e] p-8 sm:p-12 border border-indigo-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              DEPLOY ANY APP IN 60 SECONDS
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Khởi Tạo Ứng Dụng Đám Mây Của Bạn Ngay Hôm Nay
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Chỉ với 1 cú click. Toàn quyền Root SSH, tự động cấp phát SSL HTTPS và hỗ trợ kỹ thuật 24/7.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/services/cloud-vps"
                className="px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs font-mono shadow-xl shadow-indigo-600/25 transition-all hover:scale-105"
              >
                Xem Cấu Hình Cloud VPS
              </Link>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono border border-slate-700 transition-all"
              >
                Yêu Cầu Tích Hợp App Mới
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
