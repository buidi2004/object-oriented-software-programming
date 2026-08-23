'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, History, 
  AlertCircle, Banknote, ShieldCheck, RefreshCw, ShoppingBag, 
  Search, Filter, CheckCircle2, ChevronRight, FileText, Printer,
  Server, Globe, Gamepad2, Sparkles, TrendingUp, TrendingDown, Clock
} from 'lucide-react';
import { TopUpModal } from '@/src/components/TopUpModal';
import { WithdrawModal } from '@/src/components/WithdrawModal';
import { TransactionReceiptModal, ReceiptData } from '@/src/components/TransactionReceiptModal';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  rawType: string;
  amount: number;
  description: string;
  date: string;
}

const AVAILABLE_SERVICES = [
  {
    id: 'vps-starter',
    title: 'Cloud VPS Starter',
    desc: '1 vCPU AMD EPYC, 2GB RAM, 30GB NVMe',
    price: 120000,
    cycle: '/tháng',
    category: 'VPS NVMe',
    link: '/services/cloud-vps',
    icon: Server,
    color: 'bg-blue-50 text-blue-600 border-blue-200',
  },
  {
    id: 'vps-pro',
    title: 'Cloud VPS Pro NVMe',
    desc: '2 vCPU AMD EPYC, 4GB RAM, 60GB NVMe',
    price: 250000,
    cycle: '/tháng',
    category: 'VPS Cao Cấp',
    link: '/services/cloud-vps',
    icon: Server,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200',
  },
  {
    id: 'hosting-nvme',
    title: 'Web Hosting NVMe Lite',
    desc: 'Băng thông không giới hạn, cPanel, SSL Miễn phí',
    price: 45000,
    cycle: '/tháng',
    category: 'Web Hosting',
    link: '/services/static-sites',
    icon: Globe,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  },
  {
    id: 'game-server',
    title: 'Game Server Anti-DDoS',
    desc: 'Minecraft, CS2, Rust tốc độ cao 500Gbps',
    price: 150000,
    cycle: '/tháng',
    category: 'Game Server',
    link: '/services/game-servers',
    icon: Gamepad2,
    color: 'bg-purple-50 text-purple-600 border-purple-200',
  },
];

function parseTxType(type: any): { isCredit: boolean; rawName: string; label: string } {
  if (type === 'TopUp' || type === 0 || type === '0') {
    return { isCredit: true, rawName: 'TopUp', label: 'Nạp tiền vào ví (VietQR / Ngân hàng)' };
  }
  if (type === 'Refund' || type === 2 || type === '2') {
    return { isCredit: true, rawName: 'Refund', label: 'Hoàn tiền vào ví' };
  }
  return { isCredit: false, rawName: 'Payment', label: 'Thanh toán dịch vụ / Thuê VPS' };
}

