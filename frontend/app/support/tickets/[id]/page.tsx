'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/src/lib/api';
import { Header } from '@/src/components/Header';
import { LifeBuoy, ArrowLeft, Send, AlertCircle, Loader2, CheckCircle, Clock, User as UserIcon } from 'lucide-react';
import { useAuthStore } from '@/src/store/useAuthStore';
import { TicketCsat } from '@/src/components/team-features/TicketCsat';

interface TicketMessage {
  id: string;
  message: string;
  senderName: string;
  isAgent: boolean;
  createdAt: string;
}

interface TicketDetail {
  id: string;
  subject: string;
  status: string;
  priority: string;
  assignedStaffId: string | null;
  messages: TicketMessage[];
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err: any) {
      setError(err.response?.data?.title || 'Không tìm thấy Ticket hoặc bạn không có quyền xem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && id) {
      fetchTicket();
    } else if (!user) {
      setLoading(false);
    }
  }, [user, id]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [ticket?.messages]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold mb-2">Vui lòng đăng nhập</h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center h-[60vh] items-center">
        <Loader2 className="w-8 h-8 text-[#1F1F1F] animate-spin" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <AlertCircle className="w-12 h-12 text-red-400 mb-4" />
        <h2 className="text-xl font-bold mb-2">Đã có lỗi</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link href="/support/tickets" className="px-6 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg font-bold transition-colors">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setIsReplying(true);
    try {
      await api.post(`/tickets/${id}/messages`, { message: replyText });
      setReplyText('');
      await fetchTicket(); // refresh messages
    } catch (err: any) {
      alert(err.response?.data?.title || 'Lỗi gửi tin nhắn');
    } finally {
      setIsReplying(false);
    }
  };

  const handleCloseTicket = async () => {
    if (!confirm('Bạn có chắc chắn muốn đóng ticket này? Bạn sẽ không thể gửi thêm tin nhắn sau khi đóng.')) return;
    
    setIsClosing(true);
    try {
      await api.patch(`/tickets/${id}/close`);
      await fetchTicket();
    } catch (err: any) {
      alert('Không thể đóng ticket.');
    } finally {
      setIsClosing(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status.toLowerCase()) {
      case 'open': return { text: 'Đang mở (Open)', color: 'bg-emerald-100 text-emerald-700' };
      case 'inprogress': return { text: 'Đang xử lý (In Progress)', color: 'bg-blue-100 text-[#1F1F1F]' };
      case 'closed': return { text: 'Đã đóng (Closed)', color: 'bg-slate-200 text-slate-700' };
      default: return { text: status.toUpperCase(), color: 'bg-slate-200 text-slate-700' };
    }
  };

  const statusInfo = getStatusLabel(ticket.status);
  const isClosed = ticket.status.toLowerCase() === 'closed';

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto w-full px-4">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <Link href="/support/tickets" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium">
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </Link>
          
          {!isClosed && (
            <button 
              onClick={handleCloseTicket}
              disabled={isClosing}
              className="text-sm font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              {isClosing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Đóng Ticket
            </button>
          )}
        </div>

        {/* Ticket Header Details */}
        <div className="bg-white rounded-t-2xl border border-slate-200 p-5 shadow-sm shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">{ticket.subject}</h1>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className={`px-2.5 py-0.5 rounded-full ${statusInfo.color}`}>
                  {statusInfo.text}
                </span>
                <span className="text-slate-500 flex items-center gap-1 font-normal">
                  ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">{ticket.id.split('-')[0]}</code>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="bg-slate-100 border-x border-slate-200 flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {ticket.messages.map((msg) => {
            const isMe = !msg.isAgent;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-xs font-bold text-slate-700">{isMe ? 'Bạn' : (msg.senderName || 'Kỹ thuật viên')}</span>
                  <span className="text-[10px] text-slate-600 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <div 
                  className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-tr-sm shadow-sm shadow-blue-500/20' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Box */}
        <div className="bg-white rounded-b-2xl border border-t-0 border-slate-200 p-4 shrink-0">
          {isClosed ? (
            <div className="text-center py-3 text-slate-500 text-sm flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5 text-slate-600" />
              Ticket này đã đóng. Nếu bạn gặp vấn đề mới, vui lòng tạo Ticket khác.
            </div>
          ) : (
            <form onSubmit={handleReply} className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
              <div className="flex-1 w-full bg-slate-50 rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <textarea
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung phản hồi của bạn..."
                  className="w-full bg-transparent border-none focus:ring-0 resize-none p-3 text-sm h-12 max-h-32 min-h-12"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply(e);
                    }
                  }}
                />
              </div>
              <button 
                type="submit"
                disabled={!replyText.trim() || isReplying}
                className="w-full sm:w-auto shrink-0 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-colors"
              >
                {isReplying ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                <span className="sm:hidden">Gửi tin nhắn</span>
              </button>
            </form>
          )}
        </div>
        {isClosed && <TicketCsat ticketId={ticket.id} />}
      </div>
    </div>
  );
}
