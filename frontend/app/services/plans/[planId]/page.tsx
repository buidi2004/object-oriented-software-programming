'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/src/lib/api';
import { requestAuth } from '@/src/lib/authNavigation';
import { useCartStore } from '@/src/store/useCartStore';
import {
  Loader2, ArrowLeft, Server, Shield, Zap, Star, Cpu, HardDrive, Database, Wifi,
} from 'lucide-react';

interface PriceOption {
  billingCycle: 'Monthly' | 'Yearly' | number;
  price: number;
}

interface ServicePlanView {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  attributes: Record<string, string>;
  categoryId: string;
  categoryName: string;
  categorySlug: string;
  activePromotions: { discountPercent: number }[];
}

function categoryLandingPath(slug: string): string {
  const map: Record<string, string> = {
    'cloud-vps': '/services/cloud-vps',
    'web-hosting': '/services/hosting',
    'ten-mien': '/services/domain',
  };
  return map[slug] ?? '/services';
}

function pickPrice(prices: PriceOption[] | undefined, cycle: 'Monthly' | 'Yearly'): number {
  if (!prices?.length) return 0;
  const match = prices.find((p) =>
    cycle === 'Monthly'
      ? p.billingCycle === 'Monthly' || p.billingCycle === 1
      : p.billingCycle === 'Yearly' || p.billingCycle === 2
  );
  return match?.price ?? 0;
}

function mapApiPlan(data: Record<string, unknown>): ServicePlanView {
  const prices = (data.prices as PriceOption[] | undefined) ?? [];
  const monthlyFromApi = data.monthlyPrice as number | undefined;
  const yearlyFromApi = data.yearlyPrice as number | undefined;

  return {
    id: String(data.id ?? ''),
    name: String(data.name ?? 'Gói dịch vụ'),
    description: String(data.description ?? data.metaDescription ?? data.name ?? ''),
    monthlyPrice: monthlyFromApi ?? pickPrice(prices, 'Monthly'),
    yearlyPrice: yearlyFromApi ?? pickPrice(prices, 'Yearly'),
    attributes: {
      ...(data.cpu ? { cpu: String(data.cpu) } : {}),
      ...(data.ram ? { ram: String(data.ram) } : {}),
      ...(data.ssd ? { ssd: String(data.ssd) } : {}),
      ...(data.bandwidth ? { bandwidth: String(data.bandwidth) } : {}),
      ...((data.attributes as Record<string, string> | undefined) ?? {}),
    },
    categoryId: String(data.categoryId ?? ''),
    categoryName: String(data.categoryName ?? 'Dịch vụ'),
    categorySlug: String(data.categorySlug ?? ''),
    activePromotions: (data.activePromotions as { discountPercent: number }[] | undefined) ?? [],
  };
}

function PlanDetailInner() {
  const { planId } = useParams() as { planId: string };
  const [plan, setPlan] = useState<ServicePlanView | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(true);

  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    async function loadPlan() {
      try {
        setIsLoading(true);
        const [res, reviewsRes] = await Promise.allSettled([
          api.get(`/service-plans/${planId}`, { params: { currency: 'VND' } }),
          api.get(`/reviews/service-plan/${planId}`)
        ]);

        if (res.status === 'fulfilled' && res.value.data) {
          setPlan(mapApiPlan(res.value.data));
          const mapped = mapApiPlan(res.value.data);
          if (mapped.yearlyPrice > 0) setIsYearly(true);
          else if (mapped.monthlyPrice > 0) setIsYearly(false);
        }
        if (reviewsRes.status === 'fulfilled' && Array.isArray(reviewsRes.value.data)) {
          setReviews(reviewsRes.value.data);
        }
      } catch (err) {
        console.error(err);
        setError('Không tìm thấy thông tin gói dịch vụ.');
      } finally {
        setIsLoading(false);
      }
    }
    loadPlan();
  }, [planId]);

  const maxDiscount = useMemo(
    () => (plan?.activePromotions?.length
      ? Math.max(...plan.activePromotions.map((p) => p.discountPercent))
      : 0),
    [plan]
  );

  const handleBuy = async () => {
    if (!plan) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    if (!token) {
      requestAuth('login', `/services/plans/${planId}`);
      return;
    }

    try {
      await addItem(plan.id, isYearly ? 2 : 1, true);
      router.push('/cart');
    } catch (err) {
      console.error(err);
      alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{error}</h1>
          <Link href="/services" className="text-blue-600 hover:underline">← Quay lại danh sách dịch vụ</Link>
        </div>
      </div>
    );
  }

  const displayPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
            <Link href="/" className="hover:text-slate-700">Trang chủ</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-slate-700">Dịch vụ</Link>
            {plan.categorySlug && (
              <>
                <span>/</span>
                <Link href={categoryLandingPath(plan.categorySlug)} className="hover:text-slate-700">
                  {plan.categoryName}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-slate-900 font-medium">{plan.name}</span>
          </nav>
        </div>
      </div>

      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">Chi tiết gói dịch vụ</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Server className="w-64 h-64" />
            </div>
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
                <Zap className="w-3.5 h-3.5" />
                {plan.categoryName}
              </div>
              <h2 className="text-4xl font-black mb-4">{plan.name}</h2>
              <p className="text-lg text-blue-100 max-w-xl">{plan.description}</p>
              {maxDiscount > 0 && (
                <p className="mt-3 text-emerald-300 font-semibold">Đang giảm {maxDiscount}% — ưu đãi có hạn</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="p-10 border-r border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Thông số kỹ thuật
              </h3>
              <ul className="space-y-4">
                {Object.entries(plan.attributes).map(([key, value]) => (
                  <li key={key} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-600 capitalize flex items-center gap-2">
                      {key === 'cpu' && <Cpu className="w-4 h-4 text-blue-500" />}
                      {key === 'ram' && <Database className="w-4 h-4 text-blue-500" />}
                      {key === 'ssd' && <HardDrive className="w-4 h-4 text-blue-500" />}
                      {key === 'bandwidth' && <Wifi className="w-4 h-4 text-blue-500" />}
                      {key.replace(/_/g, ' ')}
                    </span>
                    <span className="font-semibold text-slate-900">{value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-10 bg-slate-50/50 flex flex-col justify-center">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center mb-8">
                {plan.monthlyPrice > 0 && plan.yearlyPrice > 0 && (
                  <div className="inline-flex bg-slate-100 rounded-lg p-1 mb-6">
                    <button
                      onClick={() => setIsYearly(false)}
                      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${!isYearly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      Hàng tháng
                    </button>
                    <button
                      onClick={() => setIsYearly(true)}
                      className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${isYearly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
                    >
                      Hàng năm
                    </button>
                  </div>
                )}

                <div className="text-sm text-slate-500 mb-2">
                  Giá thanh toán {isYearly ? 'hàng năm' : 'hàng tháng'}
                </div>
                <div className="text-4xl font-black text-blue-600 mb-2">
                  {displayPrice.toLocaleString('vi-VN')}đ
                </div>
                {isYearly && plan.monthlyPrice > 0 && plan.yearlyPrice > 0 && (
                  <div className="text-sm font-semibold text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full inline-block">
                    Tiết kiệm {(plan.monthlyPrice * 12 - plan.yearlyPrice).toLocaleString('vi-VN')}đ/năm
                  </div>
                )}
              </div>

              <button
                onClick={handleBuy}
                className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                Thêm vào giỏ hàng
                <Star className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function PlanDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      }
    >
      <PlanDetailInner />
    </Suspense>
  );
}
