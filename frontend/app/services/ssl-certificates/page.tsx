'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Lock, CheckCircle2, ArrowRight, Shield, 
  Zap, Award, Globe, Key, AlertTriangle, ChevronDown, 
  ChevronUp, RefreshCw, ShoppingCart, Activity, Layers,
  Terminal, Sliders, Check, Copy, Sparkles, FileText, CheckCircle
} from 'lucide-react';
import { SectigoLogo, DigicertLogo } from '@/src/components/icons/BrandLogos';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function SslCertificatesPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'yearly' | 'two_year'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // SSL Certificate Inspector Simulator state
  const [inspectDomain, setInspectDomain] = useState('sencloudhost.vn');
  const [tlsVersion, setTlsVersion] = useState<'1.3' | '1.2'>('1.3');

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/ssl-certificates/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load SSL plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const [defaultPlans, setDefaultPlans] = useState([

    {
      id: '26471cb7-3e11-47fa-bba7-f3708e923e2e',
      name: 'Sectigo PositiveSSL (DV)',
      ca: 'Sectigo CA (Comodo)',
      type: 'Domain Validation (DV)',
      workload: 'Website cá nhân, Blog, Landing Page & Web doanh nghiệp vừa và nhỏ',
      yearlyPrice: 199000,
      twoYearPrice: 350000,
      warranty: '$10,000 USD',
      subdomains: '1 Domain duy nhất (domain.com & www)',
      issueTime: 'Cấp phát trong 5 Phút (Xác thực DNS)',
      trustLevel: '99.9% Trình duyệt & Mobile',
      features: [
        'Mã hóa 256-bit SHA-256 / RSA 2048-bit & ECC',
        'Xác thực quyền sở hữu tên miền qua bản ghi DNS / Email',
        'Biểu tượng ổ khóa bảo mật trên Chrome, Safari, Firefox',
        'Tương thích 100% chuẩn TLS 1.3 và HTTP/3',
        'Kỹ sư SEN CloudHost hỗ trợ cài đặt lên máy chủ miễn phí'
      ],
      popular: false,
    },
    {
      id: 'f9411986-7a71-46be-a9f4-8395bbd15c7e',
      name: 'Sectigo Wildcard SSL (*.domain)',
      ca: 'Sectigo CA (Comodo)',
      type: 'Wildcard Domain (DV)',
      workload: 'Bảo vệ không giới hạn tất cả subdomain (*.yourdomain.com)',
      yearlyPrice: 1290000,
      twoYearPrice: 2300000,
      warranty: '$10,000 USD',
      subdomains: 'Không giới hạn Subdomains (*.domain.com)',
      issueTime: 'Cấp phát trong 10 Phút',
      trustLevel: '99.9% Trình duyệt & Mobile',
      features: [
        'Bảo vệ tên miền chính và TOÀN BỘ subdomain con không giới hạn',
        'Tiết kiệm chi phí khi chạy nhiều dịch vụ (api, app, mail, cdn)',
        'Mã hóa cấp cao 256-bit với thuật toán RSA / ECDSA',
        'Tự động gia hạn và tái cấp phát không giới hạn số lần',
        'Tặng huy hiệu bảo mật Sectigo Site Seal động'
      ],
      popular: true,
    },
    {
      id: 'a9477e38-9276-4740-9a3b-31295b9d3161',
      name: 'DigiCert EV Secure Site',
      ca: 'DigiCert Worldwide CA',
      type: 'Extended Validation (EV)',
      workload: 'Ngân hàng, Sàn TMĐT, Cổng thanh toán & Tập đoàn tài chính',
      yearlyPrice: 6500000,
      twoYearPrice: 11900000,
      warranty: '$1,750,000 USD (Cực lớn)',
      subdomains: '1 Domain (Kèm chứng nhận Doanh nghiệp)',
      issueTime: '1 - 3 Ngày (Thẩm định giấy phép ĐKKD)',
      trustLevel: '100% Cấp độ xác thực tối cao',
      features: [
        'Mức bảo hiểm đền bù sự cố $1,750,000 USD',
        'Xác minh pháp lý doanh nghiệp minh bạch tuyệt đối',
        'Bảo vệ chống giả mạo thương hiệu và Phishing lừa đảo',
        'Tích hợp tính năng quét lỗ hổng mã độc Malware hàng ngày',
        'Đội ngũ thẩm định pháp lý DigiCert hỗ trợ hoàn thiện hồ sơ'
      ],
      popular: false,
    },
  ]);

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      yearlyPrice: matchingDb?.yearlyPrice || dp.yearlyPrice,
      twoYearPrice: matchingDb?.twoYearPrice || dp.twoYearPrice,
    };
  });


  useEffect(() => {
    import('@/src/lib/api').then(({ api }) => {
      api.get('/categories/ssl-certificate/plans').then(res => {
        const dbPlans = res.data?.plans || [];
        if (dbPlans.length > 0) {
          setDefaultPlans(prev => prev.map((p, index) => {
            const dbP = dbPlans[index] || dbPlans[dbPlans.length - 1];
            return {
              ...p,
              id: dbP.id || p.id,
              monthlyPrice: dbP.monthlyPrice || Math.round((dbP.yearlyPrice || 0) / 12),
              yearlyPrice: dbP.yearlyPrice || ((dbP.monthlyPrice || 0) * 12),
              price: dbP.monthlyPrice || Math.round((dbP.yearlyPrice || 0) / 12)
            };
          }));
        }
      });
    });
  }, []);

  const handleOrder = async (plan: typeof plans[0]) => {
    const price = billingCycle === 'two_year' ? plan.twoYearPrice : plan.yearlyPrice;
    await addItem(plan.id, 12, false, {
      name: `${plan.name} - ${billingCycle === 'two_year' ? '2 Năm' : '1 Năm'}`,
      price: price,
      billingCycle: 12,
      type: 'ssl',
      details: `${plan.type} • Bảo hiểm ${plan.warranty}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'Sự khác biệt giữa chứng chỉ SSL DV, Wildcard và EV là gì?',
      a: '1) DV (Domain Validation): Xác thực quyền sở hữu tên miền tự động qua DNS trong 5 phút, phù hợp mọi website; 2) Wildcard: Bảo vệ tên miền chính và không giới hạn mọi tên miền con (*.domain.com); 3) EV (Extended Validation): Thẩm định giấy phép kinh doanh của doanh nghiệp, mang lại mức bảo hiểm $1,750,000 USD và độ tin cậy tối đa cho ngân hàng/thương mại điện tử.'
    },
    {
      q: 'Tại sao nên mua SSL trả phí từ Sectigo/DigiCert thay vì dùng Let\'s Encrypt miễn phí?',
      a: 'Chứng chỉ thương mại từ Sectigo/DigiCert cung cấp: Hợp đồng bảo hiểm tài chính khi bị giải mã trái phép ($10,000 - $1,750,000 USD), thời hạn sử dụng 1-2 năm không lo hết hạn mỗi 90 ngày, tương thích 100% với các thiết bị di động/SmartTV cũ, và đi kèm huy hiệu Site Seal uy tín.'
    },
    {
      q: 'Sau khi thanh toán, tôi cần làm gì để nhận file chứng chỉ SSL?',
      a: 'Bạn chỉ cần tạo mã CSR (hoặc để kỹ thuật viên SEN CloudHost hỗ trợ tạo giúp) và thêm 1 bản ghi CNAME vào cấu hình DNS của tên miền. Sau khi hệ thống xác thực hoàn tất trong 5 phút, file chứng chỉ (.crt, .ca-bundle) sẽ được gửi tới bạn.'
    },
    {
      q: 'SEN CloudHost có hỗ trợ cài đặt chứng chỉ SSL lên máy chủ hosting/VPS không?',
      a: 'Có! Kỹ thuật viên của chúng tôi sẽ hỗ trợ cài đặt hoàn toàn miễn phí lên Nginx, Apache, IIS, cPanel, Plesk, DirectAdmin hoặc bất kỳ hạ tầng nào của bạn 24/7.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: SSL/TLS CERTIFICATE TELEMETRY */}
      <section className="relative pt-16 pb-20 border-b border-slate-200/80 overflow-hidden">
        {/* Technical Grid Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #10b981 1px, transparent 1px), linear-gradient(to bottom, #10b981 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-emerald-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                SECURITY PROTOCOL: TLS 1.3 256-BIT ENCRYPTION
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-700 hidden sm:inline">
                CA AUTHORITIES: <strong className="text-slate-900 font-mono">Sectigo &amp; DigiCert Worldwide</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <span>WARRANTY: <strong className="text-emerald-400 font-mono">Up to $1.75M USD</strong></span>
              <span>COMPATIBILITY: <strong className="text-slate-900 font-mono">99.9% Browsers</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                OFFICIAL SECTIGO &amp; DIGICERT CA CERTIFICATES
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Bảo Vệ Website Với{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 font-mono">
                  Chứng Chỉ SSL / TLS
                </span>
              </h1>

              <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Mã hóa 100% dữ liệu truyền tải với chuẩn TLS 1.3 256-bit. 
                Loại bỏ cảnh báo không an toàn trên trình duyệt, tăng điểm SEO Google và bảo hiểm tài chính lên đến 1,750,000 USD.
              </p>

              {/* CA Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-200 text-xs font-mono text-slate-700">
                  <SectigoLogo className="w-4 h-4" />
                  <span>Sectigo CA (Comodo)</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-200 text-xs font-mono text-slate-700">
                  <DigicertLogo className="w-4 h-4" />
                  <span>DigiCert EV Enterprise</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-200 text-xs font-mono text-slate-700">
                  <Lock className="w-4 h-4 text-amber-400" />
                  <span>Green Padlock Trust</span>
                </div>
              </div>

              {/* Handshake Details */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Cryptographic Cipher: <strong className="text-slate-900">TLS_AES_256_GCM_SHA384</strong></span>
                  <span>Handshake: <strong className="text-emerald-400">0-RTT Resumption</strong></span>
                </div>
                <div className="text-slate-600">
                  Site Seal: <span className="text-slate-700">Huy hiệu tín nhiệm tương tác động tăng 42% tỷ lệ chốt đơn</span>
                </div>
              </div>

            </div>

            {/* Right Certificate Inspector Simulator */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0b1320] border border-slate-200 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-mono text-emerald-400 font-bold">https://{inspectDomain}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    VALID (SECURE)
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 space-y-2 font-mono text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issued To:</span>
                    <span className="text-slate-900 font-bold">{inspectDomain}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Issued By:</span>
                    <span className="text-sky-400">Sectigo RSA Domain Validation Secure Server CA</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Key Exchange:</span>
                    <span className="text-emerald-400 font-bold">ECDHE-RSA-AES256-GCM-SHA384</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">OCSP Stapling:</span>
                    <span className="text-emerald-400">Enabled (Fast Verification)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-xl bg-[#0e1627] border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Handshake Latency</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">&lt; 3.8 ms</div>
                    <div className="text-[10px] text-slate-500">TLS 1.3 0-RTT</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0e1627] border border-slate-200">
                    <div className="text-[10px] text-slate-500 uppercase">Browser Trust</div>
                    <div className="text-base font-extrabold text-sky-400 mt-0.5">100% Verified</div>
                    <div className="text-[10px] text-slate-500">Chrome, Safari, iOS</div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#spec-matrix"
                    className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <span>XEM BẢNG CHỨNG CHỈ VÀ ĐẶT MUA</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. THREE CORE SSL ARCHITECTURE SCHEMATICS */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 text-xs font-mono mb-3 border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              CRYPTOGRAPHIC STANDARDS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              3 Giá Trị Cốt Lõi Của Chứng Chỉ SSL Chính Hãng
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Đảm bảo an toàn giao dịch tài chính, dữ liệu mật khẩu người dùng và uy tín thương hiệu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Schematic 1: TLS 1.3 0-RTT Handshake */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>TLS 1.3 0-RTT HANDSHAKE</span>
                    <span className="text-emerald-400">1-ROUND TRIP</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>TLS 1.2 Cũ (2 Round-Trips)</span>
                      <span className="text-rose-400">80 - 120ms</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>TLS 1.3 Mới (1 Round-Trip)</span>
                      <span className="text-emerald-400 font-bold">20 - 40ms</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>0-RTT Reconnection</span>
                      <span className="text-sky-400 font-bold">&lt; 5ms Tức thì</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Bắt Tay Mã Hóa TLS 1.3 Siêu Tốc</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Giao thức TLS 1.3 loại bỏ các thuật toán mã hóa lỗi thời, giảm 50% thời gian thiết lập kết nối mã hóa 
                  giúp website tải nhanh hơn và bảo vệ chống lại các hình thức tấn công nghe lén Man-in-the-Middle.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Speed Improvement:</span>
                <strong className="text-emerald-400">+40% Tốc độ mở trang</strong>
              </div>
            </div>

            {/* Schematic 2: Insurance Warranty */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>FINANCIAL WARRANTY</span>
                    <span className="text-sky-400">$1,750,000 USD</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Sectigo PositiveSSL</span>
                      <span className="text-slate-700">$10,000 USD</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Sectigo Wildcard</span>
                      <span className="text-slate-700">$10,000 USD</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>DigiCert EV Secure</span>
                      <span className="text-emerald-400 font-bold">$1,750,000 USD</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Bảo Hiểm Tài Chính Quốc Tế</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cam kết bồi thường thiệt hại tài chính từ các tổ chức CA hàng đầu thế giới nếu xảy ra sự cố 
                  chứng chỉ bị giả mạo hoặc giải mã trái phép, mang lại sự an tâm tuyệt đối cho khách hàng giao dịch.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Underwritten By:</span>
                <strong className="text-sky-400">Sectigo &amp; DigiCert Global</strong>
              </div>
            </div>

            {/* Schematic 3: Site Seal & SEO Boost */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>SEAL &amp; GOOGLE SEO RANKING</span>
                    <span className="text-amber-400">TOP 1 TRUST</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Google Ranking Signal</span>
                      <span className="text-emerald-400 font-bold">+15% Điểm SEO</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Checkout Conversion</span>
                      <span className="text-amber-400 font-bold">+42% Tỷ lệ mua</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Browser Warning</span>
                      <span className="text-emerald-400 font-bold">Loại bỏ 100%</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Tăng Uy Tín &amp; Tối Ưu Thứ Hạng SEO</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Google ưu tiên xếp hạng cao hơn cho các website kích hoạt HTTPS hợp lệ. 
                  Biểu tượng ổ khóa an toàn và huy hiệu Site Seal giúp khách hàng tin tưởng nhập thông tin thẻ và chuyển khoản.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Google Algorithm:</span>
                <strong className="text-emerald-400">HTTPS Ranking Boost Active</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. TECHNICAL SPECIFICATION MATRIX & PRICING */}
      <section id="spec-matrix" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950 text-emerald-400 text-xs font-mono mb-3 border border-emerald-800">
                <Sliders className="w-3.5 h-3.5" />
                SSL CERTIFICATE SPEC SHEET
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Bảng So Sánh Các Gói Chứng Chỉ SSL
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 font-normal">
                Bảo vệ 100% kết nối cho trang web, cổng API và ứng dụng di động.
              </p>
            </div>

            {/* Billing Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200 font-mono text-xs">
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  billingCycle === 'yearly'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1 Năm
              </button>
              <button
                onClick={() => setBillingCycle('two_year')}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'two_year'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>2 Năm</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  -15%
                </span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#080d17] text-slate-600">
                    <th className="p-5 font-bold uppercase text-[11px] w-1/4">Thông Số Chứng Chỉ</th>
                    {plans.map((p) => {
                      const displayPrice = billingCycle === 'two_year' ? Math.round(p.twoYearPrice / 2) : p.yearlyPrice;
                      return (
                        <th key={p.id} className="p-5 text-slate-900 border-l border-slate-200/80 w-1/4">
                          <div className="text-sm font-extrabold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-600 font-sans font-normal">{p.type}</div>
                          <div className="text-lg font-black text-emerald-400 mt-2">
                            {displayPrice.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-600">đ/năm</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-700">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Tổ Chức Phát Hành (CA)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-900 font-bold">{p.ca}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Phạm Vi Tên Miền Bảo Vệ</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-emerald-400 font-bold">{p.subdomains}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Mức Bảo Hiểm Sự Cố</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-sky-400 font-bold">{p.warranty}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Thời Gian Cấp Phát</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-900 font-bold">{p.issueTime}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Huy Hiệu Site Seal Tín Nhiệm</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-800">Động (Dynamic Interactive)</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Hỗ Trợ Cài Đặt Miễn Phí 24/7</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-emerald-400 font-bold">100% Miễn Phí</td>
                    ))}
                  </tr>
                  <tr className="bg-[#080d17]">
                    <td className="p-5 font-bold text-slate-600">Hành Động Khởi Tạo</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-5 border-l border-slate-200/60">
                        <button
                          onClick={() => handleOrder(p)}
                          className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            p.popular
                              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <span>Đăng Ký Chứng Chỉ Ngay</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 4. FAQ SECTION */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Câu Hỏi Thường Gặp Về Chứng Chỉ SSL</h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST SSL CERTIFICATES FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:text-emerald-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-emerald-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-700 leading-relaxed border-t border-slate-200/60 pt-3 font-normal">
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
        <div className="rounded-3xl bg-gradient-to-r from-[#0a1e16] via-[#06120d] to-[#0a1e16] p-8 sm:p-12 border border-emerald-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              ISSUANCE IN 5 MINUTES
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Kích Hoạt Ổ Khóa Xanh HTTPS Cho Website Của Bạn Ngay
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Chỉ từ 199.000đ/năm. Cấp phát tự động qua DNS trong 5 phút và đội ngũ kỹ sư hỗ trợ cài đặt lên máy chủ miễn phí.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('spec-matrix');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-xl shadow-emerald-600/25 transition-all hover:scale-105"
              >
                Đăng Ký Chứng Chỉ Ngay
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs font-mono border border-slate-300 transition-all"
              >
                Tư Vấn Doanh Nghiệp EV
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
