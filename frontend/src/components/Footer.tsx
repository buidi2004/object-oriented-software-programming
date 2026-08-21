'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cloud, ShieldCheck, Heart, Send, CheckCircle2, Loader2, Phone, Mail, MapPin, Facebook, Linkedin, Twitter, Youtube, MessageCircle } from 'lucide-react';
import { api } from '../lib/api';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandInfo, setBrandInfo] = useState({
    name: 'CloudHost VN',
    company: 'Công ty Cổ phần Công nghệ Hạ Tầng Số Việt Nam, trực thuộc Tập đoàn Công nghệ Việt Nam.',
    businessLicense: '0500589150 do Ban Quản lý các Khu công nghệ cao và Khu công nghiệp - UBND thành phố Hà Nội cấp lần đầu ngày 11/04/2008, sửa đổi lần thứ 13 ngày 10/06/2026.',
    contentResponsible: 'Ông Lê Bá Tân.',
    hotline: '1900 6888',
    email: 'support@cloudhost.vn',
  });

  useEffect(() => {
    // Fetch dynamic system settings
    api.get<{ value?: string }>('/system-settings/company_name')
      .then(res => { if (res.data?.value) setBrandInfo(prev => ({ ...prev, company: res.data.value! })); })
      .catch(() => {});

    api.get<{ value?: string }>('/system-settings/business_license')
      .then(res => { if (res.data?.value) setBrandInfo(prev => ({ ...prev, businessLicense: res.data.value! })); })
      .catch(() => {});

    api.get<{ value?: string }>('/system-settings/content_responsible')
      .then(res => { if (res.data?.value) setBrandInfo(prev => ({ ...prev, contentResponsible: res.data.value! })); })
      .catch(() => {});

    api.get<{ value?: string }>('/system-settings/hotline')
      .then(res => { if (res.data?.value) setBrandInfo(prev => ({ ...prev, hotline: res.data.value! })); })
      .catch(() => {});

    api.get<{ value?: string }>('/system-settings/support_email')
      .then(res => { if (res.data?.value) setBrandInfo(prev => ({ ...prev, email: res.data.value! })); })
      .catch(() => {});
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError(null);
    try {
      await api.post('/newsletter/subscribe', { email });
      setSubscribed(true);
      setEmail('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer id="footer" className="bg-white border-t border-slate-200">
      
      {/* 1. Top Section: Newsletter & Connect */}
      <div className="border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <span className="font-bold text-slate-800 text-base sm:text-lg">Kết nối</span>
            <div className="flex gap-2">
              {[
                { id: 'fb', icon: Facebook },
                { id: 'in', icon: Linkedin },
                { id: 'tw', icon: Twitter },
                { id: 'zl', icon: MessageCircle },
                { id: 'tg', icon: Send }
              ].map((item) => (
                <div key={item.id} className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm hover:scale-110 cursor-pointer transition-transform shadow-md">
                  <item.icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full md:w-auto">
            <span className="font-bold text-slate-800 text-base sm:text-lg whitespace-nowrap">Đăng ký nhận tin</span>
            <form onSubmit={handleSubscribe} className="flex w-full md:w-[380px]">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn..."
                className="flex-1 bg-slate-100 border-none rounded-l-xl px-4 py-2.5 text-sm text-slate-800 focus:ring-0 focus:outline-none min-w-0"
                required
              />
              <button 
                type="submit" 
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 sm:px-8 py-2.5 rounded-r-xl font-bold text-sm transition-colors disabled:opacity-50 shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Gửi'}
              </button>
            </form>
          </div>

        </div>
      </div>

      {/* 2. Middle Section: Info & Links */}
      <div className="bg-[#f8f8f8] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Column 1: Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <img 
                  src="/images/logo.png" 
                  alt="Logo" 
                  className="h-10 w-auto object-contain drop-shadow-sm" 
                  style={{ filter: 'grayscale(100%) brightness(0.2) sepia(1) hue-rotate(-50deg) saturate(5)' }} // make it red/black if needed, or just let original
                />
              </div>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                Cơ quan chủ quản: <strong>{brandInfo.company}</strong>
              </p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                Mã số doanh nghiệp: {brandInfo.businessLicense}
              </p>
              <p className="text-[13px] text-slate-700 leading-relaxed">
                Chịu trách nhiệm nội dung: {brandInfo.contentResponsible}
              </p>
              
              <div className="pt-2 text-[14px] text-slate-700">
                <div>Hotline: <strong className="text-red-600">{brandInfo.hotline}</strong></div>
                <div>Email: <a href={`mailto:${brandInfo.email}`} className="text-red-600 hover:underline">{brandInfo.email}</a></div>
              </div>

              <div className="flex gap-2 pt-2">
                {[
                  { id: 'fb', icon: Facebook },
                  { id: 'tw', icon: Twitter },
                  { id: 'in', icon: Linkedin },
                  { id: 'yt', icon: Youtube },
                  { id: 'zl', icon: MessageCircle }
                ].map((item) => (
                  <div key={item.id} className="w-7 h-7 rounded-full bg-black text-slate-900 flex items-center justify-center hover:bg-red-600 cursor-pointer transition-colors">
                    <item.icon className="w-3.5 h-3.5" />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Dịch vụ */}
            <div>
              <h4 className="text-[15px] font-bold text-slate-800 uppercase tracking-wide mb-6">DỊCH VỤ NỔI BẬT</h4>
              <ul className="space-y-3.5 text-[14px] text-slate-600">
                <li><Link href="/services/cloud-vps" className="hover:text-red-600 transition-colors">Máy chủ ảo Cloud VPS</Link></li>
                <li><Link href="/services/hosting" className="hover:text-red-600 transition-colors">NVMe Web Hosting</Link></li>
                <li><Link href="/services/game-servers" className="hover:text-red-600 transition-colors">Game Server Hosting</Link></li>
                <li><Link href="/services/email-hosting" className="hover:text-red-600 transition-colors">Email Doanh Nghiệp</Link></li>
                <li><Link href="/services/domain" className="hover:text-red-600 transition-colors">Đăng Ký Tên Miền</Link></li>
                <li><Link href="/services/ssl-certificates" className="hover:text-red-600 transition-colors">Chứng Chỉ Bảo Mật SSL</Link></li>
                <li><Link href="/services/databases" className="hover:text-red-600 transition-colors">Managed Databases</Link></li>
                <li><Link href="/services/storage" className="hover:text-red-600 transition-colors">Cloud Object Storage S3</Link></li>
              </ul>
            </div>

            {/* Column 3: Giải pháp */}
            <div>
              <h4 className="text-[15px] font-bold text-slate-800 uppercase tracking-wide mb-6">HỆ SINH THÁI</h4>
              <ul className="space-y-3.5 text-[14px] text-slate-600">
                <li><Link href="/services/cdn" className="hover:text-red-600 transition-colors">Cloud CDN Accelerator</Link></li>
                <li><Link href="/services/static-sites" className="hover:text-red-600 transition-colors">Hosting Web Tĩnh (Static)</Link></li>
                <li><Link href="/services/website-builder" className="hover:text-red-600 transition-colors">Kéo thả Website Builder</Link></li>
                <li><Link href="/services/app-installer" className="hover:text-red-600 transition-colors">1-Click App Installer</Link></li>
                <li><Link href="/services/vps-custom" className="hover:text-red-600 transition-colors">Tùy chỉnh cấu hình VPS</Link></li>
                <li><Link href="/services/compare" className="hover:text-red-600 transition-colors">So sánh bảng giá dịch vụ</Link></li>
                <li><Link href="/services" className="hover:text-red-600 transition-colors font-bold text-slate-800">Xem tất cả dịch vụ &rarr;</Link></li>
              </ul>
            </div>

            {/* Column 4: Trợ giúp */}
            <div>
              <h4 className="text-[15px] font-bold text-slate-800 uppercase tracking-wide mb-6">TRỢ GIÚP</h4>
              <ul className="space-y-3.5 text-[14px] text-slate-600">
                <li><Link href="/contact" className="hover:text-red-600 transition-colors">Liên hệ hỗ trợ, khiếu nại</Link></li>
                <li><Link href="/knowledge-base" className="hover:text-red-600 transition-colors">Cơ sở kiến thức (Knowledge Base)</Link></li>
                <li><Link href="/faqs" className="hover:text-red-600 transition-colors">Câu hỏi thường gặp (FAQ)</Link></li>
                <li><Link href="/legal/terms" className="hover:text-red-600 transition-colors">Thỏa thuận sử dụng</Link></li>
                <li><Link href="/support/order-guide" className="hover:text-red-600 transition-colors">Hướng dẫn đăng ký dịch vụ</Link></li>
                <li><Link href="/support/payment-methods" className="hover:text-red-600 transition-colors">Các hình thức thanh toán</Link></li>
                <li><Link href="/support/renewal-guide" className="hover:text-red-600 transition-colors">Hướng dẫn gia hạn dịch vụ</Link></li>
                <li><Link href="/news" className="hover:text-red-600 transition-colors">Chương trình ưu đãi, khuyến mại</Link></li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Bottom Section: Copyright & Badges */}
      <div className="bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row items-center justify-between gap-4 text-center lg:text-left">
          <div className="text-xs sm:text-[13px] text-slate-600">
            &copy; Bản quyền thuộc về: <strong>{brandInfo.company}</strong>
          </div>
          
          <div className="flex items-center justify-center flex-wrap gap-2 pt-2 lg:pt-0">
            {/* Bộ Quốc Phòng */}
            <div className="h-9 px-2 border border-slate-200 rounded flex items-center bg-white shadow-xs">
              <span className="text-red-600 font-bold text-[9px] sm:text-[10px] text-center leading-none">CÔNG TÁC TRỌNG YẾU<br/>BỘ QUỐC PHÒNG</span>
            </div>
            
            {/* Bộ Công Thương đỏ */}
            <div className="h-9 px-2 sm:px-2.5 border-2 border-[#cc0000] rounded-lg flex items-center gap-1.5 bg-white shadow-xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#cc0000]" />
              <div className="flex flex-col items-start leading-[11px]">
                <span className="text-[6px] sm:text-[7px] font-bold text-[#cc0000] tracking-wider uppercase">Đã đăng ký</span>
                <span className="text-[10px] sm:text-[11px] font-black text-[#cc0000] uppercase">Bộ Công Thương</span>
              </div>
            </div>

            {/* Đã thông báo Bộ Công Thương xanh */}
            <div className="h-9 px-2 sm:px-2.5 border-2 border-[#095a9d] rounded-lg flex items-center gap-1.5 bg-white shadow-xs">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#095a9d]" />
              <div className="flex flex-col items-start leading-[11px]">
                <span className="text-[6px] sm:text-[7px] font-bold text-[#095a9d] tracking-wider uppercase">Đã thông báo</span>
                <span className="text-[10px] sm:text-[11px] font-black text-[#095a9d] uppercase">Bộ Công Thương</span>
              </div>
            </div>

            {/* IPv6 */}
            <div className="h-9 w-9 rounded-full border-2 border-[#009e49] flex items-center justify-center bg-white shadow-xs">
              <span className="text-[10px] sm:text-[11px] font-black text-[#009e49]">IPv6</span>
            </div>

            {/* DMCA */}
            <img src="https://images.dmca.com/Badges/dmca_protected_sml_120m.png?ID=default" alt="DMCA" className="h-7 sm:h-8 object-contain" />
          </div>
        </div>
      </div>

    </footer>
  );
};
