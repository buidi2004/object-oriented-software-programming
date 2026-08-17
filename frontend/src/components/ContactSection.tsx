'use client';

import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, ChevronDown, Send, MessageSquare, HelpCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

interface FaqItem {
  id?: string;
  question: string;
  answer: string;
}

const FALLBACK_FAQS: FaqItem[] = [
  {
    question: 'Thời gian khởi tạo Cloud VPS mất bao lâu?',
    answer: 'Sau khi thanh toán thành công, hệ thống tự động khởi tạo và gửi thông tin đăng nhập Root qua Email chỉ trong vòng 30 - 60 giây.'
  },
  {
    question: 'CloudHost VN có hỗ trợ chuyển dữ liệu miễn phí từ nhà cung cấp khác không?',
    answer: 'Có, đội ngũ kỹ thuật viên của chúng tôi hỗ trợ chuyển dữ liệu (Website, Database, Cấu hình) hoàn toàn miễn phí và đảm bảo không gián đoạn dịch vụ.'
  },
  {
    question: 'Tôi có thể nâng cấp gói dịch vụ khi nhu cầu tăng lên không?',
    answer: 'Bạn có thể nâng cấp CPU, RAM, Ổ cứng SSD NVMe bất kỳ lúc nào trực tiếp trên bảng điều khiển mà không làm thay đổi địa chỉ IP.'
  },
  {
    question: 'Chính sách hoàn tiền của CloudHost VN như thế nào?',
    answer: 'Chúng tôi cam kết hoàn tiền 100% trong vòng 30 ngày nếu quý khách không hài lòng về chất lượng dịch vụ Cloud VPS và Hosting.'
  }
];

export const ContactSection: React.FC = () => {
  const [faqs, setFaqs] = useState<FaqItem[]>(FALLBACK_FAQS);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [contactInfo, setContactInfo] = useState({
    address: 'Tầng 12, Tòa nhà HITC, 239 Xuân Thủy, Cầu Giấy, Hà Nội',
    hotline: '1900 6888 - (024) 7300 8888',
    email: 'support@cloudhost.vn / sales@cloudhost.vn',
  });

  useEffect(() => {
    // Fetch FAQs from API
    api.get<any[]>('/faqs')
      .then(res => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setFaqs(res.data.map(f => ({
            id: f.id,
            question: f.question || f.q,
            answer: f.answer || f.a,
          })).slice(0, 5));
        }
      })
      .catch(() => {});

    // Fetch system settings if available
    api.get<{ value?: string }>('/system-settings/hotline')
      .then(res => {
        if (res.data?.value) {
          setContactInfo(prev => ({ ...prev, hotline: res.data.value! }));
        }
      })
      .catch(() => {});
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    }, 4000);
  };

  return (
    <section id="contact-section" className="py-20 bg-slate-50/60 border-t border-slate-200/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* FAQ Accordion Subsection */}
        <div>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              Hỏi Đáp Dịch Vụ
            </div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Câu Hỏi Thường Gặp Về Cloud &amp; Hosting
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 font-bold text-slate-900 text-base hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Info & Form */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xl grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Info */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-50 text-cyan-700 text-xs font-bold uppercase tracking-wider mb-3">
                <MessageSquare className="w-3.5 h-3.5" />
                Hỗ Trợ 24/7/365
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                Liên Hệ Tư Vấn Giải Pháp Cloud
              </h3>
              <p className="text-slate-500 text-sm mt-2">
                Đội ngũ chuyên gia CloudHost VN luôn sẵn sàng hỗ trợ bạn khảo sát nhu cầu hạ tầng và báo giá tối ưu nhất.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-50 text-blue-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Trụ sở chính</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {contactInfo.address}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Hotline 24/7</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {contactInfo.hotline}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase">Email Kỹ Thuật</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">
                    {contactInfo.email}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-slate-50/80 p-6 sm:p-8 rounded-2xl border border-slate-200/80">
            {formSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="text-xl font-bold text-slate-900">Gửi Yêu Cầu Thành Công!</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Chuyên viên giải pháp của CloudHost VN sẽ gọi điện tư vấn trực tiếp cho bạn trong vòng 15 phút.
                </p>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <h4 className="text-lg font-bold text-slate-900 mb-2">
                  Gửi Yêu Cầu Báo Giá / Tư Vấn Tùy Chỉnh
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ &amp; Tên</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="0912 345 678"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Doanh Nghiệp</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nhu Cầu Hạ Tầng</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Mô tả cấu hình VPS / Số lượng Website / Yêu cầu chịu tải..."
                    className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Gửi Yêu Cầu Tư Vấn Ngay
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
