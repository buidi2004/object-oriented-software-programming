'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud, Server, Globe, Shield, ShoppingCart, Menu, X, Cpu, ChevronDown, LogOut, Wallet,
  Gamepad2, Mail, Database, HardDrive, ShieldCheck, Zap, Layers, Palette, ShoppingBag, Activity, ArrowRight, Compass,
  LifeBuoy, Megaphone, BookOpen, DownloadCloud, ActivitySquare, Search, LayoutTemplate, Boxes, ArrowLeftRight, User, HelpCircle,
  ChevronRight, Gift, FileText, PhoneCall, MessageSquare
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useCartStore } from '../store/useCartStore';
import { api } from '../lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlobalSearch from './GlobalSearch';
import { TopUpModal } from './TopUpModal';

const serviceCategories = [
  {
    name: 'Hạ tầng & Máy chủ',
    description: 'Cung cấp các dịch vụ hạ tầng máy chủ chuyên dụng, ảo hóa CPU AMD/Intel hiệu năng cao và container tối ưu.',
    services: [
      { id: 1, title: 'Cloud VPS NVMe', desc: 'Máy chủ ảo hiệu năng cao CPU AMD EPYC', link: '/services/cloud-vps', icon: Server, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 2, title: 'Dedicated Server', desc: 'Máy chủ vật lý riêng biệt Dual Xeon & EPYC', link: '/services/dedicated-servers', icon: Server, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 3, title: 'Game Servers', desc: 'Minecraft, CS2, Rust Anti-DDoS 500Gbps', link: '/services/game-servers', icon: Gamepad2, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 4, title: 'Static Sites (Nginx)', desc: 'Web tĩnh tốc độ cao trên container Nginx', link: '/services/static-sites', icon: Globe, color: 'text-[#1F1F1F] bg-slate-100' }
    ]
  },
  {
    name: 'Web & Bảo mật',
    description: 'Giải pháp lưu trữ web tốc độ cao, cài ứng dụng 1 chạm và bảo vệ đường truyền đạt chuẩn quốc tế.',
    services: [
      { id: 1, title: 'NVMe Web Hosting', desc: 'LiteSpeed + cPanel tối ưu tốc độ WordPress', link: '/services/hosting', icon: LayoutTemplate, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 2, title: '1-Click Apps Installer', desc: 'Cài WordPress, Ghost, Nextcloud, n8n 60s', link: '/apps', icon: Boxes, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 3, title: 'Chứng Chỉ SSL / TLS', desc: 'Mã hóa HTTPS bảo hiểm $1.75M USD', link: '/services/ssl-certificates', icon: ShieldCheck, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 4, title: 'Tên Miền (DNS)', desc: 'Đăng ký .VN, .COM, .AI, .IO giá tốt', link: '/domains', icon: Compass, color: 'text-[#1F1F1F] bg-slate-100' }
    ]
  },
  {
    name: 'Dữ liệu & Giải pháp',
    description: 'Hệ sinh thái lưu trữ S3, cơ sở dữ liệu quản trị tự động và dịch vụ chuyển đổi dữ liệu toàn diện.',
    services: [
      { id: 1, title: 'Managed Databases', desc: 'PostgreSQL, MySQL, Redis HA tự động', link: '/services/databases', icon: Database, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 2, title: 'Object Storage (S3)', desc: 'MinIO S3 API All-Flash 11 số 9 độ bền', link: '/services/storage', icon: HardDrive, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 3, title: 'Bảo Mật & WAF', desc: 'Tường lửa AI, chống DDoS L7 & OWASP', link: '/services/security', icon: Shield, color: 'text-[#1F1F1F] bg-slate-100' },
      { id: 4, title: 'Chuyển Đổi Dữ Liệu', desc: 'Di dời Zero-Downtime 24/7 MIỄN PHÍ', link: '/services/migrations', icon: Activity, color: 'text-[#1F1F1F] bg-slate-100' }
    ]
  }
];

