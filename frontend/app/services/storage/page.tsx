'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Cloud, HardDrive, Shield, Zap, CheckCircle2, ArrowRight, 
  Lock, Globe, Activity, ShoppingCart 
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';

export default function StorageServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'storage-250gb',
      name: 'Object Storage 250GB',
      tagline: 'Phù hợp lưu trữ Media, Ảnh Web & Backup nhỏ',
      monthlyPrice: 99000,
      yearlyPrice: 79000 * 12,
      capacity: '250 GB Dung lượng S3',
      bandwidth: '1 TB Băng thông tải ra/tháng',
      features: [
        'Chuẩn giao tiếp AWS S3 Compatible API',
        'Độ bền dữ liệu 99.999999999% (11 số 9)',
        'Không giới hạn số lượng Bucket tạo mới',
        'Tạo Pre-signed URL chia sẻ tệp an toàn',
        'Tích hợp Cloud CDN tăng tốc tải media',
        'Bảo mật mã hóa Server-Side Encryption (SSE)',
      ],
      badge: null,
      popular: false,
    },
    {
      id: 'storage-1tb',
      name: 'Object Storage 1TB',
      tagline: 'Lựa chọn tốt nhất cho Web Video, E-learning, App',
      monthlyPrice: 299000,
      yearlyPrice: 239000 * 12,
      capacity: '1,000 GB (1TB) Dung lượng S3',
      bandwidth: '5 TB Băng thông tải ra/tháng',
      features: [
        'Tốc độ đọc ghi Multi-part Upload siêu tốc',
        'Quy tắc vòng đời dữ liệu tự động (Lifecycle Rules)',
        'Cấu hình CORS & Custom Domain kèm SSL riêng',
        'Phân quyền chi tiết theo IAM Bucket Policy',
        'Bảo vệ chống xóa ghi đè (Object Lock WORM)',
        'Hỗ trợ kỹ thuật 24/7 chuyên sâu',
      ],
      badge: 'Phổ biến nhất',
      popular: true,
    },
    {
      id: 'storage-5tb',
      name: 'Object Storage 5TB Enterprise',
      tagline: 'Dành cho Kho dữ liệu lớn, Big Data & Backup tổng',
      monthlyPrice: 1190000,
      yearlyPrice: 952000 * 12,
      capacity: '5,000 GB (5TB) Dung lượng S3',
      bandwidth: '20 TB Băng thông tải ra/tháng',
      features: [
        'Dedicated Uplink 10Gbps đường truyền riêng',
        'Hỗ trợ chuyển dữ liệu khối lượng lớn miễn phí',
        'Cross-Region Replication sao lưu đa trung tâm',
        'Báo cáo chi tiết dung lượng & API Request theo ngày',
        'Cam kết chất lượng dịch vụ SLA 99.99%',
        'Hỗ trợ kỹ thuật 1-1 qua Telegram/Zalo VIP',
      ],
      badge: 'Doanh nghiệp lớn',
      popular: false,
    },
  ];

  const handleOrder = async (plan: typeof plans[0]) => {
    const cycleMonths = billingCycle === 'yearly' ? 12 : 1;
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    await addItem(plan.id, cycleMonths, false, {
      name: `${plan.name} (${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'})`,
      price: price,
      billingCycle: cycleMonths,
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Cloud className="w-4 h-4 text-blue-400" />
            Lưu Trữ Đối Tượng Đám Mây Chuẩn S3 (Object Storage)
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            Lưu Trữ Tệp Tin Không Giới Hạn Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
              Cloud Object Storage S3
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Tương thích 100% với AWS S3 SDK. Tiết kiệm tới 80% chi phí lưu trữ media, video, tài liệu và backup hệ thống so với dịch vụ quốc tế.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Năm
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const displayPrice = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl bg-white p-8 border transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/10 scale-105 z-10 ring-2 ring-blue-500/20'
                    : 'border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Cloud className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-6">{plan.tagline}</p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        {displayPrice.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">đ/tháng</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        Thanh toán {plan.yearlyPrice.toLocaleString('vi-VN')} đ/năm
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-blue-500" />
                      {plan.capacity}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Globe className="w-4 h-4 text-indigo-500" />
                      {plan.bandwidth}
                    </div>

                    <div className="pt-2 space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOrder(plan)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Tạo Bucket Lưu Trữ
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
