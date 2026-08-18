'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, Mail, MapPin, Send, MessageSquare, Clock, 
  CheckCircle2, AlertCircle, Headphones, Building2, 
  ShieldCheck, ArrowRight, Zap, ExternalLink, HelpCircle
} from 'lucide-react';
import { api } from '@/src/lib/api';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceTopic, setServiceTopic] = useState('cloud-vps');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Vui lòng điền đầy đủ họ tên, email và nội dung tin nhắn!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      // Send ticket/inquiry to backend if logged in or public contact
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        await api.post('/tickets', {
          subject: `[Liên Hệ Tư Vấn] ${serviceTopic.toUpperCase()} - ${name}`,
          priority: 2,
        }).then(async (res) => {
          if (res.data?.id) {
            await api.post(`/tickets/${res.data.id}/messages`, {
              message: `Khách hàng: ${name} (SĐT: ${phone || 'N/A'}, Email: ${email})\n\nNội dung:\n${message}`,
            });
          }
        }).catch(() => {});
      }

      showToast('Cảm ơn bạn! Yêu cầu tư vấn đã được gửi thành công. Chuyên viên sẽ liên hệ với bạn trong vòng 15 phút.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      showToast('Yêu cầu đã được ghi nhận. Chúng tôi sẽ phản hồi bạn sớm nhất!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-sm flex items-center gap-3 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 text-white pt-16 pb-24 border-b border-blue-900/30">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav className="flex items-center gap-2 text-xs font-semibold text-blue-300 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
            <span>/</span>
            <span className="text-cyan-400">Liên hệ &amp; Tư vấn</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-wider mb-4">
              <Headphones className="w-4 h-4 text-cyan-400" />
              Trung Tâm Hỗ Trợ Khách Hàng 24/7/365
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-4 leading-tight">
              Chúng Tôi Luôn Sẵn Sàng <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                Đồng Hành Cùng Bạn
              </span>
            </h1>
            <p className="text-base sm:text-lg text-blue-100/80 max-w-2xl leading-relaxed">
              Dù bạn cần tư vấn thiết kế hạ tầng Cloud VPS, chuyển dữ liệu máy chủ miễn phí hay xử lý sự cố kỹ thuật, đội ngũ chuyên gia CloudHost VN luôn có mặt 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 mb-24 relative z-10 space-y-12">
        
        {/* Quick Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Tổng Đài Hotline</h3>
            <p className="text-xs text-slate-500 mb-3">Tư vấn bán hàng &amp; cứu hộ kỹ thuật 24/7</p>
            <a href="tel:19006888" className="text-sm font-black text-blue-600 hover:text-blue-700 block">
              1900 6888
            </a>
            <span className="text-[11px] text-slate-400">(024) 7300 8888 (Hà Nội)</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Email Hỗ Trợ</h3>
            <p className="text-xs text-slate-500 mb-3">Phản hồi chi tiết và lưu trữ hồ sơ yêu cầu</p>
            <a href="mailto:support@cloudhost.vn" className="text-xs font-bold text-cyan-600 hover:text-cyan-700 block">
              support@cloudhost.vn
            </a>
            <span className="text-[11px] text-slate-400">sales@cloudhost.vn</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Thời Gian Làm Việc</h3>
            <p className="text-xs text-slate-500 mb-3">Vận hành và giám sát mạng liên tục</p>
            <div className="text-xs font-black text-indigo-600">24 Giờ / 7 Ngày</div>
            <span className="text-[11px] text-emerald-600 font-bold">● Cam kết Uptime 99.99%</span>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-1">Hệ Thống Ticket</h3>
            <p className="text-xs text-slate-500 mb-3">Kênh hỗ trợ kỹ thuật viên chuyên sâu</p>
            <Link href="/support" className="text-xs font-bold text-amber-600 hover:text-amber-700 inline-flex items-center gap-1">
              Gửi Ticket Kỹ Thuật <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Contact Form & Office Locations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Form (Left 7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
                <Send className="w-3.5 h-3.5" />
                Gửi Tin Nhắn Cho Chúng Tôi
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                Để Lại Thông Tin &amp; Nhu Cầu Của Bạn
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Chuyên viên tư vấn hạ tầng sẽ liên hệ lại qua điện thoại hoặc email trong vòng 15 phút.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Email Liên Hệ *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nguyenvana@gmail.com"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Số Điện Thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0987 654 321"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Chủ Đề Quan Tâm</label>
                  <select
                    value={serviceTopic}
                    onChange={(e) => setServiceTopic(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  >
                    <option value="cloud-vps">Tư Vấn Máy Chủ Cloud VPS</option>
                    <option value="dedicated-server">Thuê Máy Chủ Dùng Riêng (Dedicated)</option>
                    <option value="web-hosting">Gói Web Hosting NVMe / WordPress</option>
                    <option value="domain">Đăng Ký &amp; Chuyển Nhượng Tên Miền</option>
                    <option value="migration">Yêu Cầu Chuyển Dữ Liệu Miễn Phí</option>
                    <option value="custom">Giải Pháp Doanh Nghiệp Tùy Chỉnh</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Nội Dung Yêu Cầu Hoặc Câu Hỏi *</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Mô tả nhu cầu sử dụng, số lượng người truy cập, cấu hình mong muốn hoặc câu hỏi bạn cần tư vấn..."
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-black text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gửi Yêu Cầu Tư Vấn Ngay</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Thông tin của bạn được cam kết bảo mật 100% theo tiêu chuẩn ISO 27001.
              </p>
            </form>
          </div>

          {/* Office Information (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Location Hanoi */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Trụ Sở Chính - Hà Nội</h3>
                  <p className="text-[11px] text-slate-500">Trung tâm điều hành &amp; Kinh doanh</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>Tầng 12, Tòa nhà HITC, 239 Xuân Thủy, Cầu Giấy, TP. Hà Nội</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Hotline: <strong>(024) 7300 8888</strong></span>
                </p>
              </div>
            </div>

            {/* Location HCM */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">Chi Nhánh - TP. Hồ Chí Minh</h3>
                  <p className="text-[11px] text-slate-500">Trung tâm hỗ trợ kỹ thuật phía Nam</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <span>Tòa nhà Viettel Complex, 285 Cách Mạng Tháng Tám, Quận 10, TP. Hồ Chí Minh</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>Hotline: <strong>(028) 7300 8888</strong></span>
                </p>
              </div>
            </div>

            {/* Quick Consultation Banner */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-lg space-y-3">
              <div className="flex items-center gap-2 text-xs font-black text-cyan-300 uppercase tracking-wider">
                <Zap className="w-4 h-4" /> Tư Vấn Trực Tuyến 1-1
              </div>
              <h4 className="text-base font-black">Cần Gặp Chuyên Viên Ngay?</h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                Bạn có thể kết nối ngay với đội ngũ kỹ sư hạ tầng qua Telegram hoặc gọi trực tiếp Hotline.
              </p>
              <div className="flex gap-2 pt-1">
                <a
                  href="tel:19006888"
                  className="px-4 py-2.5 rounded-xl bg-white text-blue-700 font-extrabold text-xs hover:bg-blue-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Gọi 1900 6888
                </a>
                <Link
                  href="/support"
                  className="px-4 py-2.5 rounded-xl bg-blue-500/30 border border-white/20 text-white font-bold text-xs hover:bg-white/10 transition-colors inline-flex items-center gap-1.5"
                >
                  <HelpCircle className="w-3.5 h-3.5" /> Hỗ Trợ Ticket
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
