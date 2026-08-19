import React from 'react';
import Link from 'next/link';

export const HomeAboutSection = () => {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Text & Stats */}
          <div className="space-y-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-6">
                Về CloudHost VN
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
                CloudHost VN là nhà cung cấp dịch vụ Điện toán đám mây (Cloud) và Trung tâm dữ liệu (Data Center) hàng đầu tại Việt Nam, mang đến hệ sinh thái dịch vụ toàn diện cho doanh nghiệp.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-x-8 gap-y-10">
              <StatBlock 
                title="Số 1" 
                desc="Nhà cung cấp dịch vụ Cloud và Data Center lớn nhất tại Việt Nam" 
              />
              <StatBlock 
                title="26.000+" 
                desc="Khách hàng doanh nghiệp trong nước và quốc tế đã tin dùng" 
              />
              <StatBlock 
                title="Toàn cầu" 
                desc="Mạng lưới đối tác công nghệ hàng đầu thế giới: Microsoft, AWS, VMware" 
              />
              <StatBlock 
                title="67.250 m²" 
                desc="Diện tích phòng máy thiết kế theo tiêu chuẩn quốc tế Rated 3" 
              />
            </div>

            <div>
              <Link href="/about" className="inline-flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group">
                Xem thêm <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="absolute inset-0 bg-blue-50 transform translate-x-10 -translate-y-10 rounded-3xl -z-10" />
            <img 
              src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
              alt="Data Center" 
              className="rounded-3xl shadow-2xl object-cover w-full h-[500px]"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

const StatBlock = ({ title, desc }: { title: string, desc: string }) => (
  <div>
    <h4 className="text-2xl font-black text-blue-600 mb-2">{title}</h4>
    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
  </div>
);
