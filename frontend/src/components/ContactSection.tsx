'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, ChevronDown, Send, MessageSquare, HelpCircle, CheckCircle2 } from 'lucide-react';
import { FAQS } from '../data/mockData';

export const ContactSection: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');

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
              Câu Hỏi Thường Gặp Về Cloud & Hosting
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 font-bold text-slate-900 text-base hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${openFaq === idx ? 'rotate-180 text-blue-600' : ''}`} />
                </button>

                {openFaq === idx && (
                  <div className="px-5 pb-5 text-sm text-slate-600 font-medium leading-relaxed border-t border-slate-100 pt-3 animate-in fade-in duration-200">
                    {faq.a}
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
                    Tầng 12, Tòa nhà HITC, 239 Xuân Thủy, Cầu Giấy, Hà Nội
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
                    1900 6888 - (024) 7300 8888
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
                    support@cloudhost.vn / sales@cloudhost.vn
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Họ tên:</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Số điện thoại:</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0988 123 456"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email liên hệ:</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@company.vn"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nội dung tư vấn:</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Mô tả nhu cầu máy chủ, số lượng người dùng đồng thời, hệ thống dự kiến triển khai..."
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Yêu Cầu Tư Vấn</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};
