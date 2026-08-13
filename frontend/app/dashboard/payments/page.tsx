'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, AlertCircle, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Transaction {
  id: string;
  type: 'topup' | 'payment' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  createdAt: string;
}

const colorMap: Record<string, string> = {
  blue: 'text-blue-600 bg-blue-100',
  emerald: 'text-emerald-600 bg-emerald-100',
  amber: 'text-amber-600 bg-amber-100',
  red: 'text-red-600 bg-red-100',
};

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const [walletRes, transactionsRes] = await Promise.all([
        api.get('/wallet/me'),
        api.get('/wallet/transactions')
      ]);

      if (walletRes.data) {
        setBalance(walletRes.data.balance || 0);
      }

      if (transactionsRes.data && Array.isArray(transactionsRes.data)) {
        setTransactions(transactionsRes.data.map((t: { id: string; amount: number; type: string; createdAt: string }) => ({
          id: t.id,
          type: t.type === 'TopUp' ? 'topup' : t.type === 'Refund' ? 'refund' : 'payment',
          amount: Math.abs(Number(t.amount)),
          status: 'completed' as const,
          description:
            t.type === 'TopUp'
              ? 'Nạp tiền vào ví'
              : t.type === 'Refund'
                ? 'Hoàn tiền'
                : 'Thanh toán đơn hàng',
          createdAt: t.createdAt,
        })));
      } else {
        setTransactions([]);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('vi-VN') + '₫';
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup': return <ArrowUpRight className="w-5 h-5 text-emerald-600" />;
      case 'refund': return <ArrowDownLeft className="w-5 h-5 text-blue-600" />;
      default: return <ArrowUpRight className="w-5 h-5 text-red-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium">Số dư ví</p>
            <p className="text-4xl font-black mt-1">{formatCurrency(balance)}</p>
            <p className="text-blue-200 text-sm mt-2">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
          </div>
          <a
            href="/wallet"
            className="px-5 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-5 h-5" />
            Nạp tiền
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Tổng nạp', value: transactions.filter(t => t.type === 'topup').reduce((sum, t) => sum + t.amount, 0), icon: ArrowUpRight, colorKey: 'emerald' },
          { label: 'Tổng tiêu', value: transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0), icon: ArrowDownLeft, colorKey: 'red' },
          { label: 'Hoàn trả', value: transactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0), icon: DollarSign, colorKey: 'blue' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[stat.colorKey]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stat.value)}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Lịch sử giao dịch</h2>
          <span className="text-sm text-slate-500">{transactions.length} giao dịch</span>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={fetchData} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-semibold">
              Thử lại
            </button>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">
                    {transaction.type === 'topup' ? 'Nạp tiền' :
                     transaction.type === 'refund' ? 'Hoàn tiền' : 'Thanh toán'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(transaction.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      transaction.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-700'
                        : transaction.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.status === 'completed' ? 'Thành công' :
                       transaction.status === 'pending' ? 'Đang xử lý' : 'Thất bại'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-bold ${
                  transaction.type === 'topup' ? 'text-emerald-600' :
                  transaction.type === 'refund' ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'topup' || transaction.type === 'refund' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && !error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-500">Chưa có giao dịch nào</p>
          </div>
        )}
      </div>
      </div>
  );
}
