'use client';

import React, { useState } from 'react';
import { Cloud, Server, Shield, Database, LayoutTemplate, Cpu, Network, Zap, Globe } from 'lucide-react';
import Link from 'next/link';

export const HomeServicesSection = () => {
  const [activeTab, setActiveTab] = useState('cloud');

  const tabs = [
    { id: 'cloud', label: 'Cloud & Security' },
    { id: 'datacenter', label: 'Data Center' },
    { id: 'network', label: 'Nhà mạng & Kênh truyền' },
    { id: 'iot', label: 'IoT' },
    { id: 'managed', label: 'Managed Services' },
    { id: 'hardware', label: 'Thiết bị phần cứng' },
  ];

  const cloudServices = [
    { title: 'Cloud VPS', desc: 'Máy chủ ảo điện toán đám mây với ổ cứng NVMe tốc độ cao', icon: Server, href: '/services/cloud-vps' },
    { title: 'Web Hosting', desc: 'Hosting tối ưu cho WordPress và các mã nguồn phổ biến', icon: LayoutTemplate, href: '/services/hosting' },
    { title: 'Tên miền', desc: 'Đăng ký và quản lý tên miền quốc gia & quốc tế', icon: Globe, href: '/services/domain' },
    { title: 'Object Storage', desc: 'Lưu trữ dữ liệu an toàn, mở rộng không giới hạn', icon: Database, href: '/services/storage' },
    { title: 'Email Hosting', desc: 'Email doanh nghiệp chuyên nghiệp theo tên miền riêng', icon: Cloud, href: '/services/email-hosting' },
    { title: 'SSL Certificates', desc: 'Chứng chỉ bảo mật SSL/TLS mã hóa dữ liệu website', icon: Shield, href: '/services/ssl-certificates' },
  ];

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Dịch vụ của CloudHost VN
          </h2>
          <Link href="/services" className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
            Xem tất cả dịch vụ →
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Sidebar Tabs (Horizontal scroll on mobile, vertical sidebar on desktop) */}
          <div className="w-full lg:w-64 shrink-0 flex lg:flex-col overflow-x-auto lg:overflow-visible gap-2 lg:gap-1 border-b lg:border-b-0 lg:border-r border-slate-200 pb-3 lg:pb-0 lg:pr-4 scrollbar-none">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap lg:whitespace-normal text-left px-4 py-2.5 lg:py-3 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 lg:shrink ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white lg:bg-blue-50 lg:text-blue-600 shadow-sm lg:shadow-none'
                    : 'text-slate-600 bg-white lg:bg-transparent border lg:border-none border-slate-200 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right Content Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {cloudServices.map((service, idx) => {
                const Icon = service.icon;
                return (
                  <div key={idx} className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-xs hover:shadow-md transition-shadow group flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-3.5 sm:gap-4 mb-3 sm:mb-4">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{service.desc}</p>
                        </div>
                      </div>
                    </div>
                    <Link href={service.href} className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 mt-3 sm:mt-4 inline-flex items-center gap-1 w-max">
                      Xem chi tiết <span className="text-base sm:text-lg leading-none">›</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
