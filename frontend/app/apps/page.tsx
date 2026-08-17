'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Boxes, Search, Zap, CheckCircle2, ArrowRight, 
  Globe, Server, Shield, Cpu, ExternalLink, Play 
} from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useUIStore } from '@/src/store/useUIStore';

export default function AppMarketplacePage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { setAuthModal } = useUIStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const apps = [
    {
      id: 'wordpress',
      name: 'WordPress + LiteSpeed',
      category: 'cms',
      description: 'Nền tảng CMS phổ biến nhất thế giới được tối ưu sẵn với LiteSpeed Cache và Redis Object Cache.',
      tag: 'Phổ biến nhất',
      version: '6.4.3',
      icon: '🌐',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      id: 'docker',
      name: 'Docker & Portainer CE',
      category: 'dev',
      description: 'Môi trường Docker Engine hoàn chỉnh với giao diện đồ họa Portainer quản lý container trực quan.',
      tag: 'Developer',
      version: '25.0',
      icon: '🐳',
      color: 'from-cyan-600 to-blue-600',
    },
    {
      id: 'nodejs',
      name: 'Node.js & PM2 Stack',
      category: 'dev',
      description: 'Cài đặt Node.js LTS, NVM, PM2 Process Manager và Nginx Reverse Proxy sẵn sàng deploy.',
      tag: 'LTS Ready',
      version: '20.11',
      icon: '⚡',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      id: 'gitlab',
      name: 'GitLab Community Edition',
      category: 'dev',
      description: 'Hệ thống quản lý mã nguồn Git, CI/CD pipelines và quản lý dự án nội bộ an toàn 100%.',
      tag: 'DevOps',
      version: '16.8',
      icon: '🦊',
      color: 'from-orange-600 to-rose-600',
    },
    {
      id: 'nextcloud',
      name: 'Nextcloud Hub',
      category: 'tools',
      description: 'Đám mây lưu trữ dữ liệu cá nhân & doanh nghiệp tự quản tương tự Google Drive nhưng bảo mật riêng tư.',
      tag: 'Lưu trữ riêng',
      version: '28.0',
      icon: '☁️',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'prestashop',
      name: 'Prestashop E-commerce',
      category: 'ecommerce',
      description: 'Nền tảng bán hàng trực tuyến mạnh mẽ với giỏ hàng, cổng thanh toán và quản lý đơn hàng đa kênh.',
      tag: 'E-commerce',
      version: '8.1',
      icon: '🛍️',
      color: 'from-pink-600 to-rose-600',
    },
    {
      id: 'ollama',
      name: 'Ollama & Open-WebUI (AI)',
      category: 'ai',
      description: 'Chạy các mô hình ngôn ngữ lớn Llama 3, Mistral, Gemma cục bộ trên VPS với giao diện ChatGPT tuyệt đẹp.',
      tag: 'AI Mới',
      version: '0.1.30',
      icon: '🧠',
      color: 'from-purple-600 to-indigo-600',
    },
    {
      id: 'n8n',
      name: 'n8n Workflow Automation',
      category: 'tools',
      description: 'Công cụ tự động hóa quy trình làm việc mã nguồn mở kết nối hơn 400+ ứng dụng và AI agents.',
      tag: 'Tự động hóa',
      version: '1.29',
      icon: '🔄',
      color: 'from-amber-600 to-orange-600',
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-20 pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Boxes className="w-4 h-4 text-indigo-400" />
            Kho Ứng Dụng 1-Click Cài Đặt Tự Động
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            Triển Khai Mọi Ứng Dụng Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-300">
              1-Click App Installer
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Hơn 100+ ứng dụng và nền tảng mã nguồn mở được tối ưu hóa sẵn. Không cần cài đặt dòng lệnh phức tạp, mọi thứ sẵn sàng trong 60 giây.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm ứng dụng (WordPress, Docker, Node.js, AI...)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Category Pills & Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'Tất cả ứng dụng' },
            { id: 'cms', label: 'CMS & Website' },
            { id: 'dev', label: 'Công cụ Lập trình' },
            { id: 'ecommerce', label: 'Thương mại Điện tử' },
            { id: 'ai', label: 'Trí Tuệ Nhân Tạo (AI)' },
            { id: 'tools', label: 'Lưu trữ & Tự động hóa' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl p-3 rounded-2xl bg-slate-50 group-hover:scale-110 transition-transform">
                    {app.icon}
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-extrabold uppercase">
                    {app.tag}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                  {app.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-3 mb-6 leading-relaxed">
                  {app.description}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold mb-4 pt-4 border-t border-slate-100">
                  <span>Phiên bản: {app.version}</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1-Click Ready
                  </span>
                </div>

                <button
                  onClick={() => handleInstall(app.id)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 group-hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5" />
                  Cài Đặt Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
