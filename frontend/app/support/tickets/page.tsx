'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/src/lib/api';
import { Header } from '@/src/components/Header';
import { LifeBuoy, Plus, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';

interface TicketSummary {
  id: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

export default function TicketsListPage() {
  const { user } = useAuthStore();
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      api.get('/tickets/me')
        .then(res => setTickets(res.data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
        <p className="text-slate-600 mb-4">Bạn cần đăng nhập để xem các yêu cầu hỗ trợ.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'inprogress': return 'bg-blue-100 text-[#1F1F1F] border-blue-200';
      case 'closed': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'normal': return 'text-[#1F1F1F] bg-blue-50';
      case 'low': return 'text-slate-600 bg-slate-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <LifeBuoy className="w-6 h-6 text-[#1F1F1F]" /> Hỗ trợ (Tickets)
              </h1>
              <p className="text-slate-600 mt-1">Quản lý các yêu cầu hỗ trợ kỹ thuật của bạn.</p>
            </div>
            <Link
              href="/support/tickets/new"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-bold flex items-center gap-2 text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Tạo Ticket
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="bg-white rounded border border-slate-200 p-12 flex flex-col items-center text-center">
              <LifeBuoy className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có Ticket nào</h3>
              <p className="text-slate-600 mb-6">Bạn chưa có yêu cầu hỗ trợ nào. Nếu cần giúp đỡ, hãy tạo mới một Ticket.</p>
              <Link href="/support/tickets/new" className="text-[#1F1F1F] font-semibold hover:underline">
                Tạo Ticket ngay &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {tickets.map(ticket => (
                <Link
                  key={ticket.id}
                  href={`/support/tickets/${ticket.id}`}
                  className="block bg-white border border-slate-200 rounded p-5 hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 group-hover:text-[#1F1F1F] text-lg mb-2">
                        {ticket.subject}
                      </h3>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className={`px-2.5 py-0.5 rounded-full border ${getStatusColor(ticket.status)}`}>
                          {ticket.status?.toUpperCase() || 'UNKNOWN'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority?.toUpperCase() || 'NORMAL'}
                        </span>
                        <span className="text-slate-600 flex items-center gap-1 font-normal">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(ticket.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
  );
}
