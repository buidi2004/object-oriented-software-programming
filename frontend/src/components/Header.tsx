'use client';

import React, { useState, useEffect } from 'react';
import {
  Cloud, Server, Globe, Shield, ShoppingCart, Menu, X, Cpu, ChevronDown, LogOut, Wallet,
  Gamepad2, Mail, Database, HardDrive, ShieldCheck, Zap, Layers, Palette, ShoppingBag, Activity, ArrowRight, Compass,
  LifeBuoy, Megaphone, BookOpen, DownloadCloud, ActivitySquare, Search
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
    description: 'Cung cấp các dịch vụ trên hạ tầng chuyên dụng theo nhiều mô hình khác nhau, tùy thuộc vào nhu cầu của khách hàng.',
    services: [
      { id: 1, title: 'Cloud VPS NVMe', desc: 'Máy chủ ảo hiệu năng cao', link: '/services/cloud-vps', icon: Server, color: 'text-red-600 bg-red-50' },
      { id: 2, title: 'Dedicated Server', desc: 'Máy chủ vật lý riêng biệt', link: '/services/dedicated-server', icon: Cpu, color: 'text-red-600 bg-red-50' },
      { id: 3, title: 'Game Servers', desc: 'Minecraft, CS:GO, Rust', link: '/services/game-servers', icon: Gamepad2, color: 'text-red-600 bg-red-50' }
    ]
  },
  {
    name: 'Web & Bảo mật',
    description: 'Giải pháp lưu trữ web tốc độ cao và bảo mật đường truyền toàn diện đạt chuẩn quốc tế.',
    services: [
      { id: 1, title: 'NVMe Web Hosting', desc: 'LiteSpeed + LSCache tốc độ', link: '/services/hosting', icon: Globe, color: 'text-red-600 bg-red-50' },
      { id: 2, title: 'Chứng Chỉ SSL', desc: 'Bảo mật mã hóa DV/EV', link: '/services/ssl-certificates', icon: ShieldCheck, color: 'text-red-600 bg-red-50' },
      { id: 3, title: 'Đăng Ký Tên Miền', desc: '.VN, .COM, .AI, .IO giá tốt', link: '/services/domain', icon: Compass, color: 'text-red-600 bg-red-50' }
    ]
  },
  {
    name: 'Dữ liệu & Giải pháp',
    description: 'Hệ sinh thái lưu trữ và ứng dụng doanh nghiệp đáng tin cậy, vận hành mượt mà 24/7.',
    services: [
      { id: 1, title: 'Email Doanh Nghiệp', desc: 'Hòm thư bảo mật theo tên miền', link: '/services/email-hosting', icon: Mail, color: 'text-red-600 bg-red-50' },
      { id: 2, title: 'Cloud Storage', desc: 'Lưu trữ đám mây an toàn', link: '/services/storage', icon: HardDrive, color: 'text-red-600 bg-red-50' }
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
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[900px] max-w-[95vw] z-50">
                  <div className="bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] border border-slate-200 flex overflow-hidden min-h-[380px] animate-in fade-in slide-in-from-top-2 duration-200">

                    {/* Left Sidebar */}
                    <div className="w-1/3 bg-slate-50 border-r border-slate-200 py-4 flex flex-col">
                      {serviceCategories.map((cat, idx) => (
                        <button
                          key={idx}
                          onMouseEnter={() => setActiveServiceCategory(idx)}
                          onClick={() => setActiveServiceCategory(idx)}
                          className={`text-left px-6 py-4 text-[15px] font-semibold transition-all border-l-[3px] outline-none ${activeServiceCategory === idx
                              ? 'border-red-600 text-red-600 bg-white shadow-[-5px_0_15px_-10px_rgba(0,0,0,0.1)_inset]'
                              : 'border-transparent text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Right Content */}
                    <div className="w-2/3 p-8 bg-white flex flex-col">
                      {/* Banner */}
                      <div className="flex items-center gap-6 mb-8">
                        <div className="w-16 h-16 shrink-0 relative flex items-center justify-center">
                          <div className="absolute inset-0 bg-red-100 rounded-2xl transform rotate-3" />
                          <div className="absolute inset-0 bg-white border border-red-200 rounded-2xl shadow-sm transform -rotate-3 flex items-center justify-center">
                            <Cloud className="w-8 h-8 text-red-600 drop-shadow-md" />
                          </div>
                        </div>
                        <p className="text-[13px] text-slate-600 font-medium leading-relaxed max-w-sm">
                          {serviceCategories[activeServiceCategory].description}
                        </p>
                      </div>

                      {/* Grid of services */}
                      <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                        {serviceCategories[activeServiceCategory].services.map((service, idx) => {
                          const SIcon = service.icon;
                          return (
                            <Link
                              key={idx}
                              href={service.link}
                              onClick={() => setServicesDropdownOpen(false)}
                              className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-slate-100 transition-all group"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${service.color} transition-transform group-hover:scale-110 shadow-sm`}>
                                <SIcon className="w-5 h-5" />
                              </div>
                              <div>
                                <div className="text-[14px] font-bold text-slate-900 group-hover:text-red-600 transition-colors mb-1 line-clamp-1">
                                  {service.title}
                                </div>
                                <div className="text-[12px] font-medium text-slate-500 line-clamp-2 leading-snug">
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
                        <div className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">Cơ sở kiến thức</div>
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
                        <div className="text-sm font-bold text-slate-700 group-hover:text-emerald-600">Tài nguyên</div>
                      </div>
                    </Link>

                    <Link
                      href="/status"
                      onClick={() => setSupportDropdownOpen(false)}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-teal-50/70 transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-teal-100/70 text-teal-600 flex items-center justify-center shrink-0">
                        <ActivitySquare className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-700 group-hover:text-teal-600">Trạng thái mạng</div>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className={`${navLinkBase} ${pathname === '/contact'
                  ? 'text-blue-600 bg-blue-50/80'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
                }`}
            >
              Liên hệ
            </Link>

            {user && (user.role === 'Admin' || user.role === 'Editor') && (
              <Link
                href="/admin"
                className={`${navLinkBase} text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 font-bold gap-1`}
              >
                <Shield className="w-4 h-4 text-indigo-600" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Actions — luôn icon-first, không chiếm width cố định lớn */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1.5 shrink-0 ml-auto lg:ml-0">

            <button
              onClick={handleOpenCart}
              className="relative p-2.5 rounded-full text-slate-700 hover:bg-slate-100 transition-colors shrink-0"
              title="Giỏ hàng"
              aria-label="Giỏ hàng"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>

            <Link href="/dashboard" className="hidden lg:flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-blue-600 transition-colors mx-2">
              <Search className="w-4 h-4" />
              <span>Quản lý dịch vụ</span>
            </Link>

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
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors shrink-0"
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
                  className="px-3 sm:px-4 py-2 text-sm font-bold text-white rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-blue-500/20 transition-all whitespace-nowrap shrink-0"
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
          <div className="lg:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-1 animate-in slide-in-from-top duration-200">
            {navItems.map(item => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${pathname === item.href || (item.href !== '/' && item.href !== '/#contact' && pathname.startsWith(item.href))
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50'
                  }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              {user ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm"
                  >
                    <Cloud className="w-4 h-4" />
                    Bảng điều khiển ({user.fullName})
                  </Link>

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
                    className="w-full text-center px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl"
                  >
                    Đăng xuất
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
                    className="w-full text-center px-4 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
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
