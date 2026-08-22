'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud, Server, Globe, Shield, ShoppingCart, Menu, X, Cpu, ChevronDown, LogOut, Wallet,
  Gamepad2, Mail, Database, HardDrive, ShieldCheck, Zap, Layers, Palette, ShoppingBag, Activity, ArrowRight, Compass,
  LifeBuoy, Megaphone, BookOpen, DownloadCloud, ActivitySquare, Search, LayoutTemplate, Boxes, ArrowLeftRight
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useCartStore } from '../store/useCartStore';
import { api } from '../lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlobalSearch from './GlobalSearch';

const serviceCategories = [
  {
    name: 'Hạ tầng & Máy chủ',
    description: 'Cung cấp các dịch vụ hạ tầng máy chủ chuyên dụng, ảo hóa CPU AMD/Intel hiệu năng cao và container tối ưu.',
    services: [
      { id: 1, title: 'Cloud VPS NVMe', desc: 'Máy chủ ảo hiệu năng cao CPU AMD EPYC', link: '/services/cloud-vps', icon: Server, color: 'text-blue-600 bg-blue-50' },
      { id: 2, title: 'Dedicated Server', desc: 'Máy chủ vật lý riêng biệt Dual Xeon & EPYC', link: '/services/dedicated-servers', icon: Server, color: 'text-purple-600 bg-purple-50' },
      { id: 3, title: 'Game Servers', desc: 'Minecraft, CS2, Rust Anti-DDoS 500Gbps', link: '/services/game-servers', icon: Gamepad2, color: 'text-rose-600 bg-rose-50' },
      { id: 4, title: 'Static Sites (Nginx)', desc: 'Web tĩnh tốc độ cao trên container Nginx', link: '/services/static-sites', icon: Globe, color: 'text-cyan-600 bg-cyan-50' }
    ]
  },
  {
    name: 'Web & Bảo mật',
    description: 'Giải pháp lưu trữ web tốc độ cao, cài ứng dụng 1 chạm và bảo vệ đường truyền đạt chuẩn quốc tế.',
    services: [
      { id: 1, title: 'NVMe Web Hosting', desc: 'LiteSpeed + cPanel tối ưu tốc độ WordPress', link: '/services/hosting', icon: LayoutTemplate, color: 'text-emerald-600 bg-emerald-50' },
      { id: 2, title: '1-Click Apps Installer', desc: 'Cài WordPress, Ghost, Nextcloud, n8n 60s', link: '/apps', icon: Boxes, color: 'text-amber-600 bg-amber-50' },
      { id: 3, title: 'Chứng Chỉ SSL / TLS', desc: 'Mã hóa HTTPS bảo hiểm $1.75M USD', link: '/services/ssl-certificates', icon: ShieldCheck, color: 'text-teal-600 bg-teal-50' },
      { id: 4, title: 'Tên Miền (DNS)', desc: 'Đăng ký .VN, .COM, .AI, .IO giá tốt', link: '/domains', icon: Compass, color: 'text-indigo-600 bg-indigo-50' }
    ]
  },
  {
    name: 'Dữ liệu & Giải pháp',
    description: 'Hệ sinh thái lưu trữ S3, cơ sở dữ liệu quản trị tự động và dịch vụ chuyển đổi dữ liệu toàn diện.',
    services: [
      { id: 1, title: 'Managed Databases', desc: 'PostgreSQL, MySQL, Redis HA tự động', link: '/services/databases', icon: Database, color: 'text-teal-600 bg-teal-50' },
      { id: 2, title: 'Object Storage (S3)', desc: 'MinIO S3 API All-Flash 11 số 9 độ bền', link: '/services/storage', icon: HardDrive, color: 'text-blue-600 bg-blue-50' },
      { id: 3, title: 'Bảo Mật & WAF', desc: 'Tường lửa AI, chống DDoS L7 & OWASP', link: '/services/security', icon: Shield, color: 'text-red-600 bg-red-50' },
      { id: 4, title: 'Chuyển Đổi Dữ Liệu', desc: 'Di dời Zero-Downtime 24/7 MIỄN PHÍ', link: '/services/migrations', icon: Activity, color: 'text-orange-600 bg-orange-50' }
    ]
  }
];

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
  const [activeServiceCategory, setActiveServiceCategory] = useState(0);
  const [supportDropdownOpen, setSupportDropdownOpen] = useState(false);
  const { user, setUser, logout, token } = useAuthStore();
  const walletBalance = user?.walletBalance ?? 0;

  useEffect(() => {
    const savedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null);
    if (savedToken && !user) {
      api.get('/users/me')
        .then(res => {
          if (res.data) {
            setUser({
              id: res.data.id,
              email: res.data.email,
              fullName: res.data.fullName || res.data.email,
              role: res.data.role || res.data.roleName || (res.data.roles && res.data.roles[0]),
              walletBalance: res.data.walletBalance ?? 0
            });
          }
        })
        .catch(() => { });
    }
  }, [token, user, setUser]);

  const navLinkBase =
    'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center shrink-0';
  const isServicesActive = pathname.startsWith('/services') || servicesDropdownOpen;
  const isHomeActive = pathname === '/' && !servicesDropdownOpen;

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
          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1.5 min-w-0">
            <Link
              href="/"
              className={`${navLinkBase} relative ${isHomeActive
                  ? 'text-blue-600 bg-blue-50/80 font-black'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
            >
              Trang chủ
              {isHomeActive && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-blue-600 rounded-full" />
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
                className={`${navLinkBase} gap-1 ${servicesDropdownOpen || pathname.startsWith('/services')
                    ? 'text-blue-600 bg-blue-50/80 font-black'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
              >
                Dịch vụ
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${servicesDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {servicesDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[940px] max-w-[95vw] z-50">
                  <div className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] border border-slate-200 flex flex-col overflow-hidden min-h-[420px] animate-in fade-in slide-in-from-top-2 duration-200">
                    
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
                              className={`w-full text-left px-4 py-3.5 rounded-2xl text-[14px] font-bold transition-all flex items-center justify-between outline-none ${
                                activeServiceCategory === idx
                                  ? 'bg-white text-blue-600 shadow-sm border border-slate-200/80 font-black'
                                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900'
                              }`}
                            >
                              <span>{cat.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                                activeServiceCategory === idx ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
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
                            className="block p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-300 transition-all group"
                          >
                            <div className="text-xs font-black text-blue-900 group-hover:text-blue-600 flex items-center justify-between">
                              <span>Xem Tất Cả 12 Gói Dịch Vụ</span>
                              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                            </div>
                            <p className="text-[11px] text-blue-800/80 mt-0.5 font-medium">Bảng giá tổng hợp & so sánh</p>
                          </Link>
                        </div>
                      </div>

                      {/* Right Content */}
                      <div className="flex-1 p-6 sm:p-7 bg-white flex flex-col justify-between">
                        <div>
                          {/* Banner */}
                          <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 shadow-2xs">
                              <Cloud className="w-6 h-6 text-blue-600" />
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
                                  className="flex items-start gap-3.5 p-3.5 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group"
                                >
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${service.color} transition-transform group-hover:scale-110 shadow-2xs`}>
                                    <SIcon className="w-5 h-5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-[13px] font-black text-slate-900 group-hover:text-blue-600 transition-colors mb-0.5 truncate">
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
                          <span className="font-semibold text-slate-700">⚡ Triển khai tự động trong 30-60 giây</span>
                          <Link
                            href="/services"
                            onClick={() => setServicesDropdownOpen(false)}
                            className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                className={`${navLinkBase} gap-1 ${supportDropdownOpen || pathname.startsWith('/support') || pathname.startsWith('/news') || pathname.startsWith('/knowledge-base') || pathname.startsWith('/resources') || pathname.startsWith('/status')
                    ? 'text-blue-600 bg-blue-50/80 font-black'
                    : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                  }`}
              >
                Hỗ trợ
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${supportDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
              </button>

              {supportDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[280px] z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200 flex flex-col gap-1">
                    <Link
                      href="/support/tickets"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0">
                        <LifeBuoy className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-blue-600">Yêu cầu hỗ trợ</div>
                      </div>
                    </Link>

                    <Link
                      href="/news"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-amber-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0">
                        <Megaphone className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-amber-600">Thông báo</div>
                      </div>
                    </Link>

                    <Link
                      href="/knowledge-base"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">Thư viện tài liệu</div>
                      </div>
                    </Link>

                    <Link
                      href="/resources"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-emerald-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0">
                        <DownloadCloud className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-emerald-600">Tài nguyên & Phần mềm</div>
                      </div>
                    </Link>

                    <Link
                      href="/status"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-rose-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0">
                        <ActivitySquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-rose-600">Trạng thái hệ thống</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className={`${navLinkBase} ${pathname === '/contact'
                  ? 'text-blue-600 bg-blue-50/80 font-black'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
            >
              Liên hệ
            </Link>

            {/* Admin Panel Quick Link for Staff / Admin */}
            {(user?.role === 'Admin' || user?.role === 'Editor') && (
              <Link
                href="/admin"
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-rose-600 text-slate-900 shadow-xs hover:shadow-red-500/20 hover:from-red-500 hover:to-rose-500 transition-all flex items-center gap-1.5 shrink-0"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>

          {/* Action Icons & Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <GlobalSearch />

            <button
              onClick={handleOpenCart}
              className="relative p-2 text-slate-700 hover:bg-slate-100 rounded-xl transition-colors shrink-0"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-600 text-slate-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {user ? (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 lg:px-3 lg:py-1.5 rounded-full hover:bg-slate-100 transition shrink-0"
                  onClick={() => {
                    const amountStr = prompt('Nhập số tiền muốn nạp vào ví (VNĐ):', '500000');
                    if (amountStr) {
                      api.post('/wallet/top-up', { amount: parseInt(amountStr) })
                        .then(() => { alert('Nạp tiền thành công!'); window.location.reload(); })
                        .catch(() => alert('Nạp tiền thất bại!'));
                    }
                  }}
                  title="Nạp tiền vào ví"
                >
                  <Wallet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="hidden xl:inline text-xs font-bold text-slate-800 whitespace-nowrap">
                    {walletBalance.toLocaleString('vi-VN')} đ
                  </span>
                </button>

                <Link
                  href="/dashboard"
                  className="w-8 h-8 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center text-blue-600 font-bold shrink-0 transition-colors shadow-xs"
                  title={`Bảng điều khiển - ${user.fullName}`}
                >
                  {user.fullName.charAt(0).toUpperCase()}
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
                <button
                  onClick={() => handleOpenAuth('login')}
                  className="hidden md:inline-flex px-3 py-2 text-sm font-semibold text-slate-800 hover:text-blue-600 transition-colors whitespace-nowrap shrink-0"
                >
                  Đăng nhập
                </button>
                <button
                  onClick={() => handleOpenAuth('register')}
                  className="px-3 sm:px-4 py-2 text-sm font-bold text-slate-900 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all whitespace-nowrap shrink-0"
                >
                  Đăng ký
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
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
                  className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${pathname === item.href || (item.href !== '/' && item.href !== '/#contact' && pathname.startsWith(item.href))
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Quick Mobile Services Grid for all 12 services */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="text-[11px] font-black uppercase tracking-wider text-slate-600 mb-2.5 px-1 flex items-center justify-between">
                <span>Toàn bộ 12 Dịch Vụ Cloud</span>
                <Link href="/services" onClick={() => setMobileMenuOpen(false)} className="text-blue-600 font-bold lowercase">
                  xem tất cả →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { label: 'Cloud VPS', href: '/services/cloud-vps', icon: Server, color: 'text-blue-600' },
                  { label: 'Dedicated Server', href: '/services/dedicated-servers', icon: Server, color: 'text-purple-600' },
                  { label: 'Managed DB', href: '/services/databases', icon: Database, color: 'text-teal-600' },
                  { label: 'Game Servers', href: '/services/game-servers', icon: Gamepad2, color: 'text-rose-600' },
                  { label: '1-Click Apps', href: '/apps', icon: Boxes, color: 'text-amber-600' },
                  { label: 'Static Sites', href: '/services/static-sites', icon: Globe, color: 'text-cyan-600' },
                  { label: 'Object Storage', href: '/services/storage', icon: HardDrive, color: 'text-blue-600' },
                  { label: 'Chứng Chỉ SSL', href: '/services/ssl-certificates', icon: ShieldCheck, color: 'text-teal-600' },
                  { label: 'Tên Miền (DNS)', href: '/domains', icon: Compass, color: 'text-indigo-600' },
                  { label: 'Bảo Mật & WAF', href: '/services/security', icon: Shield, color: 'text-red-600' },
                  { label: 'Chuyển Đổi Data', href: '/services/migrations', icon: ArrowLeftRight, color: 'text-orange-600' },
                  { label: 'Web Hosting', href: '/services/hosting', icon: LayoutTemplate, color: 'text-emerald-600' },
                ].map((svc, idx) => (
                  <Link 
                    key={idx}
                    href={svc.href} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2.5 bg-white rounded-xl border border-slate-200/70 text-xs font-bold text-slate-800 hover:text-blue-600 flex items-center gap-2 shadow-2xs"
                  >
                    <svc.icon className={`w-4 h-4 ${svc.color} shrink-0`} /> 
                    <span className="truncate">{svc.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Quick Support Links */}
            <div className="flex items-center justify-between px-2 pt-1 text-xs font-semibold text-slate-600">
              <Link href="/news" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 flex items-center gap-1">
                <Megaphone className="w-3.5 h-3.5 text-amber-500" /> Tin tức & Ưu đãi
              </Link>
              <Link href="/support/tickets" onClick={() => setMobileMenuOpen(false)} className="hover:text-blue-600 flex items-center gap-1">
                <LifeBuoy className="w-3.5 h-3.5 text-blue-500" /> Gửi Yêu Cầu Hỗ Trợ
              </Link>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <div className="flex items-center justify-between p-3 bg-blue-50/70 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {user.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 truncate max-w-[160px]">{user.fullName}</div>
                        <div className="text-[11px] font-semibold text-emerald-600">{walletBalance.toLocaleString('vi-VN')} đ</div>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-3 py-1.5 bg-blue-600 text-white font-bold text-xs rounded-lg hover:bg-blue-700 shadow-xs"
                    >
                      Bảng điều khiển
                    </Link>
                  </div>

                  {(user.role === 'Admin' || user.role === 'Editor') && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
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
                    className="w-full text-center px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => {
                      handleOpenAuth('register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-center px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20"
                  >
                    Đăng ký
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
