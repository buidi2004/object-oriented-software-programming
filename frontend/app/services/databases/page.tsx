'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Server, Database, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Activity, RefreshCw, ShoppingCart 
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function DatabasesServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [engine, setEngine] = useState<'mysql' | 'postgres' | 'redis'>('mysql');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);

  React.useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/managed-database/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load managed database plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: '7d9ae64f-db23-404c-8ed2-3eb39a1e4723',
      name: 'DB Micro',
      tagline: 'Lý tưởng cho môi trường Dev/Test & App nhỏ',
      monthlyPrice: 199000,
      yearlyPrice: 159000 * 12,
      cpu: '0.5 vCPU (Shared)',
      ram: '256 MB RAM',
      storage: '2 GB NVMe Storage',
      features: [
        'Hỗ trợ MySQL 8.0 / PostgreSQL 16 / Redis 7',
        'Phù hợp dự án thực hành / học tập',
        'SSL Encrypted Connection',
      ],
      badge: null,
      popular: false,
    },
    {
      id: '2bf4b5b1-ec2d-4140-9819-ca61c551078b',
      name: 'DB Standard',
      tagline: 'Phổ biến cho ứng dụng Web nhỏ',
      monthlyPrice: 599000,
      yearlyPrice: 479000 * 12,
      cpu: '0.5 vCPU Dedicated',
      ram: '256 MB RAM',
      storage: '5 GB NVMe Storage',
      features: [
        'Băng thông không giới hạn',
        'Tự động sao lưu hàng ngày (3 ngày lưu trữ)',
        'Hỗ trợ kỹ thuật cơ bản',
      ],
      badge: 'Khuyên dùng',
      popular: true,
    },
    {
      id: '38a09ebe-14ae-4a96-b155-8f5c3da8e622',
      name: 'DB Pro',
      tagline: 'Dành cho dự án cá nhân',
      monthlyPrice: 1590000,
      yearlyPrice: 1272000 * 12,
      cpu: '0.5 vCPU Dedicated',
      ram: '256 MB RAM',
      storage: '10 GB NVMe Storage',
      features: [
        'Tối ưu In-Memory Cache',
        'Dedicated IOPS',
        'Cam kết SLA Uptime 99.9%',
      ],
      badge: 'Chuyên nghiệp',
      popular: false,
    },
  ];

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      monthlyPrice: matchingDb?.monthlyPrice || dp.monthlyPrice,
      yearlyPrice: matchingDb?.yearlyPrice || dp.yearlyPrice,
    };
  });

  const handleOrder = async (plan: typeof plans[0]) => {
    const cycleMonths = billingCycle === 'yearly' ? 12 : 1;
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    await addItem(plan.id, cycleMonths, false, {
      name: `${plan.name} (${engine.toUpperCase()}) - ${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'}`,
      price: price,
      billingCycle: cycleMonths,
      type: 'database',
      details: `${plan.cpu} • ${plan.ram} • ${plan.storage}`
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-teal-950 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(20,184,166,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Database className="w-4 h-4 text-teal-400" />
            Cơ Sở Dữ Liệu Đám Mây Quản Trị Tự Động (Managed DB)
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            Tập Trung Phát Triển Ứng Dụng Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300">
              Managed Cloud Databases
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Khởi tạo MySQL, PostgreSQL, Redis trong 60 giây. Tự động sao lưu, nâng cấp phiên bản, nhân bản dữ liệu High Availability và bảo mật nhiều lớp.
          </p>

          {/* Engine Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setEngine('mysql')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                engine === 'mysql'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Database className="w-4 h-4" /> MySQL 8.0
            </button>
            <button
              onClick={() => setEngine('postgres')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                engine === 'postgres'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Server className="w-4 h-4" /> PostgreSQL 16
            </button>
            <button
              onClick={() => setEngine('redis')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                engine === 'redis'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <Zap className="w-4 h-4" /> Redis Cache 7
            </button>
          </div>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
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
                    ? 'border-teal-500 shadow-2xl shadow-teal-500/10 scale-105 z-10 ring-2 ring-teal-500/20'
                    : 'border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <Database className="w-6 h-6" />
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
                      <Cpu className="w-4 h-4 text-teal-500" />
                      {plan.cpu}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-500" />
                      {plan.ram}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-indigo-500" />
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
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Khởi Tạo Database
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
