'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Server, Globe, ShieldCheck } from 'lucide-react';

interface WishlistItem {
  id: string;
  type: 'vps' | 'hosting' | 'domain';
  title: string;
  description: string;
  price: number;
  image?: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchWishlist(token);
  }, [router]);

  const fetchWishlist = async (token: string) => {
    try {
      const response = await fetch('/api/wishlist/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (itemId: string) => {
    const token = localStorage.getItem('accessToken');
    try {
      await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  const addToCart = (item: WishlistItem) => {
    // TODO: Implement add to cart logic
    console.log('Adding to cart:', item);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-slate-900">
              <Heart className="w-6 h-6" />
            </div>
            <span className="text-xl font-black text-slate-900">
              CloudHost<span className="text-[#1F1F1F]"> VN</span>
            </span>
          </Link>
          <Link href="/dashboard" className="text-sm font-semibold text-slate-600 hover:text-[#1F1F1F]">
            ← Quay lại Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Danh Sách Yêu Thích</h1>
            <p className="text-slate-600 mt-1">Tổng cộng {items.length} sản phẩm</p>
          </div>
          <Link
            href="/"
            className="px-5 py-2.5 rounded bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors"
          >
            Khám phá dịch vụ
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-md border border-slate-200">
            <Heart className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Danh sách yêu thích trống</h2>
            <p className="text-slate-600 mb-6">Hãy thêm dịch vụ vào danh sách yêu thích để theo dõi</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
            >
              Khám phá dịch vụ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-md border border-slate-200 hover:border-blue-200 hover:shadow-lg transition-all overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                  {item.type === 'vps' ? (
                    <Server className="w-16 h-16 text-[#1F1F1F]" />
                  ) : item.type === 'hosting' ? (
                    <ShieldCheck className="w-16 h-16 text-[#1F1F1F]" />
                  ) : (
                    <Globe className="w-16 h-16 text-[#1F1F1F]" />
                  )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      item.type === 'vps' ? 'bg-blue-100 text-[#1F1F1F]' :
                      item.type === 'hosting' ? 'bg-indigo-100 text-[#1F1F1F]' :
                      'bg-cyan-100 text-[#1F1F1F]'
                    }`}>
                      {item.type === 'vps' ? 'Cloud VPS' : item.type === 'hosting' ? 'Web Hosting' : 'Tên miền'}
                    </span>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors"
                      title="Xóa khỏi danh sách yêu thích"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-black text-[#1F1F1F]">
                      {item.price.toLocaleString('vi-VN')} đ
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 rounded bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Thêm giỏ
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
