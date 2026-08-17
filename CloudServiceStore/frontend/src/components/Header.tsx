'use client';

import React, { useState } from 'react';
import { Cloud, Server, Globe, Shield, ShoppingCart, Menu, X, Cpu, ChevronDown, LogOut, Wallet } from 'lucide-react';
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
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [currency, setCurrency] = useState<string>('VND');
  const [rates, setRates] = useState<any[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const { user, logout } = useAuthStore();

  React.useEffect(() => {
    // Lấy tỷ giá từ Backend
    api.get('/exchange-rates')
      .then(res => setRates(res.data))
      .catch(e => console.warn('Failed to load exchange rates', e));
  }, []);

  React.useEffect(() => {
    if (user) {
      api.get('/wallet/me').then(res => {
        setWalletBalance(res.data.balance);
      }).catch(e => console.warn('Failed to load wallet', e));
    }
  }, [user]);

  const navLinkBase =
    'whitespace-nowrap shrink-0 px-3 py-2 rounded-full text-sm font-semibold transition-all inline-flex items-center';

  const navItems = [
    { id: 'home', label: 'Trang chủ', href: '/' },
    { id: 'services', label: 'Tất cả dịch vụ', href: '/services' },
    { id: 'vps', label: 'Máy chủ Cloud', href: '/services/cloud-vps' },
    { id: 'hosting', label: 'Hosting', href: '/services/hosting' },
    { id: 'domain', label: 'Tên miền', href: '/services/domain' },
    { id: 'library', label: 'Thư viện', href: '/knowledge-base' },
    { id: 'contact', label: 'Liên hệ', href: '/#contact' },
  ];

  const isServicesActive = pathname.startsWith('/services');

  return (
    <header id="header" className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-[4.5rem] flex items-center gap-3 min-w-0">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 shrink-0 min-w-0"
        >
          <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Cloud className="w-5 h-5 lg:w-6 lg:h-6 stroke-[2.2]" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 leading-none whitespace-nowrap">
              CloudHost<span className="text-blue-600"> VN</span>
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-0.5 hidden md:block whitespace-nowrap">
              Enterprise Cloud
            </span>
          </div>
        </Link>

        {/* Desktop nav — 4 mục cố định; dịch vụ chi tiết nằm trong dropdown */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-1 min-w-0">
          <Link
            href="/"
            className={`${navLinkBase} relative ${
              pathname === '/'
                ? 'text-blue-600 bg-blue-50/80'
                : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            Trang chủ
            {pathname === '/' && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-600 rounded-full" />
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
                servicesDropdownOpen || isServicesActive
                  ? 'text-blue-600 bg-blue-50/80'
                  : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
              }`}
            >
              Dịch vụ
              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${servicesDropdownOpen ? 'rotate-180 text-blue-600' : ''}`} />
            </button>

            {servicesDropdownOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-72 z-50">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Link
                    href="/services/cloud-vps"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-blue-50/70 text-left transition-all"
                  >
                    <div className="p-2 rounded-lg bg-blue-100 text-blue-600 shrink-0">
                      <Server className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 whitespace-nowrap">Cloud VPS Enterprise</div>
                      <div className="text-[11px] text-slate-500">Máy chủ ảo NVMe tốc độ cao</div>
                    </div>
                  </Link>

                  <Link
                    href="/services/hosting"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-indigo-50/70 text-left transition-all"
                  >
                    <div className="p-2 rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 whitespace-nowrap">NVMe Web Hosting</div>
                      <div className="text-[11px] text-slate-500">LiteSpeed Web Server + LSCache</div>
                    </div>
                  </Link>

                  <Link
                    href="/services/domain"
                    onClick={() => setServicesDropdownOpen(false)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-cyan-50/70 text-left transition-all"
                  >
                    <div className="p-2 rounded-lg bg-cyan-100 text-cyan-600 shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 whitespace-nowrap">Đăng ký Tên Miền</div>
                      <div className="text-[11px] text-slate-500">Tên miền .VN và Quốc tế</div>
                    </div>
                  </Link>

                  <div className="border-t border-slate-100 mt-2 pt-2">
                    <Link
                      href="/services"
                      onClick={() => setServicesDropdownOpen(false)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl hover:bg-slate-50 text-left transition-all"
                    >
                      <div className="text-xs font-bold text-blue-600 whitespace-nowrap">Xem Tất Cả Dịch Vụ →</div>
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

          <a
            href="/#contact"
            className={`${navLinkBase} ${
              pathname === '/#contact'
                ? 'text-blue-600 bg-blue-50/80'
                : 'text-slate-700 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            Liên hệ
          </a>
        </nav>

        {/* Actions — luôn icon-first, không chiếm width cố định lớn */}
        <div className="flex items-center justify-end gap-0.5 sm:gap-1 shrink-0 ml-auto lg:ml-0">
          {/* Currency Switcher */}
          <div className="relative shrink-0 hidden sm:block">
            <button
              onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
              className="flex items-center gap-1 p-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {currency} <ChevronDown className="w-3 h-3" />
            </button>
            {currencyDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-24 bg-white border border-slate-100 rounded-lg shadow-lg py-1 z-50">
                <button
                  onClick={() => { setCurrency('VND'); setCurrencyDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold ${currency === 'VND' ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  VND
                </button>
                {rates.map(r => (
                  <button
                    key={r.currencyCode}
                    onClick={() => { setCurrency(r.currencyCode); setCurrencyDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold ${currency === r.currencyCode ? 'text-blue-600 bg-blue-50' : 'text-slate-700 hover:bg-slate-50'}`}
                  >
                    {r.currencyCode}
                  </button>
                ))}
              </div>
            )}
          </div>

          <GlobalSearch />

          <button
            onClick={handleOpenDashboard}
            className="hidden lg:flex items-center justify-center p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 transition-all border border-slate-200/80 shrink-0"
            title="Quản lý Cloud"
            aria-label="Quản lý Cloud"
          >
            <Cpu className="w-4 h-4 text-blue-600" />
          </button>

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

              <div
                className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold shrink-0"
                title={user.fullName}
              >
                {user.fullName.charAt(0).toUpperCase()}
              </div>

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
            <button
              onClick={() => {
                handleOpenDashboard();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold text-sm whitespace-nowrap"
            >
              <Cpu className="w-4 h-4 text-blue-600" />
              Quản lý Cloud
            </button>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-xl"
              >
                Đăng xuất
              </button>
            ) : (
              <button
                onClick={() => {
                  handleOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-center px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 rounded-xl"
              >
                Đăng nhập
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
