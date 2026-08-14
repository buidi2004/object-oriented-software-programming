'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Server, Globe, Shield, ArrowRight, Zap, CheckCircle2, Cloud } from 'lucide-react';
import { api } from '@/src/lib/api';

const CATEGORY_META: Record<string, {
  href: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Server;
  color: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  features: string[];
}> = {
  'cloud-vps': {
    href: '/services/cloud-vps',
    title: 'Cloud VPS Enterprise',
    subtitle: 'Máy chủ ảo NVMe hiệu năng cao',
    description: 'Toàn quyền quản trị Root Access, NVMe SSD Enterprise, Anti-DDoS tích hợp. Triển khai tức thì trong 30 giây.',
    icon: Server,
    color: 'from-blue-600 to-cyan-500',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    features: ['NVMe SSD Enterprise', 'Root Access đầy đủ', 'Anti-DDoS 500Gbps', 'Snapshot & Backup tự động'],
  },
  'web-hosting': {
    href: '/services/hosting',
    title: 'NVMe Web Hosting',
    subtitle: 'Hosting tốc độ cao cho Website',
    description: 'Tối ưu 100% cho WordPress, WooCommerce & Laravel. Tích hợp LiteSpeed Web Server + LSCache tăng tốc x10.',
    icon: Globe,
    color: 'from-indigo-600 to-purple-500',
    bgLight: 'bg-indigo-50',
    textColor: 'text-indigo-600',
    borderColor: 'border-indigo-200',
    features: ['LiteSpeed + LSCache', 'cPanel quản trị', 'Imunify360 AI Shield', 'SSL miễn phí'],
  },
  'ten-mien': {
    href: '/services/domain',
    title: 'Đăng Ký Tên Miền',
    subtitle: 'Tên miền .VN & Quốc tế',
    description: 'Đăng ký tên miền với giá tốt nhất thị trường. Hỗ trợ .com, .vn, .net, .ai và hàng trăm đuôi mở rộng khác.',
    icon: Shield,
    color: 'from-cyan-500 to-emerald-500',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    features: ['DNS Management miễn phí', 'WHOIS Privacy Protection', 'Chuyển tên miền dễ dàng', 'Auto-renew thông minh'],
  },
};

interface CategoryCard {
  slug: string;
  name: string;
  href: string;
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Server;
  color: string;
  bgLight: string;
  textColor: string;
  borderColor: string;
  features: string[];
  startPrice: string;
  priceSuffix: string;
}

function formatPrice(value: number): string {
  return value.toLocaleString('vi-VN');
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<CategoryCard[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const catRes = await api.get('/categories');
        const cats: { id: string; name: string; slug: string }[] = catRes.data ?? [];

        const cards = await Promise.all(
          cats.map(async (cat) => {
            const meta = CATEGORY_META[cat.slug];
            if (!meta) return null;

            let startPrice = '—';
            let priceSuffix = cat.slug === 'ten-mien' ? ' đ/năm' : ' đ/tháng';

            try {
              const plansRes = await api.get(`/categories/${cat.slug}/plans`, {
                params: { currency: 'VND' },
              });
              const plans = plansRes.data?.plans ?? [];
              const prices = plans.flatMap((p: { monthlyPrice?: number; yearlyPrice?: number }) =>
                [p.monthlyPrice, p.yearlyPrice].filter((v): v is number => v != null && v > 0)
              );
              if (prices.length > 0) {
                startPrice = formatPrice(Math.min(...prices));
              }
            } catch {
              // keep fallback price
            }

            return {
              slug: cat.slug,
              name: cat.name,
              href: meta.href,
              title: meta.title,
              subtitle: meta.subtitle,
              description: meta.description,
              icon: meta.icon,
              color: meta.color,
              bgLight: meta.bgLight,
              textColor: meta.textColor,
              borderColor: meta.borderColor,
              features: meta.features,
              startPrice,
              priceSuffix,
            } satisfies CategoryCard;
          })
        );

        setCategories(cards.filter(Boolean) as CategoryCard[]);
      } catch {
        setCategories(
          Object.entries(CATEGORY_META).map(([slug, meta]) => ({
            slug,
            name: meta.title,
            href: meta.href,
            title: meta.title,
            subtitle: meta.subtitle,
            description: meta.description,
            icon: meta.icon,
            color: meta.color,
            bgLight: meta.bgLight,
            textColor: meta.textColor,
            borderColor: meta.borderColor,
            features: meta.features,
            startPrice: '—',
            priceSuffix: slug === 'ten-mien' ? ' đ/năm' : ' đ/tháng',
          }))
        );
      }
    }

    load();
  }, []);

  const displayCategories = categories.length > 0
    ? categories
    : Object.entries(CATEGORY_META).map(([slug, meta]) => ({
        slug,
        name: meta.title,
        href: meta.href,
        title: meta.title,
        subtitle: meta.subtitle,
        description: meta.description,
        icon: meta.icon,
        color: meta.color,
        bgLight: meta.bgLight,
        textColor: meta.textColor,
        borderColor: meta.borderColor,
        features: meta.features,
        startPrice: '—',
        priceSuffix: slug === 'ten-mien' ? ' đ/năm' : ' đ/tháng',
      }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md">
              <Cloud className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black text-slate-900">
                CloudHost<span className="text-blue-600"> VN</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">
                Enterprise Cloud
              </span>
            </div>
          </Link>
          <Link href="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1">
            ← Về Trang Chủ
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
            <Zap className="w-3.5 h-3.5" />
            Dịch Vụ Cloud
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4">
            Giải Pháp Cloud Toàn Diện
          </h1>
          <p className="text-lg text-slate-600">
            Từ máy chủ VPS mạnh mẽ, hosting tốc độ cao đến tên miền — tất cả trong một hệ sinh thái đáng tin cậy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {displayCategories.map((svc) => (
            <Link
              key={svc.slug}
              href={svc.href}
              className={`group bg-white rounded-3xl border ${svc.borderColor} p-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col`}
            >
              <div className={`w-16 h-16 rounded-2xl ${svc.bgLight} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <svc.icon className={`w-8 h-8 ${svc.textColor}`} />
              </div>

              <h2 className="text-2xl font-extrabold text-slate-900 mb-1">{svc.title}</h2>
              <p className="text-sm font-semibold text-slate-500 mb-3">{svc.subtitle}</p>
              <p className="text-sm text-slate-600 mb-6 flex-1">{svc.description}</p>

              <div className="mb-6">
                <span className="text-sm text-slate-500">Chỉ từ</span>
                <div className="text-3xl font-black text-slate-900">
                  {svc.startPrice}<span className="text-base font-bold text-slate-500">{svc.priceSuffix}</span>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                {svc.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${svc.textColor} shrink-0`} />
                    <span className="text-sm text-slate-700">{f}</span>
                  </div>
                ))}
              </div>

              <div className={`w-full py-3.5 rounded-2xl bg-gradient-to-r ${svc.color} text-white font-bold text-sm text-center flex items-center justify-center gap-2 group-hover:shadow-lg transition-all`}>
                <span>Xem Chi Tiết</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Uptime SLA', value: '99.99%' },
              { label: 'Khách hàng tin dùng', value: '10,000+' },
              { label: 'Datacenter Tier III', value: '3 vị trí' },
              { label: 'Hỗ trợ kỹ thuật', value: '24/7/365' },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200">
                <div className="text-3xl font-black text-blue-600 mb-1">{stat.value}</div>
                <div className="text-sm text-slate-500 font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2024 CloudHost VN. Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
