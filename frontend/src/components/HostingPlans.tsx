'use client';

import React, { useState } from 'react';
import { Globe, CheckCircle2, Zap, Shield, Server, ArrowRight } from 'lucide-react';
import { HOSTING_PACKAGES } from '../data/mockData';

interface HostingPlansProps {
  onAddToCart: (item: {
    id: string;
    type: 'hosting';
    title: string;
    details: string;
    price: number;
    billingCycle: string;
  }) => void;
  onViewDetails?: (planId: string) => void;
}

export const HostingPlans: React.FC<HostingPlansProps> = ({ onAddToCart, onViewDetails }) => {
  const [isYearly, setIsYearly] = useState(true);

  const handleSelectPackage = (pkg: typeof HOSTING_PACKAGES[0]) => {
    const monthlyRate = isYearly ? pkg.yearlyPriceMonthly : pkg.monthlyPrice;
    const durationMonths = isYearly ? 12 : 1;
    const totalPrice = monthlyRate * durationMonths;

    onAddToCart({
      id: `hosting-${pkg.id}-${Date.now()}`,
      type: 'hosting',
      title: pkg.name,
      details: `${pkg.specs.storage} | ${pkg.specs.domains} | ${pkg.specs.ram}`,
      price: totalPrice,
      billingCycle: isYearly ? '12 tháng (Tiết kiệm 25%)' : '1 tháng'
    });
  };

  return (
    <section id="hosting-plans-section" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            NVMe Web Hosting
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Gói Hosting NVMe Tốc Độ Cao Cho Website
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Tối ưu 100% cho WordPress, WooCommerce & Laravel. Tích hợp LiteSpeed Web Server + LSCache tăng tốc x10.
          </p>

          {/* Billing Switch */}
          <div className="mt-6 inline-flex items-center gap-3 p-1.5 bg-slate-100 rounded-full border border-slate-200">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-extrabold transition-all cursor-pointer ${
                !isYearly ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Thanh Toán Hàng Tháng
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                isYearly ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Thanh Toán Theo Năm</span>
              <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                Giảm 25%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {HOSTING_PACKAGES.map((pkg) => {
            const displayPrice = isYearly ? pkg.yearlyPriceMonthly : pkg.monthlyPrice;

            return (
              <div
                key={pkg.id}
                className={`relative rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 ${
                  pkg.isPopular
                    ? 'bg-slate-900 text-white shadow-2xl ring-2 ring-blue-500 scale-105 z-10'
                    : 'bg-white text-slate-900 border border-slate-200 hover:border-blue-300 hover:shadow-xl'
                }`}
              >
                {pkg.isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm font-black px-5 py-1.5 rounded-full uppercase tracking-wider shadow-md">
                    Khuyên Dùng Nhiều Nhất
                  </div>
                )}

                <div>
                  <h3 className="text-2xl font-extrabold tracking-tight">{pkg.name}</h3>
                  <p className={`text-sm mt-2 leading-relaxed min-h-[32px] ${pkg.isPopular ? 'text-slate-700' : 'text-slate-500'}`}>
                    {pkg.tagline}
                  </p>

                  {/* Price */}
                  <div className="mt-6 mb-6 pb-6 border-b border-slate-200/20">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl sm:text-4xl font-black tracking-tight text-blue-500">
                        {displayPrice.toLocaleString('vi-VN')} đ
                      </span>
                      <span className={`text-sm font-bold ${pkg.isPopular ? 'text-slate-700' : 'text-slate-500'}`}>
                        /tháng
                      </span>
                    </div>
                    {isYearly && (
                      <div className="text-sm text-emerald-500 font-bold mt-1">
                        Thanh toán theo năm: {(displayPrice * 12).toLocaleString('vi-VN')} đ/năm
                      </div>
                    )}
                  </div>

                  {/* Core Specs */}
                  <div className="space-y-3 mb-6 text-base font-semibold">
                    <div className="flex items-center gap-2.5">
                      <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{pkg.specs.storage}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{pkg.specs.domains}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{pkg.specs.ram} • {pkg.specs.cpu}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{pkg.specs.ssl}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="space-y-3 border-t pt-6 border-slate-200/20 text-sm font-medium leading-relaxed">
                    {pkg.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${pkg.isPopular ? 'text-cyan-400' : 'text-blue-600'}`} />
                        <span className={pkg.isPopular ? 'text-slate-300' : 'text-slate-600'}>{feat}</span>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Action Buttons */}
                <div className="mt-8 space-y-3">
                  <a
                    href="/services/hosting"
                    className="block w-full py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-bold text-base hover:bg-slate-50 transition-colors text-center"
                  >
                    Xem chi tiết
                  </a>
                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    className={`w-full py-3.5 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      pkg.isPopular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                        : 'bg-slate-900 hover:bg-slate-800 text-white shadow-md'
                    }`}
                  >
                    <span>Thêm vào giỏ hàng</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
