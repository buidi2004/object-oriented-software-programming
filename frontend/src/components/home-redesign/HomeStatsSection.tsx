'use client';

import React from 'react';
import { Server, Users, Activity, Clock } from 'lucide-react';

export const HomeStatsSection = () => {
  const stats = [
    { id: 1, name: 'Uptime Đảm Bảo', value: '99.99%', icon: <Activity className="w-8 h-8 opacity-80" /> },
    { id: 2, name: 'Khách hàng Tin Dùng', value: '10,000+', icon: <Users className="w-8 h-8 opacity-80" /> },
    { id: 3, name: 'Data Center', value: '50+', icon: <Server className="w-8 h-8 opacity-80" /> },
    { id: 4, name: 'Hỗ Trợ Kỹ Thuật', value: '24/7/365', icon: <Clock className="w-8 h-8 opacity-80" /> },
  ];

  return (
    <div className="bg-[#d09e2b] py-16 sm:py-20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
          {stats.map((stat) => (
            <div key={stat.id} className="flex flex-col items-center">
              <div className="text-white mb-4">{stat.icon}</div>
              <div className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-2">
                {stat.value}
              </div>
              <div className="text-[15px] font-medium text-white/90">
                {stat.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
