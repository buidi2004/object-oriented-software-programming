'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, Search, ArrowRight, BookOpen, Server, Globe, 
  Database, ShieldCheck, Boxes, Compass, Clock, Eye, 
  CheckCircle2, HelpCircle, MessageSquare, Terminal, LifeBuoy, Zap, ChevronRight
} from 'lucide-react';
import { api } from '@/src/lib/api';

interface KbArticle {
  id: string;
  title: string;
  slug: string;
  categoryTag: string;
  viewCount: number;
  readTime?: string;
  summary?: string;
}

const KB_CATEGORIES = [
  { id: 'vps', name: 'Máy Chủ & Cloud VPS', icon: Server, desc: 'Cài đặt Linux/Windows, tối ưu CPU AMD EPYC, quản lý SSH', count: 12 },
  { id: 'web', name: 'Web Server & Nginx', icon: Globe, desc: 'Cấu hình Nginx, LiteSpeed, tối ưu PHP-FPM & WordPress', count: 9 },
  { id: 'database', name: 'Cơ Sở Dữ Liệu', icon: Database, desc: 'Quản trị PostgreSQL, MySQL, Redis & sao lưu tự động', count: 8 },
  { id: 'security', name: 'Bảo Mật & SSL/WAF', icon: ShieldCheck, desc: 'Cấu hình UFW Firewall, Fail2ban, cài đặt SSL Let\'s Encrypt', count: 11 },
  { id: 'devops', name: 'Container & Docker', icon: Boxes, desc: 'Triển khai Docker Compose, Kubernetes, Portainer & CI/CD', count: 7 },
  { id: 'domains', name: 'Tên Miền & DNS', icon: Compass, desc: 'Trỏ bản ghi DNS A/CNAME/MX, quản lý Nameserver Cloudflare', count: 6 },
];

const DEFAULT_ARTICLES: KbArticle[] = [
  {
    id: 'kb-1',
    title: 'Hướng Dẫn Kết Nối SSH & Bảo Mật VPS Ubuntu 24.04 LTS Cơ Bản',
    slug: 'huong-dan-ssh-bao-mat-vps-ubuntu-24',
    categoryTag: 'Máy Chủ & Cloud VPS',
    viewCount: 3840,
    readTime: '4 phút',
    summary: 'Cách tạo SSH Key Ed25519, đổi cổng SSH mặc định, vô hiệu hóa đăng nhập root và kích hoạt UFW Firewall để chống bruteforce.'
  },
  {
    id: 'kb-2',
    title: 'Cài Đặt & Cấu Hình Web Server Nginx + Certbot SSL Let\'s Encrypt Miễn Phí',
    slug: 'cai-dat-nginx-certbot-ssl-lets-encrypt',
    categoryTag: 'Web Server & Nginx',
    viewCount: 2950,
    readTime: '6 phút',
    summary: 'Hướng dẫn chi tiết từng bước trỏ domain, tạo Server Block Nginx, cấu hình tự động gia hạn SSL sau mỗi 90 ngày.'
  },
  {
    id: 'kb-3',
    title: 'Triển Khai Cụm Docker Compose: Nginx Reverse Proxy + PostgreSQL + Redis',
    slug: 'trien-khai-docker-compose-nginx-postgresql-redis',
    categoryTag: 'Container & Docker',
    viewCount: 2410,
    readTime: '8 phút',
    summary: 'Mẫu file docker-compose.yml chuẩn production kèm volume data persistent, network bridge bảo mật và script sao lưu tự động.'
  },
  {
    id: 'kb-4',
    title: 'Hướng Dẫn Tối Ưu Hóa Hiệu Năng MySQL / MariaDB Cho Web Tải Lớn',
    slug: 'toi-uu-hoa-hieu-nang-mysql-mariadb',
    categoryTag: 'Cơ Sở Dữ Liệu',
    viewCount: 1890,
    readTime: '5 phút',
    summary: 'Căn chỉnh cấu hình innodb_buffer_pool_size, max_connections, query_cache và phân tích slow query log.'
  },
  {
    id: 'kb-5',
    title: 'Thiết Lập Tường Lửa UFW & Chống Tấn Công DDoS Layer 4/7',
    slug: 'thiet-lap-tuong-lua-ufw-anti-ddos',
    categoryTag: 'Bảo Mật & SSL/WAF',
    viewCount: 2180,
    readTime: '5 phút',
    summary: 'Cách giới hạn rate limit kết nối, chặn IP quét cổng tự động và tích hợp Cloudflare Anti-DDoS Proxy.'
  },
  {
    id: 'kb-6',
    title: 'Hướng Dẫn Cấu Hình DNS Tên Miền Về Cloud VPS SEN CloudHost',
    slug: 'huong-dan-cau-hinh-dns-ten-mien-ve-vps',
    categoryTag: 'Tên Miền & DNS',
    viewCount: 3120,
    readTime: '3 phút',
    summary: 'Chi tiết thiết lập các bản ghi DNS: A record, CNAME, MX cho email và TXT verification chỉ trong 60 giây.'
  }
];

