'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Image as ImageIcon, AlertCircle, X, Loader2 } from 'lucide-react';
import { api } from '@/src/lib/api';

interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  displayOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    linkUrl: '',
    displayOrder: 0,
    isActive: true,
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const res = await api.get('/users/me');
      if (res.data?.role !== 'Admin') {
        router.push('/dashboard');
        return;
      }
      await fetchBanners();
    } catch (err) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBanners = async () => {
    try {
      const res = await api.get('/banners');
      setBanners(res.data || []);
    } catch (err) {
      console.error('Failed to fetch banners', err);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingBanner(null);
    setFormData({
      imageUrl: '',
      linkUrl: '',
      displayOrder: banners.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      displayOrder: banner.displayOrder || 0,
      isActive: banner.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.imageUrl.trim()) {
      alert('Vui lòng nhập URL hình ảnh');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, {
          id: editingBanner.id,
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl || null,
          displayOrder: Number(formData.displayOrder),
          isActive: formData.isActive,
        });
      } else {
        await api.post('/banners', {
          imageUrl: formData.imageUrl,
          linkUrl: formData.linkUrl || null,
          displayOrder: Number(formData.displayOrder),
          isActive: formData.isActive,
        });
      }
      setIsModalOpen(false);
      await fetchBanners();
    } catch (err: any) {
      console.error('Failed to save banner', err);
      alert(err.response?.data?.message || 'Lỗi khi lưu banner');
    } finally {
      setIsSubmitting(false);
    }
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
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản lý Banner Quảng Cáo</h1>
              <p className="text-sm text-slate-500">{banners.length} banners</p>
            </div>
          </div>
          <button 
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm banner
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-all">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden relative">
                {banner.imageUrl ? (
                  <img src={banner.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-12 h-12 text-slate-400" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900 truncate max-w-[200px]" title={banner.linkUrl || 'Banner'}>
                    {banner.linkUrl || 'Banner quảng cáo'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {banner.isActive ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Thứ tự hiển thị: {banner.displayOrder}</p>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleOpenEditModal(banner)}
                    className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Chỉnh sửa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {banners.length === 0 && (
          <div className="text-center py-12 text-slate-500 bg-white rounded-2xl border border-slate-200">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Chưa có banner nào được tạo</p>
          </div>
        )}
      </main>

      {/* Modal Add/Edit Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">URL Hình ảnh *</label>
                <input
                  type="text"
                  required
                  placeholder="https://example.com/banner.jpg"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn liên kết (Link URL)</label>
                <input
                  type="text"
                  placeholder="/promotions hoặc https://..."
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="bannerIsActive" className="text-sm font-medium text-slate-700">Kích hoạt hiển thị</label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editingBanner ? 'Lưu thay đổi' : 'Tạo mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
