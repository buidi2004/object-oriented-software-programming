import React from 'react';
import { notFound } from 'next/navigation';
import { Header } from '@/src/components/Header';
import { Footer } from '@/src/components/Footer';
import Link from 'next/link';
import { 
  ArrowRight, Shield, Zap, Server, Code, Users, 
  Settings, Building2, Globe, Database, Lock, Cpu, ArrowLeftRight
} from 'lucide-react';

const solutionsData: Record<string, any> = {
  'student': {
    title: 'Giải pháp Đám mây cho Sinh viên & Thực tập sinh',
    subtitle: 'Khởi đầu hành trình công nghệ với chi phí tối ưu nhất',
    description: 'CloudHost cung cấp hệ sinh thái dành riêng cho sinh viên với giá cả phải chăng, dễ dàng mở rộng và hỗ trợ đầy đủ các công cụ để bạn hoàn thành xuất sắc đồ án, bài tập lớn hay các dự án cá nhân.',
    heroImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=2000&q=80',
    color: 'amber',
    benefits: [
      { icon: Code, title: 'Hỗ trợ 1-Click Apps', desc: 'Cài đặt WordPress, Node.js, Python, Docker chỉ với một cú click chuột.' },
      { icon: Zap, title: 'Chi phí sinh viên', desc: 'Giảm giá lên đến 50% cho sinh viên, giá chỉ từ 49k/tháng.' },
      { icon: Shield, title: 'An toàn dữ liệu', desc: 'Hệ thống sao lưu tự động hàng tuần, an toàn tuyệt đối cho đồ án.' },
    ],
    relatedServices: [
      { title: 'Cloud VPS Cơ Bản', desc: 'Lựa chọn tốt nhất để chạy web và ứng dụng nhẹ.', link: '/services/cloud-vps' },
      { title: 'Web Hosting', desc: 'Hosting cPanel dễ sử dụng, hoàn hảo cho đồ án PHP.', link: '/services/hosting' },
    ]
  },
  'sme': {
    title: 'Hạ tầng Số dành cho Doanh nghiệp SME',
    subtitle: 'Phát triển kinh doanh với hạ tầng linh hoạt và tiết kiệm',
    description: 'Đối với các doanh nghiệp vừa và nhỏ, việc tối ưu chi phí hạ tầng nhưng vẫn đảm bảo hiệu năng và độ ổn định là chìa khóa thành công. Giải pháp của chúng tôi giúp bạn tập trung vào kinh doanh thay vì lo lắng về kỹ thuật.',
    heroImage: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=2000&q=80',
    color: 'blue',
    benefits: [
      { icon: Building2, title: 'Mở rộng linh hoạt', desc: 'Dễ dàng nâng cấp tài nguyên theo sự phát triển của doanh nghiệp.' },
      { icon: Users, title: 'Hỗ trợ kỹ thuật 24/7', desc: 'Đội ngũ chuyên gia luôn sẵn sàng giải quyết mọi vấn đề kỹ thuật.' },
      { icon: Shield, title: 'Bảo mật cấp doanh nghiệp', desc: 'Bảo vệ dữ liệu khách hàng với chứng chỉ SSL và tường lửa WAF.' },
    ],
    relatedServices: [
      { title: 'Cloud Server Doanh Nghiệp', desc: 'Hiệu năng cao, đảm bảo tài nguyên độc lập 100%.', link: '/services/cloud-vps' },
      { title: 'Managed Database', desc: 'Quản trị cơ sở dữ liệu an toàn, sao lưu tự động.', link: '/services/databases' },
    ]
  },
  'enterprise': {
    title: 'Giải pháp Enterprise Đám mây Toàn diện',
    subtitle: 'Hạ tầng độc lập, bảo mật tối đa và sẵn sàng 99.99%',
    description: 'Được thiết kế cho các tập đoàn và hệ thống lõi yêu cầu khả năng chịu tải cực lớn, độ ổn định tuyệt đối và tiêu chuẩn bảo mật khắt khe nhất.',
    heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
    color: 'slate',
    benefits: [
      { icon: Server, title: 'Tài nguyên chuyên biệt', desc: 'Hạ tầng Dedicated độc lập hoàn toàn, không chia sẻ tài nguyên.' },
      { icon: Globe, title: 'Sẵn sàng 99.99%', desc: 'Cơ chế High Availability (HA) đảm bảo hệ thống không bao giờ gián đoạn.' },
      { icon: Lock, title: 'Bảo mật & Tuân thủ', desc: 'Đạt chuẩn ISO, PCI-DSS, tích hợp các lớp tường lửa mạng tiên tiến.' },
    ],
    relatedServices: [
      { title: 'Dedicated Server', desc: 'Máy chủ vật lý dành riêng với sức mạnh xử lý tuyệt đối.', link: '/services/dedicated-servers' },
      { title: 'Object Storage (S3)', desc: 'Lưu trữ không giới hạn với độ bền dữ liệu 99.999999999%.', link: '/services/storage' },
    ]
  },
  'ecommerce': {
    title: 'Hạ tầng Tối ưu Thương mại Điện tử',
    subtitle: 'Đảm bảo tốc độ nhanh nhất cho hàng triệu lượt truy cập',
    description: 'Thương mại điện tử đòi hỏi hệ thống phải xử lý lượng truy cập tăng vọt trong các dịp Flash Sale. Giải pháp của chúng tôi với kiến trúc cân bằng tải và Auto-scaling giúp website luôn ổn định.',
    heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=2000&q=80',
    color: 'pink',
    benefits: [
      { icon: Zap, title: 'Cân bằng tải & Auto-scaling', desc: 'Tự động mở rộng máy chủ khi lưu lượng tăng đột biến.' },
      { icon: Globe, title: 'Tối ưu tốc độ (CDN)', desc: 'Tích hợp bộ nhớ đệm giúp tải trang dưới 1 giây ở mọi nơi.' },
      { icon: Shield, title: 'Bảo vệ thanh toán', desc: 'Tuân thủ bảo mật khắt khe để chống gian lận và đánh cắp thẻ.' },
    ],
    relatedServices: [
      { title: 'Cloud VPS High Performance', desc: 'Máy chủ hiệu năng cao đáp ứng truy xuất nhanh.', link: '/services/cloud-vps' },
      { title: 'Chứng chỉ SSL Cao cấp', desc: 'Bảo vệ dữ liệu khách hàng và tăng uy tín thương hiệu.', link: '/services/ssl-certificates' },
    ]
  },
  'gaming': {
    title: 'Hạ tầng Game Server Đỉnh cao',
    subtitle: 'Máy chủ Low-ping, hiệu năng CPU xung nhịp cao',
    description: 'Game thủ cần kết nối ổn định và ping thấp. Giải pháp hạ tầng Game Studio của chúng tôi tập trung vào sức mạnh xử lý của CPU và khả năng chống DDoS băng thông lớn.',
    heroImage: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=2000&q=80',
    color: 'purple',
    benefits: [
      { icon: Server, title: 'CPU Xung nhịp cao', desc: 'Sử dụng vi xử lý thế hệ mới nhất, đạt trên 4.5GHz cho Game Server.' },
      { icon: Shield, title: 'Chống DDoS Game 500Gbps', desc: 'Bảo vệ máy chủ khỏi các cuộc tấn công Layer 3/4/7.' },
      { icon: Globe, title: 'Mạng Low-ping', desc: 'Đường truyền Tier-1 tối ưu routing đến tất cả các nhà mạng VN.' },
    ],
    relatedServices: [
      { title: 'Game Servers Chuyên Dụng', desc: 'Minecraft, CS:GO, FiveM... cấu hình sẵn trong 1 click.', link: '/services/game-servers' },
      { title: 'Dedicated Server', desc: 'Máy chủ vật lý độc lập cho các cụm server game lớn.', link: '/services/dedicated-servers' },
    ]
  },
  'agency': {
    title: 'Giải pháp cho Agency & Developer',
    subtitle: 'Tăng tốc quy trình phát triển và bàn giao dự án',
    description: 'Thời gian là tiền bạc. Giải pháp dành cho Agency giúp bạn dễ dàng quản lý hàng chục dự án của khách hàng trên cùng một nền tảng với các công cụ triển khai tự động.',
    heroImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80',
    color: 'green',
    benefits: [
      { icon: Cpu, title: 'Môi trường CI/CD', desc: 'Tích hợp sẵn công cụ deploy tự động từ GitHub, GitLab.' },
      { icon: Code, title: '1-Click Staging', desc: 'Tạo môi trường test tức thì trước khi lên production.' },
      { icon: Settings, title: 'API & Quản trị', desc: 'Hỗ trợ API đầy đủ giúp tự động hóa quản lý hạ tầng.' },
    ],
    relatedServices: [
      { title: '1-Click Apps', desc: 'Hệ sinh thái ứng dụng cài đặt sẵn (WordPress, LAMP, LEMP).', link: '/apps' },
      { title: 'Tên Miền (DNS)', desc: 'Quản trị tập trung tên miền của tất cả khách hàng.', link: '/domains' },
    ]
  },
  'migration': {
    title: 'Giải pháp Dịch chuyển Cloud Migration',
    subtitle: 'Chuyển đổi dữ liệu lên mây an toàn, không gián đoạn',
    description: 'Chuyển đổi hệ thống từ On-premise hoặc từ nhà cung cấp khác sang CloudHost một cách mượt mà nhất. Chúng tôi hỗ trợ miễn phí quá trình này cho bạn.',
    heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
    color: 'orange',
    benefits: [
      { icon: ArrowLeftRight, title: 'Dịch chuyển Miễn phí', desc: 'Đội ngũ chuyên gia thực hiện toàn bộ quá trình chuyển đổi.' },
      { icon: Zap, title: 'Zero Downtime', desc: 'Đảm bảo ứng dụng vẫn hoạt động bình thường khi chuyển data.' },
      { icon: Database, title: 'Toàn vẹn Dữ liệu', desc: 'Kiểm tra và đối chiếu dữ liệu 100% sau khi chuyển đổi.' },
    ],
    relatedServices: [
      { title: 'Dịch vụ Migration', desc: 'Xem chi tiết quy trình chuyển đổi lên CloudHost.', link: '/services/migrations' },
      { title: 'Dedicated Server', desc: 'Môi trường đích lý tưởng cho hệ thống lớn.', link: '/services/dedicated-servers' },
    ]
  },
  'security': {
    title: 'Giải pháp Bảo mật & Tuân thủ',
    subtitle: 'Bảo vệ toàn diện trước mọi rủi ro an ninh mạng',
    description: 'Bảo mật không chỉ là phần mềm, mà là kiến trúc. Chúng tôi cung cấp giải pháp bảo vệ dữ liệu toàn diện nhiều lớp từ mạng vật lý đến mức ứng dụng.',
    heroImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2000&q=80',
    color: 'red',
    benefits: [
      { icon: Shield, title: 'Tường lửa WAF L7', desc: 'Chống tấn công SQL Injection, XSS, và các lỗ hổng OWASP.' },
      { icon: Lock, title: 'Mã hóa dữ liệu', desc: 'Dữ liệu luôn được mã hóa (At-rest & In-transit) chuẩn AES-256.' },
      { icon: Shield, title: 'Anti-DDoS Tự động', desc: 'Phát hiện và giảm nhẹ tấn công DDoS trong tích tắc.' },
    ],
    relatedServices: [
      { title: 'Bảo mật Hệ thống (Security)', desc: 'Tổng hợp các dịch vụ bảo mật mạnh mẽ nhất.', link: '/services/security' },
      { title: 'Chứng chỉ SSL', desc: 'Kết nối mã hóa an toàn cho website của bạn.', link: '/services/ssl-certificates' },
    ]
  },
};

