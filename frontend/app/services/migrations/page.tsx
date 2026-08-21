'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, ArrowRight, CheckCircle2, Shield, Server, RefreshCw, 
  Database, HardDrive, ShoppingCart, ChevronDown, ChevronUp,
  Clock, Award, Layers, Globe, FileText, Check, Terminal,
  Sliders, ShieldCheck, Activity, Radio, GitBranch
} from 'lucide-react';
import { SiCpanel, SiDocker, SiProxmox, SiWordpress } from 'react-icons/si';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function MigrationsServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Migration Process Step Inspector simulator
  const [activeStep, setActiveStep] = useState<number>(2);

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
      name: 'Di Dời Website Tiêu Chuẩn',
      tier: 'WordPress, PHP, Laravel & Next.js',
      workload: 'Website bán hàng, Blog tin tức & Web ứng dụng đơn lẻ (< 50GB)',
      price: 200000,
      promoNote: 'MIỄN PHÍ khi thuê Hosting/VPS từ 6 tháng',
      turnaround: '2 - 4 Giờ Làm Việc',
      downtime: '0 Giây (Zero-Downtime)',
      support: '1 Kỹ sư phụ trách 1-1',
      features: [
        'Sao chép toàn bộ mã nguồn, cơ sở dữ liệu MySQL và tệp media',
        'Cấu hình tối ưu Nginx Web Server, PHP-FPM và Memcached',
        'Tự động cấp phát chứng chỉ SSL HTTPS Let\'s Encrypt',
        'Cung cấp link Staging để khách hàng nghiệm thu trước khi trỏ DNS',
        'Bảo hành vận hành ổn định trong 30 ngày sau chuyển đổi'
      ],
      popular: false,
    },
    {
      id: 'migration-db-enterprise',
      name: 'Di Dời Cơ Sở Dữ Liệu Lớn',
      tier: 'MySQL, PostgreSQL, MongoDB (> 100GB)',
      workload: 'Hệ thống ERP, Sàn TMĐT nhiều triệu đơn hàng, Big Data & Cụm Replication',
      price: 500000,
      promoNote: 'MIỄN PHÍ khi thuê cụm Managed Database',
      turnaround: 'Trong Ngày (Lên lịch chuyển ban đêm)',
      downtime: 'Chuyển mạch < 30 Giây',
      support: 'Đội ngũ Kỹ sư DBA Chuyên Trách',
      features: [
        'Đồng bộ dữ liệu nền qua Live Binary Log / WAL Streaming',
        'Bảo toàn 100% dữ liệu không xảy ra xung đột giao dịch mới',
        'Tối ưu hóa bảng chỉ mục (Index Optimization) và Buffer Pool',
        'Chuyển đổi IP Virtual Endpoint tự động không ngắt kết nối App',
        'Ký cam kết bảo mật thông tin dữ liệu (NDA) pháp lý'
      ],
      popular: true,
    },
    {
      id: 'migration-vps-cluster',
      name: 'Di Dời Cụm Máy Chủ VPS / DC',
      tier: 'Proxmox, VMware, AWS, GCP, Azure',
      workload: 'Cụm nhiều VPS, Máy chủ vật lý Dedicated & Hệ thống Microservices',
      price: 1200000,
      promoNote: 'MIỄN PHÍ khi thuê Dedicated Server',
      turnaround: 'Lập Kế Hoạch Chi Tiết 24H',
      downtime: 'Chuyển đổi theo từng dịch vụ (Rolling Update)',
      support: 'Senior DevOps Architect Hỗ Trợ 1-1',
      features: [
        'Chuyển đổi ảnh đĩa máy chủ ảo (V2V, P2V) nguyên vẹn 100%',
        'Tái cấu trúc mạng riêng ảo VPC, Firewall và IP Routing',
        'Kiểm thử tải (Load Testing) xác nhận hiệu năng trước khi Go-Live',
        'Kế hoạch dự phòng Rollback tự động nếu phát sinh sự cố',
        'Hỗ trợ giám sát trực tiếp 72 giờ sau khi chính thức chuyển đổi'
      ],
      popular: false,
    },
  ];

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      price: matchingDb?.price ?? dp.price,
    };
  });

  const handleOrder = async (plan: typeof plans[0]) => {
    await addItem(plan.id, 1, false, {
      name: plan.name,
      price: plan.price,
      billingCycle: 1,
      type: 'vps',
      details: `${plan.tier} • ${plan.turnaround}`
    });
    router.push('/cart');
  };

  const migrationSteps = [
    {
      step: 1,
      title: 'Khảo Sát & Lập Kế Hoạch',
      desc: 'Kiểm tra cấu hình máy chủ nguồn, phiên bản phần mềm và ước tính dung lượng dữ liệu cần chuyển.',
      status: 'DONE',
      log: 'Analysis complete: 42GB Source Data (WordPress + MySQL 8.0).'
    },
    {
      step: 2,
      title: 'Đồng Bộ Dữ Liệu Nền (Live Sync)',
      desc: 'Sử dụng rsync và cơ chế streaming replication sao chép dữ liệu ngầm mà không làm chậm máy chủ cũ.',
      status: 'IN PROGRESS',
      log: 'Streaming WAL logs... Transferred: 38.5GB / 42GB (91.6%).'
    },
    {
      step: 3,
      title: 'Kiểm Thử Môi Trường Staging',
      desc: 'Khởi chạy website trên địa chỉ IP nội bộ của SEN CloudHost để khách hàng duyệt thử nghiệm 100% chức năng.',
      status: 'PENDING',
      log: 'Staging preview URL generated: http://staging-preview.sencloudhost.vn'
    },
    {
      step: 4,
      title: 'Chuyển Đổi DNS & Go-Live',
      desc: 'Đồng bộ lần cuối các giao dịch mới phát sinh trong 1 phút và cập nhật bản ghi DNS sang server mới.',
      status: 'PENDING',
      log: 'Zero-Downtime cutover scheduled with 30s TTL.'
    }
  ];

  const faqs = [
    {
      q: 'Quy trình di dời dữ liệu có làm gián đoạn (Downtime) hoạt động của website không?',
      a: 'Hoàn toàn KHÔNG! Chúng tôi áp dụng quy trình đồng bộ nền (Live Sync). Website ở nhà cung cấp cũ vẫn hoạt động bình thường cho khách hàng truy cập. Chỉ khi toàn bộ dữ liệu đã được sao chép và kiểm thử hoàn chỉnh trên máy chủ mới, kỹ thuật viên mới thực hiện chuyển đổi DNS trong 30 giây.'
    },
    {
      q: 'Chính sách MIỄN PHÍ chuyển đổi dữ liệu áp dụng cho những trường hợp nào?',
      a: 'Toàn bộ khách hàng khi đăng ký mới bất kỳ dịch vụ Web Hosting, Cloud VPS, Managed Database hoặc Dedicated Server tại SEN CloudHost từ 6 tháng trở lên đều được MIỄN PHÍ 100% dịch vụ di dời dữ liệu.'
    },
    {
      q: 'Tôi cần cung cấp những thông tin gì để bắt đầu chuyển đổi?',
      a: 'Bạn chỉ cần cung cấp thông tin đăng nhập bảng điều khiển cũ (cPanel, DirectAdmin, Plesk, CyberPanel) hoặc tài khoản SSH / SFTP máy chủ cũ. Đội ngũ kỹ sư SEN CloudHost sẽ thực hiện toàn bộ các bước còn lại.'
    },
    {
      q: 'Dữ liệu khách hàng và cơ sở dữ liệu của tôi có được bảo mật an toàn không?',
      a: 'Chúng tôi cam kết bảo mật 100% thông tin theo thỏa thuận NDA. Toàn bộ tiến trình truyền tải được mã hóa SSH/TLS và kỹ thuật viên chỉ truy cập đúng phạm vi thư mục cần di dời.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-teal-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: ZERO-DOWNTIME MIGRATION TELEMETRY */}
      <section className="relative pt-16 pb-20 border-b border-slate-800/80 overflow-hidden">
        {/* Technical Grid Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #14b8a6 1px, transparent 1px), linear-gradient(to bottom, #14b8a6 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-teal-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Engineering Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-teal-400 font-bold">
                <RefreshCw className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                MIGRATION ENGINE: ZERO-DOWNTIME LIVE SYNC
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline">
                DATA INTEGRITY: <strong className="text-emerald-400 font-mono">100% Guaranteed</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>SERVICE DOWNTIME: <strong className="text-emerald-400 font-mono">0 Giây</strong></span>
              <span>ENGINEER SUPPORT: <strong className="text-white font-mono">1-1 Chuyên Trách 24/7</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-teal-950/60 border border-teal-800/60 text-teal-300 text-xs font-mono">
                <Zap className="w-3.5 h-3.5 text-teal-400" />
                ZERO-DOWNTIME CLOUD MIGRATION SERVICE
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Di Dời Dữ Liệu An Toàn Với{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300 font-mono">
                  Zero-Downtime Live Sync
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Không gián đoạn người dùng, không thất thoát đơn hàng. Đội ngũ kỹ sư cấp cao của SEN CloudHost trực tiếp 
                chuyển đổi toàn bộ website, cơ sở dữ liệu và cụm máy chủ sang hạ tầng mới hoàn toàn MIỄN PHÍ.
              </p>

              {/* Supported Platforms */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiCpanel className="w-4 h-4 text-amber-500" />
                  <span>cPanel / DirectAdmin</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiProxmox className="w-4 h-4 text-orange-500" />
                  <span>Proxmox / VMware KVM</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-800 text-xs font-mono text-slate-300">
                  <SiDocker className="w-4 h-4 text-sky-400" />
                  <span>Docker Containers</span>
                </div>
              </div>

              {/* Free Guarantee Notice */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Promotion: <strong className="text-emerald-400">MIỄN PHÍ 100%</strong></span>
                  <span>Guarantee: <strong className="text-white">Bảo toàn dữ liệu 100%</strong></span>
                </div>
                <div className="text-slate-400">
                  Scope: <span className="text-slate-300">Áp dụng cho mọi đơn hàng Hosting / VPS / Database / Dedicated từ 6 tháng.</span>
                </div>
              </div>

            </div>

            {/* Right 4-Step Interactive Timeline Inspector */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0b1320] border border-slate-800 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">migration-orchestrator.sen</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-950/80 text-teal-400 border border-teal-800/60">
                    LIVE SYNCING
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {migrationSteps.map((s, idx) => (
                    <div
                      key={s.step}
                      onClick={() => setActiveStep(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        activeStep === idx
                          ? 'bg-[#131d31] border-teal-500 shadow-md shadow-teal-500/10'
                          : 'bg-[#060a12] border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-bold ${activeStep === idx ? 'text-white' : 'text-slate-300'}`}>
                          Bước {s.step}: {s.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          s.status === 'DONE' 
                            ? 'bg-emerald-950 text-emerald-400' 
                            : s.status === 'IN PROGRESS'
                            ? 'bg-teal-950 text-teal-300 animate-pulse'
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">{s.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-[#060a12] border border-slate-800 text-[11px] font-mono text-teal-300">
                  <div className="text-slate-500 text-[10px] uppercase mb-1">// Active Step Log:</div>
                  <div>{migrationSteps[activeStep].log}</div>
                </div>

                <div className="pt-2">
                  <a
                    href="#spec-matrix"
                    className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-600/20"
                  >
                    <span>XEM BẢNG GÓI DỊCH VỤ VÀ ĐẶT LỊCH</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. THREE CORE MIGRATION ARCHITECTURE SCHEMATICS */}
      <section className="py-24 bg-[#070b12] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-950 text-teal-400 text-xs font-mono mb-3 border border-teal-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              MIGRATION GUARANTEE STANDARDS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              3 Cam Kết Kỹ Thuật Khi Di Dời Dữ Liệu
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Được thực hiện bởi các kỹ sư giàu kinh nghiệm, đảm bảo an toàn tuyệt đối cho cơ sở dữ liệu.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Schematic 1: Zero-Downtime Live Sync */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>LIVE SYNC STREAMING</span>
                    <span className="text-emerald-400">0s DOWNTIME</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Source Old Server</span>
                      <span className="text-emerald-400 font-bold">100% Online</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Background Data Sync</span>
                      <span className="text-sky-400">rsync + WAL Replication</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Cutover Switch</span>
                      <span className="text-teal-300 font-bold">Instant DNS Update</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Đồng Bộ Nền Không Gián Đoạn (Zero-Downtime)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Máy chủ cũ tiếp tục phục vụ người dùng bình thường trong suốt quá trình truyền tải dữ liệu. 
                  Mọi đơn hàng hay bài viết mới phát sinh đều được đồng bộ tức thời trước khi trỏ tên miền chính thức.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Business Interruption:</span>
                <strong className="text-emerald-400">0 Giây Downtime</strong>
              </div>
            </div>

            {/* Schematic 2: Staging Inspection */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>STAGING PREVIEW ENVIRONMENT</span>
                    <span className="text-sky-400">VERIFY FIRST</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Staging Host IP</span>
                      <span className="text-sky-400">Isolated Container</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>User Acceptance Test</span>
                      <span className="text-amber-400 font-bold">Checkout &amp; DB Verify</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Customer Approval</span>
                      <span className="text-emerald-400 font-bold">Confirmed Go-Live</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Kiểm Thử Staging Trước Khi Go-Live</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Chúng tôi khởi tạo môi trường Staging riêng biệt để bạn trực tiếp kiểm tra mọi tính năng 
                  (thanh toán, đăng nhập, tải ảnh, gửi mail) hoạt động hoàn hảo trước khi đổi bản ghi DNS.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Approval Process:</span>
                <strong className="text-sky-400">Khách Hàng Duyệt 100%</strong>
              </div>
            </div>

            {/* Schematic 3: Rollback Guarantee */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>FAILSAFE &amp; ROLLBACK PLAN</span>
                    <span className="text-teal-400">100% SAFE</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Pre-migration Snapshot</span>
                      <span className="text-slate-300">Full Backup S3</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Old Server Retention</span>
                      <span className="text-emerald-400 font-bold">Giữ nguyên 7 ngày</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span>Emergency Rollback</span>
                      <span className="text-teal-300 font-bold">&lt; 1 Phút Phục hồi</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Kế Hoạch Dự Phòng Rollback An Toàn</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Máy chủ cũ và toàn bộ dữ liệu gốc luôn được giữ nguyên vẹn trong suốt quá trình. 
                  Nếu có bất kỳ sự cố bất ngờ nào xảy ra, hệ thống có thể khôi phục lại trạng thái cũ ngay lập tức.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Data Risk:</span>
                <strong className="text-emerald-400">0% Rủi Ro Mất Dữ Liệu</strong>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-950 text-teal-400 text-xs font-mono mb-3 border border-teal-800">
                <Sliders className="w-3.5 h-3.5" />
                MIGRATION SERVICE SPEC SHEET
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Bảng So Sánh Các Gói Dịch Vụ Di Dời Dữ Liệu
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-normal">
                Miễn phí 100% khi thuê dịch vụ lưu trữ từ 6 tháng tại SEN CloudHost.
              </p>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="rounded-2xl border border-slate-800 bg-[#0c1322] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#080d17] text-slate-400">
                    <th className="p-5 font-bold uppercase text-[11px] w-1/4">Thông Số Dịch Vụ</th>
                    {plans.map((p) => (
                      <th key={p.id} className="p-5 text-white border-l border-slate-800/80 w-1/4">
                        <div className="text-sm font-extrabold text-white">{p.name}</div>
                        <div className="text-[11px] text-slate-400 font-sans font-normal">{p.tier}</div>
                        <div className="text-lg font-black text-teal-400 mt-2">
                          {p.price.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ/lần</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Thời Gian Hoàn Tất</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-white font-bold">{p.turnaround}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Thời Gian Gián Đoạn (Downtime)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">{p.downtime}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Cấp Độ Kỹ Sư Phụ Trách</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-sky-400 font-bold">{p.support}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Chính Sách Khuyến Mãi</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">{p.promoNote}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Môi Trường Kiểm Thử Staging</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-slate-200">Bàn giao trước khi trỏ DNS</td>
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
                              ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <span>Yêu Cầu Chuyển Đổi Ngay</span>
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Câu Hỏi Thường Gặp Về Di Dời Dữ Liệu</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST MIGRATION FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0c1322] rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:text-teal-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-teal-400 shrink-0" />
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
        <div className="rounded-3xl bg-gradient-to-r from-[#0a1e1b] via-[#061210] to-[#0a1e1b] p-8 sm:p-12 border border-teal-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-950 border border-teal-800 text-teal-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              FREE MIGRATION GUARANTEE
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Sẵn Sàng Chuyển Website &amp; Dữ Liệu Sang SEN CloudHost?
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Hoàn toàn miễn phí khi đăng ký Hosting, VPS hoặc Database. Đội ngũ kỹ sư Level 3 hỗ trợ trọn gói từ A-Z.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('spec-matrix');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs font-mono shadow-xl shadow-teal-600/25 transition-all hover:scale-105"
              >
                Yêu Cầu Chuyển Đổi Ngay
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono border border-slate-700 transition-all"
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
