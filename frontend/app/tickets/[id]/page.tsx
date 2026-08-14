'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Send, Paperclip, Clock, Tag, AlertCircle, 
  CheckCircle2, MessageSquare, User, Calendar
} from 'lucide-react';

interface TicketMessage {
  id: string;
  sender: 'customer' | 'agent';
  senderName: string;
  content: string;
  timestamp: string;
  isInternal?: boolean;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchTicket(token);
  }, [ticketId, router]);

  const fetchTicket = async (token: string) => {
    try {
      const response = await fetch(`/api/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setTicket({
          id: data.id,
          subject: data.subject,
          category: data.category || 'General',
          status: data.status,
          priority: data.priority,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          messages: (data.messages || []).map((m: any) => ({
            id: m.id,
            sender: m.isAgent ? 'agent' : 'customer',
            senderName: m.senderName,
            content: m.content,
            timestamp: m.timestamp,
          })),
        });
      }
    } catch (error) {
      console.error('Failed to fetch ticket:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const token = localStorage.getItem('accessToken');
    setIsSending(true);
    
    try {
      const response = await fetch(`/api/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });
      
      if (response.ok) {
        setMessage('');
        fetchTicket(token!);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-emerald-100 text-emerald-700';
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'closed': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Đang mở';
      case 'pending': return 'Chờ phản hồi';
      case 'closed': return 'Đã đóng';
      default: return status;
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

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Cao';
      case 'medium': return 'Trung bình';
      case 'low': return 'Thấp';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Ticket not found</h2>
          <Link href="/dashboard/tickets" className="text-blue-600 hover:underline">
            ← Quay lại danh sách ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/tickets" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-600">
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách ticket
          </Link>
          <div className="flex items-center gap-3">
            {ticket.status === 'open' && (
              <button className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Đóng ticket
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Ticket Header */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{ticket.subject}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                  {getStatusLabel(ticket.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                  {getPriorityLabel(ticket.priority)}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4" />
                  {ticket.category}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  Tạo ngày: {new Date(ticket.createdAt).toLocaleDateString('vi-VN')}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  Cập nhật: {new Date(ticket.updatedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Messages Thread */}
          <div className="lg:col-span-2 space-y-4">
            {ticket.messages.map((msg) => (
              <div
                key={msg.id}
                className={`rounded-2xl p-4 border ${
                  msg.sender === 'customer'
                    ? 'bg-blue-50 border-blue-200 ml-auto max-w-[80%]'
                    : 'bg-white border-slate-200 mr-auto max-w-[80%]'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                    {msg.sender === 'customer' ? 'U' : 'A'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{msg.senderName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(msg.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  {msg.isInternal && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold ml-auto">
                      Internal
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))}

            {/* Message Input */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 mt-6">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập nội dung tin nhắn..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
              />
              <div className="flex items-center justify-between mt-3">
                <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isSending || !message.trim()}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Gửi tin nhắn
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar - Ticket Info */}
          <div className="space-y-6">
            {/* Ticket Details */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Thông tin ticket</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã ticket</span>
                  <span className="font-mono font-semibold text-slate-900">#{ticket.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Danh mục</span>
                  <span className="font-semibold text-slate-900">{ticket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Độ ưu tiên</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(ticket.priority)}`}>
                    {getPriorityLabel(ticket.priority)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                    {getStatusLabel(ticket.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Related Services */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200">
              <h3 className="font-bold text-slate-900 mb-4">Dịch vụ liên quan</h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="font-semibold text-slate-900 text-sm">Cloud VPS Hanoi-01</p>
                  <p className="text-xs text-slate-500">103.149.28.112</p>
                </div>
              </div>
            </div>

            {/* Support Info */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">Cần hỗ trợ thêm?</h3>
              <div className="space-y-3 text-sm text-blue-100">
                <p>📞 Hotline: 1900 6888</p>
                <p>💬 Live chat 24/7</p>
                <p>✉️ support@cloudhost.vn</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
