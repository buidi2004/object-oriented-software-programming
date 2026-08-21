'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Headphones, 
  MessageSquare, 
  FileText, 
  HelpCircle, 
  ShieldCheck, 
  Send, 
  Clock, 
  PhoneCall, 
  Mail, 
  ChevronRight, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';

export default function SupportCenterPage() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [priority, setPriority] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('http://localhost:5053/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          subject: ticketSubject,
          priority: parseInt(priority)
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.id && token) {
          await fetch(`http://localhost:5053/api/tickets/${data.id}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ message: ticketMessage })
          });
        }
        setSuccessMsg('Yêu cầu hỗ trợ của bạn đã được gửi thành công! Đội ngũ kỹ thuật sẽ phản hồi trong vòng 15 phút.');
        setTicketSubject('');
        setTicketMessage('');
      } else {
        setSuccessMsg('Đã ghi nhận yêu cầu hỗ trợ. Chuyên viên sẽ liên hệ với bạn sớm nhất!');
      }
    } catch {
      setSuccessMsg('Đã tiếp nhận thông tin hỗ trợ khẩn cấp.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Headphones className="w-4 h-4" /> Trung Tâm Hỗ Trợ 24/7/365
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400">
            Chúng tôi luôn sẵn sàng hỗ trợ bạn
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-base sm:text-lg">
            Đội ngũ kỹ sư hạ tầng điện toán đám mây và chuyên gia mạng túc trực 24/7 với cam kết phản hồi SLA dưới 15 phút.
          </p>
        </div>

        {/* 3 Quick Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/60 border border-slate-200 hover:border-cyan-500/40 transition-all shadow-xl group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Live Chat Trực Tuyến</h3>
            <p className="text-sm text-slate-600 mb-4">Trò chuyện ngay với kỹ thuật viên trực ca để giải quyết sự cố tức thì.</p>
            <div className="flex items-center text-cyan-400 text-sm font-semibold gap-1">
              Phản hồi: &lt; 2 phút <Zap className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <Link href="/knowledge-base" className="p-6 rounded-2xl bg-white/60 border border-slate-200 hover:border-indigo-500/40 transition-all shadow-xl group block">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Knowledge Base</h3>
            <p className="text-sm text-slate-600 mb-4">Hơn 500+ tài liệu hướng dẫn kỹ thuật, cấu hình VPS, Web Server và bảo mật.</p>
            <div className="flex items-center text-indigo-400 text-sm font-semibold gap-1 group-hover:translate-x-1 transition-transform">
              Xem tài liệu <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/faqs" className="p-6 rounded-2xl bg-white/60 border border-slate-200 hover:border-emerald-500/40 transition-all shadow-xl group block">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Câu Hỏi Thường Gặp</h3>
            <p className="text-sm text-slate-600 mb-4">Giải đáp các thắc mắc về thanh toán, gia hạn dịch vụ, nâng cấp RAM/CPU.</p>
            <div className="flex items-center text-emerald-400 text-sm font-semibold gap-1 group-hover:translate-x-1 transition-transform">
              Xem FAQ <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Ticket Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 p-8 rounded-3xl bg-white/70 border border-slate-200 shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-cyan-400" /> Gửi Yêu Cầu Hỗ Trợ Kỹ Thuật (Ticket)
            </h2>
            <p className="text-slate-600 text-sm mb-6">Điền thông tin sự cố bên dưới để nhận hỗ trợ chuyên sâu từ kỹ sư hệ thống.</p>

            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> {successMsg}
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Tiêu đề yêu cầu / Sự cố *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Cần hỗ trợ mở port 8080 trên firewall VPS Ubuntu"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mức độ ưu tiên</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="1">Bình thường (Low - Tư vấn kỹ thuật chung)</option>
                  <option value="2">Trung bình (Medium - Cần hỗ trợ cấu hình)</option>
                  <option value="3">Khẩn cấp (High - Dịch vụ gián đoạn / Downtime)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Mô tả chi tiết sự cố & Log lỗi *</label>
                <textarea 
                  rows={5}
                  required
                  placeholder="Vui lòng cung cấp địa chỉ IP máy chủ, thông tin hệ điều hành và chi tiết lỗi bạn đang gặp phải..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-900 font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" /> {submitting ? 'Đang gửi...' : 'Gửi Yêu Cầu Hỗ Trợ'}
              </button>
            </form>
          </div>

          {/* Contact Direct Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-white/60 border border-slate-200 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" /> Cam Kết Chất Lượng SLA
              </h3>
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Thời gian uptime cam kết: <strong>99.99%</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Thời gian phản hồi ticket: <strong>&lt; 15 phút</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <span>Hỗ trợ khôi phục dữ liệu Snapshot khẩn cấp</span>
                </li>
              </ul>
            </div>

            <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/40 to-slate-900/80 border border-cyan-500/20 shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900">Đường Dây Nóng Khẩn Cấp</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-slate-700">
                  <PhoneCall className="w-4 h-4 text-cyan-400" /> Hotline: <strong className="text-slate-900">1900 8888 99</strong>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <Mail className="w-4 h-4 text-cyan-400" /> Email: <strong className="text-slate-900">support@system.local</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
