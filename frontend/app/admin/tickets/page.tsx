'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Filter, MessageSquare, Clock, AlertCircle, CheckCircle2, User, Tag, ChevronRight, Mail, X, Loader2 } from 'lucide-react';

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
  
  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTicketId, setEmailTicketId] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

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
        const isAllowed = ['Admin', 'Support', 'Technician', 'Staff'].some(
          r => r.toLowerCase() === (userData.role || '').toLowerCase()
        );
        if (!isAllowed) {
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

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTicketId || !emailSubject.trim() || !emailBody.trim()) return;

    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsSendingEmail(true);
    try {
      const response = await fetch(`/api/tickets/${emailTicketId}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: emailSubject,
          htmlBody: emailBody
        }),
      });

      if (response.ok) {
        alert('Đã gửi email thành công!');
        setEmailModalOpen(false);
        setEmailSubject('');
        setEmailBody('');
      } else {
        const errorData = await response.json();
        alert('Gửi email thất bại: ' + (errorData.message || 'Lỗi không xác định'));
      }
    } catch (error) {
      console.error('Lỗi khi gửi email:', error);
      alert('Đã có lỗi xảy ra khi gửi email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const s = searchTerm.toLowerCase();
    const matchesSearch = (ticket.subject || '').toLowerCase().includes(s) ||
                         (ticket.customerName || '').toLowerCase().includes(s) ||
                         (ticket.customerEmail || '').toLowerCase().includes(s) ||
                         (ticket.id || '').toLowerCase().includes(s);
    const matchesStatus = filterStatus === 'all' || 
                         String(ticket.status).toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getPriorityLabel = (priority: string | number) => {
    const p = String(priority || '').toLowerCase();
    if (p === 'urgent' || p === '4') return 'Khẩn cấp';
    if (p === 'high' || p === '3') return 'Cao';
    if (p === 'medium' || p === 'normal' || p === '2') return 'Bình thường';
    return 'Thấp';
  };

  const getPriorityColor = (priority: string | number) => {
    const p = String(priority || '').toLowerCase();
    if (p === 'urgent' || p === '4') return 'bg-rose-100 text-rose-700 border border-rose-200';
    if (p === 'high' || p === '3') return 'bg-red-100 text-red-700 border border-red-200';
    if (p === 'medium' || p === 'normal' || p === '2') return 'bg-amber-100 text-amber-700 border border-amber-200';
    return 'bg-blue-900/50 text-[#1F1F1F] border border-blue-200';
  };

  const getStatusLabel = (status: string | number) => {
    const s = String(status || '').toLowerCase();
    if (s === 'open' || s === '1') return 'Đang mở';
    if (s === 'pending' || s === 'inprogress' || s === '2') return 'Đang xử lý';
    if (s === 'resolved' || s === '3') return 'Đã giải quyết';
    return 'Đã đóng';
  };

  const getStatusColor = (status: string | number) => {
    const s = String(status || '').toLowerCase();
    if (s === 'open' || s === '1') return 'bg-emerald-100 text-emerald-700';
    if (s === 'pending' || s === 'inprogress' || s === '2') return 'bg-amber-100 text-amber-700';
    return 'bg-white/10 text-slate-200';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Mới tạo';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Mới tạo' : d.toLocaleString('vi-VN');
    } catch {
      return 'Mới tạo';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const openCount = tickets.filter(t => ['open', '1'].includes(String(t.status).toLowerCase())).length;
  const pendingCount = tickets.filter(t => ['pending', 'inprogress', '2'].includes(String(t.status).toLowerCase())).length;

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <header className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-sm hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-500" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-white">Hỗ trợ Ticket Queue</h1>
              <p className="text-sm text-slate-500">{tickets.length} tickets tổng cộng</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-sm bg-emerald-100 text-emerald-700 text-sm font-semibold">
              {openCount} Đang mở
            </span>
            <span className="px-3 py-1.5 rounded-sm bg-amber-100 text-amber-700 text-sm font-semibold">
              {pendingCount} Đang xử lý
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded p-4 border border-white/10 mb-6 flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề, khách hàng, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-sm border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2.5 rounded-sm border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-[#1E293B] bg-opacity-70 backdrop-blur-md"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="open">Đang mở</option>
            <option value="pending">Đang xử lý</option>
            <option value="closed">Đã đóng</option>
          </select>
        </div>

        <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded border border-white/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#0F172A] border-b border-white/10">
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Mã ticket</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Tiêu đề</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Khách hàng</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Danh mục</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Độ ưu tiên</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Trạng thái</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Phân công</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-200">Cập nhật</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-200">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-[#0F172A] transition-colors">
                    <td className="py-3 px-4 font-mono text-xs text-[#1F1F1F] font-bold">#{ticket.id.slice(0, 8)}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-white line-clamp-1">{ticket.subject}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{ticket.messageCount || 1} tin nhắn</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{ticket.customerName || 'Khách hàng'}</p>
                      <p className="text-xs text-slate-500">{ticket.customerEmail}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-sm bg-white/10 text-xs font-medium text-slate-200">
                        {ticket.category || 'Kỹ thuật'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-sm text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                        {getStatusLabel(ticket.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {ticket.assignedTo ? (
                        <span className="text-sm text-slate-200 font-medium">{ticket.assignedTo}</span>
                      ) : (
                        <span className="text-sm text-slate-500 italic">Chưa phân công</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-xs font-mono">
                      {formatDate(ticket.lastMessageAt || ticket.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right flex justify-end gap-2">
                      <button 
                        onClick={() => {
                          setEmailTicketId(ticket.id);
                          setEmailSubject(`Re: ${ticket.subject}`);
                          setEmailModalOpen(true);
                        }}
                        className="inline-flex p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-sm transition-colors"
                        title="Gửi Email cho khách hàng"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <Link href={`/tickets/${ticket.id}`} className="inline-flex p-2 text-slate-500 hover:text-[#1F1F1F] hover:bg-blue-900/30 rounded-sm transition-colors">
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
              <MessageSquare className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="font-medium">Không tìm thấy ticket nào</p>
            </div>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E293B] bg-opacity-70 backdrop-blur-md/50 backdrop-blur-sm">
          <div className="bg-[#1E293B] bg-opacity-70 backdrop-blur-md rounded shadow-xl w-full max-w-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#0F172A]">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#1F1F1F]" />
                Gửi Email cho khách hàng
              </h2>
              <button 
                onClick={() => setEmailModalOpen(false)}
                className="p-2 text-slate-500 hover:text-slate-500 hover:bg-white/20 rounded-sm transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSendEmail} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Tiêu đề email
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="Nhập tiêu đề..."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-1">
                  Nội dung (hỗ trợ HTML)
                </label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-4 py-3 rounded-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[200px]"
                  placeholder="Nhập nội dung email..."
                  required
                />
              </div>
              
              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEmailModalOpen(false)}
                  className="px-4 py-2 rounded-sm text-slate-500 font-medium hover:bg-white/10 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSendingEmail || !emailSubject.trim() || !emailBody.trim()}
                  className="px-6 py-2 rounded-sm bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSendingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Gửi Email
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
