'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/src/lib/api';
import { Check, X, Server, Loader2, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { useRouter } from 'next/navigation';

interface ServicePlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  attributes: Record<string, string>;
}

export default function ComparePlansPage() {
  const searchParams = useSearchParams();
  const planIds = searchParams.get('plans')?.split(',') || [];
  
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(true);
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function loadPlans() {
      if (planIds.length === 0) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        // Load details for each plan
        const results = await Promise.all(
          planIds.map(id => api.get(`/service-plans/${id}`).then(res => res.data))
        );
        setPlans(results.filter(Boolean));
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPlans();
  }, [searchParams]);

  const handleBuy = async (plan: ServicePlan) => {
    try {
      await addItem(plan.id, isYearly ? 12 : 1, true);
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

  if (plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Chưa chọn gói dịch vụ nào để so sánh</h1>
          <Link href="/services" className="text-blue-600 hover:underline">← Về trang dịch vụ</Link>
        </div>
      </div>
    );
  }

  // Get all unique attribute keys
  const allAttributes = Array.from(new Set(plans.flatMap(p => Object.keys(p.attributes || {}))));

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">So Sánh Dịch Vụ</h1>
          </div>
          
          <div className="inline-flex bg-slate-100 rounded-lg p-1">
            <button onClick={() => setIsYearly(false)} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${!isYearly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
              Hàng tháng
            </button>
            <button onClick={() => setIsYearly(true)} className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${isYearly ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
              Hàng năm
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-6 border-b border-slate-200 bg-slate-50 min-w-[200px]">
                  <span className="text-slate-500 font-medium">Tính năng / Gói</span>
                </th>
                {plans.map(plan => (
                  <th key={plan.id} className="p-6 border-b border-l border-slate-200 bg-white min-w-[250px] text-center">
                    <div className="w-12 h-12 mx-auto bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3">
                      <Server className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{plan.name}</h3>
                    <div className="text-2xl font-black text-blue-600 mb-4">
                      {(isYearly ? plan.yearlyPrice : plan.monthlyPrice).toLocaleString('vi-VN')}đ
                      <span className="text-sm font-normal text-slate-500">/{isYearly ? 'năm' : 'tháng'}</span>
                    </div>
                    <button
                      onClick={() => handleBuy(plan)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
                    >
                      Đăng Ký Ngay
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allAttributes.map((attr, index) => (
                <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 border-b border-slate-100 font-medium text-slate-700 capitalize">
                    {attr.replace(/_/g, ' ')}
                  </td>
                  {plans.map(plan => {
                    const val = plan.attributes?.[attr];
                    const isBool = val === 'true' || val === 'false';
                    
                    return (
                      <td key={plan.id} className="p-4 border-b border-l border-slate-100 text-center text-slate-600">
                        {isBool ? (
                          val === 'true' ? <Check className="w-5 h-5 text-emerald-500 mx-auto" /> : <X className="w-5 h-5 text-slate-700 mx-auto" />
                        ) : (
                          val || '-'
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
