'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, Shield, Globe, Server, CheckCircle2, ArrowRight, 
  Activity, Cloud, Lock, Cpu, ShoppingCart 
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';

export default function CdnServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'cdn-starter',
      name: 'CDN Starter',
      tagline: 'Tối ưu cho Blog & Website doanh nghiệp',
      monthlyPrice: 149000,
      yearlyPrice: 119000 * 12,
      bandwidth: '1 TB Băng thông/tháng',
      pops: 'Hơn 50+ PoPs Châu Á & Việt Nam',
      features: [
        'Tăng tốc website lên 200%',
        'Nén tệp Brotli & Gzip tự động',
        'Miễn phí chứng chỉ SSL Edge',
        'Hỗ trợ giao thức HTTP/2 & HTTP/3 Quic',
        'Xóa Cache theo URL tức thì (Instant Purge)',
        'Anti-DDoS cơ bản Layer 3/4',
      ],
      badge: null,
      popular: false,
    },
    {
      id: 'cdn-pro',
      name: 'CDN Business Pro',
      tagline: 'Phổ biến cho E-commerce & Web nhiều truy cập',
      monthlyPrice: 499000,
      yearlyPrice: 399000 * 12,
      bandwidth: '5 TB Băng thông/tháng',
      pops: 'Hơn 200+ PoPs toàn cầu',
      features: [
        'Tối ưu và nén ảnh WebP/AVIF tự động tại Edge',
        'Bảo vệ chống DDoS Layer 7 nâng cao',
        'Quy tắc WAF (Web Application Firewall) tùy biến',
        'Phân tích lưu lượng truy cập Real-time Analytics',
        'Hỗ trợ Video Streaming (HLS/DASH)',
        'Hỗ trợ kỹ thuật 24/7 ưu tiên',
      ],
      badge: 'Bán chạy nhất',
      popular: true,
    },
    {
      id: 'cdn-enterprise',
      name: 'CDN Enterprise Ultra',
      tagline: 'Dành cho Cổng thông tin, Game & Ứng dụng lớn',
      monthlyPrice: 1490000,
      yearlyPrice: 1190000 * 12,
      bandwidth: '20 TB Băng thông tốc độ cao',
      pops: 'Toàn bộ 300+ PoPs toàn cầu',
      features: [
        'Edge Functions (Chạy mã nguồn tại CDN Edge)',
        'Chống DDoS dung lượng lớn tới 1.5 Tbps',
        'Tùy chỉnh chứng chỉ SSL riêng (Custom SSL)',
        'Đường truyền riêng tối ưu hóa Anycast DNS',
        'Hỗ trợ tích hợp hệ thống 1-1 với Chuyên gia',
        'Cam kết chất lượng dịch vụ SLA 99.999%',
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
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950 text-slate-900 pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(245,158,11,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Zap className="w-4 h-4 text-amber-400" />
            Mạng Phân Phối Nội Dung Siêu Tốc (Cloud CDN)
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight mb-6">
            Tăng Tốc Tải Trang Gấp 3 Lần Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400">
              Cloud CDN Toàn Cầu
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto mb-10">
            Phân phối nội dung website, media và video từ hơn 300+ Edge PoPs toàn cầu. Giảm 70% tải máy chủ gốc và bảo vệ toàn diện trước DDoS.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-md bg-white/80 backdrop-blur-md border border-slate-300">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30'
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
                    ? 'border-amber-500 shadow-2xl shadow-amber-500/10 scale-105 z-10 ring-2 ring-amber-500/20'
                    : 'border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 text-slate-900 text-xs font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                      <Zap className="w-6 h-6" />
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
                      <Activity className="w-4 h-4 text-amber-500" />
                      {plan.bandwidth}
                    </div>
                    <div className="p-3 rounded bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#1F1F1F]" />
                      {plan.pops}
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
                      ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Kích Hoạt CDN Ngay
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
