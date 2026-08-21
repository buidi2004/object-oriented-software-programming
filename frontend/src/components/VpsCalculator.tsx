'use client';

import React, { useState } from 'react';
import { Server, Check, ArrowRight, Zap, ShieldCheck, Wifi } from 'lucide-react';
import { OS_OPTIONS, DATACENTER_LOCATIONS } from '../data/mockData';
import {
  OsTemplateIcon,
  DatacenterLocationIcon,
  ResourceIcon,
} from './icons/VpsConfigIcons';
import {
  TierRangeSlider,
  VPS_CPU_TIERS,
  VPS_RAM_TIERS,
  VPS_DISK_TIERS,
} from './vps/TierRangeSlider';

interface VpsCalculatorProps {
  onAddToCart: (item: {
    id: string;
    type: 'vps';
    title: string;
    details: string;
    price: number;
    billingCycle: string;
  }) => void;
  onViewDetails?: (planId: string) => void;
}

export const VpsCalculator: React.FC<VpsCalculatorProps> = ({ onAddToCart, onViewDetails }) => {
  const [cpu, setCpu] = useState(4);
  const [ram, setRam] = useState(8);
  const [disk, setDisk] = useState(80);
  const [os, setOs] = useState(OS_OPTIONS[0].name);
  const [datacenter, setDatacenter] = useState(DATACENTER_LOCATIONS[0].name);
  const [billingMonths, setBillingMonths] = useState<number>(12);

  const selectedOs = OS_OPTIONS.find((o) => o.name === os);
  const selectedDc = DATACENTER_LOCATIONS.find((d) => d.name === datacenter);

  const baseCpuCost = 45000;
  const baseRamCost = 35000;
  const baseDiskCost = 1500;
  const baseSystemFee = 50000;

  const monthlyTotal = (cpu * baseCpuCost) + (ram * baseRamCost) + (disk * baseDiskCost) + baseSystemFee;

  let discountRate = 0;
  if (billingMonths === 6) discountRate = 0.10;
  if (billingMonths === 12) discountRate = 0.20;
  if (billingMonths === 24) discountRate = 0.30;

  const discountedMonthlyPrice = Math.round(monthlyTotal * (1 - discountRate));
  const finalTotalPrice = discountedMonthlyPrice * billingMonths;

  const handleOrder = () => {
    onAddToCart({
      id: `vps-custom-${Date.now()}`,
      type: 'vps',
      title: `Cloud VPS Custom (${cpu} vCPU, ${ram}GB RAM, ${disk}GB NVMe)`,
      details: `Hệ điều hành: ${os} | Datacenter: ${datacenter}`,
      price: discountedMonthlyPrice * billingMonths,
      billingCycle: `${billingMonths} tháng`,
    });
  };

  return (
    <section id="vps-calculator-section" className="py-16 bg-slate-50/70 border-b border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Server className="w-3.5 h-3.5" />
            Cấu Hình Tự Chọn
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tùy Chỉnh Máy Chủ Cloud VPS Của Bạn
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mt-2">
            Linh hoạt tùy chỉnh tài nguyên CPU, RAM, NVMe SSD theo nhu cầu thực tế. Khởi tạo tức thì trong 30 giây.
          </p>
          <a href="/services/cloud-vps" className="inline-flex items-center gap-1.5 mt-4 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Xem chi tiết tất cả gói VPS →
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xl space-y-8">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-0 mb-3">
                <label className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ResourceIcon type="cpu" />
                  Vi Xử Lý (CPU Cores):
                </label>
                <span className="text-sm sm:text-lg font-black text-blue-600 bg-blue-50 px-2.5 sm:px-3 py-1 rounded-xl w-fit">
                  {cpu} vCPU Core (AMD EPYC)
                </span>
              </div>
              <TierRangeSlider
                tiers={VPS_CPU_TIERS}
                value={cpu}
                onChange={setCpu}
                accent="blue"
                formatMark={(v) => `${v} vCPU`}
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-0 mb-3">
                <label className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ResourceIcon type="ram" />
                  Bộ Nhớ (RAM DDR5):
                </label>
                <span className="text-sm sm:text-lg font-black text-indigo-600 bg-indigo-50 px-2.5 sm:px-3 py-1 rounded-xl w-fit">
                  {ram} GB RAM
                </span>
              </div>
              <TierRangeSlider
                tiers={VPS_RAM_TIERS}
                value={ram}
                onChange={setRam}
                accent="indigo"
                formatMark={(v) => `${v} GB`}
              />
            </div>

            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1.5 sm:gap-0 mb-3">
                <label className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <ResourceIcon type="disk" />
                  Ổ Cứng Enterprise NVMe SSD:
                </label>
                <span className="text-sm sm:text-lg font-black text-cyan-600 bg-cyan-50 px-2.5 sm:px-3 py-1 rounded-xl w-fit">
                  {disk} GB NVMe Raid 10
                </span>
              </div>
              <TierRangeSlider
                tiers={VPS_DISK_TIERS}
                value={disk}
                onChange={setDisk}
                accent="cyan"
                formatMark={(v) => `${v} GB`}
              />
            </div>

            <div>
              <label className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 mb-3">
                <ResourceIcon type="os" />
                Hệ Điều Hành (OS Templates):
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-stretch">
                {OS_OPTIONS.map((item) => {
                  const selected = os === item.name;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOs(item.name)}
                      className={`h-full min-h-[4.5rem] p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        selected
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 font-bold shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <OsTemplateIcon os={item.osKey} size="sm" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-bold leading-tight">{item.name}</span>
                          <span className={`text-[10px] font-semibold ${selected ? 'text-blue-600' : 'text-slate-400'}`}>
                            {item.type}
                          </span>
                        </span>
                        {selected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 mb-3">
                <ResourceIcon type="datacenter" />
                Vị Trí Trung Tâm Dữ Liệu (Datacenter Tier III):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch">
                {DATACENTER_LOCATIONS.map((loc) => {
                  const selected = datacenter === loc.name;
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setDatacenter(loc.name)}
                      className={`h-full min-h-[5.5rem] p-3.5 rounded-2xl border text-left flex flex-col transition-all cursor-pointer ${
                        selected
                          ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <DatacenterLocationIcon region={loc.region} />
                        <div className="flex-1 min-w-0 flex flex-col justify-between gap-1">
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-bold text-slate-900 leading-tight">{loc.shortLabel}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 shrink-0 whitespace-nowrap">
                              {loc.latency}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 leading-snug line-clamp-2">{loc.detail}</div>
                        </div>
                        {selected && <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white text-slate-900 p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200 space-y-6 sticky top-28">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <span className="text-xs font-extrabold tracking-wider uppercase text-cyan-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-cyan-400" />
                Cấu Hình Đã Chọn
              </span>
              <span className="text-xs text-slate-600">Khởi tạo 30s</span>
            </div>

            <ul className="space-y-3 text-sm text-slate-700 font-medium">
              <li className="flex justify-between items-center gap-2">
                <span className="text-slate-600 flex items-center gap-1.5"><ResourceIcon type="cpu" className="!w-7 !h-7 !rounded-lg" /> CPU:</span>
                <span className="font-bold text-slate-900">{cpu} vCPU Core</span>
              </li>
              <li className="flex justify-between items-center gap-2">
                <span className="text-slate-600 flex items-center gap-1.5"><ResourceIcon type="ram" className="!w-7 !h-7 !rounded-lg" /> RAM:</span>
                <span className="font-bold text-slate-900">{ram} GB DDR5</span>
              </li>
              <li className="flex justify-between items-center gap-2">
                <span className="text-slate-600 flex items-center gap-1.5"><ResourceIcon type="disk" className="!w-7 !h-7 !rounded-lg" /> SSD:</span>
                <span className="font-bold text-slate-900">{disk} GB NVMe</span>
              </li>
              <li className="flex justify-between items-center gap-2">
                <span className="text-slate-600 flex items-center gap-1.5"><ResourceIcon type="network" className="!w-7 !h-7 !rounded-lg" /> BW:</span>
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  <Wifi className="w-3.5 h-3.5" /> Không giới hạn
                </span>
              </li>
              <li className="flex justify-between items-center gap-2">
                <span className="text-slate-600 flex items-center gap-1.5">
                  {selectedOs && <OsTemplateIcon os={selectedOs.osKey} size="sm" className="!rounded-lg" />}
                  OS:
                </span>
                <span className="font-bold text-slate-900 truncate max-w-[140px] text-right">{os}</span>
              </li>
              <li className="flex justify-between items-center gap-2">
                <span className="text-slate-600 flex items-center gap-1.5">
                  {selectedDc && <DatacenterLocationIcon region={selectedDc.region} />}
                  DC:
                </span>
                <span className="font-bold text-slate-900 text-right">{selectedDc?.shortLabel ?? datacenter}</span>
              </li>
            </ul>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
                Chu Kỳ Thanh Toán:
              </label>
              <div className="grid grid-cols-4 gap-1.5 p-1.5 pt-3 bg-white rounded-xl">
                {[
                  { m: 1, label: '1 T' },
                  { m: 6, label: '6 T', badge: '-10%' },
                  { m: 12, label: '12 T', badge: '-20%' },
                  { m: 24, label: '24 T', badge: '-30%' },
                ].map((cycle) => (
                  <div key={cycle.m} className="relative">
                    <button
                      type="button"
                      onClick={() => setBillingMonths(cycle.m)}
                      className={`w-full py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                        billingMonths === cycle.m
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                      }`}
                    >
                      {cycle.label}
                    </button>
                    {cycle.badge && (
                      <span className="pointer-events-none absolute -top-2.5 right-0 translate-x-1/4 z-10 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full leading-none whitespace-nowrap shadow-sm">
                        {cycle.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 space-y-1">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-600 font-semibold">Giá mỗi tháng:</span>
                <span className="text-2xl font-black text-cyan-300">
                  {discountedMonthlyPrice.toLocaleString('vi-VN')} đ
                  <span className="text-xs text-slate-600 font-normal">/tháng</span>
                </span>
              </div>

              {discountRate > 0 && (
                <div className="text-right text-xs text-emerald-400 font-bold">
                  Tiết kiệm {Math.round(discountRate * 100)}% khi thanh toán {billingMonths} tháng
                </div>
              )}

              <div className="flex justify-between items-center text-xs text-slate-600 pt-2">
                <span>Tổng thanh toán ({billingMonths} tháng):</span>
                <span className="font-bold text-slate-900 text-sm">
                  {finalTotalPrice.toLocaleString('vi-VN')} đ
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onViewDetails?.('vps-custom')}
                className="w-full py-3 rounded-xl border-2 border-blue-500 text-blue-400 font-bold text-sm hover:bg-blue-500/10 transition-colors"
              >
                Xem chi tiết VPS
              </button>
              <button
                onClick={handleOrder}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-900 font-extrabold text-base shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Khởi Tạo Cloud VPS Ngay</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <div className="text-center text-[11px] text-slate-600 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                Cam kết hoàn tiền trong 7 ngày nếu không hài lòng
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
