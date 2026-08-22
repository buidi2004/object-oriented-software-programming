import React from 'react';
import { ShieldCheck, Award, CheckCircle2, Shield } from 'lucide-react';

export const HomeCertifications = () => {
  const certs = [
    { 
      title: 'ISO 9001:2015', 
      desc: 'Quản lý chất lượng', 
      icon: Award, 
      bg: 'linear-gradient(135deg, #2563eb, #06b6d4)',
      iconColor: '#ffffff',
      borderColor: '#bfdbfe'
    },
    { 
      title: 'ISO 27001:2013', 
      desc: 'Bảo mật thông tin', 
      icon: ShieldCheck, 
      bg: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
      iconColor: '#ffffff',
      borderColor: '#c7d2fe'
    },
    { 
      title: 'ISO 27017:2015', 
      desc: 'Bảo mật Cloud', 
      icon: Shield, 
      bg: 'linear-gradient(135deg, #0ea5e9, #22d3ee)',
      iconColor: '#ffffff',
      borderColor: '#bae6fd'
    },
    { 
      title: 'ISO 50001:2018', 
      desc: 'Quản lý năng lượng', 
      icon: CheckCircle2, 
      bg: 'linear-gradient(135deg, #10b981, #2dd4bf)',
      iconColor: '#ffffff',
      borderColor: '#a7f3d0'
    },
    { 
      title: 'TIA-942 Rated 3', 
      desc: 'Tiêu chuẩn Data Center', 
      icon: Award, 
      bg: 'linear-gradient(135deg, #fbbf24, #f97316)',
      iconColor: '#ffffff',
      borderColor: '#fde68a'
    },
    { 
      title: 'PCI DSS', 
      desc: 'Bảo mật thẻ thanh toán', 
      icon: ShieldCheck, 
      bg: 'linear-gradient(135deg, #ef4444, #fb7185)',
      iconColor: '#ffffff',
      borderColor: '#fecdd3'
    },
    { 
      title: 'AICPA SOC 1,2,3', 
      desc: 'Kiểm soát nội bộ', 
      icon: Shield, 
      bg: 'linear-gradient(135deg, #8b5cf6, #c084fc)',
      iconColor: '#ffffff',
      borderColor: '#ddd6fe'
    },
    { 
      title: 'Uptime Tier III', 
      desc: 'Thiết kế & Xây dựng', 
      icon: CheckCircle2, 
      bg: 'linear-gradient(135deg, #fcd34d, #eab308)',
      iconColor: '#78350f',
      borderColor: '#fef3c7'
    },
  ];

  return (
    <section className="py-16 bg-slate-50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
          Chứng chỉ quốc tế
        </h2>
        <p className="text-slate-600 mb-10">Cam kết chất lượng dịch vụ đạt chuẩn doanh nghiệp quốc tế.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {certs.map((cert, idx) => {
            const Icon = cert.icon;
            return (
              <div key={idx} className="bg-white rounded-md p-6 sm:p-8 flex flex-col items-center justify-center text-center shadow-md hover:shadow-xl transition-all duration-300 border border-slate-100 group hover:-translate-y-1">
                {/* Realistic Badge Container */}
                <div className="relative mb-6">
                  {/* Outer Glow Effect */}
                  <div 
                    className="absolute inset-0 blur-lg opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-full"
                    style={{ background: cert.bg }}
                  />
                  {/* Colored Badge */}
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center relative z-10 border-[3px] shadow-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                    style={{ background: cert.bg, borderColor: cert.borderColor }}
                  >
                    <Icon className="w-10 h-10 drop-shadow-md" style={{ color: cert.iconColor }} />
                  </div>
                </div>
                <h4 className="font-black text-slate-900 text-[15px] mb-2">{cert.title}</h4>
                <p className="text-sm text-slate-600 font-medium">{cert.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
