'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, Server, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Terminal, Clock, ShoppingCart 
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function GameServersServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedGame, setSelectedGame] = useState<'minecraft' | 'cs2' | 'rust'>('minecraft');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);

  React.useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/game-server/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load game server plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: '5ac0ac63-8ad6-44f5-8981-95334603b4fd',
      name: 'Game Server Starter',
      tagline: 'Phù hợp chơi cùng nhóm bạn từ 5 - 10 người',
      monthlyPrice: 149000,
      yearlyPrice: 119000 * 12,
      cpu: '1 vCPU (Shared)',
      ram: '768 MB RAM',
      storage: '10 GB NVMe',
      features: [
        'Tối ưu riêng cho Minecraft',
        'Khởi tạo máy chủ trong 60 giây',
        'Web Terminal cơ bản',
      ],
      badge: null,
      popular: false,
    },
    {
      id: '552009b7-4ca9-41fd-adc0-b6443ce5b0fa',
      name: 'Game Server Pro',
      tagline: 'Phổ biến cho Cộng đồng nhỏ',
      monthlyPrice: 299000,
      yearlyPrice: 239000 * 12,
      cpu: '1 vCPU Dedicated',
      ram: '1 GB RAM',
      storage: '20 GB NVMe',
      features: [
        'Hỗ trợ Minecraft, CS2, Rust',
        'Khởi tạo máy chủ trong 60 giây',
        'Băng thông 100Mbps',
      ],
      badge: 'Bán chạy nhất',
      popular: true,
    },
    {
      id: '0348fc3c-bdbf-49c3-9fdd-7a6c6a1aeb82',
      name: 'Game Server Extreme',
      tagline: 'Dành cho Máy chủ Mods nhẹ',
      monthlyPrice: 599000,
      yearlyPrice: 479000 * 12,
      cpu: '1 vCPU Dedicated',
      ram: '1 GB RAM',
      storage: '40 GB NVMe',
      features: [
        'Hỗ trợ Minecraft, CS2, Rust',
        'Khởi tạo máy chủ trong 60 giây',
        'Hỗ trợ cài đặt Mod',
      ],
      badge: 'Cộng đồng',
      popular: false,
    },
  ];

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx] || dbPlans.find((p: any) => p.name?.toLowerCase().includes(selectedGame));
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
      name: `${plan.name} (${selectedGame.toUpperCase()}) - ${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'}`,
      price: price,
      billingCycle: cycleMonths,
      type: 'game',
      details: `${plan.cpu} • ${plan.ram} • ${plan.storage}`
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-purple-950 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(168,85,247,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Gamepad2 className="w-4 h-4 text-purple-400" />
            Máy Chủ Game Hiệu Năng Cao - Anti DDoS Game Chuyên Sâu
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            Chiến Game Mượt Mà Cùng Bạn Bè Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Cloud Game Servers
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Sức mạnh vi xử lý AMD Ryzen 9 5.0GHz kết hợp RAM DDR5 và NVMe Gen4. Khởi tạo trong 60 giây, bảo vệ chống DDoS chuyên sâu và độ trễ dưới 10ms.
          </p>

          {/* Game Selector */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            <button
              onClick={() => setSelectedGame('minecraft')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedGame === 'minecraft'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              🎮 Minecraft (Java/Bedrock)
            </button>
            <button
              onClick={() => setSelectedGame('cs2')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedGame === 'cs2'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              🔫 Counter-Strike 2
            </button>
            <button
              onClick={() => setSelectedGame('rust')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedGame === 'rust'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'bg-slate-800/80 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              🛡️ Rust
            </button>
          </div>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
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
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/10 scale-105 z-10 ring-2 ring-purple-500/20'
                    : 'border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                      <Gamepad2 className="w-6 h-6" />
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
                      <Cpu className="w-4 h-4 text-purple-500" />
                      {plan.cpu}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-500" />
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
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Tạo Game Server Ngay
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
