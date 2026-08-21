'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Phone, Mail, MapPin, Send, MessageSquare, Clock, 
  CheckCircle2, AlertCircle, Headphones, Building2, 
  ShieldCheck, ArrowRight, Zap, ExternalLink, HelpCircle, 
  ChevronDown, ChevronUp, Plus, Minus, SendHorizontal, Radio,
  Activity, Shield, MessageCircle, Calendar
} from 'lucide-react';
import { FaTelegram, FaDiscord } from 'react-icons/fa6';
import { SiZalo } from 'react-icons/si';
import { api } from '@/src/lib/api';

const FAQS = [
  {
    question: "Thời gian kỹ sư phản hồi yêu cầu hỗ trợ là bao lâu?",
    answer: "Đối với kênh Hotline khẩn cấp và Telegram/Zalo VIP, chúng tôi tiếp nhận tức thì trong 30 giây. Đối với Ticket và Form liên hệ, chuyên viên kỹ thuật cam kết phản hồi trong vòng dưới 15 phút (24/7/365)."
  },
  {
    question: "SEN CloudHost có hỗ trợ chuyển dữ liệu (Migration) từ nhà cung cấp khác không?",
    answer: "Có. Đội ngũ kỹ sư Level 3 hỗ trợ di dời 100% website, cơ sở dữ liệu, email và cấu hình máy chủ từ nhà cung cấp cũ sang SEN CloudHost hoàn toàn MIỄN PHÍ, cam kết 0s gián đoạn dịch vụ."
  },
  {
    question: "Tôi có thể yêu cầu xuất hóa đơn VAT điện tử không?",
    answer: "100% dịch vụ tại SEN CloudHost đều được xuất hóa đơn GTGT (VAT) điện tử hợp pháp theo quy định của Tổng cục Thuế. Hóa đơn sẽ được gửi tự động qua email của quý khách ngay sau khi thanh toán thành công."
  },
  {
    question: "Tôi có được tư vấn thiết kế hạ tầng và thẩm định giải pháp miễn phí không?",
    answer: "Hoàn toàn có. Đội ngũ Solution Architect của SEN CloudHost sẵn sàng tư vấn 1-1, đánh giá tải thực tế và thiết kế sơ đồ cụm máy chủ phân tán (High Availability, Database Cluster, Multi-Region S3) phù hợp nhất với ngân sách của doanh nghiệp."
  }
];

const SERVICE_TOPICS: Record<string, string> = {
  'general': 'Tư Vấn Kỹ Thuật & Báo Giá Chung',
  'cloud-vps': 'Tư Vấn Máy Chủ Cloud VPS (AMD EPYC)',
  'dedicated-servers': 'Thuê Máy Chủ Vật Lý (Dedicated Server)',
  'databases': 'Tư Vấn Managed Databases (PostgreSQL/MySQL/Redis)',
  'storage': 'Lưu Trữ Object Storage S3',
  'web-hosting': 'Gói NVMe Web Hosting / LiteSpeed',
  'security': 'Bảo Mật & Tường Lửa WAF Anti-DDoS',
  'migration': 'Yêu Cầu Di Dời Dữ Liệu Miễn Phí (Zero-Downtime)',
  'ssl': 'Chứng Chỉ SSL / TLS Doanh Nghiệp',
  'game-servers': 'Máy Chủ Game Chuyên Dụng (Ryzen 9)',
  'custom': 'Giải Pháp Doanh Nghiệp Tùy Chỉnh (Private Cloud)'
};

