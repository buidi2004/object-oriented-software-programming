'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Globe, Zap, Shield, CheckCircle2, ArrowRight, 
  GitBranch, RefreshCw, Cpu, Activity, ShoppingCart 
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';

export default function StaticSitesServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'static-hobby',
      name: 'Static Hobby',
      tagline: 'Phù hợp cho dự án cá nhân & Portfolio sinh viên',
      monthlyPrice: 49000,
      yearlyPrice: 39000 * 12,
      sites: '3 Websites tĩnh',
      bandwidth: '100 GB Băng thông Edge CDN',
      features: [
        'Hỗ trợ Next.js, Vite, React, Astro, HTML/CSS',
        'Tự động Deploy khi git push (GitHub/GitLab)',
        'Chứng chỉ SSL tự động miễn phí trọn đời',
        'Gắn Custom Domain không giới hạn',
        'Bản xem trước Deploy Preview theo nhánh Git',
        'Rollback 1-Click về bản trước bất kỳ lúc nào',
      ],
      badge: null,
      popular: false,
    },
    {
      id: 'static-pro',
      name: 'Static Web Pro',
      tagline: 'Lựa chọn lý tưởng cho Freelancer & Agency Web',
      monthlyPrice: 129000,
      yearlyPrice: 99000 * 12,
      sites: '15 Websites tĩnh',
      bandwidth: '500 GB Băng thông Edge CDN',
      features: [
        'Mạng phân phối CDN 300+ Edge PoPs toàn cầu',
        'Serverless Edge Functions (Xử lý backend tại Edge)',
        'Tối ưu hóa ảnh tự động (Image Optimization)',
        'Bảo mật chống tấn công DDoS Layer 7',
        'Phân tích lượt truy cập Web Analytics bảo mật',
        'Hỗ trợ kỹ thuật 24/7 qua LiveChat & Ticket',
      ],
      badge: 'Bán chạy nhất',
      popular: true,
    },
    {
      id: 'static-team',
      name: 'Static Agency Team',
      tagline: 'Dành cho Doanh nghiệp & Startup nhiều sản phẩm',
      monthlyPrice: 349000,
      yearlyPrice: 279000 * 12,
      sites: 'Không giới hạn Website',
      bandwidth: '2,000 GB Băng thông Edge CDN',
      features: [
        'Tốc độ Build song song không giới hạn',
        'Phân quyền thành viên nhóm theo dự án (RBAC)',
        'Dedicated Anycast IP riêng',
        'Môi trường Staging & Production riêng biệt',
        'Cam kết chất lượng dịch vụ SLA 99.99%',
        'Hỗ trợ VIP 1-1 qua Telegram/Zalo',
      ],
      badge: 'Agency & Team',
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
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Globe className="w-4 h-4 text-emerald-400" />
            Nền Tảng Triển Khai Jamstack &amp; Web Tĩnh Siêu Tốc
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            Deploy Website Trong 30 Giây Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">
              Cloud Static Sites
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Kết nối GitHub, GitLab và tự động deploy chỉ sau một lệnh <code className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono text-xs">git push</code>. Phân phối toàn cầu với Edge CDN và chứng chỉ SSL miễn phí.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30'
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
                className={`relative rounded-3xl bg-white p-8 border transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-105 z-10 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <Globe className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-6">{plan.tagline}</p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        {displayPrice.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">đ/tháng</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        Thanh toán {plan.yearlyPrice.toLocaleString('vi-VN')} đ/năm
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-500" />
                      {plan.sites}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {plan.bandwidth}
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
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Triển Khai Static Site
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
