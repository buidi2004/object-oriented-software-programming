'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAuthModalUrl } from '@/src/lib/authNavigation';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, CreditCard, History, AlertCircle } from 'lucide-react';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
}

export default function WalletPage() {
  const router = useRouter();
  const [wallet, setWallet] = useState<{ balance: number; currency: string }>({ balance: 0, currency: 'VND' });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [showTopUp, setShowTopUp] = useState(false);
  const [checkoutContext, setCheckoutContext] = useState<{
    orderId?: string;
    suggestedAmount?: number;
  } | null>(null);
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      window.location.assign(getAuthModalUrl('login', '/wallet'));
      return;
    }
    fetchData(token);

    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('topup') === '1') {
      setShowTopUp(true);
    }
    const amount = params.get('amount');
    if (amount && !Number.isNaN(Number(amount))) {
      setTopUpAmount(amount);
    }
    if (params.get('from') === 'checkout') {
      setCheckoutContext({
        orderId: params.get('orderId') ?? undefined,
        suggestedAmount: amount ? Number(amount) : undefined,
      });
    }
  }, [router]);

  const fetchData = async (token: string) => {
    try {
      const [walletRes, txRes] = await Promise.all([
        fetch('/api/wallet/me', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/wallet/transactions', { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      if (walletRes.ok) {
        const data = await walletRes.json();
        setWallet(data);
      }
      if (txRes.ok) {
        const data = await txRes.json();
        const mapped = Array.isArray(data)
          ? data.map((t: { id: string; amount: number; type: string; createdAt: string }) => ({
              id: t.id,
              type: t.type === 'TopUp' ? 'credit' as const : 'debit' as const,
              amount: Math.abs(Number(t.amount)),
              description:
                t.type === 'TopUp'
                  ? 'Nạp tiền vào ví'
                  : t.type === 'Refund'
                    ? 'Hoàn tiền'
                    : 'Thanh toán đơn hàng',
              date: t.createdAt,
            }))
          : [];
        setTransactions(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopUp = async () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount <= 0) return;

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch('/api/wallet/top-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ amount }),
      });

      if (response.ok) {
        setShowTopUp(false);
        setTopUpAmount('');
        setTopUpSuccess(true);
        fetchData(token!);
      }
    } catch (error) {
      console.error('Top up failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-slate-900">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900">
              CloudHost<span className="text-[#1F1F1F]"> VN</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#1F1F1F]">
            ← Quay lại Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {checkoutContext && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#1F1F1F] shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-[#1F1F1F]">Hoàn tất thanh toán đơn hàng</p>
              <p className="text-sm text-[#1F1F1F]/90 mt-1 leading-relaxed">
                Số dư ví chưa đủ. Nạp thêm credit
                {checkoutContext.suggestedAmount
                  ? ` (gợi ý ${checkoutContext.suggestedAmount.toLocaleString('vi-VN')} đ)`
                  : ''}
                {' '}rồi quay lại giỏ hàng để thanh toán lại.
              </p>
            </div>
          </div>
        )}

        {topUpSuccess && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-3">
              <ArrowDownLeft className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-emerald-900">Nạp tiền thành công!</p>
                <p className="text-sm text-emerald-800 mt-1">Bạn có thể quay lại giỏ hàng và bấm &quot;Thử thanh toán lại&quot;.</p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              Quay lại giỏ hàng
            </Link>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 mb-8 text-slate-900 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-[#1F1F1F]" />
                </div>
                <div>
                  <p className="text-sm text-slate-600">Số dư ví tiền</p>
                  <p className="text-4xl font-black">{wallet.balance.toLocaleString('vi-VN')} đ</p>
                </div>
              </div>
              
              <button
                onClick={() => setShowTopUp(!showTopUp)}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-900 font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nạp tiền
              </button>
            </div>

            {showTopUp && (
              <div className="bg-white/10 backdrop-blur rounded-xl p-4 mb-4">
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Nhập số tiền nạp (VNĐ)"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-400 mb-3"
                />
                <div className="flex gap-2 mb-3">
                  {[100000, 200000, 500000, 1000000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTopUpAmount(amount.toString())}
                      className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium hover:bg-white/20 transition-colors"
                    >
                      {amount.toLocaleString('vi-VN')}đ
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleTopUp}
                  className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors"
                >
                  Xác nhận nạp tiền
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-[#1F1F1F]" />
              Lịch sử giao dịch
            </h2>
            <span className="text-sm text-slate-500">{transactions.length} giao dịch</span>
          </div>

          {transactions.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <History className="w-12 h-12 mx-auto mb-3 text-slate-700" />
              <p className="font-medium">Chưa có giao dịch nào</p>
              <p className="text-sm mt-1">Số dư ví của bạn hiện đang trống</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      tx.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-[#1F1F1F]'
                    }`}>
                      {tx.type === 'credit' ? (
                        <ArrowDownLeft className="w-5 h-5" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{tx.description}</p>
                      <p className="text-xs text-slate-500">{new Date(tx.date).toLocaleDateString('vi-VN')}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${
                    tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900'
                  }`}>
                    {tx.type === 'credit' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')} đ
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
