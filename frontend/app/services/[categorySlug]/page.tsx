'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/src/lib/api';
import { resolveCategorySlug } from '@/src/lib/categorySlugs';
import { Cloud, Zap, ArrowRight, Loader2, Server } from 'lucide-react';
import CategoryPricingGrid from '@/components/CategoryPricingGrid';
import { Header } from '@/src/components/Header';
import ProductServiceReviews from '@/src/components/ProductServiceReviews';

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export default function CategoryLandingPage() {
  const { categorySlug } = useParams() as { categorySlug: string };
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isYearly, setIsYearly] = useState(true);

  useEffect(() => {
    async function loadCategory() {
      try {
        setIsLoading(true);
        // Find category from list
        const res = await api.get('/categories');
        const cats: Category[] = res.data ?? [];
        const canonicalSlug = resolveCategorySlug(categorySlug);
        const found = cats.find(c => c.slug === canonicalSlug || c.slug === categorySlug);
        
        if (found) {
          setCategory(found);
        } else {
          setError('Không tìm thấy danh mục này.');
        }
      } catch (err) {
        console.error(err);
        setError('Không thể tải thông tin danh mục.');
      } finally {
        setIsLoading(false);
      }
    }
    loadCategory();
  }, [categorySlug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-12 h-12 animate-spin text-[#1F1F1F]" />
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{error}</h1>
          <Link href="/services" className="text-[#1F1F1F] hover:underline">← Về danh sách dịch vụ</Link>
        </div>
      </div>
    );
  }

  return (
    <div>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/20 text-slate-200 text-xs font-bold uppercase tracking-wider mb-4">
            <Server className="w-3.5 h-3.5" />
            {category.name}
          </div>
          <h1 className="text-4xl sm:text-5xl font-black mb-6">{category.name}</h1>
          <p className="text-lg text-slate-200 max-w-2xl mx-auto mb-8">
            {category.description || 'Giải pháp tốt nhất cho nhu cầu của bạn, với hiệu năng cao và độ ổn định tuyệt đối.'}
          </p>
          <a href="#pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 font-bold text-base shadow-xl hover:shadow-2xl transition-all">
            <Zap className="w-5 h-5" />
            Xem Bảng Giá
          </a>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Bảng Giá {category.name}</h2>
            <p className="text-slate-600 mb-6">Chọn gói dịch vụ phù hợp nhất với nhu cầu của bạn.</p>
            
            {/* Billing Toggle */}
            <div className="inline-flex bg-white rounded-full p-1 border border-slate-200 shadow-sm">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                  !isYearly ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hàng Tháng
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-1.5 ${
                  isYearly ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Hàng Năm</span>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full">Giảm 20%</span>
              </button>
            </div>
          </div>

          <CategoryPricingGrid categorySlug={categorySlug} isYearly={isYearly} popularIndex={1} />
        </div>
      </section>
      
      {/* Product & Service Reviews */}
      <ProductServiceReviews 
        serviceName={category.name}
        serviceCategory={category.name}
      />

      <footer className="bg-white text-slate-600 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2024 CloudHost VN. Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