const bgColors: Record<string, string> = {
  amber: 'bg-amber-50',
  blue: 'bg-blue-50',
  slate: 'bg-slate-50',
  pink: 'bg-pink-50',
  purple: 'bg-purple-50',
  green: 'bg-emerald-50',
  orange: 'bg-orange-50',
  red: 'bg-red-50',
};

const textColors: Record<string, string> = {
  amber: 'text-amber-600',
  blue: 'text-blue-600',
  slate: 'text-slate-600',
  pink: 'text-pink-600',
  purple: 'text-purple-600',
  green: 'text-emerald-600',
  orange: 'text-orange-600',
  red: 'text-red-600',
};

export default async function SolutionDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const data = solutionsData[resolvedParams.slug];

  if (!data) {
    notFound();
  }

  const bgColor = bgColors[data.color] || 'bg-blue-50';
  const textColor = textColors[data.color] || 'text-blue-600';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />
      
      <main className="flex-grow pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
            <Link href="/" className="hover:text-black">Trang chủ</Link>
            <span>/</span>
            <span className="text-slate-800 font-medium">Giải pháp</span>
            <span>/</span>
            <span className="text-[#d09e2b] font-medium">{data.title}</span>
          </div>

          {/* Hero Section */}
          <div className={`rounded-3xl ${bgColor} border border-slate-200/60 overflow-hidden mb-12 shadow-sm relative`}>
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 pointer-events-none" 
                 style={{ 
                   background: 'radial-gradient(circle at top right, rgba(208, 158, 43, 0.4), transparent 60%)' 
                 }}
            />
            
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="p-8 md:p-12 z-10">
                <span className={`inline-block px-3 py-1 rounded-full bg-white/60 backdrop-blur border border-white font-bold text-xs ${textColor} mb-4 uppercase tracking-wider`}>
                  Giải Pháp Chuyên Biệt
                </span>
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight mb-4">
                  {data.title}
                </h1>
                <p className="text-lg text-slate-700 font-medium mb-6">
                  {data.subtitle}
                </p>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {data.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/pricing" className="px-6 py-3 bg-[#1F1F1F] text-white font-bold rounded-lg hover:bg-black transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 duration-200">
                    Xem Bảng Giá
                  </Link>
                  <Link href="/contact" className="px-6 py-3 bg-white text-slate-800 font-bold rounded-lg border border-slate-200 hover:border-[#d09e2b] hover:text-[#d09e2b] transition-colors">
                    Liên hệ Tư vấn
                  </Link>
                </div>
              </div>
              
              <div className="h-[300px] md:h-full relative overflow-hidden hidden md:block">
                <img 
                  src={data.heroImage} 
                  alt={data.title} 
                  className="absolute inset-0 w-full h-full object-cover rounded-l-3xl shadow-[-10px_0_30px_rgba(0,0,0,0.1)]"
                />
              </div>
            </div>
          </div>

          {/* Core Benefits */}
          <div className="mb-16">
            <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Giá trị cốt lõi của giải pháp</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {data.benefits.map((benefit: any, idx: number) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
                    <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${textColor}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-3">{benefit.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{benefit.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Related Services */}
          <div className="bg-slate-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#d09e2b]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black mb-2 text-[#d09e2b]">Dịch vụ đề xuất cho cấu hình này</h2>
              <p className="text-slate-400 mb-8 max-w-2xl">Dựa trên giải pháp này, chúng tôi khuyên bạn nên sử dụng các dịch vụ bên dưới để đạt được hiệu suất và độ tin cậy tốt nhất.</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {data.relatedServices.map((service: any, idx: number) => (
                  <Link 
                    key={idx}
                    href={service.link}
                    className="flex items-center justify-between p-6 rounded-xl bg-slate-800/50 border border-slate-700 hover:bg-slate-800 hover:border-slate-600 transition-colors group"
                  >
                    <div>
                      <h4 className="font-bold text-lg text-white mb-1 group-hover:text-[#d09e2b] transition-colors">{service.title}</h4>
                      <p className="text-slate-400 text-sm">{service.desc}</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-[#d09e2b] transition-colors translate-x-0 group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
