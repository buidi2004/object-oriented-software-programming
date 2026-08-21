'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Server, Cpu, Shield, Zap, CheckCircle2, ArrowRight, 
  HardDrive, Activity, RefreshCw, ShoppingCart, Lock,
  Layers, Key, ChevronDown, ChevronUp, Award, BarChart3, Globe,
  ShieldAlert, Settings, Terminal
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function DedicatedServersPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/dedicated-server/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load dedicated server plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: 'd9a48911-3755-46ae-a2e6-7649d363296c',
      name: 'Dedicated Dual Xeon E5-2670',
      tagline: 'Lựa chọn tiết kiệm cho hệ thống ERP, Kế toán & Ảo hóa nhẹ',
      monthlyPrice: 1990000,
      yearlyPrice: 1592000 * 12,
      cpu: '2x Intel Xeon E5-2670 (16 Core / 32 Thread)',
      ram: '64 GB RAM DDR3 ECC',
      storage: '2x 480 GB SSD Enterprise (Hardware RAID 1)',
      network: '1 Gbps Shared / 100 Mbps Cam kết quốc tế',
      ip: '1 IPv4 Tĩnh Riêng + /64 IPv6',
      ipmi: 'IPMI / KVM HTML5 Toàn Quyền Quản Trị Từ Xa',
      features: [
        'Toàn quyền 100% phần cứng (Bare-metal)',
        'Cổng mạng 1Gbps không giới hạn băng thông trong nước',
        'Phần cứng chính hãng Dell PowerEdge / Supermicro',
        'Miễn phí cài đặt Proxmox, VMware ESXi, Ubuntu, Windows Server',
        'Hỗ trợ thay thế linh kiện hỏng hóc trong 30 phút'
      ],
      badge: null,
      popular: false,
    },
    {
      id: '71607590-b198-4ae0-a29a-fbbe8efb04cb',
      name: 'Dedicated Dual Xeon E5-2680v4',
      tagline: 'Cấu hình tiêu chuẩn cho Doanh nghiệp, Sàn TMĐT & Ảo hóa Proxmox',
      monthlyPrice: 2990000,
      yearlyPrice: 2392000 * 12,
      cpu: '2x Intel Xeon E5-2680v4 (28 Core / 56 Thread)',
      ram: '128 GB RAM DDR4 ECC',
      storage: '2x 960 GB NVMe Gen4 Enterprise (RAID 1)',
      network: '1 Gbps Dedicated Port / 200 Mbps Quốc tế',
      ip: '2 IPv4 Tĩnh Riêng + Hỗ trợ /29 Subnet',
      ipmi: 'iDRAC 8 Enterprise / HTML5 Virtual Media',
      features: [
        'Hiệu năng 56 Threads cực mạnh cho cụm 20-40 VPS',
        'Tốc độ đọc ghi NVMe 7,000MB/s IOPS 800,000',
        'Bảo vệ chống DDoS L3/L4/L7 500Gbps phần cứng',
        'Đặt tại Datacenter Viettel IDC / VNPT Tier-III chuẩn quốc tế',
        'Cam kết chất lượng dịch vụ SLA 99.99% bằng hợp đồng',
        'Kỹ sư hỗ trợ cài đặt cụm ảo hóa Proxmox / KVM miễn phí'
      ],
      badge: 'Bán chạy nhất',
      popular: true,
    },
    {
      id: 'fa49fecf-4cf6-4ffc-a3b0-4f513ba6f595',
      name: 'Dedicated AMD EPYC 7502',
      tagline: 'Quái thú hiệu năng cho Big Data, AI Inference & Cụm Kubernetes',
      monthlyPrice: 4990000,
      yearlyPrice: 3992000 * 12,
      cpu: 'AMD EPYC 7502 (32 Core / 64 Thread, 128MB Cache)',
      ram: '256 GB RAM DDR4 ECC Registered',
      storage: '2x 1.92 TB NVMe Gen4 Enterprise RAID',
      network: '10 Gbps Uplink Port / 500 Mbps Quốc tế',
      ip: '5 IPv4 Tĩnh Riêng (/29 Subnet)',
      ipmi: 'IPMI 2.0 / KVM Over IP Dedicated Network',
      features: [
        'Kiến trúc AMD EPYC Zen 2 đỉnh cao 64 Luồng xử lý',
        'Dung lượng RAM khủng 256GB ECC đáp ứng hàng triệu request',
        'Cổng Uplink 10Gbps siêu tốc kết nối trực tiếp Core Switch',
        'Tặng kèm tường lửa phần cứng WAF Shield Enterprise',
        'Hạ tầng nguồn điện kép 2N độc lập với máy phát dự phòng',
        'Đội ngũ kỹ sư VIP hỗ trợ 1-1 riêng biệt 24/7'
      ],
      badge: 'Hiệu năng đỉnh cao',
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
      name: `${plan.name} - ${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'}`,
      price: price,
      billingCycle: cycleMonths,
      type: 'vps',
      details: `${plan.cpu} • ${plan.ram} • ${plan.storage}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'Máy chủ vật lý Dedicated Server được bàn giao trong bao lâu?',
      a: 'Đối với các cấu hình tiêu chuẩn có sẵn tại Datacenter, máy chủ sẽ được cài đặt hệ điều hành (Ubuntu, Debian, AlmaLinux, Windows Server, Proxmox VE, VMware ESXi) và bàn giao thông tin đăng nhập IPMI / SSH trong vòng 2 đến 4 giờ làm việc. Với các cấu hình tùy biến phần cứng theo yêu cầu, thời gian bàn giao tối đa trong vòng 24 giờ.'
    },
    {
      q: 'Tôi có toàn quyền điều khiển phần cứng qua IPMI/KVM không?',
      a: 'Hoàn toàn có! Khách hàng được cung cấp tài khoản IPMI / iDRAC riêng biệt có kết nối mạng Out-of-Band an toàn, cho phép bạn bật/tắt nguồn máy chủ, reboot cứng, gắn file ISO cài lại hệ điều hành và theo dõi cảm biến nhiệt độ phần cứng từ xa 24/7 mà không cần qua nhân viên kỹ thuật.'
    },
    {
      q: 'Chính sách bảo hành và thay thế linh kiện phần cứng như thế nào?',
      a: 'Chúng tôi cam kết thay thế linh kiện phần cứng hỏng hóc (RAM, Ổ cứng SSD/NVMe, Nguồn Redundant, Quạt Fan) trong vòng tối đa 30 phút. Kho linh kiện dự phòng 1:1 luôn sẵn sàng tại chỗ trong Datacenter để đảm bảo máy chủ của bạn không bị gián đoạn.'
    },
    {
      q: 'Tôi có thể thuê thêm dải địa chỉ IP tĩnh (Subnet /29, /28, /27) không?',
      a: 'Có, chúng tôi hỗ trợ cấp phát thêm dải IP tĩnh Clean IPv4 với định tuyến trực tiếp vào máy chủ của bạn, phục vụ nhu cầu tạo nhiều VPS ảo hóa hoặc chạy đa dịch vụ với chi phí chỉ từ 50.000đ/IP/tháng.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-purple-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-inner">
            <Server className="w-4 h-4 text-purple-400 animate-pulse" />
            Máy Chủ Vật Lý Riêng Biệt Enterprise - Dell PowerEdge & AMD EPYC
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Sức Mạnh Phần Cứng Độc Quyền Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300">
              Dedicated Servers
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Toàn quyền sử dụng 100% tài nguyên CPU, RAM ECC và Ổ cứng NVMe Gen4 Enterprise. 
            Đặt tại Datacenter Tier-III Viettel / VNPT, kết nối cổng mạng 10Gbps và bảo vệ Anti-DDoS 500Gbps.
          </p>

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
                      <Server className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] font-bold text-slate-300">
                      Bare-Metal 100%
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
                      <span className="truncate">{plan.cpu}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{plan.ram}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <HardDrive className="w-4 h-4 text-pink-400 shrink-0" />
                      <span className="truncate">{plan.storage}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">{plan.network}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{plan.ipmi}</span>
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
                  <span>Thuê Máy Chủ Vật Lý Ngay</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. REALISTIC HARDWARE & INFRASTRUCTURE BREAKDOWN */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Server className="w-3.5 h-3.5" />
              Phần Cứng Enterprise & Tiêu Chuẩn Trung Tâm Dữ Liệu
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Hạ Tầng Vật Lý Thực Tế Chuẩn Tier-III Quốc Tế
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Toàn bộ hệ thống máy chủ vật lý được lắp đặt trong các tủ Rack chuyên dụng 42U tại Viettel IDC & VNPT, trang bị nguồn điện dự phòng kép N+1 và hệ thống mạng quang tốc độ 100Gbps Backbone.
            </p>
          </div>

          {/* 3 Realistic Datacenter Visual Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-purple-500/50 transition-all">
              <div>
                <div className="h-52 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Dell PowerEdge Server Rack Tier 3"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-purple-600/90 text-white text-[11px] font-black uppercase">
                    Dell PowerEdge R740 / R6515
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Phần Cứng Chuyên Dụng 100% Brand-New</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Sử dụng khung máy chủ chính hãng Dell PowerEdge và Supermicro chuẩn Rack 1U/2U, bộ vi xử lý Intel Xeon Scalable và AMD EPYC cùng RAM DDR4/DDR5 ECC tự sửa lỗi.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Nguồn kép Hot-plug Redundant 750W/1100W</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-purple-400" /> Thay thế linh kiện hỏng trong 30 phút</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-pink-500/50 transition-all">
              <div>
                <div className="h-52 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
                    alt="Core Fiber Switch 10Gbps Uplink"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-pink-600/90 text-white text-[11px] font-black uppercase">
                    10Gbps Network Port
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Băng Thông Cáp Quang Không Giới Hạn</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Kết nối trực tiếp vào mạng lõi Backbone của các nhà mạng Viettel, VNPT, FPT Telecom với dung lượng truyền tải hơn 100Gbps, đảm bảo tốc độ tải file và streaming video mượt mà.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Băng thông trong nước Unlimited 1Gbps</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-pink-400" /> Tuyến cáp quang biển quốc tế APG, AAG, SJC</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-blue-500/50 transition-all">
              <div>
                <div className="h-52 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                    alt="Remote IPMI / KVM Virtual Console"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-blue-600/90 text-white text-[11px] font-black uppercase">
                    IPMI HTML5 Remote
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Quản Trị Phần Cứng Từ Xa Toàn Quyền</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Tài khoản KVM Over IP / IPMI 2.0 riêng biệt cho phép truy cập console BIOS, kiểm tra phần cứng, bật/tắt nguồn và cài lại hệ điều hành từ file ISO riêng của bạn bất cứ lúc nào.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> HTML5 Virtual Console không cần Java</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Virtual Media Mount ISO trực tiếp</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">Câu Hỏi Thường Gặp Về Máy Chủ Vật Lý</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Giải đáp chi tiết trước khi bạn thuê máy chủ riêng</p>
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

      {/* 5. CALL TO ACTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-8 sm:p-12 border border-purple-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Cần Cấu Hình Máy Chủ Vật Lý Tùy Biến Theo Yêu Cầu?
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-8 leading-relaxed">
              Chúng tôi hỗ trợ lắp đặt phần cứng theo yêu cầu (GPU NVIDIA Tesla, RAM lên đến 1TB, Ổ cứng SSD NVMe 15TB). Bàn giao nhanh chóng, hỗ trợ hợp đồng và xuất hóa đơn VAT đầy đủ.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-purple-500/25 transition-all hover:scale-105"
              >
                Xem Bảng Giá & Đặt Thuê
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Liên Hệ Chuyên Viên Tư Vấn
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
