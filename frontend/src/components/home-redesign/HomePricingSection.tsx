'use client';

import React from 'react';
import { Check, Zap } from 'lucide-react';
import Link from 'next/link';

export const HomePricingSection = () => {
  const plans = [
    {
      name: 'Cloud VPS Basic',
      price: '99,000',
      description: 'Phù hợp cho người mới bắt đầu, website cá nhân.',
      features: ['1 vCPU', '1 GB RAM', '20 GB NVMe Storage', 'Băng thông không giới hạn', 'Tự động sao lưu'],
      popular: false,
    },
    {
      name: 'Cloud VPS Pro',
      price: '199,000',
      description: 'Hiệu năng cao cho website doanh nghiệp vừa.',
      features: ['2 vCPU', '2 GB RAM', '40 GB NVMe Storage', 'Anti-DDoS Basic', 'Tự động sao lưu', 'Hỗ trợ ưu tiên'],
      popular: true,
    },
    {
      name: 'Cloud VPS Premium',
      price: '399,000',
      description: 'Sức mạnh tối đa cho hệ thống e-commerce.',
      features: ['4 vCPU', '4 GB RAM', '80 GB NVMe Storage', 'Anti-DDoS Advanced', 'Tự động sao lưu', 'Quản trị máy chủ'],
      popular: false,
    }
  ];

  return (
    <div className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-wider text-[#d09e2b] uppercase mb-3">
            Bảng Giá Dịch Vụ
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-6">
            Linh Hoạt, Minh Bạch, Tiết Kiệm
          </h3>
          <p className="text-lg text-slate-600">
            Nhiều lựa chọn cấu hình đáp ứng mọi ngân sách và quy mô doanh nghiệp. Thanh toán dễ dàng, huỷ bất kỳ lúc nào.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`bg-white rounded-3xl p-8 relative flex flex-col ${
              plan.popular 
                ? 'shadow-2xl border-2 border-[#d09e2b] transform md:-translate-y-4' 
                : 'shadow-lg border border-slate-200'
            }`}>
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="bg-[#d09e2b] text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                    <Zap className="w-3.5 h-3.5" /> Bán chạy nhất
                  </div>
                </div>
              )}
              
              <h4 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h4>
              <p className="text-slate-600 text-[15px] mb-6 h-10">{plan.description}</p>
              
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-slate-500 font-medium"> đ/tháng</span>
              </div>
              
              <div className="flex-1">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-[#d09e2b] shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Link 
                href="/register" 
                className={`w-full py-3.5 rounded-xl font-bold text-center transition-all ${
                  plan.popular 
                    ? 'bg-[#d09e2b] hover:bg-[#b0841f] text-white shadow-md hover:shadow-lg' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                }`}
              >
                Đăng ký ngay
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
