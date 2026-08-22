'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Layout, Sparkles, Zap, CheckCircle2, ArrowRight, 
  Smartphone, ShoppingBag, Globe, Cpu, ShoppingCart 
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';

export default function WebsiteBuilderServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'builder-starter',
      name: 'AI Builder Starter',
      tagline: 'Lý tưởng cho trang cá nhân, Landing Page bán hàng',
      monthlyPrice: 99000,
      yearlyPrice: 79000 * 12,
      pages: 'Tạo tối đa 5 Trang',
      storage: '5 GB Dung lượng ảnh & media',
      features: [
        'Trợ lý AI viết nội dung & tạo giao diện tự động',
        'Hơn 200+ Mẫu thiết kế chuẩn SEO responsive',
        'Kéo thả trực quan không cần biết lập trình',
        'Miễn phí SSL bảo mật & Tên miền phụ',
        'Tích hợp Form liên hệ & Google Maps',
        'Hỗ trợ kết nối Tên miền riêng',
      ],
      badge: null,
      popular: false,
    },
    {
      id: 'builder-business',
      name: 'AI Builder Business Pro',
      tagline: 'Bán chạy nhất cho Doanh nghiệp & Shop Online',
      monthlyPrice: 249000,
      yearlyPrice: 199000 * 12,
      pages: 'Không giới hạn số trang',
      storage: '30 GB Dung lượng NVMe',
      features: [
        'Trọn bộ tính năng Bán hàng E-commerce (1,000 sản phẩm)',
        'Cổng thanh toán MoMo, VietQR, VNPay, Thẻ ATM/Visa',
        'Tự động tối ưu SEO On-Page & Schema Markup',
        'Tích hợp LiveChat, Facebook Pixel, Google Analytics',
        'Tặng miễn phí 1 Tên miền quốc tế .COM 1 năm',
        'Hỗ trợ kỹ thuật 24/7 ưu tiên',
      ],
      badge: 'Phổ biến nhất',
      popular: true,
    },
    {
      id: 'builder-vip',
      name: 'AI Builder VIP Enterprise',
      tagline: 'Dành cho Chuỗi thương hiệu & Đa chi nhánh',
      monthlyPrice: 599000,
      yearlyPrice: 479000 * 12,
      pages: 'Không giới hạn & Đa ngôn ngữ',
      storage: '100 GB Dung lượng NVMe',
      features: [
        'Hỗ trợ Website Đa ngôn ngữ (Tiếng Việt, Anh, Nhật, Hàn)',
        'Bán hàng không giới hạn sản phẩm & Quản lý tồn kho',
        'Phân quyền quản trị viên nhiều cấp bậc',
        'Tùy biến mã nguồn CSS/JavaScript nâng cao',
        'Hệ thống Email Marketing gửi tự động tới khách',
        'Chuyên viên thiết kế hỗ trợ chỉnh sửa theo yêu cầu',
      ],
      badge: 'Doanh nghiệp lớn',
      popular: false,
    },
  ];

  const handleOrder = async (plan: typeof plans[0]) => {
    const cycleMonths = billingCycle === 'yearly' ? 12 : 1;
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    await addItem(plan.id, cycleMonths, false, {
      name: `${plan.name} (${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'})`,
      price: price,
      billingCycle: cycleMonths,
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-pink-950 text-slate-900 pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(236,72,153,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4 text-pink-400" />
            Trình Tạo Trang Web Thông Minh Với Trợ Lý AI
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight mb-6">
            Tạo Website Chuyên Nghiệp Trong 5 Phút Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300">
              AI Website Builder
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto mb-10">
            Không cần biết lập trình hay thiết kế. Trợ lý AI tự động tạo bố cục, viết bài giới thiệu, tối ưu chuẩn SEO và tích hợp giỏ hàng thanh toán đa kênh.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-md bg-white/80 backdrop-blur-md border border-slate-300">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Năm
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const displayPrice = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-lg bg-white p-8 border transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-pink-500 shadow-2xl shadow-pink-500/10 scale-105 z-10 ring-2 ring-pink-500/20'
                    : 'border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-600 text-slate-900 text-xs font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-md bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
                      <Layout className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-600 mb-6">{plan.tagline}</p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        {displayPrice.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-sm text-slate-600 font-medium">đ/tháng</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        Thanh toán {plan.yearlyPrice.toLocaleString('vi-VN')} đ/năm
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="p-3 rounded bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Layout className="w-4 h-4 text-pink-500" />
                      {plan.pages}
                    </div>
                    <div className="p-3 rounded bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {plan.storage}
                    </div>

                    <div className="pt-2 space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOrder(plan)}
                  className={`w-full py-3.5 rounded-md font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-pink-600 hover:bg-pink-700 text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Bắt Đầu Tạo Website
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
