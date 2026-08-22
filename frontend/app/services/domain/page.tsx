'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search, Globe, Shield, Zap, Cloud, CheckCircle2, Star, ShoppingCart, ArrowRight
} from 'lucide-react';
import CategoryPricingGrid from '@/components/CategoryPricingGrid';
import { Header } from '@/src/components/Header';
import ServicePageSections from '@/src/components/service-landing/ServicePageSections';
import { SERVICE_PAGE_CONTENT } from '@/src/data/servicePages';

const initialDomains = [
  { ext: '.com', price: 290000, originalPrice: 350000, desc: 'Phổ biến nhất thế giới', isPopular: true },
  { ext: '.vn', price: 750000, originalPrice: 850000, desc: 'Uy tín Thương hiệu Việt', isPopular: true },
  { ext: '.net', price: 320000, originalPrice: 380000, desc: 'Cho doanh nghiệp mạng' },
  { ext: '.com.vn', price: 650000, originalPrice: 720000, desc: 'Doanh nghiệp Việt Nam' },
  { ext: '.org', price: 310000, originalPrice: 360000, desc: 'Tổ chức phi lợi nhuận' },
  { ext: '.info', price: 190000, originalPrice: 280000, desc: 'Website thông tin' },
  { ext: '.ai', price: 1850000, desc: 'Công nghệ AI & Startup', isPopular: true },
  { ext: '.xyz', price: 99000, originalPrice: 250000, desc: 'Sáng tạo & hiện đại' },
  { ext: '.dev', price: 450000, desc: 'Dành cho Developer' },
  { ext: '.io', price: 1200000, desc: 'Startup công nghệ' },
  { ext: '.store', price: 180000, originalPrice: 350000, desc: 'Cửa hàng trực tuyến' },
  { ext: '.app', price: 520000, desc: 'Ứng dụng di động' },
];

const PROCESS_STEPS = [
  { step: '1', title: 'Tìm kiếm tên miền', desc: 'Nhập tên miền bạn muốn vào ô tìm kiếm để kiểm tra tình trạng.' },
  { step: '2', title: 'Chọn đuôi tên miền', desc: 'Chọn đuôi phù hợp: .com, .vn, .net hoặc hàng trăm đuôi khác.' },
  { step: '3', title: 'Thanh toán & Kích hoạt', desc: 'Thanh toán nhanh chóng qua VNPay, MoMo hoặc chuyển khoản.' },
  { step: '4', title: 'Quản lý DNS', desc: 'Trỏ tên miền về hosting/VPS với công cụ DNS quản lý miễn phí.' },
];


