'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, ArrowRight, CheckCircle2, Shield, Server, RefreshCw, 
  Database, HardDrive, ShoppingCart, ChevronDown, ChevronUp,
  Clock, Award, Layers, Globe, FileText, Check
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function MigrationsServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/cloud-migration/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load migration plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: 'migration-standard',
      name: 'Chuyển Đổi Website Chuẩn',
      tagline: 'Chuyển toàn bộ mã nguồn WordPress / PHP / Laravel sang CloudHost',
      price: 200000,
      turnaround: 'Hoàn tất trong 2 - 4 Giờ',
      scope: '1 Website / Cơ sở dữ liệu',
      features: [
        'Chuyển dữ liệu trọn gói: Mã nguồn, Database MySQL, Email',
        'Miễn phí 100% nếu bạn đăng ký gói Hosting / VPS từ 12 tháng',
        'Cam kết Zero-Downtime: Website hoạt động liên tục không gián đoạn',
        'Kiểm tra toàn diện tính toàn vẹn và sửa lỗi đường dẫn tĩnh',
        'Cài đặt chứng chỉ SSL HTTPS và cấu hình tường lửa miễn phí'
      ],
      badge: 'Phổ biến',
      popular: true,
    },
    {
      id: 'migration-vip',
      name: 'Chuyển Đổi Hệ Thống Doanh Nghiệp VIP',
      tagline: 'Dành cho Cụm máy chủ lớn, Sàn TMĐT, Multi-Database & Cụm VPS',
      price: 500000,
      turnaround: 'Kỹ sư chuyên trách 1-1',
      scope: 'Toàn bộ Cụm Máy Chủ / Multi-Site',
      features: [
        'Chuyển đổi cụm cơ sở dữ liệu lớn (>50GB) bằng công nghệ Live-Sync',
        'Chuyển đổi từ AWS, GCP, Azure, DigitalOcean hoặc máy chủ vật lý',
        'Thiết kế và tối ưu lại kiến trúc máy chủ mới (Nginx, Redis, PHP-FPM)',
        'Thử nghiệm kịch bản Staging trước khi chính thức chuyển đổi DNS',
        'Hỗ trợ theo dõi và túc trực hệ thống 7 ngày sau chuyển đổi'
      ],
      badge: 'Doanh nghiệp',
      popular: false,
    },
  ];

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      price: matchingDb?.monthlyPrice ?? dp.price,
    };
  });

  const handleOrder = async (plan: typeof plans[0]) => {
    await addItem(plan.id, 1, false, {
      name: plan.name,
      price: plan.price,
      billingCycle: 1,
      type: 'vps',
      details: `${plan.scope} • ${plan.turnaround}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'Trong quá trình chuyển đổi, website của tôi có bị gián đoạn (Downtime) không?',
      a: 'Hoàn toàn không gián đoạn! Kỹ sư của chúng tôi sẽ đồng bộ mã nguồn và dữ liệu sang máy chủ CloudHost mới, kiểm tra hoàn tất qua IP phụ. Sau khi mọi thứ hoạt động chuẩn xác 100%, mới tiến hành cập nhật bản ghi DNS nên người dùng truy cập không hề bị gián đoạn hay mất đơn hàng.'
    },
    {
      q: 'Tôi được miễn phí chuyển đổi khi nào?',
      a: 'Khi bạn mua bất kỳ dịch vụ Hosting, Cloud VPS hoặc Dedicated Server nào tại CloudHost với chu kỳ từ 12 tháng trở lên, dịch vụ chuyển đổi dữ liệu được tặng kèm MIỄN PHÍ 100%.'
    },
    {
      q: 'Tôi cần cung cấp những thông tin gì để kỹ sư tiến hành chuyển dữ liệu?',
      a: 'Bạn chỉ cần cung cấp thông tin đăng nhập Hosting cũ (cPanel, DirectAdmin, Plesk) hoặc thông tin tài khoản quản trị Root SSH. Toàn bộ thông tin được cam kết bảo mật theo thỏa thuận NDA.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-orange-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-orange-600/20 via-amber-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-inner">
            <RefreshCw className="w-4 h-4 text-orange-400 animate-spin" />
            Dịch Vụ Di Chuyển Dữ Liệu Toàn Diện 24/7 - Cam Kết Zero Downtime
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Chuyển Đổi Dữ Liệu Lên CloudHost{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300">
              An Toàn & 100% Nguyên Vẹn
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Không lo mất dữ liệu, không lo gián đoạn kinh doanh. Đội ngũ kỹ sư cấp cao của CloudHost sẽ trực tiếp di dời toàn bộ mã nguồn, cơ sở dữ liệu và cấu hình máy chủ cho bạn.
          </p>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="relative -mt-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl bg-slate-800/90 backdrop-blur-md p-8 border transition-all duration-300 flex flex-col justify-between ${
                plan.popular
                  ? 'border-orange-500 shadow-2xl shadow-orange-500/20 ring-2 ring-orange-500/40 bg-gradient-to-b from-slate-800 to-slate-900 md:-translate-y-4'
                  : 'border-slate-700/80 shadow-xl hover:border-slate-600 hover:shadow-2xl'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] font-bold text-slate-300">
                    {plan.turnaround}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{plan.tagline}</p>

                <div className="mb-6 pb-6 border-b border-slate-700/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      {plan.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-sm text-slate-400 font-bold">đ / lần</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    🎁 Miễn phí 100% khi mua kèm Cloud VPS / Hosting từ 12 tháng
                  </p>
                </div>

                <div className="space-y-3 mb-8 text-sm">
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{plan.scope}</span>
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
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02]'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Đăng Ký Chuyển Đổi Ngay</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. STEP-BY-STEP MIGRATION WORKFLOW */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5" />
              Quy Trình 4 Bước Chuyển Đổi Chuẩn Quốc Tế
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Chính Xác, Minh Bạch & Không Mất Dữ Liệu
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Kỹ sư CloudHost tuân thủ quy trình kiểm thử 4 bước nghiêm ngặt, đảm bảo toàn bộ mã nguồn, cấu hình và tệp đính kèm được sao chép toàn vẹn 100%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            {[
              { step: '01', title: 'Khảo Sát & Lập Kế Hoạch', desc: 'Đánh giá dung lượng database, phiên bản PHP/MySQL và các module máy chủ đặc thù.' },
              { step: '02', title: 'Đồng Bộ Hóa Ngầm', desc: 'Sao chép toàn bộ tệp và cơ sở dữ liệu sang hạ tầng CloudHost mà không ảnh hưởng người dùng đang online.' },
              { step: '03', title: 'Kiểm Thử Môi Trường Mới', desc: 'Kiểm tra hoạt động website qua IP tạm thời, đảm bảo mọi chức năng và plugin chạy mượt mà.' },
              { step: '04', title: 'Cập Nhật DNS & Bàn Giao', desc: 'Trỏ DNS sang máy chủ mới và bàn giao thông tin đăng nhập trong trạng thái hoàn hảo.' },
            ].map((st, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 relative group hover:border-orange-500/50 transition-all">
                <div className="text-3xl font-black text-orange-500/30 mb-3">{st.step}</div>
                <h4 className="text-lg font-bold text-white mb-2">{st.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>

          {/* Real Photo Visual */}
          <div className="rounded-3xl overflow-hidden border border-slate-800 relative bg-slate-900">
            <div className="h-64 sm:h-80 relative">
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80"
                alt="Cloud Migration Center"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent flex items-end p-8">
                <div>
                  <span className="px-3 py-1 rounded-lg bg-orange-600 text-white text-xs font-black uppercase mb-2 inline-block">
                    24/7 Dedicated Support
                  </span>
                  <h3 className="text-2xl font-black text-white mb-1">Hơn 15,000+ Trang Web Đã Chuyển Đổi Thành Công</h3>
                  <p className="text-xs text-slate-300 max-w-2xl">
                    Từ các blog cá nhân đến hệ thống thương mại điện tử lớn với cơ sở dữ liệu hàng chục triệu bản ghi, CloudHost đều đảm bảo chuyển đổi thành công mỹ mãn.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ ACCORDION */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-white mb-2">Câu Hỏi Thường Gặp (FAQ)</h2>
            <p className="text-slate-400 text-xs sm:text-sm">Giải đáp chi tiết thắc mắc trước khi bạn chuyển đổi</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-orange-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-orange-400 shrink-0" />
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
        <div className="rounded-3xl bg-gradient-to-r from-orange-900 via-amber-900 to-slate-900 p-8 sm:p-12 border border-orange-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Sẵn Sàng Nâng Cấp Hệ Thống Của Bạn Lên Tầm Cao Mới?
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-8 leading-relaxed">
              Gửi yêu cầu ngay để được kỹ sư liên hệ và tiến hành di dời dữ liệu trong hôm nay. Hỗ trợ nhiệt tình 24/7/365.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-orange-500/25 transition-all hover:scale-105"
              >
                Xem Bảng Giá & Đặt Dịch Vụ
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Liên Hệ Kỹ Sư Trưởng
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
