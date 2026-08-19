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
    icon: Globe,
    color: 'from-cyan-500 to-emerald-500',
    bgLight: 'bg-cyan-50',
    textColor: 'text-cyan-600',
    borderColor: 'border-cyan-200',
    features: ['DNS Management miễn phí', 'WHOIS Privacy Protection', 'Chuyển tên miền dễ dàng', 'Auto-renew thông minh'],
  },
  'dedicated-server': {
    href: '/services/dedicated-server',
    title: 'Dedicated Server',
    subtitle: 'Máy chủ vật lý riêng biệt',
    description: 'Phần cứng chuyên dụng 100% từ Intel Xeon & AMD EPYC, băng thông không giới hạn, cam kết Uptime 99.99%.',
    icon: Server,
    color: 'from-purple-600 to-pink-500',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    features: ['100% Dedicated Hardware', 'Cổng mạng 10Gbps Uplink', 'iDRAC / IPMI từ xa', 'KVM over IP chuyên dụng'],
  },
  'email-server': {
    href: '/services/email-hosting',
    title: 'Email Doanh Nghiệp',
    subtitle: 'Email theo tên miền riêng',
    description: 'Hệ thống email bảo mật cao, chống spam 99.9%, tích hợp DKIM, SPF, DMARC đảm bảo vào 100% Inbox.',
    icon: Cloud,
    color: 'from-rose-600 to-orange-500',
    bgLight: 'bg-rose-50',
    textColor: 'text-rose-600',
    borderColor: 'border-rose-200',
    features: ['Chống spam AI Anti-Spam', 'Webmail & Outlook/Mobile', 'IP uy tín vào 100% Inbox', 'Dung lượng linh hoạt'],
  },
  'ssl-certificate': {
    href: '/services/ssl-certificates',
    title: 'Chứng Chỉ SSL',
    subtitle: 'Bảo mật dữ liệu HTTPS',
    description: 'Mã hóa kết nối chuẩn 256-bit từ Sectigo, DigiCert, GeoTrust. Tăng độ tin cậy và thứ hạng SEO cho website.',
    icon: Shield,
    color: 'from-amber-500 to-emerald-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    features: ['Mã hóa 256-bit SHA-2', 'Bảo hiểm lên đến $1.75M', 'Huy hiệu Trust Seal uy tín', 'Kích hoạt trong 5 phút'],
  },
  'cdn': {
    href: '/services/cdn',
    title: 'Cloud CDN Accelerator',
    subtitle: 'Mạng phân phối nội dung toàn cầu',
    description: 'Tăng tốc độ tải trang lên đến 300% với hơn 300+ PoPs toàn cầu, Edge Caching, nén Brotli và Anti-DDoS Layer 7.',
    icon: Cloud,
    color: 'from-amber-600 to-yellow-500',
    bgLight: 'bg-amber-50',
    textColor: 'text-amber-600',
    borderColor: 'border-amber-200',
    features: ['300+ Edge PoPs toàn cầu', 'Edge SSL & HTTP/3 Quic', 'Anti-DDoS Layer 7', 'Smart Purge API tức thì'],
  },
  'databases': {
    href: '/services/databases',
    title: 'Managed Cloud Databases',
    subtitle: 'Cơ sở dữ liệu đám mây tự động',
    description: 'Dịch vụ quản trị MySQL, PostgreSQL, Redis và MongoDB. Tự động sao lưu, mở rộng quy mô và dự phòng cụm High Availability.',
    icon: Server,
    color: 'from-teal-600 to-emerald-500',
    bgLight: 'bg-teal-50',
    textColor: 'text-teal-600',
    borderColor: 'border-teal-200',
    features: ['MySQL 8 / Postgres 16 / Redis', 'High Availability Cluster', 'Tự động Backup hàng ngày', 'Mở rộng 1-Click Zero Downtime'],
  },
  'storage': {
    href: '/services/storage',
    title: 'Cloud Object Storage (S3)',
    subtitle: 'Lưu trữ đám mây tương thích S3',
    description: 'Lưu trữ tệp tin, media, backup không giới hạn dung lượng với chi phí tiết kiệm 80%. Hoàn toàn tương thích AWS S3 SDK.',
    icon: Cloud,
    color: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    borderColor: 'border-blue-200',
    features: ['100% S3 Compatible API', 'Độ bền dữ liệu 99.999999999%', 'Băng thông tải không giới hạn', 'Phân quyền IAM & Pre-signed URL'],
  },
  'game-servers': {
    href: '/services/game-servers',
    title: 'Game Server Hosting',
    subtitle: 'Máy chủ Game siêu tốc & Low Latency',
    description: 'Khởi tạo máy chủ Minecraft, CS:GO/CS2, Rust, Palworld, Valheim trong 60 giây. Bảo vệ Anti-DDoS Game chuyên dụng.',
    icon: Server,
    color: 'from-purple-600 to-indigo-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    borderColor: 'border-purple-200',
    features: ['Khởi tạo trong 60 giây', 'Mod & Plugin Manager 1-Click', 'Anti-DDoS Game chuyên sâu', 'Toàn quyền FTP & Console'],
  },
  'app-installer': {
    href: '/apps',
    title: '1-Click App Marketplace',
    subtitle: 'Cài đặt ứng dụng tức thì',
    description: 'Hơn 100+ ứng dụng và framework: WordPress, Node.js, Docker, GitLab, Nextcloud, Prestashop sẵn sàng chỉ với 1 cú nhấp.',
    icon: Globe,
    color: 'from-sky-600 to-blue-600',
    bgLight: 'bg-sky-50',
    textColor: 'text-sky-600',
    borderColor: 'border-sky-200',
    features: ['100+ Ứng dụng phổ biến', 'Tự động cập nhật bảo mật', 'Sao lưu trước khi update', 'Cấu hình SSL tự động'],
  },
  'static-sites': {
    href: '/services/static-sites',
    title: 'Static Sites Hosting (Jamstack)',
    subtitle: 'Triển khai Web tĩnh siêu tốc',
    description: 'Deploy Next.js, Vite, React, Astro trực tiếp từ Git. Mạng CDN toàn cầu với SSL tự động và CDN Edge Functions.',
    icon: Globe,
    color: 'from-emerald-600 to-teal-500',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    borderColor: 'border-emerald-200',
    features: ['Git-integrated Deployments', 'SSL & Custom Domain tự động', 'Preview Deployments', 'Global Edge Caching'],
  },
  'website-builder': {
    href: '/services/website-builder',
    title: 'AI Website Builder',
    subtitle: 'Thiết kế Website kéo thả với AI',
    description: 'Tạo website chuyên nghiệp chuẩn SEO trong 5 phút. Kéo thả trực quan, tích hợp thanh toán và tối ưu di động 100%.',
    icon: Globe,
    color: 'from-pink-600 to-rose-500',
    bgLight: 'bg-pink-50',
    textColor: 'text-pink-600',
    borderColor: 'border-pink-200',
    features: ['Trợ lý tạo trang bằng AI', '500+ Giao diện mẫu đẹp mắt', 'Chuẩn SEO & Tốc độ cao', 'Tích hợp Giỏ hàng & Thanh toán'],
  },
  'marketplace': {
    href: '/marketplace',
    title: 'Cloud Marketplace',
    subtitle: 'Chợ tiện ích & Bản quyền phần mềm',
    description: 'Mua bản quyền cPanel, DirectAdmin, CloudLinux, Imunify360, LiteSpeed Enterprise và hàng trăm extension khác.',
    icon: Shield,
    color: 'from-violet-600 to-purple-600',
    bgLight: 'bg-violet-50',
    textColor: 'text-violet-600',
    borderColor: 'border-violet-200',
    features: ['Bản quyền chính hãng 100%', 'Kích hoạt License tức thì', 'Chi phí chiết khấu đại lý', 'Hỗ trợ kỹ thuật 24/7'],
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
