'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Boxes, Search, Zap, CheckCircle2, ArrowRight, 
  Globe, Server, Shield, Cpu, ExternalLink, Play,
  DownloadCloud, Layers, Activity, ChevronDown, ChevronUp,
  Sparkles, Terminal, HardDrive, Lock
} from 'lucide-react';
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
      tag: 'Phổ biến nhất',
      version: '6.5 (Mới nhất)',
      icon: '🌐',
      color: 'from-blue-600 to-indigo-600',
      specs: '1 vCPU • 1GB RAM',
    },
    {
      id: 'ghost',
      name: 'Ghost CMS Pro',
      category: 'cms',
      description: 'Nền tảng xuất bản nội dung, newsletter & blog hiện đại viết bằng Node.js. Siêu tốc và tối ưu chuẩn SEO.',
      tag: 'Blogging & News',
      version: '5.82',
      icon: '👻',
      color: 'from-zinc-600 to-slate-800',
      specs: '1 vCPU • 1GB RAM',
    },
    {
      id: 'nextcloud',
      name: 'Nextcloud Hub',
      category: 'tools',
      description: 'Đám mây lưu trữ dữ liệu riêng tư chuẩn Enterprise, đồng bộ ảnh, danh bạ, tài liệu văn phòng và bảo mật E2EE.',
      tag: 'Lưu trữ riêng tư',
      version: '28.0.4',
      icon: '☁️',
      color: 'from-blue-500 to-cyan-500',
      specs: '2 vCPU • 2GB RAM',
    },
    {
      id: 'n8n',
      name: 'n8n Workflow Automation',
      category: 'tools',
      description: 'Công cụ tự động hóa quy trình làm việc kéo thả mã nguồn mở kết nối hơn 400+ ứng dụng & AI LLM Nodes.',
      tag: 'Tự động hóa & AI',
      version: '1.38',
      icon: '🔄',
      color: 'from-amber-600 to-orange-600',
      specs: '1 vCPU • 2GB RAM',
    },
    {
      id: 'docker',
      name: 'Docker CE & Portainer',
      category: 'dev',
      description: 'Môi trường Docker Container Engine cài sẵn Portainer GUI quản lý container, volumes và stacks trực quan.',
      tag: 'DevOps & Container',
      version: '26.0 / 2.20',
      icon: '🐳',
      color: 'from-cyan-600 to-blue-600',
      specs: '1 vCPU • 1GB RAM',
    },
    {
      id: 'ollama',
      name: 'Ollama AI Server (LLMs)',
      category: 'ai',
      description: 'Chạy các mô hình ngôn ngữ lớn Llama 3, Mistral, Gemma, Phi-3 cục bộ riêng tư với REST API tương thích OpenAI.',
      tag: 'AI & Machine Learning',
      version: '0.1.32',
      icon: '🦙',
      color: 'from-purple-600 to-pink-600',
      specs: '4 vCPU • 8GB RAM',
    },
    {
      id: 'strapi',
      name: 'Strapi Headless CMS',
      category: 'cms',
      description: 'Headless CMS mã nguồn mở số 1 cho React, Vue, Next.js và Mobile Apps với REST & GraphQL API tự động.',
      tag: 'Headless CMS',
      version: '4.24',
      icon: '🚀',
      color: 'from-indigo-600 to-violet-600',
      specs: '2 vCPU • 2GB RAM',
    },
    {
      id: 'adminer',
      name: 'Adminer DB Manager',
      category: 'dev',
      description: 'Trình quản trị cơ sở dữ liệu MySQL, PostgreSQL, SQLite siêu nhẹ chỉ 1 file PHP an toàn và tốc độ.',
      tag: 'Database GUI',
      version: '4.8.1',
      icon: '🗄️',
      color: 'from-emerald-600 to-teal-600',
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
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-inner">
            <Boxes className="w-4 h-4 text-indigo-400 animate-pulse" />
            Kho Ứng Dụng 1-Click Cài Đặt Tự Động - Hơn 100+ App Mã Nguồn Mở
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Triển Khai Mọi Ứng Dụng Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-300">
              1-Click App Installer
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Không cần gõ dòng lệnh phức tạp. Cài đặt WordPress, Ghost, Nextcloud, n8n, Ollama AI, Docker trong vòng 60 giây với chứng chỉ SSL và tường lửa kích hoạt tự động.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative mb-8">
            <Search className="w-5 h-5 text-slate-400 absolute left-5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm ứng dụng (WordPress, Docker, Nextcloud, Ollama AI...)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xl transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { id: 'all', label: 'Tất cả ứng dụng' },
              { id: 'cms', label: 'CMS & Website' },
              { id: 'ai', label: 'Trí Tuệ Nhân Tạo (AI)' },
              { id: 'tools', label: 'Lưu trữ & Tự động hóa' },
              { id: 'dev', label: 'Công cụ Lập trình' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-lg shadow-indigo-500/30'
                    : 'bg-slate-800/70 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. APPS GRID */}
      <section className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-slate-800/90 backdrop-blur-md rounded-3xl p-6 border border-slate-700/80 shadow-xl hover:border-indigo-500/60 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl p-3 rounded-2xl bg-slate-900/80 border border-slate-700/60 group-hover:scale-110 transition-transform">
                    {app.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-extrabold uppercase">
                    {app.tag}
                  </span>
                </div>

                <h3 className="text-lg font-black text-white mb-1 group-hover:text-indigo-400 transition-colors">
                  {app.name}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-3 mb-6 leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-4 pt-4 border-t border-slate-700/60">
                  <span className="text-slate-300 font-mono text-[10px]">{app.specs}</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1-Click
                  </span>
                </div>

                <button
                  onClick={() => handleInstall(app.id)}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 hover:scale-[1.02]"
                >
                  <Play className="w-3.5 h-3.5" />
                  Cài Đặt Ứng Dụng Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. REALISTIC VISUAL SHOWCASE */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              Quy Trình Triển Khai Tự Động Hóa 100%
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Không Còn Nỗi Ám Ảnh Dòng Lệnh Cấu Hình
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mỗi ứng dụng được đóng gói cô lập, cấp phát tên miền SSL HTTPS và tối ưu thông số bộ nhớ RAM/CPU để đạt hiệu năng cao nhất.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
                    alt="One Click Automated App Provisioning"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-indigo-600/90 text-white text-[11px] font-black uppercase">
                    Automated Deploy
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Khởi Tạo Trong 60 Giây</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Hệ thống tự động biên dịch cấu hình, khởi tạo database và phân quyền bảo mật chỉ trong 1 phút, sẵn sàng link đăng nhập cho bạn sử dụng ngay.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Tự động cấu hình Reverse Proxy Nginx</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Cài đặt sẵn tường lửa UFW & Fail2Ban</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-cyan-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                    alt="Automatic SSL & Domain Binding"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-cyan-600/90 text-white text-[11px] font-black uppercase">
                    SSL HTTPS 100%
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Tích Hợp Sẵn SSL & Tên Miền</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Dễ dàng gắn tên miền riêng cho ứng dụng của bạn và tự động nhận chứng chỉ bảo mật HTTPS SSL miễn phí từ Let's Encrypt.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Tự động gia hạn SSL vĩnh viễn</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Hỗ trợ gắn Subdomain miễn phí</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-pink-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Dedicated NVMe Resource Isolation"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-pink-600/90 text-white text-[11px] font-black uppercase">
                    Resource Isolation
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Tài Nguyên Cô Lập Tuyệt Đối</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Mỗi ứng dụng chạy trong môi trường VPS ảo hóa riêng biệt, không dùng chung tài nguyên với người khác, đảm bảo tốc độ và an toàn bảo mật 100%.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> RAM ECC & NVMe Gen4 chuyên dụng</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Nâng cấp dung lượng chỉ với 1 click</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">Câu Hỏi Thường Gặp (FAQ)</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Giải đáp chi tiết thắc mắc về kho ứng dụng 1-Click</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