export default function PublicKnowledgeBasePage() {
  const [articles, setArticles] = useState<KbArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/KnowledgeBase');
      if (Array.isArray(res.data) && res.data.length > 0) {
        setArticles(res.data);
      } else {
        setArticles(DEFAULT_ARTICLES);
      }
    } catch {
      setArticles(DEFAULT_ARTICLES);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => {
    const matchCategory = selectedCategory === 'all' || a.categoryTag.toLowerCase().includes(selectedCategory.toLowerCase());
    if (!searchQuery.trim()) return matchCategory;
    const q = searchQuery.toLowerCase();
    return matchCategory && (
      a.title.toLowerCase().includes(q) || 
      a.categoryTag.toLowerCase().includes(q) ||
      (a.summary && a.summary.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-black selection:text-white">
      
      {/* 1. HERO SEARCH SECTION - MONOCHROME DARK */}
      <section className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800/80 text-zinc-300 text-xs font-mono border border-zinc-700">
            <BookOpen className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE &amp; TECHNICAL DOCUMENTATION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Trung Tâm Tài Liệu &amp; Hướng Dẫn Kỹ Thuật
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto font-normal leading-relaxed">
            Kho tri thức vận hành máy chủ, tối ưu mã nguồn, bảo mật hạ tầng và triển khai ứng dụng đám mây chuẩn chuyên gia.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative mt-6">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm: SSH, Nginx, Docker, PostgreSQL, Let's Encrypt, UFW..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-900/90 border border-zinc-700 text-white text-xs placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all shadow-xl"
            />
          </div>

          {/* Hot Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs text-zinc-400 font-mono">
            <span className="text-zinc-500">Từ khóa:</span>
            {['SSH Key', 'Ubuntu 24.04', 'Nginx SSL', 'Docker Compose', 'MySQL Tuning', 'UFW Firewall'].map((tag, i) => (
              <button
                key={i}
                onClick={() => setSearchQuery(tag)}
                className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* 2. CORE TOPIC CATEGORIES GRID */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-black flex items-center gap-2">
                <Boxes className="w-5 h-5 text-black" />
                <span>Chuyên Mục Kỹ Thuật Trọng Tâm</span>
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">Chọn chuyên mục để xem các bài viết hướng dẫn chuyên sâu</p>
            </div>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs font-bold text-black hover:underline cursor-pointer"
              >
                Xem tất cả chuyên mục
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {KB_CATEGORIES.map((cat) => {
              const IconComp = cat.icon;
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat.name)}
                  className={`p-5 rounded-2xl border text-left transition-all flex items-start gap-4 cursor-pointer shadow-2xs group ${
                    isSelected 
                      ? 'bg-zinc-900 text-white border-black ring-2 ring-black' 
                      : 'bg-white border-zinc-200 hover:border-black hover:shadow-md'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors shadow-2xs ${
                    isSelected 
                      ? 'bg-zinc-800 text-white' 
                      : 'bg-zinc-100 group-hover:bg-black group-hover:text-white text-zinc-800'
                  }`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`text-sm font-black transition-colors ${isSelected ? 'text-white' : 'text-black group-hover:text-black'}`}>
                        {cat.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                      }`}>
                        {cat.count} bài
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed mt-1 font-normal line-clamp-2 ${
                      isSelected ? 'text-zinc-300' : 'text-zinc-500'
                    }`}>
                      {cat.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. ARTICLES LIST */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-3">
            <h2 className="text-lg font-black text-black flex items-center gap-2">
              <FileText className="w-5 h-5 text-black" />
              <span>Danh Sách Bài Viết Hướng Dẫn ({filteredArticles.length})</span>
            </h2>
            {selectedCategory !== 'all' && (
              <span className="text-xs font-bold text-black bg-zinc-100 px-3 py-1 rounded-lg border border-zinc-300">
                Đang lọc: {selectedCategory}
              </span>
            )}
          </div>

          {filteredArticles.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200 text-zinc-500 text-xs">
              Không tìm thấy bài viết nào phù hợp với từ khóa "{searchQuery}". Hãy thử tìm từ khóa khác hoặc gửi yêu cầu cho kỹ sư!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/knowledge-base/${article.id}`}
                  className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-2xs hover:shadow-lg hover:border-black transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-black bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-300">
                        {article.categoryTag}
                      </span>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-zinc-400" /> {article.readTime || '5 phút'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3 text-zinc-400" /> {article.viewCount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <h3 className="text-base font-black text-black group-hover:text-zinc-700 transition-colors leading-snug">
                      {article.title}
                    </h3>

                    {article.summary && (
                      <p className="text-xs text-zinc-600 font-normal leading-relaxed line-clamp-2">
                        {article.summary}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-bold text-black">
                    <span className="group-hover:underline">Đọc tài liệu chi tiết</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* 4. TECHNICAL ASSISTANCE CTA BANNER - MONOCHROME DARK */}
        <section className="bg-[#121212] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border border-zinc-800 shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700">
                <LifeBuoy className="w-3.5 h-3.5" />
                <span>HỖ TRỢ KỸ THUẬT CHUYÊN SÂU 24/7/365</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Không Tìm Thấy Giải Pháp Kỹ Thuật Bạn Cần?
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-normal leading-relaxed">
                Đội ngũ kỹ sư Level 3 trực tuyến 24/7, sẵn sàng hỗ trợ cấu hình, gỡ lỗi và thẩm định giải pháp máy chủ của bạn.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/contact?topic=technical"
                className="px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition-all shadow-lg flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                <span>Yêu Cầu Kỹ Sư Tư Vấn 1-1</span>
              </Link>
              <Link
                href="/support/tickets"
                className="px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold text-xs transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Tạo Ticket Kỹ Thuật</span>
              </Link>
            </div>
          </div>
        </section>

      </div>

    </div>
  );
}
