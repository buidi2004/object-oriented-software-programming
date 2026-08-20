'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { api } from '@/src/lib/api';

interface IndustryTab {
  id: string;
  label: string;
}

interface SolutionCard {
  title: string;
  desc: string;
  img: string;
  link?: string;
}

interface SolutionsData {
  sectionTitle: string;
  tabs: IndustryTab[];
  solutions: Record<string, SolutionCard[]>;
}

const DEFAULT_SOLUTIONS: SolutionsData = {
  sectionTitle: 'Giải pháp của CloudHost VN',
  tabs: [
    { id: 'chinh-phu', label: 'Chính phủ' },
    { id: 'tai-chinh', label: 'Tài chính - Ngân hàng' },
    { id: 'y-te', label: 'Y tế' },
    { id: 'giao-duc', label: 'Giáo dục' },
    { id: 'thuong-mai', label: 'Thương mại điện tử' },
    { id: 'san-xuat', label: 'Sản xuất' },
  ],
  solutions: {
    'chinh-phu': [
      { title: 'Chính quyền điện tử', desc: 'Nền tảng hạ tầng số vững chắc cho các Bộ Ban Ngành.', img: 'https://images.unsplash.com/photo-1574682782337-0cbdb3d548b2?q=80&w=2070&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Lưu trữ quốc gia', desc: 'Bảo mật tuyệt đối dữ liệu dân cư và hồ sơ hành chính.', img: 'https://images.unsplash.com/photo-1541888001633-94c6530664f3?q=80&w=2070&auto=format&fit=crop', link: '/services/object-storage' },
      { title: 'An toàn thông tin mạng', desc: 'Giám sát và phòng thủ không gian mạng quốc gia.', img: 'https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop', link: '/services/security-addons' },
    ],
    'tai-chinh': [
      { title: 'Ngân hàng số', desc: 'Hạ tầng máy chủ tốc độ cao phục vụ giao dịch tài chính.', img: 'https://images.unsplash.com/photo-1616803140344-6682afb13cda?q=80&w=2070&auto=format&fit=crop', link: '/services/dedicated-server' },
      { title: 'DR cho Core Banking', desc: 'Trung tâm dữ liệu dự phòng chuẩn Tier III quốc tế.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Bảo mật PCI DSS', desc: 'Hệ thống đạt chuẩn an toàn thanh toán thẻ quốc tế.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop', link: '/services/ssl-certificate' },
    ],
    'y-te': [
      { title: 'Bệnh án điện tử', desc: 'Lưu trữ và truy xuất hồ sơ bệnh án mọi lúc mọi nơi.', img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop', link: '/services/database' },
      { title: 'Telemedicine', desc: 'Hạ tầng truyền tải ổn định cho khám chữa bệnh từ xa.', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Xử lý hình ảnh y tế', desc: 'Hệ thống GPU Cloud phân tích ảnh chụp MRI, X-Quang.', img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop', link: '/services/dedicated-server' },
    ],
    'giao-duc': [
      { title: 'E-Learning Cloud', desc: 'Hạ tầng lưu trữ và truyền phát video bài giảng trực tuyến.', img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop', link: '/services/cdn' },
      { title: 'Tuyển sinh trực tuyến', desc: 'Hệ thống chịu tải cao trong các đợt thi và tuyển sinh.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Thư viện số', desc: 'Số hóa và lưu trữ không giới hạn tài liệu học thuật.', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop', link: '/services/object-storage' },
    ],
    'thuong-mai': [
      { title: 'E-Commerce High Traffic', desc: 'Tự động co giãn (Auto-scaling) chịu tải triệu lượt truy cập dịp Mega Sale.', img: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?q=80&w=2070&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Tăng tốc Web CDN', desc: 'Tối ưu tốc độ tải trang dưới 1 giây, giữ chân khách mua hàng.', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', link: '/services/cdn' },
      { title: 'Bảo mật chống gian lận', desc: 'Tường lửa WAF chống DDOS và rà quét lỗ hổng thanh toán.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop', link: '/services/security-addons' },
    ],
    'san-xuat': [
      { title: 'Smart Factory IoT', desc: 'Thu thập và phân tích dữ liệu cảm biến dây chuyền sản xuất theo thời gian thực.', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop', link: '/services/dedicated-server' },
      { title: 'Hệ thống ERP Cloud', desc: 'Quản trị tổng thể nguồn lực doanh nghiệp sản xuất trên hạ tầng đám mây.', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Quản lý chuỗi cung ứng', desc: 'Theo dõi xuất nhập tồn kho và logistics minh bạch, liên tục 24/7.', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop', link: '/services/database' },
    ],
    'default': [
      { title: 'Hệ sinh thái Cloud', desc: 'Nền tảng điện toán đám mây an toàn, bảo mật và hiệu suất cao.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', link: '/services/cloud-vps' },
      { title: 'Sao lưu & Dự phòng', desc: 'Xây dựng trung tâm dữ liệu dự phòng, đảm bảo tính sẵn sàng cao.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop', link: '/services/object-storage' },
      { title: 'Bảo mật đa lớp', desc: 'Ngăn chặn tấn công DDoS, bảo vệ an toàn thông tin tuyệt đối.', img: 'https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop', link: '/services/security-addons' },
    ]
  }
};

export const HomeSolutionsSection = () => {
  const router = useRouter();
  const [data, setData] = useState<SolutionsData>(DEFAULT_SOLUTIONS);
  const [activeTab, setActiveTab] = useState('chinh-phu');

  useEffect(() => {
    const fetchSolutions = async () => {
      try {
        const res = await api.get('/system-settings/homepage_solutions');
        if (res.data?.value) {
          const parsed = JSON.parse(res.data.value);
          if (parsed && parsed.tabs && parsed.tabs.length > 0) {
            setData(parsed);
            setActiveTab(parsed.tabs[0].id);
          }
        }
      } catch (err) {
        // Keep default fallback
      }
    };
    fetchSolutions();
  }, []);

  const currentSolutions = data.solutions[activeTab] || data.solutions['default'] || [];

  return (
    <section className="py-12 md:py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-6 md:mb-8">
          {data.sectionTitle}
        </h2>

        {/* Tabs Row */}
        <div className="flex overflow-x-auto pb-3 mb-6 gap-2 scrollbar-none">
          {data.tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-colors outline-none border shrink-0 ${
                activeTab === tab.id
                  ? 'text-white border-transparent'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
              }`}
            >
              <span className="relative z-10">{tab.label}</span>

              {activeTab === tab.id && (
                <motion.div
                  layoutId="active-pill"
                  className="absolute inset-0 bg-blue-600 rounded-full shadow-md"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {currentSolutions.map((sol, idx) => (
            <div 
              key={idx} 
              onClick={() => { if (sol.link && sol.link !== '#') router.push(sol.link); }}
              className="group relative rounded-2xl overflow-hidden h-64 sm:h-72 cursor-pointer shadow-lg"
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${sol.img}')` }}
              />
              <div 
                className="absolute inset-0 opacity-90" 
                style={{ background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)' }}
              />
              
              <div className="absolute inset-0 p-5 sm:p-8 flex flex-col justify-end text-white">
                <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2">{sol.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 mb-3 sm:mb-4">{sol.desc}</p>
                <div>
                  <span className="inline-flex items-center px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-xs sm:text-sm font-bold backdrop-blur-sm transition-colors">
                    Xem chi tiết
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
