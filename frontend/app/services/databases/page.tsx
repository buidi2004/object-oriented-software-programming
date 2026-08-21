'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Server, Database, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, HardDrive, Activity, RefreshCw, ShoppingCart, Lock,
  Layers, Key, ChevronDown, ChevronUp, Award, BarChart3, Cloud
} from 'lucide-react';
import { MysqlLogo, PostgresLogo, RedisLogo } from '@/src/components/icons/BrandLogos';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function DatabasesServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [engine, setEngine] = useState<'mysql' | 'postgres' | 'redis'>('mysql');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/managed-database/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load managed database plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: '7d9ae64f-db23-404c-8ed2-3eb39a1e4723',
      name: 'DB Micro (Dev & Test)',
      tagline: 'Lý tưởng cho môi trường Dev/Test, Staging & App nhỏ',
      monthlyPrice: 99000,
      yearlyPrice: 79000 * 12,
      cpu: '1 vCPU Dedicated',
      ram: '1 GB RAM ECC',
      storage: '10 GB NVMe Gen4',
      iops: '3,000 IOPS Dedicated',
      connections: 'Tối đa 100 Kết nối đồng thời',
      features: [
        'Hỗ trợ MySQL 8.0, PostgreSQL 16 hoặc Redis 7.2',
        'Mã hóa SSL/TLS 100% đường truyền',
        'Tự động sao lưu dữ liệu hàng ngày (Lưu 7 ngày)',
        'Bảng điều khiển quản lý trực quan & phpMyAdmin / pgAdmin',
        'Cung cấp chuỗi kết nối URI chuẩn trong 60 giây'
      ],
      badge: null,
      popular: false,
    },
    {
      id: '2bf4b5b1-ec2d-4140-9819-ca61c551078b',
      name: 'DB Standard (Production)',
      tagline: 'Phổ biến cho ứng dụng Web thương mại & API Backend',
      monthlyPrice: 299000,
      yearlyPrice: 239000 * 12,
      cpu: '2 vCPU Dedicated',
      ram: '4 GB RAM ECC',
      storage: '40 GB NVMe Gen4',
      iops: '10,000 IOPS Dedicated',
      connections: 'Tối đa 500 Kết nối đồng thời',
      features: [
        'Hỗ trợ MySQL 8.0, PostgreSQL 16 hoặc Redis 7.2',
        'Cụm High Availability Master-Replica dự phòng',
        'Point-in-Time Recovery (PITR) khôi phục tới từng giây',
        'IP Whitelist Firewall & Bảo mật mạng riêng tư VPC',
        'Tự động tối ưu Buffer Pool & Query Cache',
        'Cam kết SLA Uptime 99.99%'
      ],
      badge: 'Khuyên dùng',
      popular: true,
    },
    {
      id: '38a09ebe-14ae-4a96-b155-8f5c3da8e622',
      name: 'DB Pro (High Availability)',
      tagline: 'Dành cho Hệ thống E-commerce, Fintech & Dữ liệu lớn',
      monthlyPrice: 699000,
      yearlyPrice: 559000 * 12,
      cpu: '4 vCPU Dedicated',
      ram: '8 GB RAM ECC',
      storage: '100 GB NVMe Gen4 Enterprise',
      iops: '25,000 IOPS Dedicated',
      connections: 'Tối đa 2,000 Kết nối đồng thời',
      features: [
        'Hỗ trợ MySQL 8.0, PostgreSQL 16 hoặc Redis 7.2 Cluster',
        'Multi-AZ Failover tự động chuyển vùng trong 3 giây',
        'Read Replica không giới hạn mở rộng tải đọc',
        'Tích hợp In-Memory Query Accelerator',
        'Báo cáo Slow Query tự động và gợi ý Index',
        'Kỹ sư DBA túc trực hỗ trợ tối ưu 24/7'
      ],
      badge: 'Chuyên nghiệp',
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
      name: `${plan.name} (${engine.toUpperCase()}) - ${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'}`,
      price: price,
      billingCycle: cycleMonths,
      type: 'database',
      details: `${plan.cpu} • ${plan.ram} • ${plan.storage}`
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'Managed Database khác gì so với việc tự cài Database trên VPS thông thường?',
      a: 'Managed Database là dịch vụ cơ sở dữ liệu được tự động hóa hoàn toàn: hệ thống tự động vá lỗi bảo mật định kỳ, tối ưu cấu hình kernel/innodb_buffer, tự động sao lưu và khôi phục Point-in-Time, tự động chuyển đổi dự phòng (Failover) khi có sự cố mà không cần bạn phải tốn thời gian quản trị hay thuê DBA.'
    },
    {
      q: 'Tôi có thể kết nối từ bên ngoài (DBeaver, DataGrip, HeidiSQL, Backend Server) được không?',
      a: 'Có, bạn hoàn toàn có thể kết nối từ bất kỳ đâu thông qua chuỗi kết nối tiêu chuẩn có mã hóa SSL. Bạn cũng có thể thiết lập IP Whitelist trong bảng điều khiển để chỉ cho phép các IP máy chủ của bạn truy cập nhằm đảm bảo an toàn tuyệt đối.'
    },
    {
      q: 'Hệ thống sao lưu và khôi phục dữ liệu hoạt động như thế nào?',
      a: 'Dữ liệu được tự động sao lưu hàng ngày và lưu trữ trên cụm Object Storage S3 độc lập. Với tính năng Point-in-Time Recovery (PITR), bạn có thể tua ngược và khôi phục cơ sở dữ liệu về bất kỳ thời điểm nào trong vòng 7-30 ngày gần nhất.'
    },
    {
      q: 'Nếu lượng truy cập tăng đột biến, tôi có thể nâng cấp RAM/CPU mà không bị mất dữ liệu không?',
      a: 'Hoàn toàn được! Bạn có thể nâng cấp gói dịch vụ bất kỳ lúc nào chỉ bằng 1 cú nhấp chuột trong Dashboard. Hệ thống sẽ cấp phát thêm tài nguyên CPU/RAM/Ổ cứng tức thì với thời gian gián đoạn dưới 3 giây.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-teal-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-teal-600/20 via-emerald-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-teal-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-inner">
            <Database className="w-4 h-4 text-teal-400 animate-pulse" />
            Cơ Sở Dữ Liệu Đám Mây Quản Trị Tự Động (Managed Cloud Databases)
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Vận Hành Cơ Sở Dữ Liệu An Toàn Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-400 to-cyan-300">
              High Availability & Tự Động Sao Lưu
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Tập trung hoàn toàn vào viết code ứng dụng. Hãy để CloudHost đảm nhiệm việc vá lỗi, cấu hình Cluster Master-Replica, tự động sao lưu Point-in-Time và tối ưu hiệu năng IOPS.
          </p>

          {/* Engine Selector with Official Brand Logos */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            {[
              { id: 'mysql', label: 'MySQL 8.0 Enterprise', desc: 'InnoDB Engine & Replication', Logo: MysqlLogo },
              { id: 'postgres', label: 'PostgreSQL 16 Pro', desc: 'JSONB, PostGIS & TimescaleDB', Logo: PostgresLogo },
              { id: 'redis', label: 'Redis 7.2 In-Memory', desc: 'Ultra Low-Latency Caching', Logo: RedisLogo },
            ].map((eng) => (
              <button
                key={eng.id}
                onClick={() => setEngine(eng.id as any)}
                className={`px-6 py-3.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-3 border ${
                  engine === eng.id
                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xl shadow-teal-500/30 border-teal-400 scale-105'
                    : 'bg-slate-800/80 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="p-1 rounded-lg bg-white/10 shrink-0">
                  <eng.Logo className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <div className="font-extrabold text-sm text-white">{eng.label}</div>
                  <div className="text-[10px] text-teal-200 opacity-80">{eng.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-2xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30'
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
      <section className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const displayPrice = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl bg-slate-800/90 backdrop-blur-md p-8 border transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-teal-500 shadow-2xl shadow-teal-500/20 ring-2 ring-teal-500/40 bg-gradient-to-b from-slate-800 to-slate-900 lg:-translate-y-4'
                    : 'border-slate-700/80 shadow-xl hover:border-slate-600 hover:shadow-2xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                      <Database className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] font-bold text-slate-300">
                      {plan.connections}
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
                      <Cpu className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{plan.cpu}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Server className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{plan.ram}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <HardDrive className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{plan.storage}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{plan.iops}</span>
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
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white shadow-teal-500/25 hover:shadow-teal-500/40 hover:scale-[1.02]'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Khởi Tạo Database Ngay</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ENTERPRISE ARCHITECTURE & DATA SAFETY */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-bold uppercase tracking-wider mb-3">
              <Shield className="w-3.5 h-3.5" />
              Kiến Trúc Cơ Sở Dữ Liệu Chuẩn Doanh Nghiệp
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Không Lo Mất Dữ Liệu, Sẵn Sàng Vận Hành 24/7
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Mỗi cụm cơ sở dữ liệu được bảo vệ bởi cụm lưu trữ phân tán, tự động sao lưu Snapshot và hệ thống giám sát phân tích truy vấn thời gian thực.
            </p>
          </div>

          {/* 3 Technical Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-teal-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80"
                    alt="High Availability Database Cluster"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-teal-600/90 text-white text-[11px] font-black uppercase">
                    Auto-Failover
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Cụm High Availability 99.99%</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Kiến trúc Master-Replica đồng bộ dữ liệu liên tục. Khi node chính gặp sự cố, hệ thống tự động chuyển giao quyền lực cho node dự phòng trong vòng 3 giây mà không làm đứt kết nối app.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Đồng bộ hóa dữ liệu thời gian thực</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> Tự động chuyển hướng DNS Endpoint</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-emerald-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Automated Backup Snapshot S3"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-emerald-600/90 text-white text-[11px] font-black uppercase">
                    PITR Backup
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Khôi Phục Tới Từng Giây (PITR)</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Ghi nhật ký WAL (Write-Ahead Logging) và tự động tạo snapshot liên tục. Bạn có thể khôi phục trạng thái dữ liệu chính xác về thời điểm trước khi xảy ra lỗi vô ý hoặc thao tác nhầm.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Sao lưu độc lập lên cụm S3</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Tùy chọn khôi phục sang DB instance mới</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-cyan-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                    alt="Cyber Security Firewall & SSL Encrypted"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-cyan-600/90 text-white text-[11px] font-black uppercase">
                    Zero-Trust Security
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Bảo Mật Cấp Ngân Hàng</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Toàn bộ kết nối được mã hóa bằng TLS 1.3. Hỗ trợ cách ly trong mạng riêng ảo (VPC), phân quyền chi tiết theo User/Role và tường lửa IP Whitelisting ngăn chặn mọi truy cập trái phép.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Mã hóa dữ liệu tĩnh (Data at Rest) AES-256</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Giám sát truy cập & Audit Logging chi tiết</li>
              </ul>
            </div>
          </div>

          {/* 4 Feature Badges */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Zap, title: 'Cấp Phát Trong 60 Giây', desc: 'Nhận ngay URI Connection string chuẩn tương thích với mọi framework.' },
              { icon: BarChart3, title: 'Giám Sát Slow Query', desc: 'Bảng phân tích truy vấn chậm và tự động gợi ý Index tối ưu tốc độ.' },
              { icon: RefreshCw, title: 'Nâng Cấp Không Gián Đoạn', desc: 'Tăng dung lượng RAM/CPU/Storage tức thì chỉ bằng 1 cú nhấp chuột.' },
              { icon: Lock, title: 'Tường Lửa IP Whitelist', desc: 'Chỉ cho phép các IP máy chủ chỉ định được phép kết nối vào database.' },
            ].map((feat, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-850 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-3">
                  <feat.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white mb-1">{feat.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
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
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-teal-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-teal-400 shrink-0" />
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
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-emerald-900 to-slate-900 p-8 sm:p-12 border border-teal-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Khởi Tạo Database Cho Ứng Dụng Của Bạn Ngay Hôm Nay
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-8 leading-relaxed">
              Bắt đầu với gói DB Micro chỉ 99.000đ/tháng. Bàn giao chuỗi kết nối an toàn trong 60 giây, hỗ trợ chuyển đổi dữ liệu từ nơi khác sang hoàn toàn miễn phí.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-sm shadow-xl shadow-teal-500/25 transition-all hover:scale-105"
              >
                Xem Bảng Giá & Đặt Mua
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
