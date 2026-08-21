'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, Server, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Terminal, Clock, ShoppingCart, Activity,
  Sliders, Award, RefreshCw, Layers, ShieldCheck, ChevronDown,
  ChevronUp, Sparkles, Play, Globe, MessageSquare, Flame, Laptop
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function GameServersServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedGame, setSelectedGame] = useState<'minecraft' | 'cs2' | 'rust'>('minecraft');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
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
      cpu: '2 Core AMD Ryzen 9',
      ram: '4 GB RAM DDR5',
      storage: '25 GB NVMe Gen4',
      bandwidth: '100 Mbps Unlimited',
      slots: '10 - 20 Players',
      features: [
        'Tối ưu riêng cho PaperMC, Spigot, Purpur',
        'Bảo vệ chống DDoS Game Layer 7 lên đến 500Gbps',
        'Khởi tạo máy chủ trong 60 giây',
        'Web Console & Quản lý File trực quan',
        'Tự động Backup dữ liệu hàng ngày'
      ],
      badge: null,
      popular: false,
    },
    {
      id: '552009b7-4ca9-41fd-adc0-b6443ce5b0fa',
      name: 'Game Server Pro (Match Server)',
      tagline: 'Phổ biến cho Clan & Cộng đồng thi đấu 128 Tickrate',
      monthlyPrice: 299000,
      yearlyPrice: 239000 * 12,
      cpu: '4 Core AMD Ryzen 9 5.0GHz',
      ram: '8 GB RAM DDR5',
      storage: '50 GB NVMe Gen4',
      bandwidth: '1 Gbps Dedicated Port',
      slots: '30 - 64 Players',
      features: [
        'Hỗ trợ Minecraft Mods, CS2 128-Tick, Rust Server',
        'Anti-DDoS L3/L4/L7 Chuyên Dụng Cho Gaming',
        'Web Terminal SSH & FTP File Manager Siêu Tốc',
        'Cài đặt Plugin / Modpacks 1-Click',
        'Độ trễ Ping nội địa < 5ms, Quốc tế < 35ms'
      ],
      badge: 'Bán chạy nhất',
      popular: true,
    },
    {
      id: '0348fc3c-bdbf-49c3-9fdd-7a6c6a1aeb82',
      name: 'Game Server Extreme (High-Load)',
      tagline: 'Dành cho Máy chủ Network lớn, Custom Mods & Sự Kiện',
      monthlyPrice: 599000,
      yearlyPrice: 479000 * 12,
      cpu: '6 Core AMD Ryzen 9 5.0GHz',
      ram: '16 GB RAM DDR5 ECC',
      storage: '100 GB NVMe Gen4 Enterprise',
      bandwidth: '1 Gbps Dedicated Port',
      slots: 'Không giới hạn Slots',
      features: [
        'Cụm BungeeCord / Velocity Network đa cụm máy chủ',
        'Khởi tạo máy chủ tức thì trong 30 giây',
        'Dedicated Anycast IPv4 riêng biệt',
        'Hỗ trợ cài đặt Modpack nặng (RLCraft, ATM9, Rust Oxide)',
        'Kỹ thuật viên túc trực hỗ trợ 24/7'
      ],
      badge: 'Cộng đồng lớn',
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

  const faqs = [
    {
      q: 'Máy chủ Game của CloudHost hỗ trợ những tựa game nào?',
      a: 'Hệ thống hỗ trợ toàn diện các tựa game nổi tiếng như Minecraft (Java & Bedrock, Forge, Fabric, PaperMC, Purpur), Counter-Strike 2 (CS2 128-Tick, Practice Mod, Retake), Rust, ARK: Survival Evolved, Palworld, Valheim, GTA V (FiveM), Terraria và Team Fortress 2.'
    },
    {
      q: 'Hệ thống chống tấn công DDoS Game hoạt động như thế nào?',
      a: 'Chúng tôi triển khai hệ thống lọc Anti-DDoS phần cứng chuyên dụng cho Game tại cổng Router Edge với băng thông lọc hơn 500Gbps. Hệ thống tự động phát hiện và chặn đứng các đợt tấn công UDP Flood, SYN Flood, Minecraft Bot Attack, CS2 Query Exploit trong vòng chưa đầy 1 giây mà không làm gián đoạn người chơi.'
    },
    {
      q: 'Tôi có thể cài đặt thêm Mods, Plugins hoặc Custom Map không?',
      a: 'Hoàn toàn được! Bảng điều khiển tích hợp File Manager trực quan và kết nối SFTP/SSH cho phép bạn upload dữ liệu, cài đặt plugin (.jar, .amxx, Oxide/uMod) hoặc custom map tùy ý chỉ trong vài cú nhấp chuột.'
    },
    {
      q: 'Ping và độ trễ của máy chủ Game tại Việt Nam như thế nào?',
      a: 'Máy chủ đặt tại Datacenter Tier-III Viettel IDC & VNPT Hà Nội / TP.HCM với kết nối cáp quang trực tiếp tới các ISP lớn. Ping trung bình trong nước chỉ từ 2ms - 10ms, và đi Đông Nam Á (Singapore, Thái Lan) từ 25ms - 35ms, đảm bảo trải nghiệm chơi game mượt mà không giật lag.'
    },
    {
      q: 'Tôi có được hỗ trợ kỹ thuật khi máy chủ bị lỗi mod/plugin không?',
      a: 'Đội ngũ kỹ thuật viên Game Server giàu kinh nghiệm luôn túc trực 24/7/365 qua LiveChat và Ticket hỗ trợ gỡ lỗi crash log, tối ưu TPS máy chủ và cài đặt plugin hoàn toàn miễn phí.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-purple-600/20 via-pink-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-inner">
            <Gamepad2 className="w-4 h-4 text-purple-400 animate-pulse" />
            Máy Chủ Game Hiệu Năng Cao - AMD Ryzen 9 5.0GHz & Anti-DDoS 500Gbps
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Khởi Tạo Máy Chủ Game Đỉnh Cao Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Zero Latency & 99.99% Uptime
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Trang bị phần cứng AMD Ryzen 9 7950X, RAM DDR5 ECC 5600MHz và ổ cứng NVMe Gen4 tốc độ 7,000MB/s. 
            Tự động chống DDoS Game Layer 7, cài đặt 1-Click và bàn giao tức thì trong 60 giây.
          </p>

          {/* Game Selector Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
            {[
              { id: 'minecraft', label: '🎮 Minecraft (Java & Bedrock)', desc: 'PaperMC, Purpur, Forge' },
              { id: 'cs2', label: '🔫 Counter-Strike 2 (CS2)', desc: '128-Tick Match & Practice' },
              { id: 'rust', label: '🛡️ Rust Dedicated', desc: 'Oxide / uMod Support' },
            ].map((game) => (
              <button
                key={game.id}
                onClick={() => setSelectedGame(game.id as any)}
                className={`px-5 py-3 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-0.5 border ${
                  selectedGame === game.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl shadow-purple-500/30 border-purple-400 scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                }`}
              >
                <span className="font-extrabold text-sm">{game.label}</span>
                <span className="text-[10px] text-purple-200 opacity-80">{game.desc}</span>
              </button>
            ))}
          </div>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-2xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Thanh Toán Theo Năm</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const displayPrice = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl bg-slate-800/90 backdrop-blur-md p-8 border transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-purple-500 shadow-2xl shadow-purple-500/20 ring-2 ring-purple-500/40 bg-gradient-to-b from-slate-800 to-slate-900 lg:-translate-y-4'
                    : 'border-slate-700/80 shadow-xl hover:border-slate-600 hover:shadow-2xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                      <Gamepad2 className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] font-bold text-slate-300">
                      {plan.slots}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{plan.tagline}</p>

                  <div className="mb-6 pb-6 border-b border-slate-700/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">
                        {displayPrice.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-sm text-slate-400 font-bold">đ/tháng</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-emerald-400 font-semibold mt-1">
                        Thanh toán {plan.yearlyPrice.toLocaleString('vi-VN')} đ/năm (Tiết kiệm 20%)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Cpu className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{plan.cpu}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{plan.ram}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <HardDrive className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>{plan.storage}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{plan.bandwidth}</span>
                    </div>

                    <div className="pt-3 space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOrder(plan)}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    plan.popular
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02]'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Tạo Máy Chủ Game Ngay</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. REALISTIC HARDWARE & DATACENTER SHOWCASE SECTION */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Server className="w-3.5 h-3.5" />
              Hạ Tầng Phần Cứng Máy Chủ Vật Lý Đỉnh Cao
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Không Ảo Hóa Quá Tải, Cam Kết 100% Sức Mạnh Phần Cứng
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mỗi máy chủ Game được vận hành trên CPU AMD Ryzen 9 7950X xung nhịp 5.7GHz Boost, bộ nhớ RAM DDR5 ECC và cụm tản nhiệt nước công nghiệp tại Datacenter Tier-III.
            </p>
          </div>

          {/* 3 Columns Hardware Specs with Real Photos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80"
                    alt="AMD Ryzen 9 High Clock Processor"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-purple-600/90 text-white text-[11px] font-black uppercase">
                    AMD Ryzen 9 7950X
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Xung Nhịp Đơn Nhân 5.7 GHz</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Game Server (đặc biệt Minecraft & CS2) phụ thuộc lớn vào sức mạnh đơn nhân. AMD Ryzen 9 mang lại số khung hình TPS 20.0 tuyệt đối ngay cả khi máy chủ đông người chơi và nhiều entity.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 16 Cores / 32 Threads kiến trúc Zen 4</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> 80MB L3 Cache cực lớn</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-pink-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Tier-III Datacenter Enterprise Server Rack"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-pink-600/90 text-white text-[11px] font-black uppercase">
                    Datacenter Tier III
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Hạ Tầng Trung Tâm Dữ Liệu Chuẩn Quốc Tế</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Cụm máy chủ đặt tại Viettel IDC & VNPT Data Center với chứng chỉ ISO 27001 và ANSI/TIA-942 Rated 3, cam kết nguồn điện kép 2N và hệ thống làm mát chính xác duy trì nhiệt độ 20°C.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Cam kết Uptime 99.99% bằng SLA</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Nguồn máy phát điện dự phòng 72 giờ</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-blue-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
                    alt="Network Switch & Fiber Optical"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-blue-600/90 text-white text-[11px] font-black uppercase">
                    Anti-DDoS 500Gbps
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Lọc Tấn Công DDoS Tức Thì</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Thuật toán Game Shield phân tích sâu từng gói tin TCP/UDP của game, phát hiện và hấp thụ toàn bộ đợt tấn công từ chối dịch vụ mà không tăng ping hay kick người chơi.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Phân tích giao thức Game Packet L7</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Miễn phí 100% kèm theo tất cả các gói</li>
              </ul>
            </div>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, title: 'Triển Khai Tức Thì 60s', desc: 'Hệ thống tự động cài đặt hệ điều hành và game daemon chỉ sau 1 phút.' },
              { icon: Terminal, title: 'Web Terminal & SFTP', desc: 'Toàn quyền truy cập root, console dòng lệnh và chỉnh sửa file trực quan.' },
              { icon: RefreshCw, title: 'Tự Động Sao Lưu Hàng Ngày', desc: 'Bảo vệ map, inventory và database người chơi khỏi mọi rủi ro.' },
              { icon: Flame, title: 'Hỗ Trợ Modpack 1-Click', desc: 'Cài đặt hàng ngàn bản mod Paper, Spigot, Forge, Fabric, Oxide chỉ 1 chạm.' },
            ].map((feat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{feat.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PERFORMANCE BENCHMARK COMPARISON TABLE */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-white mb-3">
            Bảng So Sánh Hiệu Năng Vượt Trội
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Xem sự khác biệt giữa Game Server chuyên dụng tại CloudHost so với VPS thông thường.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/80 shadow-2xl">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-950 text-slate-300 font-bold border-b border-slate-800">
              <tr>
                <th className="py-4 px-6">Thông số & Tính năng</th>
                <th className="py-4 px-6 text-purple-400 font-black">CloudHost Game Server</th>
                <th className="py-4 px-6 text-slate-400">VPS Đám Mây Thông Thường</th>
                <th className="py-4 px-6 text-slate-400">Tự Host Tại Nhà (Home Server)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-bold text-white">Vi Xử Lý (CPU)</td>
                <td className="py-4 px-6 text-purple-300 font-bold">AMD Ryzen 9 7950X (5.7GHz)</td>
                <td className="py-4 px-6 text-slate-400">Intel Xeon E5 cũ (2.2 - 2.6GHz)</td>
                <td className="py-4 px-6 text-slate-400">CPU PC cá nhân (Chia sẻ)</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-bold text-white">Bộ Nhớ RAM</td>
                <td className="py-4 px-6 text-purple-300 font-bold">DDR5 ECC 5600MHz Chuyên Dụng</td>
                <td className="py-4 px-6 text-slate-400">DDR3/DDR4 Shared Memory</td>
                <td className="py-4 px-6 text-slate-400">Non-ECC RAM (Dễ dump crash)</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-bold text-white">Chống Tấn Công DDoS</td>
                <td className="py-4 px-6 text-emerald-400 font-bold">Game Shield L7 500Gbps (Miễn Phí)</td>
                <td className="py-4 px-6 text-slate-400">Cơ bản L3/L4 (Bị null route khi bị đánh)</td>
                <td className="py-4 px-6 text-rose-400">Không có (Nguy cơ lộ IP gia đình)</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-bold text-white">Độ Trễ Ping Nội Địa</td>
                <td className="py-4 px-6 text-emerald-400 font-bold">&lt; 5ms (Cáp quang băng thông 1Gbps)</td>
                <td className="py-4 px-6 text-slate-400">20ms - 60ms (Port chia sẻ)</td>
                <td className="py-4 px-6 text-slate-400">Biến động (Phụ thuộc mạng nhà)</td>
              </tr>
              <tr className="hover:bg-slate-800/40 transition-colors">
                <td className="py-4 px-6 font-bold text-white">Bảo Vệ Sao Lưu (Backup)</td>
                <td className="py-4 px-6 text-purple-300 font-bold">Tự động hàng ngày sang cụm S3 riêng</td>
                <td className="py-4 px-6 text-slate-400">Tính phí snapshot phụ</td>
                <td className="py-4 px-6 text-slate-400">Phải tự copy thủ công</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. FAQ ACCORDION */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">Câu Hỏi Thường Gặp (FAQ)</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Giải đáp chi tiết thắc mắc trước khi bạn bắt đầu</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-purple-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-purple-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION BANNER */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 sm:p-12 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Sẵn Sàng Mở Máy Chủ Game Cho Cộng Đồng Của Bạn?
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-8 leading-relaxed">
              Khởi tạo ngay chỉ với 149.000đ/tháng. Bàn giao máy chủ trong 60 giây, hoàn tiền 100% trong 7 ngày nếu không hài lòng.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-purple-500/25 transition-all hover:scale-105"
              >
                Xem Bảng Giá & Đặt Mua
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Tư Vấn Miễn Phí 24/7
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
