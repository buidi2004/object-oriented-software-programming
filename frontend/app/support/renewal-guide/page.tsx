'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, Clock, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

export default function RenewalGuidePage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/support" className="hover:text-blue-600">Trợ giúp</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Hướng dẫn gia hạn dịch vụ</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-slate-900">
            <h1 className="text-3xl font-black mb-2">Hướng Dẫn Gia Hạn Dịch Vụ</h1>
            <p className="text-emerald-100">Đảm bảo dịch vụ của bạn hoạt động liên tục, không bị gián đoạn.</p>
          </div>
          
          <div className="p-8 space-y-12">
            
            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><RefreshCw className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">1. Gia hạn tự động (Auto-Renew)</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Đây là phương thức được khuyến nghị để tránh rủi ro quên gia hạn dẫn đến tạm ngưng dịch vụ. Khi bật tính năng này, hệ thống sẽ tự động trừ tiền từ số dư khả dụng (Wallet) hoặc thẻ tín dụng đã lưu trước ngày hết hạn 3-5 ngày.
              </p>
              <ul className="list-disc list-inside text-sm text-slate-600 space-y-2 ml-2">
                <li>Truy cập vào <strong>Bảng điều khiển (Dashboard)</strong></li>
                <li>Vào mục <strong>Quản lý dịch vụ</strong></li>
                <li>Bật công tắc <strong>Tự động gia hạn</strong> ở dịch vụ tương ứng.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><Clock className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">2. Gia hạn thủ công</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Bạn sẽ nhận được email nhắc nhở gia hạn trước 15 ngày, 7 ngày, 3 ngày và 1 ngày trước khi dịch vụ hết hạn.
              </p>
              <ul className="list-decimal list-inside text-sm text-slate-600 space-y-2 ml-2">
                <li>Đăng nhập vào tài khoản trên website.</li>
                <li>Vào mục <strong>Hóa đơn</strong> hoặc nhấn trực tiếp vào liên kết trong email nhắc nhở.</li>
                <li>Chọn hóa đơn gia hạn chưa thanh toán và tiến hành thanh toán qua VietQR, VNPay hoặc thẻ quốc tế.</li>
                <li>Ngay sau khi thanh toán thành công, dịch vụ sẽ được cộng thêm thời gian sử dụng.</li>
              </ul>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><AlertTriangle className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">3. Lưu ý về việc quá hạn dịch vụ</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Vui lòng thanh toán hóa đơn đúng hạn. Khi dịch vụ quá hạn:
              </p>
              <div className="bg-amber-50 rounded-xl p-5 border border-amber-200">
                <ul className="space-y-2 text-sm text-amber-800 font-medium">
                  <li><strong>Quá hạn 1-3 ngày:</strong> Dịch vụ bị tạm ngưng (Suspended). Dữ liệu vẫn được giữ nguyên.</li>
                  <li><strong>Quá hạn 15 ngày:</strong> Dịch vụ sẽ bị hủy vĩnh viễn (Terminated) và dữ liệu sẽ bị xóa hoàn toàn khỏi hệ thống để giải phóng tài nguyên. Dữ liệu này không thể khôi phục được.</li>
                </ul>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
