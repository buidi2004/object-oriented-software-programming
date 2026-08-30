'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, DollarSign, Globe, PieChart, Shield, Zap } from 'lucide-react';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useUIStore } from '../../src/store/useUIStore';
import { api } from '../../src/lib/api';

export default function PartnersPage() {
  const { user } = useAuthStore();
  const { setAuthModal } = useUIStore();
  const [companyName, setCompanyName] = useState('');
  const [commissionRate, setCommissionRate] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthModal(true, 'register');
      return;
    }

    if (!companyName.trim()) {
      setErrorMessage('Vui lòng nhập tên công ty/tổ chức.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.post('/affiliate-applications', {
        companyName,
        commissionRate: Number(commissionRate)
      });
      setSuccessMessage('Đăng ký thành công! Đơn đăng ký của bạn đang được xem xét.');
      setCompanyName('');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 403) {
        setErrorMessage('Tài khoản của bạn không có quyền thực hiện yêu cầu này (Cần quyền Customer).');
      } else {
        setErrorMessage(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden px-6 lg:px-12 border-b border-white/10">
        <div className="absolute top-0 right-0 w-1/2 h-full hidden lg:block opacity-80">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
            alt="Data Analysis" 
            className="w-full h-full object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/20 bg-white/5 backdrop-blur-md mb-8">
              <span className="text-xs font-semibold tracking-widest uppercase text-gray-300">Affiliate Program</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-[1.1]">
              Hợp Tác Cùng <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600">
                CloudHost.
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-10 leading-relaxed">
              Trở thành đối tác phân phối giải pháp hạ tầng điện toán đám mây. Nhận hoa hồng lên đến 30% cho mỗi giao dịch thành công. Cơ hội gia tăng doanh thu bền vững.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#register-form" className="px-8 py-4 bg-white text-black font-bold rounded-none hover:bg-gray-200 transition-colors flex items-center gap-2">
                Trở thành đối tác <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          {/* Mobile colorful image (hidden on desktop because it's in background) */}
          <div className="w-full aspect-video relative lg:hidden mt-10 rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
              alt="Data" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Benefits Section (White background) */}
      <section className="py-24 px-6 lg:px-12 bg-white text-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Tại sao nên hợp tác với chúng tôi?</h2>
            <p className="text-gray-600 text-lg max-w-3xl mx-auto">
              Chương trình Đối tác của CloudHost được thiết kế để mang lại giá trị thiết thực và lợi nhuận dài hạn cho bạn, với nền tảng công nghệ mạnh mẽ hỗ trợ đằng sau.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: DollarSign, 
                title: 'Hoa hồng hấp dẫn', 
                desc: 'Nhận mức chia sẻ doanh thu từ 15% đến 30% cho tất cả các dịch vụ được đăng ký qua liên kết của bạn. Thanh toán tự động hàng tháng.' 
              },
              { 
                icon: PieChart, 
                title: 'Theo dõi minh bạch', 
                desc: 'Hệ thống dashboard chuyên biệt cung cấp báo cáo theo thời gian thực về lượt click, tỷ lệ chuyển đổi và doanh thu phát sinh.' 
              },
              { 
                icon: Shield, 
                title: 'Thương hiệu uy tín', 
                desc: 'Sản phẩm chất lượng cao với cam kết Uptime 99.99%. Giúp bạn tự tin giới thiệu đến mạng lưới khách hàng của mình.' 
              },
            ].map((benefit, idx) => (
              <div key={idx} className="p-8 border-2 border-gray-100 bg-gray-50 hover:border-black transition-colors rounded-xl group">
                <div className="w-14 h-14 bg-black text-white rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{benefit.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detail Section with Colored Image */}
      <section className="py-24 px-6 lg:px-12 bg-zinc-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop" 
              alt="Team Collaboration" 
              className="w-full h-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="order-1 md:order-2">
            <h2 className="text-3xl md:text-5xl font-black mb-8 leading-tight">Đội ngũ hỗ trợ đối tác chuyên biệt.</h2>
            <div className="space-y-6">
              {[
                'Tài liệu Marketing và bộ nhận diện thương hiệu sẵn có.',
                'Đào tạo kiến thức kỹ thuật về hệ thống Cloud / VPS.',
                'Hỗ trợ kỹ thuật ưu tiên cho khách hàng của bạn 24/7.',
                'Công cụ tạo mã giảm giá (Coupon) tùy chỉnh.'
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-6 h-6 mt-1 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                  <p className="text-gray-300 text-lg">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form Section */}
      <section id="register-form" className="py-24 px-6 lg:px-12 bg-white text-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black mb-4">Đăng Ký Trở Thành Đối Tác</h2>
            <p className="text-gray-600">Vui lòng điền thông tin bên dưới để gửi yêu cầu tham gia chương trình Affiliate.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm">
            {successMessage ? (
              <div className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-green-800">Tuyệt vời!</h3>
                <p className="text-green-700 text-lg mb-8">{successMessage}</p>
                <button 
                  onClick={() => setSuccessMessage('')}
                  className="px-6 py-3 bg-black text-white font-bold rounded hover:bg-gray-800 transition-colors"
                >
                  Gửi yêu cầu khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {!user && (
                  <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="font-semibold block">Bạn chưa đăng nhập</span>
                      <span className="text-sm">Vui lòng đăng nhập để gửi yêu cầu đối tác.</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => { setAuthModal(true, 'login');  }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded hover:bg-blue-700 transition"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                )}

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm font-medium">
                    {errorMessage}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Tên Công Ty / Tổ Chức / Cá Nhân *</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Nhập tên tổ chức của bạn"
                    disabled={!user || isLoading}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mức Hoa Hồng Mong Muốn (%) *</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      min="1" 
                      max="100"
                      value={commissionRate}
                      onChange={(e) => setCommissionRate(Number(e.target.value))}
                      disabled={!user || isLoading}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-black outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 font-bold bg-gray-100 border-l border-gray-300 rounded-r-lg">
                      %
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Mức hoa hồng cơ bản thường từ 15-30% tùy theo sản phẩm.</p>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    disabled={!user || isLoading}
                    className="w-full py-4 bg-black text-white font-bold text-lg rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      'Gửi Yêu Cầu Đăng Ký'
                    )}
                  </button>
                </div>
                
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
