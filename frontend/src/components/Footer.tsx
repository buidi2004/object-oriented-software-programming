'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Cloud, ShieldCheck, Heart, Send, CheckCircle2, Loader2, Phone, Mail, MapPin } from 'lucide-react';
import { api } from '../lib/api';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brandInfo, setBrandInfo] = useState({
    name: 'CloudHost VN',
    company: 'Công ty Cổ phần Công nghệ Hạ Tầng Số Việt Nam',
    hotline: '1900 6888',
    email: 'support@cloudhost.vn',
  });

  useEffect(() => {
    // Fetch dynamic system settings
    api.get<{ value?: string }>('/system-settings/site_name')
      .then(res => {
        if (res.data?.value) setBrandInfo(prev => ({ ...prev, name: res.data.value! }));
      })
      .catch(() => {});

    api.get<{ value?: string }>('/system-settings/hotline')
      .then(res => {
        if (res.data?.value) setBrandInfo(prev => ({ ...prev, hotline: res.data.value! }));
      })
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
    <footer id="footer" className="bg-slate-950 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Newsletter Section */}
        <div className="bg-slate-900 rounded-2xl p-8 mb-12 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-white mb-2">Đăng ký nhận bản tin</h3>
            <p className="text-sm text-slate-400">Nhận thông báo về các chương trình khuyến mãi, cập nhật dịch vụ và tin tức công nghệ mới nhất từ {brandInfo.name}.</p>
          </div>
          <div className="w-full md:w-auto flex-1 max-w-md">
            {!subscribed ? (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                  {error && <p className="text-red-500 text-xs mt-1 absolute">{error}</p>}
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Đăng ký</span><Send className="w-4 h-4" /></>}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-950/50 border border-emerald-900 rounded-xl p-4 flex items-center gap-3 text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Cảm ơn bạn đã đăng ký! Chúng tôi sẽ gửi thông tin cập nhật sớm nhất.</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                {brandInfo.name}
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {brandInfo.name} là thương hiệu thuộc {brandInfo.company}. Nhà cung cấp dịch vụ Cloud VPS, NVMe Hosting, Dedicated Server và Tên miền hàng đầu Việt Nam.
            </p>
            <div className="text-[11px] text-slate-500 space-y-1">
              <p>Hotline 24/7: <strong className="text-slate-300">{brandInfo.hotline}</strong> | Email: <strong className="text-slate-300">{brandInfo.email}</strong></p>
              <p>Mã số doanh nghiệp: 0108928129 - Đăng ký lần đầu ngày 15/03/2018.</p>
            </div>
          </div>

          {/* Dịch vụ Cloud */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Hạ Tầng Cloud</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link href="/services/cloud-vps" className="hover:text-cyan-400 transition-colors">Cloud VPS NVMe</Link></li>
              <li><Link href="/services/databases" className="hover:text-cyan-400 transition-colors">Managed Databases</Link></li>
              <li><Link href="/services/cdn" className="hover:text-cyan-400 transition-colors">Cloud CDN Accelerator</Link></li>
              <li><Link href="/services/storage" className="hover:text-cyan-400 transition-colors">Object Storage S3</Link></li>
              <li><Link href="/services/game-servers" className="hover:text-cyan-400 transition-colors">Game Server Hosting</Link></li>
              <li><Link href="/services" className="hover:text-cyan-400 transition-colors font-bold text-slate-300">Tất Cả Dịch Vụ →</Link></li>
            </ul>
          </div>

          {/* Hỗ trợ & Khách hàng */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Hỗ Trợ &amp; Tin Tức</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><Link href="/knowledge-base" className="hover:text-cyan-400 transition-colors">Knowledge Base</Link></li>
              <li><Link href="/faqs" className="hover:text-cyan-400 transition-colors">Câu Hỏi FAQ</Link></li>
              <li><Link href="/news" className="hover:text-cyan-400 transition-colors">Blog &amp; Tin Tức</Link></li>
              <li><Link href="/testimonials" className="hover:text-cyan-400 transition-colors">Đánh Giá Khách Hàng</Link></li>
              <li><Link href="/dashboard/uptime" className="hover:text-cyan-400 transition-colors">Trạng Thái Uptime SLA</Link></li>
            </ul>
          </div>

          {/* Thanh toán & Chứng nhận */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Thanh Toán</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-400 text-xs">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300">
                VNPAY QR
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300">
                MoMo Wallet
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300">
                VietQR 247
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300">
                Visa / Master
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            &copy; 2026 {brandInfo.name}. Tất cả quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-1">
            <span>Thiết kế &amp; Hạ tầng Datacenter Tier III tại Việt Nam</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
