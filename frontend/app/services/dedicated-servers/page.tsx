'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Server, Cpu, Shield, Zap, CheckCircle2, ArrowRight, 
  HardDrive, Activity, RefreshCw, ShoppingCart, Lock,
  Layers, Key, ChevronDown, ChevronUp, Award, BarChart3, Globe,
  ShieldAlert, Settings, Terminal, Radio, Power, Sliders, Check
} from 'lucide-react';
import { SiDell, SiIntel, SiAmd, SiUbuntu, SiDebian, SiProxmox, SiVmware } from 'react-icons/si';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function DedicatedServersPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // IPMI Simulator State
  const [serverPower, setServerPower] = useState<'on' | 'off' | 'rebooting'>('on');
  const [activeIso, setActiveIso] = useState<string>('Ubuntu 24.04 LTS');

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

  const handlePowerAction = (action: 'reboot' | 'toggle') => {
    if (action === 'reboot') {
      setServerPower('rebooting');
      setTimeout(() => setServerPower('on'), 2500);
    } else {
      setServerPower((prev) => (prev === 'on' ? 'off' : 'on'));
    }
  };

  const defaultPlans = [
    {
      id: 'd9a48911-3755-46ae-a2e6-7649d363296c',
      name: 'Dell R630 Dual Xeon',
      model: 'Dell PowerEdge R630',
      workload: 'Hệ thống ERP nội bộ, Kế toán Doanh nghiệp & Ảo hóa nhẹ (5-15 VM)',
      monthlyPrice: 1990000,
      yearlyPrice: 1592000 * 12,
      cpu: '2x Intel Xeon E5-2670v3',
      cores: '24 Cores / 48 Threads (2.3GHz - 3.1GHz)',
      ram: '64 GB DDR4 ECC Registered',
      storage: '2x 480 GB SSD Enterprise (Hardware RAID 1)',
      network: '1 Gbps Dedicated Port (100 Mbps Quốc tế)',
      ip: '1 Clean IPv4 Tĩnh + /64 IPv6',
      ipmi: 'iDRAC 8 Enterprise Dedicated Port',
      setupTime: 'Bàn giao 2 Giờ',
      metrics: { powerUsage: '220W', chassisTemp: '22°C', psuRedundant: '2x 750W Titanium' },
      features: [
        'Toàn quyền 100% Bare-metal không chia sẻ phần cứng',
        'Băng thông trong nước không giới hạn kết nối Core Switch 10Gbps',
        'iDRAC 8 Enterprise HTML5 Virtual KVM & Virtual Media',
        'Miễn phí cài đặt Ubuntu, Debian, Windows Server, Proxmox VE',
        'Cam kết thay thế linh kiện hỏng hóc trong 30 phút'
      ],
      popular: false,
    },
    {
      id: '71607590-b198-4ae0-a29a-fbbe8efb04cb',
      name: 'Dell R740 Dual Xeon v4',
      model: 'Dell PowerEdge R740 2U',
      workload: 'Cụm Ảo hóa Proxmox/VMware (30-60 VPS), Sàn TMĐT & Cơ sở dữ liệu lớn',
      monthlyPrice: 2990000,
      yearlyPrice: 2392000 * 12,
      cpu: '2x Intel Xeon E5-2680v4',
      cores: '28 Cores / 56 Threads (2.4GHz - 3.3GHz)',
      ram: '128 GB DDR4 ECC Registered',
      storage: '2x 960 GB NVMe Gen4 Enterprise (Hardware RAID 1)',
      network: '1 Gbps Dedicated Port (200 Mbps Quốc tế)',
      ip: '2 Clean IPv4 Tĩnh + Hỗ trợ cấp Subnet /29',
      ipmi: 'iDRAC 9 Enterprise HTML5 Remote KVM',
      setupTime: 'Bàn giao 1 - 2 Giờ',
      metrics: { powerUsage: '340W', chassisTemp: '24°C', psuRedundant: '2x 1100W Platinum' },
      features: [
        'Hiệu năng 56 Threads cực mạnh cho cụm Ảo hóa Proxmox / ESXi',
        'Tốc độ đọc ghi NVMe 7,000MB/s IOPS 800,000 chuyên dụng',
        'Bảo vệ chống DDoS L3/L4/L7 500Gbps phần cứng trực tiếp',
        'Đặt tại Datacenter Viettel IDC / VNPT Tier-III chuẩn quốc tế',
        'Cam kết chất lượng dịch vụ SLA 99.99% bằng hợp đồng pháp lý',
        'Kỹ sư SEN CloudHost hỗ trợ dựng cụm Cluster KVM miễn phí'
      ],
      popular: true,
    },
    {
      id: 'fa49fecf-4cf6-4ffc-a3b0-4f513ba6f595',
      name: 'Dell R6515 AMD EPYC',
      model: 'Dell PowerEdge R6515 Zen 2',
      workload: 'AI Inference, Big Data Analytics, Sàn Chứng khoán & Cụm Kubernetes',
      monthlyPrice: 4990000,
      yearlyPrice: 3992000 * 12,
      cpu: 'AMD EPYC 7502 (128MB Cache L3)',
      cores: '32 Cores / 64 Threads (2.5GHz - 3.35GHz)',
      ram: '256 GB DDR4 ECC Registered 3200MHz',
      storage: '2x 1.92 TB NVMe Gen4 Enterprise U.2 (Hardware RAID 1)',
      network: '10 Gbps Uplink Port (500 Mbps Quốc tế)',
      ip: '5 Clean IPv4 Tĩnh (/29 Subnet Riêng)',
      ipmi: 'iDRAC 9 Enterprise Dedicated Out-of-band',
      setupTime: 'Bàn giao trong ngày',
      metrics: { powerUsage: '380W', chassisTemp: '25°C', psuRedundant: '2x 1400W Titanium' },
      features: [
        'Kiến trúc AMD EPYC Zen 2 đỉnh cao 64 Luồng xử lý dữ liệu lớn',
        'Dung lượng RAM 256GB ECC đáp ứng hàng chục triệu request đồng thời',
        'Cổng Uplink quang 10Gbps kết nối trực tiếp Core Switch Datacenter',
        'Tặng kèm bản quyền WAF Shield Enterprise & Giám sát SOC 24/7',
        'Hạ tầng nguồn điện kép 2N độc lập với 3 máy phát dự phòng Kohler',
        'Đội ngũ kỹ sư Level 3 hỗ trợ kỹ thuật 1-1 riêng biệt 24/7'
      ],
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
      a: 'Đối với các cấu hình tiêu chuẩn có sẵn tại Datacenter (Viettel IDC Pháp Vân / VNPT Nam Thăng Long), máy chủ sẽ được cài đặt hệ điều hành theo yêu cầu (Ubuntu, Debian, AlmaLinux, Windows Server, Proxmox VE, VMware ESXi) và bàn giao thông tin đăng nhập IPMI / SSH trong vòng 1 đến 2 giờ làm việc.'
    },
    {
      q: 'Tôi có toàn quyền điều khiển phần cứng qua IPMI/iDRAC không?',
      a: 'Hoàn toàn có. Khách hàng được cấp tài khoản iDRAC 9 Enterprise riêng biệt kết nối qua mạng Out-of-Band an toàn, cho phép bạn bật/tắt nguồn máy chủ, hard reboot, gắn file ISO cài lại OS từ xa và theo dõi cảm biến nhiệt độ phần cứng 24/7 mà không cần qua nhân viên kỹ thuật.'
    },
    {
      q: 'Chính sách thay thế linh kiện phần cứng hỏng hóc (SLA) như thế nào?',
      a: 'Chúng tôi cam kết thay thế linh kiện phần cứng hỏng hóc (RAM, Ổ cứng NVMe/SSD, Nguồn Redundant, Quạt tản nhiệt) trong vòng tối đa 30 phút. Kho linh kiện dự phòng 1:1 luôn sẵn sàng tại chỗ trong phòng máy Datacenter.'
    },
    {
      q: 'Tôi có thể thuê thêm dải địa chỉ IP tĩnh (Subnet /29, /28, /27) không?',
      a: 'Có. Chúng tôi hỗ trợ cấp phát dải IP tĩnh Clean IPv4 với định tuyến trực tiếp vào cổng mạng Dedicated của bạn, phục vụ nhu cầu tạo nhiều VPS ảo hóa hoặc chạy đa dịch vụ với chi phí chỉ từ 50.000đ/IP/tháng.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-purple-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: BARE-METAL TELEMETRY CONSOLE */}
      <section className="relative pt-16 pb-20 border-b border-slate-800/80 overflow-hidden">
        {/* Technical Grid Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #a855f7 1px, transparent 1px), linear-gradient(to bottom, #a855f7 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-purple-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Engineering Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-purple-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                HARDWARE STATUS: 100% BARE-METAL ISOLATED
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline">
                DATACENTER: <strong className="text-white font-mono">Tier-III Viettel IDC &amp; VNPT</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>UPTIME: <strong className="text-white font-mono">99.99%</strong></span>
              <span>NETWORK: <strong className="text-purple-400 font-mono">10Gbps Core Uplink</strong></span>
              <span>DDOS: <strong className="text-emerald-400 font-mono">500Gbps Hardware</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 text-xs font-mono">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                DELL POWEREDGE &amp; AMD EPYC ENTERPRISE BARE-METAL
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Toàn Quyền Phần Cứng Với{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-amber-300 font-mono">
                  Dedicated Servers
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Không chia sẻ CPU, không hao hụt tài nguyên ảo hóa. Trang bị vi xử lý Dual Intel Xeon / AMD EPYC, 
                ổ cứng NVMe Enterprise Hardware RAID và toàn quyền quản trị Out-of-Band qua iDRAC 9 HTML5.
              </p>

              {/* Vendor Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiDell className="w-4 h-4 text-sky-400" />
                  <span>Dell EMC PowerEdge</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiIntel className="w-4 h-4 text-blue-400" />
                  <span>Intel Xeon Scalable</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiAmd className="w-4 h-4 text-rose-500" />
                  <span>AMD EPYC Zen 2</span>
                </div>
              </div>

              {/* Supported Hypervisors & OS */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 text-xs font-mono space-y-2">
                <div className="text-slate-400 flex items-center justify-between">
                  <span>Supported OS &amp; Hypervisors:</span>
                  <span className="text-purple-400">1-Click ISO Mount</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-slate-300">
                  <span className="flex items-center gap-1.5"><SiProxmox className="w-3.5 h-3.5 text-amber-500" /> Proxmox VE</span>
                  <span className="flex items-center gap-1.5"><SiVmware className="w-3.5 h-3.5 text-slate-400" /> VMware ESXi</span>
                  <span className="flex items-center gap-1.5"><SiUbuntu className="w-3.5 h-3.5 text-orange-500" /> Ubuntu Server</span>
                  <span className="flex items-center gap-1.5"><SiDebian className="w-3.5 h-3.5 text-rose-500" /> Debian</span>
                  <span>Windows Server 2022</span>
                </div>
              </div>

            </div>

            {/* Right iDRAC Remote Console Simulator */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0b1320] border border-slate-800 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">iDRAC 9 Enterprise v5.10</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    serverPower === 'on' 
                      ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60' 
                      : serverPower === 'rebooting' 
                      ? 'bg-amber-950/80 text-amber-400 border-amber-800/60' 
                      : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                  }`}>
                    {serverPower === 'on' ? 'POWER ON' : serverPower === 'rebooting' ? 'REBOOTING...' : 'POWER OFF'}
                  </span>
                </div>

                {/* Live Telemetry Sensors */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-[#0e1627] border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Chassis Temp</div>
                    <div className="text-sm font-extrabold text-emerald-400 mt-0.5">23.5 °C</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0e1627] border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Fan Speed</div>
                    <div className="text-sm font-extrabold text-sky-400 mt-0.5">4,800 RPM</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0e1627] border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase">Power Draw</div>
                    <div className="text-sm font-extrabold text-purple-400 mt-0.5">340 W</div>
                  </div>
                </div>

                {/* Interactive IPMI Actions */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="text-slate-500">// Out-of-Band Hardware Controls</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePowerAction('reboot')}
                      disabled={serverPower === 'rebooting'}
                      className="flex-1 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-white font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${serverPower === 'rebooting' ? 'animate-spin' : ''}`} />
                      Hard Reboot
                    </button>
                    <button
                      onClick={() => handlePowerAction('toggle')}
                      className="flex-1 py-2.5 rounded-xl bg-[#0f172a] hover:bg-slate-800 border border-slate-700 text-white font-bold transition-all flex items-center justify-center gap-1.5"
                    >
                      <Power className="w-3.5 h-3.5 text-rose-400" />
                      {serverPower === 'on' ? 'Power Down' : 'Power Up'}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#spec-matrix"
                    className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20"
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

      {/* 2. THREE CORE HARDWARE ARCHITECTURE SCHEMATICS */}
      <section className="py-24 bg-[#070b12] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950 text-purple-400 text-xs font-mono mb-3 border border-purple-800">
              <Layers className="w-3.5 h-3.5" />
              ENTERPRISE BARE-METAL INFRASTRUCTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              3 Trụ Cột Phần Cứng Chuẩn DataCenter Tier-III
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Được lắp ráp và kiểm tra tải 72 giờ liên tục bằng linh kiện chính hãng trước khi bàn giao tới khách hàng.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Schematic 1: Hardware RAID & NVMe Engine */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>HARDWARE RAID-10 STORAGE</span>
                    <span className="text-emerald-400">800k IOPS</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>PERC H730P Controller</span>
                      <span className="text-sky-400">2GB NV Cache</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Drive 01 + Drive 02</span>
                      <span className="text-emerald-400 font-bold">Mirror RAID 1</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Sequential Read/Write</span>
                      <span className="text-purple-400 font-bold">7,200 MB/s</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Hardware RAID &amp; NVMe Gen4</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Card điều khiển RAID phần cứng Dell PERC chuyên dụng có pin dự phòng bảo vệ bộ nhớ đệm Cache. 
                  Đảm bảo tốc độ đọc ghi dữ liệu tức thì và tự động tái tạo dữ liệu khi thay thế ổ cứng mới.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Hot-Swap Drive:</span>
                <strong className="text-emerald-400">Thay thế không cần tắt máy</strong>
              </div>
            </div>

            {/* Schematic 2: Out-of-Band Remote KVM */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ISOLATED IPMI NETWORK</span>
                    <span className="text-sky-400">OUT-OF-BAND</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Dedicated Management NIC</span>
                      <span className="text-emerald-400">100Mbps Isolated</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Virtual Media ISO</span>
                      <span className="text-sky-400">Mount from Local PC</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>BIOS / UEFI Console</span>
                      <span className="text-purple-400 font-bold">HTML5 No-Java</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Quản Trị iDRAC 9 HTML5 Toàn Quyền</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cung cấp đường truyền mạng riêng biệt cho phép truy cập console phần cứng ở mức BIOS/UEFI. 
                  Cài đặt lại hệ điều hành qua file ISO tùy chỉnh và khôi phục sự cố từ xa mà không cần nhờ hỗ trợ trực tiếp.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Remote Access:</span>
                <strong className="text-sky-400">Toàn quyền Root / IPMI 24/7</strong>
              </div>
            </div>

            {/* Schematic 3: Tier-III 2N Redundancy */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>2N POWER &amp; NETWORK BACKBONE</span>
                    <span className="text-amber-400">SLA 99.99%</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Dual PSU Feed A + B</span>
                      <span className="text-emerald-400 font-bold">2N Independent</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Diesel Generators</span>
                      <span className="text-amber-400">Kohler 3x 2500kVA</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Cooling System</span>
                      <span className="text-sky-400">N+1 CRAC 22°C</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Hạ Tầng Datacenter Tier-III Chuẩn Quốc Tế</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Đặt tại Datacenter Viettel IDC và VNPT đạt chứng nhận TIA-942 Rated 3. Nguồn điện kép 2N độc lập 
                  kèm máy phát điện dự phòng chạy liên tục 72 giờ và hệ thống làm mát chính xác duy trì nhiệt độ 22°C.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Power Redundancy:</span>
                <strong className="text-amber-400">2N Nguồn Kép Riêng Biệt</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. TECHNICAL SPECIFICATION MATRIX & PRICING */}
      <section id="spec-matrix" className="py-24 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950 text-purple-400 text-xs font-mono mb-3 border border-purple-800">
                <Sliders className="w-3.5 h-3.5" />
                HARDWARE SPEC SHEET
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Bảng So Sánh Cấu Hình Phần Cứng Dedicated Server
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-normal">
                Cam kết 100% linh kiện chính hãng Dell / Intel / AMD với hợp đồng SLA rõ ràng.
              </p>
            </div>

            {/* Billing Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#0c1322] border border-slate-800 font-mono text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Thanh toán Tháng
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-purple-600 text-white shadow'
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
          <div className="rounded-2xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080d17] text-slate-400">
                    <th className="p-5 font-bold uppercase text-[11px] w-1/4">Thông Số Kỹ Thuật</th>
                    {plans.map((p) => {
                      const displayPrice = billingCycle === 'yearly' ? Math.round(p.yearlyPrice / 12) : p.monthlyPrice;
                      return (
                        <th key={p.id} className="p-5 text-white border-l border-slate-800/80 w-1/4">
                          <div className="text-sm font-extrabold text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-sans font-normal">{p.model}</div>
                          <div className="text-lg font-black text-purple-400 mt-2">
                            {displayPrice.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ/tháng</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Vi Xử Lý (Processor)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-white font-bold">{p.cpu}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Số Nhân / Luồng Xử Lý</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-purple-400 font-bold">{p.cores}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Bộ Nhớ RAM ECC</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-white font-bold">{p.ram}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Ổ Cứng Lưu Trữ Enterprise</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">{p.storage}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Băng Thông &amp; Cổng Mạng</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-sky-400 font-bold">{p.network}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Địa Chỉ IP Tĩnh Riêng</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-slate-200">{p.ip}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Quản Trị Remote KVM</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-purple-300">{p.ipmi}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Thời Gian Bàn Giao Server</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">{p.setupTime}</td>
                    ))}
                  </tr>
                  <tr className="bg-[#080d17]">
                    <td className="p-5 font-bold text-slate-400">Hành Động Khởi Tạo</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-5 border-l border-slate-800/60">
                        <button
                          onClick={() => handleOrder(p)}
                          className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            p.popular
                              ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <span>Khởi Tạo Server Ngay</span>
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
      <section className="py-20 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Câu Hỏi Thường Gặp Về Máy Chủ Vật Lý</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST DEDICATED SERVERS FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0c1322] rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:text-purple-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-purple-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 font-normal">
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
        <div className="rounded-3xl bg-gradient-to-r from-[#180e2b] via-[#0f091f] to-[#180e2b] p-8 sm:p-12 border border-purple-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-950 border border-purple-800 text-purple-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              PROVISIONING WITHIN 2 HOURS
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Cần Cấu Hình Phần Cứng Tùy Biến Theo Nhu Cầu?
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Đội ngũ kỹ sư SEN CloudHost hỗ trợ lắp ráp phần cứng tùy chọn (Dual Xeon Platinum, AMD EPYC 9004 Series, GPU NVIDIA A100, 10Gbps Uplink) theo yêu cầu riêng của doanh nghiệp.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('spec-matrix');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs font-mono shadow-xl shadow-purple-600/25 transition-all hover:scale-105"
              >
                Khởi Tạo Server Ngay
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono border border-slate-700 transition-all"
              >
                Yêu Cầu Báo Giá Tùy Biến
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
