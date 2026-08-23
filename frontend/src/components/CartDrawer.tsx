'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  Trash2,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Wallet,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CartItem } from '../types';
import {
  getApiErrorMessage,
  isInsufficientWalletBalance,
  suggestTopUpAmount,
} from '../lib/checkoutErrors';
import { requestAuth } from '../lib/authNavigation';
import { useCartStore } from '../store/useCartStore';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
}

type CheckoutNotice =
  | {
      kind: 'insufficient_balance';
      balance: number;
      required: number;
      orderId: string;
    }
  | {
      kind: 'error';
      message: string;
    };

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem,
  onClearCart
}) => {
  const router = useRouter();
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutNotice, setCheckoutNotice] = useState<CheckoutNotice | null>(null);

  if (!isOpen) return null;

  // Correctly account for quantity so Drawer total matches Cart & Checkout totals
  const totalAmount = cartItems.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);

  const handleExploreServices = () => {
    onClose();
    router.push('/services');
  };

  const handleGoToTopUp = (notice: Extract<CheckoutNotice, { kind: 'insufficient_balance' }>) => {
    const shortfall = Math.max(0, notice.required - notice.balance);
    const params = new URLSearchParams({
      topup: '1',
      amount: String(suggestTopUpAmount(shortfall)),
      from: 'checkout',
      orderId: notice.orderId,
    });
    onClose();
    router.push(`/wallet?${params.toString()}`);
  };

  const handleCheckout = async () => {
    setCheckoutNotice(null);
    setIsCheckingOut(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      onClose();
      requestAuth('login', '/checkout');
      setIsCheckingOut(false);
      return;
    }

    try {
      // Synchronize any guest items to server cart first
      await useCartStore.getState().syncGuestCart();
      onClose();
      router.push('/checkout');
    } catch (e) {
      const message = getApiErrorMessage(e, 'Không thể chuyển đến trang thanh toán');
      setCheckoutNotice({ kind: 'error', message });
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleFinish = () => {
    setIsCheckedOut(false);
    setCheckoutNotice(null);
    onClearCart();
    onClose();
    // Use router.refresh() instead of window.location.reload() to avoid jarring full-page reload
    router.refresh();
  };


  const insufficientNotice =
    checkoutNotice?.kind === 'insufficient_balance' ? checkoutNotice : null;
  const shortfall = insufficientNotice
    ? Math.max(0, insufficientNotice.required - insufficientNotice.balance)
    : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md h-full bg-white shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="p-6 border-b border-zinc-200 flex items-center justify-between bg-zinc-50 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <ShoppingBag className="w-5 h-5 text-black shrink-0" />
              <h3 className="text-lg font-black text-black whitespace-nowrap">Giỏ Hàng Của Bạn</h3>
              <span className="ml-3 shrink-0 text-xs font-bold px-2.5 py-0.5 bg-zinc-200 text-black rounded-full border border-zinc-300">
                {cartItems.length} dịch vụ
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-zinc-500 hover:text-black hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            {isCheckedOut ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-zinc-100 text-black border border-zinc-300 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h4 className="text-2xl font-black text-black">Thanh Toán Thành Công!</h4>
                <p className="text-sm text-zinc-600 max-w-xs mx-auto leading-relaxed">
                  Đơn hàng Cloud VPS / Domain của bạn đã được ghi nhận. Hệ thống đang tiến hành kích hoạt tự động trong 30 giây.
                </p>
                <button
                  onClick={handleFinish}
                  className="px-6 py-3 rounded-full bg-black text-white font-bold text-sm shadow-md hover:bg-zinc-800 cursor-pointer"
                >
                  Hoàn Tất &amp; Về Trang Chủ
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 text-black flex items-center justify-center mb-4 border border-zinc-200">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <p className="text-base font-black text-black">Giỏ hàng của bạn đang trống</p>
                <p className="text-sm text-zinc-500 max-w-[260px] mt-2 leading-relaxed font-medium">
                  Hãy chọn một gói Cloud VPS, Hosting hoặc Tên miền để bắt đầu.
                </p>
                <button
                  type="button"
                  onClick={handleExploreServices}
                  className="mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  Khám phá dịch vụ
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 flex items-start justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="text-[11px] font-black text-black uppercase tracking-wider">
                        {item.type === 'vps' ? 'Cloud VPS' : item.type === 'hosting' ? 'Web Hosting' : 'Tên miền'}
                      </div>
                      <div className="text-sm font-extrabold text-black mt-0.5">{item.title}</div>
                      <div className="text-xs text-zinc-500 mt-1">{item.details}</div>
                      <div className="text-xs font-semibold text-zinc-700 mt-2">
                        Chu kỳ: <span className="font-black text-black">{item.billingCycle}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col justify-between items-end h-full">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Xóa khỏi giỏ"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="text-sm font-black text-black mt-3">
                        {item.price.toLocaleString('vi-VN')} đ
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Checkout */}
          {!isCheckedOut && cartItems.length > 0 && (
            <div className="p-6 border-t border-zinc-200 bg-white space-y-4 shrink-0">
              {insufficientNotice && (
                <div className="rounded-2xl border border-zinc-300 bg-zinc-100 p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-black">Số dư ví không đủ để thanh toán</p>
                      <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                        Nạp thêm credit vào ví để hoàn tất đơn hàng. Đơn hàng đã được tạo và đang chờ thanh toán.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-white px-3 py-2 border border-zinc-200">
                      <p className="text-zinc-500">Số dư hiện tại</p>
                      <p className="font-bold text-black mt-0.5">
                        {insufficientNotice.balance.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="rounded-xl bg-white px-3 py-2 border border-zinc-200">
                      <p className="text-zinc-500">Cần thanh toán</p>
                      <p className="font-bold text-black mt-0.5">
                        {insufficientNotice.required.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                    <div className="col-span-2 rounded-xl bg-zinc-200 px-3 py-2">
                      <p className="text-zinc-700">Còn thiếu</p>
                      <p className="font-black text-black mt-0.5">
                        {shortfall.toLocaleString('vi-VN')} đ
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleGoToTopUp(insufficientNotice)}
                    className="w-full py-3 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Wallet className="w-4 h-4" />
                    Nạp tiền vào ví ngay
                  </button>
                </div>
              )}

              {checkoutNotice?.kind === 'error' && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-red-900">Không thể thanh toán</p>
                    <p className="text-xs text-red-800 mt-1 leading-relaxed">{checkoutNotice.message}</p>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center text-black">
                <span className="text-sm font-bold">Tổng Thanh Toán:</span>
                <span className="text-2xl font-black text-black">
                  {totalAmount.toLocaleString('vi-VN')} đ
                </span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang chuyển hướng...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>Tiến Hành Thanh Toán</span>
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  onClose();
                  router.push('/cart');
                }}
                className="w-full py-2.5 rounded-full border border-zinc-300 hover:bg-zinc-100 text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Xem Giỏ Hàng Chi Tiết</span>
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 pt-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                Hỗ trợ thanh toán VietQR, MoMo, VNPAY &amp; Số Dư Ví
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
