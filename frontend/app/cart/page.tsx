'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, Trash2, ArrowRight, ShieldCheck, Clock, 
  LogIn, UserCheck, AlertTriangle, Sparkles, CheckCircle2 
} from 'lucide-react';
import { CouponInput, useCoupon } from '@/components/CouponInput';
import { useCartStore } from '@/src/store/useCartStore';
import { useUIStore } from '@/src/store/useUIStore';
import { useAuthStore } from '@/src/store/useAuthStore';

export default function CartPage() {
  const router = useRouter();
  const { items: cartItems, isLoading, fetchCart, removeItem } = useCartStore();
  const { setAuthModal, setAuthRedirect } = useUIStore();
  const { user } = useAuthStore();
  const [hasToken, setHasToken] = useState<boolean>(false);
  const { discount, applyCoupon, removeCoupon } = useCoupon();

  useEffect(() => {
    fetchCart();
    const token = localStorage.getItem('accessToken');
    setHasToken(!!token || !!user);
  }, [user]);

  const isLoggedIn = hasToken || !!user;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * (item.quantity || 1)), 0);
  const discountAmount = Math.round((subtotal * discount) / 100);
  const tax = Math.round((subtotal - discountAmount) * 0.08);
  const total = subtotal - discountAmount + tax;

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthRedirect('/cart');
    setAuthModal(true, mode);
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token && !user) {
      setAuthRedirect('/checkout');
      setAuthModal(true, 'login');
      return;
    }
    try {
      await useCartStore.getState().syncGuestCart();
    } catch {}
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium text-sm">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="py-8 bg-slate-50 min-h-[calc(100vh-200px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <Link href="/services" className="text-sm font-semibold text-[#1F1F1F] hover:text-[#1F1F1F] mb-2 inline-flex items-center gap-1">
            ← Tiếp tục khám phá dịch vụ
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Giỏ hàng của bạn</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                {cartItems.length > 0 ? `${cartItems.length} dịch vụ đang chờ thanh toán` : 'Giỏ hàng đang trống'}
              </p>
            </div>
            {isLoggedIn && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Đã đăng nhập tài khoản CloudHost
              </div>
            )}
          </div>
        </div>

        {/* Guest Reminder Banner (When not logged in) */}
        {!isLoggedIn && cartItems.length > 0 && (
          <div className="mb-8 p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl border border-blue-800 text-slate-900 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-blue-600/30 border border-blue-500/40 rounded-xl text-slate-200 shrink-0">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  Bạn đang đặt hàng với tư cách Khách
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Chưa đăng nhập
                  </span>
                </h3>
                <p className="text-xs text-slate-200 mt-1 max-w-xl leading-relaxed">
                  Đăng nhập hoặc đăng ký để hệ thống tự động lưu giỏ hàng của bạn, áp dụng chiết khấu thành viên và kích hoạt dịch vụ Cloud VPS / Hosting tức thì sau khi thanh toán.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 w-full md:w-auto shrink-0">
              <button
                onClick={() => handleOpenAuth('login')}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="flex-1 md:flex-initial px-4 py-2.5 bg-white hover:bg-slate-200 text-slate-900 font-semibold text-xs rounded-xl border border-slate-300 transition-all"
              >
                Đăng Ký
              </button>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 text-[#1F1F1F] flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
              Bạn chưa có dịch vụ nào trong giỏ. Hãy khám phá các gói Cloud VPS thế hệ mới hoặc NVMe Hosting hiệu năng cao của chúng tôi.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all text-sm"
            >
              Khám Phá Bảng Giá Dịch Vụ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-slate-900 font-black text-xl shadow-md shrink-0">
                      {(item.title || item.name || 'C')[0]?.toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                              item.type === 'hosting' ? 'bg-indigo-100 text-[#1F1F1F]' :
                              item.type === 'domain' ? 'bg-cyan-100 text-[#1F1F1F]' :
                              'bg-blue-100 text-[#1F1F1F]'
                            }`}>
                              {item.type === 'hosting' ? 'Web Hosting' : item.type === 'domain' ? 'Tên Miền' : 'Cloud VPS'}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{item.title || item.name}</h3>
                          <p className="text-xs text-slate-500 mt-1">{item.details || 'Cấu hình tiêu chuẩn'}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Chu kỳ: <span className="font-semibold text-slate-700">{item.billingCycle}{typeof item.billingCycle === 'number' ? ' tháng' : ''}</span>
                          </p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-3 shrink-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                            title="Xóa dịch vụ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="text-right">
                            <div className="text-lg font-black text-[#1F1F1F]">
                              {(item.price * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                            </div>
                            {(item.quantity && item.quantity > 1) ? (
                              <div className="text-xs text-slate-500 font-medium mt-1">
                                {item.quantity} x {item.price.toLocaleString('vi-VN')} đ
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-md sticky top-24">
                <h2 className="text-lg font-black text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Tóm Tắt Đơn Hàng
                </h2>
                
                {/* Coupon Input */}
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <CouponInput 
                    onApply={applyCoupon}
                    onRemove={removeCoupon}
                    orderTotal={subtotal}
                  />
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tạm tính:</span>
                    <span className="font-semibold text-slate-800">{subtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600 font-medium">Mã giảm giá ({discount}%):</span>
                      <span className="font-bold text-emerald-600">-{discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Thuế GTGT (VAT 8%):</span>
                    <span className="font-semibold text-slate-800">{tax.toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-4 flex items-baseline justify-between">
                    <span className="font-bold text-slate-900 text-base">Tổng thanh toán:</span>
                    <span className="text-2xl font-black text-[#1F1F1F] tracking-tight">
                      {total.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-slate-900 font-extrabold text-base shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all flex items-center justify-center gap-2 group cursor-pointer"
                >
                  <span>{isLoggedIn ? 'Tiến Hành Thanh Toán' : 'Đăng Nhập Để Thanh Toán'}</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                {!isLoggedIn && (
                  <p className="text-[11px] text-amber-600 text-center mt-2.5 font-medium flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Giỏ hàng sẽ được tự động lưu sau khi đăng nhập
                  </p>
                )}

                {/* Security badges */}
                <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Bảo mật chuẩn mã hóa SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Clock className="w-4 h-4 text-[#1F1F1F] shrink-0" />
                    <span>Kích hoạt Cloud tự động trong 30 giây</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
