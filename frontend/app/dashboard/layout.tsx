'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { getAuthModalUrl } from '@/src/lib/authNavigation';
import { Toast, useToast } from '@/components/Toast';
import {
  Server, ShoppingCart, CreditCard, Globe, ShieldCheck,
  Activity, Clock, TrendingUp, ArrowLeft, LogOut, User,
  FileText, LayoutDashboard, Wallet as WalletIcon,
  ChevronDown, Menu, X, Monitor, RefreshCw, History,
  Repeat, Shield, AlertCircle, Loader2
} from 'lucide-react';

interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role?: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Quản lý VPS', href: '/dashboard/vps-instances', icon: Server },
  { name: 'Email Doanh nghiệp', href: '/dashboard/email-hosting', icon: Server },
  { name: 'Cloud CDN', href: '/dashboard/cdn', icon: Activity },
  { name: 'Databases', href: '/dashboard/databases', icon: Server },
  { name: 'Object Storage S3', href: '/dashboard/storage', icon: Globe },
  { name: 'Game Servers', href: '/dashboard/game-servers', icon: Monitor },
  { name: 'Static Sites', href: '/dashboard/static-sites', icon: Globe },
  { name: 'Website Builder', href: '/dashboard/website-builder', icon: LayoutDashboard },
  { name: 'Đơn hàng', href: '/dashboard/orders', icon: ShoppingCart },
  { name: 'Hỗ trợ', href: '/dashboard/tickets', icon: Shield },
  { name: 'Tên miền', href: '/domains', icon: Globe },
  { name: 'SSL', href: '/dashboard/ssl-certificates', icon: ShieldCheck },
  { name: 'Hóa đơn', href: '/dashboard/invoices', icon: FileText },
  { name: 'Thanh toán', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Tài khoản', href: '/dashboard/profile', icon: User },
  { name: 'Tự động gia hạn', href: '/dashboard/auto-renew', icon: Repeat },
  { name: 'Backup VPS', href: '/dashboard/vps-backups', icon: RefreshCw },
  { name: 'Lịch sử xem', href: '/dashboard/recently-viewed', icon: History },
  { name: 'Tình trạng hệ thống', href: '/dashboard/uptime', icon: Activity },
  { name: 'Thông báo', href: '/dashboard/notifications', icon: Shield },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast, showToast, hideToast } = useToast();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    
    // Nếu không có token, chỉ set isAuthenticated = false, KHÔNG redirect ngay
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        // Token invalid, clear và redirect
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push(getAuthModalUrl('login', pathname));
        return;
      }
      
      const data = await response.json();
      setUser(data);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
    setIsAuthenticated(false);
    router.push(getAuthModalUrl('login', '/'));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo + mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white">
                <Server className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-900 hidden sm:block">
                CloudHost<span className="text-blue-600"> VN</span>
              </span>
            </Link>
          </div>

          {/* User info + logout */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-600">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                  {user.fullName?.[0]?.toUpperCase()}
                </div>
                <span className="font-medium">{user.fullName}</span>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={getAuthModalUrl('login', pathname)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href={getAuthModalUrl('register', pathname)}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar - Only show when authenticated */}
          {isAuthenticated && (
            <aside className={`
              fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:relative lg:translate-x-0 lg:w-56 shrink-0
              ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              {/* Overlay for mobile */}
              {mobileMenuOpen && (
                <div
                  className="fixed inset-0 bg-black/30 lg:hidden -z-10"
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}

              <div className="h-full overflow-y-auto p-4">
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                          ${isActive
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                          }
                        `}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="mt-8 pt-4 border-t border-slate-100">
                  <Link
                    href="/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all"
                  >
                    <Server className="w-4 h-4 shrink-0" />
                    Dịch vụ
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {/* Main content */}
          <main className="flex-1 min-w-0">
            {/* Auth Warning Banner */}
            {!isAuthenticated && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-900">Cần đăng nhập để truy cập dashboard</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Bạn cần đăng nhập để xem thông tin cá nhân, hóa đơn và quản lý dịch vụ.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={getAuthModalUrl('login', pathname)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Đăng nhập ngay
                    </Link>
                    <Link
                      href={getAuthModalUrl('register', pathname)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Tạo tài khoản
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {children}
          </main>
        </div>
      </div>
      
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
