'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Gamepad2, Server, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Terminal, Clock, ShoppingCart, Activity,
  Sliders, Award, RefreshCw, Layers, ShieldCheck, ChevronDown,
  ChevronUp, Sparkles, Play, Globe, Flame, Radio, BarChart3, Wifi
} from 'lucide-react';
import { SiCounterstrike, SiRust, SiAmd } from 'react-icons/si';
import { BiCube } from 'react-icons/bi';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function GameServersServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedGame, setSelectedGame] = useState<'minecraft' | 'cs2' | 'rust'>('minecraft');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Live Telemetry simulation
  const [tps, setTps] = useState<number>(20.0);
  const [ping, setPing] = useState<number>(6.5);
  const [packetDrops, setPacketDrops] = useState<number>(0);

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

  const [defaultPlans, setDefaultPlans] = useState([

    {
      id: '5ac0ac63-8ad6-44f5-8981-95334603b4fd',
      name: 'Game Starter (5-15 Slots)',
      tier: 'Community & Group Play',
      workload: 'Chơi cùng nhóm bạn, sinh tồn Vanilla, Server nhỏ & Mini-Games',
      monthlyPrice: 149000,
      yearlyPrice: 119000 * 12,
      cpu: '2 vCPU AMD Ryzen 9 7950X (5.7GHz)',
      ram: '4 GB DDR5 ECC 5600MHz',
      storage: '30 GB NVMe Gen4 (7,000MB/s)',
      ddos: '500 Gbps Game Anti-DDoS',
      slots: '15 Người chơi đồng thời',
      tickrate: '20.0 TPS / 64-Tick',
      backup: 'Tự động sao lưu 3 ngày',
      metrics: { tpsAverage: '20.0 TPS', memoryLatency: '0.2 ms', pingLocal: '6 ms' },
      features: [
        'Hỗ trợ cài đặt 1-Click: PaperMC, Purpur, Fabric, Forge, CS2, Rust',
        'Bảo vệ chống tấn công DDoS L3/L4/L7 chuyên biệt cho Game UDP',
        'Web Console quản lý Server, file manager & live console log',
        'Cấp phát IP tĩnh riêng kèm Port tiêu chuẩn trong 60 giây',
        'Tự động khởi động lại (Auto-Restart) khi xảy ra crash server'
      ],
      popular: false,
    },
    {
      id: '81dbbc5f-a316-4355-83c9-f131a48c6680',
      name: 'Game Standard (20-50 Slots)',
      tier: 'Semi-Pro & Competitive',
      workload: 'Server cộng đồng vừa, Giải đấu CS2 128-Tick, Server Minecraft Modpack nặng',
      monthlyPrice: 299000,
      yearlyPrice: 239000 * 12,
      cpu: '4 vCPU AMD Ryzen 9 7950X (5.7GHz)',
      ram: '8 GB DDR5 ECC 5600MHz',
      storage: '60 GB NVMe Gen4 (7,000MB/s)',
      ddos: '500 Gbps Game Anti-DDoS',
      slots: '50 Người chơi đồng thời',
      tickrate: '20.0 TPS / 128-Tick CS2',
      backup: 'Tự động sao lưu 7 ngày',
      metrics: { tpsAverage: '20.0 TPS', memoryLatency: '0.15 ms', pingLocal: '4 ms' },
      features: [
        'Hiệu năng 4 Cores Ryzen 9 đơn nhân khủng 5.7GHz không nghẽn cổ chai',
        'Hỗ trợ modpack nặng (>150 mods) & cụm plugin EssentialsX, Dynmap',
        'CS2 Dedicated Server cấu hình chuẩn 128-Tick Matchmaking & Practice',
        'Phân bổ tài nguyên RAM DDR5 riêng biệt không chia sẻ (No Overcommit)',
        'Hỗ trợ cài đặt Domain Server riêng (play.yourdomain.com) miễn phí',
        'Kỹ sư SEN CloudHost hỗ trợ tối ưu cấu hình server.properties 24/7'
      ],
      popular: true,
    },
    {
      id: 'c88126b4-cb30-4e3b-9ab5-73bf1f62c0eb',
      name: 'Game Pro Cluster (100+ Slots)',
      tier: 'Large Network & Enterprise',
      workload: 'Cụm Minecraft Network BungeeCord/Velocity, Server Rust 200 slots',
      monthlyPrice: 599000,
      yearlyPrice: 479000 * 12,
      cpu: '8 vCPU AMD Ryzen 9 7950X (5.7GHz)',
      ram: '16 GB DDR5 ECC 5600MHz',
      storage: '120 GB NVMe Gen4 Enterprise',
      ddos: '500 Gbps Game Anti-DDoS Dedicated',
      slots: '150+ Người chơi không giới hạn',
      tickrate: '20.0 TPS / 128-Tick',
      backup: 'Tự động sao lưu 14 ngày',
      metrics: { tpsAverage: '20.0 TPS', memoryLatency: '0.1 ms', pingLocal: '2 ms' },
      features: [
        'Khả năng gánh tải cụm BungeeCord / Velocity kết nối 5-10 sub-servers',
        'Băng thông mạng 10Gbps Core Switch chịu tải hàng nghìn kết nối UDP',
        'Tường lửa AI lọc botnet spam kết nối và exploit packets',
        'Tùy chỉnh JVM Flags (Aikar Flags) tối ưu hóa Garbage Collection',
        'Hỗ trợ chuyển đổi toàn bộ thế giới và dữ liệu game cũ sang miễn phí',
        'Kỹ sư Game Server Level 3 hỗ trợ kỹ thuật 1-1 riêng biệt 24/7'
      ],
      popular: false,
    },
  ]);

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      monthlyPrice: matchingDb?.monthlyPrice || dp.monthlyPrice,
      yearlyPrice: matchingDb?.yearlyPrice || dp.yearlyPrice,
    };
  });


  useEffect(() => {
    import('@/src/lib/api').then(({ api }) => {
      api.get('/categories/game-server/plans').then(res => {
        const dbPlans = res.data?.plans || [];
        if (dbPlans.length > 0) {
          setDefaultPlans(prev => prev.map((p, index) => {
            const dbP = dbPlans[index] || dbPlans[dbPlans.length - 1];
            return {
              ...p,
              id: dbP.id || p.id,
              monthlyPrice: dbP.monthlyPrice || Math.round((dbP.yearlyPrice || 0) / 12),
              yearlyPrice: dbP.yearlyPrice || ((dbP.monthlyPrice || 0) * 12),
              price: dbP.monthlyPrice || Math.round((dbP.yearlyPrice || 0) / 12)
            };
          }));
        }
      });
    });
  }, []);

  const handleOrder = async (plan: typeof plans[0]) => {
    const cycleMonths = billingCycle === 'yearly' ? 12 : 1;
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    await addItem(plan.id, cycleMonths, false, {
      name: `${plan.name} (${selectedGame.toUpperCase()}) - ${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'}`,
      price: price,
      billingCycle: cycleMonths,
      type: 'vps',
      details: `${plan.cpu} • ${plan.ram} • ${plan.storage}`
    });
    router.push('/cart');
  };

  const gamesMeta = {
    minecraft: {
      name: 'Minecraft Java & Bedrock',
      version: 'PaperMC, Purpur, Fabric, Forge (1.20+)',
      Icon: BiCube,
      color: '#5C8D37',
      port: 25565,
      specHighlight: 'Tối ưu Aikar JVM Flags, TPS 20.0 liên tục'
    },
    cs2: {
      name: 'Counter-Strike 2 (CS2)',
      version: 'Valve Dedicated Server (128-Tick)',
      Icon: SiCounterstrike,
      color: '#DE9B35',
      port: 27015,
      specHighlight: 'Hỗ trợ MatchZy, Prac Mode, FastDL HTTP'
    },
    rust: {
      name: 'Rust Dedicated Server',
      version: 'Oxide / uMod Framework Support',
      Icon: SiRust,
      color: '#DEA584',
      port: 28015,
      specHighlight: 'Rust+ App Integration, Procedural Maps 4k'
    }
  };

  const currentGame = gamesMeta[selectedGame];

  const faqs = [
    {
      q: 'Tại sao máy chủ Game SEN CloudHost dùng vi xử lý AMD Ryzen 9 7950X?',
      a: 'Hầu hết các game engine như Minecraft và CS2 hoạt động chủ yếu dựa vào hiệu năng đơn nhân (Single-Thread Performance). Vi xử lý AMD Ryzen 9 7950X với xung nhịp đơn nhân lên đến 5.7GHz và kiến trúc Zen 4 bộ nhớ đệm L3 64MB đem lại chỉ số TPS 20.0 mượt mà tuyệt đối mà các dòng chip Xeon xung thấp không thể đạt được.'
    },
    {
      q: 'Hệ thống bảo vệ Anti-DDoS Game 500Gbps xử lý các đợt tấn công như thế nào?',
      a: 'Hạ tầng mạng SEN CloudHost tích hợp phần cứng lọc gói tin chuyên dụng Corero SmartWall. Hệ thống nhận diện sâu giao thức UDP của từng tựa game, phân tích và loại bỏ các gói tin rác (SYN flood, UDP reflection, Bot join attack) trong thời gian dưới 1 giây mà không làm tăng ping hay gián đoạn trải nghiệm của người chơi thật.'
    },
    {
      q: 'Tôi có thể cài đặt Modpack, Plugin và tùy chỉnh file server.properties không?',
      a: 'Hoàn toàn được! Bạn được cung cấp bảng điều khiển Web Console với đầy đủ tính năng: Quản lý File trực quan, Sửa file cấu hình, Kéo thả cài đặt Mod/Plugin (.jar, .zip), Quản trị lệnh Console theo thời gian thực và Truy cập SFTP tốc độ cao.'
    },
    {
      q: 'Tôi có thể gắn tên miền riêng dạng play.tenmien.com vào máy chủ không?',
      a: 'Có. Chúng tôi hỗ trợ cấu hình bản ghi SRV và A record miễn phí để bạn có thể cung cấp địa chỉ IP dễ nhớ cho cộng đồng người chơi mà không cần phải nhớ số Port phức tạp.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-amber-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: GAME TELEMETRY & TICK RATE CONSOLE */}
      <section className="relative pt-16 pb-20 border-b border-slate-200/80 overflow-hidden">
        {/* Technical Grid Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #f59e0b 1px, transparent 1px), linear-gradient(to bottom, #f59e0b 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-amber-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                GAME TICK RATE: 20.0 TPS (100% STABLE)
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-700 hidden sm:inline">
                CPU: <strong className="text-amber-400 font-mono">AMD Ryzen 9 7950X (5.7GHz)</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <span>PING VN: <strong className="text-emerald-400 font-mono">&lt; 8ms</strong></span>
              <span>PORT: <strong className="text-slate-900 font-mono">10Gbps Fiber</strong></span>
              <span>DDOS: <strong className="text-sky-400 font-mono">500Gbps Game Filter</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-mono">
                <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                HIGH-TICKRATE DEDICATED GAME SERVERS
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Máy Chủ Game Đỉnh Cao Với{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 font-mono">
                  Ryzen 9 5.7GHz
                </span>
              </h1>

              <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Không lag giật, không nghẽn TPS. Sức mạnh đơn nhân tối thượng từ AMD Zen 4, RAM DDR5 5600MHz 
                và tường lửa phần cứng Anti-DDoS 500Gbps tự động lọc gói tin rác UDP.
              </p>

              {/* Game Selector Chips */}
              <div className="pt-2">
                <div className="text-xs font-mono uppercase text-slate-600 tracking-wider mb-3">
                  Chọn Tựa Game Khởi Tạo:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['minecraft', 'cs2', 'rust'] as const).map((gKey) => {
                    const g = gamesMeta[gKey];
                    const active = selectedGame === gKey;
                    return (
                      <button
                        key={gKey}
                        onClick={() => setSelectedGame(gKey)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                          active
                            ? 'bg-[#131d31] border-amber-500 shadow-lg shadow-amber-500/10'
                            : 'bg-[#0e1626] border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ 
                            backgroundColor: active ? '#0b1322' : '#0a0f1a',
                            borderColor: active ? g.color : '#1e293b' 
                          }}
                        >
                          <g.Icon className="w-5 h-5" style={{ color: g.color }} />
                        </div>
                        <div>
                          <div className={`text-xs font-bold font-mono ${active ? 'text-slate-900' : 'text-slate-300'}`}>
                            {g.name.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-slate-600 font-mono">
                            Port {g.port}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Engine Spec Details */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Selected Engine: <strong className="text-slate-900">{currentGame.name}</strong></span>
                  <span>Port: <strong className="text-amber-400">{currentGame.port}</strong></span>
                </div>
                <div className="text-slate-600">
                  Profile: <span className="text-slate-700">{currentGame.specHighlight}</span>
                </div>
              </div>

            </div>

            {/* Right Telemetry Monitor */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0b1320] border border-slate-200 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-600 ml-2">game-server-telemetry.sen</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    20.0 TPS STABLE
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="p-3 rounded-xl bg-[#0e1627] border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Tick Rate / TPS</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">20.0 / 20.0</div>
                    <div className="text-[10px] text-slate-500">Tick Duration: 12.4ms</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0e1627] border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Domestic Ping</div>
                    <div className="text-base font-extrabold text-sky-400 mt-0.5">&lt; 6.5 ms</div>
                    <div className="text-[10px] text-slate-500">Viettel / VNPT / FPT</div>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="text-slate-500">// Live DDoS Filtering Telemetry</div>
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">UDP Flood Filter:</span>
                      <span className="text-emerald-400 font-bold">ARMED (0 packet loss)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Garbage Collector:</span>
                      <span className="text-sky-400 font-bold">ZGC (Pause &lt; 0.2ms)</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#spec-matrix"
                    className="w-full py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-600/20"
                  >
                    <span>XEM BẢNG CẤU HÌNH VÀ BÁO GIÁ</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. THREE CORE GAME ARCHITECTURE SCHEMATICS */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950 text-amber-400 text-xs font-mono mb-3 border border-amber-800">
              <Flame className="w-3.5 h-3.5" />
              ULTRA LOW-LATENCY INFRASTRUCTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              3 Công Nghệ Độc Quyền Cho Game Server
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Được thiết kế riêng biệt để giải quyết các bài toán hóc búa nhất của game server: đơn nhân, giật lag mạng và DDoS.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Schematic 1: AMD Ryzen 5.7GHz Single-Core */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ZEN 4 5.7GHZ BOOST</span>
                    <span className="text-amber-400">TPS 20.0</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Single-Thread Cinebench</span>
                      <span className="text-emerald-400 font-bold">2,150 pts</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>L3 Cache Allocation</span>
                      <span className="text-sky-400">64MB Direct</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>DDR5 RAM Bandwidth</span>
                      <span className="text-amber-400 font-bold">5,600 MHz</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Sức Mạnh Đơn Nhân Tối Thượng</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tối ưu cho vòng lặp chính (Main Game Loop) của Minecraft &amp; CS2. 
                  Ngăn chặn triệt để tình trạng sụt giảm TPS khi server có nhiều công trình redstone phức tạp hoặc mob đông đúc.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Processor Engine:</span>
                <strong className="text-amber-400">AMD Ryzen 9 7950X</strong>
              </div>
            </div>

            {/* Schematic 2: 500Gbps Game Anti-DDoS */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>CORERO SMARTWALL FILTER</span>
                    <span className="text-sky-400">500GBPS L3-L7</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>1. Attack Packet Ingress</span>
                      <span className="text-rose-400 font-bold">UDP Amplification</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>2. Hardware Game Filter</span>
                      <span className="text-emerald-400 font-bold">Dropped &lt; 1s</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>3. Clean Player Traffic</span>
                      <span className="text-sky-400 font-bold">0ms Ping Increase</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Tường Lửa Anti-DDoS 500Gbps Phần Cứng</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lọc sạch các đợt tấn công UDP flood, SYN flood, BOT spam kết nối. 
                  Server của bạn luôn hoạt động bình thường, không bao giờ bị rớt mạng hay tăng đột biến độ trễ khi đối thủ tấn công.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Mitigation SLA:</span>
                <strong className="text-sky-400">Tự động kích hoạt &lt; 1 Giây</strong>
              </div>
            </div>

            {/* Schematic 3: 1-Click Game Management Console */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>WEB CONSOLE &amp; MODPACK</span>
                    <span className="text-emerald-400">AUTO-DEPLOY</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>1-Click Installer</span>
                      <span className="text-amber-400">CurseForge / Modrinth</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Live Terminal Console</span>
                      <span className="text-emerald-400">Real-time STDIN/OUT</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Scheduled Backups</span>
                      <span className="text-sky-400">Offsite S3 Storage</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Bảng Quản Trị Web Console Tiện Lợi</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cài đặt modpack, plugin, quản lý file bản đồ và chạy lệnh server trực tiếp trên trình duyệt. 
                  Tự động sao lưu bản đồ hàng ngày lên đám mây S3 độc lập, khôi phục lại chỉ với 1 cú nhấp chuột.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Backup Storage:</span>
                <strong className="text-emerald-400">Tự động hàng ngày (S3 Cloud)</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. REGIONAL PING & LOW-LATENCY NETWORK TELEMETRY */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 text-xs font-mono mb-3 border border-emerald-800">
              <Activity className="w-3.5 h-3.5" />
              REGIONAL PING &amp; PACKET TELEMETRY
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Độ Trễ Cực Thấp Trên Toàn Quốc &amp; Đông Nam Á
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Định tuyến trực tiếp qua các tuyến cáp quang biển và đường trục VNIX nội địa, đảm bảo ping dưới 10ms trên toàn lãnh thổ Việt Nam.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Interactive Regional Latency Grid */}
            <div className="lg:col-span-7 space-y-4 font-mono">
              <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
                <div className="text-xs text-slate-600 uppercase tracking-wider flex items-center justify-between pb-3 border-b border-slate-200">
                  <span>VÙNG KẾT NỐI (POP LOCATION)</span>
                  <span>PING THỜI GIAN THỰC</span>
                </div>

                {[
                  { region: 'Hà Nội & Miền Bắc (Viettel / VNPT / FPT)', ping: '2.1 ms', status: 'CỰC TỐT', color: 'text-emerald-400', bar: 'w-[98%]', bg: 'bg-emerald-500' },
                  { region: 'Đà Nẵng & Miền Trung', ping: '4.8 ms', status: 'CỰC TỐT', color: 'text-emerald-400', bar: 'w-[92%]', bg: 'bg-emerald-500' },
                  { region: 'TP. Hồ Chí Minh & Miền Nam', ping: '6.2 ms', status: 'CỰC TỐT', color: 'text-emerald-400', bar: 'w-[88%]', bg: 'bg-emerald-500' },
                  { region: 'Singapore (SEA Regional Gateway)', ping: '22.4 ms', status: 'TỐT', color: 'text-sky-400', bar: 'w-[70%]', bg: 'bg-sky-500' },
                  { region: 'Bangkok, Thái Lan', ping: '26.8 ms', status: 'TỐT', color: 'text-sky-400', bar: 'w-[65%]', bg: 'bg-sky-500' },
                  { region: 'Hong Kong & Tokyo, Nhật Bản', ping: '38.5 ms', status: 'ỔN ĐỊNH', color: 'text-amber-400', bar: 'w-[52%]', bg: 'bg-amber-500' },
                ].map((item, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        <span className="text-slate-800 font-bold">{item.region}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 ${item.color} font-bold`}>
                          {item.status}
                        </span>
                        <span className={`font-black text-sm ${item.color}`}>{item.ping}</span>
                      </div>
                    </div>
                    {/* Visual Ping Bar */}
                    <div className="w-full h-1.5 rounded-full bg-white overflow-hidden">
                      <div className={`h-full rounded-full ${item.bg} ${item.bar}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Network Quality Metrics Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-8 rounded-3xl bg-white border border-emerald-500/40 shadow-2xl space-y-6 font-mono">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <div className="text-xs text-slate-500 uppercase">TIÊU CHUẨN MẠNG ESPORTS</div>
                    <div className="text-lg font-black text-slate-900 mt-0.5">SEN CLOUD BONE (VNIX 100G)</div>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50" />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">TỶ LỆ RỚT GÓI (PACKET LOSS)</div>
                    <div className="text-xl font-black text-emerald-400 mt-1">0.00 %</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Chuẩn cáp quang Tier-1</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">ĐỘ BIẾN THIÊN (JITTER)</div>
                    <div className="text-xl font-black text-sky-400 mt-1">&lt; 0.2 ms</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Không giật hình / lag</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">BĂNG THÔNG NỘI ĐỊA</div>
                    <div className="text-xl font-black text-amber-400 mt-1">1,000 Mbps</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Không giới hạn Traffic</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-100 border border-slate-200">
                    <div className="text-slate-500 text-[10px]">THỜI GIAN PHẢN ỨNG DDoS</div>
                    <div className="text-xl font-black text-purple-400 mt-1">&lt; 1.0 Giây</div>
                    <div className="text-[10px] text-slate-600 mt-0.5">Tự động kích hoạt lọc</div>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-600 leading-relaxed font-sans font-normal">
                  💡 Máy chủ đặt tại các Data Center lớn ở Hà Nội và TP.HCM với kết nối Peering trực tiếp tới Viettel, VNPT, FPT Telecom, MobiFone và CMC Telecom.
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. TECHNICAL SPECIFICATION MATRIX & PRICING */}
      <section id="spec-matrix" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950 text-amber-400 text-xs font-mono mb-3 border border-amber-800">
                <Sliders className="w-3.5 h-3.5" />
                GAME INFRASTRUCTURE SPEC SHEET
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Bảng So Sánh Cấu Hình Game Server
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 font-normal">
                Phân bổ tài nguyên CPU &amp; RAM DDR5 chuyên dụng 100% không overcommit.
              </p>
            </div>

            {/* Billing Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200 font-mono text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Thanh toán Tháng
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-amber-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Thanh toán Năm</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#080d17] text-slate-600">
                    <th className="p-5 font-bold uppercase text-[11px] w-1/4">Thông Số Kỹ Thuật</th>
                    {plans.map((p) => {
                      const displayPrice = billingCycle === 'yearly' ? Math.round(p.yearlyPrice / 12) : p.monthlyPrice;
                      return (
                        <th key={p.id} className="p-5 text-slate-900 border-l border-slate-200/80 w-1/4">
                          <div className="text-sm font-extrabold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-600 font-sans font-normal">{p.tier}</div>
                          <div className="text-lg font-black text-amber-400 mt-2">
                            {displayPrice.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-600">đ/tháng</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-700">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Vi Xử Lý (CPU Engine)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-900 font-bold">{p.cpu}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Bộ Nhớ RAM DDR5</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-amber-400 font-bold">{p.ram}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Ổ Cứng NVMe Gen4</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-emerald-400 font-bold">{p.storage}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Bảo Vệ Anti-DDoS Phần Cứng</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-sky-400 font-bold">{p.ddos}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Slot Người Chơi Khuyến Nghị</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-900 font-bold">{p.slots}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Tiêu Chuẩn Tick Rate / TPS</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-emerald-400 font-bold">{p.tickrate}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Sao Lưu Bản Đồ Tự Động</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-800">{p.backup}</td>
                    ))}
                  </tr>
                  <tr className="bg-[#080d17]">
                    <td className="p-5 font-bold text-slate-600">Hành Động Khởi Tạo</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-5 border-l border-slate-200/60">
                        <button
                          onClick={() => handleOrder(p)}
                          className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            p.popular
                              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <span>Khởi Tạo Game Server Ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Câu Hỏi Thường Gặp Về Máy Chủ Game</h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST GAME SERVER FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:text-amber-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-amber-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-700 leading-relaxed border-t border-slate-200/60 pt-3 font-normal">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#1f1408] via-[#140c04] to-[#1f1408] p-8 sm:p-12 border border-amber-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-amber-950 border border-amber-800 text-amber-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              DEPLOY IN 60 SECONDS
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Bắt Đầu Trải Nghiệm Máy Chủ Game Đỉnh Cao Ngay Hôm Nay
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Chỉ từ 149.000đ/tháng. Bàn giao bảng điều khiển Web Console trong 60 giây và hỗ trợ chuyển map game từ nơi khác sang miễn phí.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('spec-matrix');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs font-mono shadow-xl shadow-amber-600/25 transition-all hover:scale-105"
              >
                Khởi Tạo Game Server Ngay
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs font-mono border border-slate-300 transition-all"
              >
                Tư Vấn Cụm Game Lớn
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
