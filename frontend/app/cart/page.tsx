'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, Trash2, ArrowRight, ShieldCheck, Clock, 
  LogIn, AlertTriangle, CheckCircle2, Loader2 
} from 'lucide-react';
import { CouponInput, useCoupon } from '@/components/CouponInput';
import { useCartStore } from '@/src/store/useCartStore';
import { useUIStore } from '@/src/store/useUIStore';
import { useAuthStore } from '@/src/store/useAuthStore';
import { getServiceTypeBadge } from '@/src/lib/serviceRedirect';

export default function CartPage() {
  const router = useRouter();
  const { items: cartItems, isLoading, fetchCart, removeItem } = useCartStore();
  const { setAuthModal, setAuthRedirect } = useUIStore();
  const { user } = useAuthStore();
  const [hasToken, setHasToken] = useState<boolean>(false);
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const { discount, coupon, applyCoupon, removeCoupon } = useCoupon();

  useEffect(() => {
    fetchCart();
    const token = localStorage.getItem('accessToken');
    setHasToken(!!token || !!user);
  }, [user]);

  const isLoggedIn = hasToken || !!user;

  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
  const discountAmount = Math.round((subtotal * discount) / 100);
  const tax = Math.round((subtotal - discountAmount) * 0.08);
  const total = subtotal - discountAmount + tax;

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthRedirect('/cart');
    setAuthModal(true, mode);
  };

  const handleCheckout = () => {
    setIsNavigating(true);
    if (typeof window !== 'undefined') {
      if (coupon) {
        sessionStorage.setItem('cloudhost_applied_coupon', JSON.stringify(coupon));
      } else {
        sessionStorage.removeItem('cloudhost_applied_coupon');
      }
    }
    router.push('/checkout');
  };

  if (isLoading && cartItems.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-600 font-medium text-sm">Đang tải giỏ hàng...</p>
      </div>
    );
  }

  return (
    <div className="py-8 bg-zinc-50 min-h-[calc(100vh-200px)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Title */}
        <div className="mb-6">
          <Link href="/services" className="text-sm font-bold text-black hover:underline mb-2 inline-flex items-center gap-1">
            ← Tiếp tục khám phá dịch vụ
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-black tracking-tight">Giỏ hàng của bạn</h1>
              <p className="text-zinc-500 text-sm mt-0.5">
                {cartItems.length > 0 ? `${cartItems.length} dịch vụ đang chờ thanh toán` : 'Giỏ hàng đang trống'}
              </p>
            </div>
            {isLoggedIn && (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-zinc-100 border border-zinc-300 rounded-full text-black text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-black" />
                Đã đăng nhập tài khoản SEN CloudHost
              </div>
            )}
          </div>
        </div>

        {/* Guest Reminder Banner (High Contrast Monochromatic Dark Card - No Blurry Text) */}
        {!isLoggedIn && cartItems.length > 0 && (
          <div className="mb-8 p-6 bg-black rounded-2xl border border-zinc-800 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-white shrink-0">
                <LogIn className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2.5">
                  <span>Bạn đang đặt hàng với tư cách Khách</span>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-full">
                    Chưa đăng nhập
                  </span>
                </h3>
                <p className="text-xs text-zinc-300 mt-1.5 max-w-xl leading-relaxed font-medium">
                  Đăng nhập hoặc đăng ký để hệ thống tự động lưu giỏ hàng của bạn, áp dụng chiết khấu thành viên và kích hoạt dịch vụ Cloud VPS / Hosting tức thì sau khi thanh toán.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
              <button
                onClick={() => handleOpenAuth('login')}
                className="flex-1 md:flex-initial px-5 py-2.5 bg-white hover:bg-zinc-200 text-black font-black text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập
              </button>
              <button
                onClick={() => handleOpenAuth('register')}
                className="flex-1 md:flex-initial px-5 py-2.5 bg-transparent hover:bg-zinc-800 text-white font-bold text-xs rounded-xl border border-zinc-700 hover:border-zinc-500 transition-all cursor-pointer"
              >
                Đăng Ký
              </button>
            </div>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-zinc-200 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-zinc-100 text-black flex items-center justify-center mx-auto mb-4 border border-zinc-200">
              <ShoppingCart className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-black mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto mb-6">
              Bạn chưa có dịch vụ nào trong giỏ. Hãy khám phá các gói Cloud VPS thế hệ mới hoặc NVMe Hosting hiệu năng cao của chúng tôi.
            </p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-black hover:bg-zinc-800 text-white font-bold rounded-full shadow-lg transition-all text-sm"
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
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                      {(item.title || item.name || 'C')[0]?.toUpperCase()}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-zinc-100 text-black border border-zinc-300">
                              {getServiceTypeBadge(item.type, item.title || item.name)}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-black">{item.title || item.name}</h3>
                          <p className="text-xs text-zinc-600 mt-1">{item.details || 'Cấu hình tiêu chuẩn'}</p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Chu kỳ: <span className="font-bold text-black">{item.billingCycle}{typeof item.billingCycle === 'number' ? ' tháng' : ''}</span>
                          </p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-3 shrink-0">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                            title="Xóa dịch vụ"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="text-right">
                            <div className="text-lg font-black text-black">
                              {(item.price * (item.quantity || 1)).toLocaleString('vi-VN')} đ
                            </div>
                            {(item.quantity && item.quantity > 1) ? (
                              <div className="text-xs text-zinc-500 font-medium mt-1">
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
              <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm sticky top-24">
                <h2 className="text-lg font-black text-black mb-4 pb-3 border-b border-zinc-100">
                  Tóm Tắt Đơn Hàng
                </h2>
                
                {/* Coupon Input */}
                <div className="mb-6 pb-4 border-b border-zinc-100">
                  <CouponInput 
                    onApply={applyCoupon}
                    onRemove={removeCoupon}
                    orderTotal={subtotal}
                  />
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Tạm tính:</span>
                    <span className="font-bold text-black">{subtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-700 font-bold">Mã giảm giá ({discount}%):</span>
                      <span className="font-black text-black">-{discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-500">Thuế GTGT (VAT 8%):</span>
                    <span className="font-bold text-black">{tax.toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  <div className="border-t border-zinc-200 pt-4 flex items-baseline justify-between">
                    <span className="font-black text-black text-base">Tổng thanh toán:</span>
                    <span className="text-2xl font-black text-black tracking-tight">
                      {total.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isNavigating}
                  className="w-full py-4 rounded-full bg-black hover:bg-zinc-800 text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-75"
                >
                  {isNavigating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Đang chuyển đến thanh toán...</span>
                    </>
                  ) : (
                    <>
                      <span>Tiến Hành Thanh Toán</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {!isLoggedIn && (
                  <p className="text-[11px] text-zinc-500 text-center mt-3 font-medium flex items-center justify-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                    Có thể thanh toán ngay hoặc đăng nhập để lưu dịch vụ
                  </p>
                )}

                {/* Security badges */}
                <div className="mt-6 pt-4 border-t border-zinc-100 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
                    <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                    <span>Bảo mật chuẩn mã hóa SSL 256-bit</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
                    <Clock className="w-4 h-4 text-black shrink-0" />
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
