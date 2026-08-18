'use client';

import React, { useState, useEffect } from 'react';
import { 
  Cloud, Server, Globe, Shield, ShoppingCart, Menu, X, Cpu, ChevronDown, LogOut, Wallet,
  Gamepad2, Mail, Database, HardDrive, ShieldCheck, Zap, Layers, Palette, ShoppingBag, Activity, ArrowRight, Compass
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { useCartStore } from '../store/useCartStore';
import { api } from '../lib/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import GlobalSearch from './GlobalSearch';
import NotificationBell from './NotificationBell';

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
        .catch(() => {});
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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-900 leading-tight">
              CloudHost <span className="text-blue-600">VN</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5 hidden md:block whitespace-nowrap">
              Enterprise Cloud
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1.5 min-w-0">
          <Link
            href="/"
            className={`${navLinkBase} relative ${
              isHomeActive
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
              className={`${navLinkBase} gap-1 ${
                servicesDropdownOpen || pathname.startsWith('/services')
                  ? 'text-blue-600 bg-blue-50/80 font-black'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Dịch vụ
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${servicesDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {servicesDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[760px] max-w-[95vw] z-50">
                <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/10 border border-slate-100 p-7 animate-in fade-in slide-in-from-top-2 duration-200 grid grid-cols-3 gap-6">
                  {/* Column 1: Hạ tầng & Máy chủ */}
                  <div className="flex flex-col justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-blue-600" /> Hạ Tầng &amp; Máy Chủ
                    </h4>
                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <Link
                        href="/services/cloud-vps"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-blue-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Cloud VPS NVMe</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Máy chủ ảo hiệu năng cao</div>
                        </div>
                      </Link>

                      <Link
                        href="/services/dedicated-server"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-indigo-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Cpu className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Dedicated Server</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Máy chủ vật lý riêng biệt</div>
                        </div>
                      </Link>

                      <Link
                        href="/services/game-servers"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-purple-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-purple-600 transition-colors">Game Servers</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Minecraft, CS:GO, Rust</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Column 2: Web & Bảo mật */}
                  <div className="flex flex-col justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-cyan-600" /> Web &amp; Bảo Mật
                    </h4>
                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <Link
                        href="/services/hosting"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-cyan-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-cyan-100/70 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">NVMe Web Hosting</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">LiteSpeed + LSCache tốc độ</div>
                        </div>
                      </Link>

                      <Link
                        href="/services/domain"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-emerald-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Đăng Ký Tên Miền</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">.VN, .COM, .AI, .IO giá tốt</div>
                        </div>
                      </Link>

                      <Link
                        href="/services/ssl-certificates"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-amber-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-amber-100/70 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-amber-600 transition-colors">Chứng Chỉ SSL</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Bảo mật mã hóa DV/EV</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Column 3: Dữ liệu & Giải pháp */}
                  <div className="flex flex-col justify-between">
                    <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-3.5 flex items-center gap-2">
                      <Database className="w-3.5 h-3.5 text-indigo-600" /> Dữ Liệu &amp; Giải Pháp
                    </h4>
                    <div className="space-y-1.5 flex-1 flex flex-col justify-between">
                      <Link
                        href="/services/email-hosting"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-rose-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-rose-100/70 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition-colors">Email Doanh Nghiệp</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Hòm thư bảo mật theo tên miền</div>
                        </div>
                      </Link>

                      <Link
                        href="/services/storage"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-blue-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <HardDrive className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Object Storage (S3)</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">Lưu trữ đám mây chuẩn S3</div>
                        </div>
                      </Link>

                      <Link
                        href="/services/databases"
                        onClick={() => setServicesDropdownOpen(false)}
                        className="flex items-start gap-3 p-2.5 rounded-2xl hover:bg-teal-50/70 transition-all group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-teal-100/70 text-teal-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition-colors">Managed Databases</div>
                          <div className="text-[11px] font-medium text-slate-500 mt-0.5">MySQL, PostgreSQL, Redis</div>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Footer of Mega Menu */}
                  <div className="col-span-3 mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-5 text-xs font-bold text-slate-600">
                      <Link href="/apps" onClick={() => setServicesDropdownOpen(false)} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span>1-Click Apps</span>
                      </Link>
                      <Link href="/services/cdn" onClick={() => setServicesDropdownOpen(false)} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <Activity className="w-4 h-4 text-cyan-500" />
                        <span>Cloud CDN</span>
                      </Link>
                      <Link href="/services/static-sites" onClick={() => setServicesDropdownOpen(false)} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <Layers className="w-4 h-4 text-indigo-500" />
                        <span>Static Sites</span>
                      </Link>
                      <Link href="/services/website-builder" onClick={() => setServicesDropdownOpen(false)} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <Palette className="w-4 h-4 text-pink-500" />
                        <span>Website Builder</span>
                      </Link>
                      <Link href="/marketplace" onClick={() => setServicesDropdownOpen(false)} className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
                        <ShoppingBag className="w-4 h-4 text-emerald-500" />
                        <span>Marketplace</span>
                      </Link>
                    </div>

                    <Link
                      href="/services"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="text-xs font-extrabold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group shrink-0"
                    >
                      <span>Khám phá 12+ dịch vụ</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/knowledge-base"
            className={`${navLinkBase} ${
              pathname.startsWith('/knowledge-base')
                ? 'text-blue-600 bg-blue-50/80'
                : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            Thư viện
          </Link>

          <Link
            href="/contact"
            className={`${navLinkBase} ${
              pathname === '/contact'
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

          <NotificationBell />

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
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                pathname === item.href || (item.href !== '/' && item.href !== '/#contact' && pathname.startsWith(item.href))
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
    </header>
  );
};
