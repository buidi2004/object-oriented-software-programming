import React from 'react';
import { UserPlus, HeadphonesIcon, Handshake } from 'lucide-react';
import Link from 'next/link';

export const HomePreFooterCTA = () => {
  return (
    <section className="bg-[#1F1F1F] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/20">
          
          <Link href="/register" className="p-6 sm:p-8 md:p-12 flex items-start gap-4 hover:bg-white/5 transition-colors group">
            <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight mb-1.5 sm:mb-2 flex items-center gap-2">
                Đăng ký <span className="text-lg">›</span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Đăng ký tài khoản ngay hôm nay để trải nghiệm dịch vụ Cloud tiêu chuẩn quốc tế.
              </p>
            </div>
          </Link>

          <Link href="/contact" className="p-6 sm:p-8 md:p-12 flex items-start gap-4 hover:bg-white/5 transition-colors group">
            <HeadphonesIcon className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight mb-1.5 sm:mb-2 flex items-center gap-2">
                Liên hệ hỗ trợ khách hàng <span className="text-lg">›</span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Đội ngũ kỹ thuật chuyên môn cao luôn sẵn sàng hỗ trợ bạn 24/7.
              </p>
            </div>
          </Link>

          <Link href="/partners" className="p-6 sm:p-8 md:p-12 flex items-start gap-4 hover:bg-white/5 transition-colors group">
            <Handshake className="w-7 h-7 sm:w-8 sm:h-8 shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight mb-1.5 sm:mb-2 flex items-center gap-2">
                Hợp tác <span className="text-lg">›</span>
              </h3>
              <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Cùng CloudHost VN xây dựng hệ sinh thái công nghệ, mở rộng cơ hội kinh doanh.
              </p>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
};
