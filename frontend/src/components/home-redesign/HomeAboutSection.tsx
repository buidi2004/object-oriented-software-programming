'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/src/lib/api';

interface AboutStat {
  title: string;
  desc: string;
}

interface AboutData {
  title: string;
  description: string;
  imageUrl: string;
  moreLink: string;
  stats: AboutStat[];
}

const DEFAULT_ABOUT: AboutData = {
  title: 'Về CloudHost VN',
  description: 'CloudHost VN là nhà cung cấp dịch vụ Điện toán đám mây (Cloud) và Trung tâm dữ liệu (Data Center) hàng đầu tại Việt Nam, mang đến hệ sinh thái dịch vụ toàn diện cho doanh nghiệp.',
  imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop',
  moreLink: '/about',
  stats: [
    { title: 'Số 1', desc: 'Nhà cung cấp dịch vụ Cloud và Data Center lớn nhất tại Việt Nam' },
    { title: '26.000+', desc: 'Khách hàng doanh nghiệp trong nước và quốc tế đã tin dùng' },
    { title: 'Toàn cầu', desc: 'Mạng lưới đối tác công nghệ hàng đầu thế giới: Microsoft, AWS, VMware' },
    { title: '67.250 m²', desc: 'Diện tích phòng máy thiết kế theo tiêu chuẩn quốc tế Rated 3' }
  ]
};

export const HomeAboutSection = () => {
  const [data, setData] = useState<AboutData>(DEFAULT_ABOUT);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await api.get('/system-settings/homepage_about');
        if (res.data?.value) {
          const parsed = JSON.parse(res.data.value);
          if (parsed && parsed.title) {
            setData(parsed);
          }
        }
      } catch (err) {
        // Keep default fallback
      }
    };
    fetchAbout();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          
          {/* Left Text & Stats */}
          <div className="space-y-8 md:space-y-10">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4 md:mb-6">
                {data.title}
              </h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-lg">
                {data.description}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 sm:gap-y-10">
              {data.stats.map((st, idx) => (
                <StatBlock 
                  key={idx}
                  title={st.title} 
                  desc={st.desc} 
                />
              ))}
            </div>

            <div>
              <Link href={data.moreLink || '/about'} className="inline-flex items-center text-sm font-bold text-[#1F1F1F] hover:text-[#1F1F1F] transition-colors group">
                Xem thêm <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative mt-4 lg:mt-0">
            <div className="hidden sm:block absolute inset-0 bg-blue-50 transform sm:translate-x-6 lg:translate-x-10 -translate-y-6 lg:-translate-y-10 rounded-3xl -z-10" />
            <img 
              src={data.imageUrl || DEFAULT_ABOUT.imageUrl} 
              alt="Data Center" 
              className="rounded-2xl sm:rounded-3xl shadow-xl lg:shadow-2xl object-cover w-full h-[280px] sm:h-[380px] lg:h-[500px]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = DEFAULT_ABOUT.imageUrl;
              }}
            />
          </div>

        </div>
      </div>
    </section>
  );
};

const StatBlock = ({ title, desc }: { title: string, desc: string }) => (
  <div>
    <h4 className="text-2xl font-black text-[#1F1F1F] mb-2">{title}</h4>
    <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

