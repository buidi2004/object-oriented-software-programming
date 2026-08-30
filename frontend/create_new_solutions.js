const fs = require('fs');
const path = require('path');

const templates = [
  {
    slug: 'ai',
    themeColor: 'purple',
    icon: 'Cpu',
    title: 'Hạ tầng Trí tuệ nhân tạo (AI/ML)',
    subtitle: 'Training mô hình nhanh gấp 10 lần với GPU chuyên dụng',
    desc: 'Giải pháp Server GPU (NVIDIA A100, H100) chuyên biệt dành cho huấn luyện mô hình Deep Learning, xử lý Big Data và Inference với độ trễ cực thấp.',
    themeBg: 'bg-purple-50',
    themeText: 'text-purple-600',
    themeButton: 'bg-purple-600'
  },
  {
    slug: 'fintech',
    themeColor: 'blue',
    icon: 'Shield',
    title: 'Giải pháp Điện toán Tài chính (Fintech)',
    subtitle: 'Bảo mật PCI-DSS, độ trễ bằng 0 (Zero-latency)',
    desc: 'Hệ thống hạ tầng Core Banking, ví điện tử và sàn giao dịch tiền điện tử đòi hỏi độ trễ siêu thấp để khớp lệnh realtime. Chúng tôi đáp ứng mọi tiêu chuẩn bảo mật khắt khe nhất.',
    themeBg: 'bg-blue-50',
    themeText: 'text-blue-600',
    themeButton: 'bg-blue-600'
  },
  {
    slug: 'media',
    themeColor: 'pink',
    icon: 'Video',
    title: 'Giải pháp Streaming & Media',
    subtitle: 'Phát trực tuyến mượt mà cho hàng triệu người xem',
    desc: 'Với hệ thống CDN toàn cầu băng thông lên tới Tbps, hạ tầng của chúng tôi sẵn sàng cho mọi sự kiện Livestream, OTT và nền tảng Video on Demand (VOD) lớn nhất.',
    themeBg: 'bg-pink-50',
    themeText: 'text-pink-600',
    themeButton: 'bg-pink-600'
  },
  {
    slug: 'saas',
    themeColor: 'emerald',
    icon: 'Layers',
    title: 'Hạ tầng cho nhà cung cấp SaaS',
    subtitle: 'Kiến trúc Microservices & Kubernetes linh hoạt',
    desc: 'Thiết kế hạ tầng Multi-tenant an toàn cho các công ty phần mềm dịch vụ B2B. Dễ dàng auto-scale từng dịch vụ (Service) độc lập khi số lượng khách hàng tăng vọt.',
    themeBg: 'bg-emerald-50',
    themeText: 'text-emerald-600',
    themeButton: 'bg-emerald-600'
  }
];

templates.forEach(t => {
  const dir = path.join(__dirname, 'app/solutions', t.slug);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const content = `'use client';

import React from 'react';
import Link from 'next/link';
import { ${t.icon}, ArrowRight } from 'lucide-react';
import { ScrollReveal } from '@/src/components/animations/ScrollReveal';
import { TypewriterText } from '@/src/components/animations/TypewriterText';
import { SolutionExtendedSections } from '@/src/components/solutions/SolutionExtendedSections';

export default function ${t.slug.toUpperCase()}SolutionPage() {
  return (
    <div className="min-h-screen ${t.themeBg} overflow-hidden">
      <section className="relative pt-24 pb-32 border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal animation="fade">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-8 uppercase">
              <Link href="/" className="hover:${t.themeText} transition-colors">HOME</Link>
              <span>/</span>
              <Link href="/solutions" className="hover:${t.themeText} transition-colors">SOLUTIONS</Link>
              <span>/</span>
              <span className="${t.themeText} font-bold">${t.slug.toUpperCase()}</span>
            </div>
          </ScrollReveal>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollReveal animation="slide-up">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full ${t.themeBg} ${t.themeText} text-xs font-bold uppercase tracking-wider mb-6">
                  <${t.icon} className="w-4 h-4" />
                  Giải pháp chuyên biệt
                </span>
                
                <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight mb-6">
                  ${t.title.split(' ').slice(0,3).join(' ')} <br/>
                  <span className="${t.themeText}">
                    <TypewriterText text="${t.title.split(' ').slice(3).join(' ')}" speed={40} delay={0.2} />
                  </span>
                </h1>
                
                <p className="text-lg text-slate-600 leading-relaxed mb-8 max-w-xl">
                  ${t.desc}
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link href="/contact" className="px-8 py-4 ${t.themeButton} text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center gap-2">
                    Triển khai ngay <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <SolutionExtendedSections slug="${t.slug}" themeColor="${t.themeColor}" />
    </div>
  );
}
`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log(`Created ${t.slug}`);
});
