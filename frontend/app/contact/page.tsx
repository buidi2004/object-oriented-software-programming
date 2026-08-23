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
          serviceTopic: SERVICE_TOPICS[serviceTopic] || serviceTopic,
          message
        });
      }

      showToast('Yêu cầu của bạn đã được gửi thành công! Chuyên viên sẽ liên hệ trong 15 phút.');
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      console.error(err);
      showToast('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng liên hệ Hotline 1900 6868!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-black selection:text-white">
      
      {/* 1. HERO SECTION - MONOCHROME DARK */}
      <section className="bg-[#121212] text-white py-16 px-4 sm:px-6 lg:px-8 border-b border-zinc-800 relative">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono border border-zinc-700">
            <Headphones className="w-3.5 h-3.5" />
            <span>24/7 TECHNICAL SUPPORT &amp; ENTERPRISE CONSULTING</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Liên Hệ &amp; Tư Vấn Giải Pháp Đám Mây
          </h1>

          <p className="text-zinc-400 text-xs sm:text-sm max-w-2xl mx-auto font-normal leading-relaxed">
            Đội ngũ chuyên gia và kỹ sư Level 3 của SEN CloudHost sẵn sàng lắng nghe, tư vấn kiến trúc hạ tầng và đồng hành cùng sự phát triển của bạn.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href="tel:19006868"
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition-all shadow-md flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              <span>Hotline: 1900 6868 (24/7)</span>
            </a>
            <a
              href="https://t.me/cloudhost_vn"
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 font-bold text-xs transition-all flex items-center gap-2"
            >
              <FaTelegram className="w-4 h-4" />
              <span>Telegram Hỗ Trợ Nhanh</span>
            </a>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* 2. DIRECT CHANNELS GRID - MONOCHROME */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-black transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-mono">TỔNG ĐÀI 24/7</div>
              <a href="tel:19006868" className="text-base font-black text-black hover:underline">1900 6868</a>
              <p className="text-[11px] text-zinc-500 mt-1">Hỗ trợ sự cố khẩn cấp máy chủ</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-black transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-mono">EMAIL KỸ THUẬT</div>
              <a href="mailto:support@cloudhost.vn" className="text-sm font-black text-black hover:underline truncate block">support@cloudhost.vn</a>
              <p className="text-[11px] text-zinc-500 mt-1">Phản hồi cam kết &lt; 15 phút</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-black transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold">
              <FaTelegram className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-mono">TELEGRAM VIP</div>
              <a href="https://t.me/cloudhost_vn" target="_blank" rel="noreferrer" className="text-sm font-black text-black hover:underline">@cloudhost_vn</a>
              <p className="text-[11px] text-zinc-500 mt-1">Kỹ sư trực tiếp 24/7</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-2xs hover:border-black transition-all space-y-3">
            <div className="w-10 h-10 rounded-xl bg-zinc-100 text-black flex items-center justify-center font-bold">
              <SiZalo className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-zinc-500 font-mono">ZALO OFFICIAL</div>
              <a href="https://zalo.me/0912345678" target="_blank" rel="noreferrer" className="text-sm font-black text-black hover:underline">SEN CloudHost OA</a>
              <p className="text-[11px] text-zinc-500 mt-1">Tư vấn kinh doanh &amp; hóa đơn</p>
            </div>
          </div>

        </div>

        {/* 3. MAIN FORM & SIDEBAR INFO */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Contact Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="border-b border-zinc-100 pb-4">
              <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">FORM YÊU CẦU</span>
              <h2 className="text-2xl font-black text-black mt-1">Gửi Yêu Cầu Tư Vấn Cho Kỹ Sư</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Điền thông tin của bạn bên dưới, hệ thống sẽ tự động chuyển tiếp tới đúng kỹ sư chuyên trách.
              </p>
            </div>

            {toast && (
              <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
                toast.type === 'success'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-black border border-zinc-300'
              }`}>
                {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-white shrink-0" /> : <AlertCircle className="w-4 h-4 text-black shrink-0" />}
                <span>{toast.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Chủ Đề Cần Tư Vấn *</label>
                <select
                  value={serviceTopic}
                  onChange={(e) => setServiceTopic(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                >
                  {Object.entries(SERVICE_TOPICS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Họ Và Tên Của Bạn *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn Hùng"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-zinc-700 mb-1">Số Điện Thoại / Zalo *</label>
                  <input
                    type="tel"
                    placeholder="0988 888 999"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Địa Chỉ Email Nhận Phản Hồi *</label>
                <input
                  type="email"
                  required
                  placeholder="your.email@company.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">Nội Dung Yêu Cầu Hoặc Mô Tả Bài Toán Của Bạn *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mô tả số lượng máy chủ, cấu hình CPU/RAM mong muốn, lượng traffic hàng ngày hoặc các vấn đề kỹ thuật đang gặp phải..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-black focus:outline-none focus:ring-1 focus:ring-black focus:border-black leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="text-[11px] text-zinc-400">
                  Cam kết bảo mật thông tin &bull; Phản hồi &lt; 15 phút
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 rounded-xl bg-black hover:bg-zinc-800 text-white font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Gửi Yêu Cầu Ngay</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right: Office Locations & SLA Commitments */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* SLA Commitments */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
              <h3 className="text-base font-black text-black flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-black" />
                <span>Cam Kết Chất Lượng Dịch Vụ (SLA)</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <Clock className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-black">Tiếp Nhận Khẩn Cấp Trong 30s</div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Hotline 1900 6868 và Telegram phản hồi trực tiếp 24/7/365.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <Zap className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-black">Phản Hồi Ticket &lt; 15 Phút</div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Kỹ sư Level 3 trực tiếp kiểm tra và phân tích log hệ thống.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                  <Activity className="w-4 h-4 text-black shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-black">Cam Kết 99.99% Uptime Mạng</div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">Hạ tầng Tier III tiêu chuẩn quốc tế tại Viettel &amp; VNPT IDC.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Office Locations Map Tab */}
            <div className="bg-white rounded-3xl border border-zinc-200 p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-black flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-black" />
                  <span>Văn Phòng Làm Việc</span>
                </h3>

                <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveMapTab('hn')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      activeMapTab === 'hn' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    Hà Nội
                  </button>
                  <button
                    onClick={() => setActiveMapTab('hcm')}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      activeMapTab === 'hcm' ? 'bg-black text-white shadow-xs' : 'text-zinc-600 hover:text-black'
                    }`}
                  >
                    TP.HCM
                  </button>
                </div>
              </div>

              {activeMapTab === 'hn' ? (
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2 text-zinc-700">
                    <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-black">Trụ Sở Chính - Hà Nội:</div>
                      <p className="text-zinc-500 mt-0.5">Tầng 18, Tòa nhà Keangnam Landmark 72, Đường Phạm Hùng, Q. Nam Từ Liêm, Hà Nội.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Giờ làm việc: 08:00 - 18:00 (Thứ 2 - Thứ 7)</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div className="flex items-start gap-2 text-zinc-700">
                    <MapPin className="w-4 h-4 text-black shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-black">Chi Nhánh - TP. Hồ Chí Minh:</div>
                      <p className="text-zinc-500 mt-0.5">Tầng 12, Tòa nhà Bitexco Financial Tower, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM.</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-500 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Giờ làm việc: 08:00 - 18:00 (Thứ 2 - Thứ 7)</span>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

        {/* 4. FREQUENTLY ASKED QUESTIONS */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-6 sm:p-10 shadow-2xs space-y-6">
          <div className="border-b border-zinc-100 pb-4">
            <span className="text-[11px] font-mono font-bold text-zinc-500 uppercase tracking-wider">HỎI ĐÁP NHANH</span>
            <h2 className="text-2xl font-black text-black mt-1">Câu Hỏi Thường Gặp Khi Liên Hệ</h2>
          </div>

          <div className="divide-y divide-zinc-100">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={index} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left gap-4 font-bold text-sm text-black hover:text-zinc-600 transition-colors cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <span className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs text-zinc-600 leading-relaxed font-normal animate-in fade-in">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ContactFormInner />
    </Suspense>
  );
}
