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
  Repeat, Shield, AlertCircle, Loader2, Cpu, Mail,
  Database, HardDrive, Layers, Palette, Gift, RotateCcw,
  Building2, KeyRound, Key, Star, Bell, ArrowRightLeft, Package, ShoppingBag,
  Lock
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

interface MenuGroup {
  title: string;
  items: {
    id: string;
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Hạ Tầng & Dịch Vụ Cloud',
    items: [
      { id: 'overview', name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
      { id: 'vps-instances', name: 'Quản lý VPS', href: '/dashboard/vps-instances', icon: Server },
      { id: 'dedicated-servers', name: 'Máy chủ riêng', href: '/dashboard/dedicated-servers', icon: Cpu },
      { id: 'hosting', name: 'Web Hosting', href: '/dashboard/hosting', icon: Globe },
      { id: 'email-hosting', name: 'Email Doanh nghiệp', href: '/dashboard/email-hosting', icon: Mail },
      { id: 'cdn', name: 'Cloud CDN', href: '/dashboard/cdn', icon: Activity },
      { id: 'databases', name: 'Databases', href: '/dashboard/databases', icon: Database },
      { id: 'storage', name: 'Object Storage S3', href: '/dashboard/storage', icon: HardDrive },
      { id: 'game-servers', name: 'Game Servers', href: '/dashboard/game-servers', icon: Monitor },
      { id: 'apps', name: 'App Installer', href: '/dashboard/apps', icon: Package },
      { id: 'marketplace', name: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingBag },
      { id: 'static-sites', name: 'Static Sites', href: '/dashboard/static-sites', icon: Layers },
      { id: 'website-builder', name: 'Website Builder', href: '/dashboard/website-builder', icon: Palette },
      { id: 'vps-backups', name: 'Backup VPS', href: '/dashboard/vps-backups', icon: RefreshCw },
    ]
  },
  {
    title: 'Tên Miền & Mạng Lưới',
    items: [
      { id: 'domains', name: 'Tên miền', href: '/dashboard/domains', icon: Globe },
      { id: 'ssl-certificates', name: 'Chứng chỉ SSL', href: '/dashboard/ssl-certificates', icon: ShieldCheck },
      { id: 'uptime', name: 'Tình trạng Uptime', href: '/dashboard/uptime', icon: Activity },
      { id: 'migrations', name: 'Di dời Website', href: '/dashboard/migrations', icon: ArrowRightLeft },
    ]
  },
  {
    title: 'Tài Chính & Đơn Hàng',
    items: [
      { id: 'orders', name: 'Đơn hàng', href: '/dashboard/orders', icon: ShoppingCart },
      { id: 'invoices', name: 'Hóa đơn', href: '/dashboard/invoices', icon: FileText },
      { id: 'payments', name: 'Thanh toán & Giao dịch', href: '/dashboard/payments', icon: CreditCard },
      { id: 'refund-requests', name: 'Yêu cầu hoàn tiền', href: '/dashboard/refund-requests', icon: RotateCcw },
      { id: 'auto-renew', name: 'Tự động gia hạn', href: '/dashboard/auto-renew', icon: Repeat },
      { id: 'gift-cards', name: 'Thẻ quà tặng', href: '/dashboard/gift-cards', icon: Gift },
    ]
  },
  {
    title: 'Tài Khoản & Mở Rộng',
    items: [
      { id: 'tickets', name: 'Hỗ trợ kỹ thuật', href: '/dashboard/tickets', icon: Shield },
      { id: 'profile', name: 'Hồ sơ tài khoản', href: '/dashboard/profile', icon: User },
      { id: 'orgs', name: 'Tổ chức B2B', href: '/dashboard/orgs', icon: Building2 },
      { id: 'security', name: 'Bảo mật & Phiên', href: '/dashboard/security', icon: KeyRound },
      { id: 'api-keys', name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
      { id: 'affiliates', name: 'Tiếp thị Affiliate', href: '/dashboard/affiliates', icon: TrendingUp },
      { id: 'reviews', name: 'Đánh giá của tôi', href: '/dashboard/reviews', icon: Star },
      { id: 'recently-viewed', name: 'Lịch sử xem', href: '/dashboard/recently-viewed', icon: History },
      { id: 'notifications', name: 'Cài đặt thông báo', href: '/dashboard/notifications', icon: Bell },
    ]
  }
];

const MENU_TO_SLUG: Record<string, string> = {
  'vps-instances': 'cloud-vps',
  'hosting': 'cloud-hosting',
  'domains': 'ten-mien',
  'dedicated-servers': 'dedicated-server',
  'email-hosting': 'email-server',
  'ssl-certificates': 'ssl-certificate',
  'databases': 'managed-database',
  'game-servers': 'game-server',
  'apps': '1click-apps',
  'static-sites': 'static-sites',
  'storage': 'object-storage',
  'cdn': 'cloud-cdn',
  'vps-backups': 'cloud-vps'
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [purchasedSlugs, setPurchasedSlugs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast, hideToast } = useToast();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (token) {
      setIsAuthenticated(true);
      setIsLoading(false);
    } else {
      setIsAuthenticated(false);
      setIsLoading(false);
    }
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
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
        localStorage.removeItem('accessToken');
        setIsAuthenticated(false);
        router.push(getAuthModalUrl('login', pathname));
        return;
      }
      
      const data = await response.json();
      setUser(data);
      setIsAuthenticated(true);
      
      try {
        const dashRes = await fetch('/api/dashboard/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (dashRes.ok) {
          const dashData = await dashRes.json();
          if (dashData && dashData.activeServices) {
            const slugs = dashData.activeServices.map((s: any) => s.categorySlug);
            setPurchasedSlugs(slugs);
          }
        }
      } catch (err) {
        console.warn('Failed to load dashboard active services', err);
      }
      
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMenuGroups = menuGroups.map(group => {
    if (group.title === 'Hạ Tầng & Dịch Vụ Cloud' || group.title === 'Tên Miền & Mạng Lưới') {
      const filteredItems = group.items.filter(item => {
        if (item.id === 'overview') return true;
        const requiredSlug = MENU_TO_SLUG[item.id];
        if (requiredSlug) {
          return purchasedSlugs.includes(requiredSlug);
        }
        return true;
      });
      return { ...group, items: filteredItems };
    }
    return group;
  }).filter(group => group.items.length > 0);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 text-sm font-semibold">Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-slate-50">
      {/* Mobile Sidebar Toggle Button */}
      <div className="lg:hidden max-w-7xl mx-auto px-4 pt-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="px-3.5 py-2 rounded bg-white border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-2 shadow-xs"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>Menu Dashboard</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6 items-start">
          
          {/* Sidebar */}
          {isAuthenticated && (
            <aside className={`
              fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:relative lg:translate-x-0 lg:w-60 shrink-0 lg:z-10 rounded-md lg:shadow-xs
              ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
              {/* Overlay for mobile */}
              {mobileMenuOpen && (
                <div
                  className="fixed inset-0 bg-black/30 lg:hidden -z-10"
                  onClick={() => setMobileMenuOpen(false)}
                />
              )}


              <div className="h-full max-h-[calc(100vh-6rem)] overflow-y-auto p-3.5 space-y-4">
                {filteredMenuGroups.map((group, gIdx) => (
                  <div key={group.title} className={gIdx > 0 ? 'pt-3 border-t border-slate-100' : ''}>
                    <div className="text-[10px] font-black text-slate-600 uppercase tracking-wider px-3 pb-2">
                      {group.title}
                    </div>

                    <nav className="space-y-0.5">
                      {group.items.map((item) => {
                        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`
                              flex items-center gap-2.5 px-3 py-2 rounded text-xs font-bold transition-all
                              ${isActive
                                ? 'bg-[#1F1F1F] text-white shadow-md font-black'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }
                            `}
                          >
                            <item.icon className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href="/services"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded text-xs font-bold text-[#1F1F1F] bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    <Server className="w-3.5 h-3.5 shrink-0" />
                    <span>Mua thêm dịch vụ →</span>
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {/* Main Content Area */}
          <main className="flex-1 w-full min-w-0">
            {(() => {
              const restrictedRoutes: string[] = [];
              menuGroups.forEach(group => {
                if (group.title === 'Hạ Tầng & Dịch Vụ Cloud' || group.title === 'Tên Miền & Mạng Lưới') {
                  group.items.forEach(item => {
                    if (item.id !== 'overview') {
                      const requiredSlug = MENU_TO_SLUG[item.id];
                      if (requiredSlug && !purchasedSlugs.includes(requiredSlug)) {
                        restrictedRoutes.push(item.href);
                      }
                    }
                  });
                }
              });

              const isBlocked = restrictedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));

              if (isBlocked) {
                return (
                  <div className="flex flex-col items-center justify-center py-32 px-4 text-center h-full">
                    <div className="w-20 h-20 bg-slate-100 text-[#1F1F1F] rounded-full flex items-center justify-center mb-6">
                      <Lock className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Truy cập bị hạn chế</h2>
                    <p className="text-slate-600 max-w-md mb-8">
                      Bạn chưa sở hữu dịch vụ này. Vui lòng đăng ký gói dịch vụ để có thể truy cập và quản lý tính năng trong hệ thống.
                    </p>
                    <Link href="/services/cloud-vps" className="px-6 py-3 bg-[#1F1F1F] text-white rounded font-semibold hover:bg-black transition-colors">
                      Khám phá dịch vụ
                    </Link>
                  </div>
                );
              }

              return (
                <>
                  {/* Auth Warning Banner */}
                  {!isAuthenticated && (
                    <div className="mb-6 p-5 bg-slate-50 border border-slate-200 rounded-md flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-[#1F1F1F] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-slate-900 text-sm">Cần đăng nhập để truy cập Bảng Điều Khiển</p>
                        <p className="text-xs text-slate-700 mt-1">
                          Bạn cần đăng nhập để xem thông tin cá nhân, quản trị VPS, hóa đơn và đơn hàng.
                        </p>
                        <div className="flex gap-2 mt-3">
                          <Link
                            href={getAuthModalUrl('login', pathname)}
                            className="px-4 py-2 bg-[#1F1F1F] text-white rounded text-xs font-bold hover:bg-black transition-colors"
                          >
                            Đăng nhập ngay
                          </Link>
                          <Link
                            href={getAuthModalUrl('register', pathname)}
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded text-xs font-bold hover:bg-slate-50 transition-colors"
                          >
                            Tạo tài khoản
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                  {children}
                </>
              );
            })()}
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
