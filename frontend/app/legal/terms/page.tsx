'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Shield, ChevronRight } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8">
          <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 font-medium">Thỏa thuận sử dụng</span>
        </nav>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 p-8 text-white">
            <h1 className="text-3xl font-black mb-2">Thỏa Thuận Sử Dụng Dịch Vụ</h1>
            <p className="text-slate-400">Cập nhật lần cuối: 20/08/2026</p>
          </div>
          
          <div className="p-8 prose prose-slate max-w-none text-sm text-slate-600">
            <h3>1. Chấp thuận điều khoản</h3>
            <p>Bằng việc đăng ký và sử dụng dịch vụ của chúng tôi, khách hàng mặc nhiên đồng ý với các điều khoản trong bản Thỏa thuận này. Chúng tôi có quyền từ chối cung cấp dịch vụ nếu khách hàng vi phạm các quy định dưới đây.</p>

            <h3>2. Trách nhiệm của khách hàng</h3>
            <ul>
              <li>Khách hàng chịu hoàn toàn trách nhiệm về nội dung lưu trữ trên máy chủ/hosting của mình.</li>
              <li>Không lưu trữ, phát tán các nội dung vi phạm pháp luật Việt Nam, tài liệu đồi trụy, vi phạm bản quyền (DMCA).</li>
              <li>Không sử dụng dịch vụ để thực hiện các cuộc tấn công mạng (DDoS, Spam Email, Phishing...).</li>
              <li>Tự bảo quản mật khẩu, thông tin quản trị và dữ liệu cá nhân. Mặc dù chúng tôi có cơ chế backup định kỳ (với một số gói dịch vụ), khách hàng vẫn phải có trách nhiệm tự backup dữ liệu của chính mình.</li>
            </ul>

            <h3>3. Cam kết chất lượng dịch vụ (SLA)</h3>
            <p>Chúng tôi cam kết thời gian hoạt động (Uptime) của dịch vụ đạt 99.9%. Trong trường hợp hệ thống gặp sự cố từ phía hạ tầng máy chủ, chúng tôi sẽ bồi thường thời gian sử dụng tương ứng theo chính sách bồi thường SLA.</p>

            <h3>4. Chính sách hoàn tiền (Refund Policy)</h3>
            <p>Khách hàng được quyền yêu cầu hoàn tiền 100% trong vòng 7 ngày kể từ ngày đăng ký dịch vụ đầu tiên nếu không hài lòng về chất lượng. Chính sách hoàn tiền không áp dụng cho tên miền, chứng chỉ SSL và các dịch vụ mua hộ, phần mềm bản quyền.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