const solutionCategories = [
  {
    name: 'Theo quy mô',
    description: 'Tối ưu chi phí và hiệu năng cho từng giai đoạn phát triển.',
    services: [
      { id: 1, title: 'Giải pháp cho Sinh viên', desc: 'Thực hành code, chạy đồ án giá rẻ', link: '/solutions/student', icon: BookOpen, color: 'text-[#1F1F1F] bg-amber-100' },
      { id: 2, title: 'Doanh nghiệp SME', desc: 'Khởi chạy website an toàn, tiết kiệm', link: '/solutions/sme', icon: ActivitySquare, color: 'text-[#1F1F1F] bg-blue-100' },
      { id: 3, title: 'Giải pháp Enterprise', desc: 'Hạ tầng chịu tải lớn, sẵn sàng 99.99%', link: '/solutions/enterprise', icon: Server, color: 'text-[#1F1F1F] bg-slate-200' }
    ]
  },
  {
    name: 'Theo ngành nghề',
    description: 'Kiến trúc chuyên biệt giải quyết bài toán của từng lĩnh vực.',
    services: [
      { id: 4, title: 'Thương mại điện tử', desc: 'Chống giật lag mùa Sale, bảo mật WAF', link: '/solutions/ecommerce', icon: ShoppingBag, color: 'text-[#1F1F1F] bg-pink-100' },
      { id: 5, title: 'Game Studio', desc: 'Máy chủ Low-ping, chống DDoS 500Gbps', link: '/solutions/gaming', icon: Gamepad2, color: 'text-[#1F1F1F] bg-purple-100' },
      { id: 6, title: 'Agency & Developer', desc: 'Quản trị tập trung, CI/CD, 1-Click Apps', link: '/solutions/agency', icon: Cpu, color: 'text-[#1F1F1F] bg-green-100' }
    ]
  },
  {
    name: 'Nhu cầu chuyên biệt',
    description: 'Các giải pháp hạ tầng mở rộng và tuân thủ tiêu chuẩn.',
    services: [
      { id: 7, title: 'Cloud Migration', desc: 'Dịch chuyển lên mây an toàn, 0 downtime', link: '/solutions/migration', icon: ArrowLeftRight, color: 'text-[#1F1F1F] bg-orange-100' },
      { id: 8, title: 'Tối ưu Bảo mật (Security)', desc: 'Ngăn chặn tấn công L7 & lộ lọt dữ liệu', link: '/solutions/security', icon: ShieldCheck, color: 'text-[#1F1F1F] bg-red-100' }
    ]
  }
];
export const getStaffPanelInfo = (role?: string) => {
  const r = (role || '').toLowerCase();
  if (r === 'admin') {
    return {
      title: 'Admin Panel',
      className: 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs hover:shadow-red-500/20 hover:from-red-500 hover:to-rose-500',
      mobileClass: 'bg-red-50 text-red-700 border border-red-200'
    };
  }
  if (r === 'accountant' || r.includes('kế toán') || r.includes('ketoan')) {
    return {
      title: 'Kế Toán Panel',
      className: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs hover:shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500',
      mobileClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    };
  }
  if (r === 'technician' || r.includes('kỹ thuật') || r.includes('kythuat')) {
    return {
      title: 'Kỹ Thuật Panel',
      className: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs hover:shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500',
      mobileClass: 'bg-blue-50 text-blue-700 border border-blue-200'
    };
  }
  if (r === 'support' || r.includes('chăm sóc') || r.includes('cskh')) {
    return {
      title: 'CSKH Panel',
      className: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs hover:shadow-amber-500/20 hover:from-amber-500 hover:to-orange-500',
      mobileClass: 'bg-amber-50 text-amber-700 border border-amber-200'
    };
  }
  if (r === 'editor' || r.includes('biên tập') || r.includes('bientap')) {
    return {
      title: 'Biên Tập Panel',
      className: 'bg-gradient-to-r from-purple-600 to-violet-600 text-white shadow-xs hover:shadow-purple-500/20 hover:from-purple-500 hover:to-violet-500',
      mobileClass: 'bg-purple-50 text-purple-700 border border-purple-200'
    };
  }
  if (r === 'staff') {
    return {
      title: 'Bảng Quản Trị',
      className: 'bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-xs hover:bg-black',
      mobileClass: 'bg-slate-100 text-slate-800 border border-slate-200'
    };
  }
  return null;
};

