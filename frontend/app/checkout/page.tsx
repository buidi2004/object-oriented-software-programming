'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, CreditCard, QrCode, Banknote, CheckCircle, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';

interface CartItem {
  id: string;
  type: 'vps' | 'hosting' | 'domain';
  title: string;
  price: number;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: typeof CreditCard;
  description: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>('vietqr');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [step, setStep] = useState<'cart' | 'processing' | 'success'>('cart');

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/cart');
        return;
      }
      try {
        await useCartStore.getState().syncGuestCart();
      } catch {}
      await fetchCart();
    };
    init();
  }, []);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/carts/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCartItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price, 0);
  const taxAmount = totalAmount * 0.08;
  const finalAmount = totalAmount + taxAmount;

  const paymentMethods: PaymentMethod[] = [
    { id: 'vietqr', name: 'Chuyển khoản VietQR (MB Bank)', icon: QrCode, description: 'Quét mã VietQR chuyển khoản tự động 24/7 (SePay)' },
  ];

  const handlePayment = async () => {
    setIsLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('accessToken');
      
      // 1. Checkout to create order
      const orderResponse = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ couponCode: null }),
      });

      if (!orderResponse.ok) {
        const data = await orderResponse.json();
        throw new Error(data.message || 'Lỗi tạo đơn hàng');
      }

      const orderData = await orderResponse.json();
      const orderId = orderData.orderId || orderData.id || `ORD_${Date.now()}`;

      // 2. Route to VietQR payment gateway
      if (selectedMethod === 'vietqr') {
        router.push(`/sandbox/vietqr?orderId=${orderId}&amount=${finalAmount}`);
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
        setPaymentUrl(data.url || `/sandbox/vietqr?orderId=${orderId}&amount=${finalAmount}`);
      } else {
        setPaymentUrl(`/sandbox/vietqr?orderId=${orderId}&amount=${finalAmount}`);
      }
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi');
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'success' && paymentUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-slate-100 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Đặt Hàng Thành Công!</h1>
          <p className="text-slate-500 mb-6">
            Đơn hàng của bạn đã được ghi nhận. Vui lòng hoàn tất thanh toán để kích hoạt dịch vụ.
          </p>
          
          <div className="bg-slate-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-600 mb-1">Tổng thanh toán</p>
            <p className="text-3xl font-black text-blue-600">{finalAmount.toLocaleString('vi-VN')} đ</p>
          </div>

          <a
            href={paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all block mb-3"
          >
            Thanh Toán Ngay
          </a>
          
          <Link href="/dashboard/orders" className="text-sm text-slate-500 hover:text-blue-600">
            Xem đơn hàng của tôi →
          </Link>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 text-center">
          <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4 text-blue-600">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">Giỏ Hàng Trống</h1>
          <p className="text-slate-500 mb-6 text-sm">
            Bạn chưa có gói dịch vụ nào trong giỏ hàng để thanh toán.
          </p>
          <Link
            href="/services/cloud-vps"
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Khám phá gói Cloud VPS
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Thanh Toán</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Dịch vụ trong giỏ hàng</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-slate-100 last:border-0 gap-1.5 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm sm:text-base text-slate-900 leading-snug">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.type === 'vps' ? 'Cloud VPS' : item.type === 'hosting' ? 'Web Hosting' : 'Tên miền'}</p>
                    </div>
                    <span className="font-extrabold text-sm sm:text-base text-blue-600 sm:text-slate-900 shrink-0">{item.price.toLocaleString('vi-VN')} đ</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Phương thức thanh toán</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                    />
                    <method.icon className={`w-6 h-6 ${selectedMethod === method.id ? 'text-blue-600' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{method.name}</p>
                      <p className="text-sm text-slate-500">{method.description}</p>
                    </div>
                    {selectedMethod === method.id && (
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-24">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Tổng thanh toán</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tạm tính</span>
                  <span className="font-medium">{totalAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Thuế VAT (8%)</span>
                  <span className="font-medium">{taxAmount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="border-t border-slate-200 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Tổng cộng</span>
                  <span className="text-2xl font-black text-blue-600">
                    {finalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Thanh Toán
                  </>
                )}
              </button>

              <div className="mt-4 text-xs text-slate-500 text-center">
                Thanh toán an toàn được bảo vệ bởi mã hóa SSL 256-bit
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
