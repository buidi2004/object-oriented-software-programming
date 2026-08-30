const fs = require('fs');
const path = require('path');

const componentContent = `'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollReveal, StaggerContainer, StaggerItem } from '@/src/components/animations/ScrollReveal';
import { Check, X, ChevronDown, Rocket, Clock, ShieldCheck, Zap } from 'lucide-react';

interface Phase5Props {
  themeColor: string;
}

export function Phase5Extensions({ themeColor }: Phase5Props) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const getThemeColors = () => {
    const map: Record<string, string> = {
      blue: 'text-blue-600 bg-blue-100 border-blue-200 bg-blue-600',
      pink: 'text-pink-600 bg-pink-100 border-pink-200 bg-pink-600',
      emerald: 'text-emerald-600 bg-emerald-100 border-emerald-200 bg-emerald-600',
      purple: 'text-purple-600 bg-purple-100 border-purple-200 bg-purple-600',
      slate: 'text-slate-800 bg-slate-200 border-slate-300 bg-slate-800',
      red: 'text-red-600 bg-red-100 border-red-200 bg-red-600',
      orange: 'text-orange-600 bg-orange-100 border-orange-200 bg-orange-600',
      amber: 'text-amber-600 bg-amber-100 border-amber-200 bg-amber-600'
    };
    const colors = map[themeColor] || map['blue'];
    const parts = colors.split(' ');
    return {
      text: parts[0],
      bgLight: parts[1],
      border: parts[2],
      bgSolid: parts[3]
    };
  };

  const theme = getThemeColors();

  return (
    <>
      {/* TIMELINE SECTION */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fade" className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">Lộ trình triển khai</h2>
            <p className="text-slate-600 text-lg">Từ số 0 đến vận hành trơn tru chỉ trong 72 giờ.</p>
          </ScrollReveal>

          <div className="relative max-w-4xl mx-auto">
            <div className={\`absolute left-8 md:left-1/2 top-0 bottom-0 w-1 \${theme.bgLight} -translate-x-1/2 rounded-full\`}></div>
            
            {[ 
              { title: 'Ngày 1: Phân tích hệ thống', desc: 'Đội ngũ kiến trúc sư đánh giá tải và yêu cầu bảo mật.', icon: Clock },
              { title: 'Ngày 2: Triển khai hạ tầng', desc: 'Khởi tạo Server, cấu hình Network, VPC, Firewall.', icon: Zap },
              { title: 'Ngày 3: Migrate & Testing', desc: 'Rsync dữ liệu không downtime và kiểm thử chịu tải.', icon: Rocket }
            ].map((step, i) => (
              <ScrollReveal key={i} animation={i % 2 === 0 ? "slide-right" : "slide-left"} className="relative z-10 flex flex-col md:flex-row items-center justify-between mb-12 group">
                 <div className={\`md:w-5/12 \${i % 2 !== 0 ? 'md:order-3 md:text-left' : 'md:text-right'} w-full pl-20 md:pl-0\`}> 
                    <h3 className={\`text-2xl font-bold mb-2 \${theme.text}\`}>{step.title}</h3>
                    <p className="text-slate-600">{step.desc}</p>
                 </div>
                 <div className={\`absolute left-8 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full \${theme.bgSolid} text-white flex items-center justify-center border-4 border-white shadow-xl group-hover:scale-125 transition-transform duration-500 z-20 md:order-2\`}>
                    <step.icon className="w-5 h-5" />
                 </div>
                 <div className="md:w-5/12 hidden md:block md:order-1"></div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className={\`py-24 \${theme.bgLight} border-y \${theme.border}\`}>
         <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade" className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">So Sánh Tính Năng</h2>
              <p className="text-slate-700 text-lg">Tại sao hàng ngàn khách hàng chọn chuyển đổi sang nền tảng của chúng tôi?</p>
            </ScrollReveal>

            <ScrollReveal animation="zoom-in">
               <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
                  <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200 p-6">
                     <div className="font-bold text-slate-500">Tiêu Chí</div>
                     <div className="font-bold text-slate-500 text-center">Giải pháp truyền thống</div>
                     <div className={\`font-black \${theme.text} text-center text-lg uppercase\`}>SEN CloudHost</div>
                  </div>
                  
                  {[
                    { label: 'Auto-scaling (Tự động mở rộng)', old: false, new: true },
                    { label: 'Uptime SLA', old: '99.0%', new: '99.99%' },
                    { label: 'Băng thông (Bandwidth)', old: '100 Mbps', new: '10 Gbps' },
                    { label: 'Hỗ trợ kỹ thuật', old: 'Giờ hành chính', new: '24/7/365 L3 Support' },
                    { label: 'Bảo vệ Anti-DDoS', old: false, new: true },
                  ].map((row, i) => (
                    <StaggerContainer key={i} className="grid grid-cols-3 p-6 border-b border-slate-100 hover:bg-slate-50 transition-colors items-center">
                       <StaggerItem className="font-medium text-slate-700">{row.label}</StaggerItem>
                       <StaggerItem className="text-center text-slate-500 flex justify-center">
                          {typeof row.old === 'boolean' ? (row.old ? <Check className="w-5 h-5 text-green-500"/> : <X className="w-5 h-5 text-red-400"/>) : row.old}
                       </StaggerItem>
                       <StaggerItem className={\`text-center font-bold flex justify-center \${theme.text}\`}>
                          {typeof row.new === 'boolean' ? (row.new ? <Check className="w-6 h-6 text-green-500"/> : <X className="w-5 h-5 text-red-500"/>) : row.new}
                       </StaggerItem>
                    </StaggerContainer>
                  ))}
               </div>
            </ScrollReveal>
         </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal animation="fade" className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black mb-4 uppercase">Câu hỏi thường gặp</h2>
            </ScrollReveal>

            <div className="space-y-4">
              {[
                { q: 'Hệ thống có cam kết Uptime không?', a: 'Chúng tôi cam kết mức SLA 99.99%. Nếu uptime thấp hơn mức này, chúng tôi sẽ hoàn tiền tương ứng vào tài khoản của bạn theo chính sách bồi thường.' },
                { q: 'Thời gian nâng cấp cấu hình mất bao lâu?', a: 'Với kiến trúc Cloud Native, việc nâng cấp CPU/RAM diễn ra hoàn toàn tự động chỉ mất từ 3-5 phút và không cần phải thay đổi cấu hình mạng.' },
                { q: 'Dữ liệu của tôi có được sao lưu không?', a: 'Hệ thống Auto-Backup hoạt động hàng ngày và lưu trữ tại 2 Data Center khác nhau để đảm bảo an toàn dữ liệu tuyệt đối trước mọi rủi ro.' },
                { q: 'Nếu bị tấn công mạng (DDoS) thì sao?', a: 'Hệ thống tự động kích hoạt Firewall L4/L7 và chuyển hướng traffic qua cụm Scrubbing Center ngay khi phát hiện lưu lượng bất thường.' }
              ].map((faq, i) => (
                <div key={i} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full px-6 py-4 text-left font-bold text-lg text-slate-900 flex justify-between items-center bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    {faq.q}
                    <ChevronDown className={\`w-5 h-5 transition-transform duration-300 \${activeFaq === i ? 'rotate-180 ' + theme.text : 'text-slate-400'}\`} />
                  </button>
                  <AnimatePresence>
                    {activeFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-white px-6 py-4 text-slate-600 leading-relaxed border-t border-slate-100"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
         </div>
      </section>
    </>
  );
}
`;

