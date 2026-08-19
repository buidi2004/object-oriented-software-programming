'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt?: string;
}

const statusLabels: Record<string, string> = {
  Open: 'Đang mở',
  InProgress: 'Đang xử lý',
  Closed: 'Đã đóng',
  open: 'Đang mở',
  pending: 'Chờ phản hồi',
  closed: 'Đã đóng',
};

const statusColors: Record<string, string> = {
  Open: 'bg-emerald-100 text-emerald-700',
  InProgress: 'bg-amber-100 text-amber-700',
  Closed: 'bg-slate-100 text-slate-700',
  open: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  closed: 'bg-slate-100 text-slate-700',
};

export default function CustomerTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const response = await fetch('/api/tickets/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      } else {
        setError('Không thể tải danh sách ticket.');
      }
    } catch {
      setError('Không thể tải danh sách ticket.');
    } finally {
      setIsLoading(false);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Hỗ trợ & Ticket</h1>
          <p className="text-slate-500 mt-1">Theo dõi yêu cầu hỗ trợ của bạn</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/tickets/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2 text-sm transition-colors shadow-xs"
          >
            Tạo Ticket
          </Link>
          <button
            onClick={fetchTickets}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
            title="Làm mới"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {tickets.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium text-slate-500 mb-4">Chưa có ticket nào</p>
            <Link
              href="/dashboard/tickets/new"
              className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold rounded-lg text-sm transition-colors"
            >
              Tạo yêu cầu hỗ trợ ngay
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/dashboard/tickets/${ticket.id}`}
                className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <p className="font-semibold text-slate-900">{ticket.subject}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[ticket.status] || 'bg-slate-100 text-slate-700'}`}>
                      {statusLabels[ticket.status] || ticket.status}
                    </span>
                    <span className="text-xs text-slate-500 capitalize">{ticket.priority}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
