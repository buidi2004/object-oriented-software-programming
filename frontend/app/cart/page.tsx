'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Clock, Plus, Minus } from 'lucide-react';
import { CouponInput, useCoupon } from '@/components/CouponInput';

interface CartItem {
  id: string;
  type: 'vps' | 'hosting' | 'domain';
  title: string;
  details: string;
  price: number;
  quantity?: number;
  billingCycle: string;
}

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { discount, applyCoupon, removeCoupon } = useCoupon();

  useEffect(() => {
    fetchCart();
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
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/carts/items/${itemId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      fetchCart();
    } catch (error) {
      console.error('Failed to update item quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/carts/items/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCart();
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);
  const discountAmount = Math.round(subtotal * discount / 100);
  const tax = Math.round((subtotal - discountAmount) * 0.08);
  const total = subtotal - discountAmount + tax;

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/services" className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Tiếp tục mua sắm
          </Link>
          <h1 className="text-3xl font-black text-slate-900">Giỏ hàng của bạn</h1>
          <p className="text-slate-500 mt-1">{cartItems.length} sản phẩm trong giỏ hàng</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <ShoppingCart className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Giỏ hàng trống</h2>
            <p className="text-slate-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng để tiếp tục</p>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Khám phá dịch vụ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 border border-slate-200">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                      {item.title[0]}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              item.type === 'vps' ? 'bg-blue-100 text-blue-700' :
                              item.type === 'hosting' ? 'bg-indigo-100 text-indigo-700' :
                              'bg-cyan-100 text-cyan-700'
                            }`}>
                              {item.type === 'vps' ? 'Cloud VPS' : item.type === 'hosting' ? 'Web Hosting' : 'Tên miền'}
                            </span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                          <p className="text-sm text-slate-500 mt-1">{item.details}</p>
                          <p className="text-xs text-slate-400 mt-2">Chu kỳ thanh toán: <span className="font-semibold text-slate-600">{item.billingCycle}</span></p>
                        </div>

                        <div className="text-right flex flex-col items-end gap-3">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa khỏi giỏ"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition-colors"
                              title="Giảm số lượng"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 text-center text-xs font-bold text-slate-900">
                              {item.quantity || 1}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 transition-colors"
                              title="Tăng số lượng"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-xl font-black text-slate-900">
                            {item.price.toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border border-slate-200 sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Tổng cộng</h2>
                
                {/* Coupon Input */}
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <CouponInput 
                    onApply={applyCoupon}
                    onRemove={removeCoupon}
                    orderTotal={subtotal}
                  />
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Tạm tính</span>
                    <span className="font-semibold text-slate-900">{subtotal.toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-emerald-600">Giảm giá</span>
                      <span className="font-semibold text-emerald-600">-{discountAmount.toLocaleString('vi-VN')} đ</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Thuế (8%)</span>
                    <span className="font-semibold text-slate-900">{tax.toLocaleString('vi-VN')} đ</span>
                  </div>
                  
                  <div className="border-t border-slate-200 pt-3 flex justify-between">
                    <span className="font-bold text-slate-900">Tổng thanh toán</span>
                    <span className="text-2xl font-black text-blue-600">
                      {total.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  Tiến Hành Thanh Toán
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>Thanh toán an toàn qua VNPAY / MoMo</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Kích hoạt tự động sau 30 giây</span>
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
