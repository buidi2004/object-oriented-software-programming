'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const HomeSolutionsSection = () => {
  const [activeTab, setActiveTab] = useState('chinh-phu');

  const tabs = [
    { id: 'chinh-phu', label: 'Chính phủ' },
    { id: 'tai-chinh', label: 'Tài chính - Ngân hàng' },
    { id: 'y-te', label: 'Y tế' },
    { id: 'giao-duc', label: 'Giáo dục' },
    { id: 'thuong-mai', label: 'Thương mại điện tử' },
    { id: 'san-xuat', label: 'Sản xuất' },
  ];

  const solutionsData: Record<string, any[]> = {
    'chinh-phu': [
      { title: 'Chính quyền điện tử', desc: 'Nền tảng hạ tầng số vững chắc cho các Bộ Ban Ngành.', img: 'https://images.unsplash.com/photo-1574682782337-0cbdb3d548b2?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Lưu trữ quốc gia', desc: 'Bảo mật tuyệt đối dữ liệu dân cư và hồ sơ hành chính.', img: 'https://images.unsplash.com/photo-1541888001633-94c6530664f3?q=80&w=2070&auto=format&fit=crop' },
      { title: 'An toàn thông tin mạng', desc: 'Giám sát và phòng thủ không gian mạng quốc gia.', img: 'https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop' },
    ],
    'tai-chinh': [
      { title: 'Ngân hàng số', desc: 'Hạ tầng máy chủ tốc độ cao phục vụ giao dịch tài chính.', img: 'https://images.unsplash.com/photo-1616803140344-6682afb13cda?q=80&w=2070&auto=format&fit=crop' },
      { title: 'DR cho Core Banking', desc: 'Trung tâm dữ liệu dự phòng chuẩn Tier III quốc tế.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop' },
      { title: 'Bảo mật PCI DSS', desc: 'Hệ thống đạt chuẩn an toàn thanh toán thẻ quốc tế.', img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?q=80&w=2070&auto=format&fit=crop' },
    ],
    'y-te': [
      { title: 'Bệnh án điện tử', desc: 'Lưu trữ và truy xuất hồ sơ bệnh án mọi lúc mọi nơi.', img: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?q=80&w=2000&auto=format&fit=crop' },
      { title: 'Telemedicine', desc: 'Hạ tầng truyền tải ổn định cho khám chữa bệnh từ xa.', img: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=2070&auto=format&fit=crop' },
      { title: 'Xử lý hình ảnh y tế', desc: 'Hệ thống GPU Cloud phân tích ảnh chụp MRI, X-Quang.', img: 'https://images.unsplash.com/photo-1551076805-e1869033e561?q=80&w=2070&auto=format&fit=crop' },
    ],
    'giao-duc': [
      { title: 'E-Learning Cloud', desc: 'Hạ tầng lưu trữ và truyền phát video bài giảng trực tuyến.', img: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2064&auto=format&fit=crop' },
      { title: 'Tuyển sinh trực tuyến', desc: 'Hệ thống chịu tải cao trong các đợt thi và tuyển sinh.', img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop' },
      { title: 'Thư viện số', desc: 'Số hóa và lưu trữ không giới hạn tài liệu học thuật.', img: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=2128&auto=format&fit=crop' },
    ],
    'default': [
      { title: 'Hệ sinh thái Cloud', desc: 'Nền tảng điện toán đám mây an toàn, bảo mật và hiệu suất cao.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop' },
      { title: 'Sao lưu & Dự phòng', desc: 'Xây dựng trung tâm dữ liệu dự phòng, đảm bảo tính sẵn sàng cao.', img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop' },
      { title: 'Bảo mật đa lớp', desc: 'Ngăn chặn tấn công DDoS, bảo vệ an toàn thông tin tuyệt đối.', img: 'https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop' },
    ]
  };

  const currentSolutions = solutionsData[activeTab] || solutionsData['default'];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-8">
          Giải pháp của CloudHost VN
        </h2>

        {/* Tabs Row */}
        <div className="flex overflow-x-auto pb-4 mb-6 gap-2 hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-colors outline-none border ${
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
        <div className="grid md:grid-cols-3 gap-6">
          {currentSolutions.map((sol, idx) => (
            <div key={idx} className="group relative rounded-2xl overflow-hidden h-72 cursor-pointer shadow-lg">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url('${sol.img}')` }}
              />
              <div 
                className="absolute inset-0 opacity-90" 
                style={{ background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 60%, transparent 100%)' }}
              />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                <h3 className="text-xl font-bold mb-2">{sol.title}</h3>
                <p className="text-sm text-slate-300 line-clamp-2 mb-4">{sol.desc}</p>
                <div>
                  <span className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600/90 hover:bg-blue-600 text-sm font-bold backdrop-blur-sm transition-colors">
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
