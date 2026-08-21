'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Database, Server, Cpu, HardDrive, Shield, Zap, CheckCircle2, ArrowRight, 
  Activity, Lock, RefreshCw, Layers, Key, ChevronDown, ChevronUp, Clock, 
  AlertTriangle, Play, Terminal, Sliders, Check, Copy, Sparkles, Network,
  Radio, ShieldCheck, AlertCircle, FileText
} from 'lucide-react';
import { SiMysql, SiPostgresql, SiRedis } from 'react-icons/si';
import { useCartStore } from '@/src/store/useCartStore';
import { api } from '@/src/lib/api';

export default function DatabasesServicePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [engine, setEngine] = useState<'mysql' | 'postgres' | 'redis'>('postgres');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  const [dbPlans, setDbPlans] = useState<any[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Signature Interactive Topology Simulation state
  const [node1Status, setNode1Status] = useState<'primary' | 'failed'>('primary');
  const [failoverSeconds, setFailoverSeconds] = useState<number>(0);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);

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

  const triggerFailoverSimulation = () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setNode1Status('failed');
    setFailoverSeconds(1);

    const interval = setInterval(() => {
      setFailoverSeconds((prev) => {
        if (prev >= 3) {
          clearInterval(interval);
          setIsSimulating(false);
          return 3;
        }
        return prev + 1;
      });
    }, 800);
  };

  const resetTopology = () => {
    setNode1Status('primary');
    setFailoverSeconds(0);
    setIsSimulating(false);
  };

  const defaultPlans = [
    {
      id: '7d9ae64f-db23-404c-8ed2-3eb39a1e4723',
      name: 'DB Micro',
      tier: 'Developer & Test',
      workload: 'Môi trường phát triển, Staging, Microservices nhỏ & PoC',
      monthlyPrice: 99000,
      yearlyPrice: 79000 * 12,
      cpu: '1 vCPU Dedicated',
      ram: '1 GB RAM ECC',
      storage: '10 GB NVMe Enterprise',
      iops: '3,000 IOPS Dedicated',
      maxConn: '100',
      haType: 'Single Node (Auto-Restart < 15s)',
      pitr: 'Snapshot 7 ngày',
      metrics: { readLoad: '1.2k req/s', writeLoad: '450 tx/s', p99: '1.8ms' },
      features: [
        'Tùy chọn PostgreSQL 16, MySQL 8.0 hoặc Redis 7.2',
        'Mã hóa đường truyền TLS 1.3 bắt buộc',
        'Sao lưu tự động hàng ngày lên cụm S3 phân tán',
        'Cấp phát chuỗi kết nối URI chuẩn trong 60 giây',
        'Bảng giám sát CPU, RAM & Dung lượng thời gian thực'
      ],
      badge: null,
      popular: false,
    },
    {
      id: '2bf4b5b1-ec2d-4140-9819-ca61c551078b',
      name: 'DB Standard',
      tier: 'Production Grade',
      workload: 'Website thương mại điện tử, API Backend & SaaS đa người dùng',
      monthlyPrice: 299000,
      yearlyPrice: 239000 * 12,
      cpu: '2 vCPU Dedicated',
      ram: '4 GB RAM ECC',
      storage: '40 GB NVMe Gen4 Enterprise',
      iops: '10,000 IOPS Dedicated',
      maxConn: '500',
      haType: 'Multi-Node HA (Master + Sync Replica)',
      pitr: 'Point-in-Time 14 ngày (Đến từng giây)',
      metrics: { readLoad: '8.5k req/s', writeLoad: '2.8k tx/s', p99: '0.9ms' },
      features: [
        'Cụm High Availability 2-Node chuyển mạch tự động < 30s',
        'Point-in-Time Recovery (PITR) tua ngược trạng thái tới từng giây',
        'Mạng riêng ảo VPC & Tường lửa IP Whitelist lọc truy cập',
        'Tự động điều chỉnh kích thước Buffer Pool & Connection Pooler',
        'Cam kết chất lượng dịch vụ SLA 99.99% bằng hợp đồng',
        'Cảnh báo truy vấn chậm (Slow Query) và gợi ý Index tự động'
      ],
      badge: 'Cấu hình tiêu chuẩn',
      popular: true,
    },
    {
      id: '38a09ebe-14ae-4a96-b155-8f5c3da8e622',
      name: 'DB Pro Cluster',
      tier: 'Mission Critical & Fintech',
      workload: 'Sàn giao dịch tài chính, E-commerce quy mô lớn & Big Data OLTP',
      monthlyPrice: 699000,
      yearlyPrice: 559000 * 12,
      cpu: '4 vCPU Dedicated',
      ram: '8 GB RAM ECC',
      storage: '100 GB NVMe Gen4 Enterprise',
      iops: '25,000 IOPS Dedicated',
      maxConn: '2,000',
      haType: '3-Node Multi-AZ Quorum Cluster (Raft/Patroni)',
      pitr: 'Point-in-Time 30 ngày + Offsite Archive',
      metrics: { readLoad: '32.0k req/s', writeLoad: '9.4k tx/s', p99: '0.4ms' },
      features: [
        'Cụm 3 Nodes phân tán Quorum Consensus không điểm chết',
        'Tách biệt luồng Đọc/Ghi (Read/Write Splitting) tự động',
        'Dedicated NVMe IOPS đảm bảo băng thông đọc ghi liên tục',
        'Audit Logging chi tiết tuân thủ tiêu chuẩn an toàn dữ liệu',
        'Đội ngũ kỹ sư DBA SEN CloudHost tối ưu hiệu năng 1-1',
        'Hỗ trợ di dời cơ sở dữ liệu lớn không gián đoạn Zero-Downtime'
      ],
      badge: 'Hiệu năng cực đại',
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

  const enginesInfo = {
    postgres: {
      name: 'PostgreSQL 16 Pro',
      subtitle: 'Advanced Object-Relational DBMS',
      Icon: SiPostgresql,
      brandColor: '#4169E1',
      version: 'v16.2 Enterprise',
      defaultPort: 5432,
      specs: 'MVCC, JSONB, TimescaleDB, PostGIS, pgvector (AI Embedding)',
      uriExample: 'postgresql://postgres:p@ssw0rd@db-ha.sencloudhost.vn:5432/production_db?sslmode=verify-full'
    },
    mysql: {
      name: 'MySQL 8.0 Enterprise',
      subtitle: 'InnoDB ACID Compliant Storage Engine',
      Icon: SiMysql,
      brandColor: '#4479A1',
      version: 'v8.0.36 Enterprise',
      defaultPort: 3306,
      specs: 'InnoDB Cluster, Group Replication, Document Store, Thread Pool',
      uriExample: 'mysql://root:p@ssw0rd@db-ha.sencloudhost.vn:3306/production_db?ssl-mode=REQUIRED'
    },
    redis: {
      name: 'Redis 7.2 In-Memory',
      subtitle: 'Ultra Low-Latency Key-Value & Caching Store',
      Icon: SiRedis,
      brandColor: '#FF4438',
      version: 'v7.2.4 Standalone & Cluster',
      defaultPort: 6379,
      specs: 'Redis Streams, Pub/Sub, RedisJSON, Lua Scripting, Append-Only (AOF)',
      uriExample: 'redis://default:p@ssw0rd@db-ha.sencloudhost.vn:6379/0'
    }
  };

  const currentEngine = enginesInfo[engine];

  const faqs = [
    {
      q: 'Managed Database giải quyết rủi ro mất mát dữ liệu như thế nào?',
      a: 'Hệ thống SEN CloudHost kết hợp 3 lớp bảo vệ dữ liệu: (1) Lưu trữ trên mảng ổ cứng NVMe Gen4 Enterprise thiết lập Hardware RAID-10; (2) Ghi nhật ký liên tục Write-Ahead Logging (WAL) đồng bộ sang node Replica thời gian thực; (3) Tự động đẩy snapshot hàng ngày sang cụm Object Storage S3 phân tán tại 2 trung tâm dữ liệu độc lập.'
    },
    {
      q: 'Cơ chế Auto-Failover hoạt động như thế nào khi Node chính gặp sự cố phần cứng?',
      a: 'Cụm quản lý Quorum Consensus (Patroni/Raft) liên tục kiểm tra nhịp tim (Heartbeat 500ms). Nếu node Primary không phản hồi trong 3 lần liên tiếp, hệ thống tự động thăng cấp Node Standby có vị trí Log Sequence Number (LSN) mới nhất thành Primary, cập nhật Virtual IP và định tuyến DNS Endpoint. Toàn bộ tiến trình diễn ra tự động trong vòng dưới 30 giây.'
    },
    {
      q: 'Tính năng Point-in-Time Recovery (PITR) có khôi phục được thời điểm cụ thể sau khi chạy nhầm lệnh DROP/UPDATE không?',
      a: 'Có. Khi xảy ra sự cố thao tác nhầm, bạn chỉ cần chọn thời điểm chính xác (ví dụ 14:28:15). Hệ thống sẽ lấy bản base backup gần nhất kết hợp tua lại (Replay) chuỗi WAL log đến đúng 14:28:14 (ngay trước lệnh lỗi) và khởi tạo một cơ sở dữ liệu mới nguyên vẹn.'
    },
    {
      q: 'Tôi có thể kết nối trực tiếp từ DBeaver, DataGrip hay máy chủ ứng dụng bên ngoài không?',
      a: 'Hoàn toàn được. Mỗi database được cấp phát một Fully Qualified Domain Name (FQDN) bảo mật qua chứng chỉ SSL TLS 1.3. Bạn có thể kích hoạt tính năng IP Whitelisting trong trang quản trị để chỉ cho phép các dải IP tĩnh của bạn truy cập nhằm đảm bảo an toàn tuyệt đối.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-sky-500 selection:text-white font-sans">
      
      {/* 1. HERO SECTION: ENGINEERING TELEMETRY CONSOLE */}
      <section className="relative pt-16 pb-20 border-b border-slate-800/80 overflow-hidden">
        {/* Technical Grid Blueprint Background */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none" 
          style={{ 
            backgroundImage: `linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)`,
            backgroundSize: '40px 40px' 
          }}
        />
        <div className="absolute top-0 right-1/4 w-[600px] h-[300px] bg-sky-600/10 blur-[120px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Engineering Status Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3.5 mb-10 rounded-2xl bg-[#0d1424] border border-slate-800 text-xs font-mono">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                INFRASTRUCTURE: HEALTHY
              </span>
              <span className="text-slate-600 hidden sm:inline">|</span>
              <span className="text-slate-300 hidden sm:inline">
                DATACENTER: <span className="text-white font-bold">Tier-III Viettel IDC (Hà Nội & TP.HCM)</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span>SLA: <strong className="text-white font-mono">99.99%</strong></span>
              <span>RTO: <strong className="text-emerald-400 font-mono">&lt; 30s</strong></span>
              <span>RPO: <strong className="text-emerald-400 font-mono">0s</strong></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Headline & Value Proposition */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-sky-950/60 border border-sky-800/60 text-sky-300 text-xs font-mono">
                <Terminal className="w-3.5 h-3.5 text-sky-400" />
                SEN MANAGED CLOUD DATABASES
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.15]">
                Dữ Liệu An Toàn Tuyệt Đối Với{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400 font-mono">
                  Master-Replica HA
                </span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl font-normal">
                Giải phóng đội ngũ phát triển khỏi gánh nặng quản trị DBA. Tự động hóa hoàn toàn cụm dự phòng Failover, 
                sao lưu Point-in-Time đến từng giây và bảo vệ cơ sở dữ liệu trên mảng NVMe Enterprise chuyên dụng.
              </p>

              {/* Engine Selector */}
              <div className="pt-2">
                <div className="text-xs font-mono uppercase text-slate-400 tracking-wider mb-3">
                  Chọn Database Engine Vận Hành:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['postgres', 'mysql', 'redis'] as const).map((engKey) => {
                    const item = enginesInfo[engKey];
                    const active = engine === engKey;
                    return (
                      <button
                        key={engKey}
                        onClick={() => setEngine(engKey)}
                        className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3.5 ${
                          active
                            ? 'bg-[#131d31] border-sky-500 shadow-lg shadow-sky-500/10'
                            : 'bg-[#0e1626] border-slate-800 hover:border-slate-700 text-slate-400'
                        }`}
                      >
                        <div 
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border"
                          style={{ 
                            backgroundColor: active ? '#0b1322' : '#0a0f1a',
                            borderColor: active ? item.brandColor : '#1e293b' 
                          }}
                        >
                          <item.Icon className="w-5 h-5" style={{ color: item.brandColor }} />
                        </div>
                        <div>
                          <div className={`text-xs font-bold font-mono ${active ? 'text-white' : 'text-slate-300'}`}>
                            {item.name.split(' ')[0]}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Port {item.defaultPort}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Spec Readout */}
              <div className="p-4 rounded-xl bg-[#0c1322] border border-slate-800 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Engine: <strong className="text-white">{currentEngine.name}</strong></span>
                  <span>Version: <strong className="text-sky-400">{currentEngine.version}</strong></span>
                </div>
                <div className="text-slate-400">
                  Features: <span className="text-slate-300">{currentEngine.specs}</span>
                </div>
              </div>

            </div>

            {/* Right Connection String & Live Readout Preview */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-[#0b1320] border border-slate-800 p-6 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-mono text-slate-400 ml-2">db-cluster-telemetry.sen</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                    ONLINE
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs">
                  <div className="text-slate-500">// 1-Click Connection String Ready</div>
                  <div className="p-3.5 rounded-xl bg-[#060a12] border border-slate-800/90 text-sky-300 break-all select-all font-mono leading-relaxed">
                    {currentEngine.uriExample}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
                  <div className="p-3 rounded-xl bg-[#0e1627] border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">Write Latency p99</div>
                    <div className="text-base font-extrabold text-emerald-400 mt-0.5">0.82 ms</div>
                    <div className="text-[10px] text-slate-500">10Gbps VPC Backbone</div>
                  </div>

                  <div className="p-3 rounded-xl bg-[#0e1627] border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase">WAL Sync Status</div>
                    <div className="text-base font-extrabold text-sky-400 mt-0.5">Synchronous</div>
                    <div className="text-[10px] text-slate-500">Lag: 0 bytes</div>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href="#pricing-matrix"
                    className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/20"
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

      {/* 2. SIGNATURE ELEMENT: INTERACTIVE LIVE TOPOLOGY & FAILOVER SIMULATOR */}
      <section className="py-20 bg-[#070b12] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono mb-3">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                SIGNATURE HA TOPOLOGY
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Mô Phỏng Chuyển Mạch Tự Động (Auto-Failover)
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-2 max-w-2xl font-normal">
                Khám phá cơ chế phân bổ 3-Node Quorum Consensus thật sự bảo vệ ứng dụng của bạn khi xảy ra sự cố phần cứng.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {node1Status === 'primary' ? (
                <button
                  onClick={triggerFailoverSimulation}
                  disabled={isSimulating}
                  className="px-4 py-2.5 rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-lg shadow-rose-600/20"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>MÔ PHỎNG SỰ CỐ PRIMARY</span>
                </button>
              ) : (
                <button
                  onClick={resetTopology}
                  className="px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>KHÔI PHỤC TRẠNG THÁI BAN ĐẦU</span>
                </button>
              )}
            </div>
          </div>

          {/* Topology Interactive Canvas */}
          <div className="p-8 rounded-3xl bg-[#0c1322] border border-slate-800 relative overflow-hidden">
            
            {/* Status Banner */}
            <div className="mb-8 p-4 rounded-xl bg-[#070c16] border border-slate-800 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
              <div className="flex items-center gap-3">
                <span className="text-slate-400">CLUSTER CONSENSUS:</span>
                <span className="text-sky-400 font-bold">Raft / Patroni HA Protocol</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-slate-400">FAILOVER TIMER:</span>
                <span className={`font-bold ${failoverSeconds > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {failoverSeconds > 0 ? `${failoverSeconds}s / 3.0s Max` : '0.0s (Normal)'}
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">TRANSACTION LOSS:</span>
                <strong className="text-emerald-400 font-mono">0 BYTES (RPO = 0)</strong>
              </div>
            </div>

            {/* 3-Node Topology Diagram */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
              
              {/* Node 1: Primary */}
              <div className={`p-6 rounded-2xl border transition-all ${
                node1Status === 'primary' 
                  ? 'bg-[#10192b] border-emerald-500/80 shadow-lg shadow-emerald-500/10' 
                  : 'bg-[#181119] border-rose-600/80 opacity-80'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-emerald-400" />
                    <span className="font-mono font-bold text-white text-sm">Node 01: HN-DC1</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    node1Status === 'primary' 
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {node1Status === 'primary' ? 'PRIMARY (RW)' : 'OFFLINE (SIMULATED)'}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span>{node1Status === 'primary' ? 'Read / Write Active' : 'Unreachable'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">WAL Stream:</span>
                    <span className="text-sky-400">{node1Status === 'primary' ? 'LSN 0/18A42B0' : 'Disconnected'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Disk Engine:</span>
                    <span>NVMe RAID-10</span>
                  </div>
                </div>
              </div>

              {/* Node 2: Standby Replica */}
              <div className={`p-6 rounded-2xl border transition-all ${
                node1Status === 'failed'
                  ? 'bg-[#10192b] border-emerald-500 shadow-xl shadow-emerald-500/20 ring-2 ring-emerald-500/40'
                  : 'bg-[#10192b] border-sky-500/60'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-sky-400" />
                    <span className="font-mono font-bold text-white text-sm">Node 02: HCM-DC2</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    node1Status === 'failed'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold animate-pulse'
                      : 'bg-sky-950 text-sky-400 border border-sky-800'
                  }`}>
                    {node1Status === 'failed' ? 'PROMOTED PRIMARY (RW)' : 'STANDBY REPLICA (RO)'}
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span>{node1Status === 'failed' ? 'New Master Leader' : 'Sync Read Replica'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Replication Lag:</span>
                    <span className="text-emerald-400">0.0 ms (Real-time)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Auto Failover:</span>
                    <span className="text-emerald-400 font-bold">Quorum Ready</span>
                  </div>
                </div>
              </div>

              {/* Node 3: Quorum Witness / ETCD */}
              <div className="p-6 rounded-2xl bg-[#0f1728] border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-amber-400" />
                    <span className="font-mono font-bold text-white text-sm">Node 03: DNG-DC3</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    WITNESS &amp; ETCD
                  </span>
                </div>

                <div className="space-y-2 font-mono text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Role:</span>
                    <span>Consensus Arbiter</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Heartbeat:</span>
                    <span className="text-emerald-400 font-bold">500ms Interval</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Split-Brain:</span>
                    <span className="text-sky-400">Guaranteed Protected</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 3. THREE CORE MECHANISMS (REPLACED FROM OLD PLACEHOLDERS) */}
      <section className="py-24 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950 text-sky-400 text-xs font-mono mb-3 border border-sky-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              INFRASTRUCTURE MECHANICS
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              3 Cơ Chế Kỹ Thuật Bảo Vệ Dữ Liệu
            </h2>
            <p className="text-slate-400 text-sm sm:text-base mt-3 leading-relaxed font-normal">
              Mỗi cơ sở dữ liệu trên SEN CloudHost được thiết kế theo chuẩn Zero-Loss kiến trúc vi sai phân tán.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Auto-Failover Schematic */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                {/* SVG Schematic Blueprint */}
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>FAILOVER SEQUENCE PROTOCOL</span>
                    <span className="text-emerald-400">RTO &lt; 30s</span>
                  </div>
                  <div className="space-y-2 text-slate-300">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">1. Node 1 Heartbeat Lost</span>
                      <span className="text-rose-400 font-bold">3 missed pings</span>
                    </div>
                    <div className="text-center text-slate-600">↓</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">2. Raft Quorum Vote</span>
                      <span className="text-sky-400 font-bold">Witness Confirmed</span>
                    </div>
                    <div className="text-center text-slate-600">↓</div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400">3. Node 2 Promoted</span>
                      <span className="text-emerald-400 font-bold">Virtual IP Re-routed</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Cụm High Availability 99.99%</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Đồng bộ log WAL liên tục giữa 2 trung tâm dữ liệu độc lập. Khi node chính xảy ra sự cố phần cứng, 
                  hệ thống tự động chuyển giao quyền lực sang node dự phòng trong 3-30 giây mà không cần can thiệp thủ công.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Downtime Impact:</span>
                <strong className="text-emerald-400">&lt; 30 Giây</strong>
              </div>
            </div>

            {/* Feature 2: PITR Timeline Schematic */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                {/* Timeline Schematic */}
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>WAL LOG CONTINUOUS STREAM</span>
                    <span className="text-sky-400">PITR 14-30 DAYS</span>
                  </div>
                  
                  <div className="relative py-3 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">00:00 Base Snapshot</span>
                      <span className="text-emerald-400">Full Image S3</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                      <div className="w-1/3 bg-sky-500 h-full" />
                      <div className="w-1/3 bg-teal-500 h-full" />
                      <div className="w-1/3 bg-emerald-500 h-full" />
                    </div>
                    <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-300 flex items-center justify-between text-[11px]">
                      <span>Restore Point Selected:</span>
                      <strong className="font-mono">14:28:14 UTC</strong>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Khôi Phục Tới Từng Giây (PITR)</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Lưu trữ liên tục toàn bộ thay đổi dữ liệu (Write-Ahead Log) lên kho Object Storage phân tán. 
                  Cho phép bạn tua ngược trạng thái cơ sở dữ liệu về chính xác thời điểm trước khi xảy ra lệnh thao tác nhầm.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Granularity:</span>
                <strong className="text-sky-400">Tới Từng Giây (Exact Second)</strong>
              </div>
            </div>

            {/* Feature 3: Zero-Trust Network Schematic */}
            <div className="p-6 rounded-3xl bg-[#0c1322] border border-slate-800 flex flex-col justify-between space-y-6">
              <div>
                {/* Security Data Flow Schematic */}
                <div className="p-4 rounded-2xl bg-[#060a12] border border-slate-800 mb-6 font-mono text-xs">
                  <div className="text-[10px] text-slate-500 uppercase mb-3 flex items-center justify-between">
                    <span>ISOLATED VPC &amp; TLS 1.3</span>
                    <span className="text-indigo-400">AES-256</span>
                  </div>
                  <div className="space-y-2 text-slate-300 text-[11px]">
                    <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span>1. Client App</span>
                      <span className="text-slate-400">TLS 1.3 Encrypted</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span>2. IP Whitelist</span>
                      <span className="text-emerald-400">Hardware Firewall</span>
                    </div>
                    <div className="flex items-center justify-between p-1.5 rounded bg-slate-900 border border-slate-800">
                      <span>3. NVMe Storage</span>
                      <span className="text-indigo-400 font-bold">AES-256 at Rest</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">Bảo Mật Zero-Trust &amp; Mạng Riêng</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cách ly hoàn toàn trong mạng riêng ảo VPC. Mã hóa 100% đường truyền TLS 1.3 và mã hóa dữ liệu tĩnh 
                  AES-256 trên mảng đĩa NVMe, phân quyền chi tiết theo User/Role và ghi Audit Log đầy đủ.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 text-xs font-mono text-slate-300 flex items-center justify-between">
                <span>Compliance:</span>
                <strong className="text-indigo-400">SOC2 &amp; ISO 27001 Ready</strong>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. TECHNICAL SPECIFICATION MATRIX & PRICING */}
      <section id="pricing-matrix" className="py-24 bg-[#070b12] border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950 text-sky-400 text-xs font-mono mb-3 border border-sky-800">
                <Sliders className="w-3.5 h-3.5" />
                ARCHITECTURE SPEC SHEET
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Bảng So Sánh Cấu Hình Kỹ Thuật Chi Tiết
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 font-normal">
                Minh bạch 100% về phần cứng, IOPS, cơ chế dự phòng và kết nối đồng thời.
              </p>
            </div>

            {/* Billing Cycle Switch */}
            <div className="inline-flex items-center p-1 rounded-xl bg-[#0c1322] border border-slate-800 font-mono text-xs">
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

          {/* Pricing & Architecture Matrix Table */}
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
                          <div className="text-lg font-black text-sky-400 mt-2">
                            {displayPrice.toLocaleString('vi-VN')} <span className="text-xs font-normal text-slate-400">đ/tháng</span>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">CPU Dedicated</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-white font-bold">{p.cpu}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">RAM ECC</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-white font-bold">{p.ram}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Dung Lượng NVMe RAID-10</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-emerald-400 font-bold">{p.storage}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Băng Thông Đọc Ghi IOPS</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-sky-400 font-bold">{p.iops}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Max Concurrent Connections</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-white font-bold">{p.maxConn} kết nối</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Kiến Trúc High Availability</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-slate-200">{p.haType}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Khôi Phục Point-in-Time (PITR)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-slate-200">{p.pitr}</td>
                    ))}
                  </tr>
                  <tr className="hover:bg-slate-900/40">
                    <td className="p-4 font-bold text-slate-400">Throughput Benchmark (Đo lường)</td>
                    {plans.map((p) => (
                      <td key={p.id} className="p-4 border-l border-slate-800/60 text-[11px]">
                        <div>Read: <span className="text-emerald-400">{p.metrics.readLoad}</span></div>
                        <div>Write: <span className="text-sky-400">{p.metrics.writeLoad}</span></div>
                        <div>p99 Latency: <span className="text-amber-400">{p.metrics.p99}</span></div>
                      </td>
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
                              ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
                              : 'bg-slate-800 hover:bg-slate-700 text-white'
                          }`}
                        >
                          <span>Khởi Tạo Database Ngay</span>
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

      {/* 5. FAQ SECTION */}
      <section className="py-20 bg-[#090d16] border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Câu Hỏi Thường Gặp Của Kỹ Sư &amp; DBA</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-mono">SEN CLOUDHOST MANAGED DATABASE FAQ</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-[#0c1322] rounded-2xl border border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left font-bold text-sm text-white flex items-center justify-between gap-4 hover:text-sky-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
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

      {/* 6. CALL TO ACTION: DIRECT CONSOLE DISPATCH */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#0d182e] via-[#091122] to-[#0d182e] p-8 sm:p-12 border border-sky-600/30 text-center relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-sky-950 border border-sky-800 text-sky-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              DEPLOY INSTANTLY IN 60 SECONDS
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
              Sẵn Sàng Vận Hành Cơ Sở Dữ Liệu Chuyên Nghiệp?
            </h3>
            
            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal">
              Bắt đầu với gói DB Micro chỉ 99.000đ/tháng hoặc nâng cấp cụm HA Master-Replica cho hệ thống production. 
              Hỗ trợ di dời cơ sở dữ liệu lớn sang SEN CloudHost hoàn toàn miễn phí.
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => {
                  const el = document.getElementById('pricing-matrix');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="px-8 py-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs font-mono shadow-xl shadow-sky-600/25 transition-all hover:scale-105"
              >
                Khởi Tạo Database Ngay
              </button>
              <Link
                href="/contact"
                className="px-8 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs font-mono border border-slate-700 transition-all"
              >
                Tư Vấn Kiến Trúc 1-1
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
