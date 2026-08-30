import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Server, Shield, Globe, Cpu } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Khám phá CloudHost - Sức mạnh thực sự của điện toán đám mây',
  description: 'Khám phá giải pháp điện toán đám mây tối thượng với kiến trúc tối giản và hiệu năng cao nhất.',
};

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6 lg:px-12">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop')] bg-cover bg-center opacity-20 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
        
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-300">Tương lai của đám mây</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-8 leading-[1.1]">
            ĐƠN GIẢN HOÁ.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 via-gray-400 to-gray-600">
              TỐI ĐA HOÁ.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-12 leading-relaxed">
            Chúng tôi loại bỏ sự phức tạp không cần thiết. Trải nghiệm cơ sở hạ tầng đám mây thuần túy, mạnh mẽ và tập trung vào những gì thực sự quan trọng: Hiệu năng và Độ tin cậy.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="/services" 
              className="px-8 py-4 bg-white text-black font-bold rounded-none hover:bg-gray-200 transition-colors flex items-center gap-2"
            >
              Bắt đầu ngay <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-transparent text-white border border-white/30 font-bold rounded-none hover:bg-white/10 transition-colors"
            >
              Tìm hiểu thêm
            </Link>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 px-6 lg:px-12 bg-zinc-950 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-6">Triết lý thiết kế.</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">
                Tại CloudHost, chúng tôi tin rằng công nghệ vĩ đại nhất là công nghệ bạn không cần phải bận tâm. Kiến trúc của chúng tôi được xây dựng dựa trên nguyên tắc tối giản hóa - tập trung vào sức mạnh xử lý thô và tốc độ phản hồi tính bằng mili-giây.
              </p>
              <ul className="space-y-4">
                {[
                  'Không có tính năng dư thừa.',
                  'Giao diện quản lý tập trung và trực quan.',
                  'Tự động hoá tối đa mọi quy trình.',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 font-medium">
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative group overflow-hidden border border-white/10 aspect-square md:aspect-auto md:h-[500px]">
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60 z-10" />
              <img 
                src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop" 
                alt="Data Center" 
                className="w-full h-full object-cover grayscale transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute bottom-8 left-8 z-20">
                <div className="text-4xl font-black text-white mb-2">99.99%</div>
                <div className="text-gray-400 font-semibold tracking-wider uppercase text-sm">Cam kết Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-24 px-6 lg:px-12 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">Lõi công nghệ.</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Sự kết hợp hoàn hảo giữa phần cứng cấp doanh nghiệp và phần mềm tối ưu hoá độc quyền.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Server, title: 'Bare-Metal', desc: 'Sức mạnh thô không bị giới hạn bởi lớp ảo hóa cồng kềnh.' },
              { icon: Cpu, title: 'AMD EPYC™', desc: 'Vi xử lý mật độ cao mang lại hiệu năng đa luồng vượt trội.' },
              { icon: Globe, title: 'Global Network', desc: 'Định tuyến BGP thông minh kết nối liên tục không độ trễ.' },
              { icon: Shield, title: 'Zero-Trust', desc: 'Bảo mật đa lớp tích hợp sâu vào kiến trúc hạ tầng.' },
            ].map((feature, idx) => (
              <div key={idx} className="p-8 border border-white/10 bg-zinc-950/50 hover:bg-white hover:text-black transition-all duration-300 group">
                <feature.icon className="w-10 h-10 mb-6 text-white group-hover:text-black transition-colors" strokeWidth={1.5} />
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 group-hover:text-gray-600 text-sm leading-relaxed transition-colors">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-12 bg-white text-black text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">Sẵn sàng trải nghiệm sự khác biệt?</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Gia nhập cùng hàng ngàn kỹ sư và doanh nghiệp đang định hình lại tương lai với CloudHost.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 px-10 py-5 bg-black text-white font-bold text-lg hover:bg-gray-800 transition-colors"
          >
            Tạo tài khoản miễn phí <ArrowRight className="w-6 h-6" />
          </Link>
        </div>
      </section>
    </div>
  );
}
