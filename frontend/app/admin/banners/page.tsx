'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit2, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface Banner {
  id: string;
  title: string;
  image: string;
  link: string;
  position: 'hero' | 'homepage' | 'sidebar';
  isActive: boolean;
  createdAt: string;
}

export default function AdminBannersPage() {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

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
        if (userData.role !== 'Admin') { router.push('/dashboard'); return; }
        setBanners([
          { id: '1', title: 'Banner khuyến mãi', image: '', link: '/', position: 'hero', isActive: true, createdAt: '2024-01-01' }
        ]);
        setIsLoading(false);
      } else { router.push('/login'); }
    } catch (error) { router.push('/login'); }
  };

  const handleDeleteBanner = async (id: string) => {
    setBanners(prev => prev.filter(b => b.id !== id));
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
              <h1 className="text-xl font-bold text-slate-900">Quản lý Banner</h1>
              <p className="text-sm text-slate-500">{banners.length} banners</p>
            </div>
          </div>
          <button onClick={() => setShowAddModal(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Thêm banner
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:shadow-lg transition-all">
              <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-slate-400" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900">{banner.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${banner.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    {banner.isActive ? 'Hiển thị' : 'Ẩn'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Position: {banner.position}</p>
                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1">
                    <Edit2 className="w-3 h-3" /> Sửa
                  </button>
                  <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {banners.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p className="font-medium">Chưa có banner nào</p>
          </div>
        )}
      </main>
    </div>
  );
}