export default function DomainPage() {
  const [domainPricing, setDomainPricing] = useState(initialDomains);
  useEffect(() => {
    import('@/src/lib/api').then(({ api }) => {
      api.get('/categories/ten-mien/plans').then(res => {
        const dbPlans = res.data?.plans || [];
        if (dbPlans.length > 0) {
          setDomainPricing(prev => prev.map(d => {
            const extUpper = d.ext.toUpperCase();
            const dbP = dbPlans.find((p: any) => p.name.toUpperCase().includes(extUpper));
            if (dbP) {
              return {
                ...d,
                price: dbP.yearlyPrice || dbP.monthlyPrice
              };
            }
            return d;
          }));
        }
      });
    });
  }, []);

  const pageContent = SERVICE_PAGE_CONTENT.domain;
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ domain: string; available: boolean; price: number } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    setIsSearching(true);
    setSearchResult(null);

    setTimeout(() => {
      const cleanName = searchTerm.replace(/\.[^.]+$/, '').trim();
      setSearchResult({
        domain: cleanName + '.com',
        available: Math.random() > 0.3,
        price: 290000,
      });
      setIsSearching(false);
    }, 1200);
  };

  return (
    <div>

      {/* Hero with Search */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-950 via-teal-950 to-slate-900 text-slate-900 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <nav className="flex items-center gap-2 text-sm text-slate-700 mb-8">
            <Link href="/" className="hover:text-slate-900">Trang chủ</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-slate-900">Dịch vụ</Link>
            <span>/</span>
            <span className="text-slate-900 font-medium">Tên Miền</span>
          </nav>
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
              <Globe className="w-3.5 h-3.5" />
              Đăng Ký Tên Miền
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight mb-6 leading-tight">
              Tìm Kiếm & Đăng Ký
              <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent"> Tên Miền</span>
            </h1>
            <p className="text-lg text-slate-700 max-w-2xl mx-auto mb-10">
              Sở hữu tên miền hoàn hảo cho thương hiệu của bạn. Hỗ trợ .com, .vn, .net, .ai và hàng trăm đuôi khác.
            </p>

            {/* Search Box */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="flex bg-white rounded-md p-2 shadow-2xl shadow-black/20">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-5 h-5 text-slate-600 shrink-0" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nhập tên miền bạn muốn tìm..."
                    className="w-full py-3 text-slate-900 text-base font-medium focus:outline-none bg-transparent"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSearching}
                  className="px-8 py-3.5 rounded bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-900 font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Tìm Kiếm
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Search Result */}
            {searchResult && (
              <div className="max-w-2xl mx-auto mt-6">
                <div className={`rounded-md p-5 ${searchResult.available ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-rose-500/20 border border-rose-400/30'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {searchResult.available ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <Shield className="w-6 h-6 text-rose-400" />
                      )}
                      <div className="text-left">
                        <p className="font-bold text-slate-900 text-lg">{searchResult.domain}</p>
                        <p className="text-sm text-slate-700">
                          {searchResult.available ? 'Tên miền có sẵn!' : 'Tên miền đã được đăng ký'}
                        </p>
                      </div>
                    </div>
                    {searchResult.available && (
                      <div className="text-right">
                        <p className="text-xl font-black text-emerald-400">{searchResult.price.toLocaleString('vi-VN')} đ/năm</p>
                        <Link href="/" className="inline-flex items-center gap-1 text-sm font-bold text-slate-900 hover:text-slate-700 mt-1">
                          <ShoppingCart className="w-4 h-4" /> Đăng ký ngay
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <ServicePageSections content={pageContent} group="pre" />

      {/* Domain Pricing Table */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Bảng Giá Tên Miền</h2>
            <p className="text-slate-600">Giá đăng ký năm đầu tiên — gia hạn theo giá thị trường</p>
          </div>

          <div className="mb-12">
            <h3 className="text-xl font-bold text-slate-900 text-center mb-6">Gói đăng ký phổ biến</h3>
            <CategoryPricingGrid
              categorySlug="ten-mien"
              isYearly={true}
              popularIndex={0}
              accentClass="border-cyan-400 shadow-xl shadow-cyan-500/10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {domainPricing.map((d, i) => (
              <div key={i} className={`rounded-md p-6 border-2 transition-all hover:shadow-lg ${
                d.isPopular ? 'border-cyan-400 bg-cyan-50/50 shadow-md' : 'border-slate-200 bg-white hover:border-cyan-300'
              }`}>
                {d.isPopular && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-100 text-[#1F1F1F] text-[10px] font-bold uppercase mb-2">
                    <Star className="w-3 h-3" /> Phổ biến
                  </div>
                )}
                <div className="text-2xl font-black text-slate-900 mb-1">{d.ext}</div>
                <p className="text-xs text-slate-600 mb-3">{d.desc}</p>
                <div className="flex items-end gap-2 mb-4">
                  <span className="text-xl font-black text-[#1F1F1F]">{d.price.toLocaleString('vi-VN')} đ</span>
                  {d.originalPrice && (
                    <span className="text-sm text-slate-600 line-through">{d.originalPrice.toLocaleString('vi-VN')} đ</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 mb-4">/năm đầu tiên</div>
                <Link href="/" className="block w-full py-2.5 rounded bg-white text-slate-900 text-sm font-bold text-center hover:bg-slate-100 transition-colors">
                  Đăng Ký
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Process */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Quy Trình Đăng Ký</h2>
            <p className="text-slate-600">Chỉ mất vài phút để sở hữu tên miền</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {PROCESS_STEPS.map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-14 h-14 rounded-md bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-900 font-black text-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {s.step}
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-600">{s.desc}</p>
                {i < PROCESS_STEPS.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-7 -right-3 w-6 h-6 text-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Included Features */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Bao Gồm Miễn Phí</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'DNS Management', desc: 'Quản lý DNS hoàn toàn miễn phí với giao diện trực quan' },
              { title: 'WHOIS Privacy', desc: 'Bảo vệ thông tin cá nhân trên cơ sở dữ liệu WHOIS' },
              { title: 'Email Forwarding', desc: 'Chuyển tiếp email theo tên miền miễn phí' },
              { title: 'Domain Lock', desc: 'Khóa tên miền chống chuyển trái phép' },
              { title: 'Auto-Renew', desc: 'Tự động gia hạn trước khi hết hạn' },
              { title: 'Hỗ trợ 24/7', desc: 'Đội ngũ kỹ thuật hỗ trợ xuyên suốt' },
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-md border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{f.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicePageSections content={pageContent} group="post" />

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-cyan-600 to-emerald-600 text-slate-900 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-black mb-4">Sở Hữu Tên Miền Ngay Hôm Nay</h2>
          <p className="text-slate-700 mb-8">Mức giá đăng ký siêu rẻ. Bao gồm DNS, WHOIS Privacy miễn phí.</p>
          <a href="#top" className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-white text-[#1F1F1F] font-bold shadow-xl hover:shadow-2xl transition-all">
            <Search className="w-5 h-5" />
            Tìm Tên Miền
          </a>
        </div>
      </section>

      <footer className="bg-white text-slate-600 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          © 2024 CloudHost VN. Mọi quyền được bảo lưu.
        </div>
      </footer>
    </div>
  );
}
