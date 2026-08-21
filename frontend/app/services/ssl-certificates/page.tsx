'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Lock, CheckCircle2, Server, Globe, Shield, ArrowRight, 
  Star, ShoppingCart, Key, Award, ChevronDown, ChevronUp, Zap, HelpCircle
} from 'lucide-react';
import { SectigoLogo, DigicertLogo } from '@/src/components/icons/BrandLogos';
import { useCartStore } from '@/src/store/useCartStore';

export default function SslServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const sslPlans = [
    {
      id: 'ssl-letsencrypt-dv',
      name: 'Let\'s Encrypt SSL (DV)',
      description: 'Chứng chỉ bảo mật tiêu chuẩn miễn phí, tự động gia hạn cho mọi website.',
      price: 0,
      period: 'Miễn phí trọn đời',
      validation: 'Domain Validation (Tự động 60s)',
      warranty: 'Bảo mật tiêu chuẩn',
      Logo: Lock,
      features: [
        'Mã hóa 256-bit chuẩn bảo mật quốc tế',
        'Xác thực quyền sở hữu tên miền nhanh chóng',
        'Tự động gia hạn qua giao thức ACME / DNS',
        'Hiển thị ổ khóa an toàn HTTPS trên Chrome, Safari, Firefox',
        'Tối ưu điểm số SEO trên công cụ tìm kiếm Google'
      ],
      badge: 'Miễn phí',
      popular: false,
    },
    {
      id: 'ssl-sectigo-positivesll',
      name: 'Sectigo PositiveSSL (DV Thương Mại)',
      description: 'Chứng chỉ SSL thương mại uy tín toàn cầu cho Web bán hàng & Blog.',
      price: 199000,
      period: '199.000đ / năm',
      validation: 'Cấp phát trong 5 phút',
      warranty: '$10,000 USD Bảo hiểm',
      Logo: SectigoLogo,
      features: [
        'Cấp bởi Tổ chức CA uy tín số 1 thế giới Sectigo',
        'Tương thích 99.9% thiết bị di động và trình duyệt cổ',
        'Tặng kèm Dynamic Site Seal huy hiệu bảo mật uy tín',
        'Bảo hiểm bồi thường rò rỉ dữ liệu $10,000 USD',
        'Hỗ trợ cài đặt hoàn chỉnh lên Hosting / VPS 24/7'
      ],
      badge: 'Bán chạy nhất',
      popular: true,
    },
    {
      id: 'ssl-digicert-ev',
      name: 'DigiCert EV Business (Xác Thực Doanh Nghiệp)',
      description: 'Cấp độ bảo mật cao nhất cho Ngân hàng, Sàn TMĐT & Tập đoàn lớn.',
      price: 1990000,
      period: '1.990.000đ / năm',
      validation: 'Xác minh hồ sơ pháp lý Doanh Nghiệp',
      warranty: '$1,750,000 USD Bảo hiểm',
      Logo: DigicertLogo,
      features: [
        'Hiển thị tên Doanh Nghiệp xác thực chính thức trên chứng chỉ',
        'Bảo hiểm bồi thường danh tiếng lên tới $1.75 Triệu USD',
        'Thuật toán mã hóa RSA 2048-bit & ECC đường cong Elliptic',
        'Xác minh pháp nhân doanh nghiệp qua Tổng Cục Thuế',
        'Ưu tiên giải quyết khiếu nại kỹ thuật VIP trong 15 phút'
      ],
      badge: 'Cấp Doanh Nghiệp',
      popular: false,
    },
  ];

  const handleOrder = async (plan: typeof sslPlans[0]) => {
    await addItem(plan.id, 1, false, {
      name: plan.name,
      price: plan.price,
      billingCycle: 1,
      type: 'vps',
      details: `${plan.validation} • ${plan.warranty}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'Chứng chỉ SSL (HTTPS) có thực sự cần thiết cho website không?',
      a: 'Có, cực kỳ quan trọng! Không có SSL, Google Chrome sẽ hiển thị cảnh báo đỏ "Không an toàn" khiến khách hàng rời bỏ website ngay lập tức. Ngoài ra, SSL là tiêu chí bắt buộc để bảo mật thông tin thanh toán, mật khẩu khách hàng và tăng thứ hạng SEO Google.'
    },
    {
      q: 'Sự khác biệt giữa SSL DV, OV và EV là gì?',
      a: 'DV (Domain Validation) chỉ xác thực quyền sở hữu tên miền, cấp trong 5 phút. OV (Organization Validation) và EV (Extended Validation) yêu cầu xác minh giấy phép kinh doanh của công ty, mang lại mức độ tin cậy và giá trị bồi thường bảo hiểm bảo mật cao nhất.'
    },
    {
      q: 'CloudHost có hỗ trợ cài đặt SSL lên máy chủ giúp tôi không?',
      a: 'Có! Đội ngũ kỹ thuật viên của CloudHost hỗ trợ tạo mã CSR, xác thực DNS và cấu hình SSL trực tiếp lên Nginx, Apache, IIS, cPanel hoặc DirectAdmin hoàn toàn miễn phí 24/7.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-600/20 via-teal-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-800/90 border border-slate-700 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-xl">
            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
              <SectigoLogo className="w-4 h-4" />
              <span>Sectigo CA</span>
            </div>
            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
              <DigicertLogo className="w-4 h-4" />
              <span>DigiCert</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>TLS 1.3 256-bit</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Bảo Vệ Người Dùng & Tăng Uy Tín Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-300">
              Chứng Chỉ SSL HTTPS
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Mã hóa 256-bit cấp ngân hàng. Loại bỏ cảnh báo "Không an toàn", tăng 40% tỷ lệ chuyển đổi mua hàng và nâng cao thứ hạng SEO trên Google Search.
          </p>
        </div>
      </section>

      {/* 2. PRICING CARDS */}
      <section className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {sslPlans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl bg-slate-800/90 backdrop-blur-md p-8 border transition-all duration-300 flex flex-col justify-between ${
                plan.popular
                  ? 'border-emerald-500 shadow-2xl shadow-emerald-500/20 ring-2 ring-emerald-500/40 bg-gradient-to-b from-slate-800 to-slate-900 lg:-translate-y-4'
                  : 'border-slate-700/80 shadow-xl hover:border-slate-600 hover:shadow-2xl'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <plan.Logo className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] font-bold text-slate-300">
                    {plan.validation}
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-1">{plan.name}</h3>
                <p className="text-xs text-slate-400 mb-6 min-h-[32px]">{plan.description}</p>

                <div className="mb-6 pb-6 border-b border-slate-700/60">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">
                      {plan.price === 0 ? '0 đ' : plan.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-sm text-slate-400 font-bold">/ năm</span>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">
                    🛡️ Bảo hiểm: {plan.warranty}
                  </p>
                </div>

                <div className="space-y-3 mb-8 text-sm">
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
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02]'
                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>{plan.price === 0 ? 'Kích Hoạt SSL Miễn Phí' : 'Đăng Ký Chứng Chỉ SSL'}</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. REALISTIC VISUAL TRUST & SECURITY ARCHITECTURE */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5" />
              Mã Hóa Đường Truyền Chuẩn TLS 1.3
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Không Thể Đánh Cắp Dữ Liệu Khách Hàng
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Thuật toán mã hóa bất đối xứng khóa RSA 2048-bit và mã hóa đối xứng AES-GCM 256-bit bảo vệ tuyệt đối thông tin thẻ tín dụng, mật khẩu và dữ liệu nhạy cảm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                    alt="Green Padlock Browser Security"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-emerald-600/90 text-white text-[11px] font-black uppercase">
                    Green Lock HTTPS
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Ổ Khóa Xanh Uy Tín Tuyệt Đối</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Trình duyệt hiển thị kết nối bảo mật hoàn hảo, xóa bỏ hoàn toàn thông báo cảnh báo nguy hiểm, giúp khách hàng an tâm mua hàng và thanh toán trực tuyến.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tương thích 100% Google Chrome & iOS</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tăng thứ hạng SEO trên Google Ranking</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-teal-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Fast TLS Handshake 0-RTT"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-teal-600/90 text-white text-[11px] font-black uppercase">
                    TLS 1.3 0-RTT
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Tốc Độ Bắt Tay TLS Siêu Tốc</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Chuẩn giao thức TLS 1.3 tối tân rút ngắn thời gian bắt tay mã hóa xuống chỉ còn 1 round-trip (hoặc 0-RTT khi kết nối lại), giúp website tải cực nhanh.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Giảm 50% độ trễ kết nối HTTPS</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Chống tấn công Man-in-the-Middle</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-cyan-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=800&q=80"
                    alt="Trust Seal Badge"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-cyan-600/90 text-white text-[11px] font-black uppercase">
                    Site Seal Badge
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Huy Hiệu Chứng Nhận Quốc Tế</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Gắn huy hiệu động Sectigo / DigiCert Trust Seal ở chân trang hoặc form thanh toán để khẳng định sự chuyên nghiệp và minh bạch pháp lý của doanh nghiệp.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Nhấp vào hiển thị thông tin bảo hiểm</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Tăng uy tín thương hiệu doanh nghiệp</li>
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
            <p className="text-slate-400 text-xs sm:text-sm">Giải đáp chi tiết thắc mắc trước khi bạn đăng ký SSL</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-400 shrink-0" />
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
        <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 p-8 sm:p-12 border border-emerald-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Bật Ổ Khóa Xanh Bảo Mật Cho Website Của Bạn Ngay
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-8 leading-relaxed">
              Cấp phát chứng chỉ trong 5 phút. Kỹ sư hỗ trợ cài đặt hoàn chỉnh lên server miễn phí.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-105"
              >
                Xem Bảng Giá & Đăng Ký
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Hỗ Trợ Kỹ Thuật 24/7
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
