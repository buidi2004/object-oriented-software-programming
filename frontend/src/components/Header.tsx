'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud, Server, Globe, Shield, ShoppingCart, Menu, X, Cpu, ChevronDown, LogOut, Wallet,
  Gamepad2, Mail, Database, HardDrive, ShieldCheck, Zap, Layers, Palette, ShoppingBag, Activity, ArrowRight, Compass,
  LifeBuoy, Megaphone, BookOpen, DownloadCloud, ActivitySquare, Search, LayoutTemplate, Boxes, ArrowLeftRight, User, HelpCircle,
  ChevronRight, Gift, FileText, PhoneCall, MessageSquare, GraduationCap, HeartPulse
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
      { id: 3, title: 'Giải pháp Enterprise', desc: 'Hạ tầng chịu tải lớn, sẵn sàng 99.99%', link: '/solutions/enterprise', icon: Server, color: 'text-[#1F1F1F] bg-slate-200' },
      { id: 4, title: 'SaaS Providers', desc: 'Hạ tầng Microservices linh hoạt', link: '/solutions/saas', icon: Layers, color: 'text-[#1F1F1F] bg-emerald-100' },
      { id: 13, title: 'Trường học & E-Learning', desc: 'Hệ thống LMS tải cực cao, không rớt mạng', link: '/solutions/education', icon: GraduationCap, color: 'text-[#1F1F1F] bg-emerald-100' }
    ]
  },
  {
    name: 'Theo ngành nghề',
    description: 'Kiến trúc chuyên biệt giải quyết bài toán của từng lĩnh vực.',
    services: [
      { id: 5, title: 'Thương mại điện tử', desc: 'Chống giật lag mùa Sale, bảo mật WAF', link: '/solutions/ecommerce', icon: ShoppingBag, color: 'text-[#1F1F1F] bg-pink-100' },
      { id: 6, title: 'Game Studio', desc: 'Máy chủ Low-ping, chống DDoS 500Gbps', link: '/solutions/gaming', icon: Gamepad2, color: 'text-[#1F1F1F] bg-purple-100' },
      { id: 7, title: 'Fintech & Ngân hàng', desc: 'Độ trễ bằng 0, bảo mật PCI-DSS', link: '/solutions/fintech', icon: Shield, color: 'text-[#1F1F1F] bg-blue-100' },
      { id: 8, title: 'Media & Streaming', desc: 'Livestream mượt mà cho hàng triệu user', link: '/solutions/media', icon: Globe, color: 'text-[#1F1F1F] bg-pink-100' },
      { id: 14, title: 'Y tế & Chăm sóc sức khỏe', desc: 'Lưu trữ bệnh án điện tử, an toàn chuẩn y tế', link: '/solutions/healthcare', icon: HeartPulse, color: 'text-[#1F1F1F] bg-red-100' }
    ]
  },
  {
    name: 'Nhu cầu chuyên biệt',
    description: 'Các giải pháp hạ tầng mở rộng và tuân thủ tiêu chuẩn.',
    services: [
      { id: 9, title: 'Cloud Migration', desc: 'Dịch chuyển lên mây an toàn, 0 downtime', link: '/solutions/migration', icon: ArrowLeftRight, color: 'text-[#1F1F1F] bg-orange-100' },
      { id: 10, title: 'Tối ưu Bảo mật (Security)', desc: 'Ngăn chặn tấn công L7 & lộ lọt dữ liệu', link: '/solutions/security', icon: ShieldCheck, color: 'text-[#1F1F1F] bg-red-100' },
      { id: 11, title: 'Agency & Developer', desc: 'Quản trị tập trung, CI/CD, 1-Click Apps', link: '/solutions/agency', icon: Cpu, color: 'text-[#1F1F1F] bg-green-100' },
      { id: 12, title: 'AI & Machine Learning', desc: 'Training AI tốc độ cao với Server GPU', link: '/solutions/ai', icon: Cpu, color: 'text-[#1F1F1F] bg-purple-100' }
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
  const [isScrolledDown, setIsScrolledDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { user, setUser, logout, token } = useAuthStore();
  const walletBalance = user?.walletBalance ?? 0;

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        setIsScrolledDown(true);
      } else {
        setIsScrolledDown(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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
    'relative px-3 h-full text-[13px] transition-colors flex items-center shrink-0 bg-transparent text-slate-700 hover:text-black hover:underline decoration-1 underline-offset-[6px]';
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
    { id: 'partners', label: 'Đối tác', href: '/partners' },
    { id: 'careers', label: 'Tuyển dụng', href: '/careers' },
    { id: 'contact', label: 'Liên hệ', href: '/contact' },
  ];

  return (
    <header className={`sticky top-0 z-40 w-full flex flex-col transition-transform duration-300 ease-in-out ${isScrolledDown ? '-translate-y-full' : 'translate-y-0'}`}>
      {/* Main Nav */}
      <div className="w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-20 h-[54px] flex items-center justify-between gap-4">
          {/* Brand & Left Nav */}
          <div className="flex items-center gap-4 xl:gap-5 shrink-0 h-full">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <img
                src="/images/logo.png"
                alt="CloudHost VN"
                className="h-5 sm:h-6 w-auto object-contain transition-transform"
              />
              <div className="w-[1px] h-6 bg-slate-400 hidden sm:block"></div>
              <span className="font-semibold text-slate-900 hidden sm:block tracking-wide text-[16px]">Cloud</span>
            </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 min-w-0 h-full ml-6">
            <Link href="/explore" className="px-3 h-full flex items-center text-[13px] text-slate-700 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors">
                Khám phá
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
                className={`${navLinkBase} ${isServicesActive ? 'text-black font-semibold' : ''}`}
              >
                <span>Các sản phẩm</span> <ChevronDown className="w-[10px] h-[10px] ml-1.5 text-slate-500 mt-0.5" />
</button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-[-150px] pt-2 w-[940px] max-w-[95vw] z-50">
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
                className={`${navLinkBase} ${solutionsDropdownOpen ? 'text-black font-semibold' : ''}`}
              >
                <span>Giải pháp</span> <ChevronDown className="w-[10px] h-[10px] ml-1.5 text-slate-500 mt-0.5" />
</button>

              {/* Mega menu */}
              {solutionsDropdownOpen && (
                <div className="absolute top-full left-[-200px] pt-2 w-[800px] max-w-[80vw] z-50">
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


            
            <Link href="/partners" className="px-3 h-full flex items-center text-[13px] text-slate-700 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors">
              Đối tác
            </Link>

            <Link href="/careers" className="px-3 h-full flex items-center text-[13px] text-slate-700 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors">
              Tuyển dụng
            </Link>

            {/* Tin tức & Hỗ trợ Dropdown */}
            <div
              className="relative shrink-0"
              onMouseEnter={() => setNewsDropdownOpen(true)}
              onMouseLeave={() => setNewsDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setNewsDropdownOpen(open => !open)}
                aria-expanded={newsDropdownOpen}
                aria-haspopup="true"
                className={`${navLinkBase} ${newsDropdownOpen ? 'text-black font-semibold' : ''}`}
              >
                <span>Tài nguyên</span> <ChevronDown className={`w-[10px] h-[10px] ml-1.5 text-slate-500 mt-0.5 transition-transform duration-200 ${newsDropdownOpen ? 'rotate-180' : ''}`} />
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
                                <Link key={idx} href={`/blog/${item.slug}`} onClick={() => setNewsDropdownOpen(false)} className="group block">
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
                                <Link key={idx} href={`/promotions`} onClick={() => setNewsDropdownOpen(false)} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
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
          </div>

          {/* Right Nav & CTA */}
          <div className="flex items-center gap-3 shrink-0 h-full">
            <nav className="hidden xl:flex items-center gap-3 text-[13px] text-slate-700 h-full mr-2">
              <Link href="/search" className="px-3 hover:text-black hover:underline decoration-1 underline-offset-[6px] flex items-center gap-2 transition-colors h-full">
                <span className="hidden lg:block">Tìm kiếm</span> <Search className="w-3.5 h-3.5 text-slate-700" />
              </Link>
              <Link href="/knowledge-base" className="px-3 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors flex items-center h-full">Học hỏi</Link>
              <Link href="/support" className="px-3 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors flex items-center h-full">Ủng hộ</Link>
              <Link href="/contact" className="px-3 hover:text-black hover:underline decoration-1 underline-offset-[6px] transition-colors flex items-center h-full">Liên hệ bộ phận bán hàng</Link>
            </nav>

            <div className="flex items-center gap-2.5">
              {token ? (
                <>
                  <Link href="/dashboard" className="px-4 py-1.5 bg-[#d09e2b] text-white rounded-sm text-[13px] font-semibold hover:bg-[#b58825] transition-colors hidden sm:flex items-center gap-2 border border-transparent shadow-sm">
                    Bảng điều khiển
                  </Link>
                  <button onClick={logout} className="px-4 py-1.5 border border-rose-500 text-rose-500 rounded-sm text-[13px] font-semibold hover:bg-rose-50 transition-colors hidden sm:block">
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleOpenAuth('register')} className="px-4 py-1.5 bg-[#d09e2b] text-white rounded-sm text-[13px] font-semibold hover:bg-[#b58825] transition-colors hidden sm:block border border-transparent shadow-sm">Bắt đầu sử dụng Cloud</button>
                  <button onClick={() => handleOpenAuth('login')} className="px-4 py-1.5 border border-slate-900 rounded-sm text-[13px] font-semibold text-slate-900 hover:bg-slate-50 transition-colors hidden sm:block">Đăng nhập</button>
                </>
              )}
            </div>
            
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
            <div className="space-y-1.5">
              {navItems.map(item => (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block w-full text-left px-4 py-3.5 rounded-xl text-[15px] font-bold transition-all ${pathname === item.href || (item.href !== '/' && item.href !== '/#contact' && pathname.startsWith(item.href))
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-50 active:bg-slate-100'
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
              <div className="grid grid-cols-2 gap-2.5 mt-3">
                {[
                  { label: 'Cloud VPS', href: '/services/cloud-vps', icon: Server, color: 'text-blue-600' },
                  { label: 'Dedicated Server', href: '/services/dedicated-servers', icon: Server, color: 'text-indigo-600' },
                  { label: 'Managed DB', href: '/services/databases', icon: Database, color: 'text-emerald-600' },
                  { label: 'Game Servers', href: '/services/game-servers', icon: Gamepad2, color: 'text-purple-600' },
                  { label: '1-Click Apps', href: '/apps', icon: Boxes, color: 'text-orange-600' },
                  { label: 'Static Sites', href: '/services/static-sites', icon: Globe, color: 'text-sky-600' },
                  { label: 'Object Storage', href: '/services/storage', icon: HardDrive, color: 'text-teal-600' },
                  { label: 'Chứng Chỉ SSL', href: '/services/ssl-certificates', icon: ShieldCheck, color: 'text-rose-600' },
                  { label: 'Tên Miền (DNS)', href: '/domains', icon: Compass, color: 'text-cyan-600' },
                  { label: 'Bảo Mật & WAF', href: '/services/security', icon: Shield, color: 'text-red-600' },
                  { label: 'Chuyển Đổi Data', href: '/services/migrations', icon: ArrowLeftRight, color: 'text-amber-600' },
                  { label: 'Web Hosting', href: '/services/hosting', icon: LayoutTemplate, color: 'text-pink-600' },
                ].map((svc, idx) => (
                  <Link 
                    key={idx}
                    href={svc.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-3 bg-white rounded-xl border border-slate-200/70 text-[13px] font-bold text-slate-800 active:scale-[0.98] transition-transform flex flex-col items-center justify-center gap-2 shadow-sm text-center min-h-[80px]"
                  >
                    <div className={`p-2 rounded-full bg-slate-50 border border-slate-100 ${svc.color}`}>
                      <svc.icon className="w-5 h-5 shrink-0" />
                    </div>
                    <span className="truncate w-full text-center leading-tight">{svc.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Support Links */}
            <div className="flex flex-col gap-2 mt-4 px-2">
              <Link href="/news" onClick={() => setMobileMenuOpen(false)} className="py-3 text-[14px] font-semibold text-slate-700 hover:text-black flex items-center gap-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100"><Megaphone className="w-4 h-4 text-amber-500" /></div> 
                Tin tức & Ưu đãi
              </Link>
              <Link href="/support/tickets" onClick={() => setMobileMenuOpen(false)} className="py-3 text-[14px] font-semibold text-slate-700 hover:text-black flex items-center gap-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200"><LifeBuoy className="w-4 h-4 text-slate-700" /></div>
                Gửi Yêu Cầu Hỗ Trợ
              </Link>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shadow-inner">
                        {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 truncate max-w-[150px]">{user?.fullName || user?.email || 'Khách hàng'}</div>
                        <div className="text-[13px] font-black text-emerald-600">{walletBalance.toLocaleString('vi-VN')} đ</div>
                      </div>
                    </div>
                    <Link href="/dashboard/billing" onClick={() => setMobileMenuOpen(false)}
                      className="px-5 py-2.5 bg-slate-900 text-white font-bold text-sm rounded-lg hover:bg-black shadow-md transition-colors active:scale-95"
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
                        className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm shadow-sm ${panelInfo.mobileClass}`}
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
                    className="w-full text-center px-4 py-3.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-100 transition-colors active:bg-rose-100"
                  >
                    Đăng xuất tài khoản
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      handleOpenAuth('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-3.5 border-2 border-slate-200 rounded-xl text-[15px] font-bold text-slate-700 active:bg-slate-50 transition-colors"
                  >
                    Đăng nhập
                  </button>
                  <button onClick={() => { setMobileMenuOpen(false); handleOpenAuth('register'); }}
                    className="w-full py-3.5 bg-slate-900 text-white rounded-xl text-[15px] font-bold shadow-md active:scale-[0.98] transition-all"
                  >
                    Tạo tài khoản mới
                  </button>
                </>
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
