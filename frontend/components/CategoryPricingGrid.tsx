'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Cpu, HardDrive, Database, Wifi } from 'lucide-react';
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
  accentClass = 'border-blue-600 shadow-xl shadow-blue-600/10',
}: CategoryPricingGridProps) {
  const [plans, setPlans] = useState<CategoryPlanCard[]>([]);
  const [activeTab, setActiveTab] = useState<'starter' | 'professional' | 'enterprise'>('starter');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-600 py-8">{error}</p>;
  }

  if (plans.length === 0) {
    return <p className="text-center text-slate-500 py-8">Chưa có gói dịch vụ trong danh mục này.</p>;
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
        <div className="inline-flex bg-slate-100 p-1 rounded-full mb-10 border border-slate-200">
          <button
            onClick={() => setActiveTab('starter')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'starter' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Cơ bản
          </button>
          <button
            onClick={() => setActiveTab('professional')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'professional' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Nâng cao
          </button>
          <button
            onClick={() => setActiveTab('enterprise')}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
              activeTab === 'enterprise' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
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
        {activePlans.map((plan, index) => {
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
              isPopular ? `${accentClass} scale-105 min-h-[420px] z-10` : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}
          >
            {isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black px-4 py-1 rounded-full uppercase">
                Phổ biến nhất
              </div>
            )}

            <h3 className="text-xl font-black text-slate-900 mb-4">{plan.name}</h3>

            <div className="space-y-2 mb-6">
              {plan.cpu && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Cpu className="w-4 h-4 text-blue-500" /> {plan.cpu}
                </div>
              )}
              {plan.ram && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Database className="w-4 h-4 text-blue-500" /> {plan.ram}
                </div>
              )}
              {plan.ssd && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <HardDrive className="w-4 h-4 text-blue-500" /> {plan.ssd}
                </div>
              )}
              {plan.bandwidth && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Wifi className="w-4 h-4 text-blue-500" /> {plan.bandwidth}
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-end gap-1">
                <span className="text-4xl font-black text-slate-900">
                  {displayPrice.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm font-bold text-slate-500 mb-1">
                  đ/{isYearly ? 'năm' : 'tháng'}
                </span>
              </div>
              {isYearly && monthly != null && yearly != null && (
                <div className="text-xs text-emerald-600 mt-1">
                  Tiết kiệm {(monthly * 12 - yearly).toLocaleString('vi-VN')} đ/năm
                </div>
              )}
            </div>

            <div className="space-y-2 mb-8">
              {features.map((feature) => (
                <div key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="text-sm text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href={`/services/plans/${plan.id}`}
              className={`block w-full py-3.5 rounded-2xl font-bold text-sm text-center transition-all ${
                isPopular
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'bg-slate-900 hover:bg-slate-800 text-white'
              }`}
            >
              Xem chi tiết &amp; Đặt mua
            </Link>
          </div>
        );
      })}
      </div>
    </div>
  );
}