const solutions = [
  { slug: 'ecommerce', color: 'pink' },
  { slug: 'saas', color: 'emerald' },
  { slug: 'ai', color: 'purple' },
  { slug: 'enterprise', color: 'slate' },
  { slug: 'fintech', color: 'blue' },
  { slug: 'sme', color: 'blue' },
  { slug: 'gaming', color: 'purple' },
  { slug: 'media', color: 'pink' },
  { slug: 'agency', color: 'emerald' },
  { slug: 'security', color: 'red' },
  { slug: 'migration', color: 'orange' },
  { slug: 'student', color: 'amber' }
];

const compPath = path.join(__dirname, 'src/components/solutions/Phase5Extensions.tsx');
fs.writeFileSync(compPath, componentContent);
console.log('Created Phase5Extensions component');

solutions.forEach(s => {
  const filePath = path.join(__dirname, 'app/solutions', s.slug, 'page.tsx');
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    if (!content.includes('Phase5Extensions')) {
      content = content.replace(
        "import { TypewriterText } from '@/src/components/animations/TypewriterText';",
        "import { TypewriterText } from '@/src/components/animations/TypewriterText';\nimport { Phase5Extensions } from '@/src/components/solutions/Phase5Extensions';"
      );
      
      content = content.replace(
        /<\/div>\s*\);\s*\}\s*$/,
        `      <Phase5Extensions themeColor="${s.color}" />\n\n    </div>\n  );\n}`
      );
      fs.writeFileSync(filePath, content);
      console.log(`Injected Phase 5 into ${s.slug}`);
    }
  }
});
