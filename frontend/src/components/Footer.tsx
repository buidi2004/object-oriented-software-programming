'use client';

import React from 'react';
import { Cloud, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="footer" className="bg-slate-950 text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-blue-600 to-indigo-600 flex items-center justify-center text-white">
                <Cloud className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                CloudHost<span className="text-blue-500"> VN</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              CloudHost VN là thương hiệu thuộc Công ty Cổ phần Công nghệ Hạ Tầng Số Việt Nam. Nhà cung cấp dịch vụ Cloud VPS, NVMe Hosting, Dedicated Server và Tên miền hàng đầu.
            </p>
            <div className="text-[11px] text-slate-500 space-y-1">
              <p>Giấy phép Bưu chính Viễn thông số: 128/GP-BTTTT do Bộ TTTT cấp.</p>
              <p>Mã số doanh nghiệp: 0108928129 - Đăng ký lần đầu ngày 15/03/2018.</p>
            </div>
          </div>

          {/* Dịch vụ Cloud */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Dịch Vụ Cloud</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="/services/cloud-vps" className="hover:text-cyan-400 transition-colors">Cloud VPS Enterprise</a></li>
              <li><a href="/services/cloud-vps" className="hover:text-cyan-400 transition-colors">Cloud Server AMD EPYC</a></li>
              <li><a href="/services/hosting" className="hover:text-cyan-400 transition-colors">NVMe Hosting WordPress</a></li>
              <li><a href="/services/hosting" className="hover:text-cyan-400 transition-colors">Business Hosting PRO</a></li>
              <li><a href="/services/domain" className="hover:text-cyan-400 transition-colors">Đăng Ký Tên Miền .VN</a></li>
              <li><a href="/services" className="hover:text-cyan-400 transition-colors font-bold text-slate-300">Xem Tất Cả Dịch Vụ →</a></li>
            </ul>
          </div>

          {/* Hỗ trợ & Khách hàng */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Hỗ Trợ Khách Hàng</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-medium">
              <li><a href="#contact-section" className="hover:text-cyan-400 transition-colors">Trung Tâm Hướng Dẫn</a></li>
              <li><a href="#contact-section" className="hover:text-cyan-400 transition-colors">Gửi Ticket Kỹ Thuật</a></li>
              <li><a href="#contact-section" className="hover:text-cyan-400 transition-colors">Kiểm Tra Uptime SLA 99.9%</a></li>
              <li><a href="#contact-section" className="hover:text-cyan-400 transition-colors">Quy Định Sử Dụng</a></li>
              <li><a href="#contact-section" className="hover:text-cyan-400 transition-colors">Chính Sách Bảo Mật</a></li>
            </ul>
          </div>

          {/* Thanh toán & Chứng nhận */}
          <div>
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider mb-4">Thanh Toán An Toàn</h4>
            <div className="grid grid-cols-2 gap-2 text-slate-400 text-xs">
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300">
                VNPAY QR
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300">
                MoMo Wallet
              </div>
              <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-center font-bold text-slate-300">
                ATM Nội Địa
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
            &copy; 2026 CloudHost VN. Tất cả quyền được bảo lưu.
          </div>
          <div className="flex items-center gap-1">
            <span>Thiết kế & Hạ tầng chuẩn Tier III tại Việt Nam</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
