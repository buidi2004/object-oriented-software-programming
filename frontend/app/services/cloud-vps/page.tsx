'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Server, Shield, Zap, Cpu, HardDrive, Clock, Database, Check,
  Sliders, ArrowRight, Activity, Layers, RefreshCw, ShoppingCart,
  ChevronDown, ChevronUp, Copy, Sparkles, Network, Globe, Lock, Terminal,
  Workflow, Gauge, CheckCircle2, ShieldCheck, HelpCircle, FileText
} from 'lucide-react';
import {
  SiUbuntu, SiDebian, SiAlmalinux, SiRockylinux, SiArchlinux,
  SiAlpinelinux, SiDocker, SiKubernetes, SiTerraform,
  SiAnsible, SiPrometheus, SiGrafana, SiNginx, SiPostgresql,
  SiRedis, SiGithub, SiPython, SiNodedotjs
} from 'react-icons/si';
import { FaWindows } from 'react-icons/fa6';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

// VPS Presets Data for 1-Click Fast Loading


// OS Templates with official Simple-Icons
const OS_TEMPLATES = [
  { id: 'ubuntu-24', name: 'Ubuntu 24.04 LTS', category: 'Linux', icon: SiUbuntu, color: 'text-orange-500', version: 'Noble Numbat' },
  { id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS', category: 'Linux', icon: SiUbuntu, color: 'text-orange-400', version: 'Jammy Jellyfish' },
  { id: 'debian-12', name: 'Debian 12', category: 'Linux', icon: SiDebian, color: 'text-rose-500', version: 'Bookworm Enterprise' },
  { id: 'almalinux-9', name: 'AlmaLinux 9', category: 'Enterprise', icon: SiAlmalinux, color: 'text-blue-400', version: 'RHEL 9 Compatible' },
  { id: 'rocky-9', name: 'Rocky Linux 9', category: 'Enterprise', icon: SiRockylinux, color: 'text-emerald-400', version: 'RHEL 9 Binary Sync' },
  { id: 'alpine-3', name: 'Alpine Linux 3.19', category: 'Minimal', icon: SiAlpinelinux, color: 'text-cyan-400', version: 'Ultra-lightweight 5MB' },
  { id: 'windows-2022', name: 'Windows Server 2022', category: 'Windows', icon: FaWindows, color: 'text-blue-500', version: 'Standard 64-bit GUI' }
];

// Datacenter Regions
const DATACENTERS = [
  { id: 'vn-hn', name: 'Hà Nội (Viettel IDC Pháp Vân)', region: 'Miền Bắc', ping: '< 2.1 ms', flag: '🇻🇳', badge: 'Tier-III+' },
  { id: 'vn-hcm', name: 'TP. Hồ Chí Minh (VNPT Nam Thăng Long)', region: 'Miền Nam', ping: '< 5.4 ms', flag: '🇻🇳', badge: 'Tier-III+' },
  { id: 'sg-sea', name: 'Singapore (Equinix SG1)', region: 'Đông Nam Á', ping: '< 22.5 ms', flag: '🇸🇬', badge: 'Tier-IV' }
];

export default function CloudVpsServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Configurator state
  const [planIndex, setPlanIndex] = useState(1);
  const [selectedOs, setSelectedOs] = useState(OS_TEMPLATES[0].id);
  const [selectedDc, setSelectedDc] = useState(DATACENTERS[0].id);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [showSpecAccordion, setShowSpecAccordion] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/cloud-vps/plans');
        if (res.data?.plans?.length) {
          const sorted = res.data.plans.sort((a: any, b: any) => a.monthlyPrice - b.monthlyPrice);
          setDbPlans(sorted);
          const basicIndex = sorted.findIndex((p: any) => p.name.includes('Basic'));
          if (basicIndex >= 0) setPlanIndex(basicIndex);
        }
      } catch (err) {
        console.warn(err);
      }
    }
    loadPlans();
  }, []);


  // Pricing calculation
  
  const matchedPlan = dbPlans[planIndex] || null;
  const cpu = matchedPlan ? parseInt(matchedPlan.cpu || '0') : 0;
  const ram = matchedPlan ? parseInt(matchedPlan.ram || '0') : 0;
  const disk = matchedPlan ? parseInt(matchedPlan.ssd || '0') : 0;

  const monthlyPrice = matchedPlan ? matchedPlan.monthlyPrice : 0;
  const yearlyTotalPrice = matchedPlan ? (matchedPlan.yearlyPrice > 0 ? matchedPlan.yearlyPrice : Math.round(monthlyPrice * 0.8) * 12) : 0;
  const yearlyMonthlyPrice = Math.round(yearlyTotalPrice / 12);

  const handleApplyPreset = (preset: any) => {
    const idx = dbPlans.findIndex(p => p.id === preset.id);
    if (idx >= 0) setPlanIndex(idx);
  };


  const handleOrder = async () => {
    const cycleMonths = billingCycle === 'yearly' ? 12 : 1;
    const finalPrice = billingCycle === 'yearly' ? yearlyTotalPrice : monthlyPrice;
    const osObj = OS_TEMPLATES.find(o => o.id === selectedOs);
    const dcObj = DATACENTERS.find(d => d.id === selectedDc);
    
    const itemId = matchedPlan ? matchedPlan.id : 'vps-custom-order';

    await addItem(itemId, cycleMonths, false, {
      name: matchedPlan ? `${matchedPlan.name}` : `Cloud VPS Custom (${cpu} vCPU, ${ram}GB RAM, ${disk}GB NVMe)`,
      price: finalPrice,
      billingCycle: cycleMonths,
      type: 'vps',
      details: `${osObj?.name} • ${dcObj?.name}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'Máy chủ Cloud VPS được khởi tạo và bàn giao trong bao lâu?',
      a: 'Toàn bộ quy trình khởi tạo Cloud VPS được tự động hóa 100% qua KVM API. Ngay sau khi thanh toán thành công, hệ thống sẽ cấp phát tài nguyên, cài đặt hệ điều hành template bạn chọn và gửi thông tin đăng nhập Root SSH qua Email trong vòng 30 giây.'
    },
    {
      q: 'Tôi có thể nâng cấp CPU, RAM, Ổ cứng sau này mà không mất dữ liệu không?',
      a: 'Hoàn toàn được. Cloud VPS hỗ trợ tính năng Hot-Resize 1-Click trực tiếp trên trang quản trị Dashboard. Bạn có thể nâng cấp thêm vCPU, RAM hoặc dung lượng ổ cứng NVMe bất kỳ lúc nào mà không làm thay đổi địa chỉ IP tĩnh hay cấu hình phần mềm hiện có.'
    },
    {
      q: 'Hệ thống Anti-DDoS 500Gbps hoạt động như thế nào?',
      a: 'SEN CloudHost tích hợp cụm lọc phần cứng Corero SmartWall và Arbor Networks trực tiếp tại cổng kết nối trung tâm Datacenter. Khi phát hiện các đợt tấn công UDP Flood, SYN Flood, HTTP GET/POST Flood, hệ thống sẽ tự động chuyển hướng và lọc sạch các gói tin rác trong vòng dưới 1 giây mà không làm gián đoạn người dùng thật.'
    },
    {
      q: 'Chính sách sao lưu (Snapshot & Backup) của VPS như thế nào?',
      a: 'Bạn có thể tự tạo Snapshot tức thì chỉ mất 3 giây trước khi cài đặt hoặc nâng cấp phần mềm. Ngoài ra, hệ thống tự động sao lưu định kỳ hàng tuần lên cụm lưu trữ đám mây S3 phân tán độc lập, cho phép khôi phục toàn bộ máy chủ về trạng thái an toàn chỉ với 1 cú nhấp chuột.'
    },
    {
      q: 'Tôi có được toàn quyền truy cập quản trị Root không?',
      a: 'Có. Khách hàng sở hữu toàn quyền quản trị cao nhất (Root Access trên Linux / Administrator trên Windows Server). Bạn có thể tự do cài đặt bất kỳ phần mềm, thư viện, Docker container, VPN hoặc tùy biến tường lửa IPTables/UFW theo nhu cầu.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-500 selection:text-white font-sans">

      {/* 1. HERO SECTION & TELEMETRY BLUEPRINT */}
      <section className="relative pt-12 pb-20 overflow-hidden border-b border-slate-200/80 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.18),rgba(255,255,255,0))]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-600 mb-8">
            <Link href="/" className="hover:text-blue-400 transition-colors">HOME</Link>
            <span className="text-slate-600">/</span>
            <Link href="/services" className="hover:text-blue-400 transition-colors">SERVICES</Link>
            <span className="text-slate-600">/</span>
            <span className="text-blue-400 font-bold">CLOUD-VPS</span>
          </nav>

          <div className="max-w-4xl">
            {/* Live Infrastructure Badge */}
            <div className="inline-flex flex-wrap items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0d1627] border border-blue-500/30 text-blue-400 text-xs font-mono mb-6 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">KVM HYPERVISOR ACTIVE</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-700">AMD EPYC ZEN 4</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-700">GEN4 NVME 7,000MB/S</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-bold">ANTI-DDOS 500GBPS</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Cloud VPS KVM Enterprise <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-400 to-indigo-300">
                Tự Động Hóa 100% Trong 30 Giây
              </span>
            </h1>

            <p className="mt-5 text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl font-normal">
              Máy chủ ảo thế hệ mới với tài nguyên CPU/RAM vật lý cô lập hoàn toàn, ổ cứng NVMe Gen4 Enterprise RAID-10 đọc ghi 7,000 MB/s, toàn quyền Root Access và khả năng Scale tài nguyên 1-Click không gián đoạn dịch vụ.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="#vps-configurator"
                className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02] flex items-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                <span>TÙY CHỈNH CẤU HÌNH NGAY</span>
              </a>

              <a
                href="#core-features"
                className="px-7 py-3.5 rounded-xl bg-[#0f172a] hover:bg-slate-100 text-slate-700 border border-slate-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4 text-sky-400" />
                <span>KIẾN TRÚC HẠ TẦNG</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 2. SIGNATURE INTERACTIVE ELEMENT: CLOUD VPS CONFIGURATOR & LIFECYCLE ENGINE */}
      <section id="vps-configurator" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950 text-blue-400 text-xs font-mono mb-3 border border-blue-800">
              <Sliders className="w-3.5 h-3.5" />
              INTERACTIVE RESOURCE ENGINE
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Tùy Chỉnh Tài Nguyên VPS Theo Nhu Cầu
            </h2>
          </div>

          {/* 4 FAST PRESET BUTTONS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {dbPlans.length > 0 && [
              { ...dbPlans[1], tag: 'Tiết Kiệm' },
              { ...dbPlans[2], tag: 'Khuyên Dùng' },
              { ...dbPlans[5], tag: 'Doanh Nghiệp' },
              { ...dbPlans[7] || dbPlans[6], tag: 'Cực Đại' }
            ].map((p, idx) => {
              if (!p || !p.id) return null;
              const pCpu = parseInt(p.cpu || '0');
              const pRam = parseInt(p.ram || '0');
              const pDisk = parseInt(p.ssd || '0');
              const isSelected = planIndex === idx;
              return (
                <button
                  key={idx}
                  onClick={() => setPlanIndex(dbPlans.findIndex(x => x.id === p.id))}
                  className={`p-5 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                    isSelected
                      ? 'bg-slate-100 border-blue-500 shadow-lg shadow-blue-500/10'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900 font-mono">{p.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {p.tag}
                    </span>
                  </div>
                  <div className="text-lg font-black text-blue-400 font-mono mb-1">
                    {p.monthlyPrice.toLocaleString('vi-VN')} đ<span className="text-[11px] font-normal text-slate-500">/tháng</span>
                  </div>
                  <div className="text-[11px] text-slate-700 font-mono space-y-0.5">
                    <div>{p.cpu} • {p.ram} RAM • {p.ssd}</div>
                    <div className="text-slate-500 text-[10px]">{p.bandwidth} Uplink</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* MAIN DUAL-COLUMN CONFIGURATOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Sliders, OS Template & DC Selection */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Sliders Container */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-8">
                
                {/* MASTER PLAN SELECTION */}
                <div>
                  <div className="flex justify-between items-center mb-3 font-mono">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-400" />
                      Kéo Chọn Gói Cấu Hình (Packages):
                    </label>
                    <span className="text-sm font-black text-blue-400 bg-blue-950 px-3 py-1 rounded-lg border border-blue-900">
                      {matchedPlan ? matchedPlan.name : 'Loading...'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, dbPlans.length - 1)}
                    step="1"
                    value={planIndex}
                    onChange={(e) => setPlanIndex(Number(e.target.value))}
                    className="w-full h-2 bg-white rounded-lg appearance-none cursor-pointer accent-blue-500 mb-6"
                  />
                  
                  {/* Visually show the specs of the selected plan */}
                  <div className="space-y-5">
                    {/* CPU */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                        <span>Vi Xử Lý (CPU)</span>
                        <span className="font-bold text-slate-900">{matchedPlan?.cpu || '-'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-400 transition-all duration-300" style={{ width: `${Math.min(100, (cpu / 16) * 100)}%` }} />
                      </div>
                    </div>
                    {/* RAM */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                        <span>Bộ Nhớ (RAM)</span>
                        <span className="font-bold text-slate-900">{matchedPlan?.ram || '-'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 transition-all duration-300" style={{ width: `${Math.min(100, (ram / 32) * 100)}%` }} />
                      </div>
                    </div>
                    {/* Disk */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                        <span>Lưu Trữ (NVMe)</span>
                        <span className="font-bold text-slate-900">{matchedPlan?.ssd || '-'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400 transition-all duration-300" style={{ width: `${Math.min(100, (disk / 500) * 100)}%` }} />
                      </div>
                    </div>

                    {/* Bandwidth */}
                    <div>
                      <div className="flex justify-between text-xs font-mono text-slate-600 mb-1">
                        <span>Băng Thông (Bandwidth)</span>
                        <span className="font-bold text-slate-900">{matchedPlan?.bandwidth || '-'}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 transition-all duration-300" style={{ width: '100%' }} />
                      </div>
                    </div>

                  </div>
                </div>

              </div>

              {/* 4. OS Template Selection (With Simple-Icons) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-4">
                <div className="text-xs font-mono text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    4. Lựa Chọn Hệ Điều Hành (Official OS Template):
                  </span>
                  <span className="text-emerald-400 text-[11px]">100% Cài Đặt Tự Động 30s</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {OS_TEMPLATES.map((osItem) => {
                    const SIcon = osItem.icon;
                    const isSelected = selectedOs === osItem.id;
                    return (
                      <button
                        key={osItem.id}
                        onClick={() => setSelectedOs(osItem.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#121c33] border-blue-500 shadow-md shadow-blue-500/10'
                            : 'bg-[#060a12] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <SIcon className={`w-6 h-6 ${osItem.color}`} />
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                            {osItem.category}
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 font-mono leading-tight">{osItem.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">{osItem.version}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Datacenter Region Selection */}
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 space-y-4">
                <div className="text-xs font-mono text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    5. Vị Trí Phòng Máy (Datacenter Region):
                  </span>
                  <span className="text-cyan-400 text-[11px]">Đường Truyền VNIX 100G</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                  {DATACENTERS.map((dc) => {
                    const isSelected = selectedDc === dc.id;
                    return (
                      <button
                        key={dc.id}
                        onClick={() => setSelectedDc(dc.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#121c33] border-cyan-500 shadow-md shadow-cyan-500/10'
                            : 'bg-[#060a12] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-900">
                          <span className="flex items-center gap-1.5">
                            <span>{dc.flag}</span>
                            <span>{dc.region}</span>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-900">
                            {dc.badge}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-700 truncate">{dc.name}</div>
                        <div className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span>Độ trễ: {dc.ping}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right Column: Live Datasheet & Order CTA */}
            <div className="lg:col-span-4 space-y-6">
              
              <div className="p-6 sm:p-7 rounded-3xl bg-white border border-blue-500/50 shadow-2xl space-y-5 font-mono text-xs">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-bold text-slate-900 uppercase">DATASHEET MÁY CHỦ</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-[10px] font-bold">
                    KVM VIRTUALIZATION
                  </span>
                </div>

                {/* Specs List */}
                <div className="space-y-2.5 text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vi Xử Lý (CPU):</span>
                    <span className="text-blue-400 font-bold">{cpu} vCPU (AMD EPYC)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bộ Nhớ RAM:</span>
                    <span className="text-indigo-400 font-bold">{ram} GB DDR5 ECC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ổ Cứng Lưu Trữ:</span>
                    <span className="text-sky-400 font-bold">{disk} GB NVMe Gen4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Hệ Điều Hành:</span>
                    <span className="text-emerald-400 truncate max-w-[170px]">
                      {OS_TEMPLATES.find(o => o.id === selectedOs)?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Datacenter:</span>
                    <span className="text-cyan-400">{DATACENTERS.find(d => d.id === selectedDc)?.region}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Băng Thông / Uplink:</span>
                    <span className="text-slate-800">{matchedPlan?.bandwidth || 'Unlimited'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Bảo Vệ Anti-DDoS:</span>
                    <span className="text-purple-400">500 Gbps Phần Cứng</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Địa Chỉ IP:</span>
                    <span className="text-amber-400">1 Clean IPv4 Riêng Biệt</span>
                  </div>
                </div>

                {/* Billing Cycle Switch */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="text-[10px] text-slate-500 uppercase mb-2">Chu kỳ thanh toán:</div>
                  <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 border border-slate-200">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`py-2 rounded-lg font-bold text-xs transition-all ${
                        billingCycle === 'monthly'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Tháng
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`py-2 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${
                        billingCycle === 'yearly'
                          ? 'bg-blue-600 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>Năm</span>
                      <span className="text-[9px] px-1 rounded bg-emerald-500 text-white font-black">-20%</span>
                    </button>
                  </div>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="text-[10px] text-slate-500 uppercase">Tổng Chi Phí:</div>
                  <div className="text-2xl font-black text-blue-400 mt-1">
                    {billingCycle === 'yearly'
                      ? `${yearlyMonthlyPrice.toLocaleString('vi-VN')} đ`
                      : `${monthlyPrice.toLocaleString('vi-VN')} đ`}
                    <span className="text-xs font-normal text-slate-500"> /tháng</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Thanh toán {yearlyTotalPrice.toLocaleString('vi-VN')} đ/năm (Tiết kiệm {(monthlyPrice * 12 - yearlyTotalPrice).toLocaleString('vi-VN')} đ)
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <button
                  onClick={handleOrder}
                  className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 hover:scale-[1.02]"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>KHỞI TẠO VPS NGAY (30S)</span>
                </button>

                <div className="text-[10px] text-center text-slate-500 font-sans">
                  🛡️ Cam kết hoàn tiền 100% trong 7 ngày nếu không hài lòng
                </div>
              </div>

              {/* Lifecycle & Automation Inspector Box */}
              <div className="p-5 rounded-2xl bg-slate-100 border border-slate-200 font-mono text-[11px] space-y-3">
                <div className="text-[10px] text-slate-500 uppercase flex items-center justify-between">
                  <span>AUTOMATION TIMELINE</span>
                  <span className="text-emerald-400">ZERO HUMAN DELAY</span>
                </div>
                <div className="space-y-2 text-slate-600">
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                    <span>1. Cấp phát KVM VM:</span>
                    <span className="text-emerald-400 font-bold">&lt; 15 Giây</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                    <span>2. Cài OS &amp; Cloud-Init:</span>
                    <span className="text-sky-400 font-bold">&lt; 15 Giây</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                    <span>3. Tạo Snapshot tức thì:</span>
                    <span className="text-purple-400 font-bold">3 Giây</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-white border border-slate-200">
                    <span>4. Hot-Resize RAM/CPU:</span>
                    <span className="text-amber-400 font-bold">1-Click</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* COLLAPSIBLE DETAILED SPEC SHEET ACCORDION */}
          <div className="mt-12 pt-8 border-t border-slate-200/80">
            <button
              onClick={() => setShowSpecAccordion(!showSpecAccordion)}
              className="w-full p-4 rounded-2xl bg-white border border-slate-200 hover:border-slate-700 transition-all flex items-center justify-between font-mono text-xs text-slate-700"
            >
              <div className="flex items-center gap-2 font-bold">
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Xem Toàn Bộ Bảng So Sánh Chi Tiết Thông Số Kỹ Thuật (Spec Sheet)</span>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-bold">
                <span>{showSpecAccordion ? 'Thu gọn' : 'Xem chi tiết'}</span>
                {showSpecAccordion ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            {showSpecAccordion && (
              <div className="mt-4 p-6 rounded-2xl bg-slate-100 border border-slate-200 overflow-x-auto font-mono text-xs animate-in fade-in duration-200">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      <th className="py-3 px-4">Hạng Mục Kỹ Thuật</th>
                      <th className="py-3 px-4">Basic Dev</th>
                      <th className="py-3 px-4">Pro Team</th>
                      <th className="py-3 px-4">Business E-Com</th>
                      <th className="py-3 px-4">Enterprise High-Load</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-700 text-[11px]">
                    <tr>
                      <td className="py-3 px-4 text-slate-600">Kiến trúc Vi xử lý (vCPU)</td>
                      <td className="py-3 px-4">1 vCPU (AMD Zen 4)</td>
                      <td className="py-3 px-4">2 vCPU (AMD Zen 4)</td>
                      <td className="py-3 px-4">4 vCPU (AMD Zen 4)</td>
                      <td className="py-3 px-4">8 vCPU (AMD Zen 4)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-600">Bộ nhớ RAM (DDR5 ECC)</td>
                      <td className="py-3 px-4">2 GB</td>
                      <td className="py-3 px-4">4 GB</td>
                      <td className="py-3 px-4">8 GB</td>
                      <td className="py-3 px-4">16 GB</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-600">Ổ cứng Enterprise NVMe Gen4</td>
                      <td className="py-3 px-4">30 GB (RAID 10)</td>
                      <td className="py-3 px-4">60 GB (RAID 10)</td>
                      <td className="py-3 px-4">120 GB (RAID 10)</td>
                      <td className="py-3 px-4">240 GB (RAID 10)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-600">Tốc độ đọc / ghi Disk</td>
                      <td className="py-3 px-4 text-emerald-400">7,000 MB/s</td>
                      <td className="py-3 px-4 text-emerald-400">7,000 MB/s</td>
                      <td className="py-3 px-4 text-emerald-400">7,000 MB/s</td>
                      <td className="py-3 px-4 text-emerald-400">7,000 MB/s</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-600">Bảo vệ Anti-DDoS phần cứng</td>
                      <td className="py-3 px-4 text-purple-400">500 Gbps</td>
                      <td className="py-3 px-4 text-purple-400">500 Gbps</td>
                      <td className="py-3 px-4 text-purple-400">500 Gbps</td>
                      <td className="py-3 px-4 text-purple-400">500 Gbps</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-600">Băng thông mạng nội địa</td>
                      <td className="py-3 px-4">100 Mbps (Unmetered)</td>
                      <td className="py-3 px-4">200 Mbps (Unmetered)</td>
                      <td className="py-3 px-4">500 Mbps (Unmetered)</td>
                      <td className="py-3 px-4">1,000 Mbps (Unmetered)</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-600">Bản quyền Snapshot tức thì</td>
                      <td className="py-3 px-4 text-sky-400">1 Bản Snapshot</td>
                      <td className="py-3 px-4 text-sky-400">2 Bản Snapshot</td>
                      <td className="py-3 px-4 text-sky-400">3 Bản Snapshot</td>
                      <td className="py-3 px-4 text-sky-400">5 Bản Snapshot</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 text-slate-600">Cam kết Uptime SLA</td>
                      <td className="py-3 px-4 text-amber-400">99.99%</td>
                      <td className="py-3 px-4 text-amber-400">99.99%</td>
                      <td className="py-3 px-4 text-amber-400">99.99%</td>
                      <td className="py-3 px-4 text-amber-400">99.99%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. SIX CORE ARCHITECTURE CAPABILITIES (SINGLE SOURCE OF TRUTH) */}
      <section id="core-features" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950 text-blue-400 text-xs font-mono mb-3 border border-blue-800">
              <Layers className="w-3.5 h-3.5" />
              ENTERPRISE HARDWARE &amp; ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              6 Nền Tảng Kỹ Thuật Độc Quyền Của SEN Cloud VPS
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Mỗi tính năng được xây dựng trên hạ tầng phần cứng thật, cam kết bằng hợp đồng SLA minh bạch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Card 1: AMD EPYC Zen 4 */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ZEN 4 COMPUTE ENGINE</span>
                    <span className="text-blue-400">3.7GHZ BOOST</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-[11px]">
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Architecture:</span>
                      <span className="text-blue-400 font-bold">AMD EPYC 9004</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>L3 Cache Allocation:</span>
                      <span className="text-emerald-400">256 MB Dedicated</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Instruction Set:</span>
                      <span className="text-sky-400 font-bold">AVX-512 AI Ready</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Vi Xử Lý AMD EPYC Zen 4 Đỉnh Cao</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cung cấp sức mạnh tính toán vượt trội, tối ưu cho các tác vụ xử lý đồng thời, biên dịch mã nguồn, cơ sở dữ liệu và AI Inference với xung nhịp đơn nhân lên đến 3.7GHz.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Clock Speed:</span>
                <strong className="text-blue-400">3.7GHz Base / 4.4GHz Turbo</strong>
              </div>
            </div>

            {/* Card 2: NVMe Gen4 Enterprise */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ALL-FLASH NVME ARRAYS</span>
                    <span className="text-emerald-400">7,000 MB/S</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-[11px]">
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Max Read / Write:</span>
                      <span className="text-emerald-400 font-bold">7,200 / 6,800 MB/s</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Random 4K IOPS:</span>
                      <span className="text-sky-400 font-bold">800,000 IOPS</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Storage Array:</span>
                      <span className="text-amber-400">Hardware RAID-10</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">NVMe Gen4 U.2 Enterprise Siêu Tốc</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  100% ổ cứng chuẩn Enterprise U.2 chạy RAID-10 phần cứng. Loại bỏ hoàn toàn nút thắt cổ chai I/O khi xử lý hàng triệu bản ghi Database MySQL / PostgreSQL.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Disk Latency:</span>
                <strong className="text-emerald-400">&lt; 0.05 ms Ultra-low</strong>
              </div>
            </div>

            {/* Card 3: Anti-DDoS 500Gbps */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>HARDWARE DDOS SHIELD</span>
                    <span className="text-purple-400">500GBPS L3-L7</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-[11px]">
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>L3/L4 Volumetric:</span>
                      <span className="text-purple-400 font-bold">500 Gbps Line-rate</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>L7 Application Filter:</span>
                      <span className="text-emerald-400 font-bold">Corero SmartWall</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Mitigation Time:</span>
                      <span className="text-sky-400 font-bold">&lt; 1.0 Giây kích hoạt</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Tường Lửa Anti-DDoS 500Gbps Tự Động</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Lọc sạch các cuộc tấn công phá hoại UDP, SYN flood, BOT spam kết nối ngay tại biên mạng. Server luôn duy trì kết nối ổn định cho khách hàng thật.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Packet Loss:</span>
                <strong className="text-purple-400">0.00% Trong Đợt Tấn Công</strong>
              </div>
            </div>

            {/* Card 4: Snapshot & Micro-Clone */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>COW SNAPSHOT ENGINE</span>
                    <span className="text-sky-400">3-SECOND CLONE</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-[11px]">
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Snapshot Speed:</span>
                      <span className="text-sky-400 font-bold">3 Giây hoàn tất</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Replication Target:</span>
                      <span className="text-emerald-400">S3 Offsite Cluster</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>1-Click Restore:</span>
                      <span className="text-purple-400 font-bold">Zero-Downtime Revert</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Snapshot Tức Thì &amp; Micro-Clone</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tạo điểm khôi phục nhanh (Snapshot) trong 3 giây trước khi cập nhật mã nguồn hoặc cài module mới. Khôi phục máy chủ nguyên trạng ngay lập tức khi phát sinh lỗi.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Snapshot Creation:</span>
                <strong className="text-sky-400">&lt; 3s Không Cần Tắt Máy</strong>
              </div>
            </div>

            {/* Card 5: Hot-Resize & Dynamic Scaling */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>HOT-RESIZE HYPERVISOR</span>
                    <span className="text-amber-400">10S UPGRADE</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-[11px]">
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>CPU/RAM Scale:</span>
                      <span className="text-amber-400 font-bold">1-Click Không mất IP</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Data Integrity:</span>
                      <span className="text-emerald-400 font-bold">100% Giữ Nguyên Dữ Liệu</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Disk Expansion:</span>
                      <span className="text-sky-400">Online Expand Không Format</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Mở Rộng Linh Hoạt (Hot-Resize 1-Click)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tự do nâng cấp tài nguyên theo từng chiến dịch sale mà không phải cài lại máy chủ hay đổi địa chỉ IP. Dung lượng ổ cứng mở rộng online tự động nhận diện.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Scaling Speed:</span>
                <strong className="text-amber-400">&lt; 10 Giây Hoàn Tất</strong>
              </div>
            </div>

            {/* Card 6: Tier-III Datacenter & SLA */}
            <div className="p-7 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>TIER-III DATACENTER</span>
                    <span className="text-emerald-400">SLA 99.99%</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 text-[11px]">
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Power Redundancy:</span>
                      <span className="text-emerald-400 font-bold">2N Dual Feed A+B</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>Network Backbone:</span>
                      <span className="text-sky-400 font-bold">VNIX 100Gbps Direct</span>
                    </div>
                    <div className="flex justify-between p-1.5 rounded bg-white">
                      <span>SOC / NOC Support:</span>
                      <span className="text-amber-400">24/7/365 Kỹ sư L3</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Hạ Tầng Chuẩn Quốc Tế &amp; SLA 99.99%</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Đặt tại Datacenter Viettel IDC &amp; VNPT chuẩn TIA-942 Rated 3. Nguồn điện kép 2N kèm máy phát Kohler bảo đảm hệ thống luôn vận hành liên tục.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Availability SLA:</span>
                <strong className="text-emerald-400">99.99% Cam Kết Hợp Đồng</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. DEVOPS & MULTI-APP INTEGRATIONS (100% OFFICIAL SIMPLE-ICONS) */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950 text-blue-400 text-xs font-mono mb-3 border border-blue-800">
              <Workflow className="w-3.5 h-3.5" />
              DEVOPS &amp; CONTAINER READY
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Tương Thích Tuyệt Đối Mọi Nền Tảng &amp; Công Cụ
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Toàn quyền Root Access cho phép bạn triển khai các ngăn xếp công nghệ phổ biến nhất mà không bị giới hạn.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 font-mono">
            {[
              { name: 'Docker', desc: 'Container Engine', icon: SiDocker, color: 'text-blue-400' },
              { name: 'Kubernetes', desc: 'Cluster K8s', icon: SiKubernetes, color: 'text-blue-500' },
              { name: 'Terraform', desc: 'IaC Automation', icon: SiTerraform, color: 'text-purple-400' },
              { name: 'Ansible', desc: 'Config Mgmt', icon: SiAnsible, color: 'text-rose-400' },
              { name: 'Prometheus', desc: 'Metrics Monitor', icon: SiPrometheus, color: 'text-orange-400' },
              { name: 'Grafana', desc: 'Live Dashboard', icon: SiGrafana, color: 'text-amber-400' },
              { name: 'Nginx', desc: 'Reverse Proxy', icon: SiNginx, color: 'text-emerald-400' },
              { name: 'PostgreSQL', desc: 'Relational DB', icon: SiPostgresql, color: 'text-sky-400' },
              { name: 'Redis', desc: 'In-Memory Cache', icon: SiRedis, color: 'text-red-400' },
              { name: 'GitHub Actions', desc: 'CI/CD Runner', icon: SiGithub, color: 'text-slate-200' },
              { name: 'Python', desc: 'Backend & AI', icon: SiPython, color: 'text-yellow-400' },
              { name: 'Node.js', desc: 'JS Runtime', icon: SiNodedotjs, color: 'text-emerald-500' }
            ].map((app, i) => {
              const AppIcon = app.icon;
              return (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500/50 transition-all flex flex-col items-center text-center group"
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <AppIcon className={`w-6 h-6 ${app.color}`} />
                  </div>
                  <div className="text-xs font-bold text-slate-900 group-hover:text-blue-400 transition-colors">{app.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{app.desc}</div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ) */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950 text-blue-400 text-xs font-mono mb-3 border border-blue-800">
              <HelpCircle className="w-3.5 h-3.5" />
              FREQUENTLY ASKED QUESTIONS
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Giải Đáp Thắc Mắc Kỹ Thuật Về Cloud VPS
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 font-normal">
              Những thông tin quan trọng giúp bạn an tâm vận hành hạ tầng máy chủ tại SEN CloudHost.
            </p>
          </div>

          <div className="space-y-4 font-sans">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-800">{faq.q}</span>
                  <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-blue-400">
                    {openFaq === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {openFaq === idx && (
                  <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-200/80 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. ZERO-DOWNTIME MIGRATION & FINAL CALL TO ACTION */}
      <section className="py-24 bg-gradient-to-b from-[#090d16] via-[#0b1528] to-[#090d16] relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>KHỞI TẠO TỨC THÌ TRONG 30 GIÂY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-6">
            Sẵn Sàng Triển Khai Cloud VPS KVM Của Bạn?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Trải nghiệm máy chủ ảo AMD EPYC Zen 4 siêu tốc, ổ cứng NVMe Gen4 RAID-10 với bảng điều khiển trực quan và hỗ trợ kỹ thuật 24/7/365.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <a
              href="#vps-configurator"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.02] flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>TÙY CHỈNH &amp; ĐẶT MÁY CHỦ NGAY</span>
            </a>

            <Link
              href="/services/migrations"
              className="px-8 py-4 rounded-xl bg-white hover:bg-slate-100 text-slate-300 border border-slate-300 font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4 text-emerald-400" />
              <span>YÊU CẦU CHUYỂN VPS MIỄN PHÍ</span>
            </Link>
          </div>

          {/* Embedded Free Migration Assurance (Not interrupting previous flow) */}
          <div className="mt-8 pt-6 border-t border-slate-200/80 max-w-xl mx-auto text-xs text-slate-600 flex items-center justify-center gap-2 font-mono">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Đang dùng VPS tại nơi khác? Kỹ sư SEN CloudHost hỗ trợ di dời 0đ, 0s downtime.</span>
          </div>

        </div>
      </section>

    </div>
  );
}
