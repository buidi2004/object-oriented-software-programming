'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Plus, Edit2, Trash2, Image as ImageIcon, 
  AlertCircle, Upload, CheckCircle2, X, ExternalLink, Eye, EyeOff, Loader2, RotateCcw, Search 
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    imageUrl: '',
    linkUrl: '',
    displayOrder: 1,
    isActive: true,
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    
    try {
      const response = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'Admin' && userData.role !== 'Editor') { 
          router.push('/dashboard'); 
          return; 
        }
        fetchBanners(token);
      } else { 
        router.push('/login'); 
      }
    } catch (error) { 
      router.push('/login'); 
    }
  };

  const fetchBanners = async (token?: string) => {
    const authToken = token || localStorage.getItem('accessToken');
    try {
      const res = await fetch('/api/banners', { 
        headers: { Authorization: `Bearer ${authToken}` } 
      });
      if (res.ok) {
        const data = await res.json();
        setBanners(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load banners:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDefaultBanners = async () => {
    if (!confirm('Khôi phục 5 Banner mẫu mặc định cho Trang Chủ?')) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsLoading(true);
    const defaultTemplates = [
      {
        imageUrl: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
        linkUrl: "/partners",
        displayOrder: 1,
        isActive: true
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2034&auto=format&fit=crop",
        linkUrl: "/services/cloud-vps",
        displayOrder: 2,
        isActive: true
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1510511459019-5d019702280d?q=80&w=2070&auto=format&fit=crop",
        linkUrl: "/services/web-hosting",
        displayOrder: 3,
        isActive: true
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop",
        linkUrl: "/about",
        displayOrder: 4,
        isActive: true
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
        linkUrl: "/services/dedicated-server",
        displayOrder: 5,
        isActive: true
      }
    ];

    try {
      for (const t of defaultTemplates) {
        await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(t)
        });
      }
      await fetchBanners(token);
      alert('Đã khôi phục thành công 5 banner mẫu!');
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi khi tạo banner mẫu.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
      linkUrl: '/services/cloud-vps',
      displayOrder: banners.length + 1,
      isActive: true,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      imageUrl: banner.imageUrl || '',
      linkUrl: banner.linkUrl || '',
      displayOrder: banner.displayOrder || 1,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    setIsSubmitting(true);
    try {
      const payload = {
        imageUrl: formData.imageUrl.trim() || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
        linkUrl: formData.linkUrl.trim() || null,
        displayOrder: Number(formData.displayOrder) || 1,
        isActive: formData.isActive,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
      };

      if (editingBanner) {
        // Update
        const res = await fetch(`/api/banners/${editingBanner.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            id: editingBanner.id,
            ...payload
          })
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Không thể cập nhật banner');
        }
      } else {
        // Create
        const res = await fetch('/api/banners', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Không thể tạo banner mới');
        }
      }

      setShowModal(false);
      await fetchBanners(token);
    } catch (err: any) {
      alert(err.message || 'Đã có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok || res.status === 204) {
        setBanners(prev => prev.filter(b => b.id !== id));
      } else {
        alert('Xóa thất bại');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const toggleStatus = async (banner: Banner) => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const newStatus = !banner.isActive;
    // Optimistic update
    setBanners(prev => prev.map(b => b.id === banner.id ? { ...b, isActive: newStatus } : b));

    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          id: banner.id,
          imageUrl: banner.imageUrl || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80',
          linkUrl: banner.linkUrl || null,
          displayOrder: Number(banner.displayOrder) || 1,
          isActive: newStatus,
          startDate: banner.startDate ? new Date(banner.startDate).toISOString() : null,
          endDate: banner.endDate ? new Date(banner.endDate).toISOString() : null
        })
      });
      if (!res.ok) {
        console.warn('Backend returned non-OK status on toggle, kept optimistic state');
      }
    } catch (err) {
      console.error('Toggle status error:', err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('accessToken');
    setUploadingImage(true);
    try {
      if (token) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);

        const res = await fetch('/api/banners/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: uploadFormData
        });

        if (res.ok) {
          const data = await res.json();
          if (data.imageUrl) {
            setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }));
            return;
          }
        }
      }

      // Fallback if backend upload fails
      setFormData(prev => ({ 
        ...prev, 
        imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80' 
      }));
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingImage(false);
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
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Quản Lý Banner Quảng Cáo</h1>
              <p className="text-xs text-slate-500">{banners.length} banner đang được quản lý</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleResetDefaultBanners} 
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all flex items-center gap-2"
              title="Khôi phục 5 banner chuẩn mặc định"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              Khôi Phục 5 Banner Mẫu
            </button>
            <button 
              onClick={handleOpenAdd} 
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm Banner Mới
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Search Bar */}
        {banners.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm banner theo liên kết, URL ảnh hoặc thứ tự..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-xs text-slate-500 hover:text-slate-700 font-bold"
              >
                Xóa tìm kiếm
              </button>
            )}
          </div>
        )}

        {banners.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Chưa có banner nào</h2>
            <p className="text-slate-500 text-sm mb-6">Thêm banner hoặc khôi phục 5 banner mẫu mặc định cho trang chủ.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={handleResetDefaultBanners}
                className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-sm transition-all inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Khôi Phục 5 Banner Mẫu
              </button>
              <button
                onClick={handleOpenAdd}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Tạo Banner Đầu Tiên
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners
              .filter(b => 
                (b.linkUrl || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (b.imageUrl || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                String(b.displayOrder).includes(searchTerm)
              )
              .map((banner) => (
              <div 
                key={banner.id} 
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
                  banner.isActive ? 'border-slate-200 shadow-sm hover:shadow-md' : 'border-slate-200 opacity-70 bg-slate-50/50'
                }`}
              >
                {/* Banner Image Preview */}
                <div className="relative aspect-[16/9] bg-slate-900 overflow-hidden group">
                  <img 
                    src={banner.imageUrl || '/banners/promo.svg'} 
                    alt="Banner" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('unsplash')) {
                        target.src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80';
                      }
                    }}
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm ${
                      banner.isActive 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-slate-700 text-slate-300'
                    }`}>
                      {banner.isActive ? 'Đang Hiển Thị' : 'Tạm Ẩn'}
                    </span>
                  </div>

                  {/* Order Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs font-bold">
                      Thứ tự: #{banner.displayOrder || 1}
                    </span>
                  </div>
                </div>

                {/* Banner Details */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                      <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-mono truncate">{banner.linkUrl || 'Không có liên kết'}</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-500">
                      {banner.startDate && (
                        <p>Bắt đầu: <span className="font-semibold text-slate-700">{new Date(banner.startDate).toLocaleDateString('vi-VN')}</span></p>
                      )}
                      {banner.endDate && (
                        <p>Kết thúc: <span className="font-semibold text-slate-700">{new Date(banner.endDate).toLocaleDateString('vi-VN')}</span></p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100">
                    <button
                      onClick={() => toggleStatus(banner)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                        banner.isActive 
                          ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {banner.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Ẩn Banner</> : <><Eye className="w-3.5 h-3.5" /> Kích Hoạt</>}
                    </button>
                    
                    <button
                      onClick={() => handleOpenEdit(banner)}
                      className="p-2 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                      title="Chỉnh sửa banner"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Xóa banner"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Thêm / Sửa Banner */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">
                {editingBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Mới'}
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="space-y-4">
              {/* Image URL / Upload */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Đường dẫn ảnh Banner (Image URL) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/banner.jpg hoặc /images/banners/..."
                    required
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Upload className="w-4 h-4" /> Tải Ảnh Lên
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              {formData.imageUrl && (
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img 
                    src={formData.imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80';
                    }}
                  />
                </div>
              )}

              {/* Link URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Liên kết khi nhấp (Link URL)
                </label>
                <input
                  type="text"
                  value={formData.linkUrl}
                  onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                  placeholder="/services/cloud-vps hoặc https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              {/* Display Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Thứ tự ưu tiên
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Trạng thái
                  </label>
                  <select
                    value={formData.isActive ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors bg-white"
                  >
                    <option value="active">Hiển thị (Active)</option>
                    <option value="inactive">Tạm ẩn (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Start & End Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ngày bắt đầu
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Ngày kết thúc
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingBanner ? 'Lưu Thay Đổi' : 'Tạo Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
