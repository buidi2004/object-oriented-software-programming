'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingCart, CreditCard, QrCode, CheckCircle, 
  Loader2, AlertCircle, ArrowRight, Wallet, Sparkles, Plus,
  ShieldCheck, Clock, LogIn
} from 'lucide-react';
import { useCartStore, CartItem } from '@/src/store/useCartStore';
import { useUIStore } from '@/src/store/useUIStore';
import { CouponInput, useCoupon } from '@/components/CouponInput';
import { CheckoutAddressBook } from '@/src/components/team-features/CheckoutAddressBook';
import { TopUpModal } from '@/src/components/TopUpModal';
import { getServiceDashboardUrl, getPaymentSuccessMessage, getServiceTypeBadge } from '@/src/lib/serviceRedirect';
import { PaymentSuccessReceipt } from '@/src/components/PaymentSuccessReceipt';

interface PaymentMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cartItems, isLoading: isCartLoading, fetchCart } = useCartStore();
  const [selectedMethod, setSelectedMethod] = useState<string>('vietqr');
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'cart' | 'processing' | 'success' | 'wallet_success'>('cart');
  const [paidOrderId, setPaidOrderId] = useState<string>('');
  const [purchasedItem, setPurchasedItem] = useState<CartItem | null>(null);

  const { discount, coupon, applyCoupon, removeCoupon } = useCoupon();

  const [hasToken, setHasToken] = useState<boolean>(false);

  const fetchWallet = async (token: string) => {
    try {
      const res = await fetch('/api/wallet/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWalletBalance(data.balance || 0);
      }
    } catch {}
  };

  useEffect(() => {
    const init = async () => {
      // Check for previously applied coupon in sessionStorage
      if (typeof window !== 'undefined') {
        try {
          const rawCoupon = sessionStorage.getItem('cloudhost_applied_coupon');
          if (rawCoupon) {
            const parsed = JSON.parse(rawCoupon);
            if (parsed && parsed.code) {
              applyCoupon(parsed);
            }
          }
        } catch {}
      }

      const token = localStorage.getItem('accessToken');
      setHasToken(!!token);

      if (!token) {
        // Load guest cart items from local storage
        await fetchCart();
        return;
      }

      // Run fetchCart and fetchWallet concurrently — saves one full round-trip latency
      await Promise.all([fetchCart(), fetchWallet(token)]);
    };
    init();
  }, []);

  // Standardized, 100% unified pricing calculation
  const subtotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 1)), 0);
  const discountAmount = Math.round((subtotal * discount) / 100);
  const taxAmount = Math.round((subtotal - discountAmount) * 0.08); // VAT 8%
  const finalAmount = subtotal - discountAmount + taxAmount;

  const isWalletSufficient = walletBalance >= finalAmount;

  const paymentMethods: PaymentMethod[] = [
    { 
      id: 'vietqr', 
      name: 'Chuyển khoản VietQR (MB Bank)', 
      icon: QrCode, 
      description: 'Quét mã VietQR chuyển khoản tự động 24/7 (SePay) — Kích hoạt ngay' 
    },
    { 
      id: 'wallet', 
      name: 'Số dư ví SEN CloudHost VN', 
      icon: Wallet, 
      description: `Số dư hiện có: ${walletBalance.toLocaleString('vi-VN')} đ ${isWalletSufficient ? '— Đủ để thanh toán ngay' : '— Chưa đủ số dư'}` 
    },
    { 
      id: 'momo_sandbox', 
      name: 'Ví MoMo (Sandbox)', 
      icon: Wallet, 
      description: 'Môi trường giả lập cổng thanh toán trực tuyến MoMo' 
    },
    { 
      id: 'zalo_sandbox', 
      name: 'ZaloPay (Sandbox)', 
      icon: Wallet, 
      description: 'Môi trường giả lập cổng thanh toán ZaloPay QR' 
    },
  ];

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    const targetItem = cartItems[0] || (useCartStore.getState().items[0] ?? null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        useUIStore.getState().setAuthRedirect('/checkout');
        useUIStore.getState().setAuthModal(true, 'login');
        setIsLoading(false);
        return;
      }

      // 1. Checkout to create order on backend with active coupon
      const orderResponse = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          couponCode: coupon?.code || null 
        }),
      });

      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        throw new Error(data.message || 'Lỗi tạo đơn hàng');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.orderId || orderData.id || `ORD_${Date.now()}`;
      setPaidOrderId(orderId);

      // Clean up session coupon
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('cloudhost_applied_coupon');
      }

      // 2. Route based on payment method
      if (selectedMethod === 'wallet') {
        if (!isWalletSufficient) {
          setShowTopUpModal(true);
          throw new Error(`Số dư ví không đủ (${walletBalance.toLocaleString('vi-VN')} đ / ${finalAmount.toLocaleString('vi-VN')} đ). Vui lòng nạp thêm tiền vào ví.`);
        }

        // Pay with wallet
        const payRes = await fetch('/api/wallet/pay', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ orderId }),
        });

        if (!payRes.ok) {
          const payData = await payRes.json();
          throw new Error(payData.message || 'Thanh toán bằng ví thất bại');
        }

        setPurchasedItem(targetItem);

        // Refresh cart store
        useCartStore.getState().clearCart();
        setStep('wallet_success');
        return;
      }

      const itemCategory = targetItem?.type || '';
      const itemName = targetItem?.title || targetItem?.name || '';
      const itemQuery = `&category=${encodeURIComponent(itemCategory)}&name=${encodeURIComponent(itemName)}`;

      if (selectedMethod === 'vietqr') {
        useCartStore.getState().clearCart();
        router.push(`/sandbox/vietqr?orderId=${orderId}&amount=${finalAmount}${itemQuery}`);
        return;
      }
      if (selectedMethod === 'momo_sandbox') {
        useCartStore.getState().clearCart();
        router.push(`/sandbox/momo?orderId=${orderId}&amount=${finalAmount}${itemQuery}`);
        return;
      }
      if (selectedMethod === 'zalo_sandbox') {
        useCartStore.getState().clearCart();
        router.push(`/sandbox/zalo?orderId=${orderId}&amount=${finalAmount}${itemQuery}`);
        return;
      }

      // Default backend payment link
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderRequestId: orderId }),
      });

      if (paymentResponse.ok) {
        const data = await paymentResponse.json();
        setPaymentUrl(data.url || `/sandbox/vietqr?orderId=${orderId}&amount=${finalAmount}${itemQuery}`);
      } else {
        setPaymentUrl(`/sandbox/vietqr?orderId=${orderId}&amount=${finalAmount}${itemQuery}`);
      }
      useCartStore.getState().clearCart();
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  // Wallet Success View
  if (step === 'wallet_success') {
    return (
      <PaymentSuccessReceipt
        orderId={paidOrderId}
        amount={finalAmount}
        paymentMethod="Số Dư Ví SEN CloudHost"
        categorySlug={purchasedItem?.type}
        servicePlanName={purchasedItem?.title || purchasedItem?.name}
        serviceDetails={purchasedItem?.details}
        billingCycle={purchasedItem?.billingCycle}
      />
    );
  }

  if (step === 'success' && paymentUrl) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-zinc-200 text-center">
          <div className="w-20 h-20 rounded-full bg-zinc-100 border border-zinc-300 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-black" />
          </div>
          <h1 className="text-2xl font-black text-black mb-2">Đặt Hàng Thành Công!</h1>
          <p className="text-zinc-600 mb-6 text-sm">
            Đơn hàng của bạn đã được ghi nhận. Vui lòng hoàn tất thanh toán để kích hoạt dịch vụ tức thì.
          </p>
          
          <div className="bg-zinc-50 rounded-xl p-4 mb-6 border border-zinc-200">
            <p className="text-xs text-zinc-500 mb-1">Tổng thanh toán</p>
            <p className="text-3xl font-black text-black">{finalAmount.toLocaleString('vi-VN')} đ</p>
          </div>

          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-base shadow-lg transition-all block mb-3"
          >
            Thanh Toán Ngay
          </a>
          
          <Link href="/dashboard/orders" className="text-sm text-zinc-600 hover:text-black font-medium underline">
            Xem đơn hàng của tôi →
          </Link>
        </div>
      </div>
    );
  }

  if (isCartLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-600 font-medium text-sm">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-zinc-200 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-black border border-zinc-200">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-black mb-2">Giỏ Hàng Trống</h1>
          <p className="text-zinc-500 mb-6 text-sm">
            Bạn chưa có gói dịch vụ nào trong giỏ hàng để tiến hành thanh toán.
          </p>
          <Link
            href="/services"
            className="w-full py-3.5 rounded-full bg-black hover:bg-zinc-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            Khám phá bảng giá dịch vụ
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-zinc-50 min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Breadcrumb */}
        <div className="mb-8">
          <Link href="/cart" className="text-sm font-bold text-black hover:underline mb-2 inline-flex items-center gap-1">
            ← Quay lại giỏ hàng
          </Link>
          <h1 className="text-3xl font-black text-black tracking-tight">Thanh Toán Đơn Hàng</h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Kiểm tra thông tin chi tiết và chọn phương thức thanh toán phù hợp
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-xs font-bold text-red-700">{error}</p>
            </div>
            {selectedMethod === 'wallet' && !isWalletSufficient && (
              <button
                type="button"
                onClick={() => setShowTopUpModal(true)}
                className="px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-zinc-800 transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Nạp tiền ngay
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: Items & Methods */}
          <div className="lg:col-span-2 space-y-6">
            {!hasToken && (
              <div className="p-4 bg-black text-white rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-zinc-900 rounded-xl text-white shrink-0">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Bạn đang đặt hàng với tư cách Khách</p>
                    <p className="text-[11px] text-zinc-300 mt-0.5">Đăng nhập để tự động liên kết đơn hàng vào tài khoản và nhận thông số máy chủ.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    useUIStore.getState().setAuthRedirect('/checkout');
                    useUIStore.getState().setAuthModal(true, 'login');
                  }}
                  className="px-4 py-2 bg-white text-black font-black text-xs rounded-xl hover:bg-zinc-200 transition-all shrink-0 cursor-pointer shadow-xs"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            )}

            <CheckoutAddressBook />
            
            {/* Services List in Order */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <h2 className="text-base font-black text-black">Dịch vụ trong đơn hàng ({cartItems.length})</h2>
                <Link href="/cart" className="text-xs font-bold text-zinc-600 hover:text-black underline">
                  Chỉnh sửa giỏ
                </Link>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => {
                  const itemQuantity = item.quantity || 1;
                  const itemTotalPrice = (item.price || 0) * itemQuantity;

                  return (
                    <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-zinc-100 last:border-0 gap-2 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider bg-zinc-100 text-black border border-zinc-300">
                            {getServiceTypeBadge(item.type, item.title || item.name)}
                          </span>
                          <span className="text-xs text-zinc-500 font-medium">
                            Chu kỳ: <strong className="text-black">{item.billingCycle}{typeof item.billingCycle === 'number' ? ' tháng' : ''}</strong>
                          </span>
                        </div>
                        <p className="font-bold text-sm text-black leading-snug">{item.title || item.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{item.details || 'Cấu hình tiêu chuẩn'}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-sm text-black">
                          {itemTotalPrice.toLocaleString('vi-VN')} đ
                        </span>
                        {itemQuantity > 1 && (
                          <p className="text-[11px] text-zinc-500 font-medium">
                            {itemQuantity} x {item.price.toLocaleString('vi-VN')} đ
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
                <h2 className="text-base font-black text-black">Phương thức thanh toán</h2>
                {selectedMethod === 'wallet' && !isWalletSufficient && (
                  <button
                    type="button"
                    onClick={() => setShowTopUpModal(true)}
                    className="text-xs font-bold text-black hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Nạp thêm vào ví
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isSelected = selectedMethod === method.id;
                  const isWallet = method.id === 'wallet';

                  return (
                    <div key={method.id} className="space-y-2">
                      <label
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-black bg-zinc-50 shadow-xs'
                            : 'border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                          className="w-4 h-4 text-black focus:ring-black accent-black"
                        />
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-black text-white' : 'bg-zinc-100 text-black border border-zinc-200'
                        }`}>
                          <method.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-black text-sm">{method.name}</p>
                            {isWallet && (
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                                isWalletSufficient 
                                  ? 'bg-zinc-100 text-black border-zinc-300' 
                                  : 'bg-zinc-100 text-zinc-600 border-zinc-300'
                              }`}>
                                {isWalletSufficient ? 'Khuyên dùng' : 'Thiếu số dư'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500 mt-0.5">{method.description}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-black shrink-0" />
                        )}
                      </label>

                      {/* Insufficient balance helper box */}
                      {isWallet && isSelected && !isWalletSufficient && (
                        <div className="p-4 rounded-xl bg-zinc-100 border border-zinc-300 space-y-3 animate-in fade-in duration-200">
                          <div className="flex items-start gap-2.5">
                            <AlertCircle className="w-4 h-4 text-black shrink-0 mt-0.5" />
                            <div className="text-xs text-black leading-relaxed">
                              <p className="font-bold">Số dư ví của bạn không đủ để thanh toán đơn hàng này</p>
                              <p className="text-zinc-600 mt-0.5">
                                Cần: <strong>{finalAmount.toLocaleString('vi-VN')} đ</strong> — Số dư có: <strong>{walletBalance.toLocaleString('vi-VN')} đ</strong> — Còn thiếu: <strong className="text-black font-black">{(finalAmount - walletBalance).toLocaleString('vi-VN')} đ</strong>
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setShowTopUpModal(true)}
                              className="px-4 py-2 rounded-full bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Nạp thêm {(finalAmount - walletBalance).toLocaleString('vi-VN')} đ vào ví
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedMethod('vietqr')}
                              className="px-4 py-2 rounded-full bg-white hover:bg-zinc-50 text-black border border-zinc-300 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <QrCode className="w-3.5 h-3.5 text-black" />
                              Quét mã VietQR trực tiếp
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-zinc-200 sticky top-24 shadow-sm space-y-6">
              <h2 className="text-lg font-black text-black pb-3 border-b border-zinc-100">
                Tóm Tắt Thanh Toán
              </h2>

              {/* Coupon Input */}
              <div className="pb-4 border-b border-zinc-100">
                <CouponInput 
                  onApply={applyCoupon}
                  onRemove={removeCoupon}
                  orderTotal={subtotal}
                />
              </div>
              
              <div className="space-y-3">
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
                  <span className="font-bold text-black">{taxAmount.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="border-t border-zinc-200 pt-4 flex items-baseline justify-between">
                  <span className="font-black text-black text-base">Tổng thanh toán:</span>
                  <span className="text-2xl font-black text-black tracking-tight">
                    {finalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-4 rounded-full bg-black hover:bg-zinc-800 text-white font-black text-base shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang xử lý đơn hàng...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    <span>
                      {selectedMethod === 'wallet' 
                        ? `Xác Nhận Trừ Ví (${finalAmount.toLocaleString('vi-VN')} đ)` 
                        : selectedMethod === 'vietqr'
                        ? 'Tiếp Tục Quét Mã VietQR'
                        : selectedMethod === 'momo_sandbox'
                        ? 'Tiếp Tục Thanh Toán MoMo'
                        : 'Tiếp Tục Thanh Toán ZaloPay'}
                    </span>
                  </>
                )}
              </button>

              <div className="pt-4 border-t border-zinc-100 space-y-2">
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <ShieldCheck className="w-4 h-4 text-black shrink-0" />
                  <span>Mã hóa bảo mật giao dịch 256-bit SSL</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                  <Clock className="w-4 h-4 text-black shrink-0" />
                  <span>Kích hoạt dịch vụ tự động trong 30 giây</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        currentBalance={walletBalance}
        suggestedAmount={finalAmount > walletBalance ? finalAmount - walletBalance : undefined}
        onSuccess={() => {
          const t = localStorage.getItem('accessToken');
          if (t) fetchWallet(t);
        }}
      />
    </div>
  );
}