export interface HeaderProps {
  onOpenAuth?: (mode: 'login' | 'register') => void;
  cartCount?: number;
  onOpenCart?: () => void;
  onOpenDashboard?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAuth,
  cartCount: propCartCount,
  onOpenCart,
  onOpenDashboard
}) => {
  const pathname = usePathname();
  const uiStore = useUIStore();
  const globalCartCount = useCartStore(state => state.items.length);
  const cartCount = propCartCount ?? globalCartCount;

  const handleOpenAuth = (mode: 'login' | 'register') => {
    if (onOpenAuth) onOpenAuth(mode);
    else uiStore.setAuthModal(true, mode);
  };

  const handleOpenCart = () => {
    if (onOpenCart) onOpenCart();
    else uiStore.setIsCartOpen(true);
  };

  const handleOpenDashboard = () => {
    if (onOpenDashboard) onOpenDashboard();
    else uiStore.setIsDashboardOpen(true);
  };

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [solutionsDropdownOpen, setSolutionsDropdownOpen] = useState(false);
  const [activeServiceCategory, setActiveServiceCategory] = useState(0);
  const [activeSolutionCategory, setActiveSolutionCategory] = useState(0);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const [newsDropdownOpen, setNewsDropdownOpen] = useState(false);
  const [activeNewsTab, setActiveNewsTab] = useState<'news' | 'promotions' | 'kb' | 'support'>('news');
  const [newsList, setNewsList] = useState<any[]>([]);
  const [promotionsList, setPromotionsList] = useState<any[]>([]);
  const [kbList, setKbList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<any[]>([]);
  const [isNewsDataLoading, setIsNewsDataLoading] = useState(false);
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const { user, setUser, logout, token } = useAuthStore();
  const walletBalance = user?.walletBalance ?? 0;

  useEffect(() => {
    if (newsDropdownOpen && newsList.length === 0 && promotionsList.length === 0 && !isNewsDataLoading) {
      setIsNewsDataLoading(true);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
      
      const fetches = [
        fetch(`${apiUrl}/api/news`).then(res => res.ok ? res.json() : []),
        fetch(`${apiUrl}/api/promotions/active`).then(res => res.ok ? res.json() : []),
        fetch(`${apiUrl}/api/knowledge-base`).then(res => res.ok ? res.json() : [])
      ];
      
      // If user logged in, fetch their tickets for Support tab
      if (token || (typeof window !== 'undefined' && localStorage.getItem('accessToken'))) {
        const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : '');
        fetches.push(
          fetch(`${apiUrl}/api/tickets`, {
            headers: { 'Authorization': `Bearer ${savedToken}` }
          }).then(res => res.ok ? res.json() : [])
        );
      } else {
        fetches.push(Promise.resolve([]));
      }

      Promise.all(fetches).then(([news, promos, kbs, tickets]) => {
        setNewsList(Array.isArray(news) ? news : []);
        setPromotionsList(Array.isArray(promos) ? promos : []);
        setKbList(Array.isArray(kbs) ? kbs : []);
        setTicketsList(Array.isArray(tickets) ? tickets : []);
        setIsNewsDataLoading(false);
      }).catch((err) => {
        console.error('Failed to fetch news/support data:', err);
        setIsNewsDataLoading(false);
      });
    }
  }, [newsDropdownOpen, token, isNewsDataLoading, newsList.length, promotionsList.length]);

  useEffect(() => {
    const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
    if (savedToken) {
      Promise.all([
        api.get('/users/me').catch(() => null),
        api.get('/wallet/me').catch(() => null),
      ]).then(([userRes, walletRes]) => {
        if (userRes?.data) {
          const u = userRes.data;
          const balance = (walletRes?.data && typeof walletRes.data.balance === 'number') 
            ? walletRes.data.balance 
            : (u.walletBalance ?? 0);
          setUser({
            id: u.id,
            email: u.email,
            fullName: u.fullName || u.email || 'User',
            role: u.role || u.roleName || (u.roles && u.roles[0]) || 'Customer',
            walletBalance: balance,
          });
        } else if (walletRes?.data && typeof walletRes.data.balance === 'number') {
          setUser((prev: any) => (prev ? { ...prev, walletBalance: walletRes.data.balance } : prev));
        }
      });
    }
  }, [token, setUser]);

  const navLinkBase =
    'relative px-3.5 py-2 text-xs transition-colors flex items-center shrink-0 bg-transparent';
  const isServicesActive = pathname.startsWith('/services') || pathname.startsWith('/apps') || pathname.startsWith('/domains') || servicesDropdownOpen;
  const isNewsActive = pathname.startsWith('/news') || pathname.startsWith('/promotions') || newsDropdownOpen;
  const isSupportActive = pathname.startsWith('/support') || pathname.startsWith('/faqs') || pathname.startsWith('/resources') || pathname.startsWith('/status') || supportDropdownOpen;
  const isKnowledgeActive = pathname.startsWith('/knowledge-base');
  const isContactActive = pathname === '/contact';
  const isHomeActive = pathname === '/' && !isServicesActive && !isNewsActive && !isSupportActive && !isKnowledgeActive && !isContactActive;

  const navItems = [
    { id: 'home', label: 'Trang chủ', href: '/' },
    { id: 'services', label: 'Tất cả dịch vụ', href: '/services' },
    { id: 'knowledge', label: 'Thư viện', href: '/knowledge-base' },
    { id: 'contact', label: 'Liên hệ', href: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full flex flex-col">
      {/* Top Bar (Secondary Actions) */}
      <div className="w-full bg-[#333333] text-slate-300 py-1.5 text-xs font-medium hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-end gap-6">
          <Link href="/careers" className="hover:text-white transition-colors">Tuyển dụng</Link>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
            <Globe className="w-3.5 h-3.5" />
            <span>Tiếng Việt</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <img
              src="/images/logo.png"
              alt="CloudHost VN"
              className="h-14 sm:h-16 w-auto object-contain group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-2 min-w-0">
            <Link
              href="/"
              className={`${navLinkBase} ${isHomeActive ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900 font-bold'}`}
            >
              <span>Trang chủ</span>
              {isHomeActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#1F1F1F] rounded-full transition-all duration-300" />
              )}
            </Link>

            <div
              className="relative shrink-0"
              onMouseEnter={() => setServicesDropdownOpen(true)}
              onMouseLeave={() => setServicesDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setServicesDropdownOpen(open => !open)}
                aria-expanded={servicesDropdownOpen}
                aria-haspopup="true"
                className={`${navLinkBase} ${isServicesActive ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900 font-bold'}`}
              >
                <span>Dịch vụ</span>
                {isServicesActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#1F1F1F] rounded-full transition-all duration-300" />
                )}
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[940px] max-w-[95vw] z-50">
                  <div className="bg-white rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] border border-slate-200 flex flex-col overflow-hidden min-h-[420px] animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    <div className="flex flex-1">
                      {/* Left Sidebar */}
                      <div className="w-[280px] bg-slate-50/80 border-r border-slate-200/80 py-5 flex flex-col justify-between shrink-0">
                        <div className="space-y-1 px-3">
                          <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 px-3 pb-2">
                            Danh Mục Dịch Vụ ({serviceCategories.length})
                          </div>
                          {serviceCategories.map((cat, idx) => (
                            <button
                              key={idx}
                              onMouseEnter={() => setActiveServiceCategory(idx)}
                              onClick={() => setActiveServiceCategory(idx)}
                              className={`w-full text-left px-4 py-3.5 rounded-md text-[14px] font-bold transition-all flex items-center justify-between outline-none ${
                                activeServiceCategory === idx
                                  ? 'bg-white text-[#1F1F1F] shadow-sm border border-slate-200/80 font-black'
                                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                              }`}
                            >
                              <span>{cat.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                activeServiceCategory === idx ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-600'
                              }`}>
                                {cat.services.length}
                              </span>
                            </button>
                          ))}
                        </div>

                        {/* Direct Service Plans link in left sidebar */}
                        <div className="px-3 pt-4 border-t border-slate-200/60 mt-4">
                          <Link
                            href="/services"
                            onClick={() => setServicesDropdownOpen(false)}
                            className="block p-3 rounded-md bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 hover:border-black transition-all group"
                          >
                            <div className="text-xs font-black text-black flex items-center justify-between">
                              <span>Xem Tất Cả 12 Gói Dịch Vụ</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-black" />
                            </div>
                            <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">Bảng giá tổng hợp &amp; so sánh</p>
                          </Link>
                        </div>
                      </div>

                      {/* Right Content */}
                      <div className="flex-1 p-6 sm:p-7 bg-white flex flex-col justify-between">
                        <div>
                          {/* Banner */}
                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-md bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                              <Cloud className="w-6 h-6 text-[#1F1F1F]" />
                            </div>
                            <div>
                              <h4 className="text-sm font-black text-slate-900">{serviceCategories[activeServiceCategory].name}</h4>
                              <p className="text-[12px] text-slate-600 font-medium leading-relaxed max-w-lg mt-0.5">
                                {serviceCategories[activeServiceCategory].description}
                              </p>
                            </div>
                          </div>

                          {/* 4 Services Grid */}
                          <div className="grid grid-cols-2 gap-3.5">
                            {serviceCategories[activeServiceCategory].services.map((service, idx) => {
                              const SIcon = service.icon;
                              return (
                                <Link
                                  key={idx}
                                  href={service.link}
                                  onClick={() => setServicesDropdownOpen(false)}
                                  className="flex items-start gap-3.5 p-3.5 rounded-md hover:bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group"
                                >
                                  <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${service.color} transition-transform group-hover:scale-110 shadow-2xs`}>
                                    <SIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[13px] font-black text-slate-900 group-hover:text-[#1F1F1F] transition-colors mb-0.5 truncate">
                                      {service.title}
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-600 line-clamp-2 leading-snug">
                                      {service.desc}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>

                        {/* Bottom Bar */}
                        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                          <span className="font-semibold text-slate-700">Triển khai tự động trong 30-60 giây</span>
                          <Link
                            href="/services"
                            onClick={() => setServicesDropdownOpen(false)}
                            className="font-bold text-[#1F1F1F] hover:text-[#1F1F1F] flex items-center gap-1"
                          >
                            <span>Xem bảng giá & khuyến mãi</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Giải pháp (Solutions) Dropdown */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => setSolutionsDropdownOpen(true)}
              onMouseLeave={() => setSolutionsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setSolutionsDropdownOpen(open => !open)}
                aria-expanded={solutionsDropdownOpen}
                aria-haspopup="true"
                className={`${navLinkBase} ${solutionsDropdownOpen ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900 font-bold'}`}
              >
                <span>Giải pháp</span>
                {solutionsDropdownOpen && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#1F1F1F] rounded-full transition-all duration-300" />
                )}
              </button>

              {/* Mega menu */}
              {solutionsDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[800px] max-w-[80vw] z-50">
                  <div className="bg-white rounded-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] border border-slate-200 flex flex-col overflow-hidden min-h-[380px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex flex-1">
                      {/* Left Sidebar */}
                      <div className="w-[260px] bg-slate-50/80 border-r border-slate-200/80 py-5 flex flex-col justify-between shrink-0">
                        <div className="space-y-1 px-3">
                          <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 px-3 pb-2">
                            Danh Mục Giải Pháp
                          </div>
                          {solutionCategories.map((cat, idx) => (
                            <button
                              key={idx}
                              onMouseEnter={() => setActiveSolutionCategory(idx)}
                              onClick={() => setActiveSolutionCategory(idx)}
                              className={`w-full text-left px-4 py-2.5 rounded text-[13px] font-bold transition-all flex items-center justify-between outline-none ${
                                activeSolutionCategory === idx
                                  ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/60'
                                  : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 border border-transparent'
                              }`}
                            >
                              {cat.name}
                              {activeSolutionCategory === idx && <ArrowRight className="w-4 h-4 text-[#d09e2b]" />}
                            </button>
                          ))}
                        </div>
                        <div className="px-5 mt-4">
                          <Link href="/solutions" className="text-blue-600 hover:text-blue-800 text-[13px] font-bold flex items-center group" onClick={() => setSolutionsDropdownOpen(false)}>
                            Tất cả giải pháp (12+) <ArrowRight className="w-3 h-3 ml-1 transition-transform group-hover:translate-x-1" />
                          </Link>
                        </div>
                      </div>

                      {/* Right Content */}
                      <div className="flex-1 p-6 bg-white flex flex-col">
                        <div className="mb-6 pb-4 border-b border-slate-100">
                          <h4 className="text-base font-black text-slate-900 mb-1">{solutionCategories[activeSolutionCategory].name}</h4>
                          <p className="text-[13px] text-slate-600 font-medium">
                            {solutionCategories[activeSolutionCategory].description}
                          </p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3.5">
                          {solutionCategories[activeSolutionCategory].services.map((service, idx) => {
                            const SIcon = service.icon;
                            return (
                              <Link
                                key={idx}
                                href={service.link}
                                onClick={() => setSolutionsDropdownOpen(false)}
                                className="flex items-start gap-3.5 p-3.5 rounded-md hover:bg-slate-50 border border-slate-100 hover:border-[#d09e2b]/30 transition-all group shadow-2xs hover:shadow-sm"
                              >
                                <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${service.color} transition-transform group-hover:scale-110 shadow-2xs`}>
                                  <SIcon className="w-5 h-5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[13px] font-black text-slate-900 group-hover:text-[#d09e2b] transition-colors mb-0.5 truncate">
                                    {service.title}
                                  </div>
                                  <div className="text-[11px] font-medium text-slate-600 line-clamp-2 leading-snug">
                                    {service.desc}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tin tức & Hỗ trợ Dropdown */}
            <div
              className="relative h-full flex items-center"
              onMouseEnter={() => setNewsDropdownOpen(true)}
              onMouseLeave={() => setNewsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setNewsDropdownOpen(!newsDropdownOpen)}
                className={`flex items-center gap-1 px-3 h-full border-b-2 transition-colors ${
                  newsDropdownOpen ? 'border-[#d09e2b] text-[#1F1F1F]' : 'border-transparent text-slate-700 hover:border-black'
                } focus:outline-none`}
              >
                Tin tức & Hỗ trợ <ChevronDown className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${newsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mega menu */}
              {newsDropdownOpen && (
                <div className="absolute top-full left-0 pt-0 w-[700px] max-w-[80vw] z-50">
                  <div className="bg-white rounded-b-md shadow-lg border border-t-0 border-slate-200 flex flex-col overflow-hidden min-h-[350px] animate-in fade-in duration-200">
                    <div className="flex flex-1">
                      {/* Left Sidebar */}
                      <div className="w-[200px] bg-slate-50 border-r border-slate-200 py-4 flex flex-col justify-between shrink-0">
                        <div className="space-y-0.5">
                          <button
                            onMouseEnter={() => setActiveNewsTab('news')}
                            onClick={() => setActiveNewsTab('news')}
                            className={`w-full text-left px-5 py-3 text-[13px] font-semibold transition-all flex items-center justify-between outline-none ${
                              activeNewsTab === 'news'
                                ? 'bg-white text-[#d09e2b] shadow-[inset_3px_0_0_0_#d09e2b]'
                                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                            }`}
                          >
                            Tin Công Nghệ
                            {activeNewsTab === 'news' && <ChevronRight className="w-4 h-4 text-[#d09e2b]" />}
                          </button>
                          
                          <button
                            onMouseEnter={() => setActiveNewsTab('promotions')}
                            onClick={() => setActiveNewsTab('promotions')}
                            className={`w-full text-left px-5 py-3 text-[13px] font-semibold transition-all flex items-center justify-between outline-none ${
                              activeNewsTab === 'promotions'
                                ? 'bg-white text-[#d09e2b] shadow-[inset_3px_0_0_0_#d09e2b]'
                                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                            }`}
                          >
                            Khuyến Mãi
                            {activeNewsTab === 'promotions' && <ChevronRight className="w-4 h-4 text-[#d09e2b]" />}
                          </button>

                          <button
                            onMouseEnter={() => setActiveNewsTab('kb')}
                            onClick={() => setActiveNewsTab('kb')}
                            className={`w-full text-left px-5 py-3 text-[13px] font-semibold transition-all flex items-center justify-between outline-none ${
                              activeNewsTab === 'kb'
                                ? 'bg-white text-[#d09e2b] shadow-[inset_3px_0_0_0_#d09e2b]'
                                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                            }`}
                          >
                            Tài Liệu Kỹ Thuật
                            {activeNewsTab === 'kb' && <ChevronRight className="w-4 h-4 text-[#d09e2b]" />}
                          </button>

                          <button
                            onMouseEnter={() => setActiveNewsTab('support')}
                            onClick={() => setActiveNewsTab('support')}
                            className={`w-full text-left px-5 py-3 text-[13px] font-semibold transition-all flex items-center justify-between outline-none ${
                              activeNewsTab === 'support'
                                ? 'bg-white text-[#d09e2b] shadow-[inset_3px_0_0_0_#d09e2b]'
                                : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900'
                            }`}
                          >
                            Hỗ Trợ Kỹ Thuật
                            {activeNewsTab === 'support' && <ChevronRight className="w-4 h-4 text-[#d09e2b]" />}
                          </button>
                        </div>
                      </div>

                      {/* Right Content */}
                      <div className="flex-1 p-6 bg-white min-h-[350px]">
                        {isNewsDataLoading ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-[#d09e2b] border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        ) : activeNewsTab === 'news' ? (
                          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h3 className="text-[14px] font-bold text-[#1F1F1F] flex items-center gap-2">
                                <Cpu className="w-4 h-4 text-[#d09e2b]" /> Tin Công Nghệ Mới Nhất
                              </h3>
                              <Link href="/news" onClick={() => setNewsDropdownOpen(false)} className="text-[12px] font-semibold text-[#d09e2b] hover:underline flex items-center gap-1">
                                Xem tất cả <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              {newsList.length > 0 ? newsList.slice(0, 4).map((item: any, idx: number) => (
                                <Link key={idx} href={`/news/${item.slug}`} onClick={() => setNewsDropdownOpen(false)} className="group block">
                                  <div className="text-[13px] font-bold text-slate-800 group-hover:text-[#d09e2b] line-clamp-2 leading-tight transition-colors">
                                    {item.title}
                                  </div>
                                  <div className="text-[11px] text-slate-500 mt-1">{new Date(item.createdAt || Date.now()).toLocaleDateString('vi-VN')}</div>
                                </Link>
                              )) : (
                                <p className="text-[13px] text-slate-500 col-span-2">Đang cập nhật tin tức mới...</p>
                              )}
                            </div>
                          </div>
                        ) : activeNewsTab === 'promotions' ? (
                          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h3 className="text-[14px] font-bold text-[#1F1F1F] flex items-center gap-2">
                                <Megaphone className="w-4 h-4 text-[#d09e2b]" /> Chương Trình Khuyến Mãi
                              </h3>
                              <Link href="/promotions" onClick={() => setNewsDropdownOpen(false)} className="text-[12px] font-semibold text-[#d09e2b] hover:underline flex items-center gap-1">
                                Xem tất cả <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                              {promotionsList.length > 0 ? promotionsList.slice(0, 3).map((promo: any, idx: number) => (
                                <Link key={idx} href={`/promotions/${promo.slug}`} onClick={() => setNewsDropdownOpen(false)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                                  <div className="w-10 h-10 rounded bg-[#d09e2b]/10 flex items-center justify-center shrink-0 text-[#d09e2b]">
                                    <Gift className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-bold text-slate-800 group-hover:text-[#d09e2b] line-clamp-1">{promo.title}</div>
                                    <div className="text-[12px] text-slate-500 line-clamp-1">{promo.description}</div>
                                  </div>
                                </Link>
                              )) : (
                                <p className="text-[13px] text-slate-500">Chưa có chương trình khuyến mãi nào.</p>
                              )}
                            </div>
                          </div>
                        ) : activeNewsTab === 'kb' ? (
                          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h3 className="text-[14px] font-bold text-[#1F1F1F] flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-[#d09e2b]" /> Tài Liệu Kỹ Thuật (Knowledge Base)
                              </h3>
                              <Link href="/knowledge-base" onClick={() => setNewsDropdownOpen(false)} className="text-[12px] font-semibold text-[#d09e2b] hover:underline flex items-center gap-1">
                                Truy cập Thư viện <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                              {kbList.length > 0 ? kbList.slice(0, 6).map((kb: any, idx: number) => (
                                <Link key={idx} href={`/knowledge-base/${kb.slug}`} onClick={() => setNewsDropdownOpen(false)} className="flex items-start gap-2 group">
                                  <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0 group-hover:text-[#d09e2b]" />
                                  <span className="text-[13px] text-slate-700 group-hover:text-[#1F1F1F] line-clamp-2">{kb.title}</span>
                                </Link>
                              )) : (
                                <p className="text-[13px] text-slate-500 col-span-2">Đang cập nhật tài liệu...</p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                              <h3 className="text-[14px] font-bold text-[#1F1F1F] flex items-center gap-2">
                                <LifeBuoy className="w-4 h-4 text-[#d09e2b]" /> Hỗ Trợ Khách Hàng
                              </h3>
                              <Link href="/dashboard/tickets/new" onClick={() => setNewsDropdownOpen(false)} className="text-[12px] font-semibold text-[#d09e2b] hover:underline flex items-center gap-1">
                                Gửi yêu cầu hỗ trợ <ArrowRight className="w-3 h-3" />
                              </Link>
                            </div>
                            
                            <div className="flex gap-4 mb-6">
                              <a href="tel:19001234" className="flex-1 bg-slate-50 hover:bg-[#d09e2b]/5 border border-slate-200 hover:border-[#d09e2b]/30 p-3 rounded-md flex flex-col items-center justify-center text-center transition-colors">
                                <PhoneCall className="w-5 h-5 text-slate-700 mb-1" />
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Hotline 24/7</span>
                                <span className="text-[14px] font-black text-[#1F1F1F]">1900 1234</span>
                              </a>
                              <button className="flex-1 bg-slate-50 hover:bg-[#d09e2b]/5 border border-slate-200 hover:border-[#d09e2b]/30 p-3 rounded-md flex flex-col items-center justify-center text-center transition-colors">
                                <MessageSquare className="w-5 h-5 text-slate-700 mb-1" />
                                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Live Chat</span>
                                <span className="text-[14px] font-black text-[#1F1F1F]">Nhắn tin CSKH</span>
                              </button>
                            </div>

                            {token ? (
                              <>
                                <h4 className="text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-2">Ticket của bạn gần đây</h4>
                                {ticketsList.length > 0 ? (
                                  <div className="space-y-1">
                                    {ticketsList.slice(0, 3).map((ticket: any, idx: number) => (
                                      <Link key={idx} href={`/dashboard/tickets/${ticket.id}`} onClick={() => setNewsDropdownOpen(false)} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100">
                                        <span className="text-[13px] font-medium text-slate-700 truncate max-w-[220px]">{ticket.subject}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${ticket.status === 0 ? 'bg-amber-100 text-amber-700' : 'bg-slate-200 text-slate-700'}`}>
                                          {ticket.status === 0 ? 'Đang mở' : 'Đã đóng'}
                                        </span>
                                      </Link>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-[13px] text-slate-500">Bạn chưa có ticket nào gần đây.</p>
                                )}
                              </>
                            ) : (
                              <p className="text-[13px] text-slate-500 bg-slate-50 p-3 rounded text-center border border-slate-100">Vui lòng <Link href="/login" className="text-[#d09e2b] font-bold hover:underline">Đăng nhập</Link> để xem các ticket hỗ trợ của bạn.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative shrink-0"
              onMouseEnter={() => setSupportDropdownOpen(true)}
              onMouseLeave={() => setSupportDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setSupportDropdownOpen(open => !open)}
                aria-expanded={supportDropdownOpen}
                aria-haspopup="true"
                className={`${navLinkBase} ${isSupportActive ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900 font-bold'}`}
              >
                <span>Hỗ trợ</span>
                {isSupportActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#1F1F1F] rounded-full transition-all duration-300" />
                )}
              </button>

              {supportDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[280px] z-50">
                  <div className="bg-white rounded-md shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-1">
                    <Link
                      href="/knowledge-base"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded hover:bg-zinc-50 transition-colors group bg-zinc-50 border border-zinc-200"
                    >
                      <div className="w-8 h-8 rounded-sm bg-black text-white flex items-center justify-center shrink-0 shadow-2xs">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-black text-black group-hover:text-zinc-700 flex items-center gap-1.5">
                          <span>Knowledge Base</span>
                          <span className="text-[10px] font-bold bg-black text-white px-1.5 py-0.2 rounded-full">Hot</span>
                        </div>
                        <p className="text-[11px] text-zinc-500 font-medium">Tài liệu kỹ thuật &amp; hướng dẫn cài đặt</p>
                      </div>
                    </Link>

                    <Link
                      href="/support/tickets"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-sm bg-slate-100/70 text-[#1F1F1F] flex items-center justify-center shrink-0">
                        <LifeBuoy className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-[#1F1F1F]">Yêu cầu hỗ trợ (Tickets)</div>
                        <p className="text-[11px] text-slate-500 font-medium">Hỗ trợ kỹ thuật 24/7/365</p>
                      </div>
                    </Link>

                    <Link
                      href="/faqs"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-sm bg-slate-100/70 text-[#1F1F1F] flex items-center justify-center shrink-0">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-[#1F1F1F]">Câu hỏi thường gặp (FAQ)</div>
                        <p className="text-[11px] text-slate-500 font-medium">Giải đáp thắc mắc dịch vụ</p>
                      </div>
                    </Link>

                    <Link
                      href="/resources"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-sm bg-slate-100/70 text-[#1F1F1F] flex items-center justify-center shrink-0">
                        <DownloadCloud className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-[#1F1F1F]">Tài nguyên & Phần mềm</div>
                        <p className="text-[11px] text-slate-500 font-medium">Tool SSH, template & scripts</p>
                      </div>
                    </Link>

                    <Link
                      href="/status"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded hover:bg-slate-50 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-sm bg-slate-100/70 text-[#1F1F1F] flex items-center justify-center shrink-0">
                        <ActivitySquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-[#1F1F1F]">Trạng thái hệ thống</div>
                        <p className="text-[11px] text-slate-500 font-medium">Uptime mạng & máy chủ</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/knowledge-base"
              className={`${navLinkBase} ${isKnowledgeActive ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900 font-bold'}`}
            >
              <span>Tài liệu</span>
              {isKnowledgeActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#1F1F1F] rounded-full transition-all duration-300" />
              )}
            </Link>

            <Link
              href="/contact"
              className={`${navLinkBase} ${isContactActive ? 'text-slate-900 font-black' : 'text-slate-600 hover:text-slate-900 font-bold'}`}
            >
              <span>Liên hệ</span>
              {isContactActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2.5px] bg-[#1F1F1F] rounded-full transition-all duration-300" />
              )}
            </Link>

            {/* Staff / Admin Panel Quick Link with Role-Specific Color Coding */}
            {(() => {
              const panelInfo = getStaffPanelInfo(user?.role);
              if (!panelInfo) return null;
              return (
                <Link
                  href="/admin"
                  className={`px-3.5 py-2 rounded text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${panelInfo.className}`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>{panelInfo.title}</span>
                </Link>
              );
            })()}
          </nav>

          {/* Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <GlobalSearch />

            <Link
              href="/cart"
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded transition-colors shrink-0 flex items-center justify-center"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-2 lg:px-3 lg:py-1.5 rounded-full hover:bg-slate-100 transition shrink-0"
                  onClick={() => setIsTopUpOpen(true)}
                  title="Nạp tiền vào ví CloudHost"
                >
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="hidden xl:inline text-xs font-bold text-slate-800 whitespace-nowrap">
                    {walletBalance.toLocaleString('vi-VN')} đ
                  </span>
                </button>

                <Link
                  href="/dashboard"
                  className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-[#1F1F1F] font-bold shrink-0 transition-colors shadow-xs"
                  title={`Bảng điều khiển - ${user?.fullName || user?.email || 'Tài khoản'}`}
                >
                  {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                </Link>

                <button
                  onClick={logout}
                  className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0"
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <>
                <button onClick={() => handleOpenAuth('login')} className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors cursor-pointer">
                  <User className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
                <button onClick={() => handleOpenAuth('register')} className="hidden lg:block px-4 py-2 bg-[#1F1F1F] hover:bg-black text-white text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer">
                  <span>Đăng ký</span>
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-3 animate-in slide-in-from-top duration-200 max-h-[85vh] overflow-y-auto">
            <div className="space-y-1">
              {navItems.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-2.5 rounded text-sm font-bold transition-all ${pathname === item.href || (item.href !== '/' && item.href !== '/#contact' && pathname.startsWith(item.href))
                      ? 'bg-blue-50 text-[#1F1F1F]'
                      : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Quick Mobile Services Grid for all 12 services */}
            <div className="p-3 bg-slate-50 rounded-md border border-slate-100">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2.5 px-1 flex items-center justify-between">
                <span>Toàn bộ 12 Dịch Vụ Cloud</span>
                <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-[#1F1F1F] font-bold lowercase">
                  xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Cloud VPS', href: '/services/cloud-vps', icon: Server, color: 'text-[#1F1F1F]' },
                  { label: 'Dedicated Server', href: '/services/dedicated-servers', icon: Server, color: 'text-[#1F1F1F]' },
                  { label: 'Managed DB', href: '/services/databases', icon: Database, color: 'text-[#1F1F1F]' },
                  { label: 'Game Servers', href: '/services/game-servers', icon: Gamepad2, color: 'text-[#1F1F1F]' },
                  { label: '1-Click Apps', href: '/apps', icon: Boxes, color: 'text-[#1F1F1F]' },
                  { label: 'Static Sites', href: '/services/static-sites', icon: Globe, color: 'text-[#1F1F1F]' },
                  { label: 'Object Storage', href: '/services/storage', icon: HardDrive, color: 'text-[#1F1F1F]' },
                  { label: 'Chứng Chỉ SSL', href: '/services/ssl-certificates', icon: ShieldCheck, color: 'text-[#1F1F1F]' },
                  { label: 'Tên Miền (DNS)', href: '/domains', icon: Compass, color: 'text-[#1F1F1F]' },
                  { label: 'Bảo Mật & WAF', href: '/services/security', icon: Shield, color: 'text-[#1F1F1F]' },
                  { label: 'Chuyển Đổi Data', href: '/services/migrations', icon: ArrowLeftRight, color: 'text-[#1F1F1F]' },
                  { label: 'Web Hosting', href: '/services/hosting', icon: LayoutTemplate, color: 'text-[#1F1F1F]' },
                ].map((svc, idx) => (
                  <Link 
                    key={idx}
                    href={svc.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-white rounded border border-slate-200/70 text-xs font-bold text-slate-800 hover:text-[#1F1F1F] flex items-center gap-2 shadow-2xs"
                  >
                    <svc.icon className={`w-4 h-4 ${svc.color} shrink-0`} /> 
                    <span className="truncate">{svc.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Support Links */}
            <div className="flex items-center justify-between px-2 pt-1 text-xs font-semibold text-slate-600">
              <Link href="/news" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1F1F1F] flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5 text-amber-500" /> Tin tức & Ưu đãi
              </Link>
              <Link href="/support/tickets" onClick={() => setMobileMenuOpen(false)} className="hover:text-[#1F1F1F] flex items-center gap-1">
                <LifeBuoy className="w-3.5 h-3.5 text-[#1F1F1F]" /> Gửi Yêu Cầu Hỗ Trợ
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{user?.fullName || user?.email || 'Khách hàng'}</div>
                        <div className="text-[11px] font-semibold text-emerald-600">{walletBalance.toLocaleString('vi-VN')} đ</div>
                      </div>
                    </div>
                    <Link href="/dashboard/billing" onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-1.5 bg-[#1F1F1F] text-white font-bold text-xs rounded-full hover:bg-black shadow-xs transition-colors"
                    >
                      Nạp tiền
                    </Link>
                  </div>

                  {(() => {
                    const panelInfo = getStaffPanelInfo(user.role);
                    if (!panelInfo) return null;
                    return (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded font-bold text-xs ${panelInfo.mobileClass}`}
                      >
                        <Shield className="w-4 h-4" />
                        {panelInfo.title}
                      </Link>
                    );
                  })()}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded transition-colors"
                  >
                    Đăng xuất tài khoản
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      handleOpenAuth('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded"
                  >
                    Đăng nhập
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); handleOpenAuth('register'); }}
                    className="w-full text-center px-4 py-2.5 text-sm font-bold text-white bg-[#1F1F1F] hover:bg-black rounded-full shadow-md transition-colors"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentBalance={walletBalance}
      />
    </header>
  );
};
