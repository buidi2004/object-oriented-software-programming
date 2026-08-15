'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/src/lib/api';
import { useCartStore } from '@/src/store/useCartStore';
import { Loader2, ArrowLeft, Search, Globe, CheckCircle2, XCircle } from 'lucide-react';

export default function DomainSearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{ name: string; isAvailable: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    
    // update URL without reload
    const url = new URL(window.location.href);
    url.searchParams.set('q', query);
    window.history.replaceState({}, '', url.toString());

    setIsSearching(true);
    setError(null);
    setResult(null);

    try {
      // Gọi API kiểm tra domain
      const res = await api.get('/domains/check', { params: { name: query } });
      setResult({
        name: query,
        isAvailable: res.data.isAvailable
      });
    } catch (err) {
      console.error(err);
      setError('Đã xảy ra lỗi khi kiểm tra tên miền. Vui lòng thử lại sau.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSearch();
    }
  }, [initialQuery]);

  const handleBuy = async () => {
    if (!result || !result.isAvailable) return;
    
    try {
      // Register domain intent with backend
      try {
        await api.post('/domains', {
          domainName: result.name,
          registrationYears: 1
        });
      } catch (regErr) {
        // Fallback to cart if unauthenticated
      }

      await addItem(`domain-${result.name}`, 12, true);
      router.push('/cart');
    } catch (err) {
      console.error(err);
      alert('Không thể thêm vào giỏ hàng. Vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h1 className="text-xl font-bold text-slate-900">Tìm Kiếm Tên Miền</h1>
          </div>
          <Link href="/services/domain" className="text-sm font-semibold text-blue-600 hover:underline">
            Bảng giá tên miền
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-6">
            <Globe className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-4">Khởi Đầu Với Một Tên Miền Hoàn Hảo</h1>
          <p className="text-slate-600">Tìm kiếm và đăng ký tên miền cho ý tưởng của bạn ngay hôm nay.</p>
        </div>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="relative mb-12">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nhập tên miền bạn muốn tìm (VD: cloudhost.vn)"
            className="w-full pl-6 pr-32 py-5 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-lg outline-none transition-all"
          />
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
            Tìm
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-center font-medium">
            {error}
          </div>
        )}

        {/* Result */}
        {result && !isSearching && (
          <div className={`p-8 rounded-3xl border-2 transition-all ${
            result.isAvailable 
              ? 'bg-emerald-50 border-emerald-200 shadow-lg shadow-emerald-500/10' 
              : 'bg-slate-100 border-slate-200'
          }`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                {result.isAvailable ? (
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                    <XCircle className="w-6 h-6" />
                  </div>
                )}
                
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">{result.name}</h3>
                  <p className={`font-semibold mt-1 ${result.isAvailable ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {result.isAvailable ? 'Tên miền này đang khả dụng!' : 'Rất tiếc, tên miền này đã được đăng ký.'}
                  </p>
                </div>
              </div>
              
              {result.isAvailable && (
                <div className="flex flex-col sm:items-end w-full sm:w-auto">
                  <div className="text-2xl font-black text-slate-900 mb-3 text-center sm:text-right">
                    250.000đ<span className="text-sm text-slate-500 font-normal">/năm</span>
                  </div>
                  <button
                    onClick={handleBuy}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
