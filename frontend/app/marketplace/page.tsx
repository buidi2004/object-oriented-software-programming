'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, Shield, Zap, Search, CheckCircle2, 
  ArrowRight, Key, Server, Globe, Star, ShoppingCart 
} from 'lucide-react';
import { useCartStore } from '@/src/store/useCartStore';

export default function MarketplacePage() {
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const products = [
    {
      id: 'lic-cpanel-vps',
      name: 'Bản Quyền cPanel VPS (1 Account)',
      category: 'control-panel',
      description: 'Bảng điều khiển máy chủ phổ biến và ổn định nhất thế giới, tích hợp đầy đủ Webmail, MySQL, DNS.',
      price: 299000,
      billingCycle: 'Monthly',
      icon: '🟠',
      vendor: 'cPanel Inc.',
      features: ['Hỗ trợ 1 cPanel Account', 'Cập nhật tự động phiên bản mới', 'Kích hoạt qua IP tức thì'],
    },
    {
      id: 'lic-directadmin',
      name: 'Bản Quyền DirectAdmin Pro Unlimited',
      category: 'control-panel',
      description: 'Bảng điều khiển máy chủ tối ưu hiệu năng cực nhẹ, hỗ trợ không giới hạn tài khoản con.',
      price: 199000,
      billingCycle: 'Monthly',
      icon: '🔵',
      vendor: 'JBMC Software',
      features: ['Không giới hạn Account', 'Giao diện Evolution Skin hiện đại', 'Cài đặt Nginx/LiteSpeed mượt mà'],
    },
    {
      id: 'lic-litespeed-2w',
      name: 'LiteSpeed Web Server Enterprise (2 Worker)',
      category: 'web-server',
      description: 'Máy chủ Web hiệu năng đỉnh cao, thay thế Apache hoàn hảo và tăng tốc độ xử lý PHP x5 lần.',
      price: 450000,
      billingCycle: 'Monthly',
      icon: '⚡',
      vendor: 'LiteSpeed Tech',
      features: ['Tối ưu LSCache chuyên sâu', 'Chống tấn công DDoS HTTP Flood', 'Bảo đảm tải cao 100% ổn định'],
    },
    {
      id: 'lic-cloudlinux',
      name: 'CloudLinux OS Shared Pro',
      category: 'os',
      description: 'Hệ điều hành chuyên dụng cho Hosting: Giới hạn CPU/RAM theo từng User với LVE Manager.',
      price: 350000,
      billingCycle: 'Monthly',
      icon: '🐧',
      vendor: 'CloudLinux Inc.',
      features: ['Cô lập tài nguyên LVE', 'MySQL Governor ngăn chặn quá tải', 'PHP Selector từ 5.6 đến 8.3'],
    },
    {
      id: 'lic-imunify360',
      name: 'Imunify360 AI Security (Unlimited)',
      category: 'security',
      description: 'Bộ giải pháp bảo mật 6 lớp với tường lửa WAF, quét mã độc thời gian thực và tự động vá lỗi.',
      price: 490000,
      billingCycle: 'Monthly',
      icon: '🛡️',
      vendor: 'CloudLinux Security',
      features: ['Tường lửa WAF tự động', 'Diệt mã độc Real-time', 'Chống Brute-force & Botnet'],
    },
    {
      id: 'lic-softaculous',
      name: 'Softaculous Auto Installer (VPS)',
      category: 'tools',
      description: 'Tự động cài đặt hơn 450+ ứng dụng (WordPress, Joomla, Magento) trong cPanel/DirectAdmin.',
      price: 69000,
      billingCycle: 'Monthly',
      icon: '📦',
      vendor: 'Softaculous Ltd.',
      features: ['450+ Scripts & Apps', 'Tự động backup khi update script', '1-Click Clone & Staging'],
    },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleBuy = async (item: typeof products[0]) => {
    await addItem(item.id, 1, false, {
      name: `${item.name} (1 Tháng)`,
      price: item.price,
      billingCycle: 1,
    });
    router.push('/cart');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-violet-950 text-slate-900 pt-20 pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.15),rgba(255,255,255,0))]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold uppercase tracking-wider mb-6">
            <ShoppingBag className="w-4 h-4 text-violet-400" />
            Chợ Bản Quyền Phần Mềm &amp; Tiện Ích Máy Chủ
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight mb-6">
            Bản Quyền Chính Hãng Cho Máy Chủ Tại{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-purple-300 to-pink-300">
              Cloud Marketplace
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 max-w-2xl mx-auto mb-10">
            Cung cấp License cPanel, DirectAdmin, LiteSpeed, CloudLinux OS, Imunify360 chính hãng với giá đại lý tốt nhất thị trường. Kích hoạt IP tức thì trong 3 phút.
          </p>

          {/* Search Box */}
          <div className="max-w-xl mx-auto relative">
            <Search className="w-5 h-5 text-slate-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm kiếm License (cPanel, LiteSpeed, Imunify360, DirectAdmin)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white/90 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* Category Pills & Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {[
            { id: 'all', label: 'Tất cả License' },
            { id: 'control-panel', label: 'Bảng điều khiển (Control Panel)' },
            { id: 'web-server', label: 'Web Server tăng tốc' },
            { id: 'os', label: 'Hệ điều hành Hosting' },
            { id: 'security', label: 'Bảo mật & Anti-Virus' },
            { id: 'tools', label: 'Công cụ tiện ích' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:border-violet-300 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl p-3 rounded-2xl bg-violet-50 text-violet-600">
                    {p.icon}
                  </div>
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    {p.vendor}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-violet-600 transition-colors">
                  {p.name}
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  {p.description}
                </p>

                <div className="space-y-2 mb-6">
                  {p.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-2xl font-black text-slate-900">
                      {p.price.toLocaleString('vi-VN')}
                    </span>
                    <span className="text-xs text-slate-500 font-medium ml-1">đ/tháng</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Kích hoạt tức thì
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(p)}
                  className="w-full py-3 rounded-xl bg-white group-hover:bg-violet-600 text-slate-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  Mua License Ngay
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
