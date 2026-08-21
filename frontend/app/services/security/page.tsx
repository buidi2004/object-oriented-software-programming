'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Activity, RefreshCw, ShoppingCart, Key,
  ChevronDown, ChevronUp, Award, BarChart3, Globe, AlertTriangle
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function SecurityWafServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/security-waf/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load security plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: 'waf-basic',
      name: 'WAF Shield Basic',
      tagline: 'Lớp khiên bảo vệ toàn diện chống tấn công Web & lỗ hổng phổ biến',
      monthlyPrice: 99000,
      yearlyPrice: 99000 * 12 * 0.8,
      protection: 'Chống Lỗ Hổng OWASP Top 10',
      bandwidth: '500 GB Băng Thông Lọc Sạch / tháng',
      domains: '1 Tên Miền / Website',
      features: [
        'Lọc và ngăn chặn tấn công SQL Injection, XSS, RCE',
        'Bảo vệ chống Brute-force mật khẩu trang Admin / wp-login',
        'Chặn IP theo Quốc Gia (Geo-blocking Quốc Tế)',
        'Giám sát và phân tích lưu lượng độc hại thời gian thực',
        'Kích hoạt dễ dàng qua Reverse Proxy DNS trong 2 phút'
      ],
      badge: 'Cơ bản',
      popular: false,
    },
    {
      id: 'waf-pro',
      name: 'Malware Scanner & Shield Pro',
      tagline: 'Bảo vệ chuyên sâu, quét mã độc Realtime & chống DDoS L7',
      monthlyPrice: 199000,
      yearlyPrice: 199000 * 12 * 0.8,
      protection: 'Tường Lửa AI + Quét Mã Độc Tự Động',
      bandwidth: '2,000 GB Băng Thông Lọc Sạch',
      domains: '5 Tên Miền / Websites',
      features: [
        'Quét mã độc Realtime, phát hiện Web Shell & Backdoor',
        'Tự động cách ly tệp tin nhiễm độc và cảnh báo Telegram/Email',
        'Chống DDoS Layer 7 (HTTP/HTTPS Flood & Slowloris)',
        'Bộ lọc Bot độc hại, Trình thu thập dữ liệu trái phép (Bad Bots)',
        'Tự động vá ảo (Virtual Patching) cho lỗi 0-Day',
        'Kỹ sư an ninh mạng hỗ trợ xử lý sự cố khẩn cấp 24/7'
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
      details: `${plan.protection} • ${plan.bandwidth}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'WAF (Web Application Firewall) bảo vệ website của tôi như thế nào?',
      a: 'WAF đóng vai trò như một người gác cổng thông minh đứng trước máy chủ web của bạn. Mọi yêu cầu HTTP/HTTPS đều được phân tích qua bộ lọc AI để nhận diện và tiêu diệt các đoạn mã độc hại như SQL Injection, Cross-Site Scripting (XSS), chèn backdoor trước khi chúng có thể tiếp cận được cơ sở dữ liệu.'
    },
    {
      q: 'Tôi có cần thay đổi hosting hay máy chủ hiện tại để dùng WAF không?',
      a: 'Hoàn toàn không! Dịch vụ WAF Shield hoạt động dưới dạng Cloud Proxy độc lập. Bạn chỉ cần trỏ bản ghi DNS tên miền qua cụm WAF của CloudHost trong 2 phút mà không cần cài đặt phần mềm hay di dời website.'
    },
    {
      q: 'WAF có làm chậm tốc độ tải trang web của người dùng không?',
      a: 'Không những không làm chậm mà còn giúp website tải nhanh hơn! Cụm WAF của CloudHost tích hợp tính năng Smart Edge Caching và nén dữ liệu giúp giảm tải cho máy chủ gốc tới 60% và giảm thời gian phản hồi cho người dùng.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-red-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-red-600/20 via-rose-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-red-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-inner">
            <ShieldAlert className="w-4 h-4 text-red-400 animate-pulse" />
            Lớp Khiên An Ninh Mạng Chuyên Sâu - WAF & Chống DDoS Layer 7
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Bảo Vệ Website Tuyệt Đối Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-rose-400 to-amber-300">
              CloudHost WAF Shield
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Ngăn chặn 100% tấn công SQLi, XSS, Brute-force và quét mã độc thời gian thực. 
            Bảo vệ máy chủ gốc an toàn, kích hoạt nhanh trong 2 phút qua DNS mà không cần cài đặt.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-2xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
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
                    ? 'border-red-500 shadow-2xl shadow-red-500/20 ring-2 ring-red-500/40 bg-gradient-to-b from-slate-800 to-slate-900 md:-translate-y-4'
                    : 'border-slate-700/80 shadow-xl hover:border-slate-600 hover:shadow-2xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold">
                      <Shield className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] font-bold text-slate-300">
                      OWASP Top 10
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{plan.tagline}</p>

                  <div className="mb-6 pb-6 border-b border-slate-700/60">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">
                        {displayPrice.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-sm text-slate-400 font-bold">đ/tháng</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-emerald-400 font-semibold mt-1">
                        Thanh toán {plan.yearlyPrice.toLocaleString('vi-VN')} đ/năm (Tiết kiệm 20%)
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{plan.protection}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{plan.bandwidth}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{plan.domains}</span>
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
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02]'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Kích Hoạt Bảo Vệ Ngay</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. CYBER SECURITY ARCHITECTURE SHOWCASE */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5" />
              Công Nghệ Lọc Bắt Tấn Công Thời Gian Thực
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Phát Hiện & Triệt Tiêu Hiểm Họa Trong 1/1000 Giây
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mô hình học máy AI phân tích hàng triệu gói tin mỗi giây, tự động học tập hành vi độc hại và áp dụng bản vá ảo (Virtual Patch) ngay khi lỗ hổng bảo mật mới xuất hiện trên thế giới.
            </p>
          </div>

          {/* 3 Visual Tech Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-red-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                    alt="Cyber Security Firewall WAF"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-red-600/90 text-white text-[11px] font-black uppercase">
                    OWASP Top 10 Firewall
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Chống Hack Website & SQL Injection</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Ngăn chặn triệt để các hành vi khai thác lỗ hổng cơ sở dữ liệu, chèn mã độc JavaScript độc hại vào form bình luận và xâm nhập trang quản trị trái phép.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-400" /> Tự động chặn IP hacker vi phạm</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-red-400" /> Bảo vệ các API Endpoint & REST API</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-rose-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Realtime Malware Scanning"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-rose-600/90 text-white text-[11px] font-black uppercase">
                    Realtime Malware Scan
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Quét & Diệt Mã Độc Tự Động</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Cơ chế quét tệp tin liên tục phát hiện mã độc PHP Shell, mã độc chuyển hướng website (SEO Spam Redirection) và các plugin WordPress bị gắn backdoor ngầm.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Tự động cách ly tệp nhiễm virus</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-rose-400" /> Thông báo tức thì qua Telegram / Email</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-amber-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
                    alt="Anti-DDoS Layer 7 Protection"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-amber-600/90 text-white text-[11px] font-black uppercase">
                    Anti-DDoS Layer 7
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Chống DDoS HTTP Flood & Botnet</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Hệ thống kiểm tra JavaScript Challenge vô hình xác thực người dùng thật và tự động loại bỏ hàng triệu lượt request giả lập của botnet mà không hiển thị captcha phiền toái.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Không ảnh hưởng trải nghiệm khách mua hàng</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> Ẩn IP máy chủ gốc (Origin IP Masking)</li>
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
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-red-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-red-400 shrink-0" />
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
        <div className="rounded-3xl bg-gradient-to-r from-red-900 via-rose-900 to-slate-900 p-8 sm:p-12 border border-red-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Bảo Vệ Doanh Nghiệp Của Bạn Khỏi Mọi Mối Đe Dọa
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-8 leading-relaxed">
              Kích hoạt khiên WAF Shield chỉ từ 99.000đ/tháng. Đội ngũ an ninh mạng trực 24/7 bảo vệ website của bạn khỏi mọi cuộc tấn công nguy hiểm.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-red-500/25 transition-all hover:scale-105"
              >
                Xem Bảng Giá & Kích Hoạt
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Yêu Cầu Đánh Giá An Ninh Miễn Phí
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
