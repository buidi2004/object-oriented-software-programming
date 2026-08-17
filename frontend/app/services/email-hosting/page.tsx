'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Mail, Shield, CheckCircle2, Zap, ArrowRight, 
  Server, Globe, Clock, Star, HelpCircle, ShoppingCart 
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';

export default function EmailHostingPage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const plans = [
    {
      id: 'email-10',
      name: 'Email Doanh Nghiệp 10',
      tagline: 'Phù hợp cho công ty khởi nghiệp & nhóm nhỏ',
      monthlyPrice: 99000,
      yearlyPrice: 79000 * 12,
      users: '10 Hòm thư riêng',
      storage: '10 GB Dung lượng SSD',
      features: [
        'Tên miền email riêng @tencongty.vn',
        'Anti-Spam & Virus AI bảo vệ 99.9%',
        'Webmail giao diện tiếng Việt siêu mượt',
        'Đồng bộ Outlook, iPhone, Android (IMAP/POP3)',
        'Bảo mật DKIM, SPF, DMARC chuẩn quốc tế',
        'Hỗ trợ kỹ thuật 24/7/365',
      ],
      badge: null,
      popular: false,
    },
    {
      id: 'email-50',
      name: 'Email Doanh Nghiệp 50',
      tagline: 'Lựa chọn phổ biến nhất cho doanh nghiệp vừa',
      monthlyPrice: 299000,
      yearlyPrice: 239000 * 12,
      users: '50 Hòm thư riêng',
      storage: '50 GB Dung lượng SSD NVMe',
      features: [
        'Tên miền email riêng @tencongty.vn',
        'Bộ lọc Spam AI chuyên sâu cao cấp',
        'IP uy tín cam kết 100% vào Inbox',
        'Hỗ trợ tạo bí danh Email (Alias) không giới hạn',
        'Sao lưu tự động hàng ngày (Daily Backup)',
        'Quản trị viên phân quyền hòm thư',
        'Hỗ trợ di chuyển dữ liệu email cũ miễn phí',
      ],
      badge: 'Phổ biến nhất',
      popular: true,
    },
    {
      id: 'email-unlimited',
      name: 'Email Doanh Nghiệp Pro',
      tagline: 'Không giới hạn tài khoản cho quy mô lớn',
      monthlyPrice: 699000,
      yearlyPrice: 559000 * 12,
      users: 'Không giới hạn tài khoản',
      storage: '200 GB Dung lượng SSD Enterprise',
      features: [
        'Không giới hạn số lượng hòm thư tạo mới',
        'IP gửi thư riêng (Dedicated IP) sạch 100%',
        'Gửi tối đa 50,000 email/ngày',
        'Hệ thống lưu trữ thư rác & audit log 1 năm',
        'Đội ngũ kỹ thuật hỗ trợ VIP 1-1 qua Telegram/Zalo',
        'Cam kết SLA 99.99% Uptime hoàn tiền',
      ],
      badge: 'Doanh nghiệp lớn',
      popular: false,
    },
  ];

  const handleOrder = async (plan: typeof plans[0]) => {
    const cycleMonths = billingCycle === 'yearly' ? 12 : 1;
    const price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
    await addItem(plan.id, cycleMonths, false, {
      name: `${plan.name} (${billingCycle === 'yearly' ? '12 Tháng' : '1 Tháng'})`,
      price: price,
      billingCycle: cycleMonths,
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(244,63,94,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-6">
            <Mail className="w-4 h-4 text-rose-400" />
            Email Doanh Nghiệp Theo Tên Miền Riêng
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight mb-6">
            Khẳng Định Uy Tín Thương Hiệu Với{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300">
              Email Doanh Nghiệp 100% Vào Inbox
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10">
            Hệ thống máy chủ gửi nhận thư chuyên dụng với IP sạch, bộ lọc Anti-Spam AI thông minh, bảo mật DKIM/SPF/DMARC chuẩn quốc tế.
          </p>

          {/* Billing Cycle Switch */}
          <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-800/80 backdrop-blur-md border border-slate-700">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Tháng
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Thanh Toán Theo Năm
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-extrabold uppercase">
                Tiết kiệm 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative -mt-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const displayPrice = billingCycle === 'yearly' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl bg-white p-8 border transition-all duration-300 flex flex-col justify-between ${
                  plan.popular
                    ? 'border-rose-500 shadow-2xl shadow-rose-500/10 scale-105 z-10 ring-2 ring-rose-500/20'
                    : 'border-slate-200 shadow-lg hover:shadow-xl hover:border-slate-300'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 text-white text-xs font-black uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                      <Mail className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-500 mb-6">{plan.tagline}</p>

                  <div className="mb-6 pb-6 border-b border-slate-100">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">
                        {displayPrice.toLocaleString('vi-VN')}
                      </span>
                      <span className="text-sm text-slate-500 font-medium">đ/tháng</span>
                    </div>
                    {billingCycle === 'yearly' && (
                      <p className="text-xs text-emerald-600 font-semibold mt-1">
                        Thanh toán {plan.yearlyPrice.toLocaleString('vi-VN')} đ/năm
                      </p>
                    )}
                  </div>

                  <div className="space-y-3 mb-8 text-sm">
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {plan.users}
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 text-slate-800 font-bold flex items-center gap-2">
                      <Server className="w-4 h-4 text-blue-500" />
                      {plan.storage}
                    </div>

                    <div className="pt-2 space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOrder(plan)}
                  className={`w-full py-3.5 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Đăng Ký Ngay
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="bg-white py-20 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">
              Tại Sao Nên Chọn Email Doanh Nghiệp CloudHost?
            </h2>
            <p className="text-sm text-slate-500">
              Giải pháp email ổn định, an toàn và bảo mật hàng đầu dành riêng cho doanh nghiệp tại Việt Nam.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-rose-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Bảo Vệ Anti-Spam AI</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ngăn chặn 99.9% thư rác, mã độc tống tiền và các cuộc tấn công lừa đảo qua email nhờ bộ lọc trí tuệ nhân tạo liên tục cập nhật.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Tỷ Lệ Vào Inbox 100%</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hệ sinh thái IP sạch với chứng thực SPF, DKIM, DMARC đầy đủ giúp thư gửi tới Gmail, Yahoo, Outlook không bao giờ bị rơi vào thư rác.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Hỗ Trợ Kỹ Thuật 24/7</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Đội ngũ chuyên gia hỗ trợ cài đặt DNS, di chuyển toàn bộ email cũ từ Google Workspace, Zoho hoặc cPanel sang miễn phí và an toàn.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
