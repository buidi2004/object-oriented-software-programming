'use client';

import React from 'react';
import Link from 'next/link';
import { CreditCard, QrCode, Building, Wallet, ChevronRight } from 'lucide-react';

export default function PaymentMethodsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/support" className="hover:text-blue-600">Trợ giúp</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Các hình thức thanh toán</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
            <h1 className="text-3xl font-black mb-2">Các Hình Thức Thanh Toán</h1>
            <p className="text-blue-100">Đa dạng, tiện lợi và an toàn cho mọi giao dịch của bạn.</p>
          </div>
          
          <div className="p-8 space-y-12">
            
            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600"><QrCode className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">1. Chuyển khoản ngân hàng & quét mã VietQR (Khuyên dùng)</h2>
              </div>
              <p className="text-slate-600 leading-relaxed mb-4">
                Hệ thống hỗ trợ thanh toán tự động qua VietQR 24/7. Ngay sau khi thanh toán, dịch vụ của bạn sẽ được kích hoạt hoặc tự động gia hạn ngay lập tức mà không cần chờ đợi.
              </p>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <ul className="space-y-2 text-sm text-slate-700 font-medium">
                  <li>Ngân hàng: <strong className="text-slate-900">Techcombank</strong></li>
                  <li>Chủ tài khoản: <strong className="text-slate-900">CTCP CONG NGHE HA TANG SO VN</strong></li>
                  <li>Số tài khoản: <strong className="text-slate-900">19039328221019</strong></li>
                  <li className="pt-2 text-blue-600 italic">Nội dung chuyển khoản vui lòng ghi đúng cú pháp hệ thống cung cấp khi tạo đơn hàng.</li>
                </ul>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600"><Wallet className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">2. Thanh toán qua ví điện tử (MoMo / VNPay)</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Thanh toán qua ví điện tử VNPay, MoMo hoàn toàn tự động. Hệ thống sẽ tạo mã QR tích hợp số tiền và nội dung, bạn chỉ cần mở ứng dụng ví điện tử và quét mã.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-amber-100 rounded-lg text-amber-600"><CreditCard className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">3. Thẻ tín dụng quốc tế (Visa / Mastercard)</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Chúng tôi chấp nhận thẻ tín dụng/ghi nợ quốc tế phát hành tại Việt Nam qua cổng thanh toán bảo mật. Mọi thông tin thẻ của bạn đều được mã hóa theo chuẩn PCI DSS.
              </p>
            </section>

            <section>
              <div className="flex items-center gap-3 mb-4 text-slate-900">
                <div className="p-2 bg-purple-100 rounded-lg text-purple-600"><Building className="w-6 h-6" /></div>
                <h2 className="text-xl font-bold">4. Nạp tiền vào số dư (Wallet)</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Quý khách có thể nạp sẵn tiền vào tài khoản tại hệ thống của chúng tôi. Hệ thống sẽ tự động trừ tiền trong Wallet khi dịch vụ tới hạn gia hạn, giúp đảm bảo dịch vụ không bao giờ bị gián đoạn.
              </p>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
