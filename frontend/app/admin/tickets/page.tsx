'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, MessageSquare, Clock, AlertCircle, CheckCircle2, User, Tag, ChevronRight } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  category: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: string;
  lastMessageAt: string;
  messageCount: number;
}

export default function AdminTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin' && userData.role !== 'Staff') {
          router.push('/dashboard');
          return;
        }
        fetchTickets(token);
      } else {
        router.push('/login');
      }
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchTickets = async (token: string) => {
    try {
      const response = await fetch('/api/tickets/queue', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignTicket = async (ticketId: string, staffId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/tickets/${ticketId}/assign`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ staffId }),
      });
      if (response.ok) {
        fetchTickets(token!);
      }
    } catch (error) {
      console.error('Failed to assign ticket:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      case 'low': return 'bg-blue-100 text-blue-700';
      default: return 'bg-slate-100 text-slate-700';
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Hỗ trợ Ticket Queue</h1>
              <p className="text-sm text-slate-500">{tickets.length} tickets tổng cộng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {tickets.filter(t => t.status === 'open').length} Đang mở
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-amber-100 text-amber-700 text-sm font-semibold">
              {tickets.filter(t => t.status === 'pending').length} Chờ phản hồi
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm ticket..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="open">Đang mở</option>
            <option value="pending">Chờ phản hồi</option>
            <option value="closed">Đã đóng</option>
          </select>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Mã ticket</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Tiêu đề</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Khách hàng</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Danh mục</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Độ ưu tiên</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Phân công</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Cập nhật</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-slate-600">#{ticket.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 line-clamp-1">{ticket.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{ticket.messageCount} tin nhắn</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-900">{ticket.customerName}</p>
                      <p className="text-xs text-slate-500">{ticket.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-700">
                        {ticket.category}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'high' ? 'Cao' : ticket.priority === 'medium' ? 'TB' : 'Thấp'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                        {ticket.status === 'open' ? 'Mở' : ticket.status === 'pending' ? 'Chờ' : 'Đóng'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ticket.assignedTo ? (
                        <span className="text-sm text-slate-700">{ticket.assignedTo}</span>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Chưa phân công</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-600 text-xs">
                      {new Date(ticket.lastMessageAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/tickets/${ticket.id}`} className="inline-flex p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTickets.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="font-medium">Không tìm thấy ticket nào</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
