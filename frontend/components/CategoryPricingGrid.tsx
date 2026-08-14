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
  accentClass = 'border-blue-500 shadow-xl shadow-blue-500/10',
}: CategoryPricingGridProps) {
  const [plans, setPlans] = useState<CategoryPlanCard[]>([]);
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

  return (
    <div
      className={`grid grid-cols-1 gap-8 ${
        plans.length >= 2 ? 'md:grid-cols-2' : ''
      } ${plans.length >= 3 ? 'lg:grid-cols-3' : ''}`}
    >
      {plans.map((plan, index) => {
        const monthly = plan.monthlyPrice ?? null;
        const yearly = plan.yearlyPrice ?? null;
        const displayPrice = isYearly
          ? (yearly ?? (monthly != null ? monthly * 12 : 0))
          : (monthly ?? (yearly != null ? Math.round(yearly / 12) : 0));
        const isPopular = index === popularIndex;
        const features = buildFeatures(plan);

        return (
          <div
            key={plan.id}
            className={`bg-white rounded-3xl p-8 border-2 transition-all relative ${
              isPopular ? `${accentClass} scale-[1.02]` : 'border-slate-200 hover:border-blue-300 hover:shadow-lg'
            }`}
          >
            {isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 text-xs font-black px-4 py-1 rounded-full uppercase">
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
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              Xem chi tiết &amp; Đặt mua
            </Link>
          </div>
        );
      })}
    </div>
  );
}