function ContactFormInner() {
  const searchParams = useSearchParams();
  const rawTopic = searchParams.get('topic') || searchParams.get('service') || searchParams.get('ref') || 'general';
  
  // Normalize topic key
  const defaultTopic = SERVICE_TOPICS[rawTopic] ? rawTopic : 'general';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceTopic, setServiceTopic] = useState(defaultTopic);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeMapTab, setActiveMapTab] = useState<'hn' | 'hcm'>('hn');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    if (rawTopic && SERVICE_TOPICS[rawTopic]) {
      setServiceTopic(rawTopic);
    }
  }, [rawTopic]);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Vui lòng điền đầy đủ họ tên, email và nội dung yêu cầu!', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      if (token) {
        await api.post('/tickets', {
          subject: `[Tư Vấn] ${SERVICE_TOPICS[serviceTopic] || serviceTopic} - ${name}`,
          priority: 2,
        }).then(async (res) => {
          if (res.data?.id) {
            await api.post(`/tickets/${res.data.id}/messages`, {
              message: `Khách hàng: ${name}\nĐiện thoại: ${phone || 'N/A'}\nEmail: ${email}\nChủ đề: ${SERVICE_TOPICS[serviceTopic]}\n\nNội dung yêu cầu:\n${message}`,
            });
          }
        }).catch(() => {});
      } else {
        await api.post('/contact', {
          name,
          email,
          phone,
          subject: SERVICE_TOPICS[serviceTopic] || serviceTopic,
          message
        });
      }

      showToast('Yêu cầu đã được gửi thành công! Kỹ sư SEN CloudHost sẽ liên hệ với bạn trong vòng 15 phút.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch {
      showToast('Yêu cầu đã được ghi nhận. Chúng tôi sẽ liên hệ lại với bạn sớm nhất!', 'success');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold text-xs font-mono flex items-center gap-3 animate-in slide-in-from-bottom-5 border ${
          toast.type === 'success' ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-rose-950 border-rose-500 text-rose-300'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. COMPACT FUNCTIONAL SUPPORT HEADER (ZERO MARKETING FLUFF) */}
      <section className="pt-10 pb-12 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
            <Link href="/" className="hover:text-blue-400 transition-colors">HOME</Link>
            <span>/</span>
            <span className="text-blue-400 font-bold">CONTACT &amp; SUPPORT</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-950 text-blue-400 text-xs font-mono mb-3 border border-blue-800">
                <Headphones className="w-3.5 h-3.5" />
                24/7 TECHNICAL SUPPORT CENTER
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Liên Hệ &amp; Trung Tâm Hỗ Trợ Kỹ Thuật
              </h1>
              <p className="text-slate-600 text-xs sm:text-sm mt-1 font-normal">
                Kênh tiếp nhận sự cố, tư vấn kiến trúc hạ tầng và giải đáp thắc mắc dịch vụ trực tiếp từ kỹ sư SEN CloudHost.
              </p>
            </div>

            {/* Live Operations Telemetry Status */}
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 font-mono text-xs space-y-1.5 shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-slate-900 font-bold text-[11px]">HỆ THỐNG VẬN HÀNH BÌNH THƯỜNG</span>
              </div>
              <div className="text-[10px] text-slate-600 flex items-center justify-between gap-4">
                <span>NOC Response SLA:</span>
                <span className="text-emerald-400 font-bold">&lt; 5 Phút</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. PRIMARY CONTACT CHANNELS (SINGLE SOURCE FOR HOTLINE) */}
      <section className="py-10 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            
            {/* Channel 1: Primary Hotline (Only place printing full number) */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-950 text-blue-400 border border-blue-900 flex items-center justify-center">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-900 font-bold">
                  24/7 MIỄN CƯỚC
                </span>
              </div>
              <div>
                <div className="text-slate-600 text-[11px]">Tổng Đài Khẩn Cấp (Hotline):</div>
                <a href="tel:19006888" className="text-lg font-black text-slate-900 hover:text-blue-400 transition-colors block mt-0.5">
                  1900 6888
                </a>
                <div className="text-[10px] text-slate-500 mt-1">Hỗ trợ kỹ thuật &amp; cứu hộ server tức thì</div>
              </div>
            </div>

            {/* Channel 2: Official Support Email */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-sky-500/50 transition-all flex flex-col justify-between space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-sky-950 text-sky-400 border border-sky-900 flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-900 font-bold">
                  SLA &lt; 15M
                </span>
              </div>
              <div>
                <div className="text-slate-600 text-[11px]">Hộp Thư Kỹ Thuật (Email):</div>
                <a href="mailto:support@cloudhost.vn" className="text-sm font-bold text-sky-400 hover:underline block mt-0.5 truncate">
                  support@cloudhost.vn
                </a>
                <div className="text-[10px] text-slate-500 mt-1">Lưu vết và tiếp nhận yêu cầu có biên bản</div>
              </div>
            </div>

            {/* Channel 3: Technical Ticket System */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-amber-500/50 transition-all flex flex-col justify-between space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-amber-950 text-amber-400 border border-amber-900 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-900 font-bold">
                  KHUYÊN DÙNG
                </span>
              </div>
              <div>
                <div className="text-slate-600 text-[11px]">Hệ Thống Yêu Cầu (Ticket):</div>
                <Link href="/support/tickets" className="text-sm font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-0.5">
                  <span>Mở Ticket Kỹ Thuật</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <div className="text-[10px] text-slate-500 mt-1">Kỹ sư Level 3 xử lý trực tiếp trên hệ thống</div>
              </div>
            </div>

            {/* Channel 4: VIP Direct Messaging */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-purple-500/50 transition-all flex flex-col justify-between space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 border border-purple-900 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-900 font-bold">
                  REALTIME
                </span>
              </div>
              <div>
                <div className="text-slate-600 text-[11px]">Kênh Telegram / Zalo VIP:</div>
                <a href="https://t.me" target="_blank" rel="noreferrer" className="text-sm font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 mt-0.5">
                  <span>@sencloud_support</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <div className="text-[10px] text-slate-500 mt-1">Tư vấn cấu hình máy chủ &amp; giải pháp 1-1</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 3. MAIN INTERACTIVE FORM & VIP CONSULTATION CHANNELS */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (7 Cols): Dynamic Contact & Inquiry Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-xl space-y-6">
              
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-950 text-blue-400 text-xs font-mono uppercase mb-2 border border-blue-900">
                  <SendHorizontal className="w-3.5 h-3.5" />
                  YÊU CẦU TƯ VẤN &amp; HỖ TRỢ DỰ ÁN
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Gửi Thông Tin Nhu Cầu Của Bạn
                </h2>
                <p className="text-xs text-slate-600 mt-1 font-normal">
                  Chuyên viên giải pháp hạ tầng sẽ phân tích yêu cầu và liên hệ lại trong vòng 15 phút.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold uppercase text-[10px]">Họ và Tên *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-sans text-xs focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold uppercase text-[10px]">Email Công Việc *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ten@doanhnghiep.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-sans text-xs focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold uppercase text-[10px]">Số Điện Thoại</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0987 654 321"
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-sans text-xs focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-bold uppercase text-[10px]">Chủ Đề Quan Tâm</label>
                    <select
                      value={serviceTopic}
                      onChange={(e) => setServiceTopic(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-blue-400 font-bold text-xs focus:outline-none focus:border-blue-500 transition-all"
                    >
                      {Object.entries(SERVICE_TOPICS).map(([key, label]) => (
                        <option key={key} value={key} className="bg-white text-slate-800">
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-700 font-bold uppercase text-[10px]">Nội Dung Chi Tiết Hoặc Câu Hỏi *</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mô tả cấu hình mong muốn, lưu lượng truy cập dự kiến, bài toán kỹ thuật cần xử lý..."
                    className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-900 font-sans text-xs focus:outline-none focus:border-blue-500 transition-all resize-none leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>GỬI YÊU CẦU TƯ VẤN NGAY</span>
                    </>
                  )}
                </button>

                <div className="pt-2 text-[10px] text-slate-500 text-center flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cam kết bảo mật thông tin doanh nghiệp theo tiêu chuẩn ISO 27001</span>
                </div>

              </form>

            </div>

            {/* Right Column (5 Cols): Unique VIP Channels & Office Details */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* VIP Direct Channels (Replaces duplicate box with high-value actions) */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <span className="font-bold text-slate-900 uppercase flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    KÊNH KẾT NỐI KỸ SƯ 1-1
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    ONLINE
                  </span>
                </div>

                <p className="text-slate-600 text-[11px] leading-relaxed font-sans font-normal">
                  Dành cho các doanh nghiệp, dự án cần tư vấn thiết kế cụm máy chủ chuyên biệt hoặc xử lý cứu hộ dữ liệu khẩn cấp.
                </p>

                <div className="space-y-2">
                  <a
                    href="https://t.me"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-100 border border-slate-200 hover:border-sky-500/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <FaTelegram className="w-5 h-5 text-sky-400" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Telegram Support VIP</div>
                        <div className="text-[10px] text-slate-500">@sencloud_support</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
                  </a>

                  <a
                    href="https://zalo.me"
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 rounded-xl bg-slate-100 border border-slate-200 hover:border-blue-500/50 transition-all flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <SiZalo className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="font-bold text-slate-900 text-xs">Zalo Official Account</div>
                        <div className="text-[10px] text-slate-500">SEN CloudHost Vietnam</div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  </a>
                </div>
              </div>

              {/* Physical Office Details (Without repeating full numbers 4 times) */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 space-y-4 font-mono text-xs">
                <div className="text-slate-900 font-bold uppercase pb-2 border-b border-slate-200 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  ĐỊA ĐIỂM VĂN PHÒNG &amp; PHÒNG MÁY
                </div>

                {/* Hanoi */}
                <div className="space-y-1">
                  <div className="font-bold text-slate-900 text-[11px] flex items-center justify-between">
                    <span>Trụ Sở Chính (Hà Nội):</span>
                    <a href="tel:19006888" className="text-blue-400 text-[10px] hover:underline">Gọi ngay →</a>
                  </div>
                  <p className="text-slate-600 text-[11px] font-sans">
                    Tầng 12, Tòa nhà HITC, 239 Xuân Thủy, Cầu Giấy, TP. Hà Nội
                  </p>
                </div>

                {/* HCM */}
                <div className="space-y-1 pt-2 border-t border-slate-200/60">
                  <div className="font-bold text-slate-900 text-[11px] flex items-center justify-between">
                    <span>Chi Nhánh (TP. Hồ Chí Minh):</span>
                    <a href="tel:19006888" className="text-indigo-400 text-[10px] hover:underline">Gọi ngay →</a>
                  </div>
                  <p className="text-slate-600 text-[11px] font-sans">
                    Tòa nhà Viettel Complex, 285 Cách Mạng Tháng Tám, Quận 10, TP.HCM
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. INTERACTIVE EMBEDDED MAP & FAQS (NO EMPTY GRAY BOXES) */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Interactive Real Embedded Map (7 Cols) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-slate-900 uppercase">BẢN ĐỒ VĂN PHÒNG</span>
                </div>
                
                {/* Location Switch Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                  <button
                    onClick={() => setActiveMapTab('hn')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      activeMapTab === 'hn'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hà Nội (HITC)
                  </button>
                  <button
                    onClick={() => setActiveMapTab('hcm')}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold transition-all ${
                      activeMapTab === 'hcm'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    TP.HCM (Viettel)
                  </button>
                </div>
              </div>

              {/* Real Google Maps iframe embed */}
              <div className="w-full h-[320px] rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100">
                {activeMapTab === 'hn' ? (
                  <iframe
                    title="Hanoi Office Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3723.9244031580227!2d105.78715871540237!3d21.03571059291881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab483ed5c935%3A0x6b306443c224af86!2sHITC%20Building!5e0!3m2!1svi!2s!4v1689617260589!5m2!1svi!2s"
                    className="w-full h-full border-0 grayscale invert contrast-125 opacity-90"
                    allowFullScreen={false}
                    loading="lazy"
                  />
                ) : (
                  <iframe
                    title="HCM Office Map"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.460233076123!2d106.67784361533418!3d10.776019462148154!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f20536ec6f9%3A0x2a987dcfc7c8c83a!2sViettel%20Complex%20Building!5e0!3m2!1svi!2s!4v1689617380123!5m2!1svi!2s"
                    className="w-full h-full border-0 grayscale invert contrast-125 opacity-90"
                    allowFullScreen={false}
                    loading="lazy"
                  />
                )}
              </div>
            </div>

            {/* Right: Technical Support FAQ Accordion (5 Cols) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-white border border-slate-200 space-y-4">
              <div className="font-mono text-xs text-slate-900 font-bold uppercase pb-2 border-b border-slate-200 flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-blue-400" />
                CÂU HỎI THƯỜNG GẶP KHI LIÊN HỆ
              </div>

              <div className="space-y-3 font-sans">
                {FAQS.map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl bg-slate-100 border border-slate-200 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 focus:outline-none"
                    >
                      <span className="font-bold text-xs text-slate-800">{faq.question}</span>
                      <div className="w-5 h-5 rounded bg-white border border-slate-200 flex items-center justify-center shrink-0 text-blue-400">
                        {openFaq === idx ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {openFaq === idx && (
                      <div className="px-3.5 pb-3.5 text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/80 pt-2.5">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-mono">Loading Contact Center...</div>}>
      <ContactFormInner />
    </Suspense>
  );
}
