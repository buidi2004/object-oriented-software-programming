'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Globe, Server, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Terminal, Clock, ShoppingCart, Activity,
  GitBranch, RefreshCw, Layers, ShieldCheck, ChevronDown,
  ChevronUp, Sparkles, Play, Code, FileCode
} from 'lucide-react';
import { NginxLogo } from '@/src/components/icons/BrandLogos';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function StaticSitesServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/static-sites/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load static site plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: 'c4f880e1-52b6-4313-a0b7-aa0fe24ed8ba',
      name: 'Static Site Starter (Miễn Phí)',
      tagline: 'Phù hợp cho dự án cá nhân, Portfolio sinh viên & Landing Page học tập',
      monthlyPrice: 0,
      yearlyPrice: 0,
      sites: '1 Website Tĩnh (HTML/CSS/JS/React Build)',
      bandwidth: '50 GB Băng Thông / tháng',
      storage: '1 GB NVMe Storage',
      customDomain: 'Miễn phí Subdomain .cloudservicestore.com',
      features: [
        'Môi trường Nginx Container tối ưu siêu nhẹ',
        'Tự động cấp chứng chỉ SSL HTTPS Let\'s Encrypt',
        'Upload mã nguồn trực tiếp qua Web Dashboard',
        'Tích hợp tính năng nén Brotli / Gzip tự động',
        'Hỗ trợ Single Page Application (SPA Routing Rewrite)'
      ],
      badge: 'Miễn phí',
      popular: false,
    },
    {
      id: '19d5647d-9d41-4436-a3e7-5e7f34c73d0e',
      name: 'Static Site Pro (Custom Domain)',
      tagline: 'Lựa chọn lý tưởng cho Doanh nghiệp, Freelancer & Agency Web',
      monthlyPrice: 49000,
      yearlyPrice: 49000 * 12 * 0.8,
      sites: '5 Websites Tĩnh Độc Lập',
      bandwidth: '500 GB Băng Thông Tốc Độ Cao',
      storage: '5 GB NVMe Gen4 Enterprise',
      customDomain: 'Hỗ trợ Gắn Tên Miền Riêng (Custom Domain) Không Giới Hạn',
      features: [
        'Môi trường Nginx Container 128MB RAM chuyên dụng',
        'Gắn Custom Domain riêng biệt kèm Auto SSL HTTPS 100%',
        'Hỗ trợ Git Webhook tự động Re-deploy khi push code',
        'Bảo vệ chống tấn công DDoS L7 chuyên sâu',
        'Tốc độ tải trang đạt điểm 100/100 Google PageSpeed',
        'Hỗ trợ kỹ thuật 24/7 qua LiveChat'
      ],
      badge: 'Khuyên dùng',
      popular: true,
    },
  ];

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      monthlyPrice: matchingDb?.monthlyPrice ?? dp.monthlyPrice,
      yearlyPrice: matchingDb?.yearlyPrice ?? dp.yearlyPrice,
    };
  });

  const handleOrder = async (plan: typeof plans[0]) => {
    const cycleMonths = billingCycle === 'yearly' ? 12 : 1;
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    await addItem(plan.id, cycleMonths, false, {
      name: `${plan.name} - ${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'}`,
      price: price,
      billingCycle: cycleMonths,
      type: 'vps',
      details: `${plan.sites} • ${plan.bandwidth}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'Static Site Hosting hỗ trợ các loại mã nguồn và framework nào?',
      a: 'Hệ thống hỗ trợ toàn bộ các trang web tĩnh thuần (HTML/CSS/JavaScript), cũng như bản build sản phẩm (Static Export) của React, Vue.js, Angular, Next.js (Static Export), Nuxt.js, Astro, Svelte, Vite và Gatsby.'
    },
    {
      q: 'Làm thế nào để tải mã nguồn trang web lên máy chủ?',
      a: 'Bạn có 3 cách tải mã nguồn: 1) Kéo thả file .ZIP hoặc thư mục trực tiếp trên Web Dashboard; 2) Sử dụng Git Webhook để tự động cập nhật khi bạn push code lên GitHub/GitLab; 3) Kết nối qua SFTP / SSH để upload tệp siêu tốc.'
    },
    {
      q: 'Trang web React/Vue Single Page Application (SPA) có bị lỗi 404 khi F5 tải lại trang không?',
      a: 'Hoàn toàn không! Bảng điều khiển Nginx của CloudHost tích hợp sẵn tính năng "SPA Fallback Rewrite (try_files $uri $uri/ /index.html)" giúp tất cả các đường dẫn Router của React/Vue hoạt động hoàn hảo mà không bị lỗi 404.'
    },
    {
      q: 'Tốc độ tải trang web tĩnh Nginx so với Web Hosting thông thường như thế nào?',
      a: 'Nginx Container chỉ phục vụ tệp tĩnh mà không cần chạy PHP/MySQL thông dịch nặng nề, kết hợp bộ nhớ đệm Cache-Control và nén Brotli giúp thời gian phản hồi (TTFB) chỉ dưới 15ms, tốc độ tải trang gần như tức thì.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-cyan-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-cyan-600/20 via-blue-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-800/90 border border-slate-700 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-xl">
            <NginxLogo className="w-4 h-4" />
            <span>Nginx Container Engine • Ultra Low TTFB &lt; 15ms</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Triển Khai Web Tĩnh Chớp Mắt Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
              Nginx Container & Auto SSL
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Lưu trữ HTML, CSS, JS, React, Vue, Next.js Static Export trên hạ tầng Nginx tối ưu. 
            Tự động cấp phát chứng chỉ SSL HTTPS, gắn tên miền riêng và thời gian phản hồi dưới 15ms.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-2xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>Thanh Toán Theo Năm</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black uppercase">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="relative -mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan) => {
            const displayPrice = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl bg-slate-800/90 backdrop-blur-md p-8 border transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-cyan-500 shadow-2xl shadow-cyan-500/20 ring-2 ring-cyan-500/40 bg-gradient-to-b from-slate-800 to-slate-900 md:-translate-y-4'
                    : 'border-slate-700/80 shadow-xl hover:border-slate-600 hover:shadow-2xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                      <Globe className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] font-bold text-slate-300">
                      Nginx Engine
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{plan.tagline}</p>

                  <div className="mb-6 pb-6 border-b border-slate-700/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">
                        {displayPrice === 0 ? '0 đ' : displayPrice.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-sm text-slate-400 font-bold">đ/tháng</span>
                    </div>
                    {billingCycle === 'yearly' && plan.yearlyPrice > 0 && (
                      <p className="text-xs text-emerald-400 font-semibold mt-1">
                        Thanh toán {plan.yearlyPrice.toLocaleString('vi-VN')} đ/năm (Tiết kiệm 20%)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{plan.sites}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{plan.bandwidth}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <HardDrive className="w-4 h-4 text-pink-400 shrink-0" />
                      <span>{plan.storage}</span>
                    </div>

                    <div className="pt-3 space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOrder(plan)}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                    plan.popular
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:scale-[1.02]'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>{plan.monthlyPrice === 0 ? 'Kích Hoạt Gói Miễn Phí' : 'Tạo Web Tĩnh Ngay'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. SPEED & NGINX ARCHITECTURE SHOWCASE */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              Tốc Độ Tải Trang & Hạ Tầng Container Nginx
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Điểm 100/100 Google PageSpeed, Phản Hồi Dưới 15ms
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mỗi website tĩnh được vận hành trên container Nginx chuyên biệt, tự động nén nội dung Brotli và tích hợp chuẩn HTTP/2 & HTTP/3 mới nhất.
            </p>
          </div>

          {/* 3 Visual Tech Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-cyan-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80"
                    alt="Code Deployment & Nginx"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-cyan-600/90 text-white text-[11px] font-black uppercase">
                    Brotli & HTTP/3
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Chuẩn Tối Ưu Web Hiện Đại</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Tự động nén file HTML, CSS, JavaScript bằng thuật toán Brotli tiên tiến giúp giảm 30% dung lượng so với Gzip truyền thống, tăng tốc độ mở web cho người dùng di động.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Tương thích hoàn toàn React / Vue SPA</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Giao thức bảo mật HTTP/2 & QUIC HTTP/3</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-blue-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                    alt="Automatic SSL HTTPS"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-blue-600/90 text-white text-[11px] font-black uppercase">
                    Auto HTTPS SSL
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Chứng Chỉ SSL Let's Encrypt Tự Động</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Hệ thống tự động phát hành và gia hạn chứng chỉ SSL miễn phí cho tên miền riêng của bạn, đảm bảo ổ khóa xanh HTTPS bảo mật và tối ưu chuẩn SEO Google.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Tự động chuyển hướng HTTP sang HTTPS</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Không bao giờ lo hết hạn chứng chỉ</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Instant Git Webhook Re-deploy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-indigo-600/90 text-white text-[11px] font-black uppercase">
                    CI/CD Webhook
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Tự Động Cập Nhật Code Khi Push</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Kết nối Webhook trực tiếp với GitHub hoặc GitLab. Mỗi khi bạn đẩy commit mới, trang web sẽ được cập nhật phiên bản mới tự động chỉ trong vòng 3 giây.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Triển khai Zero-Downtime Deployment</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Tùy chọn Rollback quay lại bản cũ tức thì</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">Câu Hỏi Thường Gặp (FAQ)</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Giải đáp chi tiết thắc mắc trước khi bạn bắt đầu</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-cyan-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-cyan-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-cyan-900 via-blue-900 to-slate-900 p-8 sm:p-12 border border-cyan-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Đưa Trang Web Của Bạn Lên Mạng Ngay Hôm Nay
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-8 leading-relaxed">
              Bắt đầu hoàn toàn miễn phí hoặc nâng cấp gói Pro chỉ 49.000đ/tháng để gắn tên miền riêng. Triển khai trong 60 giây!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm shadow-xl shadow-cyan-500/25 transition-all hover:scale-105"
              >
                Xem Bảng Giá & Kích Hoạt
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Tư Vấn Miễn Phí 24/7
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
