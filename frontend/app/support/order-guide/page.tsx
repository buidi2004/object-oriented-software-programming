'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, UserCheck, ShieldCheck, ChevronRight } from 'lucide-react';

export default function OrderGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-[#1F1F1F]">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/support" className="hover:text-[#1F1F1F]">Trợ giúp</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Hướng dẫn đăng ký dịch vụ</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8 text-slate-900">
            <h1 className="text-3xl font-black mb-2">Hướng Dẫn Đăng Ký & Khởi Tạo Dịch Vụ</h1>
            <p className="text-slate-200">Khởi tạo nhanh chóng, sẵn sàng sử dụng chỉ sau vài cú click chuột.</p>
          </div>
          
          <div className="p-8 space-y-12">
            
            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-indigo-100 rounded-lg text-[#1F1F1F]"><ShoppingCart className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">1. Lựa chọn và Đặt hàng</h2>
              </div>
              <ul className="list-decimal list-inside text-sm text-slate-600 space-y-3 ml-2">
                <li>Truy cập trang dịch vụ tương ứng (VD: Cloud VPS, Hosting...).</li>
                <li>Sử dụng công cụ kéo thả để tùy chỉnh cấu hình (CPU, RAM, Ổ cứng, Hệ điều hành...) hoặc chọn trực tiếp gói cước đã cấu hình sẵn.</li>
                <li>Chọn chu kỳ thanh toán (Gia hạn hàng tháng hoặc hàng năm để hưởng ưu đãi giảm giá).</li>
                <li>Nhấn nút <strong>Đăng ký ngay</strong> hoặc <strong>Thêm vào giỏ hàng</strong>.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-pink-100 rounded-lg text-pink-600"><UserCheck className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">2. Thanh toán và Xác thực</h2>
              </div>
              <ul className="list-decimal list-inside text-sm text-slate-600 space-y-3 ml-2">
                <li>Tại giỏ hàng, bạn kiểm tra lại chi tiết đơn hàng.</li>
                <li>Đăng nhập vào hệ thống hoặc tạo tài khoản mới nếu chưa có.</li>
                <li>Tiến hành thanh toán hóa đơn. Nếu bạn thanh toán qua mã VietQR hoặc VNPay, hệ thống sẽ xác thực thanh toán tức thì (thường dưới 30 giây).</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><ShieldCheck className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">3. Khởi tạo dịch vụ tự động</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Sau khi thanh toán thành công, tiến trình khởi tạo dịch vụ sẽ tự động chạy nền.
              </p>
              <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-200">
                <ul className="space-y-2 text-sm text-emerald-800 font-medium">
                  <li><strong>Đối với Web Hosting, Domain:</strong> Khởi tạo ngay lập tức trong vài giây. Thông tin tài khoản quản trị (cPanel/DirectAdmin) sẽ được gửi qua email.</li>
                  <li><strong>Đối với Cloud VPS, Server:</strong> Hệ thống tự động cài đặt hệ điều hành. Quá trình này mất từ 30 giây đến 3 phút. Mật khẩu Root sẽ được cấp qua màn hình quản trị và gửi vào email của bạn.</li>
                </ul>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
