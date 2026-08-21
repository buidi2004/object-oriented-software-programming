'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  HardDrive, Server, Shield, Zap, CheckCircle2, ArrowRight, 
  Cpu, Activity, RefreshCw, ShoppingCart, Lock, Globe,
  DownloadCloud, Layers, Key, ChevronDown, ChevronUp, Award, BarChart3, Database,
  Terminal, Sliders, Check, Copy, Code, Sparkles, Folder, FileText, ShieldCheck
} from 'lucide-react';
import { SiMinio } from 'react-icons/si';
import { FaAws } from 'react-icons/fa6';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function ObjectStorageServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Pre-signed URL Generator state
  const [bucketName, setBucketName] = useState('production-assets');
  const [objectKey, setObjectKey] = useState('uploads/media-2026.mp4');
  const [expiryMinutes, setExpiryMinutes] = useState('60');
  const [copied, setCopied] = useState(false);
  const [activeSdkTab, setActiveSdkTab] = useState<'aws-cli' | 'python' | 'nodejs' | 'golang'>('aws-cli');
  const [codeCopied, setCodeCopied] = useState(false);

  const presignedUrl = `https://s3.sencloudhost.vn/${bucketName}/${objectKey}?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20260822%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260822T051000Z&X-Amz-Expires=${Number(expiryMinutes) * 60}&X-Amz-SignedHeaders=host&X-Amz-Signature=c51f4967bf0b55a02e6c43cf305d762e84d4cf56a735c0ac4d6d67eb83c3ab15`;

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

  const handleCopy = () => {
    navigator.clipboard.writeText(presignedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [defaultPlans, setDefaultPlans] = useState([

    {
      id: '8f7f1c19-3186-40c6-80c4-fc53d2e70378',
      name: 'S3 Starter (50GB)',
      tier: 'Media & Web Attachments',
      workload: 'Lưu trữ ảnh sản phẩm, avatar, tệp đính kèm văn bản & backup web nhỏ',
      monthlyPrice: 50000,
      yearlyPrice: 50000 * 12 * 0.8,
      capacity: '50 GB NVMe Storage',
      egress: '1 TB / tháng (Miễn phí)',
      buckets: 'Không giới hạn Buckets',
      durability: '99.999999999% (11 số 9)',
      features: [
        'Chuẩn giao tiếp AWS S3 Compatible API 100%',
        'Tương thích Cyberduck, S3 Browser, rclone, AWS CLI, SDK',
        'Tạo Pre-signed URL chia sẻ tệp có thời hạn bảo mật',
        'Lưu trữ phân tán Erasure Coding an toàn 11 số 9',
        'Cấp phát cặp mã Access Key & Secret Key tức thì trong 60s'
      ],
      popular: false,
    },
    {
      id: 'd68a4605-3dda-4a08-9898-c12647c4e5d7',
      name: 'S3 Standard (250GB)',
      tier: 'E-Commerce & Mobile Apps',
      workload: 'Web Video, App Mobile, Hệ thống E-learning & Kho ảnh phân giải cao',
      monthlyPrice: 200000,
      yearlyPrice: 200000 * 12 * 0.8,
      capacity: '250 GB NVMe Storage',
      egress: '5 TB / tháng (Miễn phí)',
      buckets: 'Không giới hạn Buckets + Custom Domain',
      durability: '99.999999999% (11 số 9)',
      features: [
        'Chuẩn giao tiếp AWS S3 Compatible API 100%',
        'Tốc độ đọc ghi Multi-part Upload siêu tốc 10Gbps',
        'Hỗ trợ gắn Custom Domain CDN (https://cdn.yourdomain.com)',
        'Mã hóa bảo mật tự động Server-Side Encryption (SSE-S3 AES-256)',
        'Báo cáo chi tiết dung lượng lưu trữ & lưu lượng thời gian thực',
        'Cam kết SLA Độ bền dữ liệu 11 số 9 bằng hợp đồng'
      ],
      popular: true,
    },
    {
      id: 'e2eeefc0-8035-42ec-8646-fd9403181ef6',
      name: 'S3 Enterprise (1TB)',
      tier: 'Big Data & Video Streaming',
      workload: 'Kho dữ liệu lớn, Video Streaming 4K, Backup cụm máy chủ & Logs tập trung',
      monthlyPrice: 690000,
      yearlyPrice: 690000 * 12 * 0.8,
      capacity: '1,000 GB (1TB) NVMe Storage',
      egress: 'Không giới hạn Băng thông tải ra',
      buckets: 'Không giới hạn + Multi-Region Sync',
      durability: '99.999999999% (11 số 9)',
      features: [
        'Chuẩn giao tiếp AWS S3 Compatible API 100%',
        'Multi-Region Replication đồng bộ dữ liệu giữa 2 miền Bắc - Nam',
        'Tốc độ truyền tải nội địa siêu tốc không tính phí Data Transfer',
        'Phân quyền chi tiết qua IAM Policy & Bucket Policy JSON',
        'Tích hợp tự động Lifecycle Rules xóa/nén tệp cũ',
        'Kỹ sư SEN CloudHost hỗ trợ chuyển đổi dữ liệu từ AWS S3 sang miễn phí'
      ],
      popular: false,
    },
  ]);

  const plans = defaultPlans.map((dp, idx) => {
    const matchingDb = dbPlans[idx];
    return {
      ...dp,
      id: matchingDb?.id || dp.id,
      monthlyPrice: matchingDb?.monthlyPrice || dp.monthlyPrice,
      yearlyPrice: matchingDb?.yearlyPrice || dp.yearlyPrice,
    };
  });


  useEffect(() => {
    import('@/src/lib/api').then(({ api }) => {
      api.get('/categories/object-storage/plans').then(res => {
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
      q: 'SEN CloudHost S3 Storage có tương thích hoàn toàn với AWS S3 không?',
      a: 'Hoàn toàn tương thích 100%! Bạn có thể sử dụng bất kỳ SDK hay công cụ nào hỗ trợ S3 API như AWS SDK (Node.js, Python Boto3, PHP, Go, C# .NET, Java), AWS CLI, Cyberduck, S3 Browser, FileZilla Pro, rclone, Nextcloud S3 Driver chỉ cần đổi Endpoint URL về server SEN CloudHost (s3.sencloudhost.vn).'
    },
    {
      q: 'Dữ liệu được bảo vệ an toàn như thế nào trước rủi ro hỏng hóc ổ cứng?',
      a: 'Hệ thống áp dụng công nghệ phân tán Erasure Coding (12+4) lưu trữ dữ liệu thành nhiều mảnh trên các cụm máy chủ và ổ cứng NVMe độc lập. Ngay cả khi 4 ổ cứng hoặc 1 máy chủ vật lý bị hỏng đồng thời, dữ liệu của bạn vẫn nguyên vẹn 100% với độ bền 99.999999999% (11 số 9).'
    },
    {
      q: 'Tôi có thể gắn tên miền riêng cho S3 Bucket làm CDN media không?',
      a: 'Có, bạn có thể dễ dàng cấu hình CNAME từ tên miền của bạn (ví dụ cdn.yourdomain.com hoặc static.yourdomain.com) trỏ trực tiếp vào S3 Bucket và gắn chứng chỉ SSL HTTPS miễn phí.'
    },
    {
      q: 'Chi phí băng thông tải ra (Egress Traffic) tính như thế nào so với AWS S3?',
      a: 'Khác với AWS S3 tính phí băng thông tải ra đắt đỏ ($0.09/GB khiến hóa đơn phình to), SEN CloudHost cung cấp dung lượng băng thông tải ra cực lớn (1TB - 5TB/tháng hoặc Không giới hạn ở gói Enterprise) với mức giá trọn gói siêu tiết kiệm.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: S3 OBJECT STORAGE TELEMETRY */}
      <section className="relative pt-16 pb-20 border-b border-slate-200/80 overflow-hidden">
        {/* Technical Grid Blueprint */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #0284c7 1px, transparent 1px), linear-gradient(to bottom, #0284c7 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-sky-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Engineering Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-200 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                OBJECT STORAGE ENGINE: S3 API COMPATIBLE
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-700 hidden sm:inline">
                DURABILITY: <strong className="text-emerald-400 font-mono">99.999999999% (11 số 9)</strong>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <span>EGRESS FEE: <strong className="text-emerald-400 font-mono">0đ / Miễn Phí</strong></span>
              <span>NETWORK: <strong className="text-slate-900 font-mono">10Gbps Multi-part</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-300 text-xs font-mono">
                <DownloadCloud className="w-3.5 h-3.5 text-sky-400" />
                HIGH-PERFORMANCE MINIO &amp; AWS S3 API COMPATIBLE
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Lưu Trữ Đối Tượng Chuẩn{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 font-mono">
                  S3 API Không Giới Hạn
                </span>
              </h1>

              <p className="text-slate-700 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Tương thích 100% công cụ và thư viện AWS S3. Tốc độ đọc ghi 10Gbps trên mảng NVMe Enterprise, 
                độ bền 11 số 9 với Erasure Coding và miễn phí 100% băng thông tải ra nội địa.
              </p>

              {/* Vendor & API Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-200 text-xs font-mono text-slate-700">
                  <SiMinio className="w-4 h-4 text-rose-500" />
                  <span>MinIO High-Performance</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-200 text-xs font-mono text-slate-700">
                  <FaAws className="w-4 h-4 text-amber-500" />
                  <span>AWS S3 Compatible SDK</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0f172a] border border-slate-200 text-xs font-mono text-slate-700">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>SSE-S3 AES-256</span>
                </div>
              </div>

              {/* Endpoint Quick Spec */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-600">
                  <span>S3 Endpoint: <strong className="text-slate-900">https://s3.sencloudhost.vn</strong></span>
                  <span>Region: <strong className="text-sky-400">ap-southeast-1</strong></span>
                </div>
                <div className="text-slate-600">
                  Toolchain: <span className="text-slate-700">AWS CLI, Boto3, AWS-SDK Node.js, Cyberduck, rclone, Nextcloud</span>
                </div>
              </div>

            </div>

            {/* Right Pre-Signed URL Simulator */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0b1320] border border-slate-200 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-600 ml-2">s3-presigned-generator.sen</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/60">
                    HMAC-SHA256
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-slate-500 block mb-1">Bucket Name:</label>
                    <input
                      type="text"
                      value={bucketName}
                      onChange={(e) => setBucketName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">Object Key (Tệp tin):</label>
                    <input
                      type="text"
                      value={objectKey}
                      onChange={(e) => setObjectKey(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-500 block mb-1">Thời hạn hết hạn (Phút):</label>
                    <select
                      value={expiryMinutes}
                      onChange={(e) => setExpiryMinutes(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-900 font-mono text-xs focus:outline-none focus:border-sky-500"
                    >
                      <option value="15">15 Phút (Bảo mật cao)</option>
                      <option value="60">60 Phút (1 Giờ)</option>
                      <option value="1440">1440 Phút (24 Giờ)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="text-slate-500 flex items-center justify-between">
                    <span>// Generated Secure Pre-signed URL:</span>
                    <button onClick={handleCopy} className="text-sky-400 hover:underline flex items-center gap-1">
                      <Copy className="w-3 h-3" /> {copied ? 'Đã sao chép!' : 'Copy URL'}
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-100 border border-slate-200/90 text-sky-300 break-all select-all font-mono text-[11px] max-h-20 overflow-y-auto leading-relaxed">
                    {presignedUrl}
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#spec-matrix"
                    className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-slate-900 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/20"
                  >
                    <span>XEM BẢNG CẤU HÌNH VÀ BÁO GIÁ</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. THREE CORE S3 ARCHITECTURE SCHEMATICS */}
      <section className="py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950 text-sky-400 text-xs font-mono mb-3 border border-sky-800">
              <Layers className="w-3.5 h-3.5" />
              S3 DISTRIBUTED ARCHITECTURE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              3 Công Nghệ Cốt Lõi Của SEN S3 Storage
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Đảm bảo an toàn 11 số 9 cho kho dữ liệu doanh nghiệp mà không phải lo chi phí phát sinh.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Schematic 1: Erasure Coding 12+4 */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ERASURE CODING (12+4)</span>
                    <span className="text-emerald-400">11 9s DURABILITY</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Data Chunks</span>
                      <span className="text-sky-400 font-bold">12 Mảnh dữ liệu</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Parity Chunks</span>
                      <span className="text-emerald-400 font-bold">4 Mảnh chẵn lẻ</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Drive Failure Tolerance</span>
                      <span className="text-amber-400 font-bold">4 Drives Failed OK</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Độ Bền 99.999999999% (11 Số 9)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Công nghệ Erasure Coding chia nhỏ từng object thành 12 mảnh dữ liệu và 4 mảnh parity phân tán 
                  trên 16 ổ cứng độc lập. Ngay cả khi 4 ổ đĩa hỏng đồng thời, dữ liệu của bạn vẫn đọc/ghi bình thường.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Data Loss Risk:</span>
                <strong className="text-emerald-400">&lt; 0.000000001%</strong>
              </div>
            </div>

            {/* Schematic 2: 0$ Egress Bandwidth */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ZERO EGRESS TRAFFIC COST</span>
                    <span className="text-sky-400">SAVE 90% COST</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>AWS S3 Egress Fee</span>
                      <span className="text-rose-400 font-bold">$0.09 / GB (Đắt đỏ)</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>SEN CloudHost Egress</span>
                      <span className="text-emerald-400 font-bold">0đ / Miễn phí trọn gói</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Domestic Bandwidth</span>
                      <span className="text-sky-400 font-bold">10Gbps Không giới hạn</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Miễn Phí Băng Thông Tải Ra (0$ Egress)</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Không còn lo ngại hóa đơn đám mây tăng vọt khi lượt xem video hoặc tải ảnh tăng cao. 
                  SEN CloudHost cung cấp dung lượng băng thông tải ra cực lớn miễn phí 100% trong nước.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>Monthly Bill Predictability:</span>
                <strong className="text-emerald-400">100% Giá Trọn Gói Cố Định</strong>
              </div>
            </div>

            {/* Schematic 3: Custom Domain CDN & Edge SSL */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>CUSTOM DOMAIN &amp; AUTO SSL</span>
                    <span className="text-purple-400">CDN READY</span>
                  </div>
                  <div className="space-y-2 text-slate-700 text-[11px]">
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Custom Domain</span>
                      <span className="text-sky-400 font-bold">cdn.yourdomain.com</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>Auto SSL HTTPS</span>
                      <span className="text-emerald-400 font-bold">Let&apos;s Encrypt Auto</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200 flex items-center justify-between">
                      <span>CORS Configuration</span>
                      <span className="text-purple-400">JSON Policy Custom</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2">Gắn Tên Miền Riêng &amp; Tối Ưu CDN</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cấu hình CNAME từ tên miền thương hiệu của bạn trực tiếp vào S3 Bucket. 
                  Tự động cấp phát chứng chỉ SSL HTTPS miễn phí và thiết lập Cache-Control tăng tốc website tức thì.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/80 text-xs font-mono text-slate-700 flex items-center justify-between">
                <span>CDN Cache Header:</span>
                <strong className="text-purple-400">max-age=31536000 Immutable</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. MULTI-LANGUAGE SDK & S3 CLI CODE RUNNER */}
      <section className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950 text-sky-400 text-xs font-mono mb-3 border border-sky-800">
              <Code className="w-3.5 h-3.5" />
              100% S3 API COMPATIBLE
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Tương Thích Tuyệt Đối AWS S3 SDK &amp; CLI
            </h2>
            <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Chỉ cần thay đổi <code className="text-sky-400 font-mono">endpoint_url</code>, giữ nguyên 100% codebase và thư viện S3 hiện có của bạn.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl font-mono">
            {/* Tab Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                {[
                  { id: 'aws-cli', label: 'AWS CLI / Shell' },
                  { id: 'python', label: 'Python (Boto3)' },
                  { id: 'nodejs', label: 'Node.js (AWS SDK v3)' },
                  { id: 'golang', label: 'Golang (MinIO SDK)' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSdkTab(tab.id as typeof activeSdkTab)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      activeSdkTab === tab.id
                        ? 'bg-sky-600 text-white shadow'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  const codes: Record<string, string> = {
                    'aws-cli': `aws --endpoint-url https://s3.sencloudhost.vn s3 cp ./data-backup.tar.gz s3://my-enterprise-bucket/backups/`,
                    'python': `import boto3\ns3 = boto3.client('s3', endpoint_url='https://s3.sencloudhost.vn')`,
                    'nodejs': `import { S3Client } from "@aws-sdk/client-s3";\nconst s3 = new S3Client({ endpoint: "https://s3.sencloudhost.vn" });`,
                    'golang': `minioClient, err := minio.New("s3.sencloudhost.vn", &minio.Options{ Secure: true })`
                  };
                  navigator.clipboard.writeText(codes[activeSdkTab] || '');
                  setCodeCopied(true);
                  setTimeout(() => setCodeCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-white border border-slate-200 text-xs text-sky-400 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                {codeCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{codeCopied ? 'Đã sao chép!' : 'Sao chép Code'}</span>
              </button>
            </div>

            {/* Code Body */}
            <div className="mt-4 p-5 rounded-2xl bg-slate-100 border border-slate-200/80 text-xs text-slate-700 overflow-x-auto leading-relaxed">
              <pre className="text-slate-700 font-mono">
                {activeSdkTab === 'aws-cli' && (
`# 1. Cấu hình Endpoint SEN S3 vào AWS CLI
aws configure set default.s3.signature_version s3v4
aws configure set aws_access_key_id "AKIAIOSFODNN7EXAMPLE"
aws configure set aws_secret_access_key "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

# 2. Upload tệp tin lên bucket
aws --endpoint-url https://s3.sencloudhost.vn s3 cp ./backup.tar.gz s3://my-enterprise-bucket/

# 3. Đồng bộ thư mục dung lượng lớn (Multi-part upload)
aws --endpoint-url https://s3.sencloudhost.vn s3 sync ./media/ s3://my-enterprise-bucket/media/`
                )}
                {activeSdkTab === 'python' && (
`import boto3
from botocore.client import Config

# Khởi tạo S3 Client với Endpoint SEN CloudHost
s3 = boto3.client(
    's3',
    endpoint_url='https://s3.sencloudhost.vn',
    aws_access_key_id='AKIAIOSFODNN7EXAMPLE',
    aws_secret_access_key='wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
    config=Config(signature_version='s3v4'),
    region_name='ap-southeast-1'
)

# Upload tệp tin lên bucket
s3.upload_file('database.sql.gz', 'my-enterprise-bucket', 'backups/database.sql.gz')
print(" Dữ liệu đã lưu trữ an toàn trên SEN S3 All-Flash!")`
                )}
                {activeSdkTab === 'nodejs' && (
`import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import fs from "fs";

// Khởi tạo S3Client tương thích 100% AWS SDK v3
const s3 = new S3Client({
  endpoint: "https://s3.sencloudhost.vn",
  region: "ap-southeast-1",
  credentials: {
    accessKeyId: "AKIAIOSFODNN7EXAMPLE",
    secretAccessKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  },
  forcePathStyle: true,
});

// Upload stream tệp tin
const fileStream = fs.createReadStream("./user-avatar.jpg");
await s3.send(new PutObjectCommand({
  Bucket: "my-enterprise-bucket",
  Key: "avatars/user-avatar.jpg",
  Body: fileStream,
}));
console.log(" Upload thành công vào cụm NVMe Storage!");`
                )}
                {activeSdkTab === 'golang' && (
`package main

import (
    "context"
    "log"
    "github.com/minio/minio-go/v7"
    "github.com/minio/minio-go/v7/pkg/credentials"
)

func main() {
    endpoint := "s3.sencloudhost.vn"
    accessKeyID := "AKIAIOSFODNN7EXAMPLE"
    secretAccessKey := "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

    minioClient, err := minio.New(endpoint, &minio.Options{
        Creds:  credentials.NewStaticV4(accessKeyID, secretAccessKey, ""),
        Secure: true,
    })
    if err != nil {
        log.Fatalln("Lỗi kết nối:", err)
    }

    log.Println("Kết nối thành công tới SEN Object Storage S3:", minioClient.EndpointURL())
}`
                )}
              </pre>
            </div>
          </div>

        </div>
      </section>

      {/* 4. TECHNICAL SPECIFICATION MATRIX & PRICING */}
      <section id="spec-matrix" className="py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950 text-sky-400 text-xs font-mono mb-3 border border-sky-800">
                <Sliders className="w-3.5 h-3.5" />
                OBJECT STORAGE SPEC SHEET
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                Bảng So Sánh Gói S3 Object Storage
              </h2>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 font-normal">
                Minh bạch 100% dung lượng NVMe, băng thông Egress và chuẩn giao tiếp S3 API.
              </p>
            </div>

            {/* Billing Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-white border border-slate-200 font-mono text-xs">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-sky-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Thanh toán Tháng
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'yearly'
                    ? 'bg-sky-600 text-white shadow'
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
          <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#080d17] text-slate-600">
                    <th className="p-5 font-bold uppercase text-[11px] w-1/4">Thông Số Kỹ Thuật</th>
                    {plans.map((p) => {
                      const displayPrice = billingCycle === 'yearly' ? Math.round(p.yearlyPrice / 12) : p.monthlyPrice;
                      return (
                        <th key={p.id} className="p-5 text-slate-900 border-l border-slate-200/80 w-1/4">
                          <div className="text-sm font-extrabold text-slate-900">{p.name}</div>
                          <div className="text-[11px] text-slate-600 font-sans font-normal">{p.tier}</div>
                          <div className="text-lg font-black text-sky-400 mt-2">
                            {displayPrice.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-600">đ/tháng</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-700">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Dung Lượng NVMe Storage</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-emerald-400 font-bold">{p.capacity}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Băng Thông Tải Ra (Egress Traffic)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-sky-400 font-bold">{p.egress}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Số Lượng Bucket &amp; Custom Domain</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-900 font-bold">{p.buckets}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Độ Bền Dữ Liệu (Durability SLA)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-emerald-400 font-bold">{p.durability}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Tương Thích Chuẩn AWS S3 API</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-800">100% Full Compatibility</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-600">Mã Hóa Server-Side (SSE-S3)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-200/60 text-slate-800">AES-256 Automatic</td>
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
                              ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <span>Khởi Tạo S3 Bucket Ngay</span>
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
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Câu Hỏi Thường Gặp Về S3 Object Storage</h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST S3 STORAGE FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:text-sky-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-sky-400 shrink-0" />
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
        <div className="rounded-3xl bg-gradient-to-r from-[#0d182e] via-[#091122] to-[#0d182e] p-8 sm:p-12 border border-sky-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950 border border-sky-800 text-sky-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              S3 ACCESS KEYS IN 60 SECONDS
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Bảo Vệ Kho Dữ Liệu Của Bạn Trên Đám Mây S3 An Toàn
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Chỉ từ 50.000đ/tháng với 50GB NVMe. Nhận ngay cặp mã Access Key &amp; Secret Key trong 60 giây và hỗ trợ chuyển dữ liệu từ AWS S3 sang miễn phí.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('spec-matrix');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-mono shadow-xl shadow-sky-600/25 transition-all hover:scale-105"
              >
                Khởi Tạo S3 Bucket Ngay
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-200 text-slate-900 font-bold text-xs font-mono border border-slate-300 transition-all"
              >
                Tư Vấn Di Dời Dữ Liệu Lớn
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
