'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HardDrive, Server, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, Activity, RefreshCw, ShoppingCart, Lock, Globe,
  DownloadCloud, Layers, Key, ChevronDown, ChevronUp, Award, BarChart3, Database
} from 'lucide-react';
import { MinioLogo, AwsS3Logo } from '@/src/components/icons/BrandLogos';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function ObjectStorageServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await api.get('/categories/object-storage/plans');
        if (res.data?.plans?.length) {
          setDbPlans(res.data.plans);
        }
      } catch (err) {
        console.warn('Could not load storage plans from API', err);
      }
    }
    loadPlans();
  }, []);

  const defaultPlans = [
    {
      id: '8f7f1c19-3186-40c6-80c4-fc53d2e70378',
      name: 'S3 Storage Starter (50GB)',
      tagline: 'Phù hợp lưu trữ Media, Ảnh Web, Tệp đính kèm & Backup nhỏ',
      monthlyPrice: 50000,
      yearlyPrice: 50000 * 12 * 0.8,
      capacity: '50 GB Dung Lượng S3 NVMe',
      bandwidth: '1 TB Băng Thông Tải Ra (Egress)/tháng',
      buckets: 'Không giới hạn số lượng Buckets',
      features: [
        'Chuẩn giao tiếp AWS S3 Compatible API 100%',
        'Tương thích Cyberduck, S3 Browser, rclone, AWS CLI',
        'Tạo Pre-signed URL chia sẻ tệp có thời hạn bảo mật',
        'Lưu trữ phân tán Erasure Coding an toàn 99.9999%',
        'Cấp phát cặp mã Access Key & Secret Key tức thì'
      ],
      badge: null,
      popular: false,
    },
    {
      id: 'd68a4605-3dda-4a08-9898-c12647c4e5d7',
      name: 'S3 Storage Pro (250GB)',
      tagline: 'Lựa chọn tốt nhất cho Web Video, E-learning, App Mobile & Ảnh',
      monthlyPrice: 200000,
      yearlyPrice: 200000 * 12 * 0.8,
      capacity: '250 GB Dung Lượng S3 NVMe',
      bandwidth: '5 TB Băng Thông Tải Ra (Egress)/tháng',
      buckets: 'Không giới hạn Buckets + Tùy biến CORS',
      features: [
        'Chuẩn giao tiếp AWS S3 Compatible API 100%',
        'Tốc độ đọc ghi Multi-part Upload siêu tốc 10Gbps',
        'Hỗ trợ gắn Custom Domain CDN (https://cdn.yourdomain.com)',
        'Bảo mật mã hóa tự động Server-Side Encryption (SSE-S3)',
        'Báo cáo chi tiết dung lượng lưu trữ & lưu lượng thời gian thực',
        'Cam kết SLA Độ bền dữ liệu 99.999999999% (11 số 9)'
      ],
      badge: 'Phổ biến nhất',
      popular: true,
    },
    {
      id: 'e2eeefc0-8035-42ec-8646-fd9403181ef6',
      name: 'S3 Storage Enterprise (1TB)',
      tagline: 'Dành cho Kho dữ liệu lớn, Big Data, Video Streaming & Backup tổng',
      monthlyPrice: 690000,
      yearlyPrice: 690000 * 12 * 0.8,
      capacity: '1,000 GB (1TB) Dung Lượng S3 NVMe',
      bandwidth: 'Băng Thông Tải Ra Không Giới Hạn',
      buckets: 'Không giới hạn Buckets + Multi-Region Sync',
      features: [
        'Chuẩn giao tiếp AWS S3 Compatible API 100%',
        'Multi-Region Replication đồng bộ dữ liệu giữa 2 miền Bắc - Nam',
        'Tốc độ truyền tải nội địa siêu tốc không tính phí Data Transfer',
        'Phân quyền chi tiết qua IAM Policy & Bucket Policy JSON',
        'Tích hợp tự động Lifecycle Rules xóa/nén tệp cũ',
        'Kỹ sư hỗ trợ chuyển đổi dữ liệu từ AWS S3 / Wasabi sang miễn phí'
      ],
      badge: 'Dung lượng khủng',
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
      type: 'storage',
      details: plan.capacity
    });
    router.push('/cart');
  };

  const faqs = [
    {
      q: 'CloudHost S3 Storage có tương thích hoàn toàn với AWS S3 không?',
      a: 'Hoàn toàn tương thích 100%! Bạn có thể sử dụng bất kỳ SDK hay công cụ nào hỗ trợ S3 API như AWS SDK (NodeJS, Python Boto3, PHP, Go, C# .NET), AWS CLI, Cyberduck, S3 Browser, FileZilla Pro, rclone, Nextcloud S3 Driver chỉ cần đổi Endpoint URL về server CloudHost.'
    },
    {
      q: 'Dữ liệu của tôi được lưu trữ và bảo vệ như thế nào?',
      a: 'Hệ thống áp dụng công nghệ Erasure Coding phân tán dữ liệu thành nhiều mảnh lưu trữ trên các cụm máy chủ và ổ cứng NVMe độc lập. Ngay cả khi 2 ổ cứng hoặc 1 máy chủ vật lý bị hỏng đồng thời, dữ liệu của bạn vẫn nguyên vẹn 100% mà không bị gián đoạn đọc/ghi.'
    },
    {
      q: 'Tôi có thể gắn tên miền riêng cho S3 Bucket làm CDN không?',
      a: 'Có, bạn có thể dễ dàng cấu hình CNAME từ tên miền của bạn (ví dụ media.yourdomain.com hoặc static.yourdomain.com) trỏ trực tiếp vào S3 Bucket và gắn chứng chỉ SSL HTTPS miễn phí.'
    },
    {
      q: 'Chi phí băng thông tải ra (Egress Traffic) tính như thế nào?',
      a: 'Khác với AWS S3 tính phí băng thông tải ra đắt đỏ ($0.09/GB), CloudHost cung cấp dung lượng băng thông tải ra cực lớn (1TB - 5TB/tháng hoặc Không giới hạn ở gói Enterprise) với mức giá trọn gói siêu tiết kiệm.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-blue-500 selection:text-white">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-32 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-40 -left-20 w-80 h-80 bg-cyan-500/15 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-800/90 border border-slate-700 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6 shadow-xl">
            <div className="flex items-center gap-1.5 border-r border-slate-700 pr-3">
              <MinioLogo className="w-4 h-4" />
              <span>MinIO High-Perf</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AwsS3Logo className="w-4 h-4" />
              <span>AWS S3 Compatible API</span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-tight mb-6">
            Lưu Trữ Không Giới Hạn Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">
              Object Storage S3
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-normal">
            Giải pháp lưu trữ tệp, media, video và sao lưu dữ liệu tốc độ cao. 
            Tương thích toàn diện chuẩn AWS S3 API, độ bền dữ liệu 99.999999999% và miễn phí băng thông nội địa.
          </p>

          {/* Billing Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/90 backdrop-blur-md border border-slate-700 shadow-2xl">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
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
                    ? 'border-blue-500 shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500/40 bg-gradient-to-b from-slate-800 to-slate-900 lg:-translate-y-4'
                    : 'border-slate-700/80 shadow-xl hover:border-slate-600 hover:shadow-2xl'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                      <HardDrive className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-700/60 border border-slate-600 text-[11px] font-bold text-slate-300">
                      S3 Compatible
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
                      <HardDrive className="w-4 h-4 text-blue-400 shrink-0" />
                      <span>{plan.capacity}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{plan.bandwidth}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 text-slate-200 font-bold flex items-center gap-2.5">
                      <Layers className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{plan.buckets}</span>
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
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02]'
                      : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Kích Hoạt S3 Bucket Ngay</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. S3 STORAGE ARCHITECTURE & SPEED SHOWCASE */}
      <section className="py-24 bg-slate-950/80 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
              <DownloadCloud className="w-3.5 h-3.5" />
              Kiến Trúc Lưu Trữ Phân Tán Erasure Coding
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
              Độ Bền Dữ Liệu 11 Số 9 (99.999999999%)
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Dữ liệu được lưu trữ phân mảnh đa node trên cụm MinIO Cluster Enterprise. Tốc độ đọc ghi Multi-part Upload siêu tốc 10Gbps và mã hóa đầu cuối an toàn tuyệt đối.
            </p>
          </div>

          {/* 3 Real Visual Architecture Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-blue-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=800&q=80"
                    alt="NVMe All-Flash Storage Cluster"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-blue-600/90 text-white text-[11px] font-black uppercase">
                    NVMe All-Flash Tier
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Tốc Độ Đọc Ghi Vượt Trội</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Trang bị 100% ổ cứng Enterprise NVMe Gen4 kết hợp card mạng quang 10Gbps, mang lại tốc độ truyền tải tệp và video streaming mượt mà không có độ trễ buffer.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Tốc độ tải tệp lên đến 1,000MB/s</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /> Multi-part Parallel Upload siêu tốc</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-cyan-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80"
                    alt="Pre-signed URL & AES-256 Encryption"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-cyan-600/90 text-white text-[11px] font-black uppercase">
                    Security & Pre-signed URL
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Bảo Mật & Phân Quyền Chi Tiết</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Tạo Pre-signed URL có thời hạn (15 phút, 1 giờ, 24 giờ) cho phép người dùng upload/download an toàn mà không để lộ khóa bí mật hay cấu trúc thư mục lưu trữ.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Mã hóa tệp lưu trữ SSE-S3 AES-256</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" /> Quản lý Access Key / Secret Key riêng cho từng app</li>
              </ul>
            </div>

            <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 transition-all">
              <div>
                <div className="h-48 rounded-2xl overflow-hidden mb-6 relative bg-slate-800">
                  <img
                    src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80"
                    alt="Global CDN & Custom Domain"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-indigo-600/90 text-white text-[11px] font-black uppercase">
                    CDN Custom Domain
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mb-2">Tích Hợp CDN & Tên Miền Riêng</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Dễ dàng kết nối tên miền thương hiệu của bạn với chứng chỉ SSL Let's Encrypt tự động, tăng tốc độ phân phối nội dung tĩnh tới người dùng khắp toàn cầu.
                </p>
              </div>
              <ul className="space-y-2 text-xs text-slate-300 pt-3 border-t border-slate-800">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Tự động nén tệp WebP / Gzip / Brotli</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Miễn phí chứng chỉ bảo mật HTTPS SSL</li>
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
                  className="w-full p-5 text-left font-bold text-sm sm:text-base text-white flex items-center justify-between gap-4 hover:text-blue-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-blue-400 shrink-0" />
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
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 sm:p-12 border border-blue-500/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-4xl font-black text-white mb-4">
              Lưu Trữ Dữ Liệu An Toàn & Tiết Kiệm Tới 80% Chi Phí
            </h3>
            <p className="text-slate-300 text-xs sm:text-base mb-8 leading-relaxed">
              Bắt đầu với gói S3 50GB chỉ 50.000đ/tháng. Nhận ngay Access Key & Secret Key trong 60 giây, hỗ trợ di chuyển dữ liệu từ AWS S3 / Google Cloud sang hoàn toàn miễn phí.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-400 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all hover:scale-105"
              >
                Xem Bảng Giá & Kích Hoạt
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 transition-all"
              >
                Tư Vấn Chuyên Sâu 24/7
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
