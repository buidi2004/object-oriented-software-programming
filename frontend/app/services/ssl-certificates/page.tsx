'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, CheckCircle2, Server, Globe, Shield, ArrowRight, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SslServicePage() {
  const router = useRouter();

  const sslPlans = [
    {
      id: 'ssl-dv',
      name: 'Domain Validation (DV)',
      description: 'Lý tưởng cho blog và website cá nhân. Xác thực nhanh trong vài phút.',
      price: 150000,
      features: [
        'Mã hóa 256-bit',
        'Xác thực tên miền (DV)',
        'Bảo hiểm $10,000',
        'Cấp phát trong 5 phút',
        'Hỗ trợ cài đặt miễn phí'
      ],
      popular: false
    },
    {
      id: 'ssl-ov',
      name: 'Organization Validation (OV)',
      description: 'Phù hợp cho doanh nghiệp vừa và nhỏ, nâng cao mức độ tin cậy.',
      price: 650000,
      features: [
        'Mã hóa 256-bit',
        'Xác thực doanh nghiệp (OV)',
        'Hiển thị tên công ty trên chứng chỉ',
        'Bảo hiểm $50,000',
        'Kèm Trust Seal'
      ],
      popular: true
    },
    {
      id: 'ssl-ev',
      name: 'Extended Validation (EV)',
      description: 'Bảo mật cao nhất, phù hợp cho ngân hàng và trang thương mại điện tử lớn.',
      price: 1500000,
      features: [
        'Mã hóa 256-bit',
        'Thanh địa chỉ màu xanh (Green Bar)',
        'Xác thực pháp nhân nghiêm ngặt',
        'Bảo hiểm $1,750,000',
        'Tăng tối đa độ tin cậy'
      ],
      popular: false
    }
  ];

  const handleBuy = (plan: any) => {
    // In a real flow, this would add to cart or directly checkout.
    // We mock adding to cart and redirecting to checkout.
    alert(`Đã thêm ${plan.name} vào giỏ hàng! (Mock)`);
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/40 to-slate-900/80 mix-blend-multiply"></div>
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-3xl opacity-50 mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-slate-900 to-transparent"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-sm mb-6">
            <ShieldCheck className="w-4 h-4" /> Chứng chỉ SSL uy tín toàn cầu
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight mb-8">
            Bảo mật tối đa, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">tăng uy tín</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-10 leading-relaxed">
            Mã hóa dữ liệu, bảo vệ khách hàng và tăng thứ hạng SEO với chứng chỉ SSL tốt nhất từ các nhà cung cấp hàng đầu.
          </p>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 -mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {sslPlans.map((plan) => (
              <div 
                key={plan.id} 
                className={`bg-white rounded-3xl p-8 border-2 transition-all duration-300 ${
                  plan.popular 
                    ? 'border-emerald-500 shadow-xl shadow-emerald-500/10 md:-translate-y-4' 
                    : 'border-slate-200 hover:border-emerald-200 hover:shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-xs font-bold uppercase tracking-wider mb-4">
                    <Star className="w-3 h-3 fill-current" /> Khuyên dùng
                  </div>
                )}
                <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.name}</h3>
                <p className="text-slate-500 text-sm mb-6 min-h-[40px]">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-4xl font-black text-slate-900">
                    {(plan.price / 1000).toFixed(0)}K
                  </span>
                  <span className="text-slate-500 font-medium">/năm</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleBuy(plan)}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white shadow-lg shadow-emerald-500/25'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  Mua ngay <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Tại sao nên mua SSL tại CloudHost VN?</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Chúng tôi mang đến giải pháp bảo mật toàn diện với mức giá tốt nhất.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Mã hóa mạnh mẽ</h3>
              <p className="text-slate-600">Sử dụng thuật toán mã hóa SHA-256 mới nhất, đảm bảo dữ liệu truyền tải an toàn tuyệt đối.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tăng thứ hạng SEO</h3>
              <p className="text-slate-600">Google ưu tiên các website sử dụng HTTPS. Mua SSL là bước đầu tiên để SEO hiệu quả.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tương thích 99.9%</h3>
              <p className="text-slate-600">Chứng chỉ SSL tương thích với hầu hết tất cả các trình duyệt và thiết bị di động hiện nay.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