export default function DashboardWalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<{ balance: number; currency: string }>({ balance: 0, currency: 'VND' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'credit' | 'debit'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [userInfo, setUserInfo] = useState<{ fullName: string; email: string }>({ fullName: '', email: '' });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchData(token);
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const [walletRes, txRes, userRes] = await Promise.all([
        fetch('/api/wallet/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/wallet/transactions', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data);
      }
      if (userRes.ok) {
        const uData = await userRes.json();
        setUserInfo({
          fullName: uData.fullName || uData.email || 'Khách hàng CloudHost',
          email: uData.email || '',
        });
      }
      if (txRes.ok) {
        const data = await txRes.json();
        const mapped = Array.isArray(data)
          ? data.map((t: { id: string; amount: number; type: any; createdAt: string }) => {
              const parsed = parseTxType(t.type);
              return {
                id: t.id,
                type: parsed.isCredit ? ('credit' as const) : ('debit' as const),
                rawType: parsed.rawName,
                amount: Math.abs(Number(t.amount)),
                description: parsed.label,
                date: t.createdAt,
              };
            })
          : [];
        setTransactions(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Financial Stats
  const { totalDeposited, totalSpent } = useMemo(() => {
    let deposited = 0;
    let spent = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'credit') {
        deposited += tx.amount;
      } else {
        spent += tx.amount;
      }
    });
    return { totalDeposited: deposited, totalSpent: spent };
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (filterType === 'credit' && t.type !== 'credit') return false;
      if (filterType === 'debit' && t.type !== 'debit') return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.amount.toString().includes(q)
        );
      }
      return true;
    });
  }, [transactions, filterType, searchQuery]);

  if (isLoading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1F1F1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <Wallet className="w-7 h-7 text-[#1F1F1F]" />
            Ví Tiền & Quản Lý Số Dư
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Nạp tiền VietQR 24/7, theo dõi biến động số dư và in hóa đơn giao dịch điện tử
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              const t = localStorage.getItem('accessToken');
              if (t) fetchData(t);
            }}
            className="p-2.5 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors shadow-2xs"
            title="Làm mới số dư"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowTopUpModal(true)}
            className="px-4 py-2.5 rounded bg-[#1F1F1F] hover:bg-black text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Nạp tiền vào ví
          </button>
        </div>
      </div>

      {/* Hero Financial Summary & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Balance Display */}
        <div className="lg:col-span-2 bg-[#1F1F1F] text-white rounded-lg p-6 sm:p-7 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-slate-300 text-xs font-bold tracking-wider uppercase">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Số Dư Ví Khả Dụng
              </div>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                VNĐ (Chính thức)
              </span>
            </div>

            <div className="my-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
                {wallet.balance.toLocaleString('vi-VN')}{' '}
                <span className="text-lg sm:text-2xl font-bold text-slate-400">đ</span>
              </h2>
            </div>

            {/* Sub Stats: Deposited vs Spent */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Tổng tiền đã nạp</span>
                  <span className="text-sm font-bold text-emerald-400">
                    +{totalDeposited.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <TrendingDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Tổng tiền đã chi</span>
                  <span className="text-sm font-bold text-slate-200">
                    -{totalSpent.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="px-4 py-2.5 rounded bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-all flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nạp tiền ngay
            </button>

            <button
              onClick={() => setShowWithdrawModal(true)}
              className="px-4 py-2.5 rounded bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-all flex items-center gap-1.5 border border-white/15"
            >
              <Banknote className="w-4 h-4 text-slate-300" />
              Rút tiền / Hoàn tiền
            </button>
          </div>
        </div>

        {/* Quick Perks / Info Box */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Đặc Quyền Ví CloudHost
            </h3>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F] mt-1.5 shrink-0" />
                <span><strong>Kích hoạt máy chủ tức thì:</strong> Tự động cấp phát VPS ngay khi bấm thanh toán.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F] mt-1.5 shrink-0" />
                <span><strong>Tự động gia hạn (Auto-Renew):</strong> Giữ hạ tầng luôn online 24/7 không bị khóa.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#1F1F1F] mt-1.5 shrink-0" />
                <span><strong>Rút tiền minh bạch:</strong> Hoàn tiền về tài khoản ngân hàng bất kỳ lúc nào.</span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <Link
              href="/services/cloud-vps"
              className="text-xs font-bold text-[#1F1F1F] hover:underline flex items-center justify-between group"
            >
              <span>Thuê máy chủ Cloud VPS mới</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Services Showcase */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-slate-700" />
              Có thể mua gì với số dư ví hiện tại?
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Các gói dịch vụ máy chủ, hosting và tên miền bạn có thể kích hoạt trực tiếp từ số dư ví
            </p>
          </div>
          <Link href="/services" className="text-xs font-bold text-blue-600 hover:underline">
            Xem tất cả dịch vụ →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AVAILABLE_SERVICES.map((srv) => {
            const canAfford = wallet.balance >= srv.price;
            const monthsAffordable = wallet.balance > 0 ? Math.floor(wallet.balance / srv.price) : 0;

            return (
              <div 
                key={srv.id}
                className="bg-white rounded-lg border border-slate-200 p-4.5 flex flex-col justify-between shadow-xs hover:border-[#1F1F1F] hover:shadow-md transition-all group"
              >
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-8 h-8 rounded flex items-center justify-center border ${srv.color}`}>
                        <srv.icon className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                        {srv.category}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-1">
                      {srv.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed min-h-[32px]">
                      {srv.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-baseline justify-between gap-1">
                      <div className="flex items-baseline gap-0.5">
                        <span className="text-base sm:text-lg font-black text-slate-900">
                          {srv.price.toLocaleString('vi-VN')}
                        </span>
                        <span className="text-xs font-bold text-slate-900">đ</span>
                        <span className="text-[11px] text-slate-400 font-medium">{srv.cycle}</span>
                      </div>

                      {canAfford ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 shrink-0">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đủ số dư
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 shrink-0">
                          Thiếu {(srv.price - wallet.balance).toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>

                    <Link
                      href={srv.link}
                      className={`w-full py-2.5 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs ${
                        canAfford
                          ? 'bg-[#1F1F1F] hover:bg-black text-white hover:shadow-sm'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {canAfford ? 'Đặt mua ngay' : 'Xem cấu hình'}
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transactions & Receipts Ledger */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        {/* Section Header, Search & Filter Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-700" />
              Lịch sử giao dịch & Hóa đơn nạp tiền
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Xem thời gian, ngày giờ chi tiết và in biên lai điện tử cho từng giao dịch
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            {/* Search input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo mã ID hoặc mô tả..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-900 focus:bg-white focus:border-[#1F1F1F] outline-none w-full sm:w-56"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-md">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                  filterType === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tất cả ({transactions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterType('credit')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                  filterType === 'credit'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tiền vào (+)
              </button>
              <button
                type="button"
                onClick={() => setFilterType('debit')}
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                  filterType === 'debit'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tiền ra (-)
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {filteredTransactions.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Không tìm thấy giao dịch nào</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Khi bạn nạp tiền hoặc thanh toán dịch vụ, các giao dịch và hóa đơn điện tử sẽ được hiển thị chi tiết tại đây.
            </p>
            <button
              onClick={() => setShowTopUpModal(true)}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded bg-[#1F1F1F] text-white text-xs font-bold hover:bg-black transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Nạp tiền ngay
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isCredit = tx.type === 'credit';
              const txDate = new Date(tx.date);
              const fullDateTime = txDate.toLocaleString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              });

              return (
                <div 
                  key={tx.id} 
                  onClick={() => setSelectedReceipt({
                    ...tx,
                    userFullName: userInfo.fullName,
                    userEmail: userInfo.email,
                  })}
                  className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/70 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center ${
                      isCredit 
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {isCredit ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-blue-600 transition-colors">
                        {tx.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {fullDateTime}
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[10px] text-slate-400">
                          Mã GD: {tx.id.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 pl-3">
                    <div className="text-right">
                      <span className={`text-sm sm:text-base font-black ${
                        isCredit ? 'text-emerald-600' : 'text-slate-900'
                      }`}>
                        {isCredit ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                      </span>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {isCredit ? 'Đã cộng vào ví' : 'Thanh toán thành công'}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReceipt({
                          ...tx,
                          userFullName: userInfo.fullName,
                          userEmail: userInfo.email,
                        });
                      }}
                      className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Biên lai</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* TopUp Modal */}
      <TopUpModal
        isOpen={showTopUpModal}
        onClose={() => setShowTopUpModal(false)}
        currentBalance={wallet.balance}
        onSuccess={() => {
          const token = localStorage.getItem('accessToken');
          if (token) fetchData(token);
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        currentBalance={wallet.balance}
      />

      {/* Transaction Receipt Modal */}
      <TransactionReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        transaction={selectedReceipt}
      />
    </div>
  );
}
