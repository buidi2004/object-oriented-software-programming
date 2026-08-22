'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowUpRight, ArrowDownLeft, AlertCircle, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Transaction {
  id: string;
  type: 'payment' | 'refund';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  createdAt: string;
}

const colorMap: Record<string, string> = {
  slate: 'text-slate-700 bg-slate-100',
  emerald: 'text-emerald-600 bg-emerald-100',
  amber: 'text-amber-600 bg-amber-100',
  red: 'text-red-600 bg-red-100',
};

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
      const transactionsRes = await api.get('/orders/me');

      if (transactionsRes.data && Array.isArray(transactionsRes.data)) {
        const orderTransactions = transactionsRes.data
          .filter((t: any) => t.status === 'Paid' || t.status === 'Pending')
          .map((t: any) => ({
            id: t.id,
            type: 'payment' as const,
            amount: t.totalAmount,
            status: t.status === 'Paid' ? 'completed' as const : 'pending' as const,
            description: `Thanh toán Đơn hàng ${t.id.substring(0, 8).toUpperCase()}`,
            createdAt: t.createdAt,
        }));
        setTransactions(orderTransactions);
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
      case 'refund': return <ArrowDownLeft className="w-5 h-5 text-emerald-600" />;
      case 'payment': return <ArrowUpRight className="w-5 h-5 text-red-600" />;
      default: return <ArrowUpRight className="w-5 h-5 text-red-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Thanh toán & Giao dịch</h1>
          <p className="text-slate-600 mt-1">Quản lý lịch sử thanh toán đơn hàng của bạn</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Tổng tiêu', value: transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0), icon: ArrowUpRight, colorKey: 'red' },
          { label: 'Hoàn trả', value: transactions.filter(t => t.type === 'refund').reduce((sum, t) => sum + t.amount, 0), icon: ArrowDownLeft, colorKey: 'emerald' },
        ].map((stat) => (
          <div key={`payment-stat-${stat.label}`} className="bg-white rounded-md p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded flex items-center justify-center ${colorMap[stat.colorKey]}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{formatCurrency(stat.value)}</p>
                <p className="text-sm text-slate-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Lịch sử giao dịch</h2>
          <span className="text-sm text-slate-600">{transactions.length} giao dịch</span>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded flex items-center gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
            <button onClick={fetchData} className="ml-auto px-3 py-1 bg-red-100 hover:bg-red-200 rounded-sm text-xs font-semibold">
              Thử lại
            </button>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {transactions.map((tx) => (
            <div key={tx.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                  {getTransactionIcon(tx.type)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{tx.description}</p>
                  <span className="text-xs text-slate-600 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(tx.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <p className={`font-bold ${
                  tx.type === 'refund' ? 'text-emerald-600' : 'text-slate-900'
                }`}>
                  {tx.type === 'refund' ? '+' : '-'}{formatCurrency(tx.amount)}
                </p>
                {tx.status === 'pending' ? (
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium mt-1">
                    Chờ xử lý
                  </span>
                ) : tx.status === 'failed' ? (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium mt-1">
                    Thất bại
                  </span>
                ) : (
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium mt-1">
                    Thành công
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {transactions.length === 0 && !error && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-700" />
            <p className="font-medium text-slate-600">Chưa có giao dịch nào</p>
          </div>
        )}
      </div>
      </div>
  );
}
