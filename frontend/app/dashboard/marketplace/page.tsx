'use client';

import React, { useState, useEffect } from 'react';
import { Toast, useToast } from '@/components/Toast';
import { ShoppingBag, RefreshCw, ShoppingCart, DollarSign, Download, Star } from 'lucide-react';
import { api } from '@/src/lib/api';

export default function UserMarketplacePage() {
  const { toast, showToast } = useToast();
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/marketplace/listings');
      setListings(response.data || []);
    } catch (err) {
      showToast('Lỗi khi tải danh sách Sản phẩm', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (id: string) => {
    setPurchasingId(id);
    try {
      await api.post(`/marketplace/purchase/${id}`, { listingId: id });
      showToast('Mua sản phẩm thành công!', 'success');
      // Tùy chọn: load lại trang hoặc chuyển hướng
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Lỗi khi thanh toán', 'error');
    } finally {
      setPurchasingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-fuchsia-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback UI nếu chưa có dữ liệu thật trong DB
  const displayListings = listings.length > 0 ? listings : [
    { id: '11111111-1111-1111-1111-111111111111', title: 'WooCommerce PRO Theme', description: 'Giao diện bán hàng chuyên nghiệp, tối ưu SEO, chuẩn di động.', price: 499000, category: 'Theme', rating: 4.8 },
    { id: '22222222-2222-2222-2222-222222222222', title: 'LiteSpeed Cache Auto', description: 'Plugin tối ưu tốc độ tải trang, cấu hình tự động cho WordPress.', price: 150000, category: 'Plugin', rating: 5.0 },
    { id: '33333333-3333-3333-3333-333333333333', title: 'Security Ninja Premium', description: 'Tường lửa bảo vệ mã nguồn, chặn bot xấu và scan mã độc liên tục.', price: 299000, category: 'Plugin', rating: 4.9 },
  ];

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => showToast('', 'info')} />}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-fuchsia-600" />
              Chợ Ứng Dụng (Marketplace)
            </h1>
            <p className="text-slate-500 mt-1">Khám phá và mua sắm Plugins, Themes chất lượng cao.</p>
          </div>
          <button
            onClick={fetchListings}
            className="p-2 rounded-xl bg-white border border-slate-200 hover:text-fuchsia-600 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayListings.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="aspect-video bg-slate-100 flex items-center justify-center border-b border-slate-200">
                <ShoppingBag className="w-16 h-16 text-slate-300" />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-1 bg-fuchsia-50 text-fuchsia-700 rounded-lg">{item.category || 'Extension'}</span>
                  <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                    <Star className="w-4 h-4 fill-amber-500" />
                    {item.rating || '5.0'}
                  </div>
                </div>
                <h3 className="font-bold text-lg text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">{item.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <div className="font-black text-xl text-slate-900 flex items-center">
                    {item.price.toLocaleString('vi-VN')}đ
                  </div>
                  <button
                    onClick={() => handlePurchase(item.id)}
                    disabled={purchasingId === item.id}
                    className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 text-white rounded-xl hover:bg-fuchsia-700 font-semibold transition-colors disabled:opacity-50"
                  >
                    {purchasingId === item.id ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <ShoppingCart className="w-4 h-4" />
                    )}
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
