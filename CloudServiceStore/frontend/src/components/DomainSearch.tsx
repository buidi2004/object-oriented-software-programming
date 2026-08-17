'use client';

import React, { useState } from 'react';
import { Search, Globe, CheckCircle2, ShoppingCart, Sparkles, AlertCircle } from 'lucide-react';
import { DOMAIN_EXTENSIONS } from '../data/mockData';
import { DomainResult } from '../types';
import confetti from 'canvas-confetti';

interface DomainSearchProps {
  onAddToCart: (item: {
    id: string;
    type: 'domain';
    title: string;
    details: string;
    price: number;
    billingCycle: string;
  }) => void;
}

export const DomainSearch: React.FC<DomainSearchProps> = ({ onAddToCart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<{ domain: string; ext: string; available: boolean; price: number } | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchResult(null);

    // Clean input domain name
    let cleanName = searchTerm.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '');
    let ext = '.vn';
    
    if (cleanName.includes('.')) {
      const parts = cleanName.split('.');
      cleanName = parts[0];
      ext = '.' + parts.slice(1).join('.');
    }

    setTimeout(() => {
      const matched = DOMAIN_EXTENSIONS.find(d => d.extension === ext) || DOMAIN_EXTENSIONS[0];
      const isAvailable = cleanName.length > 2;
      
      setSearchResult({
        domain: cleanName + matched.extension,
        ext: matched.extension,
        available: isAvailable,
        price: matched.pricePerYear
      });
      setIsSearching(false);

      if (isAvailable) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    }, 600);
  };

  const handleRegisterDomain = (domainName: string, price: number) => {
    onAddToCart({
      id: `domain-${domainName}-${Date.now()}`,
      type: 'domain',
      title: `Tên miền ${domainName}`,
      details: 'Đăng ký mới 1 năm + Bảo vệ Privacy miễn phí',
      price: price,
      billingCycle: '1 năm'
    });
  };

  return (
    <section id="domain-search-section" className="py-12 bg-white/60 backdrop-blur-md border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            Kiểm tra Tên miền
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tìm kiếm tên miền thương hiệu hoàn hảo cho bạn
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Tra cứu khởi tạo ngay lập tức. Miễn phí quản lý DNS & Bảo vệ thông tin WHOIS Privacy.
          </p>
          <a href="/services/domain" className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
            Xem bảng giá đầy đủ tất cả đuôi tên miền →
          </a>
        </div>

        {/* Domain Search Form */}
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSearch} className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl sm:rounded-full shadow-xl shadow-blue-500/10 border border-slate-200">
            <div className="relative flex-1 flex items-center pl-4">
              <Search className="w-5 h-5 text-slate-400 mr-2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nhập tên miền bạn muốn đăng ký (VD: mycompany.vn, tech.com)..."
                className="w-full bg-transparent border-none text-slate-900 font-medium text-base focus:outline-none placeholder:text-slate-400 py-3"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-3.5 rounded-xl sm:rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-base transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
            >
              {isSearching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Đang tra cứu...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Tra cứu</span>
                </>
              )}
            </button>
          </form>

          {/* Search Result Box */}
          {searchResult && (
            <div className={`mt-6 p-5 rounded-2xl border transition-all animate-in fade-in duration-300 ${
              searchResult.available 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {searchResult.available ? (
                    <div className="p-2.5 rounded-xl bg-emerald-500 text-white shadow-md">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl bg-rose-500 text-white shadow-md">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                  )}
                  <div>
                    <div className="text-xl font-black">{searchResult.domain}</div>
                    <div className="text-xs font-semibold opacity-80">
                      {searchResult.available 
                        ? 'Chúc mừng! Tên miền này chưa có người đăng ký' 
                        : 'Rất tiếc! Tên miền này đã có chủ sở hữu'}
                    </div>
                  </div>
                </div>

                {searchResult.available && (
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-700">
                        {searchResult.price.toLocaleString('vi-VN')} đ
                        <span className="text-xs font-semibold text-slate-500">/năm</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRegisterDomain(searchResult.domain, searchResult.price)}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Thêm vào giỏ
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Extension Cards Grid */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {DOMAIN_EXTENSIONS.map((item) => (
              <div
                key={item.extension}
                className={`p-4 rounded-2xl border text-center transition-all bg-white hover:border-blue-300 hover:shadow-md relative overflow-hidden ${
                  item.isPopular ? 'border-blue-200 ring-2 ring-blue-500/10' : 'border-slate-200/80'
                }`}
              >
                {item.featuredText && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black px-2 py-0.5 rounded-bl-lg">
                    {item.featuredText}
                  </span>
                )}
                <div className="text-xl font-black text-slate-900">{item.extension}</div>
                <div className="text-sm font-extrabold text-blue-600 mt-1">
                  {item.pricePerYear.toLocaleString('vi-VN')} đ
                  <span className="text-[10px] font-semibold text-slate-400">/năm</span>
                </div>
                {item.originalPrice && (
                  <div className="text-[11px] text-slate-400 line-through">
                    {item.originalPrice.toLocaleString('vi-VN')} đ
                  </div>
                )}
                <button
                  onClick={() => handleRegisterDomain(`mybrand${item.extension}`, item.pricePerYear)}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  Đăng ký
                </button>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
};
