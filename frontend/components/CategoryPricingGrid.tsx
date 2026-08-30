'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Cpu, HardDrive, Database, Wifi, QrCode, X } from 'lucide-react';
import { api } from '@/src/lib/api';

export interface CategoryPlanCard {
  id: string;
  name: string;
  cpu?: string | null;
  ram?: string | null;
  ssd?: string | null;
  bandwidth?: string | null;
  monthlyPrice?: number | null;
  yearlyPrice?: number | null;
  currency: string;
}

interface CategoryPricingGridProps {
  categorySlug: string;
  isYearly: boolean;
  popularIndex?: number;
  accentClass?: string;
}

function buildFeatures(plan: CategoryPlanCard): string[] {
  return [plan.cpu, plan.ram, plan.ssd, plan.bandwidth].filter(Boolean) as string[];
}

export default function CategoryPricingGrid({
  categorySlug,
  isYearly,
  popularIndex = 1,
  accentClass = 'border-black shadow-xl shadow-black/10',
}: CategoryPricingGridProps) {
  const [plans, setPlans] = useState<CategoryPlanCard[]>([]);
  const [activeTab, setActiveTab] = useState<'starter' | 'professional' | 'enterprise'>('starter');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // QR Code Modal State
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentQrCode, setCurrentQrCode] = useState<string>('');
  const [isQrLoading, setIsQrLoading] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState<string>('');

  const openQrModal = async (plan: CategoryPlanCard) => {
    setShowQrModal(true);
    setIsQrLoading(true);
    setSelectedPlanName(plan.name);
    try {
      const res = await api.get(`/service-plans/${plan.id}/qrcode`);
      setCurrentQrCode(res.data.qrCode);
    } catch (err) {
      console.error('Failed to load QR code', err);
      setCurrentQrCode('');
    } finally {
      setIsQrLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await api.get(`/categories/${categorySlug}/plans`, {
          params: { currency: 'VND' },
        });
        if (!cancelled) {
          setPlans(response.data?.plans ?? []);
        }
      } catch {
        if (!cancelled) {
          setError('Không thể tải bảng giá. Vui lòng thử lại sau.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 py-8">{error}</p>;
  }

  if (plans.length === 0) {
    return <p className="text-center text-zinc-500 py-8">Chưa có gói dịch vụ trong danh mục này.</p>;
  }

  // Divide plans into 3 tabs
  const tabGroups = {
    starter: plans.slice(0, 3),
    professional: plans.slice(3, 6),
    enterprise: plans.slice(6),
  };
  const activePlans = tabGroups[activeTab] || plans;

  return (
    <div className="flex flex-col items-center">
      {/* Tabs Navigation */}
      {plans.length > 3 && (
        <div className="inline-flex bg-zinc-100 p-1 rounded-full mb-10 border border-zinc-200">
          <button
            onClick={() => setActiveTab('starter')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'starter' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Cơ bản
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'professional' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Nâng cao
          </button>
          <button
            onClick={() => setActiveTab('enterprise')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'enterprise' ? 'bg-black text-white shadow-sm' : 'text-zinc-600 hover:text-black'
            }`}
          >
            Chuyên nghiệp
          </button>
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-8 w-full ${
          activePlans.length >= 2 ? 'md:grid-cols-2' : ''
        } ${activePlans.length >= 3 ? 'lg:grid-cols-3' : ''}`}
      >
        {activePlans.map((plan) => {
          const monthly = plan.monthlyPrice ?? null;
          const yearly = plan.yearlyPrice ?? null;
          const displayPrice = isYearly
            ? (yearly ?? (monthly != null ? monthly * 12 : 0))
            : (monthly ?? (yearly != null ? Math.round(yearly / 12) : 0));
          
          // Find original index to determine if it's popular
          const originalIndex = plans.findIndex(p => p.id === plan.id);
          const isPopular = originalIndex === popularIndex;
          const features = buildFeatures(plan);

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-8 border-2 transition-all relative flex flex-col justify-between ${
                isPopular ? `${accentClass} scale-105 min-h-[420px] z-10` : 'border-zinc-200 hover:border-black hover:shadow-lg'
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-black px-4 py-1 rounded-full uppercase tracking-wider shadow-sm">
                  Phổ biến nhất
                </div>
              )}

              <h3 className="text-xl font-black text-black mb-4">{plan.name}</h3>

              <div className="space-y-2 mb-6">
                {plan.cpu && (
                  <div className="flex items-center gap-2 text-sm text-zinc-700 font-medium">
                    <Cpu className="w-4 h-4 text-black" /> {plan.cpu}
                  </div>
                )}
                {plan.ram && (
                  <div className="flex items-center gap-2 text-sm text-zinc-700 font-medium">
                    <Database className="w-4 h-4 text-black" /> {plan.ram}
                  </div>
                )}
                {plan.ssd && (
                  <div className="flex items-center gap-2 text-sm text-zinc-700 font-medium">
                    <HardDrive className="w-4 h-4 text-black" /> {plan.ssd}
                  </div>
                )}
                {plan.bandwidth && (
                  <div className="flex items-center gap-2 text-sm text-zinc-700 font-medium">
                    <Wifi className="w-4 h-4 text-black" /> {plan.bandwidth}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-black text-black">
                    {displayPrice.toLocaleString('vi-VN')}
                  </span>
                  <span className="text-sm font-bold text-zinc-500 mb-1">
                    đ/{isYearly ? 'năm' : 'tháng'}
                  </span>
                </div>
                {isYearly && monthly != null && yearly != null && (
                  <div className="text-xs text-zinc-700 font-bold mt-1">
                    Tiết kiệm {(monthly * 12 - yearly).toLocaleString('vi-VN')} đ/năm
                  </div>
                )}
              </div>

              <div className="space-y-2 mb-8">
                {features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-black shrink-0" />
                    <span className="text-sm text-zinc-800">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href={`/services/plans/${plan.id}`}
                className={`block w-full py-3.5 rounded-2xl font-bold text-sm text-center transition-all ${
                  isPopular
                    ? 'bg-black hover:bg-zinc-800 text-white shadow-lg'
                    : 'bg-zinc-100 hover:bg-black text-zinc-900 hover:text-white border border-zinc-200'
                }`}
              >
                Xem chi tiết &amp; Đặt mua
              </Link>
              
              <button
                onClick={() => openQrModal(plan)}
                className={`mt-3 w-full py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                  isPopular
                    ? 'bg-zinc-800/20 hover:bg-zinc-800/40 text-zinc-800 border border-zinc-800/30'
                    : 'bg-zinc-50 hover:bg-zinc-200 text-zinc-600 border border-zinc-200'
                }`}
              >
                <QrCode className="w-4 h-4" />
                Quét mã QR
              </button>
            </div>
          );
        })}
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-zinc-100">
              <h3 className="font-bold text-lg text-zinc-900">Mã QR Gói {selectedPlanName}</h3>
              <button 
                onClick={() => setShowQrModal(false)}
                className="p-1 hover:bg-zinc-100 rounded-full text-zinc-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 flex flex-col items-center justify-center min-h-[250px]">
              {isQrLoading ? (
                <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin" />
              ) : currentQrCode ? (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm mb-4">
                    <img src={currentQrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-sm text-zinc-500 text-center">
                    Sử dụng điện thoại quét mã QR để mở trang chi tiết và đặt hàng gói dịch vụ này.
                  </p>
                </div>
              ) : (
                <p className="text-red-500 text-sm">Không thể tải mã QR</p>
              )}
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex justify-end">
              <button 
                onClick={() => setShowQrModal(false)}
                className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-sm font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
