'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Server, Cpu, HardDrive, Shield, Zap, Check, ArrowRight, 
  Globe, ShieldCheck, RefreshCw, Layers, Database, ChevronDown, 
  ChevronUp, CheckCircle2, AlertCircle, ShoppingCart, HelpCircle,
  Award, Clock, Terminal, Activity, Wifi
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';

const OS_LIST = [
  { id: 'ubuntu-24', name: 'Ubuntu 24.04 LTS', category: 'Linux', icon: '🐧', default: true },
  { id: 'ubuntu-22', name: 'Ubuntu 22.04 LTS', category: 'Linux', icon: '🐧' },
  { id: 'debian-12', name: 'Debian 12 (Bookworm)', category: 'Linux', icon: '🌀' },
  { id: 'almalinux-9', name: 'AlmaLinux 9', category: 'Linux', icon: '📦' },
  { id: 'rocky-9', name: 'Rocky Linux 9', category: 'Linux', icon: '🏔️' },
  { id: 'centos-9', name: 'CentOS Stream 9', category: 'Linux', icon: '🎯' },
  { id: 'win-2022', name: 'Windows Server 2022', category: 'Windows', icon: '🪟', surcharge: 120000 },
  { id: 'win-2019', name: 'Windows Server 2019', category: 'Windows', icon: '🪟', surcharge: 120000 },
];

const DATACENTERS = [
  { id: 'han-vn', name: 'Hà Nội - VNPT Data Center', flag: '🇻🇳', ping: '1-3ms', desc: 'Tier 3 International Standard' },
  { id: 'hcm-vn', name: 'TP. Hồ Chí Minh - Viettel IDC', flag: '🇻🇳', ping: '1-3ms', desc: 'Tier 3+ Mega Data Center' },
  { id: 'sin', name: 'Singapore - Equinix SG1', flag: '🇸🇬', ping: '25-35ms', desc: 'Global Transit Hub APAC' },
  { id: 'tokyo', name: 'Tokyo - Equinix TY2', flag: '🇯🇵', ping: '45-60ms', desc: 'Japan & East Asia Route' },
];

const BILLING_CYCLES = [
  { months: 1, label: '1 Tháng', discount: 0, tag: '' },
  { months: 3, label: '3 Tháng', discount: 0.05, tag: 'Tiết kiệm 5%' },
  { months: 6, label: '6 Tháng', discount: 0.10, tag: 'Tiết kiệm 10%' },
  { months: 12, label: '12 Tháng', discount: 0.20, tag: 'Tiết kiệm 20%', popular: true },
  { months: 24, label: '24 Tháng', discount: 0.30, tag: 'Tiết kiệm 30%' },
  { months: 36, label: '36 Tháng', discount: 0.40, tag: 'Tiết kiệm 40%' },
];

const ADDONS = [
  { id: 'backup', name: 'Tự Động Sao Lưu Hàng Ngày (Daily Cloud Backup)', price: 45000, desc: 'Lưu giữ 7 bản sao lưu gần nhất, phục hồi 1-click' },
  { id: 'ipv4', name: 'Thêm 01 Địa Chỉ IPv4 Riêng (Dedicated IPv4)', price: 60000, desc: 'IP tĩnh sạch riêng biệt với rDNS tùy chỉnh' },
  { id: 'ddos-pro', name: 'Chống DDoS Chuyên Nghiệp L7 (Anti-DDoS Pro)', price: 90000, desc: 'Bảo vệ Game, Web chống botnet & tấn công HTTP Flood lên đến 1Tbps' },
  { id: 'managed', name: 'Dịch Vụ Quản Trị Máy Chủ 24/7 (Managed Support)', price: 150000, desc: 'Kỹ sư tối ưu hiệu năng, cài đặt phần mềm và bảo mật định kỳ' },
];

export default function VpsCustomConfiguratorPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  // Specifications state
  const [cpu, setCpu] = useState(4); // vCPU
  const [ram, setRam] = useState(8); // GB
  const [disk, setDisk] = useState(80); // GB NVMe
  const [selectedOs, setSelectedOs] = useState(OS_LIST[0]);
  const [selectedDc, setSelectedDc] = useState(DATACENTERS[0]);
  const [billingCycle, setBillingCycle] = useState(BILLING_CYCLES[3]); // 12 months default
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['backup']);
  
  // UI states
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Price calculations
  const unitCpu = 45000;
  const unitRam = 35000;
  const unitDisk = 1500;
  const baseSystem = 50000;

  const baseHardwareCost = (cpu * unitCpu) + (ram * unitRam) + (disk * unitDisk) + baseSystem;
  const osCost = selectedOs.surcharge || 0;
  const addonsCost = selectedAddons.reduce((sum, id) => {
    const addon = ADDONS.find(a => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);

  const monthlyPreDiscount = baseHardwareCost + osCost + addonsCost;
  const discountedMonthly = Math.round(monthlyPreDiscount * (1 - billingCycle.discount));
  const totalAmount = discountedMonthly * billingCycle.months;
  const totalSaved = (monthlyPreDiscount * billingCycle.months) - totalAmount;

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleAddToCart = async (redirectCheckout = false) => {
    try {
      const customPlanId = 'custom-vps-epyc';
      const itemDetails = {
        name: `Cloud VPS Tùy Chỉnh (${cpu} vCPU, ${ram}GB RAM, ${disk}GB NVMe)`,
        title: `Cloud VPS Tùy Chỉnh (${cpu} vCPU, ${ram}GB RAM, ${disk}GB NVMe)`,
        type: 'vps' as const,
        details: `Hệ điều hành: ${selectedOs.name} | DC: ${selectedDc.name} | Addons: ${selectedAddons.length} mục`,
        price: totalAmount,
        billingCycle: `${billingCycle.months} tháng`,
      };

      await addItem(customPlanId, billingCycle.months, true, itemDetails);
      showToast('Đã thêm cấu hình Cloud VPS tùy chỉnh vào giỏ hàng thành công!');
      
      if (redirectCheckout) {
        setTimeout(() => router.push('/cart'), 600);
      }
    } catch (err) {
      console.error(err);
      showToast('Không thể thêm vào giỏ hàng. Vui lòng thử lại!', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-3 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white pt-16 pb-24 border-b border-blue-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white transition-colors">Dịch vụ</Link>
            <span>/</span>
            <Link href="/services/cloud-vps" className="hover:text-white transition-colors">Cloud VPS</Link>
            <span>/</span>
            <span className="text-cyan-400">Tùy Chỉnh Cấu Hình</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-4">
              <Zap className="w-4 h-4 text-cyan-400" />
              Custom Cloud VPS Configurator
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
              Tùy Biến Cấu Hình <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Cloud VPS Theo Nhu Cầu
              </span>
            </h1>
            <p className="text-base sm:text-lg text-blue-100/80 max-w-2xl leading-relaxed">
              Tự do lựa chọn vi xử lý AMD EPYC Gen 4, bộ nhớ RAM DDR5 và ổ cứng Enterprise NVMe. Thanh toán linh hoạt, khởi tạo tức thì trong 30 giây.
            </p>
          </div>
        </div>
      </section>

      {/* Configurator Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 mb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Controls (Left Column) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Hardware Resources */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">1</div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900">Tài Nguyên Phần Cứng (Hardware Specs)</h2>
                    <p className="text-xs text-slate-500">Kéo thanh trượt hoặc chọn các mốc định mức phù hợp</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5" /> AMD EPYC 9654
                </span>
              </div>

              {/* CPU Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-blue-600" />
                    Vi Xử Lý (CPU Cores):
                  </label>
                  <span className="text-base font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl">
                    {cpu} vCPU Core
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="32" 
                  step="1"
                  value={cpu}
                  onChange={(e) => setCpu(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>1 vCPU</span>
                  <span>4 vCPU</span>
                  <span>8 vCPU</span>
                  <span>16 vCPU</span>
                  <span>32 vCPU</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[1, 2, 4, 8, 16, 32].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setCpu(v)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        cpu === v 
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {v} Core
                    </button>
                  ))}
                </div>
              </div>

              {/* RAM Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-600" />
                    Bộ Nhớ RAM (DDR5 ECC):
                  </label>
                  <span className="text-base font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-xl">
                    {ram} GB RAM
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="64" 
                  step="1"
                  value={ram}
                  onChange={(e) => setRam(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>1 GB</span>
                  <span>8 GB</span>
                  <span>16 GB</span>
                  <span>32 GB</span>
                  <span>64 GB</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[2, 4, 8, 16, 32, 64].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setRam(v)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        ram === v 
                          ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {v} GB
                    </button>
                  ))}
                </div>
              </div>

              {/* Disk Slider */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    Ổ Cứng Lưu Trữ (NVMe Enterprise):
                  </label>
                  <span className="text-base font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl">
                    {disk} GB NVMe
                  </span>
                </div>
                <input 
                  type="range" 
                  min="20" 
                  max="500" 
                  step="10"
                  value={disk}
                  onChange={(e) => setDisk(Number(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] font-bold text-slate-400">
                  <span>20 GB</span>
                  <span>80 GB</span>
                  <span>160 GB</span>
                  <span>300 GB</span>
                  <span>500 GB</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {[30, 60, 100, 150, 250, 500].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setDisk(v)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        disk === v 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {v} GB
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: OS Selection */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black">2</div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Hệ Điều Hành &amp; Template (OS Image)</h2>
                  <p className="text-xs text-slate-500">Tự động cài đặt sạch 100% bản quyền và cập nhật mới nhất</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {OS_LIST.map((os) => {
                  const isSelected = selectedOs.id === os.id;
                  return (
                    <div
                      key={os.id}
                      onClick={() => setSelectedOs(os)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-2 ring-blue-600/10' 
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{os.icon}</span>
                        <div>
                          <div className="text-xs font-black text-slate-900">{os.name}</div>
                          <div className="text-[11px] font-bold text-slate-400">{os.category}</div>
                        </div>
                      </div>
                      {os.surcharge ? (
                        <span className="text-[11px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                          +{os.surcharge.toLocaleString('vi-VN')} đ/th
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Miễn phí
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Datacenter Location */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">3</div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Vị Trí Trung Tâm Dữ Liệu (Datacenter)</h2>
                  <p className="text-xs text-slate-500">Đường truyền băng thông không giới hạn với Anti-DDoS</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DATACENTERS.map((dc) => {
                  const isSelected = selectedDc.id === dc.id;
                  return (
                    <div
                      key={dc.id}
                      onClick={() => setSelectedDc(dc)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/50 shadow-sm ring-2 ring-amber-500/10' 
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{dc.flag}</span>
                        <div>
                          <div className="text-xs font-black text-slate-900">{dc.name}</div>
                          <div className="text-[11px] text-slate-500">{dc.desc}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {dc.ping}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Addon Services */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">4</div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Dịch Vụ Giá Trị Gia Tăng (Add-on Services)</h2>
                  <p className="text-xs text-slate-500">Tăng cường khả năng bảo mật, backup và vận hành máy chủ</p>
                </div>
              </div>

              <div className="space-y-3">
                {ADDONS.map((addon) => {
                  const isChecked = selectedAddons.includes(addon.id);
                  return (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddon(addon.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                        isChecked 
                          ? 'border-emerald-600 bg-emerald-50/30' 
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="text-xs font-black text-slate-900">{addon.name}</div>
                          <div className="text-[11px] text-slate-500">{addon.desc}</div>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        +{addon.price.toLocaleString('vi-VN')} đ<span className="text-[10px] font-normal text-slate-400">/th</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Sticky Summary Card (Right Column) */}
          <div className="lg:col-span-4 sticky top-20 space-y-6">
            <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-cyan-400 text-xs font-bold mb-3">
                  <Server className="w-3.5 h-3.5" />
                  Cấu Hình VPS Đã Chọn
                </div>
                <h3 className="text-xl font-black text-white">Cloud VPS Custom</h3>
                <p className="text-xs text-slate-400 mt-1">Hạ tầng AMD EPYC &bull; NVMe Enterprise</p>
              </div>

              {/* Specs Breakdown */}
              <div className="bg-slate-800/80 rounded-2xl p-4 space-y-2.5 border border-slate-700/60 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5 text-blue-400" /> CPU:</span>
                  <span className="font-bold text-white">{cpu} vCPU Core</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-purple-400" /> RAM:</span>
                  <span className="font-bold text-white">{ram} GB DDR5</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5"><HardDrive className="w-3.5 h-3.5 text-emerald-400" /> SSD:</span>
                  <span className="font-bold text-white">{disk} GB NVMe</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-amber-400" /> Datacenter:</span>
                  <span className="font-bold text-white">{selectedDc.flag} {selectedDc.name.split(' - ')[0]}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-cyan-400" /> OS:</span>
                  <span className="font-bold text-white">{selectedOs.name}</span>
                </div>
                {selectedAddons.length > 0 && (
                  <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-700">
                    <span>Dịch vụ cộng thêm:</span>
                    <span className="font-bold text-emerald-400">+{selectedAddons.length} mục</span>
                  </div>
                )}
              </div>

              {/* Billing Cycle Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Chu Kỳ Thanh Toán:</span>
                  {billingCycle.discount > 0 && (
                    <span className="text-emerald-400 text-[11px] font-extrabold">{billingCycle.tag}</span>
                  )}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {BILLING_CYCLES.map((cycle) => {
                    const isSelected = billingCycle.months === cycle.months;
                    return (
                      <button
                        key={cycle.months}
                        type="button"
                        onClick={() => setBillingCycle(cycle)}
                        className={`p-2 rounded-xl text-center border transition-all ${
                          isSelected
                            ? 'bg-blue-600 border-blue-500 text-white font-black shadow-md'
                            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700 font-bold'
                        }`}
                      >
                        <div className="text-xs">{cycle.label}</div>
                        {cycle.discount > 0 ? (
                          <div className="text-[10px] text-emerald-300 font-extrabold">-{cycle.discount * 100}%</div>
                        ) : (
                          <div className="text-[10px] text-slate-400">Chuẩn</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Calculation */}
              <div className="pt-4 border-t border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-400">
                  <span>Giá gốc theo tháng:</span>
                  <span className="line-through">{monthlyPreDiscount.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-300">Giá sau chiết khấu:</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-cyan-400">
                      {discountedMonthly.toLocaleString('vi-VN')} đ
                    </span>
                    <span className="text-xs text-slate-400 font-normal">/tháng</span>
                  </div>
                </div>

                {totalSaved > 0 && (
                  <div className="text-right text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 py-1.5 px-3 rounded-xl">
                    🎉 Tiết kiệm {totalSaved.toLocaleString('vi-VN')} đ khi trả trước {billingCycle.months} tháng!
                  </div>
                )}

                <div className="flex justify-between items-center text-xs text-slate-300 pt-2 border-t border-slate-800">
                  <span>Tổng tiền ({billingCycle.months} tháng):</span>
                  <span className="text-lg font-black text-white">
                    {totalAmount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-5 h-5" />
                  <span>Khởi Tạo &amp; Thanh Toán Ngay</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddToCart(false)}
                  className="w-full py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Thêm Vào Giỏ Hàng</span>
                </button>

                <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  Cam kết hoàn tiền 100% trong 7 ngày nếu không hài lòng
                </div>
              </div>

            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Cần Tham Khảo Thêm?</h4>
              <div className="space-y-2 text-xs">
                <Link href="/services/cloud-vps" className="flex items-center justify-between text-blue-600 font-bold hover:underline">
                  <span>Xem các gói Cloud VPS cấu hình sẵn</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/services/compare" className="flex items-center justify-between text-slate-600 hover:text-slate-900">
                  <span>Bảng so sánh chi tiết các loại dịch vụ</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/support" className="flex items-center justify-between text-slate-600 hover:text-slate-900">
                  <span>Liên hệ chuyên viên tư vấn hạ tầng</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

          </div>

        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">AMD EPYC 9654 Zen 4</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Vi xử lý máy chủ mạnh mẽ nhất hiện nay với 128 Cores 256 Threads, xung nhịp cao đáp ứng mượt mà database và ứng dụng nặng.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">NVMe PCIe Gen4 SSD</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Tốc độ đọc ghi dữ liệu vượt ngưỡng 7.000 MB/s cùng IOPS lên đến 500.000, cam kết không nghẽn cổ chai I/O.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2">Anti-DDoS 500Gbps</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lớp khiên chắn lọc tự động tại phần cứng Tier 3, ngăn chặn các cuộc tấn công SYN Flood, UDP Flood, HTTP Flood tức thì.
            </p>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-black text-slate-900">Câu Hỏi Thường Gặp Khi Tùy Chỉnh VPS</h3>
            <p className="text-xs text-slate-500 mt-1">Tất cả những thông tin bạn cần biết trước khi nâng cấp máy chủ</p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: 'Tôi có thể nâng cấp thêm CPU hoặc RAM sau khi đã mua không?',
                a: 'Hoàn toàn được! Hệ thống Cloud VPS của chúng tôi cho phép nâng cấp tài nguyên nóng (Hot-add) mà không làm gián đoạn hay mất dữ liệu của bạn.'
              },
              {
                q: 'Sau khi thanh toán xong thì bao lâu VPS sẽ hoạt động?',
                a: 'Hệ thống khởi tạo tự động 100%. Thông tin đăng nhập Root/Administrator và IP máy chủ sẽ được gửi qua email của bạn trong vòng 30 đến 60 giây sau khi thanh toán.'
              },
              {
                q: 'Tôi có toàn quyền quản trị máy chủ (Root access) không?',
                a: 'Có, bạn được cấp toàn quyền Root (đối với Linux) hoặc Administrator qua Remote Desktop (đối với Windows Server).'
              },
              {
                q: 'Chính sách hoàn tiền của CloudHost VN như thế nào?',
                a: 'Chúng tôi cam kết hoàn tiền 100% không cần lý do trong vòng 7 ngày đầu tiên nếu bạn không hài lòng về dịch vụ.'
              }
            ].map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 text-left font-bold text-xs text-slate-900 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                  >
                    <span>{item.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}
