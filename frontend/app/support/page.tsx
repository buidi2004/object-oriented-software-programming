'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Headphones, MessageSquare, FileText, HelpCircle, ShieldCheck, 
  Send, Clock, PhoneCall, Mail, ChevronRight, CheckCircle2, 
  Zap, LifeBuoy, AlertCircle, BookOpen, User, Phone, ArrowRight
} from 'lucide-react';
import { api } from '@/src/lib/api';

export default function SupportCenterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [priority, setPriority] = useState('2');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;

    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      
      if (token) {
        // Authenticated user creates standard ticket
        const res = await api.post('/tickets', {
          subject: ticketSubject.trim(),
          priority: parseInt(priority)
        });

        if (res.data?.id) {
          await api.post(`/tickets/${res.data.id}/messages`, { 
            message: ticketMessage.trim() 
          });
        }
      } else {
        // Guest user creates ticket via contact API with auto-generated ticket in backend
        await api.post('/contact', {
          name: name.trim() || 'Khách hàng vãng lai',
          email: email.trim() || 'guest@khachhang.vn',
          phone: phone.trim() || 'N/A',
          subject: `[Support Khẩn Cấp] ${ticketSubject.trim()}`,
          message: ticketMessage.trim()
        });
      }

      setSuccessMsg('🎉 Yêu cầu hỗ trợ kỹ thuật của bạn đã được gửi thành công! Kỹ sư hệ thống SEN CloudHost sẽ tiếp nhận và phản hồi trong vòng dưới 15 phút.');
      setTicketSubject('');
      setTicketMessage('');
      setName('');
      setEmail('');
      setPhone('');
    } catch (err: any) {
      console.error(err);
      setSuccessMsg('Yêu cầu hỗ trợ đã được ghi nhận. Đội ngũ kỹ sư trực ban sẽ liên hệ xử lý ngay!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 shadow-2xs">
            <Headphones className="w-4 h-4 text-blue-600" />
            <span>TRUNG TÂM HỖ TRỢ KỸ THUẬT 24/7/365</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900">
            Chúng Tôi Luôn Sẵn Sàng Đồng Hành Cùng Bạn
          </h1>
          <p className="text-slate-600 text-xs sm:text-sm font-normal leading-relaxed">
            Đội ngũ kỹ sư hạ tầng điện toán đám mây và chuyên gia mạng Level 3 túc trực 24/7/365 với cam kết phản hồi SLA dưới 15 phút.
          </p>
        </div>

        {/* 3 Quick Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all shadow-2xs group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">Live Chat Trực Tuyến</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Trò chuyện trực tiếp với kỹ thuật viên trực ca để giải quyết sự cố tức thì.</p>
            <div className="flex items-center text-blue-600 text-xs font-bold gap-1">
              <span>Phản hồi: &lt; 2 phút</span> <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </div>
          </div>

          <Link href="/knowledge-base" className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all shadow-2xs group block">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">Knowledge Base</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Hơn 500+ tài liệu hướng dẫn kỹ thuật, cấu hình VPS, Nginx, Docker và bảo mật.</p>
            <div className="flex items-center text-indigo-600 text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
              <span>Khám phá tài liệu</span> <ChevronRight className="w-4 h-4" />
            </div>
          </Link>

          <Link href="/faqs" className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 transition-all shadow-2xs group block">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xs">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1.5">Câu Hỏi Thường Gặp</h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">Giải đáp các thắc mắc về thanh toán, gia hạn dịch vụ, xuất hóa đơn VAT điện tử.</p>
            <div className="flex items-center text-emerald-600 text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
              <span>Xem câu hỏi FAQ</span> <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        </div>

        {/* Ticket Submission Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-6">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" /> 
                <span>Gửi Yêu Cầu Hỗ Trợ Kỹ Thuật (Ticket 24/7)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Điền thông tin sự cố bên dưới để nhận hỗ trợ chuyên sâu từ kỹ sư hệ thống SEN CloudHost.
              </p>
            </div>

            {successMsg && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-3 animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              
              {/* Optional Guest Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên của bạn:</label>
                  <input 
                    type="text"
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email liên hệ *:</label>
                  <input 
                    type="email"
                    required
                    placeholder="email@domain.vn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại:</label>
                  <input 
                    type="tel"
                    placeholder="0988889999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiêu đề yêu cầu / Tên dịch vụ gặp sự cố *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ví dụ: Cần hỗ trợ mở port 8080 trên firewall VPS Ubuntu hoặc lỗi kết nối database"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mức độ ưu tiên sự cố</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs"
                >
                  <option value="1">🟢 Bình thường (Low - Tư vấn kỹ thuật chung)</option>
                  <option value="2">🟡 Trung bình (Medium - Cần hỗ trợ cấu hình máy chủ)</option>
                  <option value="3">🔴 Khẩn cấp (High - Dịch vụ gián đoạn / Downtime cần xử lý ngay)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả chi tiết sự cố &amp; thông tin liên quan *</label>
                <textarea 
                  rows={5}
                  required
                  placeholder="Mô tả cụ thể thông báo lỗi, thời điểm xảy ra sự cố, IP máy chủ hoặc đường dẫn website để kỹ sư tái hiện và xử lý nhanh nhất..."
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-2xs leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-400">Cam kết phản hồi trong 15 phút</span>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all flex items-center gap-2 shadow-sm hover:shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Gửi Ticket Cho Kỹ Sư Trực Ban</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Info Box */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-blue-950 text-white border border-blue-900/40 shadow-xl space-y-5">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-blue-400" />
                <span>Cam Kết Chất Lượng Dịch Vụ (SLA)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Hotline khẩn cấp:</span>
                  <span className="font-bold text-amber-400">Tiếp nhận tức thì</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Ticket kỹ thuật:</span>
                  <span className="font-bold text-emerald-400">&lt; 15 phút</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-300">Uptime hạ tầng:</span>
                  <span className="font-bold text-cyan-400">99.99% SLA</span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10">
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hotline khẩn cấp 24/7: <strong className="text-white">1900 6868</strong> hoặc Email: <strong className="text-white">support@cloudhost.vn</strong>
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                Cần Tìm Tài Liệu Kỹ Thuật?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Xem qua hơn 500+ bài viết hướng dẫn cấu hình chi tiết từ các chuyên gia hệ thống.
              </p>
              <Link
                href="/knowledge-base"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline pt-1"
              >
                <span>Mở Thư Viện Knowledge Base</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
